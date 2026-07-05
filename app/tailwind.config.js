const path = require('path');

module.exports = {
    content: [path.join(__dirname, 'public/**/*.{html,js}')],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
                display: ['Cormorant Garamond', 'serif'],
                script: ['Great Vibes', 'cursive']
            },
            colors: {
                brand: {
                    cream: '#f7efe3',
                    sand: '#efe2d2',
                    ink: '#4a3728',
                    text: '#6f5a45',
                    soft: '#8a7460',
                    accent: '#8b5e3c',
                    sage: '#6f7b4d'
                }
            },
            boxShadow: {
                soft: '0 24px 60px rgba(42, 55, 64, 0.10)',
                glow: '0 16px 34px rgba(42, 55, 64, 0.08)'
            }
        }
    },
    plugins: []
};
