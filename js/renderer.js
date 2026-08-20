export const PALETTE = {
    c0: '#0f380f', // Verde Oscuro
    c1: '#306230', // Verde Medio
    c2: '#8bac0f', // Verde Claro
    c3: '#9bbc0f'  // Fondo
};

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Factor de escala interna
        this.scale = 1.5; 
        
        // Ajustamos la vista lógica dividiéndola por la escala
        this.VIEW_W = this.canvas.width / this.scale;  
        this.VIEW_H = this.canvas.height / this.scale; 
    }

    clear() {
        // Resetea cualquier transformación previa
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); 
        
        // Limpia el canvas completo con las dimensiones reales del HTML
        this.ctx.fillStyle = PALETTE.c3;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Aplica el escalado a todos los dibujos que se hagan después
        this.ctx.scale(this.scale, this.scale);
    }

    // --- DIBUJO DE LOS 4 PROGRAMADORES EN LA INTRO ---
    drawIntroProgrammers(startX, y, timer = 0) {
        for (let i = 0; i < 4; i++) {
            const px = startX + (i * 22);
            const py = y + Math.sin((timer + i * 10) * 0.1) * 2;

            // Cabeza / Cabello
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(px + 2, py, 8, 4);

            // Cara
            this.ctx.fillStyle = PALETTE.c2;
            this.ctx.fillRect(px + 2, py + 4, 8, 4);

            // Lentes de programador
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(px + 3, py + 5, 2, 2);
            this.ctx.fillRect(px + 7, py + 5, 2, 2);
            this.ctx.fillRect(px + 5, py + 5, 2, 1);

            // Cuerpo / Camisa
            this.ctx.fillStyle = PALETTE.c1;
            this.ctx.fillRect(px + 1, py + 8, 10, 6);

            // Laptop en las manos
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(px, py + 11, 12, 2);
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.fillRect(px + 2, py + 11, 8, 1);
        }
    }

    // --- ELEMENTOS DE DECORACIÓN / FONDO ---
    drawDecoration(deco, cameraX) {
        switch (deco.type) {
            case 'cloud': {
                const cx = Math.floor(deco.x - cameraX * 0.2);
                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.beginPath();
                this.ctx.arc(cx + 10, deco.y + 10, 10, 0, Math.PI * 2);
                this.ctx.arc(cx + 22, deco.y + 6, 12, 0, Math.PI * 2);
                this.ctx.arc(cx + 34, deco.y + 10, 10, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = PALETTE.c2;
                this.ctx.beginPath();
                this.ctx.arc(cx + 10, deco.y + 10, 8, 0, Math.PI * 2);
                this.ctx.arc(cx + 22, deco.y + 6, 10, 0, Math.PI * 2);
                this.ctx.arc(cx + 34, deco.y + 10, 8, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            }

            case 'tree': {
                const tx = Math.floor(deco.x - cameraX * 0.6);
                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.beginPath();
                this.ctx.arc(tx + 12, deco.y - 20, 14, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = PALETTE.c1;
                this.ctx.beginPath();
                this.ctx.arc(tx + 12, deco.y - 20, 11, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.fillRect(tx + 10, deco.y - 8, 4, 8);
                break;
            }

            case 'pipe_bg_far': {
                const px = Math.floor(deco.x - cameraX * 0.3);
                const w = deco.w || 24;
                const h = deco.h || 90;

                this.ctx.fillStyle = PALETTE.c2;
                this.ctx.fillRect(px, deco.y, w, h);
                this.ctx.fillStyle = PALETTE.c1;
                this.ctx.fillRect(px - 2, deco.y, w + 4, 8);
                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.strokeRect(px, deco.y, w, h);
                break;
            }

            case 'pipe_bg_near': {
                const px = Math.floor(deco.x - cameraX * 0.5);
                const w = deco.w || 32;
                const h = deco.h || 70;

                this.ctx.fillStyle = PALETTE.c1;
                this.ctx.fillRect(px, deco.y, w, h);
                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.strokeRect(px, deco.y, w, h);
                this.ctx.fillRect(px - 3, deco.y, w + 6, 10);
                this.ctx.fillStyle = PALETTE.c2;
                this.ctx.fillRect(px + 4, deco.y + 10, 3, h - 10);
                break;
            }

            case 'machine_factory': {
                // Fondo industrial con máquinas, paneles y cables para el mapa final
                const mx = Math.floor(deco.x - cameraX * 0.4);
                
                // Estructura de máquina principal
                this.ctx.fillStyle = PALETTE.c1;
                this.ctx.fillRect(mx, 120, 40, 100);
                
                // Pantallas / Paneles de control
                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.fillRect(mx + 6, 130, 28, 18);
                this.ctx.fillStyle = PALETTE.c3;
                this.ctx.fillRect(mx + 8, 132, 24, 14);
                
                // Luces de estado intermitentes de la máquina
                this.ctx.fillStyle = Math.floor(Date.now() / 200) % 2 === 0 ? PALETTE.c0 : PALETTE.c2;
                this.ctx.fillRect(mx + 10, 156, 4, 4);
                this.ctx.fillRect(mx + 18, 156, 4, 4);
                
                // Cables colgantes y tuberías industriales secundarias
                this.ctx.strokeStyle = PALETTE.c0;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(mx + 40, 140);
                this.ctx.bezierCurveTo(mx + 55, 140, mx + 55, 180, mx + 70, 180);
                this.ctx.stroke();
                break;
            }
        }
    }

    drawCloud(x, y, cameraX) {
        this.drawDecoration({ type: 'cloud', x: x, y: y }, cameraX);
    }

    drawPyramid(x, size, cameraX) {
        const px = Math.floor(x - cameraX * 0.4);
        const py = 200;
        this.ctx.strokeStyle = PALETTE.c0;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(px + size / 2, py - size / 1.5);
        this.ctx.lineTo(px + size, py);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(px + size / 2, py - size / 1.5);
        this.ctx.lineTo(px + size / 2, py);
        this.ctx.stroke();

        this.ctx.lineWidth = 1;
        for (let i = 10; i < size / 1.5; i += 12) {
            const ratio = i / (size / 1.5);
            const startX = px + (size / 2) * ratio;
            const endX = px + size / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, py - i);
            this.ctx.lineTo(endX, py - i);
            this.ctx.stroke();
        }
    }

    drawPalmTree(x, y, cameraX) {
        const px = Math.floor(x - cameraX);
        this.ctx.fillStyle = PALETTE.c0;
        this.ctx.fillRect(px + 6, y - 30, 3, 30);
        this.ctx.fillRect(px - 6, y - 32, 12, 3);
        this.ctx.fillRect(px + 9, y - 32, 12, 3);
        this.ctx.fillRect(px - 2, y - 36, 6, 4);
        this.ctx.fillRect(px + 11, y - 36, 6, 4);
    }

    drawGroundPlatform(p, cameraX) {
        const px = Math.floor(p.x - cameraX);

        if (p.type === 'cloud_plat') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.beginPath();
            this.ctx.arc(px + 10, p.y + 10, 10, 0, Math.PI * 2);
            this.ctx.arc(px + p.w - 10, p.y + 10, 10, 0, Math.PI * 2);
            this.ctx.rect(px + 10, p.y, p.w - 20, 20);
            this.ctx.fill();
            
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.beginPath();
            this.ctx.arc(px + 10, p.y + 10, 8, 0, Math.PI * 2);
            this.ctx.arc(px + p.w - 10, p.y + 10, 8, 0, Math.PI * 2);
            this.ctx.rect(px + 10, p.y + 2, p.w - 20, 16);
            this.ctx.fill();
            return;
        }

        if (p.type === 'pipe') {
            const floorY = 240;
            const actualH = floorY - p.y;

            this.ctx.fillStyle = PALETTE.c1;
            this.ctx.fillRect(px, p.y, p.w, actualH);
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.strokeRect(px, p.y, p.w, actualH);
            this.ctx.fillRect(px - 2, p.y, p.w + 4, 10);
            
            // Barra blanca vertical clásica en el interior de la tubería
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.fillRect(px + 4, p.y + 10, 4, actualH - 10);
            return;
        }

        this.ctx.fillStyle = PALETTE.c1;
        this.ctx.fillRect(px, p.y, p.w, p.h);
        this.ctx.fillStyle = PALETTE.c0;
        this.ctx.fillRect(px, p.y, p.w, 2);
        this.ctx.fillRect(px, p.y + 4, p.w, 1);

        for (let x = 0; x < p.w; x += 8) {
            for (let y = 8; y < p.h; y += 8) {
                this.ctx.fillRect(px + x + (y % 16 === 0 ? 0 : 4), p.y + y, 2, 2);
            }
        }
    }

    drawPlayerSprite(player, cameraX) {
        this.ctx.save();
        this.ctx.translate(Math.floor(player.x - cameraX), Math.floor(player.y));
        if (player.facing === 'left') {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-14, 0);
        }

        if (player.invincible > 0 && Math.floor(Date.now() / 70) % 2 === 0) {
            this.ctx.globalAlpha = 0.3;
        }

        const hOff = player.isBig ? 8 : 0;
        const isJumping = !player.grounded;

        this.ctx.fillStyle = PALETTE.c0;
        this.ctx.fillRect(2, 0, 10, 3 + hOff / 2);
        this.ctx.fillRect(2, 3 + hOff / 2, 11, 2);

        this.ctx.fillStyle = PALETTE.c2;
        this.ctx.fillRect(2, 5 + hOff / 2, 10, 4);
        this.ctx.fillStyle = PALETTE.c0;
        this.ctx.fillRect(8, 6 + hOff / 2, 2, 2);
        this.ctx.fillRect(6, 8 + hOff / 2, 5, 2);

        this.ctx.fillStyle = PALETTE.c1;
        this.ctx.fillRect(3, 9 + hOff, 8, 6);
        this.ctx.fillStyle = PALETTE.c0;
        this.ctx.fillRect(1, 10 + hOff, 2, 4);
        this.ctx.fillRect(11, 10 + hOff, 2, 4);

        this.ctx.fillStyle = PALETTE.c0;
        if (isJumping) {
            this.ctx.fillRect(0, 15 + hOff, 5, 4);
            this.ctx.fillRect(8, 13 + hOff, 5, 4);
        } else if (player.animFrame === 1) {
            this.ctx.fillRect(1, 15 + hOff, 5, 5);
            this.ctx.fillRect(8, 15 + hOff, 5, 3);
        } else {
            this.ctx.fillRect(2, 15 + hOff, 4, 5);
            this.ctx.fillRect(8, 15 + hOff, 4, 5);
        }

        this.ctx.restore();
    }

    drawMushroom(m, cameraX) {
        const x = Math.floor(m.x - cameraX);
        const y = Math.floor(m.y);
        this.ctx.fillStyle = PALETTE.c0;
        this.ctx.fillRect(x + 2, y, 12, 6);
        this.ctx.fillRect(x, y + 2, 16, 4);
        this.ctx.fillStyle = PALETTE.c3;
        this.ctx.fillRect(x + 3, y + 2, 3, 2);
        this.ctx.fillRect(x + 10, y + 2, 3, 2);
        this.ctx.fillStyle = PALETTE.c2;
        this.ctx.fillRect(x + 4, y + 6, 8, 10);
    }

    drawBlock(b, cameraX) {
        const x = Math.floor(b.x - cameraX);
        const y = Math.floor(b.y);

        if (b.type === 'question') {
            this.ctx.fillStyle = b.hit ? PALETTE.c1 : PALETTE.c0;
            this.ctx.fillRect(x, y, b.w, b.h);
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.strokeRect(x, y, b.w, b.h);
            if (!b.hit) {
                this.ctx.font = 'bold 12px monospace';
                this.ctx.fillText('?', x + 4, y + 12);
            }
        } else if (b.type === 'brick') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x, y, b.w, b.h);
            this.ctx.fillStyle = PALETTE.c1;
            this.ctx.fillRect(x + 1, y + 1, 14, 6);
            this.ctx.fillRect(x + 1, y + 9, 14, 6);
        }
    }

    drawEnemy(e, cameraX) {
        const x = Math.floor(e.x - cameraX);
        const y = Math.floor(e.y);

        if (e.type === 'goomba') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x + 2, y, 12, 10);
            this.ctx.fillRect(x, y + 3, 16, 5);
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.fillRect(x + 3, y + 4, 2, 3);
            this.ctx.fillRect(x + 11, y + 4, 2, 3);
            this.ctx.fillStyle = PALETTE.c1;
            this.ctx.fillRect(x + 1, y + 12, 5, 4);
            this.ctx.fillRect(x + 10, y + 12, 5, 4);
        } else if (e.type === 'plant') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x + 2, y, 12, 14);
            this.ctx.fillRect(x + 6, y + 14, 4, 10);
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.fillRect(x + 3, y + 4, 10, 3);
        } else if (e.type === 'fire_pillar') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x + 2, y, 12, e.h);
            this.ctx.fillStyle = PALETTE.c3;
            const fireAnim = Math.sin(Date.now() * 0.02) * 2;
            this.ctx.fillRect(x + 4, y + 2 + fireAnim, 8, e.h);
        } else if (e.type === 'bird') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x + 4, y + 4, 10, 6); 
            const wingY = Math.sin(Date.now() * 0.02) > 0 ? 0 : 8;
            this.ctx.fillRect(x + 6, y + wingY, 6, 4); 
            this.ctx.fillRect(x, y + 6, 4, 2); 
        } else if (e.type === 'spaceship_boss') {
            // Naves espaciales rediseñadas con estilo similar a la presentación principal
            if (e.hp > 0) {
                if (e.invuln > 0 && Math.floor(Date.now() / 70) % 2 === 0) {
                    this.ctx.globalAlpha = 0.5;
                }
                // Chasis principal de la nave
                this.ctx.fillStyle = PALETTE.c0;
                this.ctx.fillRect(x + 2, y + 6, e.w - 4, 10);
                this.ctx.fillRect(x, y + 10, e.w, 4);
                
                // Cúpula o cabina superior (con brillo de la paleta)
                this.ctx.fillStyle = PALETTE.c3;
                this.ctx.fillRect(x + Math.floor(e.w / 2) - 5, y, 10, 8);
                this.ctx.fillStyle = PALETTE.c2;
                this.ctx.fillRect(x + Math.floor(e.w / 2) - 3, y + 2, 6, 4);
                
                // Propulsores inferiores estilizados
                this.ctx.fillStyle = PALETTE.c1;
                this.ctx.fillRect(x + 6, y + 16, 6, 4);
                this.ctx.fillRect(x + e.w - 12, y + 16, 6, 4);
                
                this.ctx.globalAlpha = 1.0;
            }
        } else if (e.type === 'energy_ball') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x, y, 10, 10);
            this.ctx.fillStyle = PALETTE.c3;
            this.ctx.fillRect(x + 2, y + 2, 6, 6);
        } else if (e.type === 'bat' || e.type === 'fish') {
            this.ctx.fillStyle = PALETTE.c0;
            this.ctx.fillRect(x + 3, y + 3, 10, 8);
            const wingY = Math.sin(Date.now() * 0.012) > 0 ? 0 : 5;
            this.ctx.fillRect(x - 1, y + wingY, 5, 4);
            this.ctx.fillRect(x + 12, y + wingY, 5, 4);
        }
    }
}