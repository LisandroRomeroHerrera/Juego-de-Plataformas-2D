import { initAudio, playSound, startBGM, stopBGM } from './audio.js';
import { Player, checkColl } from './entities.js';
import { buildLevelData, ISLAND_NAMES } from './levelLoader.js';
import { setupInputListener, keys } from './input.js';
import { Renderer, PALETTE } from './renderer.js';

// --- ESTADOS DE JUEGO ---
const STATE_MENU = 0;
const STATE_MAP = 1;
const STATE_PLAYING = 2;
const STATE_FLAG_ANIM = 3;
const STATE_LEVEL_CLEAR = 4;
const STATE_GAMEOVER = 5;
const STATE_WIN_GAME = 6;
const STATE_INTRO = 7;
const STATE_QUIZ = 8;

// Banco de preguntas sobre conceptos básicos de computadoras
const QUIZ_QUESTIONS = [
    {
        question: "¿Qué componente es el 'cerebro' de la PC?",
        options: ["1. CPU / Procesador", "2. Monitor", "3. Teclado", "4. Fuente"],
        correct: 0
    },
    {
        question: "¿Qué periférico se usa para escribir?",
        options: ["1. Mouse", "2. Teclado", "3. Parlante", "4. Webcam"],
        correct: 1
    },
    {
        question: "¿Qué usas para escuchar sonido en la PC?",
        options: ["1. Micrófono", "2. Mouse", "3. Parlantes", "4. Monitor"],
        correct: 2
    },
    {
        question: "¿Cuál de estos es un sistema operativo?",
        options: ["1. Chrome", "2. Word", "3. Excel", "4. Windows"],
        correct: 3
    },
    {
        question: "¿Qué dispositivo almacena tus archivos?",
        options: ["1. Disco Rígido / SSD", "2. Monitor", "3. Mouse", "4. Placa de Red"],
        correct: 0
    }
];

class Game {
    constructor() {
        this.renderer = new Renderer('gameCanvas');
        this.player = new Player();
        
        this.gameState = STATE_MENU;
        this.introTimer = 0;
        this.selectedIsland = 0;
        this.unlockedIslands = 1;

        this.cameraX = 0;
        this.score = 0;
        this.coinsCount = 0;
        this.lives = 2;
        this.levelTimer = 300;
        this.timerInterval = null;

        this.pipeState = 'NONE';
        this.pipeTimer = 0;
        this.savedMainLevel = null;
        this.activePipe = null;

        // Variables del Quiz Robot
        this.robotExploding = false;
        this.robotExplodeTimer = 0;
        this.quizSelectedIndex = 0;

        // Propiedades de Nivel
        this.levelW = 3400;
        this.levelTheme = 'birabuto';
        this.platforms = [];
        this.movingPlatforms = [];
        this.blocks = [];
        this.mushrooms = [];
        this.coins = [];
        this.enemies = [];
        this.decorations = [];
        this.fallingStalactites = [];
        this.flag = { x: 0, y: 0, w: 10, h: 140 };

        this.init();
    }

    init() {
        setupInputListener(code => this.handleKeyDown(code));
        this.loop();
    }

    handleKeyDown(code) {
        initAudio();

        if (this.gameState === STATE_QUIZ && !this.robotExploding) {
            if (code === 'ArrowRight' || code === 'KeyD') {
                if (this.quizSelectedIndex % 2 === 0) this.quizSelectedIndex += 1;
            } else if (code === 'ArrowLeft' || code === 'KeyA') {
                if (this.quizSelectedIndex % 2 === 1) this.quizSelectedIndex -= 1;
            } else if (code === 'ArrowDown' || code === 'KeyS') {
                if (this.quizSelectedIndex < 2) this.quizSelectedIndex += 2;
            } else if (code === 'ArrowUp' || code === 'KeyW') {
                if (this.quizSelectedIndex >= 2) this.quizSelectedIndex -= 2;
            }

            if (code === 'Digit1' || code === 'Numpad1') this.quizSelectedIndex = 0;
            if (code === 'Digit2' || code === 'Numpad2') this.quizSelectedIndex = 1;
            if (code === 'Digit3' || code === 'Numpad3') this.quizSelectedIndex = 2;
            if (code === 'Digit4' || code === 'Numpad4') this.quizSelectedIndex = 3;

            if (code === 'Enter' || code === 'Space' || code === 'Digit1' || code === 'Digit2' || code === 'Digit3' || code === 'Digit4' || code === 'Numpad1' || code === 'Numpad2' || code === 'Numpad3' || code === 'Numpad4') {
                const currentQuiz = QUIZ_QUESTIONS[this.selectedIsland] || QUIZ_QUESTIONS[0];
                if (this.quizSelectedIndex === currentQuiz.correct) {
                    playSound('powerup');
                    this.robotExploding = true;
                    this.robotExplodeTimer = 0;
                } else {
                    playSound('hit');
                    this.gameState = STATE_GAMEOVER;
                }
            }
            return;
        }

        if (code === 'Space' || code === 'KeyW' || code === 'Enter') {
            if (this.gameState === STATE_MENU) {
                this.gameState = STATE_INTRO;
                this.introTimer = 0;
            } else if (this.gameState === STATE_INTRO) {
                this.gameState = STATE_MAP;
            } else if (this.gameState === STATE_MAP) {
                this.loadLevel(this.selectedIsland);
                this.gameState = STATE_PLAYING;
                startBGM(this.gameState === STATE_PLAYING);
            } else if (this.gameState === STATE_LEVEL_CLEAR) {
                if (this.unlockedIslands >= 5 && this.selectedIsland === 4) {
                    this.gameState = STATE_WIN_GAME;
                } else {
                    this.gameState = STATE_MAP;
                }
            } else if (this.gameState === STATE_GAMEOVER || this.gameState === STATE_WIN_GAME) {
                this.gameState = STATE_MAP;
            }
        }

        if (this.gameState === STATE_MAP) {
            if (code === 'ArrowRight' || code === 'KeyD') {
                if (this.selectedIsland < this.unlockedIslands - 1 && this.selectedIsland < 4) this.selectedIsland++;
            }
            if (code === 'ArrowLeft' || code === 'KeyA') {
                if (this.selectedIsland > 0) this.selectedIsland--;
            }
        }
    }

    loadLevel(index) {
        this.player.reset();
        this.cameraX = 0;
        this.mushrooms = [];
        this.levelTimer = 300;
        this.pipeState = 'NONE';
        this.savedMainLevel = null;
        this.robotExploding = false;
        this.robotExplodeTimer = 0;
        this.quizSelectedIndex = 0;

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.gameState === STATE_PLAYING && this.levelTimer > 0) {
                this.levelTimer--;
                if (this.levelTimer <= 0) {
                    playSound('hit');
                    this.gameState = STATE_GAMEOVER;
                }
            }
        }, 1000);

        const data = buildLevelData(index);
        this.levelW = data.levelW;
        this.flag = data.flag;
        this.levelTheme = data.levelTheme;
        this.platforms = data.platforms;
        this.movingPlatforms = data.movingPlatforms;
        this.blocks = data.blocks;
        this.coins = data.coins;
        this.enemies = data.enemies;
        this.decorations = data.decorations;

        // --- MODIFICACIONES PARA EL MUNDO FINAL (ISLA 5) ---
        if (this.selectedIsland === 4) {
            // Añadir 4 naves espaciales jefes
            this.enemies = this.enemies.filter(e => e.type !== 'spaceship_boss');
            const bossBaseX = this.levelW - 650;
            const positions = [
                { x: bossBaseX, y: 35, vx: 1.5, vy: 0.8 },
                { x: bossBaseX + 110, y: 65, vx: -1.2, vy: 1.0 },
                { x: bossBaseX + 220, y: 40, vx: 1.8, vy: -0.9 },
                { x: bossBaseX + 330, y: 70, vx: -1.5, vy: -1.1 }
            ];

            positions.forEach(pos => {
                this.enemies.push({
                    type: 'spaceship_boss',
                    x: pos.x,
                    y: pos.y,
                    w: 32,
                    h: 20,
                    vx: pos.vx,
                    vy: pos.vy,
                    minX: bossBaseX - 50,
                    maxX: this.levelW - 200,
                    minY: 20,
                    maxY: 110,
                    hp: 3,
                    invuln: 0
                });
            });

            // Añadir múltiples bloques extra con hongos
            const extraBlockX = [
                bossBaseX - 250,
                bossBaseX - 120,
                bossBaseX + 40,
                bossBaseX + 180,
                bossBaseX + 300
            ];

            extraBlockX.forEach(bx => {
                this.blocks.push({
                    x: bx,
                    y: 115,
                    w: 16,
                    h: 16,
                    type: 'question',
                    content: 'mushroom',
                    hit: false
                });
                // Plataformas pequeñas debajo para ayudar al salto
                this.platforms.push({
                    x: bx - 12,
                    y: 155,
                    w: 40,
                    h: 10
                });
            });
        }

        this.fallingStalactites = [];
        if (this.selectedIsland === 1 || this.levelTheme === 'cave') {
            this.decorations.forEach(d => {
                if (d.type === 'stalactite' || this.levelTheme === 'cave') {
                    this.fallingStalactites.push({
                        x: d.x,
                        y: d.y || 0,
                        w: 20,
                        h: 25,
                        vy: 0,
                        isFalling: false,
                        hasLanded: false
                    });
                }
            });

            for (let x = 300; x < this.levelW - 400; x += 180) {
                if (Math.random() < 0.6) {
                    this.enemies.push({
                        type: 'bat',
                        x: x,
                        y: 50 + Math.random() * 60,
                        baseY: 50 + Math.random() * 60,
                        w: 16,
                        h: 12,
                        floatSpeed: 0.05 + Math.random() * 0.03,
                        floatRange: 20 + Math.random() * 15,
                        angle: Math.random() * Math.PI * 2
                    });
                }
            }
        }
    }

    enterBonusRoom(pipe) {
        playSound('pipe');
        this.savedMainLevel = {
            platforms: [...this.platforms],
            movingPlatforms: [...this.movingPlatforms],
            blocks: [...this.blocks],
            mushrooms: [...this.mushrooms],
            coins: [...this.coins],
            enemies: [...this.enemies],
            decorations: [...this.decorations],
            fallingStalactites: [...this.fallingStalactites],
            levelW: this.levelW,
            levelTheme: this.levelTheme,
            cameraX: this.cameraX,
            returnX: pipe.exitX || (pipe.x + 60),
            returnY: pipe.exitY || 100
        };

        this.levelTheme = 'cave';
        this.levelW = 480;
        this.cameraX = 0;

        this.platforms = [
            { x: 0, y: 200, w: 480, h: 40 },
            { x: 0, y: 0, w: 480, h: 20 },
            { x: 0, y: 0, w: 20, h: 200 },
            { x: 460, y: 0, w: 20, h: 200 },
            { x: 400, y: 150, w: 32, h: 50, type: 'pipe', isExitPipe: true }
        ];

        this.decorations = [
            { type: 'stalactite', x: 80, y: 20 },
            { type: 'stalactite', x: 200, y: 20 },
            { type: 'stalactite', x: 320, y: 20 }
        ];

        this.fallingStalactites = [];
        this.blocks = [];
        this.mushrooms = [];
        this.enemies = [];
        this.coins = [];

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 12; col++) {
                this.coins.push({ x: 80 + col * 24, y: 80 + row * 24, taken: false });
            }
        }

        this.player.x = 40;
        this.player.y = 150;
        this.pipeState = 'NONE';
    }

    exitBonusRoom() {
        if (!this.savedMainLevel) return;
        playSound('pipe');

        this.platforms = this.savedMainLevel.platforms;
        this.movingPlatforms = this.savedMainLevel.movingPlatforms;
        this.blocks = this.savedMainLevel.blocks;
        this.mushrooms = this.savedMainLevel.mushrooms;
        this.coins = this.savedMainLevel.coins;
        this.enemies = this.savedMainLevel.enemies;
        this.decorations = this.savedMainLevel.decorations;
        this.fallingStalactites = this.savedMainLevel.fallingStalactites || [];
        this.levelW = this.savedMainLevel.levelW;
        this.levelTheme = this.savedMainLevel.levelTheme;

        this.player.x = this.savedMainLevel.returnX;
        this.player.y = this.savedMainLevel.returnY;
        this.cameraX = Math.max(0, Math.min(this.player.x - this.renderer.VIEW_W / 3, this.levelW - this.renderer.VIEW_W));

        this.savedMainLevel = null;
        this.pipeState = 'NONE';
    }

    update() {
        if (this.player.invincible > 0) this.player.invincible--;

        if (this.gameState === STATE_INTRO) {
            this.introTimer++;
            if (this.introTimer > 280) {
                this.gameState = STATE_MAP;
            }
            return;
        }

        if (this.pipeState === 'ENTERING') {
            this.player.y += 1.2;
            this.pipeTimer++;
            if (this.pipeTimer > 25) {
                if (this.savedMainLevel) {
                    this.exitBonusRoom();
                } else {
                    this.enterBonusRoom(this.activePipe);
                }
            }
            return;
        }

        if (this.gameState === STATE_FLAG_ANIM) {
            if (this.player.y < this.flag.y + this.flag.h - this.player.h) {
                this.player.y += 2;
            } else {
                this.player.x += 1.5;
                if (this.player.x > this.flag.x + 65) {
                    this.gameState = STATE_QUIZ;
                }
            }
            return;
        }

        if (this.gameState === STATE_QUIZ && this.robotExploding) {
            this.robotExplodeTimer++;
            if (this.robotExplodeTimer > 40) {
                playSound('win');
                if (this.unlockedIslands < 5 && this.selectedIsland + 1 >= this.unlockedIslands) {
                    this.unlockedIslands = this.selectedIsland + 2;
                }
                this.gameState = STATE_LEVEL_CLEAR;
            }
            return;
        }

        if (this.gameState !== STATE_PLAYING) return;

        if (this.selectedIsland === 1 && Math.random() < 0.03) {
            this.enemies.push({
                type: 'bat',
                x: this.cameraX + this.renderer.VIEW_W + 10,
                y: 40 + Math.random() * 80,
                baseY: 40 + Math.random() * 80,
                w: 16, h: 12,
                floatSpeed: 0.06,
                floatRange: 15,
                angle: 0
            });
        }

        if (this.selectedIsland === 3 && Math.random() < 0.025) { 
            this.enemies.push({ 
                type: 'bird', 
                x: this.cameraX + this.renderer.VIEW_W + 10, 
                y: this.player.y - 60 + Math.random() * 120, 
                w: 16, h: 12, 
                vx: - (2 + Math.random() * 1.5) 
            });
        }

        if (keys['ArrowRight'] || keys['KeyD']) {
            this.player.vx = this.player.speed;
            this.player.facing = 'right';
            this.player.animTimer++;
        } else if (keys['ArrowLeft'] || keys['KeyA']) {
            this.player.vx = -this.player.speed;
            this.player.facing = 'left';
            this.player.animTimer++;
        } else {
            this.player.vx = 0;
            this.player.animFrame = 0;
        }

        if (this.player.animTimer > 5) {
            this.player.animFrame = this.player.animFrame === 0 ? 1 : 0;
            this.player.animTimer = 0;
        }

        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && this.player.grounded) {
            this.player.vy = this.player.jumpPower;
            this.player.grounded = false;
            playSound('jump');
        }

        if (this.player.grounded && (keys['ArrowDown'] || keys['KeyS'])) {
            const pipe = this.platforms.find(p => p.type === 'pipe' &&
                this.player.x + this.player.w > p.x + 4 &&
                this.player.x < p.x + p.w - 4 &&
                Math.abs((this.player.y + this.player.h) - p.y) < 6
            );

            if (pipe && (pipe.isEnterable || pipe.isExitPipe)) {
                this.pipeState = 'ENTERING';
                this.pipeTimer = 0;
                this.activePipe = pipe;
                this.player.vx = 0;
                this.player.x = pipe.x + (pipe.w - this.player.w) / 2;
                return;
            }
        }

        this.player.vy += 0.48; 
        this.player.x += this.player.vx;

        this.platforms.concat(this.movingPlatforms).forEach(p => {
            if (checkColl(this.player, p)) {
                if (this.player.vx > 0) this.player.x = p.x - this.player.w;
                if (this.player.vx < 0) this.player.x = p.x + p.w;
            }
        });

        this.player.y += this.player.vy;
        this.player.grounded = false;

        this.platforms.concat(this.movingPlatforms).forEach(p => {
            if (checkColl(this.player, p)) {
                if (this.player.vy > 0 && (this.player.y + this.player.h - this.player.vy) <= p.y + 8) {
                    this.player.y = p.y - this.player.h;
                    this.player.vy = 0;
                    this.player.grounded = true;
                    if (p.vx) this.player.x += p.vx;
                } else if (this.player.vy < 0) {
                    this.player.y = p.y + p.h;
                    this.player.vy = 0;
                }
            }
        });

        this.fallingStalactites.forEach(st => {
            if (!st.hasLanded) {
                if (!st.isFalling && Math.abs((this.player.x + this.player.w / 2) - (st.x + st.w / 2)) < 60) {
                    st.isFalling = true;
                }

                if (st.isFalling) {
                    st.vy += 0.35;
                    st.y += st.vy;

                    this.platforms.forEach(p => {
                        if (checkColl(st, p)) {
                            st.hasLanded = true;
                            st.vy = 0;
                        }
                    });

                    if (checkColl(this.player, st) && this.player.invincible === 0) {
                        if (this.player.isBig) {
                            this.player.isBig = false;
                            this.player.h = 20;
                            this.player.invincible = 80;
                            playSound('hit');
                        } else {
                            playSound('hit');
                            this.lives--;
                            if (this.lives < 0) {
                                this.gameState = STATE_GAMEOVER;
                            } else {
                                this.loadLevel(this.selectedIsland);
                            }
                        }
                    }
                }
            }
        });

        this.movingPlatforms.forEach(mp => {
            mp.x += mp.vx;
            if (mp.x < mp.minX || mp.x + mp.w > mp.maxX) mp.vx *= -1;
        });

        this.blocks.forEach((b, index) => {
            if (checkColl(this.player, b)) {
                if (this.player.vy < 0 && this.player.y + this.player.vy <= b.y + b.h) {
                    this.player.vy = 1;
                    if (b.type === 'question' && !b.hit) {
                        b.hit = true;
                        if (b.content === 'mushroom') {
                            this.mushrooms.push({ x: b.x, y: b.y - 16, w: 16, h: 16, vx: 1.1 });
                            playSound('powerup');
                        } else if (b.content === 'coin') {
                            this.score += 100;
                            this.coinsCount++;
                            playSound('coin');
                        }
                    } else if (b.type === 'brick') {
                        if (this.player.isBig) {
                            this.blocks.splice(index, 1);
                            playSound('break');
                        } else {
                            playSound('hit');
                        }
                    }
                } else if (this.player.vy > 0 && this.player.y + this.player.h - this.player.vy <= b.y + 6) {
                    this.player.y = b.y - this.player.h;
                    this.player.vy = 0;
                    this.player.grounded = true;
                }
            }
        });

        this.mushrooms.forEach((m, idx) => {
            m.x += m.vx;
            if (checkColl(this.player, m)) {
                this.mushrooms.splice(idx, 1);
                if (!this.player.isBig) {
                    this.player.isBig = true;
                    this.player.h = 28;
                    this.player.y -= 8;
                }
                this.score += 1000;
                playSound('powerup');
            }
        });

        if (this.player.y > this.renderer.VIEW_H + 40) {
            playSound('hit');
            this.lives--;
            if (this.lives < 0) {
                this.gameState = STATE_GAMEOVER;
            } else {
                this.loadLevel(this.selectedIsland);
            }
        }

        this.cameraX = Math.max(0, Math.min(this.player.x - this.renderer.VIEW_W / 3, this.levelW - this.renderer.VIEW_W));

        this.coins.forEach(c => {
            if (!c.taken && checkColl(this.player, { x: c.x, y: c.y, w: 12, h: 12 })) {
                c.taken = true;
                this.score += 100;
                this.coinsCount++;
                playSound('coin');
            }
        });

        this.enemies.forEach(e => {
            if (e.type === 'plant') {
                e.timer += 0.04;
                const offset = Math.sin(e.timer) * 22;
                e.y = Math.abs(this.player.x - e.pipeX) < 35 ? e.pipeY : e.pipeY - Math.max(0, offset);
                e.x = e.pipeX + 8;
            } else if (e.type === 'fire_pillar') {
                e.timer += 0.04;
                const offset = Math.sin(e.timer) * 40;
                e.y = e.baseY - Math.max(0, offset);
            } else if (e.type === 'goomba') {
                e.x += e.vx;
                if (e.x < e.minX || e.x + e.w > e.maxX) e.vx *= -1;
            } else if (e.type === 'bat' || e.type === 'fish') {
                e.angle += e.floatSpeed;
                e.y = e.baseY + Math.sin(e.angle) * e.floatRange;
                if (e.type === 'bat') e.x -= 0.8;
            } else if (e.type === 'bird') {
                e.x += e.vx;
                e.y += Math.sin(Date.now() * 0.01) * 0.8;
            } else if (e.type === 'energy_ball') {
                e.y += 3.2;
                if (e.y > 210) e.x = -999;
            } else if (e.type === 'spaceship_boss') {
                if (e.invuln > 0) e.invuln--;
                e.x += e.vx;
                e.y += e.vy;
                if (e.x < e.minX || e.x + e.w > e.maxX) e.vx *= -1;
                if (e.y < e.minY || e.y + e.h > e.maxY) e.vy *= -1;

                if (Math.random() < 0.022 && e.hp > 0) {
                    this.enemies.push({ 
                        type: 'energy_ball', 
                        x: e.x + e.w / 2 - 5, 
                        y: e.y + e.h, 
                        w: 10, h: 10 
                    });
                }
            }

            if (checkColl(this.player, e)) {
                let canStomp = (e.type !== 'fire_pillar' && e.type !== 'energy_ball' && e.type !== 'plant');

                if (canStomp && this.player.vy > 0 && (this.player.y + this.player.h - this.player.vy) <= e.y + 12) {
                    if (e.type === 'spaceship_boss') {
                        if (e.invuln <= 0 && e.hp > 0) {
                            e.hp--;
                            this.player.vy = -6;
                            e.invuln = 35;
                            playSound('hit');
                            if (e.hp <= 0) {
                                e.x = -999;
                                this.score += 5000;
                                playSound('coin');
                            }
                        } else {
                            this.player.vy = -6;
                        }
                    } else {
                        e.x = -999;
                        this.player.vy = -6;
                        this.score += 200;
                        playSound('coin');
                    }
                } else if (this.player.invincible === 0) {
                    if (e.type === 'spaceship_boss' && e.hp <= 0) return; 
                    
                    if (this.player.isBig) {
                        this.player.isBig = false;
                        this.player.h = 20;
                        this.player.invincible = 80;
                        playSound('hit');
                    } else {
                        playSound('hit');
                        this.lives--;
                        if (this.lives < 0) {
                            this.gameState = STATE_GAMEOVER;
                        } else {
                            this.loadLevel(this.selectedIsland);
                        }
                    }
                }
            }
        });

        if (checkColl(this.player, this.flag)) {
            if (this.selectedIsland === 4 && this.enemies.some(e => e.type === 'spaceship_boss' && e.hp > 0)) return;
            
            stopBGM();
            playSound('jump');
            this.gameState = STATE_FLAG_ANIM;
        }
    }

    render() {
        const ctx = this.renderer.ctx;
        this.renderer.clear();

        if (this.gameState === STATE_MENU) {
            ctx.fillStyle = PALETTE.c0;
            ctx.font = 'bold 18px monospace';
            ctx.fillText("SUPER GAMEBOY", 100, 75);
            ctx.fillText("MARIO LAND", 120, 105);
            ctx.font = '11px monospace';
            if (Math.floor(Date.now() / 400) % 2 === 0) {
                ctx.fillText("PRESIONA ESPACIO PARA INICIAR", 60, 165);
            }
            return;
        }

        if (this.gameState === STATE_INTRO) {
            ctx.fillStyle = PALETTE.c0;
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("¡ALERTA EN EL SISTEMA!", this.renderer.VIEW_W / 2, 22);

            let marioX = 80;
            let broX = 120;
            let groundY = 135;

            this.renderer.drawPlayerSprite({ ...this.player, x: marioX, y: groundY - 20, facing: 'right', animFrame: 0, grounded: true }, 0);

            let beamX = 120;
            let beamY = 40;

            if (this.introTimer > 50) {
                ctx.fillStyle = PALETTE.c2;
                ctx.globalAlpha = 0.45;
                ctx.beginPath();
                ctx.moveTo(beamX + 20, beamY + 15);
                ctx.lineTo(broX - 10, groundY);
                ctx.lineTo(broX + 30, groundY);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1.0;

                if (this.introTimer > 85) {
                    groundY -= Math.min(50, (this.introTimer - 85) * 1.5);
                }
            }

            ctx.save();
            ctx.translate(broX, groundY - 20);
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(2, 0, 10, 3);
            ctx.fillStyle = PALETTE.c1; 
            ctx.fillRect(2, 3, 11, 2);
            ctx.fillStyle = PALETTE.c2;
            ctx.fillRect(2, 5, 10, 4);
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(3, 9, 8, 6);
            ctx.fillRect(2, 15, 4, 5);
            ctx.fillRect(8, 15, 4, 5);
            ctx.restore();

            this.renderer.drawIntroProgrammers(75, 35, this.introTimer);

            ctx.fillStyle = PALETTE.c0;
            ctx.textAlign = 'center';

            if (this.introTimer > 85 && this.introTimer < 180) {
                ctx.font = 'bold 11px monospace';
                ctx.fillText("¡¡AHHH, AYUDAAAAAA!!", this.renderer.VIEW_W / 2, Math.max(75, groundY - 28));
            }

            if (this.introTimer > 180) {
                ctx.font = 'bold 12px monospace';
                ctx.fillText("4 programadores se llevaron", this.renderer.VIEW_W / 2, 108);
                ctx.fillText("a tu hermano, ve a salvarlo", this.renderer.VIEW_W / 2, 124);
            }

            if (Math.floor(this.introTimer / 30) % 2 === 0) {
                ctx.font = 'bold 10px monospace';
                ctx.fillText("PRESIONA ESPACIO PARA OMITIR", this.renderer.VIEW_W / 2, 155);
            }

            ctx.textAlign = 'left';
            return;
        }

        if (this.gameState === STATE_MAP) {
            ctx.fillStyle = PALETTE.c0;
            ctx.font = 'bold 15px monospace';
            ctx.fillText("SELECCIÓN DE ISLAS", 95, 38);

            for (let i = 0; i < 5; i++) {
                const ix = 45 + i * 66;
                const iy = 105;
                ctx.fillStyle = (i < this.unlockedIslands) ? PALETTE.c1 : PALETTE.c0;
                ctx.fillRect(ix, iy, 42, 32);
                ctx.fillStyle = PALETTE.c3;
                ctx.font = 'bold 12px monospace';
                ctx.fillText(`${i + 1}`, ix + 17, iy + 21);

                if (i === this.selectedIsland) {
                    ctx.strokeStyle = PALETTE.c0;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(ix - 4, iy - 4, 50, 40);
                }
            }

            ctx.fillStyle = PALETTE.c0;
            ctx.font = 'bold 11px monospace';
            ctx.fillText(ISLAND_NAMES[this.selectedIsland], 45, 175);
            ctx.font = '10px monospace';
            ctx.fillText("FLECHAS: MOVERSE | ESPACIO: JUGAR", 70, 210);
            return;
        }

        if (this.levelTheme === 'birabuto') {
            this.renderer.drawCloud(120, 35, this.cameraX);
            this.renderer.drawCloud(450, 25, this.cameraX);
            this.renderer.drawCloud(800, 30, this.cameraX);
            this.decorations.forEach(d => {
                if (d.type === 'pyramid') this.renderer.drawPyramid(d.x, d.size, this.cameraX);
                if (d.type === 'palm') this.renderer.drawPalmTree(d.x, d.y, this.cameraX);
            });
        } else if (this.levelTheme === 'cave') {
            ctx.fillStyle = PALETTE.c0;
            this.decorations.forEach(d => {
                if (d.type !== 'stalactite') {
                    const dx = Math.floor(d.x - this.cameraX);
                    ctx.beginPath();
                    ctx.moveTo(dx, 0); ctx.lineTo(dx + 10, 25); ctx.lineTo(dx + 20, 0);
                    ctx.fill();
                }
            });
        } else if (this.levelTheme === 'water') {
            this.decorations.forEach(d => {
                const dx = Math.floor(d.x - this.cameraX);
                ctx.fillStyle = PALETTE.c1;
                ctx.fillRect(dx, d.y, 20, 80);
                ctx.fillStyle = PALETTE.c0;
                ctx.strokeRect(dx, d.y, 20, 80);
            });
        } else if (this.levelTheme === 'sky') {
            for(let i = 0; i < this.levelW; i += 90) {
                this.renderer.drawCloud(i, 15 + ((i / 90) % 4) * 25, this.cameraX);
            }
        } else if (this.levelTheme === 'castle') {
            ctx.fillStyle = PALETTE.c0;
            this.decorations.forEach(d => {
                const dx = Math.floor(d.x - this.cameraX);
                ctx.fillRect(dx, d.y, 16, 24);
                ctx.fillStyle = PALETTE.c3;
                ctx.fillRect(dx + 2, d.y + 2, 12, 20);
            });
        }

        if (this.fallingStalactites.length > 0) {
            ctx.fillStyle = PALETTE.c0;
            this.fallingStalactites.forEach(st => {
                const sx = Math.floor(st.x - this.cameraX);
                ctx.beginPath();
                ctx.moveTo(sx, st.y);
                ctx.lineTo(sx + 10, st.y + st.h);
                ctx.lineTo(sx + 20, st.y);
                ctx.closePath();
                ctx.fill();
            });
        }

        this.enemies.forEach(e => {
            if (e.type === 'plant' || e.type === 'fire_pillar') this.renderer.drawEnemy(e, this.cameraX);
        });

        this.platforms.forEach(p => this.renderer.drawGroundPlatform(p, this.cameraX));
        this.movingPlatforms.forEach(mp => {
            const mpx = Math.floor(mp.x - this.cameraX);
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(mpx, mp.y, mp.w, mp.h);
            ctx.fillStyle = PALETTE.c2;
            ctx.fillRect(mpx + 2, mp.y + 2, mp.w - 4, mp.h - 4);
        });

        this.blocks.forEach(b => this.renderer.drawBlock(b, this.cameraX));
        this.mushrooms.forEach(m => this.renderer.drawMushroom(m, this.cameraX));

        ctx.fillStyle = PALETTE.c0;
        this.coins.forEach(c => {
            if (!c.taken) {
                const cx = Math.floor(c.x - this.cameraX);
                ctx.beginPath();
                ctx.arc(cx + 6, c.y + 6, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        this.enemies.forEach(e => {
            if (e.type !== 'plant' && e.type !== 'fire_pillar') this.renderer.drawEnemy(e, this.cameraX);
        });

        let bossIsAlive = this.selectedIsland === 4 && this.enemies.some(e => e.type === 'spaceship_boss' && e.hp > 0);
        if (!bossIsAlive) {
            const fx = Math.floor(this.flag.x - this.cameraX);
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(fx, this.flag.y, 4, this.flag.h);
            ctx.beginPath();
            ctx.arc(fx + 2, this.flag.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.c1;
            ctx.fillRect(fx + 4, this.flag.y + 10, 24, 15);
        }

        this.renderer.drawPlayerSprite(this.player, this.cameraX);

        if (this.gameState === STATE_QUIZ) {
            const rx = Math.floor(this.flag.x + 110 - this.cameraX);
            const ry = 145;

            if (!this.robotExploding) {
                ctx.fillStyle = PALETTE.c0;
                ctx.fillRect(rx, ry, 26, 30);
                ctx.fillStyle = PALETTE.c3;
                ctx.fillRect(rx + 4, ry + 5, 6, 6);
                ctx.fillRect(rx + 16, ry + 5, 6, 6);
                ctx.fillStyle = PALETTE.c0;
                ctx.fillRect(rx + 11, ry - 8, 4, 8);
                ctx.fillRect(rx + 9, ry - 12, 8, 4);
            } else {
                ctx.fillStyle = (this.robotExplodeTimer % 4 === 0) ? PALETTE.c0 : PALETTE.c1;
                ctx.beginPath();
                ctx.arc(rx + 13, ry + 15, 12 + this.robotExplodeTimer * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }

            if (!this.robotExploding) {
                const currentQuiz = QUIZ_QUESTIONS[this.selectedIsland] || QUIZ_QUESTIONS[0];

                ctx.fillStyle = PALETTE.c0;
                ctx.fillRect(15, 40, 350, 115);
                ctx.fillStyle = PALETTE.c3;
                ctx.fillRect(18, 43, 344, 109);

                ctx.fillStyle = PALETTE.c0;
                ctx.font = 'bold 11px monospace';
                ctx.fillText("ROBOT DE COMPUTACIÓN:", 26, 57);

                ctx.font = 'bold 10px monospace';
                ctx.fillText(currentQuiz.question, 26, 73);

                const optPositions = [
                    { x: 26, y: 91 },
                    { x: 180, y: 91 },
                    { x: 26, y: 109 },
                    { x: 180, y: 109 }
                ];

                ctx.font = '10px monospace';
                for (let i = 0; i < 4; i++) {
                    const pos = optPositions[i];
                    if (this.quizSelectedIndex === i) {
                        ctx.fillStyle = PALETTE.c0;
                        ctx.fillRect(pos.x - 3, pos.y - 10, 145, 13);
                        ctx.fillStyle = PALETTE.c3;
                        ctx.fillText(`> ${currentQuiz.options[i]}`, pos.x - 2, pos.y);
                    } else {
                        ctx.fillStyle = PALETTE.c0;
                        ctx.fillText(currentQuiz.options[i], pos.x, pos.y);
                    }
                }

                ctx.fillStyle = PALETTE.c0;
                ctx.font = 'bold 9px monospace';
                ctx.fillText("Navega con FLECHAS y presiona ENTER", 26, 137);
            }
        }

        // HUD Superior
        ctx.fillStyle = PALETTE.c0;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`MARIOx${(this.lives + 1).toString().padStart(2, '0')}`, 12, 16);
        ctx.fillText(`WORLD`, 160, 16);
        ctx.fillText(`TIME`, 300, 16);

        ctx.fillText(`${this.score.toString().padStart(6, '0')}`, 12, 28);
        ctx.fillText(`Ox${this.coinsCount.toString().padStart(2, '0')}`, 100, 28);
        ctx.fillText(`1-${this.selectedIsland + 1}`, 170, 28);
        ctx.fillText(`${this.levelTimer.toString().padStart(3, '0')}`, 305, 28);

        if (this.gameState === STATE_LEVEL_CLEAR) {
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(60, 75, 260, 70);
            ctx.fillStyle = PALETTE.c3;
            ctx.font = 'bold 14px monospace';
            ctx.fillText("¡NIVEL COMPLETADO!", 100, 105);
            ctx.font = '10px monospace';
            ctx.fillText("PRESIONA ESPACIO PARA CONTINUAR", 75, 128);
        } else if (this.gameState === STATE_GAMEOVER) {
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(80, 75, 220, 65);
            ctx.fillStyle = PALETTE.c3;
            ctx.font = 'bold 16px monospace';
            ctx.fillText("¡FIN DEL JUEGO!", 115, 105);
            ctx.font = '10px monospace';
            ctx.fillText("PRESIONA ESPACIO PARA REINTENTAR", 85, 125);
        } else if (this.gameState === STATE_WIN_GAME) {
            ctx.fillStyle = PALETTE.c0;
            ctx.fillRect(35, 65, 310, 85);
            ctx.fillStyle = PALETTE.c3;
            ctx.font = 'bold 15px monospace';
            ctx.fillText("¡FELICITACIONES!", 115, 95);
            ctx.fillText("¡SALVASTE A TU HERMANO, FELICIDADES!", 45, 115);
            ctx.font = '10px monospace';
            ctx.fillText("PRESIONA ESPACIO PARA VOLVER AL MAPA", 65, 138);
        }
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});