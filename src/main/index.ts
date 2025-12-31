import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initDatabase, registerIpcHandlers } from './db'

function navigateTo(page: string): void {
  const win = BrowserWindow.getAllWindows().find((w) => !w.isMinimized() && w.isResizable())
  if (win) {
    win.webContents.send('navigate', page)
  }
}

function createMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: 'Tempo Tracker',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Settings...',
                accelerator: 'CmdOrCtrl+,',
                click: () => navigateTo('settings')
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ] as Electron.MenuItemConstructorOptions[]
          }
        ] as Electron.MenuItemConstructorOptions[])
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Task',
          accelerator: 'CmdOrCtrl+N',
          click: () => navigateTo('new-task')
        },
        { type: 'separator' },
        {
          label: 'All Tasks',
          accelerator: 'CmdOrCtrl+1',
          click: () => navigateTo('main')
        },
        {
          label: 'Reports',
          accelerator: 'CmdOrCtrl+2',
          click: () => navigateTo('export')
        },
        {
          label: 'Archive',
          accelerator: 'CmdOrCtrl+3',
          click: () => navigateTo('archive')
        }
      ] as Electron.MenuItemConstructorOptions[]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ] as Electron.MenuItemConstructorOptions[]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? ([
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ] as Electron.MenuItemConstructorOptions[])
          : ([{ role: 'close' }] as Electron.MenuItemConstructorOptions[]))
      ] as Electron.MenuItemConstructorOptions[]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/cstdnl/tempo-tracker')
          }
        }
      ] as Electron.MenuItemConstructorOptions[]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 450,
    height: 720,
    minWidth: 450,
    minHeight: 720,
    maxWidth: 450,
    titleBarStyle: 'hidden',
    fullscreenable: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize SQLite and register backend IPC handlers
  initDatabase()
  registerIpcHandlers()
  createMenu()

  ipcMain.on('window/focus-mode', (event, enabled: boolean) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    if (enabled) {
      win.setMinimumSize(320, 120)
      win.setSize(320, 120)
      win.setAlwaysOnTop(true)
      win.setResizable(false)
      if (process.platform === 'darwin') {
        win.setWindowButtonVisibility(false)
      }
    } else {
      win.setResizable(true)
      win.setMinimumSize(450, 720)
      win.setSize(450, 720)
      win.setAlwaysOnTop(false)
      if (process.platform === 'darwin') {
        win.setWindowButtonVisibility(true)
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})