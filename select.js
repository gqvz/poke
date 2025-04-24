
const numPokemons = 8;
const canSelect = 4;
const pokemonIndices = [0];
const pokemons = JSON.parse(localStorage.getItem('pokemons') ?? "[]");

let selectedPokemon = [];

window.onload = async _ => {
    let randomPokemonNumber = Math.floor(Math.random() * 100) + 1;
    for (let i = 0; i < numPokemons; i++) {
        pokemonIndices[i] = (randomPokemonNumber += Math.floor(Math.random() * 100) + 1);
    }
    
    let promisesArray = [];
    for (let i = 0; i < numPokemons; i++) {
        let promise = fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIndices[i]}`)
            .then(res => res.json())
            .then(data => pokemons[i] = data);
        promisesArray.push(promise);
    }
    
    await Promise.all(promisesArray);

    setTimeout(_ => document.getElementsByClassName('loading-screen')[0].style.display = 'none', 500);
    
    const card = document.getElementsByClassName('pokemon')[0];

    const cardParent = card.parentElement;
    
    for (let i = 0; i < numPokemons - 1; i++) {
        cardParent.appendChild(card.cloneNode(true));
    }
    
    const cards = document.getElementsByClassName('pokemon');
    for (let i = 0; i < cards.length; i++) {
        const image = cards[i].children.item(0).children.item(0);
        const name = cards[i].children.item(1);
        image.src = pokemons[i].sprites.front_default;
        name.innerText = pokemons[i].name;
        cards[i].onclick = _ => selectPokemon(i);
    }
}

function selectPokemon(index) {
    const cards = document.getElementsByClassName("pokemon");
    let toggle = []
    toggle.push(index);
    if (selectedPokemon.length >= canSelect && selectedPokemon.indexOf(index) === -1 && selectedPokemon.length > 0) {
        toggle.push(selectedPokemon[0]);
        selectedPokemon = selectedPokemon.slice(1);
    }

    if (selectedPokemon.indexOf(index) !== -1) {
        console.log('splicing' + index)
        selectedPokemon.splice(selectedPokemon.indexOf(index), 1);
    }
    else {
        console.log('pushing index' + index)
        selectedPokemon.push(index);
    }
    
    
    for (let i = 0; i < toggle.length; i++) {
        cards[toggle[i]].classList.toggle('selected');
    }
    const selectedPokemonObjects = [];

    for (let i = 0; i < selectedPokemon.length; i++) {
        selectedPokemonObjects.push(pokemons[selectedPokemon[i]]);
    }

    localStorage.setItem('pokemons', JSON.stringify(selectedPokemonObjects));
}

window.onkeydown = e => {
    if (e.key === 'Enter') {
        window.location.href = 'index.html';
    }
}