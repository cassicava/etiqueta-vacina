const appHeader = document.getElementById('appHeader');
const welcomeMsg = document.getElementById('welcomeMsg');
const appContainer = document.getElementById('appContainer');
const contentArea = document.getElementById('contentArea');
const mouseShadow = document.getElementById('mouseShadow');
const appTitle = document.getElementById('appTitle');
const btnTheme = document.getElementById('btnTheme');
const btnConfigPrint = document.getElementById('btnConfigPrint');
const configPrintOverlay = document.getElementById('configPrintOverlay');

let state = {
    vacinas: [] 
};

let configImpresso = {
    pageWidth: 21.0,
    pageHeight: 29.7,
    cols: 2,
    rows: 10,
    gapX: 0.5,
    gapY: 0.0,
    marginTop: 1.5,
    marginBottom: 1.5,
    marginLeft: 0.5,
    marginRight: 0.5,
    labelWidth: 9.5,
    labelHeight: 2.5,
    
    padTop: 0.2,
    padBottom: 0.2,
    padLeft: 0.2,
    padRight: 0.2,

    doseCols: 2,
    doseRows: 1,
    doseGapX: 0.2,
    doseGapY: 0.0,
    doseWidth: 4.3,
    doseHeight: 2
};

let clicksNeeded = Math.floor(Math.random() * 11) + 10;
let currentClicks = 0;