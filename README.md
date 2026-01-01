# Tempo Tracker

Tempo Tracker is a task management application built with electron-vite, designed with a primary focus on the time tracking aspect of productivity. It allows users to organize work into different task collections while providing detailed reporting on time allocation.

Data is stored locally using SQLite3, ensuring privacy and performance. For portability, the application supports moving data between different machines through JSON export and import functionality available in the settings.

---

## Getting Started

### Installation

To set up Tempo Tracker locally for development or to build from source:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cstdnl/tempo-tracker.git
   cd tempo-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   # Build for macOS (Universal/ARM/Intel)
   npm run build:mac

   # Build for Windows
   npm run build:win
   ```

### Current Release (macOS Apple Silicon)

The current stable release is optimized for Apple Silicon (M1/M2/M3/M4).

- **Target Architecture:** arm64
- **Format:** .dmg and .zip

---

## Key Functionalities

### Task Management and Collections
- **Task Organization**: Create and manage tasks across different collections for better categorization.
- **Time-Centric Design**: Every task is built around its time tracking state, allowing for precise monitoring of effort.
- **Subtask Tracking**: Break down tasks within collections into granular, trackable items.

### Focus Mode
A specialized feature for deep work on a single task:
- **Compact UI**: Switches to a small, always-on-top window (320x240px).
- **Essential Controls**: Provides a simplified timer and basic controls to minimize distractions.
- **Draggable Handle**: The window can be moved freely across the screen.

### Reporting and Data Portability
- **Time Reporting**: Generate and view csv reports based on your tracked time data to analyze productivity trends.
- **Local Storage**: Uses SQLite3 for fast, secure, and local data persistence.
- **Export/Import**: Move your entire database between machines using JSON export and import tools in the settings menu.

---

## Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) with [electron-vite](https://electron-vite.org/)
- **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [SQLite3](https://github.com/WiseLibs/better-sqlite3) for local persistence.

---

## Functional Processes

### Focus Mode Workflow
1. **Initiation**: Select the Focus icon on a specific task.
2. **Window Management**: The application resizes to a minimal footprint and stays on top of other windows.
3. **Tracking**: The FocusPage provides a streamlined interface focused entirely on the active timer.

### Data Management
The application manages all task and time data through a local SQLite3 instance. Users can migrate their data by generating a JSON export in the settings, which can then be imported on another device to restore the complete state of tasks and collections.

---

## License

Distributed under the MIT License. See LICENSE for more information.
