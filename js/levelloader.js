export const ISLAND_NAMES = [
    "ISLA 1: REINO BIRABUTO",
    "ISLA 2: CUEVA ESTALACTITA",
    "ISLA 3: TEMPLO TUBERÍAS",
    "ISLA 4: RUINAS DEL CIELO",
    "ISLA 5: FORTALEZA DE LAVA"
];

export function buildLevelData(index) {
    let levelW = 3400 + index * 200;
    let flag = { x: levelW - 120, y: 60, w: 10, h: 140 };
    let levelTheme = 'birabuto';
    let platforms = [];
    let movingPlatforms = [];
    let blocks = [];
    let coins = [];
    let enemies = [];
    let decorations = [];

    if (index === 0) {
        // --- MAPA 1: REINO BIRABUTO ---
        levelTheme = 'birabuto';
        platforms = [
            { x: 0, y: 200, w: 800, h: 40 },
            { x: 880, y: 200, w: 600, h: 40 },
            { x: 1550, y: 200, w: 900, h: 40 },
            { x: 2520, y: 200, w: levelW - 2520, h: 40 },
            { x: 400, y: 160, w: 32, h: 40, type: 'pipe' },
            { x: 1150, y: 148, w: 32, h: 52, type: 'pipe', isEnterable: true, exitX: 1220, exitY: 150 },
            { x: 1850, y: 160, w: 32, h: 40, type: 'pipe' },
            { x: 2400, y: 160, w: 32, h: 40, type: 'pipe' },
            { x: 2850, y: 148, w: 32, h: 52, type: 'pipe' }
        ];

        decorations = [
            { type: 'pyramid', x: 180, size: 100 },
            { type: 'pyramid', x: 620, size: 130 },
            { type: 'pyramid', x: 1300, size: 110 },
            { type: 'pyramid', x: 2100, size: 140 },
            { type: 'palm', x: 280, y: 200 },
            { type: 'palm', x: 1020, y: 200 },
            { type: 'palm', x: 2200, y: 200 },
            { type: 'pyramid', x: 2650, size: 120 },
            { type: 'palm', x: 3000, y: 200 }
        ];

        blocks = [
            { x: 180, y: 140, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false },
            { x: 230, y: 140, w: 16, h: 16, type: 'question', content: 'coin', hit: false },
            { x: 246, y: 140, w: 16, h: 16, type: 'brick' },
            { x: 950, y: 130, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false },
            { x: 2150, y: 140, w: 16, h: 16, type: 'question', content: 'coin', hit: false },
            { x: 2166, y: 140, w: 16, h: 16, type: 'brick' },
            { x: 2182, y: 140, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false },
            { x: 2600, y: 130, w: 16, h: 16, type: 'question', content: 'coin', hit: false },
            { x: 2616, y: 130, w: 16, h: 16, type: 'brick' },
            { x: 3020, y: 140, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false }
        ];

        enemies = [
            { type: 'goomba', x: 330, y: 184, w: 16, h: 16, minX: 250, maxX: 390, vx: 1.1 },
            { type: 'plant', pipeX: 400, pipeY: 160, w: 16, h: 20, timer: 0 },
            { type: 'plant', pipeX: 1850, pipeY: 160, w: 16, h: 20, timer: 2 },
            { type: 'goomba', x: 920, y: 184, w: 16, h: 16, minX: 890, maxX: 1050, vx: -1.2 },
            { type: 'goomba', x: 2050, y: 184, w: 16, h: 16, minX: 1950, maxX: 2200, vx: 1.2 },
            { type: 'plant', pipeX: 2400, pipeY: 160, w: 16, h: 20, timer: 1 },
            { type: 'goomba', x: 2650, y: 184, w: 16, h: 16, minX: 2550, maxX: 2800, vx: -1.3 },
            { type: 'plant', pipeX: 2850, pipeY: 148, w: 16, h: 20, timer: 3 },
            { type: 'goomba', x: 3080, y: 184, w: 16, h: 16, minX: 2980, maxX: 3180, vx: 1.1 }
        ];

    } else if (index === 1) {
        // --- MAPA 2: CUEVA ESTALACTITA ---
        levelTheme = 'cave';
        platforms = [
            { x: 0, y: 200, w: 750, h: 40 },
            { x: 810, y: 180, w: 500, h: 60 },
            { x: 1370, y: 200, w: 600, h: 40 },
            { x: 2030, y: 170, w: 400, h: 70 },
            // 👇 Nuevos saltos y plataformas en la parte final
            { x: 2500, y: 140, w: 100, h: 20 }, // Plataforma flotante
            { x: 2650, y: 200, w: 400, h: 40 }, // Suelo
            { x: 3120, y: 150, w: 120, h: 20 }, // Plataforma flotante
            { x: 3300, y: 200, w: levelW - 3300, h: 40 } // Tramo final hasta la bandera
        ];

        decorations = [
            { type: 'stalactite', x: 150, y: 0 },
            { type: 'stalactite', x: 800, y: 0 },
            { type: 'stalactite', x: 1300, y: 0 },
            { type: 'stalactite', x: 1900, y: 0 },
            { type: 'stalactite', x: 2400, y: 0 },
            // 👇 Más estalactitas al final
            { type: 'stalactite', x: 2750, y: 0 },
            { type: 'stalactite', x: 3100, y: 0 },
            { type: 'stalactite', x: 3450, y: 0 }
        ];

        blocks = [
            { x: 220, y: 130, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false },
            { x: 750, y: 110, w: 16, h: 16, type: 'brick' },
            { x: 1450, y: 130, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false },
            { x: 2100, y: 110, w: 16, h: 16, type: 'question', content: 'coin', hit: false },
            // 👇 Nuevos bloques
            { x: 2540, y: 90, w: 16, h: 16, type: 'question', content: 'coin', hit: false },
            { x: 2750, y: 140, w: 16, h: 16, type: 'brick' },
            { x: 2766, y: 140, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false },
            { x: 3170, y: 100, w: 16, h: 16, type: 'brick' }
        ];

        enemies = [
            { type: 'bat', x: 300, y: 90, baseY: 90, w: 16, h: 12, floatRange: 35, floatSpeed: 0.08, angle: 0 },
            { type: 'goomba', x: 850, y: 164, w: 16, h: 16, minX: 820, maxX: 1050, vx: -1.2 },
            { type: 'goomba', x: 1450, y: 184, w: 16, h: 16, minX: 1380, maxX: 1600, vx: 1.1 },
            // 👇 Nuevos enemigos llenando el vacío
            { type: 'bat', x: 1800, y: 80, baseY: 80, w: 16, h: 12, floatRange: 40, floatSpeed: 0.1, angle: 0 },
            { type: 'goomba', x: 2200, y: 154, w: 16, h: 16, minX: 2050, maxX: 2350, vx: -1.2 },
            { type: 'bat', x: 2600, y: 70, baseY: 70, w: 16, h: 12, floatRange: 50, floatSpeed: 0.09, angle: 0 },
            { type: 'goomba', x: 2800, y: 184, w: 16, h: 16, minX: 2700, maxX: 2950, vx: 1.1 },
            { type: 'bat', x: 3350, y: 90, baseY: 90, w: 16, h: 12, floatRange: 30, floatSpeed: 0.08, angle: 0 }
        ];

    } else if (index === 2) {
        // --- MAPA 3: TEMPLO Y MUNDO DE TUBERÍAS ---
        levelTheme = 'birabuto'; // Usamos el tema diurno para que se vean árboles y nubes
        platforms = [{ x: 0, y: 200, w: 250, h: 40 }];
        blocks = [{ x: 100, y: 140, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false }];
        decorations = [];

        // 1. GENERAR DECORACIONES DE FONDO (Nubes, Árboles y Tuberías lejanas/cercanas)
        for (let bgX = 40; bgX < levelW - 200; bgX += 120 + Math.random() * 80) {
            let rand = Math.random();
            if (rand < 0.3) {
                decorations.push({ type: 'cloud', x: bgX, y: 30 + Math.random() * 40 });
            } else if (rand < 0.55) {
                decorations.push({ type: 'pipe_bg_far', x: bgX, y: 110, w: 24, h: 90 });
            } else if (rand < 0.8) {
                decorations.push({ type: 'pipe_bg_near', x: bgX, y: 130, w: 32, h: 70 });
            } else {
                decorations.push({ type: 'tree', x: bgX, y: 200 });
            }
        }

        // 2. GENERAR ESTRUCTURA DEL MAPA SÓLIDA (Sin bugs de superposición)
        let currentX = 250;
        while (currentX < levelW - 400) {
            let gap = 40 + Math.random() * 30;
            currentX += gap;

            let randType = Math.random();

            if (randType < 0.5) {
                // Tubería jugable bien posicionado en el suelo
                let pipeH = 40 + Math.floor(Math.random() * 3) * 16;
                let pipeY = 200 - pipeH;
                platforms.push({ x: currentX, y: pipeY, w: 32, h: pipeH, type: 'pipe' });
                
                if (Math.random() < 0.6) {
                    enemies.push({ type: 'plant', pipeX: currentX, pipeY: pipeY, w: 16, h: 20, timer: Math.random() * 2 });
                }
                currentX += 32;
            } else {
                // Plataforma flotante con bloque interrogante
                let platW = 64 + Math.floor(Math.random() * 3) * 16;
                let platY = 130 + Math.floor(Math.random() * 2) * 20;
                platforms.push({ x: currentX, y: platY, w: platW, h: 16 });
                
                blocks.push({ 
                    x: currentX + Math.floor(platW / 2) - 8, 
                    y: platY - 40, 
                    w: 16, h: 16, 
                    type: 'question', 
                    content: Math.random() > 0.4 ? 'coin' : 'mushroom', 
                    hit: false 
                });
                
                currentX += platW;
            }
        }

        // Plataforma final
        platforms.push({ x: levelW - 350, y: 200, w: 350, h: 40 });
     } else if (index === 3) {
        // --- MAPA 4: RUINAS DEL CIELO ---
        levelTheme = 'sky';
        platforms = [
            { x: 0, y: 200, w: 200, h: 40, type: 'cloud_plat' },
            { x: levelW - 300, y: 200, w: 300, h: 40, type: 'cloud_plat' }
        ];

        let currentX = 220;
        while(currentX < levelW - 400) {
            let platW = 60 + Math.random() * 80;
            let platY = 120 + Math.random() * 80;
            platforms.push({ x: currentX, y: platY, w: platW, h: 20, type: 'cloud_plat' });
            currentX += platW + 40 + Math.random() * 60;
        }

        blocks = [{ x: 200, y: 130, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false }];

    } else if (index === 4) {
        // --- MAPA 5: FORTALEZA DE LAVA ---
        levelTheme = 'castle';
        levelW = 800;
        flag = { x: 700, y: 60, w: 10, h: 140 }; 
        platforms = [
            { x: 0, y: 200, w: 800, h: 40 },
            { x: -20, y: 0, w: 20, h: 240 },
            { x: 800, y: 0, w: 20, h: 240 }
        ];

        decorations = [
            { type: 'window', x: 200, y: 70 },
            { type: 'window', x: 400, y: 70 },
            { type: 'window', x: 600, y: 70 }
        ];

        blocks = [{ x: 100, y: 140, w: 16, h: 16, type: 'question', content: 'mushroom', hit: false }];

        enemies = [
            { 
                type: 'spaceship_boss', 
                x: 400, y: 50, 
                w: 40, h: 24, 
                hp: 3, 
                vx: 1.8, 
                vy: 1.2, 
                minX: 80, maxX: 680, 
                minY: 30, maxY: 120, 
                invuln: 0 
            }
        ];
    }

    // Monedas sueltas repartidas por el nivel
    for (let i = 280; i < levelW - 300; i += 160) {
        coins.push({ x: i, y: 120, taken: false });
    }

    return {
        levelW, flag, levelTheme, platforms, movingPlatforms, blocks, coins, enemies, decorations
    };
}