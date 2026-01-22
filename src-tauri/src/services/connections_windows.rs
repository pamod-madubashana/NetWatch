use crate::models::{Connection, NetworkEndpoint, calculate_risk};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
struct PowerShellTcpConnection {
    #[serde(rename = "OwningProcess")]
    owning_process: Option<u32>,
    #[serde(rename = "LocalAddress")]
    local_address: String,
    #[serde(rename = "LocalPort")]
    local_port: u16,
    #[serde(rename = "RemoteAddress")]
    remote_address: String,
    #[serde(rename = "RemotePort")]
    remote_port: u16,
    #[serde(rename = "State")]
    state: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct PowerShellUdpEndpoint {
    #[serde(rename = "OwningProcess")]
    owning_process: Option<u32>,
    #[serde(rename = "LocalAddress")]
    local_address: String,
    #[serde(rename = "LocalPort")]
    local_port: u16,
    #[serde(rename = "RemoteAddress")]
    remote_address: String,
    #[serde(rename = "RemotePort")]
    remote_port: u16,
}

#[derive(Debug, Deserialize, Serialize)]
struct PowerShellProcess {
    #[serde(rename = "Id")]
    id: u32,
    #[serde(rename = "ProcessName")]
    name: String,
}

pub struct WindowsConnectionCollector;

impl WindowsConnectionCollector {
    pub fn new() -> Self {
        Self
    }

    pub fn get_connections(&self) -> Result<Vec<Connection>, String> {
        tracing::debug!("Starting to fetch TCP connections");
        let tcp_connections = self.get_tcp_connections()
            .map_err(|e| {
                tracing::error!("Failed to fetch TCP connections: {}", e);
                e
            })?;
        tracing::debug!("Successfully fetched {} TCP connections", tcp_connections.len());
        
        tracing::debug!("Starting to fetch UDP endpoints");
        let udp_endpoints = self.get_udp_endpoints()
            .map_err(|e| {
                tracing::error!("Failed to fetch UDP endpoints: {}", e);
                e
            })?;
        tracing::debug!("Successfully fetched {} UDP endpoints", udp_endpoints.len());
        
        tracing::debug!("Starting to fetch process map");
        let process_map = self.get_process_map()
            .map_err(|e| {
                tracing::error!("Failed to fetch process map: {}", e);
                e
            })?;
        tracing::debug!("Successfully fetched process map with {} entries", process_map.len());

        let mut connections = Vec::new();
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_millis() as u64;

        // Process TCP connections
        for tcp_conn in tcp_connections {
            let endpoint = NetworkEndpoint {
                protocol: "TCP".to_string(),
                local_address: tcp_conn.local_address.clone(),
                local_port: tcp_conn.local_port,
                remote_address: tcp_conn.remote_address.clone(),
                remote_port: tcp_conn.remote_port,
                state: self.map_tcp_state(&tcp_conn.state),
                owning_process_id: tcp_conn.owning_process,
            };

            let (risk, risk_reasons) = calculate_risk(&endpoint);
            
            let process_name = if let Some(pid) = tcp_conn.owning_process {
                process_map.get(&pid).cloned().unwrap_or_else(|| "unknown".to_string())
            } else {
                "system".to_string()
            };

            connections.push(Connection {
                id: Uuid::new_v4().to_string(),
                process_name,
                pid: tcp_conn.owning_process.unwrap_or(0),
                protocol: "TCP".to_string(),
                local_addr: tcp_conn.local_address,
                local_port: tcp_conn.local_port,
                remote_addr: tcp_conn.remote_address,
                remote_port: tcp_conn.remote_port,
                state: self.map_tcp_state(&tcp_conn.state),
                risk,
                risk_reasons,
                captured_at: timestamp,
            });
        }

        // Process UDP endpoints
        for udp_endpoint in udp_endpoints {
            let endpoint = NetworkEndpoint {
                protocol: "UDP".to_string(),
                local_address: udp_endpoint.local_address.clone(),
                local_port: udp_endpoint.local_port,
                remote_address: udp_endpoint.remote_address.clone(),
                remote_port: udp_endpoint.remote_port,
                state: "Established".to_string(), // UDP is connectionless, but we'll mark active ones
                owning_process_id: udp_endpoint.owning_process,
            };

            let (risk, risk_reasons) = calculate_risk(&endpoint);
            
            let process_name = if let Some(pid) = udp_endpoint.owning_process {
                process_map.get(&pid).cloned().unwrap_or_else(|| "unknown".to_string())
            } else {
                "system".to_string()
            };

            connections.push(Connection {
                id: Uuid::new_v4().to_string(),
                process_name,
                pid: udp_endpoint.owning_process.unwrap_or(0),
                protocol: "UDP".to_string(),
                local_addr: udp_endpoint.local_address,
                local_port: udp_endpoint.local_port,
                remote_addr: udp_endpoint.remote_address,
                remote_port: udp_endpoint.remote_port,
                state: "Active".to_string(),
                risk,
                risk_reasons,
                captured_at: timestamp,
            });
        }

        Ok(connections)
    }

    fn get_tcp_connections(&self) -> Result<Vec<PowerShellTcpConnection>, String> {
        tracing::debug!("Attempting to fetch TCP connections via PowerShell");
        // Try primary method first
        let output = Command::new("powershell.exe")
            .args([
                "-Command",
                "Get-NetTCPConnection | Select-Object @{Name='OwningProcess';Expression={if ($_.OwningProcess -eq 0) { $null } else { $_.OwningProcess }}}, LocalAddress, LocalPort, RemoteAddress, RemotePort, State | ConvertTo-Json -Compress"
            ])
            .output();
        
        let output = match output {
            Ok(out) => {
                if out.status.success() {
                    out
                } else {
                    // If primary command fails, try an alternative approach
                    let alt_output = Command::new("cmd")
                        .args(["/C", "netstat -ano -p TCP"])
                        .output();
                    
                    match alt_output {
                        Ok(alt_out) if alt_out.status.success() => {
                            return self.parse_netstat_output(String::from_utf8(alt_out.stdout)
                                .map_err(|e| format!("Failed to parse netstat output: {}", e))?);
                        },
                        _ => {
                            return Err(format!(
                                "PowerShell command failed and fallback also failed: {}",
                                String::from_utf8_lossy(&out.stderr)
                            ));
                        }
                    }
                }
            },
            Err(e) => {
                // If PowerShell fails entirely, try netstat as fallback
                let alt_output = Command::new("cmd")
                    .args(["/C", "netstat -ano -p TCP"])
                    .output();
                
                match alt_output {
                    Ok(alt_out) if alt_out.status.success() => {
                        return self.parse_netstat_output(String::from_utf8(alt_out.stdout)
                            .map_err(|e| format!("Failed to parse netstat output: {}", e))?);
                    },
                    _ => {
                        return Err(format!("Failed to execute PowerShell and fallback command: {}", e));
                    }
                }
            }
        };

        let stdout = String::from_utf8(output.stdout)
            .map_err(|e| format!("Failed to parse PowerShell output: {}", e))?;

        tracing::debug!("PowerShell TCP command succeeded, parsing output of {} bytes", stdout.len());
        
        // Handle both single object and array cases
        let connections: Result<Vec<PowerShellTcpConnection>, _> = serde_json::from_str(&stdout);
        
        match connections {
            Ok(conns) => {
                tracing::debug!("Successfully parsed {} TCP connections from PowerShell", conns.len());
                Ok(conns)
            },
            Err(parse_error) => {
                tracing::error!("Failed to parse TCP connections JSON: {}", parse_error);
                tracing::debug!("JSON content: {:.500}", stdout);
                
                // Try parsing as single object
                match serde_json::from_str::<PowerShellTcpConnection>(&stdout) {
                    Ok(single_conn) => {
                        tracing::debug!("Successfully parsed single TCP connection");
                        Ok(vec![single_conn])
                    },
                    Err(e) => {
                        tracing::error!("Also failed to parse as single TCP connection: {}", e);
                        Err(format!("Failed to parse TCP connections JSON: {}", e))
                    }
                }
            }
        }
    }

    fn parse_netstat_output(&self, output: String) -> Result<Vec<PowerShellTcpConnection>, String> {
        let mut connections = Vec::new();
        
        for line in output.lines() {
            let line = line.trim();
            if line.starts_with("Proto") || line.is_empty() {
                continue; // Skip header and empty lines
            }
            
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                // Parse: Proto Local Address Foreign Address State PID
                if parts[0].to_uppercase() != "TCP" {
                    continue; // Only interested in TCP
                }
                
                // Parse local address:port - netstat format is ADDRESS:PORT
                let local_addr_port = parts[1];
                let local_split_pos = local_addr_port.rfind(':');
                let (local_address, local_port) = match local_split_pos {
                    Some(pos) => {
                        let addr = &local_addr_port[..pos];
                        let port_str = &local_addr_port[pos+1..];
                        let port: u16 = port_str.parse().unwrap_or(0);
                        (addr, port)
                    },
                    None => (local_addr_port, 0),
                };
                
                // Parse remote address:port
                let remote_addr_port = parts[2];
                let remote_split_pos = remote_addr_port.rfind(':');
                let (remote_address, remote_port) = match remote_split_pos {
                    Some(pos) => {
                        let addr = &remote_addr_port[..pos];
                        let port_str = &remote_addr_port[pos+1..];
                        let port: u16 = port_str.parse().unwrap_or(0);
                        (addr, port)
                    },
                    None => (remote_addr_port, 0),
                };
                
                // State and PID
                let state = if parts.len() >= 5 { parts[3].to_string() } else { "UNKNOWN".to_string() };
                let pid: u32 = if parts.len() >= 5 { 
                    parts.last().unwrap_or(&"0").parse().unwrap_or(0) 
                } else { 0 };
                
                connections.push(PowerShellTcpConnection {
                    owning_process: Some(pid),
                    local_address: local_address.to_string(),
                    local_port,
                    remote_address: remote_address.to_string(),
                    remote_port,
                    state,
                });
            }
        }
        
        Ok(connections)
    }

    fn get_udp_endpoints(&self) -> Result<Vec<PowerShellUdpEndpoint>, String> {
        tracing::debug!("Attempting to fetch UDP endpoints via PowerShell");
        // Try primary method first
        let output = Command::new("powershell.exe")
            .args([
                "-Command",
                "Get-NetUDPEndpoint | Select-Object @{Name='OwningProcess';Expression={if ($_.OwningProcess -eq 0) { $null } else { $_.OwningProcess }}}, LocalAddress, LocalPort, RemoteAddress, RemotePort | ConvertTo-Json -Compress"
            ])
            .output();
        
        let output = match output {
            Ok(out) => {
                if out.status.success() {
                    out
                } else {
                    // If primary command fails, try an alternative approach
                    let alt_output = Command::new("cmd")
                        .args(["/C", "netstat -ano -p UDP"])
                        .output();
                    
                    match alt_output {
                        Ok(alt_out) if alt_out.status.success() => {
                            return self.parse_udp_netstat_output(String::from_utf8(alt_out.stdout)
                                .map_err(|e| format!("Failed to parse UDP netstat output: {}", e))?);
                        },
                        _ => {
                            return Err(format!(
                                "PowerShell UDP command failed and fallback also failed: {}",
                                String::from_utf8_lossy(&out.stderr)
                            ));
                        }
                    }
                }
            },
            Err(e) => {
                // If PowerShell fails entirely, try netstat as fallback
                let alt_output = Command::new("cmd")
                    .args(["/C", "netstat -ano -p UDP"])
                    .output();
                
                match alt_output {
                    Ok(alt_out) if alt_out.status.success() => {
                        return self.parse_udp_netstat_output(String::from_utf8(alt_out.stdout)
                            .map_err(|e| format!("Failed to parse UDP netstat output: {}", e))?);
                    },
                    _ => {
                        return Err(format!("Failed to execute PowerShell and fallback UDP command: {}", e));
                    }
                }
            }
        };

        let stdout = String::from_utf8(output.stdout)
            .map_err(|e| format!("Failed to parse PowerShell UDP output: {}", e))?;

        tracing::debug!("PowerShell UDP command succeeded, parsing output of {} bytes", stdout.len());
        
        // Handle both single object and array cases
        let endpoints: Result<Vec<PowerShellUdpEndpoint>, _> = serde_json::from_str(&stdout);
        
        match endpoints {
            Ok(endpoints) => {
                tracing::debug!("Successfully parsed {} UDP endpoints from PowerShell", endpoints.len());
                Ok(endpoints)
            },
            Err(parse_error) => {
                tracing::error!("Failed to parse UDP endpoints JSON: {}", parse_error);
                tracing::debug!("JSON content: {:.500}", stdout);
                
                // Try parsing as single object
                match serde_json::from_str::<PowerShellUdpEndpoint>(&stdout) {
                    Ok(single_endpoint) => {
                        tracing::debug!("Successfully parsed single UDP endpoint");
                        Ok(vec![single_endpoint])
                    },
                    Err(e) => {
                        tracing::error!("Also failed to parse as single UDP endpoint: {}", e);
                        Err(format!("Failed to parse UDP endpoints JSON: {}", e))
                    }
                }
            }
        }
    }

    fn parse_udp_netstat_output(&self, output: String) -> Result<Vec<PowerShellUdpEndpoint>, String> {
        let mut endpoints = Vec::new();
        
        for line in output.lines() {
            let line = line.trim();
            if line.starts_with("Proto") || line.is_empty() {
                continue; // Skip header and empty lines
            }
            
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                // Parse: Proto Local Address Foreign Address PID
                if parts[0].to_uppercase() != "UDP" {
                    continue; // Only interested in UDP
                }
                
                // Parse local address:port - netstat format is ADDRESS:PORT
                let local_addr_port = parts[1];
                let local_split_pos = local_addr_port.rfind(':');
                let (local_address, local_port) = match local_split_pos {
                    Some(pos) => {
                        let addr = &local_addr_port[..pos];
                        let port_str = &local_addr_port[pos+1..];
                        let port: u16 = port_str.parse().unwrap_or(0);
                        (addr, port)
                    },
                    None => (local_addr_port, 0),
                };
                
                // For UDP, the remote address may be "*" (any address)
                let remote_addr_port = parts[2];
                let remote_split_pos = remote_addr_port.rfind(':');
                let (remote_address, remote_port) = match remote_split_pos {
                    Some(pos) => {
                        let addr = &remote_addr_port[..pos];
                        let port_str = &remote_addr_port[pos+1..];
                        let port: u16 = port_str.parse().unwrap_or(0);
                        (addr, port)
                    },
                    None => (remote_addr_port, 0),
                };
                
                // PID is the last column
                let pid: u32 = if parts.len() >= 5 { 
                    parts.last().unwrap_or(&"0").parse().unwrap_or(0) 
                } else { 0 };
                
                endpoints.push(PowerShellUdpEndpoint {
                    owning_process: Some(pid),
                    local_address: local_address.to_string(),
                    local_port,
                    remote_address: remote_address.to_string(),
                    remote_port,
                });
            }
        }
        
        Ok(endpoints)
    }

    fn get_process_map(&self) -> Result<HashMap<u32, String>, String> {
        tracing::debug!("Attempting to fetch process map via PowerShell");
        // Try primary method first
        let output = Command::new("powershell.exe")
            .args([
                "-Command",
                "Get-Process | Select-Object Id, ProcessName | ConvertTo-Json -Compress"
            ])
            .output();
        
        let output = match output {
            Ok(out) => {
                if out.status.success() {
                    out
                } else {
                    // If primary command fails, try an alternative approach
                    let alt_output = Command::new("cmd")
                        .args(["/C", "tasklist /FO CSV"])
                        .output();
                    
                    match alt_output {
                        Ok(alt_out) if alt_out.status.success() => {
                            return self.parse_tasklist_output(String::from_utf8(alt_out.stdout)
                                .map_err(|e| format!("Failed to parse tasklist output: {}", e))?);
                        },
                        _ => {
                            return Err(format!(
                                "PowerShell process command failed and fallback also failed: {}",
                                String::from_utf8_lossy(&out.stderr)
                            ));
                        }
                    }
                }
            },
            Err(e) => {
                // If PowerShell fails entirely, try tasklist as fallback
                let alt_output = Command::new("cmd")
                    .args(["/C", "tasklist /FO CSV"])
                    .output();
                
                match alt_output {
                    Ok(alt_out) if alt_out.status.success() => {
                        return self.parse_tasklist_output(String::from_utf8(alt_out.stdout)
                            .map_err(|e| format!("Failed to parse tasklist output: {}", e))?);
                    },
                    _ => {
                        return Err(format!("Failed to execute PowerShell and fallback process command: {}", e));
                    }
                }
            }
        };

        let stdout = String::from_utf8(output.stdout)
            .map_err(|e| format!("Failed to parse PowerShell process output: {}", e))?;
        
        tracing::debug!("PowerShell process command succeeded, parsing output of {} bytes", stdout.len());
        
        let processes: Result<Vec<PowerShellProcess>, _> = serde_json::from_str(&stdout);
        
        let process_list = match processes {
            Ok(procs) => {
                tracing::debug!("Successfully parsed {} processes from PowerShell", procs.len());
                procs
            },
            Err(parse_error) => {
                tracing::error!("Failed to parse processes JSON: {}", parse_error);
                tracing::debug!("JSON content: {:.500}", stdout);
                
                // Try parsing as single object
                match serde_json::from_str::<PowerShellProcess>(&stdout) {
                    Ok(single_proc) => {
                        tracing::debug!("Successfully parsed single process");
                        vec![single_proc]
                    },
                    Err(e) => {
                        tracing::error!("Also failed to parse as single process: {}", e);
                        return Err(format!("Failed to parse processes JSON: {}", e));
                    }
                }
            }
        };

        let mut process_map = HashMap::new();
        for proc in process_list {
            process_map.insert(proc.id, proc.name);
        }

        Ok(process_map)
    }

    fn parse_tasklist_output(&self, output: String) -> Result<HashMap<u32, String>, String> {
        let mut process_map = HashMap::new();
        
        for (i, line) in output.lines().enumerate() {
            if i == 0 { continue; } // Skip header row
            
            let line = line.trim();
            if line.is_empty() { continue; }
            
            // Tasklist CSV format: "Image Name","PID","Session Name","Session#","Mem Usage"
            let parts: Vec<&str> = line.split(",").map(|s| s.trim_matches('"')).collect();
            if parts.len() >= 2 {
                if let Ok(pid) = parts[1].parse::<u32>() {
                    let process_name = parts[0].to_string();
                    // Remove .exe extension if present
                    let clean_name = process_name.trim_end_matches(".exe").to_string();
                    process_map.insert(pid, clean_name);
                }
            }
        }
        
        Ok(process_map)
    }

    fn map_tcp_state(&self, state: &str) -> String {
        match state.to_lowercase().as_str() {
            "established" => "ESTABLISHED".to_string(),
            "listen" => "LISTENING".to_string(),
            "time_wait" => "TIME_WAIT".to_string(),
            "close_wait" => "CLOSE_WAIT".to_string(),
            "syn_sent" => "SYN_SENT".to_string(),
            "syn_received" => "SYN_RECEIVED".to_string(),
            "fin_wait1" => "FIN_WAIT1".to_string(),
            "fin_wait2" => "FIN_WAIT2".to_string(),
            "closing" => "CLOSING".to_string(),
            "last_ack" => "LAST_ACK".to_string(),
            _ => state.to_uppercase(),
        }
    }
}