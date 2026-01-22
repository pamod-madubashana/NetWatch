use crate::models::Connection;

pub struct MacOsConnectionCollector;

impl MacOsConnectionCollector {
    pub fn new() -> Self {
        Self
    }

    pub fn get_connections(&self) -> Result<Vec<Connection>, String> {
        Err("macOS connection collection not implemented yet. Planned implementation using 'lsof' or 'netstat' commands.".to_string())
    }
}