const express = require('express');
const multer = require('multer');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const publicDir = path.join(__dirname, 'public');
const ADMIN_PASSWORD = '1234';

const slugify = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const parsePrice = (rawValue) => {
    const normalizedPrice = rawValue ? rawValue.trim().replace(',', '.') : '';

    if (!normalizedPrice) {
        return { value: null };
    }

    const price = Number(normalizedPrice);
    if (!Number.isFinite(price) || price < 0) {
        return { error: 'El precio debe ser un numero valido.' };
    }

    return { value: price };
};

const parseDiscount = (rawValue) => {
    const normalizedDiscount = rawValue ? rawValue.trim().replace(',', '.') : '';

    if (!normalizedDiscount) {
        return { value: 0 };
    }

    const discount = Number(normalizedDiscount);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
        return { error: 'El descuento debe estar entre 0 y 100.' };
    }

    return { value: discount };
};

// Asegurar que las carpetas existan al arrancar
if (!fs.existsSync('/uploads')) fs.mkdirSync('/uploads', { recursive: true });
if (!fs.existsSync('/data')) fs.mkdirSync('/data', { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Conectar a SQLite (creará el archivo gallery.db si no existe)
const db = new Database('/data/gallery.db');

// Crear la tabla si no existe
db.prepare(`
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT,
        title TEXT,
        description TEXT,
        mime_type TEXT,
        price REAL,
        discount REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

const imageColumns = db.prepare('PRAGMA table_info(images)').all().map((column) => column.name);

if (!imageColumns.includes('original_name')) {
    db.prepare('ALTER TABLE images ADD COLUMN original_name TEXT').run();
}
if (!imageColumns.includes('title')) {
    db.prepare('ALTER TABLE images ADD COLUMN title TEXT').run();
}
if (!imageColumns.includes('description')) {
    db.prepare('ALTER TABLE images ADD COLUMN description TEXT').run();
}
if (!imageColumns.includes('mime_type')) {
    db.prepare('ALTER TABLE images ADD COLUMN mime_type TEXT').run();
}
if (!imageColumns.includes('price')) {
    db.prepare('ALTER TABLE images ADD COLUMN price REAL').run();
}
if (!imageColumns.includes('discount')) {
    db.prepare('ALTER TABLE images ADD COLUMN discount REAL DEFAULT 0').run();
}

// Configurar Multer para guardar las fotos con un nombre único
const storage = multer.diskStorage({
    destination: '/uploads/',
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const sourceName = req.body.photo_name || req.body.title || 'pieza';
        const safeBaseName = slugify(sourceName) || 'pieza';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${safeBaseName}-${uniqueSuffix}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten imagenes.'));
        }
        cb(null, true);
    }
});

// Servir archivos estáticos del frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(publicDir));

// Servir la carpeta de subidas para que se vean las fotos
app.use('/uploads', express.static('/uploads'));

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(publicDir, 'dashboard.html'));
});

app.post('/api/auth', (req, res) => {
    const password = req.body.password ? req.body.password.trim() : '';

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ ok: false, message: 'Contrasena incorrecta.' });
    }

    return res.json({ ok: true });
});

// RUTA: Subir imagen
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ninguna imagen.');
    }

    const title = req.body.title ? req.body.title.trim() : '';
    const description = req.body.description ? req.body.description.trim() : '';
    const priceResult = parsePrice(req.body.price);
    const discountResult = parseDiscount(req.body.discount);

    if (priceResult.error) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).send(priceResult.error);
    }
    if (discountResult.error) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).send(discountResult.error);
    }

    const stmt = db.prepare(`
        INSERT INTO images (filename, original_name, title, description, mime_type, price, discount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        req.file.filename,
        req.file.originalname,
        title || null,
        description || null,
        req.file.mimetype,
        priceResult.value,
        discountResult.value
    );

    res.redirect('/dashboard');
});

app.post('/edit/:id', upload.single('photo'), (req, res) => {
    const imageId = Number(req.params.id);
    const password = req.body.password ? req.body.password.trim() : '';

    if (!Number.isInteger(imageId) || imageId <= 0) {
        return res.status(400).send('ID invalido.');
    }

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).send('Contrasena incorrecta.');
    }

    const image = db.prepare('SELECT id, filename, original_name, mime_type FROM images WHERE id = ?').get(imageId);
    if (!image) {
        return res.status(404).send('La imagen no existe.');
    }

    const title = req.body.title ? req.body.title.trim() : '';
    const description = req.body.description ? req.body.description.trim() : '';
    const priceResult = parsePrice(req.body.price);
    const discountResult = parseDiscount(req.body.discount);
    const nextFilename = req.file ? req.file.filename : image.filename;
    const nextOriginalName = req.file ? req.file.originalname : image.original_name;
    const nextMimeType = req.file ? req.file.mimetype : image.mime_type;

    if (priceResult.error) {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        return res.status(400).send(priceResult.error);
    }
    if (discountResult.error) {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        return res.status(400).send(discountResult.error);
    }

    db.prepare(`
        UPDATE images
        SET filename = ?, original_name = ?, title = ?, description = ?, mime_type = ?, price = ?, discount = ?
        WHERE id = ?
    `).run(
        nextFilename,
        nextOriginalName,
        title || null,
        description || null,
        nextMimeType,
        priceResult.value,
        discountResult.value,
        imageId
    );

    if (req.file && image.filename && image.filename !== req.file.filename) {
        fs.unlink(path.join('/uploads', image.filename), () => {});
    }

    return res.redirect('/dashboard');
});

app.post('/delete/:id', (req, res) => {
    const imageId = Number(req.params.id);
    const password = req.body.password ? req.body.password.trim() : '';

    if (!Number.isInteger(imageId) || imageId <= 0) {
        return res.status(400).send('ID invalido.');
    }

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).send('Contrasena incorrecta.');
    }

    const image = db.prepare('SELECT id, filename FROM images WHERE id = ?').get(imageId);

    if (!image) {
        return res.status(404).send('La imagen no existe.');
    }

    db.prepare('DELETE FROM images WHERE id = ?').run(imageId);
    fs.unlink(path.join('/uploads', image.filename), () => {});

    res.redirect('/dashboard');
});

// RUTA: Listar imágenes para la galería
app.get('/api/images', (req, res) => {
    const images = db.prepare(`
        SELECT id, filename, original_name, title, description, mime_type, price, discount, created_at
        FROM images
        ORDER BY datetime(created_at) DESC, id DESC
    `).all();
    res.json(images);
});

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).send(error.message);
    }
    if (error) {
        return res.status(400).send(error.message);
    }
    return next();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de galería corriendo en http://localhost:${PORT}`);
});
