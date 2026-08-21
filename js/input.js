export const keys = {};

export function setupInputListener(keys) {
    // Listener de teclado existente (PC)
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // Mapeo de botones táctiles a teclas del juego
    const touchControls = [
        { id: 'btn-up', code: 'KeyW' },
        { id: 'btn-down', code: 'KeyS' },
        { id: 'btn-left', code: 'KeyA' },
        { id: 'btn-right', code: 'KeyD' },
        { id: 'btn-a', code: 'Space' },       /* Saltar / Acción */
        { id: 'btn-b', code: 'KeyK' },        /* Correr / Secundario */
        { id: 'btn-start', code: 'Enter' },
        { id: 'btn-select', code: 'ShiftLeft' }
    ];

    touchControls.forEach(control => {
        const btn = document.getElementById(control.id);
        if (!btn) return;

        // Al presionar el botón táctil
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Evita el zoom o scroll por defecto
            keys[control.code] = true;
        }, { passive: false });

        // Al soltar el botón táctil
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[control.code] = false;
        }, { passive: false });
    });
}