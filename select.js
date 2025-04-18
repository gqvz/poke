function selectPokemon(pokemon) {
    localStorage.setItem('pokemon', pokemon);
    document.getElementsByClassName('select-heading')[0].innerText = "Pokemon selected";
    setTimeout(_ => {
        window.location.href = "/index.html";
    }, 1000);
}