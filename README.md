# Tempo Tracker

<img width="125" height="125" alt="icon" src="https://github.com/user-attachments/assets/4475b639-9038-491e-878e-335a5c8cae4a" />


Tempo Tracker is a task management application built with electron-vite, designed with a primary focus on the time tracking aspect of productivity. It allows users to organize work into different task collections while providing detailed reporting on time allocation.

Data is stored locally using SQLite3, ensuring privacy and performance. For portability, the application supports moving data between different machines through JSON export and import functionality available in the settings.

---
## Screenshots

<img width="485" height="807" alt="Screenshot 2026-01-01 at 19 53 40" src="https://github.com/user-attachments/assets/ff34e0fc-24be-4400-b0ee-e4ad0c7310e6" />
<img width="509" height="812" alt="Screenshot 2026-01-01 at 19 49 45" src="https://github.com/user-attachments/assets/7cd06b22-4ef3-419e-87c9-34437530c5e4" />
<img width="492" height="803" alt="Screenshot 2026-01-01 at 19 50 36" src="https://github.com/user-attachments/assets/02d355ff-4aa9-4319-bacc-9ffc7d8da1ea" />
<img width="480" height="801" alt="Screenshot 2026-01-01 at 19 51 33" src="https://github.com/user-attachments/assets/092ebe50-0f81-44e5-9ed4-bba1fd53c9a5" />
<img width="475" height="810" alt="Screenshot 2026-01-01 at 19 52 19" src="https://github.com/user-attachments/assets/3e9d2b51-f879-442e-af71-8559b9d290d2" />
<img width="490" height="790" alt="Screenshot 2026-01-01 at 19 52 45" src="https://github.com/user-attachments/assets/13827479-35df-4093-bdb1-f5f7e79813bf" />
<img width="366" height="163" alt="Screenshot 2026-01-01 at 19 54 27" src="https://github.com/user-attachments/assets/421d0648-1990-4d9d-bcbc-23d90a2c498c" />
<img width="380" height="186" alt="Screenshot 2026-01-01 at 19 53 48" src="https://github.com/user-attachments/assets/12eb1295-8456-473c-a091-0f786251b80d" />

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
