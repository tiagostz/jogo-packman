// Parâmetros do jogo
const ROWS = 15;
const COLS = 19;
const TILE_SIZE = 32;

const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');

// Inicialização do labirinto (0 = vazio, 1 = parede, 2 = ponto)
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,2,1],
    [1,2,1,2,2,2,2,2,2,2,2,1,2,2,2,1,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,2,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,2,1,2,1,1,1,2,2,1],
    [1,2,2,2,2,2,2,1,2,0,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,2,2,1],
    [1,2,1,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,1],
    [1,2,1,2,1,1,1,1,2,1,2,1,1,1,2,1,2,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Estado do Pac-Man
let pacman = {
    x: 9, // posição inicial (coluna)
    y: 7, // posição inicial (linha)
    direction: 'left',
};

let score = 0;

// Estado dos fantasmas
// Posições iniciais válidas para os fantasmas
const ghostStartPositions = [
    { x: 2, y: 1 },
    { x: 16, y: 1 },
    { x: 2, y: 13 },
    { x: 16, y: 13 },
];
let ghosts = [
    { x: ghostStartPositions[0].x, y: ghostStartPositions[0].y, color: '#ff4b4b', direction: 'right' }, // vermelho
    { x: ghostStartPositions[1].x, y: ghostStartPositions[1].y, color: '#4bffb3', direction: 'left' }, // verde água
    { x: ghostStartPositions[2].x, y: ghostStartPositions[2].y, color: '#ffb84b', direction: 'right' }, // laranja
    { x: ghostStartPositions[3].x, y: ghostStartPositions[3].y, color: '#4b6bff', direction: 'left' }, // azul
];
let gameOver = false;
let win = false;

function getTileSize() {
    let size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tile-size'));
    if (isNaN(size) || size < 8) size = 16; // fallback mínimo
    return size;
}

// Função para desenhar o labirinto
function drawMap() {
    gameContainer.innerHTML = '';
    const TILE_SIZE = getTileSize();
    gameContainer.style.width = COLS * TILE_SIZE + 'px';
    gameContainer.style.height = ROWS * TILE_SIZE + 'px';
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = document.createElement('div');
            tile.style.width = TILE_SIZE + 'px';
            tile.style.height = TILE_SIZE + 'px';
            tile.style.display = 'inline-block';
            tile.style.boxSizing = 'border-box';
            if (map[y][x] === 1) {
                tile.style.background = '#0033cc';
            } else if (map[y][x] === 2) {
                tile.style.background = '#222';
                const dot = document.createElement('div');
                dot.style.width = (TILE_SIZE * 0.25) + 'px';
                dot.style.height = (TILE_SIZE * 0.25) + 'px';
                dot.style.background = '#ffd700';
                dot.style.borderRadius = '50%';
                dot.style.margin = (TILE_SIZE * 0.375) + 'px auto';
                tile.appendChild(dot);
            } else {
                tile.style.background = '#222';
            }
            tile.style.float = 'left';
            gameContainer.appendChild(tile);
        }
    }
}

// Função para desenhar o Pac-Man
function drawPacman() {
    const index = pacman.y * COLS + pacman.x;
    const tiles = gameContainer.children;
    const TILE_SIZE = getTileSize();
    if (tiles[index]) {
        const pac = document.createElement('div');
        pac.style.width = (TILE_SIZE * 0.75) + 'px';
        pac.style.height = (TILE_SIZE * 0.75) + 'px';
        pac.style.background = '#00aaff'; // azul claro vibrante
        pac.style.borderRadius = '50%';
        pac.style.margin = (TILE_SIZE * 0.125) + 'px auto';
        pac.style.position = 'relative';
        pac.style.zIndex = '2';
        // Olhos
        const eye = document.createElement('div');
        eye.style.width = (TILE_SIZE * 0.25) + 'px';
        eye.style.height = (TILE_SIZE * 0.25) + 'px';
        eye.style.background = '#fff';
        eye.style.borderRadius = '50%';
        eye.style.position = 'absolute';
        // Posição dos olhos baseada na direção
        let eyeLeft = TILE_SIZE * 0.19, eyeTop = TILE_SIZE * 0.16;
        if (pacman.direction === 'right') { eyeLeft = TILE_SIZE * 0.38; eyeTop = TILE_SIZE * 0.16; }
        if (pacman.direction === 'down')  { eyeLeft = TILE_SIZE * 0.28; eyeTop = TILE_SIZE * 0.38; }
        if (pacman.direction === 'up')    { eyeLeft = TILE_SIZE * 0.28; eyeTop = TILE_SIZE * 0.03; }
        eye.style.left = eyeLeft + 'px';
        eye.style.top = eyeTop + 'px';
        // Pupila
        const pupil = document.createElement('div');
        pupil.style.width = (TILE_SIZE * 0.09) + 'px';
        pupil.style.height = (TILE_SIZE * 0.09) + 'px';
        pupil.style.background = '#222';
        pupil.style.borderRadius = '50%';
        pupil.style.position = 'absolute';
        pupil.style.left = (TILE_SIZE * 0.09) + 'px';
        pupil.style.top = (TILE_SIZE * 0.09) + 'px';
        eye.appendChild(pupil);
        pac.appendChild(eye);
        tiles[index].appendChild(pac);
    }
}

// Função para encontrar o espaço vazio mais próximo
function findNearestEmpty(x, y) {
    let queue = [[x, y]];
    let visited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
    visited[y][x] = true;
    while (queue.length > 0) {
        let [cx, cy] = queue.shift();
        if (map[cy][cx] === 0 || map[cy][cx] === 2) return {x: cx, y: cy};
        for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            let nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
            }
        }
    }
    return {x, y}; // fallback
}

function ensureGhostsOnValidTiles() {
    ghosts.forEach((ghost, idx) => {
        // Se estiver em parede ou em cima de outro fantasma, reposiciona para o início
        if (map[ghost.y][ghost.x] === 1 || ghosts.some((g, i) => i !== idx && g.x === ghost.x && g.y === ghost.y)) {
            ghost.x = ghostStartPositions[idx].x;
            ghost.y = ghostStartPositions[idx].y;
            ghost.direction = idx === 0 ? 'right' : 'left';
        }
    });
}

function drawGhosts() {
    ensureGhostsOnValidTiles();
    const tiles = gameContainer.children;
    const TILE_SIZE = getTileSize();
    ghosts.forEach((ghost, idx) => {
        if (map[ghost.y][ghost.x] !== 1) {
            const index = ghost.y * COLS + ghost.x;
            if (tiles[index]) {
                const g = document.createElement('div');
                g.style.width = (TILE_SIZE * 0.75) + 'px';
                g.style.height = (TILE_SIZE * 0.75) + 'px';
                g.style.background = ghost.color;
                g.style.borderRadius = '50%';
                g.style.margin = (TILE_SIZE * 0.125) + 'px auto';
                g.style.position = 'relative';
                g.style.zIndex = '2';
                tiles[index].appendChild(g);
            }
        }
    });
}

function moveGhosts() {
    ghosts.forEach((ghost, idx) => {
        let directions = [
            { dx: 0, dy: -1, dir: 'up' },
            { dx: 0, dy: 1, dir: 'down' },
            { dx: -1, dy: 0, dir: 'left' },
            { dx: 1, dy: 0, dir: 'right' },
        ];
        let opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
        let validMoves = directions.filter(dir => {
            const nx = ghost.x + dir.dx;
            const ny = ghost.y + dir.dy;
            if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
            // Não pode ir para parede nem para onde já tem outro fantasma
            if (map[ny][nx] === 1) return false;
            if (ghosts.some((g, i) => i !== idx && g.x === nx && g.y === ny)) return false;
            return dir.dir !== opposite[ghost.direction];
        });
        if (validMoves.length === 0) {
            validMoves = directions.filter(dir => {
                const nx = ghost.x + dir.dx;
                const ny = ghost.y + dir.dy;
                if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
                if (map[ny][nx] === 1) return false;
                if (ghosts.some((g, i) => i !== idx && g.x === nx && g.y === ny)) return false;
                return true;
            });
        }
        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            const nx = ghost.x + move.dx;
            const ny = ghost.y + move.dy;
            if (map[ny][nx] !== 1 && !ghosts.some((g, i) => i !== idx && g.x === nx && g.y === ny)) {
                ghost.x = nx;
                ghost.y = ny;
                ghost.direction = move.dir;
            }
        }
        // Garantir que nunca fiquem em parede ou juntos
        if (map[ghost.y][ghost.x] === 1 || ghosts.some((g, i) => i !== idx && g.x === ghost.x && g.y === ghost.y)) {
            ghost.x = ghostStartPositions[idx].x;
            ghost.y = ghostStartPositions[idx].y;
            ghost.direction = idx === 0 ? 'right' : 'left';
        }
    });
}

function checkCollision() {
    for (const ghost of ghosts) {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            gameOver = true;
            showEndScreen(false);
            return;
        }
    }
}

function checkWin() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (map[y][x] === 2) return false;
        }
    }
    win = true;
    showEndScreen(true);
    return true;
}

function showEndScreen(victory) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.zIndex = 10;
    overlay.innerHTML = `<h2 style='color: #ffd700;'>${victory ? 'Você venceu!' : 'Game Over'}</h2><button id='restart-btn'>Jogar novamente</button>`;
    document.body.appendChild(overlay);
    document.getElementById('restart-btn').onclick = () => window.location.reload();
}

// Atualiza o desenho do jogo
function render() {
    drawMap();
    drawPacman();
    drawGhosts();
}

// Movimentação do Pac-Man
function movePacman(dx, dy) {
    if (gameOver || win) return;
    const newX = pacman.x + dx;
    const newY = pacman.y + dy;
    // Atualiza direção
    if (dx === 1) pacman.direction = 'right';
    else if (dx === -1) pacman.direction = 'left';
    else if (dy === 1) pacman.direction = 'down';
    else if (dy === -1) pacman.direction = 'up';
    if (map[newY][newX] !== 1) { // Não é parede
        pacman.x = newX;
        pacman.y = newY;
        // Coleta ponto
        if (map[newY][newX] === 2) {
            map[newY][newX] = 0;
            score += 10;
            scoreDisplay.textContent = 'Pontuação: ' + score;
        }
    }
    render();
    checkCollision();
    if (!win) checkWin();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') movePacman(0, -1);
    else if (e.key === 'ArrowDown') movePacman(0, 1);
    else if (e.key === 'ArrowLeft') movePacman(-1, 0);
    else if (e.key === 'ArrowRight') movePacman(1, 0);
});

function gameLoop() {
    if (gameOver || win) return;
    moveGhosts();
    render();
    checkCollision();
    if (!win) checkWin();
    setTimeout(gameLoop, 400);
}

function getTileSize() {
    let size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tile-size'));
    if (isNaN(size) || size < 8) size = 16; // fallback mínimo
    return size;
}

function renderAll() {
    render();
    scoreDisplay.textContent = 'Pontuação: ' + score;
}

// Substituir chamadas a render() e drawMap() iniciais por evento DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    ensureGhostsOnValidTiles();
    renderAll();
    gameLoop();
});

// Redesenhar ao redimensionar a tela
window.addEventListener('resize', () => {
    renderAll();
});
window.addEventListener('orientationchange', () => {
    setTimeout(renderAll, 100);
});

// Controles do D-Pad para mobile
const dpadUp = document.getElementById('dpad-up');
const dpadDown = document.getElementById('dpad-down');
const dpadLeft = document.getElementById('dpad-left');
const dpadRight = document.getElementById('dpad-right');

if (dpadUp && dpadDown && dpadLeft && dpadRight) {
    dpadUp.addEventListener('touchstart', function(e) { e.preventDefault(); movePacman(0, -1); });
    dpadDown.addEventListener('touchstart', function(e) { e.preventDefault(); movePacman(0, 1); });
    dpadLeft.addEventListener('touchstart', function(e) { e.preventDefault(); movePacman(-1, 0); });
    dpadRight.addEventListener('touchstart', function(e) { e.preventDefault(); movePacman(1, 0); });
    // Também permite clique para desktop
    dpadUp.addEventListener('click', function(e) { e.preventDefault(); movePacman(0, -1); });
    dpadDown.addEventListener('click', function(e) { e.preventDefault(); movePacman(0, 1); });
    dpadLeft.addEventListener('click', function(e) { e.preventDefault(); movePacman(-1, 0); });
    dpadRight.addEventListener('click', function(e) { e.preventDefault(); movePacman(1, 0); });
} 