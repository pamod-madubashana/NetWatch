use crate::models::Connection;

pub struct LinuxConnectionCollector;

impl LinuxConnectionCollector {
    pub fn new() -> Self {
        Self
    }

    pub fn get_connections(&self) -> Result<Vec<Connection>, String> {
        Err("Linux connection collection not implemented yet. Planned implementation using 'ss' or 'netstat' commands.".to_string())
    }
}