// Datos de servicios
const servicios = [
    {
        icon: "fas fa-search",
        title: "Investigación y Prospectiva Tecnológica",
        description: "Análisis profundo de tecnologías emergentes, vigilancia tecnológica, estudios de mercado y evaluación de tendencias disruptivas para anticipar escenarios futuros y oportunidades estratégicas."
    },
    {
        icon: "fas fa-chart-line",
        title: "Consultoría Estratégica en Tecnología e Innovación",
        description: "Asesoramiento especializado en transformación digital, diseño de estrategias tecnológicas, adopción de innovación y alineación entre objetivos empresariales y capacidades técnicas."
    },
    {
        icon: "fas fa-clipboard-check",
        title: "Auditoría y Evaluación de Sistemas",
        description: "Diagnóstico integral de infraestructuras tecnológicas, análisis de desempeño y seguridad, identificación de vulnerabilidades críticas y definición de planes de mejora basados en buenas prácticas y estándares internacionales."
    },
    {
        icon: "fas fa-code",
        title: "Ingeniería y Desarrollo de Software",
        description: "Diseño y construcción de soluciones de software a medida, aplicaciones empresariales, sistemas inteligentes y plataformas escalables orientadas a eficiencia, robustez y sostenibilidad tecnológica."
    },
    {
        icon: "fas fa-sitemap",
        title: "Arquitectura y Gestión de Sistemas",
        description: "Administración avanzada, mantenimiento y optimización de sistemas e infraestructuras críticas, garantizando alta disponibilidad, confiabilidad operativa y evolución controlada de los entornos tecnológicos."
    },
    {
        icon: "fas fa-shield-alt",
        title: "Ciberseguridad y Gestión del Riesgo Digital",
        description: "Protección integral de activos digitales mediante análisis de riesgos, diseño de arquitecturas seguras, implementación de controles de seguridad y estrategias de mitigación frente a amenazas avanzadas."
    },
    {
        icon: "fas fa-satellite",
        title: "Tecnologías Aeroespaciales y Sistemas Espaciales",
        description: "Desarrollo de software, sistemas embebidos y soluciones tecnológicas para aplicaciones aeroespaciales, satelitales y de exploración, con énfasis en precisión, resiliencia y entornos de alta exigencia."
    },
    {
        icon: "fas fa-network-wired",
        title: "Infraestructura de Redes y Conectividad Avanzada",
        description: "Diseño, implementación y optimización de redes empresariales, arquitecturas de conectividad seguras y de alto rendimiento, orientadas a escalabilidad y continuidad operativa."
    }
];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar servicios
    cargarServicios();
    
    // Configurar toggle del tema
    configurarTema();
    
    // Configurar navegación móvil
    configurarNavegacionMovil();
    
    // Configurar animaciones al hacer scroll
    configurarAnimacionesScroll();
    
    // Pausar animación del carrusel al hacer hover
    pausarCarruselHover();
    
    // Mejorar la animación de cortina
    mejorarAnimacionCortina();
    
    // Configurar indicador de progreso de scroll
    setupScrollProgress();
});

// Cargar servicios en la sección correspondiente
function cargarServicios() {
    const serviciosGrid = document.querySelector('.services-grid');
    
    servicios.forEach(servicio => {
        const servicioCard = document.createElement('div');
        servicioCard.className = 'service-card';
        
        servicioCard.innerHTML = `
            <div class="service-icon"><i class="${servicio.icon}"></i></div>
            <h3 class="service-title">${servicio.title}</h3>
            <p class="service-description">${servicio.description}</p>
        `;
        
        serviciosGrid.appendChild(servicioCard);
    });
}

// Configurar toggle del tema claro/oscuro
function configurarTema() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Actualizar icono según el tema actual
    updateThemeIcon(savedTheme, themeIcon);
    
    // Alternar tema al hacer clic
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon(newTheme, themeIcon);
        
        // Agregar efecto visual al cambiar tema
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    });
}

function updateThemeIcon(theme, iconElement) {
    if (theme === 'light') {
        iconElement.className = 'fas fa-moon';
        iconElement.setAttribute('title', 'Cambiar a modo oscuro');
    } else {
        iconElement.className = 'fas fa-sun';
        iconElement.setAttribute('title', 'Cambiar a modo claro');
    }
}

// Configurar navegación móvil
function configurarNavegacionMovil() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');
    
    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Cambiar icono del toggle
        const icon = navToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
            document.body.style.overflow = 'hidden';
        } else {
            icon.className = 'fas fa-bars';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Cerrar menú al hacer clic en un enlace (en dispositivos móviles)
    navLinksItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                navToggle.querySelector('i').className = 'fas fa-bars';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Cerrar menú al redimensionar la ventana a un tamaño mayor
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navToggle.querySelector('i').className = 'fas fa-bars';
            document.body.style.overflow = 'auto';
        }
    });
}

// Configurar animaciones al hacer scroll
function configurarAnimacionesScroll() {
    // Observador de intersección para animar elementos al entrar en vista
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añadir clase de animación a las tarjetas de servicios
                if (entry.target.classList.contains('service-card')) {
                    entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}ms`;
                    entry.target.classList.add('animated');
                }
                
                // Animar elementos de visualización
                if (entry.target.classList.contains('about-visual') || 
                    entry.target.classList.contains('contact-visual')) {
                    entry.target.classList.add('animated');
                }
            }
        });
    }, observerOptions);
    
    // Observar tarjetas de servicios
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.dataset.delay = index * 100;
        observer.observe(card);
    });
    
    // Observar elementos visuales
    document.querySelectorAll('.about-visual, .contact-visual').forEach(el => {
        observer.observe(el);
    });
    
    // Efecto de aparición suave al hacer scroll
    const fadeElements = document.querySelectorAll('.about-paragraph, .contact-paragraph, .section-title');
    
    const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
    });
}

// Pausar animación del carrusel al hacer hover
function pausarCarruselHover() {
    const carouselTrack = document.querySelector('.carousel-track');
    
    carouselTrack.addEventListener('mouseenter', function() {
        this.style.animationPlayState = 'paused';
    });
    
    carouselTrack.addEventListener('mouseleave', function() {
        this.style.animationPlayState = 'running';
    });
}

// Efecto de partículas para el fondo (opcional, sofisticado)
function crearEfectoParticulas() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    document.body.appendChild(particlesContainer);
    
    // Crear partículas
    const particleCount = 50;
    const colors = ['#000000', '#333333', '#666666'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            opacity: ${Math.random() * 0.3 + 0.1};
            animation: floatParticle ${duration}s ease-in-out ${delay}s infinite alternate;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    // Añadir animación CSS para las partículas
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translate(0, 0);
            }
            100% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Inicializar efecto de partículas solo en modo oscuro para mejor visibilidad
function inicializarParticulas() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        crearEfectoParticulas();
    }
    
    // Escuchar cambios de tema para agregar/remover partículas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'data-theme') {
                const particles = document.querySelector('.particles-container');
                if (document.documentElement.getAttribute('data-theme') === 'dark') {
                    if (!particles) crearEfectoParticulas();
                } else {
                    if (particles) particles.remove();
                }
            }
        });
    });
    
    observer.observe(document.documentElement, { attributes: true });
}

// Inicializar efecto de partículas
inicializarParticulas();

// Mejorar la animación de cortina
function mejorarAnimacionCortina() {
    // Remover la cortina después de que termine la animación
    setTimeout(() => {
        const curtain = document.querySelector('.curtain-animation');
        if (curtain) {
            curtain.style.display = 'none';
        }
    }, 1500);
    
    // Añadir animación escalonada a las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = `opacity 0.6s ease ${0.5 + (index * 0.1)}s, transform 0.6s ease ${0.5 + (index * 0.1)}s`;
    });
    
    // Animar las secciones cuando sean visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
}

// Configurar indicador de progreso de scroll
function setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Inicializar efecto de partículas
inicializarParticulas();