// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod models;
mod services;
mod commands;
mod utils;

use commands::connections::get_connections;
use commands::export::export_connections;
use utils::logger::{log_debug, log_info, log_warn, log_error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_connections, export_connections, log_debug, log_info, log_warn, log_error])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
