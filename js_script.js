// Hero Carousel
const heroImages = document.querySelectorAll('.hero-image');
const carouselDots = document.querySelectorAll('.carousel-dot');
let currentSlide = 0;

function showSlide(index) {
    heroImages.forEach((img, i) => {
        img.classList.remove('active');
        carouselDots[i].classList.remove('active');
    });

    heroImages[index].classList.add('active');
    carouselDots[index].classList.add('active');
}

// Auto rotate carousel
setInterval(() => {
    currentSlide = (currentSlide + 1) % heroImages.length;
    showSlide(currentSlide);
}, 5000);

// Manual carousel control
carouselDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Show first slide
showSlide(0);

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        hamburger.classList.toggle('active');
    });
}

// Close menu when link is clicked (only on mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        // Only close menu if hamburger is visible (mobile)
        const hamburgerStyle = window.getComputedStyle(hamburger);
        if (hamburgerStyle.display !== 'none') {
            navLinks.style.display = 'none';
            hamburger.classList.remove('active');
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});



const MAX_MESSAGES = 3;
const RESET_HOURS = 24;

// Función para obtener el registro de mensajes por correo
function getMessageLog(email) {
    const key = `murocc_messages_${email}`;
    const stored = localStorage.getItem(key);
    if (!stored) return { count: 0, lastReset: Date.now() };
    return JSON.parse(stored);
}

// Función para guardar el registro de mensajes
function saveMessageLog(email, log) {
    const key = `murocc_messages_${email}`;
    localStorage.setItem(key, JSON.stringify(log));
}

// Función para verificar si puede enviar mensaje
function canSendMessage(email) {
    const log = getMessageLog(email);
    const hoursPassed = (Date.now() - log.lastReset) / (1000 * 60 * 60);

    if (hoursPassed >= RESET_HOURS) {
        log.count = 0;
        log.lastReset = Date.now();
        saveMessageLog(email, log);
    }

    return log.count < MAX_MESSAGES ?
        { allowed: true, remaining: MAX_MESSAGES - log.count } :
        { allowed: false, remaining: 0, resetIn: Math.ceil(RESET_HOURS - hoursPassed) };
}

// Función para registrar envío
function recordMessage(email) {
    const log = getMessageLog(email);
    log.count += 1;
    saveMessageLog(email, log);
}

// Contact Form Handler
const contactFormMain = document.getElementById('contactFormMain');
if (contactFormMain) {
    contactFormMain.addEventListener('submit', (e) => {
        const emailInput = contactFormMain.querySelector('input[name="email"]');
        const statusDiv = document.getElementById('contact_status');

        const email = emailInput.value.trim();

        e.preventDefault(); // Prevenir redirección nativa

        // Verificar límite de mensajes
        const canSend = canSendMessage(email);
        if (!canSend.allowed) {
            statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 14px; margin-top: 10px;"> Límite alcanzado (máx 3 mensajes por 24h). Intenta nuevamente en aproximadamente ${canSend.resetIn} horas.</p>`;
            return;
        }

        // Si puede enviar, mostrar mensaje
        statusDiv.innerHTML = '<p style="color: #FFB74D; font-size: 14px; margin-top: 10px;"> Enviando mensaje...</p>';

        // Enviar datos a Formspree vía AJAX
        fetch(contactFormMain.action, {
            method: 'POST',
            body: new FormData(contactFormMain),
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                recordMessage(email);
                const remaining = canSendMessage(email).remaining;
                statusDiv.innerHTML = `<p style="color: #4CAF50; font-size: 14px; margin-top: 10px;"> ¡Mensaje enviado exitosamente! (Mensajes restantes hoy: ${remaining})</p>`;
                contactFormMain.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 14px; margin-top: 10px;"> Error: ${data.errors.map(error => error.message).join(", ")}</p>`;
                    } else {
                        statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 14px; margin-top: 10px;"> Hubo un problema al enviar tu formulario.</p>`;
                    }
                });
            }
        }).catch(error => {
            statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 14px; margin-top: 10px;"> Error de conexión al enviar el formulario.</p>`;
        });
    });
}

// Contact Form Handler

// CTA Buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function () {
        if (this.textContent.includes('Cotizar') || this.textContent.includes('Pregunta por el Catálogo Completo')) {
            const target = document.querySelector('#contact');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
document.querySelectorAll('.btn-secondary').forEach(btn => {
    btn.addEventListener('click', function () {
        if (this.textContent.includes('Ver Catálogo')) {
            const target = document.querySelector('#catalog');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Scroll Animation for Elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Product Details Modal Handler
const productModal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.close-modal');

// Product data
const productData = {
    andamios: {
        title: 'Andamios y Puntales',
        description: 'Estructuras de andamios metálicos diseñadas para máxima seguridad y resistencia en proyectos de construcción de cualquier escala. Cumple con los estándares internacionales de seguridad.',
        image: 'images/andamios-y-puntales.jpg',
        features: [
            ' Diferentes tipos de andamios de alta resistencia',
            ' Puntales metálicos ajustables',
            ' Seguros y resistentes para cargas pesadas',
            ' Crucetas y tablones de metal para mayor estabilidad',
            ' Sistema de conexión rápida',
            ' Mantenimiento incluido'
        ]
    },
    maquinaria: {
        title: 'Maquinaria Ligera',
        description: 'Equipos versátiles y confiables para acelerar tus procesos constructivos. Toda la maquinaria se mantiene en excelente estado operativo para garantizar el máximo rendimiento en tu proyecto.',
        image: 'images/maquinaria-ligera.jpg',
        features: [
            ' Revolvedoras de concreto automáticas',
            ' Bailarinas para compactación de terreno',
            ' Patines hidráulicos para movimiento de carga',
            ' Equipo en excelente estado operativo',
            ' Operación sencilla y segura',
            ' Disponibilidad inmediata'
        ]
    }
};

// Open modal with product details
document.querySelectorAll('[data-product]').forEach(btn => {
    btn.addEventListener('click', function () {
        const productKey = this.getAttribute('data-product');
        const product = productData[productKey];

        if (product) {
            document.getElementById('modalProductTitle').textContent = product.title;
            document.getElementById('modalProductDescription').textContent = product.description;
            document.getElementById('modalProductImage').src = product.image;
            document.getElementById('modalProductImage').alt = product.title;

            // Agregar nombre del producto al formulario oculto
            document.getElementById('hiddenProductName').value = product.title;

            // Populate features list
            const featuresList = document.getElementById('modalProductFeatures');
            featuresList.innerHTML = '';
            product.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });

            productModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Close modal
function closeModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside of it
productModal.addEventListener('click', function (e) {
    if (e.target === productModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && productModal.classList.contains('active')) {
        closeModal();
    }
});

// Product contact form handler
const productContactFormMain = document.getElementById('productContactFormMain');
if (productContactFormMain) {
    productContactFormMain.addEventListener('submit', (e) => {
        const emailInput = productContactFormMain.querySelector('input[name="email"]');
        const statusDiv = document.getElementById('product_status');

        const email = emailInput.value.trim();

        e.preventDefault(); // Prevenir redirección nativa

        // Verificar límite de mensajes
        const canSend = canSendMessage(email);
        if (!canSend.allowed) {
            statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 13px; margin-top: 10px;"> Límite alcanzado (máx 3 mensajes por 24h). Intenta nuevamente en aproximadamente ${canSend.resetIn} horas.</p>`;
            return;
        }

        // Si puede enviar, mostrar mensaje
        statusDiv.innerHTML = '<p style="color: #FFB74D; font-size: 13px; margin-top: 10px;"> Enviando cotización...</p>';

        // Enviar datos a Formspree vía AJAX
        fetch(productContactFormMain.action, {
            method: 'POST',
            body: new FormData(productContactFormMain),
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                recordMessage(email);
                const remaining = canSendMessage(email).remaining;
                statusDiv.innerHTML = `<p style="color: #4CAF50; font-size: 13px; margin-top: 10px;"> ¡Cotización enviada! (Restantes: ${remaining})</p>`;
                productContactFormMain.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 13px; margin-top: 10px;"> Error: ${data.errors.map(error => error.message).join(", ")}</p>`;
                    } else {
                        statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 13px; margin-top: 10px;"> Hubo un problema al enviar.</p>`;
                    }
                });
            }
        }).catch(error => {
            statusDiv.innerHTML = `<p style="color: #FF6B6B; font-size: 13px; margin-top: 10px;"> Error de conexión al enviar.</p>`;
        });
    });
}

// WhatsApp click limitation by IP
const waButton = document.querySelector('.btn-whatsapp');

if (waButton) {
    function disableWhatsAppBtn() {
        waButton.style.opacity = '0.5';
        waButton.style.cursor = 'not-allowed';
        waButton.style.pointerEvents = 'none';
        waButton.textContent = 'Mensaje ya enviado';
    }

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const currentIP = data.ip;
            const clickedIP = localStorage.getItem('wa_clicked_ip');

            if (clickedIP === currentIP) {
                disableWhatsAppBtn();
            }

            waButton.addEventListener('click', function (e) {
                const storedIP = localStorage.getItem('wa_clicked_ip');

                if (storedIP === currentIP) {
                    e.preventDefault();
                    alert('Ya has iniciado una conversación de WhatsApp desde esta red.');
                } else {
                    localStorage.setItem('wa_clicked_ip', currentIP);
                    setTimeout(disableWhatsAppBtn, 1000); // Disable after a short delay
                }
            });
        })
        .catch(error => {
            console.error('No se pudo verificar la IP', error);
            // Fallback using simple localStorage if API fails
            if (localStorage.getItem('wa_clicked_fallback')) {
                disableWhatsAppBtn();
            }
            waButton.addEventListener('click', function () {
                localStorage.setItem('wa_clicked_fallback', 'true');
                setTimeout(disableWhatsAppBtn, 1000);
            });
        });
}