export class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 40;
        this.y = 100;
        this.w = 14;
        this.h = 20;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3.2;
        this.jumpPower = -9.6;
        this.grounded = false;
        this.facing = 'right';
        this.isBig = false;
        this.invincible = 0;
        this.animFrame = 0;
        this.animTimer = 0;
    }
}

export function checkColl(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}