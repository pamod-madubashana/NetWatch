mod connections_windows;
mod connections_linux;
mod connections_macos;

use crate::models::Connection;

pub struct ConnectionCollector;

impl ConnectionCollector {
    pub fn new() -> Self {
        Self
    }

    pub fn get_connections(&self) -> Result<Vec<Connection>, String> {
        cfg_if::cfg_if! {
            if #[cfg(target_os = "windows")] {
                let collector = connections_windows::WindowsConnectionCollector::new();
                collector.get_connections()
            } else if #[cfg(target_os = "linux")] {
                let collector = connections_linux::LinuxConnectionCollector::new();
                collector.get_connections()
            } else if #[cfg(target_os = "macos")] {
                let collector = connections_macos::MacOsConnectionCollector::new();
                collector.get_connections()
            } else {
                Err("Unsupported operating system".to_string())
            }
        }
    }
}