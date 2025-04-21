
const numPokemons = 5;
const canSelect = 3;
const pokemonIndices = [0];
const pokemons = [{}];
window.onload = async _ => {
    let randomPokemonNumber = Math.floor(Math.random() * numPokemons) + 1;
    for (let i = 0; i < numPokemons; i++) {
        pokemonIndices[i] = (randomPokemonNumber += Math.floor(Math.random() * numPokemons) + 1);
    }
    
    let promisesArray = [];
    for (let i = 0; i < numPokemons; i++) {
        let promise = fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIndices[i]}`)
            .then(res => res.json())
            .then(data => pokemons[i] = data);
        promisesArray.push(promise);
    }
    
    await Promise.all(promisesArray);
    
    const card = document.getElementsByClassName('pokemon')[0];
    console.log(card);
    const cardParent = card.parentElement;
    
    for (let i = 0; i < numPokemons - 1; i++) {
        cardParent.appendChild(card.cloneNode(true));
    }
    
    const cards = document.getElementsByClassName('pokemon');
    for (let i = 0; i < cards.length; i++) {
        const image = cards[i].children.item(0).children.item(0);
        const name = cards[i].children.item(1);
        console.log(image)
        image.src = pokemons[i].sprites.front_default;
        name.innerText = pokemons[i].name;
    }
}