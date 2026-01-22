use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Connection {
    pub id: String,
    pub process_name: String,
    pub pid: u32,
    pub protocol: String, // "TCP" or "UDP"
    pub local_addr: String,
    pub local_port: u16,
    pub remote_addr: String,
    pub remote_port: u16,
    pub state: String,
    pub risk: RiskLevel,
    pub risk_reasons: Vec<String>,
    pub captured_at: u64, // Unix timestamp in milliseconds
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum RiskLevel {
    Low,
    Medium,
    High,
}

impl RiskLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            RiskLevel::Low => "low",
            RiskLevel::Medium => "medium",
            RiskLevel::High => "high",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkEndpoint {
    pub protocol: String,
    pub local_address: String,
    pub local_port: u16,
    pub remote_address: String,
    pub remote_port: u16,
    pub state: String,
    pub owning_process_id: Option<u32>,
}

pub fn calculate_risk(connection: &NetworkEndpoint) -> (RiskLevel, Vec<String>) {
    let mut reasons = Vec::new();
    let mut risk = RiskLevel::Low;

    // High risk ports
    let high_risk_ports = [23, 445, 3389, 5900, 3306, 27017, 4444, 1337, 6667];
    
    // Medium risk ports
    let medium_risk_ports = [21, 22, 25, 110, 143, 993, 995];

    // Check for high-risk ports in established connections
    if connection.state == "Established" && high_risk_ports.contains(&connection.remote_port) {
        risk = RiskLevel::High;
        reasons.push(format!("Connection to known high-risk port {}", connection.remote_port));
    }

    // Check for medium-risk ports
    if connection.state == "Established" && medium_risk_ports.contains(&connection.remote_port) {
        if risk == RiskLevel::Low {
            risk = RiskLevel::Medium;
        }
        reasons.push(format!("Connection to administrative port {}", connection.remote_port));
    }

    // Check for unknown/local process
    if connection.owning_process_id.unwrap_or(0) == 0 {
        if risk == RiskLevel::Low {
            risk = RiskLevel::Medium;
        }
        reasons.push("Unable to identify owning process".to_string());
    }

    // Check for non-standard ports (suggests custom service)
    if connection.remote_port > 10000 && connection.state == "Established" {
        if risk == RiskLevel::Low {
            risk = RiskLevel::Medium;
        }
        reasons.push("Connection to non-standard high port".to_string());
    }

    // Check for localhost connections (generally lower risk)
    if connection.remote_address == "127.0.0.1" || connection.remote_address == "::1" {
        // Reduce risk level for localhost connections
        match risk {
            RiskLevel::High => risk = RiskLevel::Medium,
            RiskLevel::Medium => risk = RiskLevel::Low,
            RiskLevel::Low => {}
        }
        if !reasons.is_empty() {
            reasons.push("Localhost connection reduces risk".to_string());
        }
    }

    if reasons.is_empty() {
        reasons.push("Standard connection".to_string());
    }

    (risk, reasons)
}