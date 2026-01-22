import { invoke } from '@tauri-apps/api/core';
import { Connection } from '../types/netwatch';

export async function getConnections(): Promise<Connection[]> {
  try {
    const connections = await invoke<Connection[]>('get_connections');
    return connections;
  } catch (error) {
    console.error('Error fetching connections:', error);
    throw error;
  }
}

export async function exportConnections(format: 'json' | 'csv', connections: Connection[]): Promise<string> {
  try {
    const filePath = await invoke<string>('export_connections', {
      format,
      connections
    });
    return filePath;
  } catch (error) {
    console.error('Error exporting connections:', error);
    throw error;
  }
}