const firebaseConfig = {
    apiKey: "AIzaSyDAPcijJ3FgFwfqJIj_rntH4NJn136Kvk0",
    authDomain: "app-de-mensajes-b4b7c.firebaseapp.com",
    databaseURL: "https://app-de-mensajes-b4b7c-default-rtdb.firebaseio.com",
    projectId: "app-de-mensajes-b4b7c",
    storageBucket: "app-de-mensajes-b4b7c.firebasestorage.app",
    messagingSenderId: "470376363770",
    appId: "1:470376363770:web:dd9e3b09a8be305afabb43"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const terminalTime = document.getElementById('terminal-time');
const connectionStatus = document.getElementById('connection-status');
const messageCount = document.getElementById('message-count');
const userCountSpan = document.getElementById('user-count');
const startupScreen = document.getElementById('startup-screen');
const binaryAnimation = document.getElementById('binary-animation');
const terminalContainer = document.querySelector('.terminal-container');

let userIP = '127.0.0.1';
let userName = '';
let messageCounter = 0;
let isAdmin = false;
let userRef = null;
let loadedMessages = new Set();

const adminIPs = ['192.168.', '10.0.', '127.0.'];

document.addEventListener('DOMContentLoaded', async () => {
    await getUserIP();
    setupAdminStatus();
    createBinaryAnimation();
});

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;
        const last8 = data.ip.slice(-8);
        userName = 'IP_' + last8.toUpperCase().replace(/\./g, '_');
        localStorage.setItem('ashernet_user', userName);
    } catch (error) {
        const stored = localStorage.getItem('ashernet_user');
        if (stored) {
            userName = stored;
        } else {
            userName = 'IP_UNKNOWN';
        }
        userIP = '127.0.0.1';
    }
}

function setupAdminStatus() {
    isAdmin = adminIPs.some(prefix => userIP.startsWith(prefix));
}

function createBinaryAnimation() {
    const chars = [];
    for (let i = 0; i < 200; i++) {
        const char = Math.random() > 0.5 ? '0' : '1';
        const left = Math.random() * 100;
        const top = -100 - Math.random() * 200;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 0.5;

        const div = document.createElement('div');
        div.className = 'binary-char';
        div.textContent = char;
        div.style.left = left + '%';
        div.style.top = top + 'px';
        div.style.animation = `binaryFall ${duration}s linear ${delay}s forwards`;
        binaryAnimation.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, (duration + delay) * 1000);
    }

    setTimeout(() => {
        initializeTerminal();
    }, 3000);
}

function initializeTerminal() {
    startupScreen.classList.add('hidden');
    setTimeout(() => {
        startupScreen.style.display = 'none';
        terminalContainer.classList.add('visible');
        binaryAnimation.style.display = 'none';
        setupFirebaseConnection();
        setupEventListeners();
        addSystemMessage('SISTEMA INICIALIZADO - CONECTANDO A ASHERNET...');
        setTimeout(() => {
            addSystemMessage('CONEXIÓN ESTABLECIDA - CIFRADO ACTIVO');
            addSystemMessage(`IDENTIFICADO COMO: ${userName}`);
        }, 800);
        updateTime();
        setInterval(updateTime, 1000);
    }, 500);
}

function setupFirebaseConnection() {
    userRef = database.ref('online_users/' + userName);
    userRef.set({
        ip: userIP,
        timestamp: Date.now(),
        name: userName
    });
    userRef.onDisconnect().remove();

    database.ref('online_users').on('value', (snapshot) => {
        const count = snapshot.numChildren();
        userCountSpan.textContent = count;
    });

    database.ref('messages').on('child_added', (snapshot) => {
        const msg = snapshot.val();
        const msgId = snapshot.key;
        
        if (!loadedMessages.has(msgId)) {
            loadedMessages.add(msgId);
            if (msg.sender !== userName) {
                addRemoteMessage(msg.sender, msg.content);
            }
        }
    });
}

function setupEventListeners() {
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const input = terminalInput.value.trim();
            if (input) {
                if (input.startsWith('/')) {
                    handleCommand(input);
                } else {
                    sendMessage(input);
                }
                terminalInput.value = '';
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'x') {
            e.preventDefault();
            activatePanicMode();
        }
    });
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    terminalTime.textContent = timeString;
}

function sendMessage(content) {
    addUserMessage(content);
    const msgRef = database.ref('messages').push();
    msgRef.set({
        sender: userName,
        ip: userIP,
        content: content,
        timestamp: Date.now()
    });
    messageCounter++;
    messageCount.textContent = `MENSAJES: ${messageCounter}`;
}

function handleCommand(command) {
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();

    switch(cmd) {
        case '/help':
            addCommandMessage('=== COMANDOS DISPONIBLES ===');
            addSystemMessage('/help - Muestra esta ayuda');
            addSystemMessage('/clear - Limpia la terminal');
            addSystemMessage('/users - Muestra usuarios conectados');
            addSystemMessage('/panic - Activa modo pánico (CTRL+X)');
            if (isAdmin) {
                addSystemMessage('=== COMANDOS ADMIN ===');
                addSystemMessage('/admin clear - Borra todos los mensajes');
            }
            break;

        case '/clear':
            terminalOutput.innerHTML = '';
            addSystemMessage('TERMINAL LIMPIADA');
            break;

        case '/users':
            database.ref('online_users').once('value', (snapshot) => {
                const users = snapshot.val() || {};
                addCommandMessage('=== USUARIOS CONECTADOS ===');
                Object.keys(users).forEach(user => {
                    addSystemMessage(`${user} (${users[user].ip})`);
                });
            });
            break;

        case '/panic':
            activatePanicMode();
            break;

        case '/admin':
            if (!isAdmin) {
                addErrorMessage('ACCESO DENEGADO');
                return;
            }
            const adminCmd = args[1] ? args[1].toLowerCase() : '';
            if (adminCmd === 'clear') {
                database.ref('messages').remove();
                addSuccessMessage('TODOS LOS MENSAJES HAN SIDO BORRADOS');
            } else {
                addErrorMessage('Comando admin no reconocido');
            }
            break;

        default:
            addErrorMessage('COMANDO NO RECONOCIDO - Use /help para ver comandos');
    }
}

function addSystemMessage(text) {
    addMessageToTerminal('system', 'SISTEMA', text);
}

function addUserMessage(text) {
    addMessageToTerminal('user', userName, text);
}

function addRemoteMessage(sender, text) {
    addMessageToTerminal('remote', sender, text);
    messageCounter++;
    messageCount.textContent = `MENSAJES: ${messageCounter}`;
}

function addErrorMessage(text) {
    addMessageToTerminal('error', 'ERROR', text);
}

function addSuccessMessage(text) {
    addMessageToTerminal('success', 'ÉXITO', text);
}

function addCommandMessage(text) {
    addMessageToTerminal('command', 'COMANDO', text);
}

function addMessageToTerminal(type, sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-line ${type}`;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    messageDiv.innerHTML = `
        <span class="message-time">[${time}]</span>
        <span class="message-sender">${sender}:</span>
        <span class="message-content">${content}</span>
    `;

    terminalOutput.appendChild(messageDiv);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function activatePanicMode() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000000;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-terminal-error);
        font-size: 2em;
        text-align: center;
        letter-spacing: 2px;
    `;
    overlay.textContent = '!!! MODO PÁNICO ACTIVADO !!!';
    document.body.appendChild(overlay);

    localStorage.clear();
    if (userRef) {
        userRef.remove();
    }
    database.ref('messages').off();

    setTimeout(() => {
        window.location.href = 'about:blank';
    }, 3000);
}