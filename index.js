const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const audio = new Audio();
audio.src = './assets/music.mp3';
audio.loop = true;
audio.play();

let playerDirection = "down";
let walkingIndex = 0;
const speed = 15;
let mapX = 0;

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

window.addEventListener('keydown', (event) => {
    if (event.key in keyDirectionMap) {
        playerDirection = keyDirectionMap[event.key];
        walkingIndex += speed;

        let prevPlayerX = playerX;
        let prevPlayerY = playerY;

        if (playerDirection === 'up') {
            playerY += speed * 0.5;
        }
        if (playerDirection === 'down') {
            playerY -= speed * 0.5;
        }
        if (playerDirection === 'left') {
            playerX += speed * 0.5;
        }
        if (playerDirection === 'right') {
            playerX -= speed * 0.5;
        }
        const playerWalkCheck = !canWalk(-playerX, -playerY + 70) || !canWalk(-playerX, -playerY + 90) || !canWalk(-playerX + 40, -playerY + 70);
        if (playerWalkCheck) {
            playerX = prevPlayerX;
            playerY = prevPlayerY;
        }

        walkingIndex %= speed * 4;
        console.log(`${playerX} - ${playerY}`);

        if (playerX < -canvas.width / 2 && !playerWalkCheck && playerDirection === 'right') {
            mapX += 1;
        }

        if (playerX > -canvas.width / 2 && !playerWalkCheck && playerDirection === 'left') {
            mapX -= 1;
        }

        // mapMask[-playerY][-playerX] = 1;
        console.log(mapX)
        mapX = Math.max(0, Math.min(mapX, 175));
        playerX = Math.min(0, Math.max(playerX, -1920));
        playerY = Math.min(0, Math.max(playerY, -1080));
    }
    if (playerY === -365 && playerX - mapX< -890 && playerX - mapX > -1100 && event.key === "Enter"){
        window.location.href = './select.html'
    }

    if (playerY === -470 && playerX - mapX< -1270 && playerX - mapX > -1370 && event.key === "Enter"){
        window.location.href = './battle.html'
    }
    drawCanvas();
});

window.addEventListener('keyup', (event) => {
    if (event.key in keyDirectionMap) {
        playerDirection = keyDirectionMap[event.key];
        walkingIndex = speed * 4;
    }
    drawCanvas();
});

let playerX = -500;
let playerY = -170;
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
    context.drawImage(playerSprites[playerDirection][Math.floor(walkingIndex / (speed * 2))], 0, 0, 16, 32, -playerX, -playerY, 16 * scale, 32 * scale);
}

map.onload = _ => drawCanvas();

function canWalk(x, y) {
    context.drawImage(mapMaskImage, mapX, 0, 765, 318, 0, 0, canvas.width * 1.3, canvas.height);
    const data = context.getImageData(x, y, 1, 1);
    context.clearRect(0, 0, canvas.width, canvas.height);
    console.log(data.data)
    return data.data[0] === 0;
}