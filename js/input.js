// En input.js:
export const keys = {};

export function setupInputListener(keysRef) {
    window.addEventListener('keydown', (e) => { keysRef[e.code] = true; });
    window.addEventListener('keyup', (e) => { keysRef[e.code] = false; });

    const touchMap = [
        { id: 'btn-up', code: 'KeyW' },
        { id: 'btn-down', code: 'KeyS' },
        { id: 'btn-left', code: 'KeyA' },
        { id: 'btn-right', code: 'KeyD' },
        { id: 'btn-a', code: 'Space' },
        { id: 'btn-b', code: 'KeyK' },
        { id: 'btn-start', code: 'Space' },
        { id: 'btn-start', code: 'Enter' },
        { id: 'btn-select', code: 'ShiftLeft' }
    ];

    touchMap.forEach(item => {
        const btn = document.getElementById(item.id);
        if (!btn) return;

        const press = (e) => {
            if (e.cancelable) e.preventDefault();
            keysRef[item.code] = true;
        };

        const release = (e) => {
            if (e.cancelable) e.preventDefault();
            keysRef[item.code] = false;
        };

        // Eventos táctiles (móvil)
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });

        // Eventos de ratón (PC)
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
    });
}