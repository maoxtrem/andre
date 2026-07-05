const THEME_KEY = 'bohemian-theme';

const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);

    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
        const label = nextTheme === 'dark' ? 'Tema claro' : 'Tema oscuro';
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('title', label);
        toggle.dataset.theme = nextTheme;
        toggle.querySelector('[data-theme-label]')?.replaceChildren(document.createTextNode(nextTheme === 'dark' ? 'Claro' : 'Oscuro'));
    }
};

const initThemeToggle = () => {
    applyTheme(getPreferredTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem(THEME_KEY, nextTheme);
            applyTheme(nextTheme);
        });
    });
};

document.addEventListener('DOMContentLoaded', initThemeToggle);
