// Referencias al DOM
const featuredTrack = document.getElementById('featuredTrack');
const featuredDots = document.getElementById('featuredDots');
const featuredCounter = document.getElementById('featuredCounter');
const featuredPrev = document.getElementById('featuredPrev');
const featuredNext = document.getElementById('featuredNext');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const imageModalClose = document.getElementById('imageModalClose');
const imageModalImg = document.getElementById('imageModalImg');
const imageModalTitle = document.getElementById('imageModalTitle');
const imageModalPrice = document.getElementById('imageModalPrice');
const imageModalDescription = document.getElementById('imageModalDescription');
const whatsappNumber = '573112910765';

let featuredSlides = [];
let featuredIndex = 0;
let featuredTimer = null;

const stopFeaturedAutoplay = () => {
    if (featuredTimer) {
        clearInterval(featuredTimer);
        featuredTimer = null;
    }
};

const startFeaturedAutoplay = () => {
    stopFeaturedAutoplay();

    if (featuredSlides.length <= 1) {
        return;
    }

    featuredTimer = setInterval(() => {
        moveFeatured(1);
    }, 5500);
};

const updateFeaturedSlider = () => {
    if (!featuredTrack || !featuredSlides.length) {
        return;
    }

    const viewportWidth = getFeaturedViewportWidth();
    if (!viewportWidth) {
        return;
    }

    featuredTrack.style.transform = `translate3d(-${featuredIndex * viewportWidth}px, 0, 0)`;

    if (featuredCounter) {
        featuredCounter.textContent = `Pieza ${featuredIndex + 1} de ${featuredSlides.length}`;
    }

    if (featuredDots) {
        featuredDots.querySelectorAll('[data-featured-dot]').forEach((dot) => {
            const isActive = Number(dot.dataset.index) === featuredIndex;
            dot.className = isActive
                ? 'h-2.5 w-8 rounded-full bg-brand-accent transition-all duration-300'
                : 'h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-300 hover:bg-slate-400';
            dot.setAttribute('aria-current', String(isActive));
        });
    }
};

const moveFeatured = (step) => {
    if (!featuredSlides.length) {
        return;
    }

    featuredIndex = (featuredIndex + step + featuredSlides.length) % featuredSlides.length;
    updateFeaturedSlider();
};

const pickRandomItems = (items, count) => {
    const pool = Array.isArray(items) ? [...items] : [];

    for (let index = pool.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
    }

    return pool.slice(0, count);
};

const getFeaturedViewportWidth = () => {
    const viewport = featuredTrack?.parentElement;
    return viewport ? viewport.clientWidth : 0;
};

const normalizeDiscount = (value) => {
    const discount = Number(value);
    if (!Number.isFinite(discount)) {
        return 0;
    }

    return Math.min(100, Math.max(0, discount));
};

const getPricingData = (image) => {
    const basePrice = Number(image.price);

    if (!Number.isFinite(basePrice)) {
        return {
            hasPrice: false,
            basePrice: null,
            discount: 0,
            finalPrice: null
        };
    }

    const discount = normalizeDiscount(image.discount ?? 0);

    return {
        hasPrice: true,
        basePrice,
        discount,
        finalPrice: discount > 0 ? basePrice * (1 - (discount / 100)) : basePrice
    };
};

const buildPriceMarkup = (image, variant = 'card') => {
    const pricing = getPricingData(image);

    if (!pricing.hasPrice) {
        return '';
    }

    const basePrice = escapeHtml(formatPrice(pricing.basePrice));
    const finalPrice = escapeHtml(formatPrice(pricing.finalPrice));

    if (pricing.discount > 0) {
        const valueSize = variant === 'modal' ? 'text-base' : 'text-sm';
        const labelSize = variant === 'modal' ? 'text-xs' : 'text-[10px]';

        return `
            <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 line-through">${basePrice}</span>
                    <span class="rounded-full bg-red-600 px-2.5 py-1 font-bold uppercase tracking-[0.2em] text-white ${labelSize}">-${pricing.discount}%</span>
                </div>
                <div class="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-extrabold text-emerald-700 ${valueSize}">${finalPrice}</div>
            </div>
        `;
    }

    const textSize = variant === 'modal' ? 'text-base' : 'text-sm';

    return `
        <div class="inline-flex rounded-full border border-brand-accent/15 bg-gradient-to-r from-brand-accent/15 to-brand-sage/15 px-3 py-1.5 font-extrabold text-brand-ink ${textSize}">
            ${basePrice}
        </div>
    `;
};

const buildDiscountBadge = (image) => {
    const pricing = getPricingData(image);

    if (!pricing.hasPrice || pricing.discount <= 0) {
        return '';
    }

    return `
        <div class="absolute left-3 top-3 rounded-full bg-red-600/95 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white shadow-lg">
            -${pricing.discount}% off
        </div>
    `;
};

const openImageModal = (image) => {
    if (!imageModal || !imageModalImg || !imageModalTitle || !imageModalPrice || !imageModalDescription) {
        return;
    }

    const title = image.title || image.original_name || 'Sin título';
    const description = image.description || 'Pieza disponible en la colección de Bohemian Collections.';
    const pricing = getPricingData(image);

    imageModalImg.src = `/uploads/${encodeURIComponent(image.filename)}`;
    imageModalImg.alt = title;
    imageModalTitle.textContent = title;
    imageModalPrice.innerHTML = buildPriceMarkup(image, 'modal');
    imageModalPrice.classList.toggle('hidden', !pricing.hasPrice);
    imageModalDescription.textContent = description;

    imageModal.classList.remove('hidden');
    imageModal.classList.add('flex');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
};

const closeImageModal = () => {
    if (!imageModal || !imageModalImg) {
        return;
    }

    imageModal.classList.add('hidden');
    imageModal.classList.remove('flex');
    imageModal.setAttribute('aria-hidden', 'true');
    imageModalImg.src = '';
    imageModalImg.alt = '';
    if (imageModalPrice) {
        imageModalPrice.innerHTML = '';
        imageModalPrice.classList.add('hidden');
    }
    document.body.classList.remove('overflow-hidden');
};

// Función para escapar HTML y evitar inyección XSS
const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// Formatear fecha
const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value || '';
    }

    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};

// Formatear precio
const formatPrice = (value) => {
    const price = Number(value);
    if (!Number.isFinite(price)) {
        return '';
    }

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);
};

// Crear enlace de WhatsApp con icono
const createWhatsappLink = (image) => {
    const productName = image.title || image.original_name || 'esta pieza';
    const pricing = getPricingData(image);
    const priceText = pricing.hasPrice
        ? (pricing.discount > 0
            ? ` por ${formatPrice(pricing.finalPrice)} con ${pricing.discount}% de descuento`
            : ` por ${formatPrice(pricing.basePrice)}`)
        : '';
    const message = `Hola, me interesa ${productName}${priceText}.`;

    return `
        <a class="inline-flex items-center justify-center p-1 text-emerald-600 transition hover:-translate-y-0.5 hover:text-emerald-700"
           href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}"
           target="_blank"
           rel="noreferrer">
            ${window.appIcons?.whatsapp || ''}
            <span class="sr-only">Preguntar por WhatsApp</span>
        </a>
    `;
};

const renderFeaturedEmpty = () => {
    if (!featuredTrack) {
        return;
    }

    featuredTrack.innerHTML = `
        <div class="min-w-full shrink-0 p-4 sm:p-6">
            <div class="flex min-h-[22rem] items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/85 p-8 text-center">
                <div class="max-w-xl">
                    <p class="text-xs font-extrabold uppercase tracking-[0.28em] text-brand-sage">Selección bohemia</p>
                    <h3 class="mt-3 font-display text-3xl font-semibold text-brand-ink sm:text-4xl">Aún no hay piezas para destacar</h3>
                    <p class="mt-3 text-sm leading-7 text-brand-text">Cuando subas productos, aquí aparecerán cinco piezas elegidas al azar en cada carga.</p>
                </div>
            </div>
        </div>
    `;

    if (featuredDots) {
        featuredDots.innerHTML = '';
    }

    if (featuredCounter) {
        featuredCounter.textContent = '';
    }

    stopFeaturedAutoplay();
};

const renderFeaturedSlider = (images) => {
    if (!featuredTrack) {
        return;
    }

    featuredSlides = pickRandomItems(images, 5);

    if (!featuredSlides.length) {
        renderFeaturedEmpty();
        return;
    }

    featuredIndex = 0;

    featuredTrack.innerHTML = featuredSlides.map((image, index) => `
        <article class="w-full min-w-full shrink-0">
            <div class="grid min-h-[30rem] items-stretch lg:min-h-[36rem] lg:grid-cols-2">
                <div class="flex min-h-[18rem] items-center justify-center overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white to-brand-sand/70 p-5 lg:min-h-full lg:border-b-0 lg:border-r">
                    <button class="group block cursor-zoom-in" type="button" data-modal-image data-id="${image.id}" aria-label="Ampliar ${escapeHtml(image.title || image.original_name || 'foto destacada')}">
                        <img class="max-h-[26rem] w-auto max-w-full rounded-[1.25rem] object-contain shadow-[0_16px_32px_rgba(42,55,64,0.10)] transition duration-300 group-hover:scale-[1.01]" src="/uploads/${encodeURIComponent(image.filename)}" alt="${escapeHtml(image.title || image.original_name || 'Foto destacada')}">
                    </button>
                </div>
                <div class="flex h-full items-center bg-white p-6 sm:p-8 lg:p-10">
                    <div class="max-w-xl">
                        <h3 class="featured-slide-title font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">${escapeHtml(image.title || image.original_name || 'Sin título')}</h3>
                        <p class="mt-5 text-base leading-8 text-brand-text">${escapeHtml(image.description || 'Pieza disponible en la colección de Bohemian Collections.')}</p>
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    if (featuredDots) {
        featuredDots.innerHTML = featuredSlides.map((_, index) => `
            <button
                class="${index === 0 ? 'h-2.5 w-8 rounded-full bg-brand-accent transition-all duration-300' : 'h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-300 hover:bg-slate-400'}"
                type="button"
                data-featured-dot
                data-index="${index}"
                aria-label="Ir a la pieza ${index + 1}"
                aria-current="${index === 0 ? 'true' : 'false'}"
            ></button>
        `).join('');

        featuredDots.querySelectorAll('[data-featured-dot]').forEach((button) => {
            button.addEventListener('click', () => {
                featuredIndex = Number(button.dataset.index) || 0;
                updateFeaturedSlider();
                startFeaturedAutoplay();
            });
        });
    }

    featuredTrack.querySelectorAll('[data-modal-image]').forEach((button) => {
        const image = featuredSlides.find((item) => String(item.id) === button.dataset.id);

        button.addEventListener('click', () => {
            if (image) {
                openImageModal(image);
            }
        });
    });

    updateFeaturedSlider();
    startFeaturedAutoplay();
};

// Renderizar estado vacío
const renderEmpty = () => {
    gallery.innerHTML = `
        <div class="sm:col-span-2 xl:col-span-3">
            <div class="mx-auto max-w-2xl rounded-[1.75rem] border border-dashed border-slate-300 bg-gradient-to-b from-white to-brand-sand/70 p-10 text-center shadow-sm">
                <h3 class="font-display text-3xl font-semibold text-brand-ink sm:text-4xl">La colección aún no ha sido publicada</h3>
                <p class="mt-3 text-sm leading-7 text-brand-text">Pronto aparecerán aquí los accesorios seleccionados para Bohemian Collections.</p>
            </div>
        </div>
    `;
};

// Renderizar imágenes
const renderImages = (images) => {
    if (!images.length) {
        renderEmpty();
        return;
    }

    gallery.innerHTML = images.map((image) => `
        <article class="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-glow transition duration-200 hover:-translate-y-1 hover:border-brand-accent/25 hover:shadow-soft">
            <div class="relative overflow-hidden">
                ${buildDiscountBadge(image)}
                <button class="block w-full cursor-zoom-in" type="button" data-modal-image data-id="${image.id}" aria-label="Ampliar ${escapeHtml(image.title || image.original_name || 'foto de galería')}">
                    <img class="aspect-[3/4] w-full object-cover bg-slate-100 transition duration-500 group-hover:scale-[1.01]" src="/uploads/${encodeURIComponent(image.filename)}" alt="${escapeHtml(image.title || image.original_name || 'Foto de galería')}">
                </button>
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>
            </div>
            <div class="flex flex-1 flex-col p-4">
                <h3 class="font-display text-2xl font-semibold leading-tight text-brand-ink">${escapeHtml(image.title || image.original_name || 'Sin título')}</h3>
                <p class="mt-2 text-sm leading-6 text-brand-text">${escapeHtml(image.description || 'Pieza disponible en la colección de Bohemian Collections.')}</p>
                <div class="mt-3">${buildPriceMarkup(image, 'card')}</div>
                <div class="mt-3 text-xs text-slate-400">${formatDate(image.created_at)}</div>
                <div class="mt-auto flex items-center gap-3 pt-4">
                    ${createWhatsappLink(image)}
                </div>
            </div>
        </article>
    `).join('');

    gallery.querySelectorAll('[data-modal-image]').forEach((button) => {
        const image = images.find((item) => String(item.id) === button.dataset.id);

        button.addEventListener('click', () => {
            if (image) {
                openImageModal(image);
            }
        });
    });
};

if (featuredPrev) {
    featuredPrev.addEventListener('click', () => {
        moveFeatured(-1);
        startFeaturedAutoplay();
    });
}

if (featuredNext) {
    featuredNext.addEventListener('click', () => {
        moveFeatured(1);
        startFeaturedAutoplay();
    });
}

const featuredSection = featuredTrack ? featuredTrack.closest('section') : null;
if (featuredSection) {
    featuredSection.addEventListener('mouseenter', stopFeaturedAutoplay);
    featuredSection.addEventListener('mouseleave', startFeaturedAutoplay);
}

if (imageModalClose) {
    imageModalClose.addEventListener('click', closeImageModal);
}

if (imageModal) {
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && imageModal && !imageModal.classList.contains('hidden')) {
        closeImageModal();
    }
});

window.addEventListener('resize', () => {
    if (featuredSlides.length) {
        updateFeaturedSlider();
    }
});

// Cargar imágenes al iniciar
fetch('/api/images')
    .then((response) => response.json())
    .then((images) => {
        const safeImages = Array.isArray(images) ? images : [];
        renderFeaturedSlider(safeImages);
        renderImages(safeImages);
    })
    .catch(() => {
        renderFeaturedEmpty();
        renderEmpty();
    });
