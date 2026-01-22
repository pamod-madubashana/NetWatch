// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod models;
mod services;
mod commands;

use models::*;
use services::ConnectionCollector;
use commands::connections::get_connections;
use commands::export::export_connections;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_connections, export_connections])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
