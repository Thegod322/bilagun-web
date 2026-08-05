document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initHeroSlider();
    initContactForm();
    initMobileMenu();
    initLightbox();
    
    if (document.getElementById('dogs-grid')) {
        initDogsGrid();
    }
});

// Header scroll effect
function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header || header.classList.contains('static-header')) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('.main-nav');
    const siteHeader = document.querySelector('.site-header');
    
    if (menuToggle && mainNav && siteHeader) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            mainNav.classList.toggle('is-active');
            siteHeader.classList.toggle('menu-open');
        });
        
        // Close menu when clicking a link
        const links = mainNav.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                mainNav.classList.remove('is-active');
                siteHeader.classList.remove('menu-open');
            });
        });
    }
}

// Hero Slider
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length === 0) return;

    // Start the first slide animation
    slides[0].classList.add('animating');

    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        
        currentSlide = (currentSlide + 1) % slides.length;
        const nextSlide = slides[currentSlide];
        
        // Force reflow to restart CSS animation from 0
        nextSlide.classList.remove('animating');
        void nextSlide.offsetWidth; 
        nextSlide.classList.add('animating');
        nextSlide.classList.add('active');
    }, 12000);
}

// Fetch Dogs
async function fetchDogs() {
    try {
        const response = await fetch('/dogs_database.json');
        if (!response.ok) throw new Error("Database not found");
        const rawDogs = await response.json();
        
        // Map new JSON structure to the expected UI structure
        const dogsWithImages = rawDogs.filter(dog => dog.images && dog.images.length > 0);
        return dogsWithImages.map((dog) => {
            const dogId = dog.id || dog.name.toLowerCase().replace(/\s+/g, '-');
            const category = dog.category || (dog.gender ? dog.gender.toLowerCase() : 'macho');
            
            return {
                id: dogId,
                name: dog.name,
                sex: dog.gender || dog.sex || '',
                category: category,
                images: dog.images,
                image: dog.images[0],
                birthDate: dog.birthDate || 'Desconocido',
                sire: dog.sire || 'Desconocido',
                dam: dog.dam || 'Desconocido',
                titles: (dog.titles && dog.titles !== 'N/A') ? [dog.titles] : [],
                description: dog.otherInfo || dog.description || ''
            };
        });
    } catch (error) {
        console.error("Error fetching dogs:", error);
        return [];
    }
}

// Dogs Grid & Filtering
async function initDogsGrid() {
    const dogs = await fetchDogs();
    const grid = document.getElementById('dogs-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function renderDogs(filter) {
        grid.innerHTML = '';
        const filteredDogs = filter === 'all' 
            ? dogs 
            : dogs.filter(dog => dog.category.toLowerCase() === filter.toLowerCase());

        filteredDogs.forEach(dog => {
            const card = document.createElement('a');
            card.href = `/dog/${dog.id}`;
            card.className = 'dog-card';
            
            // Check if dog.image exists, else placeholder. Serve thumbnail.
            const imgSrc = (dog.image && dog.image.replace('compressed-for-web-page', 'thumbnails')) || 'assets/default.jpg';
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${dog.name}" class="dog-image" loading="lazy">
                <div class="dog-info">
                    <h3>${dog.name}</h3>
                    <p>${dog.titles && dog.titles.length > 0 ? dog.titles[0] : ''}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderDogs('all');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderDogs(e.target.dataset.filter);
        });
    });
}

// Load Dog Page
async function loadDogPage() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let id = null;
    if (pathParts[0] === 'dog' && pathParts[1]) {
        id = pathParts[1];
    }
    if (!id) {
        // Fallback: check hash for backward compatibility
        id = window.location.hash.substring(1);
    }
    if (!id) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
    }
    const detailsContainer = document.getElementById('dog-details');
    
    if (!id) {
        detailsContainer.innerHTML = '<p style="color:white; margin: auto;">Ejemplar no encontrado.</p>';
        return;
    }

    const dogs = await fetchDogs();
    const dogIndex = dogs.findIndex(d => d.id === id);
    const dog = dogs[dogIndex];

    if (!dog) {
        detailsContainer.innerHTML = '<p style="color:white; margin: auto;">Ejemplar no encontrado.</p>';
        return;
    }

    // Set page title
    document.title = `Bilagun | ${dog.name}`;

    // Update meta description dynamically
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', `Conoce a ${dog.name}, pastor alemán de pura raza del criadero Bi Lagun en Donostia, País Vasco.`);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.setAttribute('href', `https://bilagun.com/dog/${dog.id}`);
    }

    // Inject BreadcrumbList JSON-LD
    const existingBreadcrumb = document.querySelector('script[data-schema="breadcrumb"]');
    if (existingBreadcrumb) existingBreadcrumb.remove();
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb');
    breadcrumbScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://bilagun.com/" },
            { "@type": "ListItem", "position": 2, "name": dog.name, "item": `https://bilagun.com/dog/${dog.id}` }
        ]
    });
    document.head.appendChild(breadcrumbScript);

    let titlesHtml = '';
    if (dog.titles && dog.titles.length > 0) {
        titlesHtml = `<li><strong>Títulos:</strong> ${dog.titles.join(', ')}</li>`;
    }

    // Build Gallery Thumbs
    let galleryHtml = '';
    if (dog.images && dog.images.length > 0) {
        const thumbs = dog.images.map((img, idx) => {
            const activeClass = idx === 0 ? 'active' : '';
            return `<img src="${img}" class="immersive-thumb ${activeClass}" onclick="changeImmersiveImage('${img}', this)" alt="Foto de ${dog.name}">`;
        }).join('');
        
        galleryHtml = `
            <div class="immersive-gallery-nav">
                ${thumbs}
            </div>
        `;
    }

    let nextHtml = '';
    if (dogs.length > 1) {
        const nextIndex = (dogIndex + 1) % dogs.length;
        const nextDog = dogs[nextIndex];
        nextHtml = `<a href="/dog/${nextDog.id}" class="immersive-back" style="margin-left: 10px;">Siguiente: ${nextDog.name} →</a>`;
    }

    const mainImage = (dog.images && dog.images.length > 0) ? dog.images[0] : 'assets/default.jpg';

    detailsContainer.innerHTML = `
        <img src="${mainImage}" class="immersive-bg" id="immersive-bg" alt="${dog.name}">
        <div class="immersive-overlay"></div>
        <div class="immersive-content">
            <div class="immersive-info">
                <h1>${dog.name}</h1>
                <div class="dog-meta-row" style="display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                    <p class="subtitle" style="margin-bottom: 0;">${dog.sex}</p>
                    <details class="dog-details-collapse" style="margin-top: 0; flex: 1; min-width: 250px;">
                        <summary>Ver Detalles</summary>
                        <div class="collapse-content">
                            <ul class="immersive-meta">
                                <li><strong>Fecha de Nacimiento:</strong> ${dog.birthDate}</li>
                                <li><strong>Padre:</strong> ${dog.sire}</li>
                                <li><strong>Madre:</strong> ${dog.dam}</li>
                                ${titlesHtml}
                            </ul>
                            <div class="dog-description" style="color: #E0E0E0;">
                                <p>${dog.description || ''}</p>
                            </div>
                        </div>
                    </details>
                </div>
                
                <div class="next-dog-nav" style="display: flex; justify-content: flex-end;">
                    ${nextHtml}
                </div>
            </div>
            
            ${galleryHtml}
        </div>
    `;
    
    // Start auto-advance timer if there are multiple photos
    window.startImmersiveGalleryTimer();
}

// Global function for the slider click event
window.changeImmersiveImage = function(src, thumbElement) {
    const bg = document.getElementById('immersive-bg');
    bg.style.opacity = 0; // fade out
    setTimeout(() => {
        bg.src = src;
        
        // Reset CSS animation so it starts from 0% again
        bg.style.animation = 'none';
        bg.offsetHeight; // trigger reflow
        bg.style.animation = null;
        
        bg.style.opacity = 1; // fade in
    }, 300); // match CSS transition duration (e.g. 0.3s-0.6s)
    
    // Update active thumb
    document.querySelectorAll('.immersive-thumb').forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
    
    // Restart auto-advance timer
    window.startImmersiveGalleryTimer();
};

window.startImmersiveGalleryTimer = function() {
    clearTimeout(window.immersiveGalleryTimer);
    const thumbs = document.querySelectorAll('.immersive-thumb');
    if (thumbs.length > 1) {
        window.immersiveGalleryTimer = setTimeout(() => {
            const activeThumb = document.querySelector('.immersive-thumb.active');
            if (activeThumb) {
                let nextThumb = activeThumb.nextElementSibling;
                if (!nextThumb) {
                    nextThumb = thumbs[0]; // Loop back to the first photo
                }
                if (nextThumb) {
                    nextThumb.click(); // Trigger changeImmersiveImage
                }
            }
        }, 12000); // 12 seconds to match the CSS animation
    }
};

// Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    
    // Also handling modal just in case to close it if opened manually or existing layout needs it,
    // although we are moving to div messages.
    const modal = document.getElementById('success-modal');
    const closeBtn = document.getElementById('close-modal');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    if (!form || !formMessage) return;
    
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        formMessage.style.display = 'none';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                formMessage.textContent = '¡Mensaje enviado con éxito!';
                formMessage.style.backgroundColor = '#d4edda';
                formMessage.style.color = '#155724';
                formMessage.style.display = 'block';
                form.reset();
                if (modal) {
                    modal.classList.add('active'); // Keep the original modal behavior too as a bonus or instead
                }
            } else {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al enviar el mensaje');
            }
        } catch (error) {
            formMessage.textContent = error.message;
            formMessage.style.backgroundColor = '#f8d7da';
            formMessage.style.color = '#721c24';
            formMessage.style.display = 'block';
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// Lightbox logic
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const wrapper = document.getElementById('lightbox-wrapper');
    if (!lightbox || !lightboxImg || !closeBtn || !wrapper) return;

    let currentScale = 1;
    let translateX = 0;
    let translateY = 0;

    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }

    function updateTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }

    function openLightbox(src) {
        lightboxImg.src = src;
        resetZoom();
        lightbox.classList.add('active');
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('immersive-overlay') || 
            e.target.classList.contains('immersive-bg') || 
            e.target.classList.contains('immersive-content') ||
            e.target.id === 'dog-details') {
            const bg = document.getElementById('immersive-bg');
            if (bg) {
                openLightbox(bg.src);
            }
        }
    });

    closeBtn.addEventListener('click', closeLightbox);

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        if (e.deltaY < 0) {
            currentScale += zoomSpeed;
        } else {
            currentScale -= zoomSpeed;
        }
        currentScale = Math.max(1, Math.min(currentScale, 5));
        
        if (currentScale === 1) {
            translateX = 0;
            translateY = 0;
        }
        updateTransform();
    });

    let isDragging = false;
    let startX = 0, startY = 0;
    
    let initialDistance = null;
    let initialScale = 1;

    wrapper.addEventListener('mousedown', (e) => {
        if (currentScale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging && currentScale > 1) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    function getDistance(touches) {
        return Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );
    }

    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = getDistance(e.touches);
            initialScale = currentScale;
            isDragging = false;
        } else if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    });

    wrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            const scaleChange = currentDistance / initialDistance;
            currentScale = Math.max(1, Math.min(initialScale * scaleChange, 5));
            if (currentScale === 1) {
                translateX = 0;
                translateY = 0;
            }
            updateTransform();
        } else if (e.touches.length === 1 && isDragging) {
            if (currentScale === 1) {
                const deltaY = e.touches[0].clientY - (startY + translateY);
                if (deltaY > 50) {
                    closeLightbox();
                }
            } else {
                e.preventDefault();
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                updateTransform();
            }
        }
    }, { passive: false });

    wrapper.addEventListener('touchend', (e) => {
        isDragging = false;
        initialDistance = null;
    });
}

