export const keys = {};

export function setupInputListener(keys) {
    // Teclado físico (PC)
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // Mapeo de IDs de HTML a las teclas que usa la lógica de tu juego
    const touchMap = [
        { id: 'btn-up', code: 'KeyW' },
        { id: 'btn-down', code: 'KeyS' },
        { id: 'btn-left', code: 'KeyA' },
        { id: 'btn-right', code: 'KeyD' },
        { id: 'btn-a', code: 'Space' },       // Saltar / Seleccionar
        { id: 'btn-b', code: 'KeyK' },        // Acción secundaria
        { id: 'btn-start', code: 'Enter' },   // Inicio
        { id: 'btn-select', code: 'ShiftLeft' }
    ];

    // Asignación de eventos táctiles
    touchMap.forEach(item => {
        const btn = document.getElementById(item.id);
        if (!btn) return;

        const press = (e) => {
            if (e.cancelable) e.preventDefault();
            keys[item.code] = true;
        };

        const release = (e) => {
            if (e.cancelable) e.preventDefault();
            keys[item.code] = false;
        };

        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
    });
}