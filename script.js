// Animación de fondo - Red Neuronal
const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

// Ajustar canvas al tamaño de la ventana
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Configuración de la animación
const config = {
    nodeCount: 20,
    nodeRadius: 3,
    lineWidth: 0.8,
    lineColor: '#4ECB71',
    nodeColor: '#4ECB71',
    connectionDistance: 150,
    speed: 0.5
};

// Nodos de la red neuronal
let nodes = [];

// Crear nodos iniciales
function createNodes() {
    nodes = [];
    for (let i = 0; i < config.nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * config.speed,
            vy: (Math.random() - 0.5) * config.speed
        });
    }
}

// Dibujar nodos
function drawNodes() {
    ctx.fillStyle = config.nodeColor;
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, config.nodeRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Dibujar conexiones entre nodos
function drawConnections() {
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = config.lineWidth;
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.connectionDistance) {
                // La opacidad depende de la distancia
                const opacity = 1 - (distance / config.connectionDistance);
                ctx.globalAlpha = opacity * 0.6;
                
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }
    ctx.globalAlpha = 1.0;
}

// Actualizar posición de los nodos
function updateNodes() {
    nodes.forEach(node => {
        // Mover nodo
        node.x += node.vx;
        node.y += node.vy;
        
        // Rebotar en los bordes
        if (node.x < 0 || node.x > canvas.width) node.vx = -node.vx;
        if (node.y < 0 || node.y > canvas.height) node.vy = -node.vy;
        
        // Mantener dentro de los límites
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
    });
}

// Bucle de animación
function animate() {
    // Limpiar canvas con opacidad para efecto de trazo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar
    updateNodes();
    drawConnections();
    drawNodes();
    
    requestAnimationFrame(animate);
}

// Inicializar animación
createNodes();
animate();

// Navegación suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Cerrar menú móvil si está abierto
            navList.classList.remove('active');
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Menú móvil
const menuToggle = document.getElementById('menuToggle');
const navList = document.getElementById('navList');

menuToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
    });
});

// Animación de aparición de elementos al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observar elementos para animación
document.querySelectorAll('.feature, .service-card, .founder-placeholder, .contact-visual').forEach(el => {
    observer.observe(el);
});

// Efecto de escritura para el subtítulo del héroe (opcional)
const heroSubtitle = document.querySelector('.hero-subtitle');
const originalText = heroSubtitle.textContent;

function typeWriterEffect() {
    let i = 0;
    heroSubtitle.textContent = '';
    
    function type() {
        if (i < originalText.length) {
            heroSubtitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    
    // Solo activar en la carga inicial
    if (!sessionStorage.getItem('animationShown')) {
        type();
        sessionStorage.setItem('animationShown', 'true');
    } else {
        heroSubtitle.textContent = originalText;
    }
}

// Iniciar efecto de escritura cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    typeWriterEffect();
    
    // Añadir clase animada a elementos principales después de un breve retraso
    setTimeout(() => {
        document.querySelector('.hero-title').classList.add('animated');
        document.querySelector('.hero-description').classList.add('animated');
        document.querySelector('.hero-actions').classList.add('animated');
    }, 300);
});

// Cambiar opacidad del header al hacer scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
    } else {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    }
});