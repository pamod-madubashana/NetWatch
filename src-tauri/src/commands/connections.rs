use crate::models::Connection;
use crate::services::ConnectionCollector;

#[tauri::command]
pub async fn get_connections() -> Result<Vec<Connection>, String> {
    let collector = ConnectionCollector::new();
    collector.get_connections()
}