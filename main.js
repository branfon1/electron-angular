const { app, BrowserWindow, screen, Menu, shell } = require('electron');
const getMac = require('getmac');
const electron = require('electron');
const prompt = require('electron-prompt');

let win = null;
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
const globalShortcut = electron.globalShortcut;

let urlportal = 'https://tendero.moviired.co/'; // Local

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  globalShortcut.register('f5', function () {
    console.log('f5 is pressed');
    win.reload();
  });

  globalShortcut.register('f1', function () {
    console.log('f1 is pressed');
    win.loadURL(urlportal);
  });

  globalShortcut.register('CommandOrControl+R', function () {
    console.log('CommandOrControl+R is pressed');
    win.reload();
  });

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false, // false if you want to run e2e test with Spectron
      webSecurity: false,
    },
  });

  urlportal += 'login?tokens=' + getMac.default();
  win.loadURL(urlportal);

  setMainMenu(win);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

function showAlert(win) {
  prompt({
    title: 'Portal tendero',
    label: 'URL:',
    value: '',
    inputAttrs: {
      type: 'url',
    },
    type: 'input',
  })
    .then(r => {
      if (r === null) {
        win.loadURL(urlportal);
      } else {
        win.loadURL(r);
      }
    })
    .catch(win.loadURL(urlportal));
}

function setMainMenu(mainWindow) {
  const template = [
    {
      label: 'resources',
      submenu: [
        {
          label: 'Volver a atras',
          accelerator: 'Alt + Flecha Izqda',
          click() {
            mainWindow.webContents.goBack()
          },
        },
        {
          label: 'Volver al inicio',
          accelerator: 'F1',
          click() {
            mainWindow.loadURL(urlportal);
          },
        },
        // {
        //   label: 'Ingresar url',
        //   click() {
        //     showAlert(mainWindow);
        //   },
        // },
        // {
        //   label: 'dev',
        //   accelerator: 'F12',
        //   click() {
        //     mainWindow.webContents.openDevTools()
        //   },
        // },
        {
          label: 'Descargar tendero desktop',
          accelerator: 'F12',
          click: async () => {
            await shell.openExternal(
              'https://tendero.moviired.co/auth/download_version'
            );
          },
        },
        {
          label: 'Limpiar cache',
          accelerator: 'F5',
          click: async () => {
            mainWindow.webContents.session.clearStorageData()
            mainWindow.webContents.session.clearCache()
            mainWindow.reload()
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

}
