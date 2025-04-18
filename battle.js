const canvas = document.getElementsByClassName('canvas')[0];
const context = canvas.getContext('2d');
const textArea = document.getElementsByClassName('typewriter')[0];
const healthBar1 = document.getElementById('bar-1');
const healthBar2 = document.getElementById('bar-2');

const randomPokemonNumber = Math.floor(Math.random() * 10) + 1

context.imageSmoothingEnabled = false;
let foePokemon;
let myPokemon;

let foePokemonPromise = fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonNumber}`)
    .then(res => res.json())
    .then(data => foePokemon = data);
let selectedPokemon = localStorage.getItem("pokemon");
if (selectedPokemon === null) {
    selectedPokemon = 1;
}
let myPokemonPromise = fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon}`)
    .then(res => res.json())
    .then(data => myPokemon = data);

let foePokemonAttacks = [{}, {}, {}, {}];
let myPokemonAttacks = [{}, {}, {}, {}];

let foePokemonHP = 0;
let myPokemonHP = 0;

Promise.all([foePokemonPromise, myPokemonPromise])
    .then(async _ => {
        console.log(myPokemon);
        console.log(foePokemon);
        foePokemonHP = foePokemon.stats[0].base_stat;
        myPokemonHP = myPokemon.stats[0].base_stat;
        foePokemonImage.src = foePokemon.sprites.front_default;
        myPokemonImage.src = myPokemon.sprites.back_default;

        let myPokemonAttackPromises = [];

        for (let i = 0; i < 4; i++) {
            let moveUrl = myPokemon.moves[i].move.url;
            let move = fetch(moveUrl)
                .then(res => res.json())
                .then(data => myPokemonAttacks[i] = (data));
            myPokemonAttackPromises.push(move);
        }

        let foePokemonAttackPromises = [];
        for (let i = 0; i < 4; i++) {
            let moveUrl = foePokemon.moves[i].move.url;
            let move = fetch(moveUrl)
                .then(res => res.json())
                .then(data => foePokemonAttacks[i] = (data));
            foePokemonAttackPromises.push(move);
        }

        await Promise.all(myPokemonAttackPromises + foePokemonAttackPromises);

        requestAnimationFrame(animate);

        textArea.innerHTML = formatString(actionTextArray[0]);
        setTimeout(_ => {
            textArea.innerHTML = formatString(actionTextArray[1]);
            resetTextAnimation();
        }, 3000);
        setTimeout(_ => {
            textArea.innerHTML = formatString(actionTextArray[2]);
            resetTextAnimation();
        }, 5000);
        setTimeout(_ => {
            textArea.innerHTML = formatString(actionTextArray[3]);
            resetTextAnimation();
            canStartBattle = true;
        }, 7000);

    });

function formatString(string, move = {name: ''}) {
    return string
        .replace('{myPokemon}', myPokemon.name)
        .replace('{foePokemon}', foePokemon.name)
        .replace('{move1}', myPokemonAttacks[0].name)
        .replace('{move2}', myPokemonAttacks[1].name)
        .replace('{move3}', myPokemonAttacks[2].name)
        .replace('{move4}', myPokemonAttacks[3].name)
        .replace('{move}', move.name);
}

function resetTextAnimation() {
    textArea.style.animation = 'none';
    textArea.offsetHeight;
    textArea.style.animation = null;
}

let myTurn = true;

function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    animateGrassAndPokemon();
    animateThrower();
    animateBall();
    requestAnimationFrame(animate);
}

function setFoeHealthBar(health) {
    healthBar1.style.width = (health * 200 / foePokemon.stats[0].base_stat) + 'px';
    setHealthBarColor(healthBar1, 200);
}

function setMyHealthBar(health) {
    healthBar2.style.width = (health * 209 / myPokemon.stats[0].base_stat) + 'px';
    setHealthBarColor(healthBar2, 209);
}

let actionTextArray = ['A WILD {foePokemon} appeared', // 0
    'Go {myPokemon}!', // 1
    'What will {myPokemon} do?', // 2
    'Press 1, 2, 3, 4 for attack and 5 to flee <br> 1. {move1} 2. {move2} 3. {move3} 4. {move4}', // 3
    'WILD {foePokemon} fainted! You win!', // 4
    '{myPokemon} fainted! You lost!', // 5
    '{myPokemon} gained {xp} xp', // 6
    '{myPokemon} used {move}', // 7
    'WILD {foePokemon} used {move}', // 8
    'Attack failed', // 9
];

function animateBall() {

}

window.onkeydown = function (event) {
    if (!canStartBattle) return;
    if (!myTurn) return;

    let move;
    if (event.key === '1') {
        myTurn = false;
        move = myPokemonAttacks[0];
    } else if (event.key === '2') {
        myTurn = false;
        move = myPokemonAttacks[1];
    } else if (event.key === '3') {
        myTurn = false;
        move = myPokemonAttacks[2];
    } else if (event.key === '4') {
        myTurn = false;
        move = myPokemonAttacks[3];
    }
    else if (event.key === '5') {
        lose();
    }

    if (move === undefined) return;

    console.log('You played ' + move.name);
    let accuracy = move.accuracy;
    if (accuracy < Math.random() * 100) {
        console.log('move failed');
        textArea.innerHTML = formatString(actionTextArray[9]);
        resetTextAnimation();
        setTimeout(foeAttack, 1000);
        return;
    }
    let damage = move.power / 5;
    foePokemonHP = Math.max(0, foePokemonHP - damage);
    setFoeHealthBar(foePokemonHP);
    console.log('foehp: ' + foePokemonHP);
    textArea.innerHTML = formatString(actionTextArray[7], move);
    resetTextAnimation();
    if (foePokemonHP <= 0) {
        win();
        return;
    }
    setTimeout(foeAttack, 2000);
}

function win() {
    setTimeout(_ => {
        textArea.innerHTML = formatString(actionTextArray[4]);
        resetTextAnimation();
    }, 2000);
    setTimeout(_ => {
        window.location.href = "index.html";
    }, 7000);
}

function lose() {
    setTimeout(_ => {
        textArea.innerHTML = formatString(actionTextArray[5]);
        resetTextAnimation();
    }, 2000);
    setTimeout(_ => {
        window.location.pathname = '/index.html';
    }, 7000);
}

function foeAttack() {
    let randomMove = Math.floor(Math.random() * 4)
    let move = foePokemonAttacks[randomMove];
    console.log('foe played' + move.name);
    let accuracy = move.accuracy;
    if (accuracy < Math.random() * 100) {
        console.log('move failed');
        textArea.innerHTML = formatString(actionTextArray[9]);
        resetTextAnimation();
        myTurn = true;
    }
    let damage = move.power / 5;
    myPokemonHP = Math.max(0, myPokemonHP - damage);
    console.log('myhp: ' + myPokemonHP);
    setMyHealthBar(myPokemonHP);
    textArea.innerHTML = formatString(actionTextArray[8], move);
    resetTextAnimation();
    if (myPokemonHP <= 0) {
        lose();
        return;
    }
    setTimeout(_ => {
        textArea.innerHTML = formatString(actionTextArray[3]);
        resetTextAnimation();
        myTurn = true;
    }, 2000);
}

let throwerImages = [];
for (let i = 0; i < 5; i++) {
    let image = new Image();
    image.src = `./assets/throw-${i}.png`;
    throwerImages.push(image);
}

let canStartBattle = false;

function animateMyPokemon() {
    context.drawImage(myPokemonImage, -grassAnimCounter, 0, canvas.width, canvas.height, 250, canvas.height * 0.651 - myPokemonImage.height * 2.2, myPokemonImage.width * 45, myPokemonImage.height * 45);
    requestAnimationFrame(animateMyPokemon);
}

let throwerIndex = 0;
let throwingAnimDone = false;

function animateThrower() {
    if (!grassAnimDone) return;
    const throwingTime = 10;
    if (throwingAnimDone) return;
    throwerIndex++;
    throwingAnimDone = throwerIndex >= 4 * throwingTime;
    if (throwingAnimDone) setTimeout(animateMyPokemon, 500);
    context.drawImage(throwerImages[Math.floor((throwerIndex - 1) / throwingTime)], 0, 0, canvas.width, canvas.height, grassAnimCounter * 4 - throwerIndex * 4, canvas.height * 0.55, throwerImages[0].width * 100, throwerImages[0].height * 50);
}

const grass1 = new Image();
grass1.src = './assets/grass1.png';
const grass2 = new Image();
grass2.src = './assets/grass2.png';

const statusBar1 = new Image();
statusBar1.src = './assets/statusbar1.png';

const statusBar2 = new Image();
statusBar2.src = './assets/statusbar2.png';

const foePokemonImage = new Image();
const myPokemonImage = new Image();

let grassAnimDone = false;
let grassAnimCounter = 0;

function animateGrassAndPokemon() {
    if (!grassAnimDone) {
        grassAnimCounter += 2;
    }

    grassAnimDone = grassAnimCounter > 80;
    context.drawImage(grass2, -grassAnimCounter, 0, canvas.width, canvas.height, 0, canvas.height * 0.7, grass2.width * 60, grass2.height * 150);
    context.drawImage(statusBar1, -grassAnimCounter, 0, canvas.width, canvas.height, 0, 300, statusBar1.width * 80, statusBar1.height * 150);
    context.drawImage(grass1, -350 + grassAnimCounter, 0, canvas.width, canvas.height, 0, 300, grass2.width * 60, grass2.height * 150);
    context.drawImage(statusBar2, -350 + grassAnimCounter, -100, canvas.width, canvas.height, 0, 300, statusBar2.width * 80, statusBar2.height * 100);
    context.drawImage(foePokemonImage, -650 + grassAnimCounter * 1.7, 0, canvas.width, canvas.height, 0, -105 + foePokemonImage.height * 1.6, foePokemonImage.width * 45, foePokemonImage.height * 45);

    if (!grassAnimDone) {
        context.drawImage(throwerImages[0], 0, 0, canvas.width, canvas.height, grassAnimCounter * 4, canvas.height * 0.55, throwerImages[0].width * 100, throwerImages[0].height * 50);
    }
}

function setHealthBarColor(div, maxWidth) {
    const width = parseFloat(getComputedStyle(div).width);
    const percentage = Math.min(Math.max(width / maxWidth, 0), 1);

    const red = Math.round(255 * (1 - percentage));
    const green = Math.round(255 * percentage);
    div.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
}
