export const keys = {};

export function setupInputListener(onKeyDownCallback) {
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (onKeyDownCallback) onKeyDownCallback(e.code);
    });

    window.addEventListener('keyup', e => {
        keys[e.code] = false;
    });
}