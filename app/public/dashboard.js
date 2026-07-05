const imagesTableBody = document.getElementById('imagesTableBody');
const tableEmptyState = document.getElementById('tableEmptyState');
const dashboardStatus = document.getElementById('dashboardStatus');
const imagesCount = document.getElementById('imagesCount');
const authForm = document.getElementById('authForm');
const adminPassword = document.getElementById('adminPassword');
const authStatus = document.getElementById('authStatus');
const authButton = document.getElementById('authButton');
const createImageButton = document.getElementById('createImageButton');
const imageModal = document.getElementById('imageModal');
const modalClose = document.getElementById('modalClose');
const modalPreviewPanel = document.getElementById('modalPreviewPanel');
const modalFormPanel = document.getElementById('modalFormPanel');
const modalTitle = document.getElementById('modalTitle');
const modalPreviewTitle = document.getElementById('modalPreviewTitle');
const modalPreview = document.getElementById('modalPreview');
const modalPreviewPrice = document.getElementById('modalPreviewPrice');
const modalPreviewDescription = document.getElementById('modalPreviewDescription');
const imageForm = document.getElementById('imageForm');
const formPassword = document.getElementById('formPassword');
const formTitle = document.getElementById('formTitle');
const formPhotoName = document.getElementById('formPhotoName');
const formPrice = document.getElementById('formPrice');
const formDiscount = document.getElementById('formDiscount');
const formDescription = document.getElementById('formDescription');
const formPhoto = document.getElementById('formPhoto');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const ADMIN_PASSWORD = '1234';

let currentImages = [];
let isAuthenticated = false;

const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

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

const buildPriceMarkup = (image) => {
    const pricing = getPricingData(image);

    if (!pricing.hasPrice) {
        return '<span class="text-sm text-brand-soft">Sin precio</span>';
    }

    const basePrice = escapeHtml(formatPrice(pricing.basePrice));
    const finalPrice = escapeHtml(formatPrice(pricing.finalPrice));

    if (pricing.discount > 0) {
        return `
            <div class="space-y-2">
                <div class="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 line-through">${basePrice}</div>
                <div class="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-700">${finalPrice}</div>
            </div>
        `;
    }

    return `<div class="inline-flex rounded-full border border-brand-accent/15 bg-gradient-to-r from-brand-accent/15 to-brand-sage/15 px-3 py-1.5 text-sm font-extrabold text-brand-ink">${basePrice}</div>`;
};

const buildDiscountBadge = (image) => {
    const pricing = getPricingData(image);

    if (!pricing.hasPrice || pricing.discount <= 0) {
        return '<span class="text-sm text-brand-soft">0%</span>';
    }

    return `<span class="inline-flex rounded-full bg-red-600 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">-${pricing.discount}%</span>`;
};

const syncPassword = () => {
    if (formPassword) {
        formPassword.value = adminPassword ? adminPassword.value : '';
    }
};

const setAuthenticatedState = (value) => {
    isAuthenticated = Boolean(value);

    if (createImageButton) {
        createImageButton.classList.toggle('hidden', !isAuthenticated);
    }

    if (authStatus) {
        authStatus.textContent = isAuthenticated
            ? 'Sesión iniciada. Ya puedes crear, editar y eliminar piezas.'
            : 'Ingresa la contraseña para activar los botones de gestión.';
    }

    renderTable(currentImages);
};

const openModal = (mode, image = null) => {
    if (!imageModal || !modalPreviewPanel || !modalFormPanel) {
        return;
    }

    if (mode === 'preview') {
        modalPreviewPanel.classList.remove('hidden');
        modalFormPanel.classList.add('hidden');

        const title = image?.title || image?.original_name || 'Sin título';
        const description = image?.description || 'Pieza disponible en la colección exclusiva de Andrea.';
        const pricing = getPricingData(image || {});

        modalTitle.textContent = title;
        modalPreviewTitle.textContent = title;
        modalPreviewPrice.innerHTML = buildPriceMarkup(image || {});
        modalPreviewPrice.classList.toggle('hidden', !pricing.hasPrice);
        modalPreviewDescription.textContent = description;

        if (image && image.filename) {
            modalPreview.src = `/uploads/${encodeURIComponent(image.filename)}`;
            modalPreview.alt = title;
            modalPreview.classList.remove('hidden');
        }
    } else {
        modalPreviewPanel.classList.add('hidden');
        modalFormPanel.classList.remove('hidden');

        if (!isAuthenticated) {
            window.alert('Primero inicia sesión con la contraseña.');
            return;
        }

        if (!imageForm || !formPhoto || !modalTitle) {
            return;
        }

        imageForm.action = mode === 'edit' && image ? `/edit/${image.id}` : '/upload';
        modalTitle.textContent = mode === 'edit' ? 'Editar pieza' : 'Nueva pieza';
        saveButton.textContent = mode === 'edit' ? 'Guardar cambios' : 'Publicar pieza';
        formPhoto.required = mode !== 'edit';

        formTitle.value = image?.title || '';
        formPhotoName.value = image?.original_name || image?.title || '';
        formPrice.value = image?.price !== null && image?.price !== undefined ? String(image.price) : '';
        formDiscount.value = image?.discount !== null && image?.discount !== undefined ? String(normalizeDiscount(image.discount)) : '0';
        formDescription.value = image?.description || '';
        formPhoto.value = '';

        if (image && image.filename) {
            modalPreview.src = `/uploads/${encodeURIComponent(image.filename)}`;
            modalPreview.alt = image.title || image.original_name || 'Vista previa';
            modalPreview.classList.remove('hidden');
        } else {
            modalPreview.src = '';
            modalPreview.alt = '';
            modalPreview.classList.add('hidden');
        }
    }

    syncPassword();

    imageModal.classList.remove('hidden');
    imageModal.classList.add('flex');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
};

const closeModal = () => {
    if (!imageModal) {
        return;
    }

    imageModal.classList.add('hidden');
    imageModal.classList.remove('flex');
    imageModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
};

const buildRow = (image) => {
    const title = escapeHtml(image.title || image.original_name || 'Sin título');
    const description = escapeHtml(image.description || 'Sin descripción');
    const thumbnail = `/uploads/${encodeURIComponent(image.filename)}`;
    const pricing = getPricingData(image);
    const finalPrice = pricing.hasPrice ? formatPrice(pricing.finalPrice) : '';

    return `
        <tr class="group">
            <td class="rounded-l-[1.5rem] border-y border-l border-slate-200 bg-white px-4 py-4 align-middle shadow-glow">
                <button type="button" class="group block overflow-hidden rounded-2xl border border-slate-200 bg-brand-cream" data-preview-image data-id="${image.id}" aria-label="Ver imagen ${title}">
                    <img src="${thumbnail}" alt="${title}" class="h-20 w-20 object-cover transition duration-300 group-hover:scale-105">
                </button>
            </td>
            <td class="border-y border-slate-200 bg-white px-4 py-4 align-middle shadow-glow">
                <div class="max-w-sm">
                    <h3 class="font-display text-2xl font-semibold text-brand-ink">${title}</h3>
                    <p class="mt-1 text-sm leading-6 text-brand-text">${description}</p>
                    <p class="mt-2 text-xs text-brand-soft">Archivo: ${escapeHtml(image.filename)}</p>
                </div>
            </td>
            <td class="border-y border-slate-200 bg-white px-4 py-4 align-middle shadow-glow">${buildPriceMarkup(image)}</td>
            <td class="border-y border-slate-200 bg-white px-4 py-4 align-middle shadow-glow">${buildDiscountBadge(image)}</td>
            <td class="border-y border-slate-200 bg-white px-4 py-4 align-middle shadow-glow">
                ${pricing.hasPrice ? `<span class="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-700">${escapeHtml(finalPrice)}</span>` : '<span class="text-sm text-brand-soft">Sin precio</span>'}
            </td>
            <td class="border-y border-slate-200 bg-white px-4 py-4 align-middle shadow-glow">
                <span class="text-sm text-brand-text">${escapeHtml(formatDate(image.created_at))}</span>
            </td>
            <td class="rounded-r-[1.5rem] border-y border-r border-slate-200 bg-white px-4 py-4 align-middle text-right shadow-glow">
                ${isAuthenticated ? `
                    <div class="inline-flex items-center gap-2">
                        <button type="button" class="inline-flex items-center justify-center text-blue-600 transition hover:-translate-y-0.5 hover:text-blue-700" data-edit-image data-id="${image.id}" aria-label="Editar">
                            <i class="fa-solid fa-pen-to-square text-xl" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="inline-flex items-center justify-center text-red-600 transition hover:-translate-y-0.5 hover:text-red-700" data-delete-image data-id="${image.id}" aria-label="Eliminar">
                            <i class="fa-solid fa-trash-can text-xl" aria-hidden="true"></i>
                        </button>
                    </div>
                ` : '<span class="inline-flex rounded-full border border-slate-200 bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-soft">Bloqueado</span>'}
            </td>
        </tr>
    `;
};

const renderTable = (images) => {
    currentImages = Array.isArray(images) ? images : [];

    if (imagesCount) {
        imagesCount.textContent = String(currentImages.length);
    }

    if (!imagesTableBody || !tableEmptyState) {
        return;
    }

    if (!currentImages.length) {
        imagesTableBody.innerHTML = '';
        tableEmptyState.classList.remove('hidden');
        return;
    }

    tableEmptyState.classList.add('hidden');
    imagesTableBody.innerHTML = currentImages.map(buildRow).join('');

    imagesTableBody.querySelectorAll('[data-preview-image]').forEach((button) => {
        const image = currentImages.find((item) => String(item.id) === button.dataset.id);
        button.addEventListener('click', () => {
            if (image) {
                openModal('preview', image);
            }
        });
    });

    imagesTableBody.querySelectorAll('[data-edit-image]').forEach((button) => {
        const image = currentImages.find((item) => String(item.id) === button.dataset.id);
        button.addEventListener('click', () => {
            if (image) {
                openModal('edit', image);
            }
        });
    });

    imagesTableBody.querySelectorAll('[data-delete-image]').forEach((button) => {
        const image = currentImages.find((item) => String(item.id) === button.dataset.id);
        button.addEventListener('click', () => {
            if (image) {
                deleteImage(image);
            }
        });
    });
};

const deleteImage = (image) => {
    const confirmed = window.confirm(`¿Eliminar "${image.title || image.original_name || 'esta pieza'}"?`);

    if (!confirmed) {
        return;
    }

    const password = adminPassword ? adminPassword.value : '';
    if (!password) {
        window.alert('Ingresa la contraseña antes de eliminar.');
        adminPassword?.focus();
        return;
    }

    const form = document.createElement('form');
    form.method = 'post';
    form.action = `/delete/${image.id}`;

    const passwordInput = document.createElement('input');
    passwordInput.type = 'hidden';
    passwordInput.name = 'password';
    passwordInput.value = password;
    form.appendChild(passwordInput);

    document.body.appendChild(form);
    form.submit();
};

const loadImages = async () => {
    if (dashboardStatus) {
        dashboardStatus.textContent = 'Cargando contenido...';
    }

    try {
        const response = await fetch('/api/images');
        const images = await response.json();
        renderTable(Array.isArray(images) ? images : []);

        if (dashboardStatus) {
            dashboardStatus.textContent = currentImages.length
                ? 'Puedes editar o borrar cualquier fila desde aquí.'
                : 'No hay registros todavía. Usa "Nueva pieza" para crear el primero.';
        }
    } catch (error) {
        if (dashboardStatus) {
            dashboardStatus.textContent = 'No se pudieron cargar las imágenes.';
        }
        renderTable([]);
    }
};

const authenticate = async (event) => {
    event.preventDefault();

    if (!adminPassword || !authStatus) {
        return;
    }

    const password = adminPassword.value.trim();

    if (!password) {
        authStatus.textContent = 'Ingresa la contraseña para continuar.';
        adminPassword.focus();
        return;
    }

    if (password !== ADMIN_PASSWORD) {
        setAuthenticatedState(false);
        authStatus.textContent = 'Contrasena incorrecta.';
        return;
    }

    if (authButton) {
        authButton.disabled = true;
    }

    try {
        await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ password }).toString()
        });
    } catch (error) {
        console.warn('No se pudo confirmar la autenticacion en el servidor, se activo la interfaz localmente.', error);
    } finally {
        syncPassword();
        setAuthenticatedState(true);
        if (authButton) {
            authButton.disabled = false;
        }
    }
};

if (createImageButton) {
    createImageButton.addEventListener('click', () => openModal('create'));
}

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (cancelButton) {
    cancelButton.addEventListener('click', closeModal);
}

if (imageModal) {
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            closeModal();
        }
    });
}

if (adminPassword) {
    adminPassword.addEventListener('input', syncPassword);
}

if (authForm) {
    authForm.addEventListener('submit', authenticate);
}

if (imageForm) {
    imageForm.addEventListener('submit', () => {
        syncPassword();
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && imageModal && !imageModal.classList.contains('hidden')) {
        closeModal();
    }
});

loadImages();
setAuthenticatedState(false);
