module.exports = {
    content: ['./public/**/*.{html,js}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
                display: ['Cormorant Garamond', 'serif']
            },
            colors: {
                brand: {
                    cream: '#fcfaf6',
                    sand: '#f5efe5',
                    ink: '#24323c',
                    text: '#586771',
                    soft: '#7a8790',
                    accent: '#c98f5c',
                    sage: '#7fa594'
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
