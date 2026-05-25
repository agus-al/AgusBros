// ==================== SETUP CANVAS ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// ==================== KONSTANTA GAME ====================
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 3;
const GROUND_Y = 350; // Posisi lantai

// ==================== OBJEK GAME ====================
let mario = {
    x: 100,
    y: GROUND_Y - 50, // Posisi awal di atas lantai
    width: 30,
    height: 50,
    velX: 0,
    velY: 0,
    isJumping: false,
    isOnGround: true
};

let blocks = [
    { x: 200, y: GROUND_Y - 30, width: 40, height: 30, type: 'block' },
    { x: 300, y: GROUND_Y - 30, width: 40, height: 30, type: 'block' },
    { x: 400, y: GROUND_Y - 60, width: 40, height: 30, type: 'question' },
    { x: 500, y: GROUND_Y - 30, width: 40, height: 30, type: 'block' }
];

let enemies = [
    { x: 350, y: GROUND_Y - 30, width: 30, height: 30, velX: 1, direction: 1 }
];

let coins = [
    { x: 410, y: GROUND_Y - 100, width: 20, height: 20, collected: false }
];

let score = 0;

// ==================== KONTROL ====================
let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ==================== UPDATE GAME ====================
function update() {
    // Gerakan horizontal
    if (keys['ArrowLeft']) {
        mario.velX = -MOVE_SPEED;
    } else if (keys['ArrowRight']) {
        mario.velX = MOVE_SPEED;
    } else {
        mario.velX *= 0.7; // Gesekan agar berhenti perlahan
    }

    // Lompat
    if (keys['ArrowUp'] && mario.isOnGround) {
        mario.velY = JUMP_FORCE;
        mario.isOnGround = false;
    }

    // Terapkan gravitasi
    mario.velY += GRAVITY;
    
    // Update posisi
    mario.x += mario.velX;
    mario.y += mario.velY;

    // Cek batas layar (Mario tidak bisa keluar dari kiri)
    if (mario.x < 0) mario.x = 0;
    if (mario.x + mario.width > canvas.width) mario.x = canvas.width - mario.width;

    // Cek tabrakan dengan lantai
    if (mario.y + mario.height > GROUND_Y) {
        mario.y = GROUND_Y - mario.height;
        mario.velY = 0;
        mario.isOnGround = true;
    } else {
        mario.isOnGround = false;
    }

    // Cek tabrakan dengan blok
    blocks.forEach(block => {
        if (collision(mario, block)) {
            // Tabrakan dari atas
            if (mario.velY > 0 && mario.y + mario.height - mario.velY <= block.y) {
                mario.y = block.y - mario.height;
                mario.velY = 0;
                mario.isOnGround = true;
            }
            // Tabrakan dari bawah
            else if (mario.velY < 0 && mario.y >= block.y + block.height) {
                mario.y = block.y + block.height;
                mario.velY = 0;
                
                // Jika blok adalah tanda tanya, keluarkan koin
                if (block.type === 'question') {
                    block.type = 'block'; // Berubah jadi blok biasa
                    score += 100;
                    scoreElement.textContent = score;
                }
            }
            // Tabrakan dari samping
            else {
                if (mario.x < block.x) {
                    mario.x = block.x - mario.width;
                } else {
                    mario.x = block.x + block.width;
                }
                mario.velX = 0;
            }
        }
    });

    // Update musuh
    enemies.forEach(enemy => {
        enemy.x += enemy.velX * enemy.direction;
        
        // Balik arah jika mentok
        if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
            enemy.direction *= -1;
        }

        // Cek tabrakan dengan Mario
        if (collision(mario, enemy)) {
            // Mario menginjak musuh
            if (mario.velY > 0 && mario.y + mario.height - mario.velY <= enemy.y) {
                enemies = enemies.filter(e => e !== enemy); // Hapus musuh
                score += 200;
                scoreElement.textContent = score;
                mario.velY = JUMP_FORCE / 2; // Mantul sedikit
            } else {
                // Mario kena musuh, reset posisi
                resetGame();
            }
        }
    });

    // Update koin
    coins.forEach(coin => {
        if (!coin.collected && collision(mario, coin)) {
            coin.collected = true;
            score += 50;
            scoreElement.textContent = score;
        }
    });

    // Kamera mengikuti Mario (scrolling sederhana)
    if (mario.x > canvas.width / 2) {
        let offset = mario.x - canvas.width / 2;
        // Geser semua objek ke kiri
        blocks.forEach(block => block.x -= offset);
        enemies.forEach(enemy => enemy.x -= offset);
        coins.forEach(coin => coin.x -= offset);
        mario.x = canvas.width / 2;
    }
}

// ==================== FUNGSI CEK TABRAKAN ====================
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==================== FUNGSI RESET ====================
function resetGame() {
    mario.x = 100;
    mario.y = GROUND_Y - 50;
    mario.velX = 0;
    mario.velY = 0;
    score = 0;
    scoreElement.textContent = score;
    
    // Reset posisi objek
    blocks = [
        { x: 200, y: GROUND_Y - 30, width: 40, height: 30, type: 'block' },
        { x: 300, y: GROUND_Y - 30, width: 40, height: 30, type: 'block' },
        { x: 400, y: GROUND_Y - 60, width: 40, height: 30, type: 'question' },
        { x: 500, y: GROUND_Y - 30, width: 40, height: 30, type: 'block' }
    ];
    
    enemies = [
        { x: 350, y: GROUND_Y - 30, width: 30, height: 30, velX: 1, direction: 1 }
    ];
    
    coins = [
        { x: 410, y: GROUND_Y - 100, width: 20, height: 20, collected: false }
    ];
}

// ==================== RENDER GAME ====================
function draw() {
    // Bersihkan canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar lantai
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, 10);
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, GROUND_Y + 10, canvas.width, canvas.height - GROUND_Y - 10);

    // Gambar blok
    blocks.forEach(block => {
        if (block.type === 'question') {
            ctx.fillStyle = '#FFD700'; // Emas untuk blok tanda tanya
        } else {
            ctx.fillStyle = '#B8860B'; // Coklat untuk blok biasa
        }
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Gambar tanda tanya
        if (block.type === 'question') {
            ctx.fillStyle = '#FFF';
            ctx.font = '20px Arial';
            ctx.fillText('?', block.x + 10, block.y + 25);
        }
    });

    // Gambar koin
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Gambar musuh
    enemies.forEach(enemy => {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Mata musuh
        ctx.fillStyle = '#FFF';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
    });

    // Gambar Mario
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(mario.x, mario.y, mario.width, mario.height);
    // Topi Mario
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(mario.x + 5, mario.y - 5, 20, 5);
    // Kumis/kancing
    ctx.fillStyle = '#FFF';
    ctx.fillRect(mario.x + 10, mario.y + 15, 5, 5);
    ctx.fillRect(mario.x + 15, mario.y + 15, 5, 5);
}

// ==================== LOOP UTAMA GAME ====================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Mulai game
gameLoop();