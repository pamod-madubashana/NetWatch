# NetWatch

A portfolio-quality network monitoring application built with Tauri, Rust, and React. This desktop application provides real-time visibility into active network connections on your local machine.

## Features

- Real-time monitoring of TCP/UDP connections
- Process identification for each connection
- Risk assessment for connections (low/medium/high)
- Filtering and search capabilities
- Export to JSON/CSV formats
- Auto-refresh and manual refresh options

## Privacy Notice

This application monitors only your local machine's network connections. No external network calls are made, and no data leaves your computer except for the exported files you explicitly save.

## Prerequisites

- Node.js 18+ 
- Rust 1.70+
- Windows PowerShell (for Windows platform support)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development version:
```bash
npm run tauri dev
```

3. To build a production version:
```bash
npm run tauri build
```

## Platform Support

- **Windows**: Fully supported using PowerShell commands (`Get-NetTCPConnection`, `Get-NetUDPEndpoint`)
- **Linux**: Planned support using `ss` or `netstat` commands
- **macOS**: Planned support using `lsof` or `netstat` commands

## Architecture

### Backend (Rust/Tauri)
- Collects network connection data using OS-specific commands
- Maps PIDs to process names
- Calculates risk levels based on connection characteristics
- Provides Tauri commands for the frontend

### Frontend (React/TypeScript)
- Displays connections in a sortable, filterable table
- Provides search and filtering capabilities
- Supports auto-refresh and manual refresh
- Allows exporting data to JSON/CSV

## Commands

- `get_connections()` - Retrieves current network connections with risk assessment
- `export_connections(format, data)` - Exports connection data to specified format (JSON/CSV)

## Risk Assessment

The application uses a simple heuristic to assess connection risk:

- **High Risk**: Connections to known dangerous ports (23, 445, 3389, 5900, 3306, 27017, 4444, 1337, 6667) in ESTABLISHED state
- **Medium Risk**: Connections to administrative ports, unknown processes, or non-standard high ports
- **Low Risk**: Standard connections to known services

## Development

The project follows a modular architecture:

```
src-tauri/
├── src/
│   ├── models/          # Data structures
│   ├── services/        # Platform-specific collectors
│   ├── commands/        # Tauri command handlers
│   └── utils/           # Helper functions
src/
├── api/                 # Tauri API wrappers
├── types/               # TypeScript type definitions
├── components/          # Reusable UI components
└── pages/               # Page components
```

## Security

This application is designed for local network monitoring only. It does not:
- Send data to external servers
- Access network packets
- Perform any form of network scanning
- Execute arbitrary shell commands with user input

All PowerShell commands are constructed with fixed scripts and safe parameter passing.