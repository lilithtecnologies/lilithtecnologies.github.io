// ============ CONFIGURACIÓN ============
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
const messagesRef = database.ref('messages');
const commandsRef = database.ref('commands');
const typingRef = database.ref('typing');
const configRef = database.ref('config');

// ============ REFERENCIAS DOM ============
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearChatButton = document.getElementById('clear-chat');
const sidebarContainer = document.getElementById('sidebar-container');
const menuToggle = document.getElementById('menu-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sessionExpiresEl = document.getElementById('session-expires');
const pinChangeInput = document.getElementById('new-pin-input');
const changePinBtn = document.getElementById('change-pin-btn');
const refreshSessionBtn = document.getElementById('refresh-session');
const exportChatBtn = document.getElementById('export-chat');
const ephemeralToggle = document.getElementById('ephemeral-toggle');
const ephemeralDuration = document.getElementById('ephemeral-duration');
const pinInputs = document.querySelectorAll('.pin-digit');
const pinSubmit = document.getElementById('pin-submit');
const panicButtonLogin = document.getElementById('panic-button');
const panicButtonApp = document.getElementById('panic-button-app');
const deviceIdTop = document.getElementById('device-id-top');

// ============ ESTADO GLOBAL ============
let userIP = 'Desconocido';
let currentSessionKey = null;
let currentPIN = "2006";
const ADMIN_PIN = "1100";
let deviceId;
let isAdmin = false;
let sessionTimer;
let sessionEndTime;
let messageCount = 0;
let isTyping = false;
let typingTimeout;
let pinAttempts = 0;
const MAX_PIN_ATTEMPTS = 5;
let pinBlockedUntil = null;
let ephemeralMessagesEnabled = false;
let ephemeralMessagesTTL = 30;
let ephemeralMessageTimers = new Map();
let messageIdCounter = 0;
let loadedMessageIds = new Set();

// ============ FUNCIONES DE SEGURIDAD ============

function generateSessionKey(pin) {
    const timestamp = Date.now().toString();
    const deviceInfo = navigator.userAgent;
    const seed = pin + timestamp + deviceInfo + Math.random().toString(36);
    return CryptoJS.SHA256(seed).toString();
}

function deepSanitize(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    let sanitized = div.innerHTML
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    return sanitized;
}

function encryptMessage(message) {
    const sanitized = deepSanitize(message);
    return CryptoJS.AES.encrypt(sanitized, currentSessionKey).toString();
}

function decryptMessage(ciphertext) {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, currentSessionKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || "*** MENSAJE NO DESCIFRABLE ***";
    } catch (e) {
        return "*** MENSAJE NO DESCIFRABLE ***";
    }
}

function activatePanicMode() {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    showError("MODO PÁNICO ACTIVADO");
    setTimeout(() => {
        window.location.href = 'about:blank';
    }, 2000);
}

// ============ FUNCIONES GENERALES ============

function getDeviceId() {
    let id = localStorage.getItem('ashernet_deviceId');
    if (!id) {
        id = 'dev_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ashernet_deviceId', id);
    }
    return id;
}

async function loadPINFromFirebase() {
    try {
        const snapshot = await configRef.child('pin').once('value');
        if (snapshot.exists()) {
            currentPIN = snapshot.val();
        }
    } catch (error) {
        console.log("Usando PIN por defecto");
    }
}

function showStatus(message) {
    const div = document.createElement('div');
    div.className = 'status-message status-success show';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showError(message) {
    const div = document.createElement('div');
    div.className = 'status-message status-error show';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

async function getIP() {
    return new Promise((resolve) => {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                userIP = data.ip;
                resolve();
            })
            .catch(() => {
                userIP = '127.0.0.1';
                resolve();
            });
    });
}

function updateSessionTimer() {
    const timeLeft = Math.max(0, sessionEndTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    sessionExpiresEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startSessionTimer(duration) {
    clearInterval(sessionTimer);
    sessionEndTime = Date.now() + duration;
    updateSessionTimer();
    
    sessionTimer = setInterval(() => {
        const timeLeft = sessionEndTime - Date.now();
        if (timeLeft <= 0) {
            clearInterval(sessionTimer);
            showError("Sesión expirada");
            setTimeout(() => {
                localStorage.removeItem('ashernet_session');
                location.reload();
            }, 2000);
        } else {
            updateSessionTimer();
        }
    }, 1000);
}

// ============ FIREBASE LISTENERS ============

function setupRealtimeListener() {
    messagesRef.orderByChild('timestamp').limitToLast(50).on('child_added', (snapshot) => {
        const messageId = snapshot.key;
        
        if (!loadedMessageIds.has(messageId)) {
            loadedMessageIds.add(messageId);
            const message = snapshot.val();
            
            if (message.deviceId !== deviceId) {
                const decryptedMessage = decryptMessage(message.text);
                addMessageToChat(decryptedMessage, message.ip, message.deviceId, false, messageId);
                messageCount++;
            }
        }
    });
}

function setupCommandListener() {
    commandsRef.on('value', (snapshot) => {
        const command = snapshot.val();
        if (command && command.action === 'clear_chat') {
            chatContainer.innerHTML = '';
            messageCount = 0;
            showStatus('Historial eliminado');
        }
    });
}

function setupTypingIndicator() {
    messageInput.addEventListener('input', () => {
        if (!isTyping) {
            isTyping = true;
            typingRef.set({ deviceId, ip: userIP, typing: true });
        }
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
            typingRef.set({ deviceId, ip: userIP, typing: false });
        }, 1000);
    });
}

// ============ INTERFAZ DE USUARIO ============

function addMessageToChat(message, ip, device, isSent = false, messageId = null) {
    if (!messageId) {
        messageId = `msg_${++messageIdCounter}_${Date.now()}`;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    messageElement.dataset.messageId = messageId;
    
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const shortDevice = device.substr(0, 6);
    const statusClass = isSent ? 'sent' : 'read';
    
    messageElement.innerHTML = `
        <div class="message-bubble">
            <div class="message-header">
                <span class="message-sender">${isSent ? 'Tú' : shortDevice}</span>
                <span class="message-ip">${ip}</span>
            </div>
            <div class="message-content">${message}</div>
            <div class="message-time">
                ${time}
                <span class="message-status ${statusClass}"></span>
            </div>
            <div class="message-reactions" id="reactions_${messageId}"></div>
        </div>
    `;
    
    messageElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showEmojiMenu(messageId, messageElement);
    });
    
    chatContainer.appendChild(messageElement);
    
    if (!isSent && window.Notification && Notification.permission === "granted") {
        new Notification("Nuevo mensaje", {
            body: message.substring(0, 50),
            tag: `msg_${messageId}`
        });
    }
    
    if (ephemeralMessagesEnabled && !isSent) {
        scheduleEphemeralMessage(messageId, messageElement);
    }
    
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
}

function showEmojiMenu(messageId, messageElement) {
    const emojis = ['👍', '❤️', '😂', '🎉', '🔥', '💯', '👏', '🚀'];
    const existingMenu = document.querySelector('.emoji-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'emoji-menu';
    
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.onclick = () => {
            addReaction(messageId, emoji, messageElement);
            menu.remove();
        };
        menu.appendChild(btn);
    });
    
    document.body.appendChild(menu);
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    setTimeout(() => {
        document.addEventListener('click', () => menu.remove(), { once: true });
    }, 100);
}

function addReaction(messageId, emoji, messageElement) {
    const reactionsContainer = document.getElementById(`reactions_${messageId}`);
    
    let existingReaction = Array.from(reactionsContainer.children).find(r => 
        r.textContent.includes(emoji)
    );
    
    if (existingReaction) {
        const count = parseInt(existingReaction.dataset.count || 1) + 1;
        existingReaction.dataset.count = count;
        existingReaction.textContent = `${emoji} ${count}`;
    } else {
        const reaction = document.createElement('div');
        reaction.className = 'reaction';
        reaction.dataset.count = '1';
        reaction.textContent = emoji;
        reaction.addEventListener('click', () => {
            addReaction(messageId, emoji, messageElement);
        });
        reactionsContainer.appendChild(reaction);
    }
}

function scheduleEphemeralMessage(messageId, messageElement) {
    if (ephemeralMessageTimers.has(messageId)) {
        clearTimeout(ephemeralMessageTimers.get(messageId));
    }
    
    const timer = setTimeout(() => {
        messageElement.style.opacity = '0.4';
        messageElement.style.textDecoration = 'line-through';
        
        setTimeout(() => {
            messageElement.remove();
            ephemeralMessageTimers.delete(messageId);
        }, 500);
    }, ephemeralMessagesTTL * 1000);
    
    ephemeralMessageTimers.set(messageId, timer);
}

// ============ SIDEBAR MANAGEMENT ============

function toggleSidebar() {
    sidebarContainer.classList.toggle('hidden');
    appContainer.classList.toggle('sidebar-open');
}

function closeSidebar() {
    sidebarContainer.classList.add('hidden');
    appContainer.classList.remove('sidebar-open');
}

menuToggle?.addEventListener('click', toggleSidebar);
sidebarClose?.addEventListener('click', closeSidebar);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sidebarContainer.classList.contains('hidden')) {
        closeSidebar();
    }
});

// ============ AUTENTICACIÓN PIN ============

pinInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
        if (this.value.length === 1) {
            const nextId = this.getAttribute('data-next');
            if (nextId) {
                document.getElementById(nextId)?.focus();
            }
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === "Backspace" && this.value === '' && index > 0) {
            pinInputs[index-1].focus();
        }
    });
});

async function verifyPIN() {
    if (pinBlockedUntil && Date.now() < pinBlockedUntil) {
        showError("PIN bloqueado temporalmente");
        return;
    }
    
    const enteredPIN = Array.from(pinInputs).map(input => input.value).join('');
    
    if (enteredPIN === ADMIN_PIN) {
        isAdmin = true;
        pinAttempts = 0;
        showStatus("Acceso admin");
    } else if (enteredPIN === currentPIN) {
        isAdmin = false;
        pinAttempts = 0;
    } else {
        pinAttempts++;
        pinInputs.forEach(input => {
            input.style.borderColor = '#ef4444';
            input.value = '';
        });
        setTimeout(() => {
            pinInputs.forEach(input => {
                input.style.borderColor = '';
            });
            pinInputs[0].focus();
        }, 1000);
        
        if (pinAttempts >= MAX_PIN_ATTEMPTS) {
            pinBlockedUntil = Date.now() + 30000;
            showError('Demasiados intentos');
        } else {
            showError(`PIN incorrecto (${pinAttempts}/${MAX_PIN_ATTEMPTS})`);
        }
        return;
    }
    
    currentSessionKey = generateSessionKey(enteredPIN);
    
    const sessionData = {
        pin: enteredPIN === ADMIN_PIN ? ADMIN_PIN : currentPIN,
        isAdmin: isAdmin,
        sessionKey: currentSessionKey,
        expires: Date.now() + 600000
    };
    localStorage.setItem('ashernet_session', JSON.stringify(sessionData));
    
    loginScreen.style.display = 'none';
    appContainer.style.display = 'flex';
    
    if (isAdmin) {
        sidebarContainer.classList.remove('hidden');
    }
    
    initializeApp();
    startSessionTimer(600000);
}

pinSubmit?.addEventListener('click', verifyPIN);

pinInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === "Enter") {
            verifyPIN();
        }
    });
});

// ============ VERIFICAR SESIÓN EXISTENTE ============

async function checkSession() {
    await loadPINFromFirebase();
    
    const sessionData = localStorage.getItem('ashernet_session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        const currentTime = Date.now();
        const timeLeft = session.expires - currentTime;
        
        if (timeLeft > 0) {
            deviceId = getDeviceId();
            deviceIdTop.textContent = deviceId.substr(0, 8);
            currentSessionKey = session.sessionKey;
            isAdmin = session.isAdmin || false;
            
            loginScreen.style.display = 'none';
            appContainer.style.display = 'flex';
            
            if (!isAdmin) {
                sidebarContainer.classList.add('hidden');
            }
            
            initializeApp();
            startSessionTimer(timeLeft);
            return true;
        } else {
            localStorage.removeItem('ashernet_session');
        }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadPINFromFirebase();
    deviceId = getDeviceId();
    
    if (!checkSession()) {
        pinInputs[0]?.focus();
    }
});

// ============ INICIALIZACIÓN APP ============

async function initializeApp() {
    await getIP();
    setupRealtimeListener();
    setupCommandListener();
    setupTypingIndicator();
    
    sendButton?.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        
        if (message) {
            try {
                const encryptedMessage = encryptMessage(message);
                
                await messagesRef.push({
                    ip: userIP,
                    deviceId: deviceId,
                    text: encryptedMessage,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                
                addMessageToChat(message, userIP, deviceId, true);
                messageCount++;
                messageInput.value = '';
                messageInput.focus();
                messageInput.style.height = 'auto';
                
                if (isTyping) {
                    isTyping = false;
                    typingRef.set({ deviceId, ip: userIP, typing: false });
                }
            } catch (error) {
                showError('Error al enviar');
            }
        }
    });
    
    messageInput?.addEventListener('keypress', (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendButton?.click();
        }
    });
    
    messageInput?.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    clearChatButton?.addEventListener('click', async () => {
        if (!isAdmin) {
            showError('Solo admin');
            return;
        }
        
        if (confirm('¿Borrar historial?')) {
            try {
                await messagesRef.remove();
                await commandsRef.set({
                    action: 'clear_chat',
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                chatContainer.innerHTML = '';
                messageCount = 0;
                showStatus('Borrado');
            } catch (error) {
                showError('Error');
            }
        }
    });
    
    changePinBtn?.addEventListener('click', async () => {
        if (!isAdmin) {
            showError('Solo admin');
            return;
        }
        
        const newPIN = pinChangeInput.value.trim();
        if (!newPIN || newPIN.length !== 4 || isNaN(newPIN)) {
            showError('PIN inválido');
            return;
        }
        
        try {
            await configRef.child('pin').set(newPIN);
            currentPIN = newPIN;
            pinChangeInput.value = '';
            showStatus('PIN actualizado');
        } catch (error) {
            showError('Error');
        }
    });
    
    refreshSessionBtn?.addEventListener('click', () => {
        const sessionData = JSON.parse(localStorage.getItem('ashernet_session'));
        if (sessionData) {
            sessionData.expires = Date.now() + 600000;
            localStorage.setItem('ashernet_session', JSON.stringify(sessionData));
            startSessionTimer(600000);
            showStatus('Sesión renovada');
        }
    });
    
    ephemeralToggle?.addEventListener('change', () => {
        ephemeralMessagesEnabled = ephemeralToggle.checked;
        showStatus(ephemeralMessagesEnabled ? 'Efímeros activados' : 'Efímeros desactivados');
    });
    
    ephemeralDuration?.addEventListener('change', () => {
        ephemeralMessagesTTL = parseInt(ephemeralDuration.value) || 30;
    });
    
    exportChatBtn?.addEventListener('click', () => {
        let text = '';
        document.querySelectorAll('.message').forEach(msg => {
            text += msg.innerText + '\n\n';
        });
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ashernet.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showStatus('Exportado');
    });
    
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// ============ ATAJOS DE TECLADO ============

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        if (confirm('¿Activar Modo Pánico?')) {
            activatePanicMode();
        }
    }
});

panicButtonLogin?.addEventListener('click', () => {
    if (confirm('¿Activar Modo Pánico?')) {
        activatePanicMode();
    }
});

panicButtonApp?.addEventListener('click', () => {
    if (confirm('¿Activar Modo Pánico?')) {
        activatePanicMode();
    }
});

// ============ NOTIFICACIONES ============

if (window.Notification && Notification.permission === "default") {
    Notification.requestPermission();
}
