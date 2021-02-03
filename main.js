// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Notification, Tray, shell, Menu } = require('electron')
const path = require('path')

var mainWindow
var currentNotification = null
var contentPannelUnreadNumber = 0
var menuPannelUnreadNumber = 0
var tray
var noMessgeTrayImg = path.join(__dirname, 'build/oldIcon.png')
var newMessageTrayImg = path.join(__dirname, 'build/newIcon.png')
var currentTrayImg = noMessgeTrayImg
var currentTrayToolTip = '无消息'
var forceQuit = false

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 602,
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false
        },
        icon: path.join(__dirname, 'build/icon.png')
    })

    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
    })

    // and load the index.html of the app.
    // mainWindow.loadFile('index.html')
    mainWindow.loadURL("https://im.dingtalk.com/")

    mainWindow.on('focus', () => {
        contentPannelUnreadNumber = 0
        updateTray()
    })

    mainWindow.on('close', (event) => {
        if (!forceQuit) {
            event.preventDefault()
            mainWindow.blur()
            mainWindow.hide()
        }
    })

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()
}

function updateTray() {
    var newToolTip
    var newTrayImg
    var totalUnread = contentPannelUnreadNumber + menuPannelUnreadNumber
    if (totalUnread > 0) {
        newToolTip = `${totalUnread}条消息`
        newTrayImg = newMessageTrayImg
    } else {
        newToolTip = '无消息'
        newTrayImg = noMessgeTrayImg
    }

    //Check if need update
    if (currentTrayImg !== newTrayImg) {
        currentTrayImg = newTrayImg
        tray.setImage(currentTrayImg)
    }
    if (currentTrayToolTip !== newToolTip) {
        currentTrayToolTip = newToolTip
        tray.setToolTip(currentTrayToolTip)
    }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    const menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'DevTool',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: function () {
                        mainWindow.webContents.openDevTools()
                    }
                },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function () {
                        forceQuit = true; app.quit();
                    }
                }
            ]
        }
    ])

    Menu.setApplicationMenu(menu)

    //Tray
    tray = new Tray(currentTrayImg)
    tray.on('click', () => { mainWindow.show() })
    const trayMenu = Menu.buildFromTemplate([
        {
            label: 'ShowMainWindow',
            click: function () {
                mainWindow.show()
            }
        },
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function () {
                forceQuit = true; app.quit();
            }
        }
    ])
    tray.setContextMenu(trayMenu)

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    ipcMain.handle('notify-unreadNumber', (event, unreadNumber) => {
        menuPannelUnreadNumber = unreadNumber
        updateTray()
    })

    ipcMain.handle('notify-message', (event, title, content, isContentPannelFocusing) => {
        if (currentNotification !== null) {
            currentNotification.close()
        }
        currentNotification = new Notification({
            title,
            body: content,
            silent: false,
            timeoutType: 'never',
            urgency: 'critical',
            icon: newMessageTrayImg
        })
        currentNotification.on('click', (evnet) => {
            mainWindow.show()
        })
        currentNotification.show()
        if (isContentPannelFocusing && mainWindow.isFocused()) {
            return //Ignore when mainWindow is focused and message is current conversation
        }
        contentPannelUnreadNumber++
        updateTray()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', (event) => {
    if (!forceQuit) {
        event.preventDefault()
        mainWindow.hide()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.