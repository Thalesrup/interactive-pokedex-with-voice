$("document").ready(function() {
  //
  window.speechSynthesis.cancel();

  // Add event for search box
  $("#searchInput").keypress(function(e) {
    if (e.keyCode == "13") {
      window.speechSynthesis.cancel();
      $("#searchInput").autocomplete("close");
      getData();
    }
  });

  // Get data for autocomplete search box
  fetch("https://pokeapi.co/api/v2/pokemon/?limit=807")
    .then(response => response.json())
    .then(response => {
      const availablePokemons = response.results.map(
        (pokemon, index) => getId(index + 1) + " - " + pokemon.name
      );

      $("#searchInput").autocomplete({
        source: availablePokemons,
        minLength: 2
      });
    });

  function getData() {
    const url = "https://pokeapi.co/api/v2/pokemon/" + getSearchKeyword();

    const pokemonData = {
      id: "",
      name: "",
      species: "",
      type: "",
      height: "",
      weight: "",
      evolution: {},
      description: "",
      imageUrl: ""
    };

    fetch(url)
      .then(response => response.json())
      .then(response => {
        pokemonData.id = getId(response.id);
        pokemonData.name = response.name;
        pokemonData.types = getType(response.types);
        pokemonData.height = getHeight(response.height);
        pokemonData.weight = getWeight(response.weight);
        pokemonData.imageUrl = getImageUrl(response.name);

        return fetch(response.species.url);
      })
      .then(response => response.json())
      .then(response => {
        pokemonData.species = getSpecies(response.genera);
        pokemonData.description = getDescription(response.flavor_text_entries);

        return fetch(response.evolution_chain.url);
      })
      .then(response => response.json())
      .then(response => {
        const evolution_01 = response.chain.species.name;
        const evolution_02 = [];
        const evolution_03 = [];

        response.chain.evolves_to.forEach(chain2 => {
          evolution_02.push("<p>" + chain2.species.name + "<p/>");

          chain2.evolves_to.forEach(chain3 => {
            evolution_03.push("<p>" + chain3.species.name + "<p/>");
          });
        });

        pokemonData.evolution = { evolution_01, evolution_02, evolution_03 };
      })
      .then(() => {
        showData(pokemonData);

        // Speak text after 1 second
        setTimeout(() => {
          var text = new SpeechSynthesisUtterance(
            `${pokemonData.name}, ${pokemonData.species}, ${
              pokemonData.description
            }`
          );
          window.speechSynthesis.speak(text);
        }, 1000);
      })
      .catch(error => {
        pokemonData.id = "###";
        pokemonData.name = "Invalid Pokémon";
        pokemonData.species = "...";
        pokemonData.types = "...";
        pokemonData.height = "...";
        pokemonData.weight = "...";
        pokemonData.description = "...";
        pokemonData.evolution.evolution_01 = "...";
        pokemonData.evolution.evolution_02 = "...";
        pokemonData.evolution.evolution_03 = "...";
        pokemonData.imageUrl = "https://i.imgur.com/zIxgrDd.png";

        showData(pokemonData);

        console.log(error.message);
      });
  }

  function showData(pokemonData) {
    $("#searchInput").val(`${pokemonData.id} - ${pokemonData.name}`);
    $("#species").html(pokemonData.species);
    $("#type").html(pokemonData.types);
    $("#height").html(pokemonData.height);
    $("#weight").html(pokemonData.weight);
    $("#description").html(pokemonData.description);

    $("#evolution-1").html(pokemonData.evolution.evolution_01);
    $("#evolution-2").html(pokemonData.evolution.evolution_02);
    $("#evolution-3").html(pokemonData.evolution.evolution_03);

    pokemonData.evolution.evolution_02.length > 0
      ? $("#arrow-1").show()
      : $("#arrow-1").hide();

    pokemonData.evolution.evolution_03.length > 0
      ? $("#arrow-2").show()
      : $("#arrow-2").hide();

    $("#screen").css("background-image", "url(" + pokemonData.imageUrl + ")");
  }

  function getSearchKeyword() {
    const searchKeyword = $("#searchInput").val();

    if (parseInt(searchKeyword)) {
      return parseInt(searchKeyword);
    }
    return searchKeyword;
  }

  function getId(id) {
    if (id.toString().length == 1) {
      return "00" + id;
    } else if (id.toString().length == 2) {
      return "0" + id;
    }
    return id;
  }

  function getImageUrl(name) {
    return `https://img.pokemondb.net/artwork/large/${name}.jpg`;
  }

  function getSpecies(textArray) {
    const engTextArray = textArray.filter(text => text.language.name == "en");
    return engTextArray[0].genus;
  }

  function getDescription(textArray) {
    const engTextArray = textArray.filter(text => text.language.name == "en");
    return engTextArray[0].flavor_text;
  }

  function getType(typeArray) {
    return typeArray
      .reverse()
      .map(currentType => capitalizeWord(currentType.type.name))
      .join("\\");
  }

  function getHeight(height) {
    return `${height / 10} m`;
  }

  function getWeight(weight) {
    return `${weight / 10} kg`;
  }

  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
});
