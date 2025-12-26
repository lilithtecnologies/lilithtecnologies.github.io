// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    // Simular carga de contenido
    setTimeout(() => {
        preloader.classList.add('fade-out');
        
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 2000);
});

// Cambio de tema claro/oscuro
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Verificar preferencia del sistema
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');

// Establecer tema inicial
if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    body.classList.add('dark-mode');
}

// Alternar tema
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Guardar preferencia
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Menú móvil
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    // Transformar ícono de hamburguesa a X
    const menuLines = document.querySelectorAll('.menu-line');
    if (navMenu.classList.contains('active')) {
        menuLines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        menuLines[1].style.opacity = '0';
        menuLines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        menuLines[0].style.transform = 'rotate(0) translate(0, 0)';
        menuLines[1].style.opacity = '1';
        menuLines[2].style.transform = 'rotate(0) translate(0, 0)';
    }
});

// Cerrar menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        
        const menuLines = document.querySelectorAll('.menu-line');
        menuLines[0].style.transform = 'rotate(0) translate(0, 0)';
        menuLines[1].style.opacity = '1';
        menuLines[2].style.transform = 'rotate(0) translate(0, 0)';
        
        // Actualizar enlace activo
        navLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
    });
});

// Scroll suave para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Botón para volver arriba
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    // Mostrar/ocultar botón scroll top
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
    
    // Actualizar enlace activo en navegación
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`.nav-link[href="#${sectionId}"]`).classList.add('active');
        } else {
            document.querySelector(`.nav-link[href="#${sectionId}"]`).classList.remove('active');
        }
    });
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Sistema de idiomas
const languageSelector = document.getElementById('languageSelector');
const languageOptions = document.querySelectorAll('.language-option');
const languageBtnText = document.querySelector('.language-btn span');

// Textos por idioma
const translations = {
    es: {
        // Navegación
        home: "Inicio",
        about: "Acerca de",
        services: "Servicios",
        contact: "Contacto",
        
        // Hero
        heroSubtitle: "LILITH TECHNOLOGIES",
        heroTitle: "La arquitectura de la <span class='highlight'>evolución</span> humana",
        heroDescription: "Diseñando el futuro a través de la investigación, innovación y consultoría especializada. Transformamos conceptos en realidades tecnológicas avanzadas.",
        exploreBtn: "Explorar más",
        contactBtn: "Contactar",
        
        // About
        aboutSubtitle: "QUIÉNES SOMOS",
        aboutTitle: "Acerca de Nosotros",
        aboutDescription: "Lilith Technologies es una empresa de vanguardia que integra investigación, consultoría y desarrollo tecnológico para crear soluciones transformadoras.",
        aboutSectionTitle: "Pioneros en la <span class='highlight'>evolución</span> tecnológica",
        aboutText: "Fundada con la visión de transformar el panorama tecnológico, Lilith Technologies combina investigación de punta con aplicaciones prácticas en diversos sectores. Nuestro enfoque se centra en la evolución constante, la innovación disruptiva y la confiabilidad absoluta.",
        feature1Title: "Investigación General",
        feature1Desc: "Exploramos las fronteras del conocimiento para identificar oportunidades tecnológicas emergentes.",
        feature2Title: "Consultoría Especializada",
        feature2Desc: "Ofrecemos asesoramiento estratégico para la implementación de tecnologías avanzadas en diversos sectores.",
        cardTitle: "Nuestra Filosofía",
        cardText: "Innovación con propósito, tecnología con ética.",
        backCardTitle: "Nuestros Valores",
        
        // Services
        servicesSubtitle: "QUÉ OFRECEMOS",
        servicesTitle: "Servicios que Ofrecemos",
        servicesDescription: "Soluciones tecnológicas avanzadas y multifuncionales diseñadas para impulsar la evolución en diversos sectores.",
        service1Title: "Investigación General",
        service1Desc: "Investigación multidisciplinaria en áreas emergentes de tecnología, explorando aplicaciones prácticas de avances científicos y desarrollando nuevos paradigmas tecnológicos.",
        service2Title: "Consultorías Especializadas",
        service2Desc: "Asesoramiento estratégico en implementación tecnológica, optimización de procesos y transformación digital para organizaciones públicas y privadas.",
        service3Title: "Desarrollo de Software",
        service3Desc: "Creación de aplicaciones y sistemas personalizados, desde software empresarial hasta soluciones especializadas de alto rendimiento y escalabilidad.",
        service4Title: "Sistemas de Defensa",
        service4Desc: "Diseño y desarrollo de tecnologías avanzadas para aplicaciones de defensa y seguridad, cumpliendo con los más altos estándares de calidad y precisión.",
        service5Title: "Gestión de Sistemas",
        service5Desc: "Administración integral de infraestructuras tecnológicas, garantizando disponibilidad, seguridad y rendimiento óptimo en entornos críticos.",
        service6Title: "Soluciones Integradas",
        service6Desc: "Integración de sistemas complejos y desarrollo de arquitecturas tecnológicas unificadas para operaciones de gran escala y alta complejidad.",
        service7Title: "Automatización Inteligente",
        service7Desc: "Implementación de sistemas automatizados con inteligencia artificial para optimizar procesos industriales y operativos.",
        service8Title: "Ciberseguridad Avanzada",
        service8Desc: "Protección integral de activos digitales con tecnologías de vanguardia para prevenir, detectar y responder a amenazas cibernéticas.",
        service9Title: "Infraestructura de Red",
        service9Desc: "Diseño e implementación de redes seguras y eficientes para comunicaciones corporativas, gubernamentales y militares.",
        service10Title: "Gestión de Datos",
        service10Desc: "Soluciones avanzadas para el almacenamiento, procesamiento y análisis de grandes volúmenes de datos con fines estratégicos.",
        service11Title: "Realidad Extendida",
        service11Desc: "Desarrollo de experiencias inmersivas con realidad virtual y aumentada para entrenamiento, simulación y visualización avanzada.",
        service12Title: "Tecnología Espacial",
        service12Desc: "Desarrollo de sistemas y componentes para aplicaciones aeroespaciales y satelitales con tecnología de última generación.",
        
        // Contact
        contactSubtitle: "CONÉCTATE CON NOSOTROS",
        contactTitle: "Contacto",
        contactDescription: "¿Tienes un proyecto en mente? Contáctanos para discutir cómo podemos ayudarte a materializar tu visión.",
        emailTitle: "Email",
        locationTitle: "Ubicación",
        locationLine1: "Centro de Innovación Tecnológica",
        locationLine2: "Zona de Desarrollo Avanzado",
        scheduleTitle: "Disponibilidad",
        scheduleLine1: "Servicio 24/7/365",
        scheduleLine2: "Soporte y consultas en tiempo real",
        followTitle: "Métodos de Contacto",
        emailMethod: "Email Corporativo",
        phoneMethod: "Consultas Prioritarias",
        videoMethod: "Reuniones Virtuales",
        contactReadyTitle: "¿Listo para evolucionar?",
        contactReadyText: "En Lilith Technologies estamos disponibles para atender tus necesidades tecnológicas en cualquier momento. Nuestro equipo está listo para transformar tus ideas en realidades.",
        
        // Footer
        navigationTitle: "Navegación",
        servicesTitleFooter: "Servicios",
        legalTitle: "Legal",
        researchLink: "Investigación",
        consultingLink: "Consultoría",
        softwareLink: "Software",
        systemsLink: "Sistemas",
        termsLink: "Términos de uso",
        privacyLink: "Privacidad",
        confidentialityLink: "Confidencialidad",
        copyright: "© 2023 Lilith Technologies. Todos los derechos reservados.",
        slogan: "Fundador: Sebastián Porras Solano"
    },
    en: {
        home: "Home",
        about: "About",
        services: "Services",
        contact: "Contact",
        
        heroSubtitle: "LILITH TECHNOLOGIES",
        heroTitle: "The architecture of human <span class='highlight'>evolution</span>",
        heroDescription: "Designing the future through research, innovation and specialized consulting. We transform concepts into advanced technological realities.",
        exploreBtn: "Explore more",
        contactBtn: "Contact us",
        
        aboutSubtitle: "WHO WE ARE",
        aboutTitle: "About Us",
        aboutDescription: "Lilith Technologies is a cutting-edge company that integrates research, consulting and technological development to create transformative solutions.",
        aboutSectionTitle: "Pioneers in technological <span class='highlight'>evolution</span>",
        aboutText: "Founded with the vision of transforming the technological landscape, Lilith Technologies combines cutting-edge research with practical applications in various sectors. Our focus is on constant evolution, disruptive innovation and absolute reliability.",
        feature1Title: "General Research",
        feature1Desc: "We explore the frontiers of knowledge to identify emerging technological opportunities.",
        feature2Title: "Specialized Consulting",
        feature2Desc: "We offer strategic advice for the implementation of advanced technologies in various sectors.",
        cardTitle: "Our Philosophy",
        cardText: "Innovation with purpose, technology with ethics.",
        backCardTitle: "Our Values",
        
        servicesSubtitle: "WHAT WE OFFER",
        servicesTitle: "Services We Offer",
        servicesDescription: "Advanced and multifunctional technological solutions designed to drive evolution in various sectors.",
        service1Title: "General Research",
        service1Desc: "Multidisciplinary research in emerging technology areas, exploring practical applications of scientific advances and developing new technological paradigms.",
        service2Title: "Specialized Consulting",
        service2Desc: "Strategic advice on technology implementation, process optimization and digital transformation for public and private organizations.",
        service3Title: "Software Development",
        service3Desc: "Creation of custom applications and systems, from business software to specialized high-performance and scalable solutions.",
        service4Title: "Defense Systems",
        service4Desc: "Design and development of advanced technologies for defense and security applications, meeting the highest standards of quality and precision.",
        service5Title: "Systems Management",
        service5Desc: "Comprehensive management of technological infrastructures, ensuring availability, security and optimal performance in critical environments.",
        service6Title: "Integrated Solutions",
        service6Desc: "Integration of complex systems and development of unified technological architectures for large-scale, high-complexity operations.",
        service7Title: "Intelligent Automation",
        service7Desc: "Implementation of automated systems with artificial intelligence to optimize industrial and operational processes.",
        service8Title: "Advanced Cybersecurity",
        service8Desc: "Comprehensive protection of digital assets with cutting-edge technologies to prevent, detect and respond to cyber threats.",
        service9Title: "Network Infrastructure",
        service9Desc: "Design and implementation of secure and efficient networks for corporate, government and military communications.",
        service10Title: "Data Management",
        service10Desc: "Advanced solutions for storing, processing and analyzing large volumes of data for strategic purposes.",
        service11Title: "Extended Reality",
        service11Desc: "Development of immersive experiences with virtual and augmented reality for training, simulation and advanced visualization.",
        service12Title: "Space Technology",
        service12Desc: "Development of systems and components for aerospace and satellite applications with state-of-the-art technology.",
        
        contactSubtitle: "CONNECT WITH US",
        contactTitle: "Contact",
        contactDescription: "Do you have a project in mind? Contact us to discuss how we can help you materialize your vision.",
        emailTitle: "Email",
        locationTitle: "Location",
        locationLine1: "Technological Innovation Center",
        locationLine2: "Advanced Development Zone",
        scheduleTitle: "Availability",
        scheduleLine1: "24/7/365 Service",
        scheduleLine2: "Real-time support and consultations",
        followTitle: "Contact Methods",
        emailMethod: "Corporate Email",
        phoneMethod: "Priority Inquiries",
        videoMethod: "Virtual Meetings",
        contactReadyTitle: "Ready to evolve?",
        contactReadyText: "At Lilith Technologies we are available to attend to your technological needs at any time. Our team is ready to transform your ideas into realities.",
        
        navigationTitle: "Navigation",
        servicesTitleFooter: "Services",
        legalTitle: "Legal",
        researchLink: "Research",
        consultingLink: "Consulting",
        softwareLink: "Software",
        systemsLink: "Systems",
        termsLink: "Terms of use",
        privacyLink: "Privacy",
        confidentialityLink: "Confidentiality",
        copyright: "© 2023 Lilith Technologies. All rights reserved.",
        slogan: "Founder: Sebastián Porras Solano"
    },
    fr: {
        home: "Accueil",
        about: "À propos",
        services: "Services",
        contact: "Contact",
        
        heroSubtitle: "LILITH TECHNOLOGIES",
        heroTitle: "L'architecture de l'<span class='highlight'>évolution</span> humaine",
        heroDescription: "Concevoir l'avenir grâce à la recherche, l'innovation et le conseil spécialisé. Nous transformons les concepts en réalités technologiques avancées.",
        exploreBtn: "Explorer plus",
        contactBtn: "Nous contacter",
        
        aboutSubtitle: "QUI NOUS SOMMES",
        aboutTitle: "À propos de nous",
        aboutDescription: "Lilith Technologies est une entreprise de pointe qui intègre la recherche, le conseil et le développement technologique pour créer des solutions transformatrices.",
        aboutSectionTitle: "Pionniers de l'<span class='highlight'>évolution</span> technologique",
        aboutText: "Fondée avec la vision de transformer le paysage technologique, Lilith Technologies combine une recherche de pointe avec des applications pratiques dans divers secteurs. Notre approche se concentre sur l'évolution constante, l'innovation disruptive et la fiabilité absolue.",
        feature1Title: "Recherche Générale",
        feature1Desc: "Nous explorons les frontières de la connaissance pour identifier les opportunités technologiques émergentes.",
        feature2Title: "Conseil Spécialisé",
        feature2Desc: "Nous offrons des conseils stratégiques pour la mise en œuvre de technologies avancées dans divers secteurs.",
        cardTitle: "Notre Philosophie",
        cardText: "Innovation avec un but, technologie avec éthique.",
        backCardTitle: "Nos Valeurs",
        
        servicesSubtitle: "CE QUE NOUS OFFRONS",
        servicesTitle: "Services que nous offrons",
        servicesDescription: "Solutions technologiques avancées et multifonctionnelles conçues pour stimuler l'évolution dans divers secteurs.",
        service1Title: "Recherche Générale",
        service1Desc: "Recherche multidisciplinaire dans les domaines technologiques émergents, explorant les applications pratiques des avancées scientifiques et développant de nouveaux paradigmes technologiques.",
        service2Title: "Conseils Spécialisés",
        service2Desc: "Conseil stratégique sur la mise en œuvre technologique, l'optimisation des processus et la transformation numérique pour les organisations publiques et privées.",
        service3Title: "Développement de Logiciels",
        service3Desc: "Création d'applications et de systèmes personnalisés, des logiciels d'entreprise aux solutions spécialisées hautes performances et évolutives.",
        service4Title: "Systèmes de Défense",
        service4Desc: "Conception et développement de technologies avancées pour les applications de défense et de sécurité, répondant aux normes les plus élevées de qualité et de précision.",
        service5Title: "Gestion de Systèmes",
        service5Desc: "Gestion complète des infrastructures technologiques, garantissant disponibilité, sécurité et performances optimales dans des environnements critiques.",
        service6Title: "Solutions Intégrées",
        service6Desc: "Intégration de systèmes complexes et développement d'architectures technologiques unifiées pour des opérations à grande échelle et haute complexité.",
        service7Title: "Automatisation Intelligente",
        service7Desc: "Mise en œuvre de systèmes automatisés avec intelligence artificielle pour optimiser les processus industriels et opérationnels.",
        service8Title: "Cybersécurité Avancée",
        service8Desc: "Protection complète des actifs numériques avec des technologies de pointe pour prévenir, détecter et répondre aux menaces cybernétiques.",
        service9Title: "Infrastructure Réseau",
        service9Desc: "Conception et mise en œuvre de réseaux sécurisés et efficaces pour les communications d'entreprise, gouvernementales et militaires.",
        service10Title: "Gestion des Données",
        service10Desc: "Solutions avancées pour le stockage, le traitement et l'analyse de grands volumes de données à des fins stratégiques.",
        service11Title: "Réalité Étendue",
        service11Desc: "Développement d'expériences immersives avec réalité virtuelle et augmentée pour la formation, la simulation et la visualisation avancée.",
        service12Title: "Technologie Spatiale",
        service12Desc: "Développement de systèmes et de composants pour applications aérospatiales et satellitaires avec technologie de pointe.",
        
        contactSubtitle: "CONNECTEZ-VOUS AVEC NOUS",
        contactTitle: "Contact",
        contactDescription: "Vous avez un projet en tête? Contactez-nous pour discuter de la façon dont nous pouvons vous aider à matérialiser votre vision.",
        emailTitle: "Email",
        locationTitle: "Emplacement",
        locationLine1: "Centre d'Innovation Technologique",
        locationLine2: "Zone de Développement Avancé",
        scheduleTitle: "Disponibilité",
        scheduleLine1: "Service 24/7/365",
        scheduleLine2: "Support et consultations en temps réel",
        followTitle: "Méthodes de Contact",
        emailMethod: "Email Corporatif",
        phoneMethod: "Demandes Prioritaires",
        videoMethod: "Réunions Virtuelles",
        contactReadyTitle: "Prêt à évoluer?",
        contactReadyText: "Chez Lilith Technologies, nous sommes disponibles pour répondre à vos besoins technologiques à tout moment. Notre équipe est prête à transformer vos idées en réalités.",
        
        navigationTitle: "Navigation",
        servicesTitleFooter: "Services",
        legalTitle: "Légal",
        researchLink: "Recherche",
        consultingLink: "Conseil",
        softwareLink: "Logiciel",
        systemsLink: "Systèmes",
        termsLink: "Conditions d'utilisation",
        privacyLink: "Confidentialité",
        confidentialityLink: "Confidentialité",
        copyright: "© 2023 Lilith Technologies. Tous droits réservés.",
        slogan: "Fondateur: Sebastián Porras Solano"
    }
};

// Cambiar idioma
function changeLanguage(lang) {
    // Actualizar atributo lang del HTML para SEO y accesibilidad
    document.documentElement.lang = lang;
    
    // Actualizar botón de idioma
    languageBtnText.textContent = lang.toUpperCase();
    
    // Actualizar todos los textos
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.innerHTML = translations[lang][key];
            }
        }
    });
    
    // Guardar preferencia
    localStorage.setItem('language', lang);
}

// Establecer idioma inicial
const savedLanguage = localStorage.getItem('language') || 'es';
changeLanguage(savedLanguage);

// Añadir event listeners para cambiar idioma
languageOptions.forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.getAttribute('data-lang');
        changeLanguage(lang);
    });
});

// Galaxia Neural Interactiva - Versión simplificada y visualmente atractiva
function initGalaxy() {
    const container = document.getElementById('galaxy-container');
    if (!container) return;
    
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'galaxy-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    // Configuración
    const config = {
        particleCount: 120,
        particleSize: 2,
        connectionDistance: 120,
        mouseRepelRadius: 100,
        mouseRepelStrength: 3,
        speed: 0.5,
        lineOpacity: 0.2,
        primaryColor: getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim() || '#10b981'
    };
    
    // Ajustar tamaño del canvas
    function resizeCanvas() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    
    // Clase Partícula
    class Particle {
        constructor() {
            this.reset();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.size = config.particleSize + Math.random() * 2;
            this.opacity = 0.3 + Math.random() * 0.7;
            this.color = config.primaryColor;
            this.pulse = 0;
            this.pulseSpeed = 0.01 + Math.random() * 0.02;
        }
        
        update(mouse) {
            // Pulsación
            this.pulse += this.pulseSpeed;
            const pulseSize = Math.sin(this.pulse) * 0.5 + 1;
            const currentSize = this.size * pulseSize;
            
            // Interacción con mouse
            if (mouse.x && mouse.y) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.mouseRepelRadius) {
                    const force = (config.mouseRepelRadius - distance) / config.mouseRepelRadius;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force * config.mouseRepelStrength;
                    this.vy += Math.sin(angle) * force * config.mouseRepelStrength;
                }
            }
            
            // Movimiento
            this.x += this.vx;
            this.y += this.vy;
            
            // Rebote en bordes
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Mantener dentro del canvas
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
            
            // Suavizar movimiento
            this.vx *= 0.99;
            this.vy *= 0.99;
            
            return { x: this.x, y: this.y, size: currentSize, opacity: this.opacity };
        }
        
        draw(ctx, state) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, state.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `, ${state.opacity})`).replace('rgb', 'rgba');
            ctx.fill();
            
            // Brillo interior
            ctx.beginPath();
            ctx.arc(state.x, state.y, state.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `, ${state.opacity * 0.8})`).replace('rgb', 'rgba');
            ctx.fill();
        }
    }
    
    // Inicializar partículas
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    container.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    container.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Animación principal
    let animationId;
    function animate() {
        resizeCanvas();
        
        // Fondo con gradiente sutil
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.02)');
        gradient.addColorStop(1, 'rgba(52, 211, 153, 0.01)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Actualizar y dibujar partículas
        const particleStates = particles.map(p => p.update(mouse));
        
        // Dibujar conexiones primero (para que queden detrás)
        ctx.strokeStyle = config.primaryColor.replace(')', `, ${config.lineOpacity})`).replace('rgb', 'rgba');
        ctx.lineWidth = 0.8;
        
        for (let i = 0; i < particleStates.length; i++) {
            for (let j = i + 1; j < particleStates.length; j++) {
                const dx = particleStates[i].x - particleStates[j].x;
                const dy = particleStates[i].y - particleStates[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    const opacity = 1 - (distance / config.connectionDistance);
                    ctx.globalAlpha = opacity * config.lineOpacity;
                    ctx.beginPath();
                    ctx.moveTo(particleStates[i].x, particleStates[i].y);
                    ctx.lineTo(particleStates[j].x, particleStates[j].y);
                    ctx.stroke();
                }
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Dibujar partículas
        particleStates.forEach((state, i) => {
            particles[i].draw(ctx, state);
        });
        
        // Efecto de brillo en partículas cercanas al mouse
        if (mouse.x && mouse.y) {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, config.mouseRepelRadius
            );
            gradient.addColorStop(0, config.primaryColor.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Control de animación para eficiencia
    let isAnimating = true;
    
    // Intersection Observer para pausar cuando no es visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isAnimating = entry.isIntersecting;
            if (isAnimating && !animationId) {
                animationId = requestAnimationFrame(animate);
            } else if (!isAnimating && animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(container);
    
    // Iniciar animación
    resizeCanvas();
    animate();
    
    // Manejar redimensionamiento
    window.addEventListener('resize', () => {
        resizeCanvas();
        particles.forEach(p => {
            if (p.x > canvas.width || p.y > canvas.height) {
                p.reset();
            }
        });
    });
    
    return () => {
        if (animationId) cancelAnimationFrame(animationId);
        observer.disconnect();
    };
}

// Crear partículas flotantes decorativas (opcional)
function createFloatingDots() {
    const container = document.querySelector('.visual-overlay');
    if (!container) return;
    
    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div');
        dot.className = 'floating-dot';
        dot.style.cssText = `
            width: ${3 + Math.random() * 5}px;
            height: ${3 + Math.random() * 5}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            background: var(--primary-color);
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(dot);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar galaxia neural
    setTimeout(initGalaxy, 1000);
    
    // Crear partículas flotantes decorativas
    createFloatingDots();
    
    // Añadir atributos data-translate para multilenguaje
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.setAttribute('data-translate', key);
    });
    
    // Efecto de aparición para elementos al hacer scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    document.querySelectorAll('.service-card, .feature, .info-card').forEach(el => {
        observer.observe(el);
    });
});

// Añadir estilos CSS para animaciones
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .service-card, .feature, .info-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card.animate-in, .feature.animate-in, .info-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .fallback-visual {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
        position: relative;
        overflow: hidden;
    }
    
    .fallback-logo {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: conic-gradient(var(--primary-color), var(--primary-light), var(--primary-color));
        animation: rotate 10s linear infinite;
        position: relative;
        z-index: 2;
    }
    
    .fallback-logo::after {
        content: 'LT';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800;
        font-size: 2.5rem;
        color: white;
    }
    
    .fallback-particles {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    
    .fallback-particles::before,
    .fallback-particles::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: 
            radial-gradient(circle at 20% 30%, var(--primary-color) 2px, transparent 2px),
            radial-gradient(circle at 80% 70%, var(--primary-light) 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, var(--primary-dark) 2px, transparent 2px);
        background-size: 50px 50px;
        animation: moveParticles 20s linear infinite;
    }
    
    .fallback-particles::after {
        animation: moveParticles 15s linear infinite reverse;
        opacity: 0.5;
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes moveParticles {
        from { background-position: 0 0; }
        to { background-position: 100px 100px; }
    }
`;
document.head.appendChild(animationStyles);

// Automatizar el año del copyright
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('[data-translate="footer_copyright"]');
    copyrightElements.forEach(element => {
        const text = element.innerHTML;
        const updatedText = text.replace(/© \d{4}/, `© ${currentYear}`);
        element.innerHTML = updatedText;
    });
}

// Ejecutar la actualización del año al cargar la página
updateCopyrightYear();

// Después de cambiar el idioma, actualizar el año también
const originalChangeLanguage = changeLanguage;
changeLanguage = function(lang) {
    originalChangeLanguage(lang);
    updateCopyrightYear();
};

// IntersectionObserver para pausar/reanudar la animación 3D
let animationRunning = true;
const heroSection = document.querySelector('.hero');
const webglContainer = document.getElementById('webgl-container');

if (heroSection && webglContainer) {
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animationRunning = true;
            } else {
                animationRunning = false;
            }
        });
    }, {
        threshold: 0.1
    });
    
    animationObserver.observe(heroSection);
}