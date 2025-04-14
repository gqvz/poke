
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

let playerDirection = "down";
let walkingIndex = 0;
const speed =10;

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

window.onkeydown = event => {
    if (event.key in keyDirectionMap) {
        playerDirection = keyDirectionMap[event.key];
        walkingIndex += speed;


        if (playerDirection === 'up') {
            playerY += speed;
        }
        if (playerDirection === 'down') {
            playerY -= speed;
        }
        if (playerDirection === 'left') {
            playerX += speed;
        }
        if (playerDirection === 'right') {
            playerX -= speed;
        }
    }

    walkingIndex %= speed * 4;
    drawCanvas();
}
window.onkeyup = event => {
    if (event.key in keyDirectionMap) {
        playerDirection = keyDirectionMap[event.key];
        walkingIndex = speed * 4;
    }
    drawCanvas();
}

let playerX = -400;
let playerY = -50;

const map = new Image()
map.src = './assets/map.png';

let playerSprites = []
for (let direction of ['up', 'down', 'left', 'right']) {
    let arr = []
    for (let x = 0; x < 2; x++) {
        let img = new Image();
        img.src = `./assets/player/player-${direction}-${x+1}.png`;
        arr.push(img);
    }
    let img = new Image();
    img.src = `./assets/player/player-${direction}-stand.png`;
    arr.push(img);
    playerSprites[direction] = arr;
}

function drawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(map, 0, 0, 1920/2, 1080, 0, 0, 1920/1.5, 1080*2);
    context.drawImage(playerSprites[playerDirection][Math.floor(walkingIndex / (speed * 2))], playerX, playerY, 960, 540, 0, 0, 1000, 1000);
}
drawCanvas();