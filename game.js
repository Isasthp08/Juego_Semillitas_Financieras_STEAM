// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 450;
canvas.height = 550;

// Variables del juego
let score = 0;
let missed = 0;
let gameRunning = false; // No iniciar automáticamente
let gameStarted = false;
let objectsSpawned = 0;
let initialGoodObjectsSpawned = 0;
const INITIAL_GOOD_OBJECTS = 3;

// Variables de dificultad
let gameTime = 0; // Tiempo de juego en frames
let difficultyLevel = 1; // Nivel de dificultad
const DIFFICULTY_INCREASE_INTERVAL = 1800; // Aumenta dificultad cada ~30 segundos (60fps * 30s)

// Objetos buenos (+5 puntos)
const GOOD_OBJECTS = [
    { emoji: '💻', name: 'Computadora' },
    { emoji: '📚', name: 'Libro' },
    { emoji: '🏠', name: 'Casa' },
    { emoji: '💼', name: 'Maletín' }
];

// Objetos malos (-15 puntos)
const BAD_OBJECTS = [
    { emoji: '🚗', name: 'Carro de Lujo' },
    { emoji: '🍬', name: 'Dulces' },
    { emoji: '🎮', name: 'Juego de Consola' },
    { emoji: '📱', name: 'Celular' }
];

// Clase del Gatito
class Cat {
    constructor() {
        this.width = 60;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 15;
        this.speed = 8;
        this.bodyColor = '#FFA500'; // Naranja
        this.bellyColor = '#FFF8DC'; // Beige claro
    }

    draw() {
        ctx.save();
        const cx = this.x + this.width / 2;
        const headY = this.y + 12;
        const bodyY = this.y + this.height / 2 + 8;
        const bodyW = this.width + 8;
        const bodyH = this.height + 10;

        // Sombra sutil debajo
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(cx, bodyY + bodyH/3 + 6, bodyW/3, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(cx, bodyY, bodyW/3, bodyH/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Panza clara
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(cx, bodyY + 8, bodyW/4, bodyH/4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cola detrás (curva hacia arriba)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.moveTo(cx + bodyW/3 - 6, bodyY - 6);
        ctx.quadraticCurveTo(cx + bodyW + 6, bodyY - 34, cx + bodyW/2 + 8, bodyY + 22);
        ctx.quadraticCurveTo(cx + bodyW + 2, bodyY + 8, cx + bodyW/2 - 6, bodyY - 6);
        ctx.fill();

        // Cabeza (ligeramente ovalada)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(cx, headY, 20, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Orejas triangulares con interior
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.moveTo(cx - 14, headY - 8);
        ctx.lineTo(cx - 28, headY - 30);
        ctx.lineTo(cx - 2, headY - 14);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 12, headY - 8);
        ctx.lineTo(cx + 26, headY - 30);
        ctx.lineTo(cx + 2, headY - 14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFCBCB';
        ctx.beginPath();
        ctx.moveTo(cx - 10, headY - 10);
        ctx.lineTo(cx - 20, headY - 24);
        ctx.lineTo(cx - 4, headY - 14);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 10, headY - 10);
        ctx.lineTo(cx + 20, headY - 24);
        ctx.lineTo(cx + 4, headY - 14);
        ctx.closePath();
        ctx.fill();

        // Mejillas (suavizan la transición cabeza-cuerpo)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(cx - 12, headY + 6, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 12, headY + 6, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ojos almendrados con brillo
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx - 7, headY, 6, 9, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 7, headY, 6, 9, 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas verticales
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(cx - 7, headY + 1, 2.8, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 7, headY + 1, 2.8, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brillo en ojos
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(cx - 9, headY - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 5, headY - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Nariz pequeña
        ctx.fillStyle = '#FF8DAA';
        ctx.beginPath();
        ctx.moveTo(cx, headY + 6);
        ctx.lineTo(cx - 4, headY + 10);
        ctx.lineTo(cx + 4, headY + 10);
        ctx.closePath();
        ctx.fill();

        // Boca simple y alegre
        ctx.strokeStyle = '#6b3b2b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, headY + 10);
        ctx.quadraticCurveTo(cx - 4, headY + 14, cx - 10, headY + 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, headY + 10);
        ctx.quadraticCurveTo(cx + 4, headY + 14, cx + 10, headY + 12);
        ctx.stroke();

        // Bigotes (tres por lado)
        ctx.strokeStyle = 'rgba(30,30,30,0.9)';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 4, headY + 8 + i * 3);
            ctx.quadraticCurveTo(cx - 22, headY + 6 + i * 3, cx - 28, headY + 6 + i * 3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx + 4, headY + 8 + i * 3);
            ctx.quadraticCurveTo(cx + 22, headY + 6 + i * 3, cx + 28, headY + 6 + i * 3);
            ctx.stroke();
        }

        // Patas delanteras 
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(cx - 13, bodyY + 16, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 13, bodyY + 16, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Patita trasera visible (perfil)
        ctx.beginPath();
        ctx.ellipse(cx + 13, bodyY + 16, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rayitas sutiles en la espalda (opcional)
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 6, bodyY - 8);
        ctx.lineTo(cx - 2, bodyY - 2);
        ctx.moveTo(cx + 6, bodyY - 10);
        ctx.lineTo(cx + 10, bodyY - 4);
        ctx.stroke();

        // Contorno fino para definición
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, headY, 20, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, bodyY, bodyW/3, bodyH/3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    update() {
        // Movimiento con teclado
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Clase de Objetos que Caen
class FallingObject {
    constructor(type, isGood, speedMultiplier = 1) {
        this.type = type;
        this.isGood = isGood;
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        // Velocidad base aumenta con el multiplicador de dificultad
        this.baseSpeed = 4 + Math.random() * 3;
        this.speed = this.baseSpeed * speedMultiplier;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.emoji, 0, 0);
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Instancias
const cat = new Cat();
const fallingObjects = [];
let keys = {};

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// --- Controles táctiles: botones y arrastre sobre canvas ---
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const mobileControls = document.getElementById('mobileControls');

// Bind táctil a botones (mantener presionado)
if (leftBtn && rightBtn) {
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; });
    leftBtn.addEventListener('touchend',   (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
    leftBtn.addEventListener('touchcancel',(e) => { keys['ArrowLeft'] = false; });

    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; });
    rightBtn.addEventListener('touchend',   (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
    rightBtn.addEventListener('touchcancel',(e) => { keys['ArrowRight'] = false; });
}

// Permitir mover el gatito tocando/arrastrando sobre el canvas
let activeTouchId = null;
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        const t = e.touches[0];
        activeTouchId = t.identifier;
        const rect = canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        cat.x = Math.max(0, Math.min(canvas.width - cat.width, x - cat.width / 2));
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (activeTouchId === null || t.identifier === activeTouchId) {
            const rect = canvas.getBoundingClientRect();
            const x = t.clientX - rect.left;
            cat.x = Math.max(0, Math.min(canvas.width - cat.width, x - cat.width / 2));
            e.preventDefault();
            break;
        }
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    activeTouchId = null;
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
}, { passive: true });

// --- Nuevas funciones para mostrar/ocultar y posicionar los controles móviles ---
function isTouchDevice() {
    return (('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
}

// Mostrar sólo si es dispositivo táctil Y (pantalla pequeña o puntero coarse)
function shouldShowMobileControls() {
    const isTouch = isTouchDevice();
    const isNarrow = window.matchMedia('(max-width: 820px)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    return isTouch && (isNarrow || coarsePointer);
}

function showMobileControlsUnderInstructions() {
    if (!shouldShowMobileControls() || !mobileControls) return; // mostrar sólo en móviles reales / pantallas pequeñas
    const instructionsEl = document.querySelector('.instructions');
    if (instructionsEl) {
        instructionsEl.insertAdjacentElement('afterend', mobileControls);
        mobileControls.classList.remove('hidden');
    } else {
        const container = document.querySelector('.container');
        if (container) container.appendChild(mobileControls);
        mobileControls.classList.remove('hidden');
    }
}

function hideMobileControls() {
    if (!mobileControls) return;
    mobileControls.classList.add('hidden');
}

// ocultar/mostrar dinámicamente si cambia el tamaño o la orientación
window.addEventListener('resize', () => {
    if (!shouldShowMobileControls()) hideMobileControls();
});
window.addEventListener('orientationchange', () => {
    if (!shouldShowMobileControls()) hideMobileControls();
});

// Mostrar controles móviles si el dispositivo es táctil (opcional)
// function detectAndShowMobileControls() {
//     if ('ontouchstart' in window && mobileControls) {
//         // quitar la clase hidden para que CSS los muestre en mobile
//         mobileControls.classList.remove('hidden');
//     }
// }
// detectAndShowMobileControls();

// Función para generar un objeto
function spawnObject() {
    let isGood;
    let objectType;

    // Calcular probabilidad de objetos buenos (disminuye con la dificultad)
    // Inicia en 60%, pero disminuye gradualmente a 50% con mayor dificultad
    const goodObjectProbability = Math.max(0.5, 0.6 - (difficultyLevel - 1) * 0.02);

    // Primero spawnear 3 objetos buenos
    if (initialGoodObjectsSpawned < INITIAL_GOOD_OBJECTS) {
        isGood = true;
        objectType = GOOD_OBJECTS[Math.floor(Math.random() * GOOD_OBJECTS.length)];
        initialGoodObjectsSpawned++;
    } else {
        // Después, objetos aleatorios (buenos o malos) basado en probabilidad ajustada
        isGood = Math.random() < goodObjectProbability;
        if (isGood) {
            objectType = GOOD_OBJECTS[Math.floor(Math.random() * GOOD_OBJECTS.length)];
        } else {
            objectType = BAD_OBJECTS[Math.floor(Math.random() * BAD_OBJECTS.length)];
        }
    }

    // Aplicar multiplicador de velocidad basado en el nivel de dificultad
    const speedMultiplier = 1 + (difficultyLevel - 1) * 0.15; // Aumenta 15% por nivel
    fallingObjects.push(new FallingObject(objectType, isGood, speedMultiplier));
    objectsSpawned++;
}

// Detección de colisiones
function checkCollision(obj1, obj2) {
    const bounds1 = obj1.getBounds();
    const bounds2 = obj2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width &&
           bounds1.x + bounds1.width > bounds2.x &&
           bounds1.y < bounds2.y + bounds2.height &&
           bounds1.y + bounds1.height > bounds2.y;
}

// Actualizar puntuación
function updateScore(points) {
    score += points;
    if (score < 0) score = 0;
    document.getElementById('score').textContent = score;

    // Si superó el mejor puntaje, actualizar y guardar
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }

    if (score === 0 && gameRunning) {
        gameOver();
    }
}

// Game Over
function gameOver() {
    gameRunning = false;
    document.getElementById('gameOver').classList.remove('hidden');
    hideMobileControls();
}

// Iniciar juego
function startGame() {
    // cargar/mostrar high score antes de empezar
    loadHighScore();

    gameRunning = true;
    gameStarted = true;
    gameTime = 0;
    difficultyLevel = 1;
    score = 0;
    missed = 0;
    objectsSpawned = 0;
    initialGoodObjectsSpawned = 0;
    fallingObjects.length = 0;
    cat.x = canvas.width / 2 - cat.width / 2;
    document.getElementById('score').textContent = score;
    document.getElementById('missed').textContent = missed;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameCanvas').classList.remove('hidden');
    document.querySelector('.game-info').classList.remove('hidden');
    document.querySelector('.instructions').classList.remove('hidden');

    // mostrar controles táctiles solo en dispositivos táctiles y colocarlos debajo de las instrucciones
    showMobileControlsUnderInstructions();
    gameLoop();
}

// Reiniciar juego
function restartGame() {
    score = 0;
    missed = 0;
    objectsSpawned = 0;
    initialGoodObjectsSpawned = 0;
    gameRunning = true;
    gameTime = 0;
    difficultyLevel = 1;
    fallingObjects.length = 0;
    cat.x = canvas.width / 2 - cat.width / 2;
    document.getElementById('score').textContent = score;
    document.getElementById('missed').textContent = missed;
    document.getElementById('gameOver').classList.add('hidden');
    document.querySelector('.instructions').classList.remove('hidden');
    showMobileControlsUnderInstructions();
    gameLoop();
}

//Volver al menú principal
function exitToMenu() {
    gameRunning = false;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameCanvas').classList.add('hidden');
    document.querySelector('.game-info').classList.add('hidden');
    document.querySelector('.instructions').classList.add('hidden');
    hideMobileControls();
}

// <-- añadir variable y funciones para high score -->
let highScore = 0;
const HIGH_SCORE_KEY = 'sfHighScore';

function loadHighScore() {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    highScore = stored ? parseInt(stored, 10) : 0;
    const el = document.getElementById('highScore');
    if (el) el.textContent = highScore;
}

function saveHighScore() {
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    const el = document.getElementById('highScore');
    if (el) el.textContent = highScore;
}

// Al cargar el script, asegúrate de mostrar el high score
loadHighScore();

// No iniciar el juego automáticamente - esperar a que el usuario haga clic en "Comenzar Juego"

// Debug: asegurar binding del botón de inicio y logs
(function attachStartDebug() {
    try {
        const startBtn = document.querySelector('#startScreen button');
        if (startBtn) {
            // evitar dobles bindings
            startBtn.removeEventListener('click', window.__sf_start_click__);
            window.__sf_start_click__ = function () {
                console.log('DEBUG: start button clicked');
                try { startGame(); } catch (err) { console.error('ERROR en startGame:', err); }
            };
            startBtn.addEventListener('click', window.__sf_start_click__);
            console.log('DEBUG: start button listener attached');
        } else {
            console.warn('DEBUG: start button no encontrado');
        }
    } catch (e) {
        console.error('DEBUG attachStartDebug error:', e);
    }
})();

// Fallback de gameLoop — añade esto si falta la función principal del juego.
// Intenta llamar a funciones comunes si existen y arranca un loop básico.
function gameLoop() {
    try {
        // avanzar tiempo y ajustar dificultad
        gameTime++;
        if (gameTime > 0 && gameTime % DIFFICULTY_INCREASE_INTERVAL === 0) {
            difficultyLevel++;
        }

        // generar objetos periódicamente (más rápido con la dificultad)
        const spawnEvery = Math.max(30, 100 - difficultyLevel * 8); // frames
        if (gameTime % spawnEvery === 0) spawnObject();

        // actualizar jugador
        cat.update();

        // actualizar objetos y manejar colisiones / offscreen
        for (let i = fallingObjects.length - 1; i >= 0; i--) {
            const obj = fallingObjects[i];
            obj.update();

            // colisión con el gatito
            if (checkCollision(cat, obj)) {
                if (obj.isGood) {
                    updateScore(5);
                } else {
                    updateScore(-15);
                }
                fallingObjects.splice(i, 1);
                continue;
            }

            // objeto fuera de pantalla
            if (obj.isOffScreen()) {
                // si era bueno, cuenta como perdido
                if (obj.isGood) {
                    missed++;
                    document.getElementById('missed').textContent = missed;
                    if (missed >= 3) {
                        gameOver();
                        return; // salir del loop
                    }
                }
                fallingObjects.splice(i, 1);
            }
        }

        // dibujado
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // fondo: cielo y suelo
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

        // dibujar objetos
        for (const obj of fallingObjects) obj.draw();

        // dibujar gatito
        cat.draw();

        // actualizar HUD (por si algo cambia fuera de updateScore)
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = score;
        const missedEl = document.getElementById('missed');
        if (missedEl) missedEl.textContent = missed;
    } catch (err) {
        console.error('ERROR en gameLoop:', err);
        gameRunning = false;
        return;
    }

    // seguir el loop sólo si el juego está activo
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Debug: informar si startGame llama correctamente a gameLoop
console.log('DEBUG: fallback gameLoop definido. typeof gameLoop =', typeof gameLoop);

// Mostrar el canvas y la barra de información (sin iniciar el juego)
function renderInitialFrame() {
    try {
        const canvasEl = document.getElementById('gameCanvas');
        // NO mostrar la barra de información en la pantalla inicial:
        // const gameInfo = document.querySelector('.game-info');
        if (canvasEl) canvasEl.classList.remove('hidden');

        // ajustar tamaño si existe la función de resize (mejora en móviles)
        if (typeof resizeCanvasToDisplaySize === 'function') resizeCanvasToDisplaySize();

        // Dibujar fondo y suelo usando las dimensiones actuales del canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#87CEEB'; // cielo
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
        ctx.fillStyle = '#8B4513'; // suelo
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

        // Dibujar gatito estático en la pantalla inicial (sin iniciar el juego)
        if (typeof cat !== 'undefined' && cat && typeof cat.draw === 'function') {
            cat.draw();
        }

        // NO mostrar controles móviles aquí; se mostrarán al iniciar el juego con showMobileControlsUnderInstructions()
    } catch (err) {
        console.error('renderInitialFrame error:', err);
    }
}

// Llamar al render inicial una vez que cargue el script / datos
renderInitialFrame();

