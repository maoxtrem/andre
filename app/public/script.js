// Referencias al DOM
const gallery = document.getElementById('gallery');
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const whatsappNumber = '573112910765';

// Toggle del panel de administración
adminToggle.addEventListener('click', () => {
    const isOpen = adminPanel.classList.toggle('is-open');
    adminPanel.setAttribute('aria-hidden', String(!isOpen));
    adminToggle.setAttribute('aria-expanded', String(isOpen));
    adminToggle.textContent = isOpen ? 'Ocultar gestión privada' : 'Gestión privada de piezas';
});

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
    const priceText = image.price !== null && image.price !== undefined ? ` por ${formatPrice(image.price)}` : '';
    const message = `Hola Andrea, me interesa ${productName}${priceText}.`;

    const icon = document.createElement('i');
    icon.className = 'fa-brands fa-whatsapp';
    icon.style.color = 'white';

    const text = document.createElement('span');
    text.className = 'fw-semibold';
    text.textContent = 'Preguntar por WhatsApp';

    const link = document.createElement('a');
    link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.className = 'btn btn-whatsapp rounded-pill fw-semibold';
    link.appendChild(icon);
    link.appendChild(text);
    
    return link;
};

// Eliminar imagen
const deleteImage = (id) => {
    const password = window.prompt('Contraseña para eliminar la foto:');

    if (password === null) {
        return;
    }

    const form = document.createElement('form');
    form.method = 'post';
    form.action = `/delete/${id}`;

    const passwordInput = document.createElement('input');
    passwordInput.type = 'hidden';
    passwordInput.name = 'password';
    passwordInput.value = password;

    form.appendChild(passwordInput);
    document.body.appendChild(form);
    form.submit();
};

// Editar imagen
const editImage = (image) => {
    const password = window.prompt('Contraseña para editar la pieza:');
    if (password === null) {
        return;
    }

    const title = window.prompt('Nuevo título de la pieza:', image.title || image.original_name || '');
    if (title === null) {
        return;
    }

    const description = window.prompt('Nueva descripción:', image.description || '');
    if (description === null) {
        return;
    }

    const currentPrice = image.price !== null && image.price !== undefined ? String(image.price) : '';
    const price = window.prompt('Nuevo precio:', currentPrice);
    if (price === null) {
        return;
    }

    const form = document.createElement('form');
    form.method = 'post';
    form.action = `/edit/${image.id}`;

    const fields = { password, title, description, price };

    Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};

// Renderizar estado vacío
const renderEmpty = () => {
    gallery.innerHTML = `
        <div class="col-12">
            <div class="empty-state p-5 text-center">
                <h3 class="h4 mb-3 text-body-emphasis">La colección aún no ha sido publicada</h3>
                <p class="mb-0 text-body-secondary">Pronto aparecerán aquí las piezas exclusivas seleccionadas por Andrea.</p>
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
        <div class="col-sm-6 col-xl-4">
            <article class="gallery-card">
                <img class="gallery-image" src="/uploads/${encodeURIComponent(image.filename)}" alt="${escapeHtml(image.title || image.original_name || 'Foto de galería')}">
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title mb-2">${escapeHtml(image.title || image.original_name || 'Sin título')}</h3>
                    <p class="card-copy mb-3">${escapeHtml(image.description || 'Pieza disponible en la colección exclusiva de Andrea.')}</p>
                    ${image.price !== null && image.price !== undefined ? `<div class="price-tag mb-3">${escapeHtml(formatPrice(image.price))}</div>` : ''}
                    <div class="card-date small mb-4">${formatDate(image.created_at)}</div>
                    <div class="card-actions d-grid gap-2 mt-auto">
                        <a class="btn btn-whatsapp rounded-pill fw-semibold" href="${createWhatsappLink(image).href}" target="_blank" rel="noreferrer">${createWhatsappLink(image).innerHTML}</a>
                        <button class="btn btn-wood rounded-pill fw-semibold edit-button" type="button" data-id="${image.id}">Editar pieza</button>
                        <button class="btn btn-outline-aged rounded-pill fw-semibold delete-button" type="button" data-id="${image.id}">Eliminar pieza</button>
                    </div>
                </div>
            </article>
        </div>
    `).join('');

    // Delegación de eventos para botones de editar y eliminar
    gallery.querySelectorAll('.edit-button').forEach((button) => {
        const image = images.find((item) => String(item.id) === button.dataset.id);
        button.addEventListener('click', () => editImage(image));
    });

    gallery.querySelectorAll('.delete-button').forEach((button) => {
        button.addEventListener('click', () => deleteImage(button.dataset.id));
    });
};

// Cargar imágenes al iniciar
fetch('/api/images')
    .then((response) => response.json())
    .then((images) => renderImages(images))
    .catch(() => renderEmpty());
