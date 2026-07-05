window.appIcons = {
    chevronLeft: '<svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12.8 4.2 7 10l5.8 5.8-1.4 1.4L4.2 10l7.2-7.2 1.4 1.4z"></path></svg>',
    chevronRight: '<svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true" focusable="false" fill="currentColor"><path d="m7.2 4.2 1.4-1.4L15.8 10l-7.2 7.2-1.4-1.4L13 10 7.2 4.2z"></path></svg>',
    close: '<svg viewBox="0 0 20 20" class="h-5 w-5" aria-hidden="true" focusable="false" fill="currentColor"><path d="M5.3 4.6 4.6 5.3 9.3 10l-4.7 4.7.7.7L10 10.7l4.7 4.7.7-.7L10.7 10l4.7-4.7-.7-.7L10 9.3 5.3 4.6z"></path></svg>',
    plus: '<svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true" focusable="false" fill="currentColor"><path d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5V4z"></path></svg>',
    arrowLeft: '<svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12.8 4.2 7 10l5.8 5.8-1.4 1.4L4.2 10l7.2-7.2 1.4 1.4z"></path></svg>',
    edit: '<svg viewBox="0 0 20 20" class="h-5 w-5" aria-hidden="true" focusable="false" fill="currentColor"><path d="m13.6 3.6 2.8 2.8-8.9 8.9-3.4.9.9-3.4 8.6-8.9zm1.4-1.4a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8l-1.1 1.1-3.2-3.2 1.1-1.1zM5.5 14.5l1.7.2.2-1.7-1.9 1.5z"></path></svg>',
    trash: '<svg viewBox="0 0 20 20" class="h-5 w-5" aria-hidden="true" focusable="false" fill="currentColor"><path d="M7 3.5h6l.5 1.5H17v1H3v-1h3.5L7 3.5zm1.2 4h1v7h-1v-7zm3.8 0h1v7h-1v-7zM5.5 7l.5 10h8l.5-10h-9z"></path></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2 22l5.3-1.5A9.9 9.9 0 1 0 12 2zm5.7 14.1c-.2.5-1 1-1.5 1.1-.4.1-.9.2-1.5 0-.3-.1-.7-.2-1.2-.4-2.1-.9-3.4-3-3.5-3.1-.1-.1-.9-1.2-.9-2.3s.6-1.7.8-1.9c.2-.2.4-.2.6-.2h.4c.1 0 .3 0 .5.5.2.5.6 1.7.7 1.8.1.2.1.3 0 .5l-.4.6c-.1.1-.2.3-.1.5.1.2.5.8 1.1 1.3.8.7 1.5.9 1.7 1 .2.1.4.1.5 0l.7-.8c.2-.2.3-.2.5-.1.2.1 1.5.7 1.8.8.2.1.4.1.5.2.1.1.1.6-.1 1.1z"></path></svg>'
};

document.querySelectorAll('[data-icon]').forEach((node) => {
    const iconName = node.getAttribute('data-icon');
    if (iconName && window.appIcons?.[iconName]) {
        node.innerHTML = window.appIcons[iconName];
    }
});
