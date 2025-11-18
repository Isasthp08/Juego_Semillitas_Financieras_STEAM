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
}

// Función principal del juego
function gameLoop() {
    if (!gameRunning) return;

    // Aumentar tiempo de juego y dificultad
    gameTime++;
    
    // Aumentar nivel de dificultad cada cierto tiempo
    const newDifficultyLevel = Math.floor(gameTime / DIFFICULTY_INCREASE_INTERVAL) + 1;
    if (newDifficultyLevel > difficultyLevel) {
        difficultyLevel = newDifficultyLevel;
        // Opcional: puedes agregar un sonido o efecto visual cuando aumenta la dificultad
        console.log(`¡Dificultad aumentada al nivel ${difficultyLevel}!`);
    }

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo (océano y arena)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#87CEEB');
    gradient.addColorStop(0.7, '#8B4513');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar patrón de arena (checkered)
    ctx.fillStyle = '#A0522D';
    const checkSize = 20;
    for (let y = canvas.height * 0.7; y < canvas.height; y += checkSize) {
        for (let x = 0; x < canvas.width; x += checkSize * 2) {
            if (Math.floor(y / checkSize) % 2 === 0) {
                ctx.fillRect(x, y, checkSize, checkSize);
            } else {
                ctx.fillRect(x + checkSize, y, checkSize, checkSize);
            }
        }
    }

    // Spawnear objetos con probabilidad que aumenta con la dificultad
    // Probabilidad base: 4%, aumenta hasta ~8% en niveles altos
    const spawnProbability = Math.min(0.08, 0.04 + (difficultyLevel - 1) * 0.005);
    if (Math.random() < spawnProbability) {
        spawnObject();
    }

    // Actualizar y dibujar gatito
    cat.update();
    cat.draw();

    // Actualizar y dibujar objetos
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.update();
        obj.draw();

        // Verificar colisión con gatito
        if (checkCollision(cat, obj)) {
            if (obj.isGood) {
                updateScore(5);
            } else {
                updateScore(-15);
            }
            fallingObjects.splice(i, 1);
            continue;
        }

        // Si el objeto sale de pantalla
        if (obj.isOffScreen()) {
            if (obj.isGood) {
                missed++;
                document.getElementById('missed').textContent = missed;
            }
            fallingObjects.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
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

