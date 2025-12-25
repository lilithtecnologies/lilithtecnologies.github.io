// Módulo para manejar la instalación de PWA
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.INSTALL_PROMPT_KEY = 'oasis-install-prompt-shown';
        this.installButton = null;
    }

    init() {
        // Registrar service worker
        this.registerServiceWorker();
        
        // Escuchar el evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            this.handleBeforeInstallPrompt(e);
        });

        // Escuchar cuando se instala la app
        window.addEventListener('appinstalled', () => {
            this.handleAppInstalled();
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Error al registrar Service Worker:', error);
                });
        }
    }

    handleBeforeInstallPrompt(e) {
        // Prevenir el comportamiento por defecto
        e.preventDefault();
        
        // Guardar el evento
        this.deferredPrompt = e;

        // Verificar si el prompt ya fue mostrado
        const promptWasShown = localStorage.getItem(this.INSTALL_PROMPT_KEY);
        
        if (!promptWasShown) {
            // Mostrar el prompt solo la primera vez
            this.showInstallPrompt();
            
            // Marcar que ya se mostró
            localStorage.setItem(this.INSTALL_PROMPT_KEY, 'true');
        }
    }

    showInstallPrompt() {
        // Crear un elemento visual para mostrar el prompt
        const promptContainer = document.createElement('div');
        promptContainer.id = 'pwa-install-prompt';
        promptContainer.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 0;
            right: 0;
            margin: 0 10px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            animation: slideUp 0.3s ease-out;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        `;

        const message = document.createElement('span');
        message.textContent = '📱 Instala Oasis en tu pantalla principal';
        message.style.flex = '1';
        message.style.fontSize = '0.95rem';
        message.style.fontWeight = '500';

        const installBtn = document.createElement('button');
        installBtn.textContent = 'Instalar';
        installBtn.style.cssText = `
            background: white;
            color: #4CAF50;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.3s;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.3);
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s;
        `;

        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'scale(1.05)';
        });

        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'scale(1)';
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.5)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        installBtn.addEventListener('click', () => {
            this.promptInstall();
        });

        closeBtn.addEventListener('click', () => {
            this.closePrompt(promptContainer);
        });

        promptContainer.appendChild(message);
        promptContainer.appendChild(installBtn);
        promptContainer.appendChild(closeBtn);

        document.body.appendChild(promptContainer);

        // Agregar animación de entrada
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    promptInstall() {
        if (!this.deferredPrompt) return;

        // Mostrar el prompt nativo de instalación
        this.deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuario aceptó instalar la app');
            } else {
                console.log('Usuario rechazó instalar la app');
            }
            
            // Limpiar el prompt
            this.deferredPrompt = null;
            
            // Remover el contenedor
            const promptContainer = document.getElementById('pwa-install-prompt');
            if (promptContainer) {
                this.closePrompt(promptContainer);
            }
        });
    }

    closePrompt(promptContainer) {
        promptContainer.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => {
            if (promptContainer && promptContainer.parentNode) {
                promptContainer.parentNode.removeChild(promptContainer);
            }
        }, 300);
    }

    handleAppInstalled() {
        console.log('Oasis fue instalada en la pantalla principal');
        
        // Remover el prompt si aún está visible
        const promptContainer = document.getElementById('pwa-install-prompt');
        if (promptContainer) {
            this.closePrompt(promptContainer);
        }
    }
}

// Crear instancia global del PWA manager
const pwaManager = new PWAManager();
