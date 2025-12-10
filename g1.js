// Variables de jeu
const road = document.getElementById('road');
const playerCar = document.getElementById('player-car');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

let carX = 175;
const CAR_Y = 490; // Position fixe de la voiture du joueur
let roadSpeed = 2; // vitesse initiale lente
let score = 0;
let isGameOver = false;
let lastObstacleTime = 0;
let obstacleInterval = 1500; // fréquence initiale
let obstacles = [];
let laneMarkers = [];
let keysPressed = {};
let stars = []; // tableau pour stocker étoiles
const roadWidth = 400;
const carWidth = 50;
const roadPadding = 40;
const maxCarX = roadWidth - carWidth - roadPadding;

let obstaclesLimit = 2; // Limite maximale d'obstacles
// Fonction pour créer une étoile à une position aléatoire
function createStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 3 + 1;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.position = 'absolute';}

// Fonction pour augmenter la difficulté
function increaseDifficulty() {
    // Augmente la vitesse
    if (roadSpeed < 10) {
        roadSpeed += 0.5;
    }
    // Diminue la fréquence d'apparition
    obstacleInterval = Math.max(500, obstacleInterval * 0.95);
}

// Initialize les marqueurs de voie
function initLaneMarkers() {
    for (let i = 0; i < 15; i++) {
        const marker = document.createElement('div');
        marker.className = 'lane-marker';
        marker.style.top = `${i * 60}px`;
        road.appendChild(marker);
        laneMarkers.push(marker);
    }
}

// Créer des étoiles pour l'arrière-plan
function createStars() {
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        road.appendChild(star);
    }
}

// Créer obstacle
function createObstacle() {
    if (isGameOver) return;
    if (obstacles.length >= obstaclesLimit) return; // Limiter le nombre d'obstacles

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';

    const lanes = [
        roadPadding + 10,
        roadWidth / 2 - carWidth / 2,
        roadWidth - roadPadding - carWidth - 10
    ];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

    obstacle.style.left = `${randomLane}px`;
    obstacle.style.top = '-100px';
    road.appendChild(obstacle);

    obstacles.push({
        element: obstacle,
        x: randomLane,
        y: -100,
        width: carWidth,
        height: 90
    });
}

// Créer effet de lignes de vitesse
function createSpeedLine() {
    if (isGameOver) return;
    const speedLine = document.createElement('div');
    speedLine.className = 'speed-lines';
    speedLine.style.left = `${Math.random() * roadWidth}px`;
    road.appendChild(speedLine);
    setTimeout(() => {
        if (road.contains(speedLine)) {
            road.removeChild(speedLine);
        }
    }, 1000);
}

// Création d'une explosion
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x - 50}px`;
    explosion.style.top = `${y - 50}px`;
    road.appendChild(explosion);
    setTimeout(() => {
        if (road.contains(explosion)) {
            road.removeChild(explosion);
        }
    }, 500);
}

// Déplacer les marqueurs de voie
function moveLaneMarkers() {
    laneMarkers.forEach(marker => {
        let top = parseFloat(marker.style.top);
        top += roadSpeed;
        if (top > 600) top = -50;
        marker.style.top = `${top}px`;
    });
}

// Déplacer obstacles
function moveObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += roadSpeed;
        obstacle.element.style.top = `${obstacle.y}px`;
        if (obstacle.y > 700) {
            road.removeChild(obstacle.element);
            obstacles.splice(i, 1);
        }
    }
}

// Vérifier collision
function checkCollisions() {
    const carRect = {
        left: carX,
        right: carX + carWidth,
        top: CAR_Y,
        bottom: CAR_Y + 90
    };
    for (const obstacle of obstacles) {
        const obsRect = {
            left: obstacle.x,
            right: obstacle.x + obstacle.width,
            top: obstacle.y,
            bottom: obstacle.y + obstacle.height
        };
        if (
            carRect.left < obsRect.right &&
            carRect.right > obsRect.left &&
            carRect.top < obsRect.bottom &&
            carRect.bottom > obsRect.top
        ) {
            createExplosion(
                (carRect.left + carRect.right) / 2,
                (carRect.top + carRect.bottom) / 2
            );
            gameOver();
            break;
        }
    }
}

// Mise à jour du jeu
function updateGame(timestamp) {
    moveLaneMarkers();
    moveObstacles();
    generateStar(); // pour créer des étoiles aléatoirement
checkStarCollision(); // pour détecter collision avec étoiles

    if (timestamp - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = timestamp;
    }

    // Augmenter difficulté toutes les 50 points
    if (score >= 50) {
        increaseDifficulty();
        score = 0; // Réinitialiser pour ne pas augmenter plusieurs fois
    }

    if (Math.random() > 0.7) {
        createSpeedLine();
    }

    score += 0.1;
    scoreDisplay.textContent = `Score: ${Math.floor(score)}`;

    checkCollisions();
}

// Boucle de jeu
function gameLoop(timestamp) {
    if (isGameOver) return;
    updateGame(timestamp);
    animationId = requestAnimationFrame(gameLoop);
}

// Contrôles
function moveCar() {
    if (keysPressed.ArrowLeft || keysPressed.a) {
        carX = Math.max(roadPadding, carX - 10);
        playerCar.style.transform = 'skewX(-10deg)';
    } else if (keysPressed.ArrowRight || keysPressed.d) {
        carX = Math.min(maxCarX, carX + 10);
        playerCar.style.transform = 'skewX(10deg)';
    } else {
        playerCar.style.transform = 'none';
    }
    playerCar.style.left = `${carX}px`;
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    finalScoreDisplay.textContent = `Score: ${Math.floor(score)}`;
    gameOverScreen.style.display = 'flex';
}

function restartGame() {
    obstacles.forEach(obs => {
        if (road.contains(obs.element)) road.removeChild(obs.element);
    });
    obstacles = [];
    carX = 175;
    roadSpeed = 2; // vitesse de départ
    score = 0;
    isGameOver = false;
    lastObstacleTime = 0;
    obstacleInterval = 1500;
    obstaclesLimit = 2; // Limite maximale d'obstacles
    playerCar.style.left = `${carX}px`;
    playerCar.style.transform = 'none';
    scoreDisplay.textContent = 'Score: 0';
    gameOverScreen.style.display = 'none';
    animationId = requestAnimationFrame(gameLoop);
}

// Événements
document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
    moveCar();
    if (e.key === ' ' && isGameOver) restartGame();
});
document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
    playerCar.style.transform = 'none';
});

// Contrôles tactiles et souris
[leftBtn, rightBtn].forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keysPressed[btn.id === 'left-btn' ? 'ArrowLeft' : 'ArrowRight'] = true;
        moveCar();
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keysPressed[btn.id === 'left-btn' ? 'ArrowLeft' : 'ArrowRight'] = false;
        playerCar.style.transform = 'none';
    });
});
leftBtn.addEventListener('mousedown', () => { keysPressed.ArrowLeft = true; moveCar(); });
leftBtn.addEventListener('mouseup', () => { keysPressed.ArrowLeft = false; playerCar.style.transform = 'none'; });
rightBtn.addEventListener('mousedown', () => { keysPressed.ArrowRight = true; moveCar(); });
rightBtn.addEventListener('mouseup', () => { keysPressed.ArrowRight = false; playerCar.style.transform = 'none'; });
restartBtn.addEventListener('click', restartGame);
function createStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 3 + 1;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.position = 'absolute';
  star.style.background = 'yellow';
  star.style.borderRadius = '50%';

  // Position aléatoire dans la zone de la route
  star.style.left = `${Math.random() * (roadWidth - size)}px`;
  star.style.top = `${Math.random() * 700}px`; // hauteur de la zone
  road.appendChild(star);

  stars.push({
    element: star,
    x: parseFloat(star.style.left),
    y: parseFloat(star.style.top),
    size: size
  });
}
function generateStar() {
  if (Math.random() < 0.02) { // 2% chance
    createStar();
  }
}
function checkStarCollision() {
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i];
    const starCenterX = star.x + star.size / 2;
    const starCenterY = star.y + star.size / 2;

    const distX = (carX + carWidth / 2) - starCenterX;
    const distY = (CAR_Y + 45) - starCenterY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < 30) {
      // Tu peux faire un effet ou rien
      // Par exemple, tu peux enlever l'étoile si tu veux
      road.removeChild(star.element);
      stars.splice(i, 1);
      // Ne pas faire gameOver(), laisse continuer le jeu
    }
  }
}
// Initialisation
function initGame() {
    initLaneMarkers();
    createStars();
    animationId = requestAnimationFrame(gameLoop);
}
window.addEventListener('load', initGame);