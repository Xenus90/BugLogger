const path = require("path");
const url = require("url");
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const connectDb = require("./config/db");
const Log = require("./models/Log");

connectDb();

const isDev = (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development") ? true : false;
const isMac = (process.platform === "darwin") ? true : false;
let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 1400 : 1100,
        height: 800,
        show: false,
        backgroundColor: "white",
        icon: `${__dirname}/assets/icons/icon.png`,
        webPreferences: { nodeIntegration: true },
    });

    let indexPath;

    if (isDev && process.argv.indexOf("--noDevServer") === -1) {
        indexPath = url.format({
            protocol: "http:",
            host: "localhost:8080",
            pathname: "index.html",
            slashes: true,
        });
    } else {
        indexPath = url.format({
            protocol: "file:",
            pathname: path.join(__dirname, "dist", "index.html"),
            slashes: true,
        });
    }

    mainWindow.loadURL(indexPath);

    // Don't show until we are ready and loaded
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();

        // Open devtools if dev
        if (isDev) {
            const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");

            installExtension(REACT_DEVELOPER_TOOLS).catch((err) => console.log("Error loading React DevTools: ", err));
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on("closed", () => (mainWindow = null));
}

async function sendLogs() {
    try {
        const logs = await Log.find().sort({ created: 1 });
        mainWindow.webContents.send("logs:get", JSON.stringify(logs));
    } catch (error) {
        console.log(error);
    }
}

async function clearLogs() {
	try {
		await Log.deleteMany({});
		mainWindow.webContents.send("logs:clear");
	} catch (error) {
		console.log(error);
	}
}

app.on("ready", () => {
	createMainWindow();
	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

ipcMain.on("logs:load", () => sendLogs());

ipcMain.on("logs:add", async (e, logs) => {
    try {
        await Log.create(logs);
        sendLogs();
    } catch (error) {
        console.log(error);
    }
});

ipcMain.on("logs:delete", async (e, id) => {
    try {
        await Log.findOneAndDelete({ _id: id });
        sendLogs();
    } catch (error) {
		console.log(error);
	}
});

const menu = [
	...(isMac ? [{ role: "appMenu" }] : []),
	{
		role: "fileMenu",
	},
	{
		role: "editMenu",
	},
	{
		label: "Logs",
		submenu: [
			{
				label: "Clear logs",
				click: () => clearLogs(),
			}
		],
	},
	...(isDev ? [
		{
			label: "Developer",
			submenu: [
				{ role: "reload", },
				{ role: "forcereload", },
				{ type: "separator", },
				{ role: "toggledevtools", },
			]
		}
	] : []),
];
