use crate::models::Connection;
use serde_json;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::Manager;

#[derive(serde::Serialize)]
struct ExportFormat {
    connections: Vec<Connection>,
    exported_at: u64,
}

#[tauri::command]
pub async fn export_connections(
    format: String, 
    connections: Vec<Connection>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("./"));
    
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();

    let filename = format!("netwatch_connections_{}.{}", timestamp, format.to_lowercase());
    let filepath = app_data_dir.join(&filename);

    match format.to_lowercase().as_str() {
        "json" => {
            let export_data = ExportFormat {
                connections,
                exported_at: timestamp,
            };
            
            let json_data = serde_json::to_string_pretty(&export_data)
                .map_err(|e| format!("JSON serialization error: {}", e))?;
                
            File::create(&filepath)
                .map_err(|e| format!("File creation error: {}", e))?
                .write_all(json_data.as_bytes())
                .map_err(|e| format!("File write error: {}", e))?;
        },
        "csv" => {
            let mut csv_data = String::from("Process,PID,Protocol,Local Address,Local Port,Remote Address,Remote Port,State,Risk,Captured At\n");
            
            for conn in connections {
                csv_data.push_str(&format!(
                    "{},{},{},{},{},{},{},{},{},{}\n",
                    escape_csv_field(&conn.process_name),
                    conn.pid,
                    conn.protocol,
                    escape_csv_field(&conn.local_addr),
                    conn.local_port,
                    escape_csv_field(&conn.remote_addr),
                    conn.remote_port,
                    conn.state,
                    conn.risk.as_str(),
                    conn.captured_at
                ));
            }
            
            File::create(&filepath)
                .map_err(|e| format!("File creation error: {}", e))?
                .write_all(csv_data.as_bytes())
                .map_err(|e| format!("File write error: {}", e))?;
        },
        _ => return Err(format!("Unsupported export format: {}", format))
    }

    Ok(filepath.to_string_lossy().to_string())
}

fn escape_csv_field(field: &str) -> String {
    if field.contains(',') || field.contains('"') || field.contains('\n') {
        format!("\"{}\"", field.replace('"', "\"\""))
    } else {
        field.to_string()
    }
}