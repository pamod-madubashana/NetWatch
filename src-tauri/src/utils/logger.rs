

#[tauri::command]
fn log_debug(message: String) {
    tracing::debug!("[React] {}", message);
}

#[tauri::command]
fn log_info(message: String) {
    tracing::info!("[React] {}", message);
}

#[tauri::command]
fn log_warn(message: String) {
    tracing::warn!("[React] {}", message);
}

#[tauri::command]
fn log_error(message: String) {
    tracing::error!("[React] {}", message);
}