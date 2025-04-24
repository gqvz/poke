const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const popup = document.getElementsByClassName('popup')[0];
const instructionScreen = document.getElementsByClassName('instructions')[0];

instructionScreen.style.visibility = (localStorage.getItem('instructions') ?? 'true') === 'true' ? 'visible' : 'hidden';
const audio = new Audio();
audio.src = './assets/music.mp3';
audio.loop = true;
audio.play();

let playerDirection = [];
let walkingIndex = 0;
const speed = 35;
let mapX = parseInt(localStorage.getItem('mapX') ?? '0');

const keyDirectionMap = {
    'w': 'up',
    's': 'down',
    'a': 'left',
    'd': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right'
}

window.addEventListener('keydown', keyDownHandler);

function keyDownHandler(event) {
    if (event.key === 'Escape') {
        instructionScreen.style.visibility = 'hidden';
        localStorage.setItem('instructions', 'false');
    }

    if (event.key in keyDirectionMap && instructionScreen.style.visibility === 'hidden') {
        if (playerDirection.indexOf(keyDirectionMap[event.key]) === -1) {
            playerDirection.push(keyDirectionMap[event.key]);
        }
        walkingIndex += speed;

        let prevPlayerX = playerX;
        let prevPlayerY = playerY;

        if (playerDirection.indexOf('up') !== -1) {
            playerY += speed * 0.5;
        }
        if (playerDirection.indexOf('down') !== -1) {
            playerY -= speed * 0.5;
        }
        if (playerDirection.indexOf('left') !== -1) {
            playerX += speed * 0.5;
        }
        if (playerDirection.indexOf('right') !== -1) {
            playerX -= speed * 0.5;
        }

        const playerWalkCheck = !(canWalk(-playerX + 40, -playerY + 70) !== 'n' && canWalk(-playerX, -playerY + 90) !== 'n' && canWalk(-playerX, -playerY + 70) !== 'n');
        if (playerWalkCheck) {
            playerX = prevPlayerX;
            playerY = prevPlayerY;
        }

        walkingIndex %= speed * 4;

        if (playerX < -canvas.width / 2 && !playerWalkCheck && playerDirection.indexOf('right') !== -1) {
            mapX += 3;
        }

        if (playerX > -canvas.width / 2 && !playerWalkCheck && playerDirection.indexOf('left') !== -1) {
            mapX -= 3;
        }

        mapX = Math.max(0, Math.min(mapX, 175));
        playerX = Math.min(0, Math.max(playerX, -1920));
        playerY = Math.min(0, Math.max(playerY, -1080));

        localStorage.setItem('playerX', playerX);
        localStorage.setItem('playerY', playerY);
        localStorage.setItem('mapX', mapX);
    }

    const cwMid = canWalk(-playerX + 20, -playerY + 70);
    popup.style.visibility = (cwMid === 'r' || cwMid === 'b' || cwMid === 'g') ? 'visible' : 'hidden';

    if (cwMid === 'r') {
        if (event.key === 'Enter') {
            window.location.href = './select.html'
        }

        popup.innerText = 'Press Enter to choose pokemon';
    }

    if (cwMid === 'b') {
        if (event.key === 'Enter') {
            window.location.href = './battle.html'
        }

        popup.innerText = 'Press Enter to battle';
    }

    if (cwMid === 'g') {
        if (event.key === 'Enter' && instructionScreen.style.visibility === 'hidden') {
            instructionScreen.style.visibility = 'visible';
        }

        popup.innerText = 'Press Enter to read instructions';
    }

    drawCanvas();
}

window.addEventListener('keyup', (event) => {
    if (event.key in keyDirectionMap) {
        playerDirection.splice(playerDirection.indexOf(keyDirectionMap[event.key]), 1);
        walkingIndex = speed * 4;
    }
    drawCanvas();
});

let playerX = parseFloat(localStorage.getItem("playerX") ?? "-500");
let playerY = parseFloat(localStorage.getItem("playerY") ?? "-170");
const scale = 3;

const map = new Image()
map.src = './assets/map.png';
const mapMaskImage = new Image();
mapMaskImage.src = './assets/map_mask.png'

let playerSprites = []
for (let direction of ['up', 'down', 'left', 'right']) {
    let arr = []
    for (let x = 0; x < 2; x++) {
        let img = new Image();
        img.src = `./assets/player/player-${direction}-${x + 1}.png`;
        arr.push(img);
    }
    let img = new Image();
    img.src = `./assets/player/player-${direction}-stand.png`;
    arr.push(img);
    playerSprites[direction] = arr;
}

function drawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(map, mapX, 0, 765, 318, 0, 0, canvas.width * 1.3, canvas.height);
    context.drawImage(playerSprites[playerDirection[playerDirection.length - 1] ?? 'down'][Math.floor(walkingIndex / (speed * 2))], 0, 0, 16, 32, -playerX, -playerY, 16 * scale, 32 * scale);
}

map.onload = _ => {
    drawCanvas();
    keyDownHandler({key:'Space'})
}

function canWalk(x, y) {
    context.drawImage(mapMaskImage, mapX, 0, 765, 318, 0, 0, canvas.width * 1.3, canvas.height);
    const data = context.getImageData(x, y, 1, 1);
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (data.data[0] === data.data[1] && data.data[1] === data.data[2] && data.data[2] === 255) {
        return 'n'
    }
    if (data.data[0] === data.data[1] && data.data[1] === data.data[2] && data.data[2] === 0) {
        return 'w';
    }
    if (data.data[0] === 0 && data.data[1] === 0 && data.data[2] === 255) {
        return 'b';
    }
    if (data.data[0] === 255 && data.data[1] === 0 && data.data[2] === 0) {
        return 'r';
    }
    if (data.data[0] === 0 && data.data[1] === 255 && data.data[2] === 0) {
        return 'g';
    }
}

