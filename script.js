$("document").ready(function () {
  const searchInput = $("#search");

  getPokemonList(searchInput);

  searchInput.keypress(async (e) => {
    if (e.keyCode == "13") {
      displayNotFoundMessage(false); // Hide previous 404 result before starting a new search

      const pokemon = await getPokemon(searchInput.val());

      displayInfo(pokemon);
      speakInfo(pokemon.name, pokemon.species, pokemon.biology);
    }
  })
})

const speakInfo = (name = "", species = "Unknown Species", biology = "") => {
  const textToSpeech = name
    .concat(". ")
    .concat(species)
    .concat(". ")
    .concat(biology)

  responsiveVoice.cancel(); // Cancel any speech in process
  responsiveVoice.speak(textToSpeech);
}

const displayInfo = (pokemon) => {
  const speciesField = $("#species .desc");
  const typeField = $("#type .desc");
  const heightField = $("#height .desc");
  const weightField = $("#weight .desc");
  const evolutionField = $("#evolution .desc");
  const biologyField = $("#bio .desc");
  const imageField = $("#display .pokemon-image");

  const defaultImage = 'https://i.imgur.com/zIxgrDd.png';
  const defaultText = '...';
  const {
    species = defaultText,
    type = defaultText,
    height = defaultText,
    weight = defaultText,
    evolution = defaultText,
    biology = defaultText,
    imageUrl = defaultImage
  } = pokemon;

  speciesField.text(species);
  typeField.text(type);
  heightField.text(height);
  weightField.text(weight);
  evolutionField.text(evolution);
  biologyField.text(biology);
  imageField.css("background-image", `url(${imageUrl}`);
}

const displaySearchMessage = (value = true) => {
  const mainScreen = $("#display");

  if (value) {
    mainScreen.addClass("is-searching");
  } else {
    mainScreen.removeClass("is-searching");
  }
}

const displayNotFoundMessage = (value = true) => {
  const mainScreen = $("#display");

  if (value) {
    mainScreen.addClass("is-not-found");
  } else {
    mainScreen.removeClass("is-not-found");
  }
}

const getPokemon = async (text) => {
  const searchTerm = getSearchTerm(text);
  const url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
  let response = null;

  if (Boolean(searchTerm) === false) {
    return {};
  }

  try {
    displaySearchMessage();
    response = await axios.get(url);
    console.log('response :', response);
  } catch {
    displaySearchMessage(false);
    displayNotFoundMessage();
    return {}
  }

  const species = await axios.get(response.data.species.url);
  const evolution = species.data.evolution_chain?.url
    ? await axios.get(species.data.evolution_chain.url)
    : {
      species: { name: response.data.name },
      evolves_to: []
    };

  const pokemon = {
    name: getName(response.data.name),
    species: getSpecies(species.data.genera),
    type: getType(response.data.types),
    height: getHeight(response.data.height),
    weight: getWeight(response.data.weight),
    evolution: getEvolution(evolution.data ? evolution.data.chain : evolution),
    biology: getBiology(species.data.flavor_text_entries),
    imageUrl: getImageUrl(response.data.name)
  }

  displaySearchMessage(false);

  return pokemon;
}

const getPokemonList = async (searchInput) => {
  const url = "https://pokeapi.co/api/v2/pokemon/?limit=893";
  const response = await axios.get(url);
  const list = response.data.results.map((pokemon, id) =>
    getDropDownOption(pokemon.name, id + 1)
  );

  searchInput.autocomplete({
    autoFocus: true,
    source: list,
    minLength: 2,
    select: (e, ui) => {
      searchInput.val(ui.item.value);
      searchInput.trigger({ type: 'keypress', keyCode: 13 });
    }
  });
}

const getDropDownOption = (name, id) => {
  const formattedID = appendLeadingZero(id);
  const formattedName = capitalizeFirstLetter(name);

  return `${formattedID} - ${formattedName}`
}

const getName = (name) => {
  return capitalizeFirstLetter(name);
}

const getSpecies = (array) => {
  return array.filter(text => text.language.name == "en")[0]?.genus;
}

const getType = (array) => {
  const type = array
    .map(currentType => capitalizeFirstLetter(currentType.type.name))
    .join("\\");
  return type;
}

const getHeight = (height) => {
  return `${height / 10} m`;
}

const getWeight = (weight) => {
  return `${weight / 10} kg`;
}

const getBiology = (array) => {
  const biology = array.filter(text => text.language.name == "en")[0].flavor_text;
  return biology;
}

const getImageUrl = (name) => {
  return `https://img.pokemondb.net/artwork/large/${name}.jpg`;
}

const getSearchTerm = (searchTerm) => {
  if (parseInt(searchTerm)) {
    return parseInt(searchTerm).toString()
  }
  return searchTerm;
}

const getEvolution = (obj) => {
  const chain = obj;
  const evolution_1 = capitalizeFirstLetter(chain.species.name);
  const evolution_2 = [];
  const evolution_3 = [];

  chain.evolves_to.forEach(chain_2 => {
    evolution_2.push(capitalizeFirstLetter(chain_2.species.name));

    chain_2.evolves_to.forEach(chain_3 => {
      evolution_3.push(capitalizeFirstLetter(chain_3.species.name));
    });
  });

  if (evolution_2.length === 0) {
    return `${evolution_1}`
  } else if (evolution_3.length === 0) {
    return `${evolution_1} > ${evolution_2.join(", ")}`
  }

  return `${evolution_1} > ${evolution_2.join(", ")} > ${evolution_3.join(", ")}`
}

const appendLeadingZero = (num) => {
  switch (num.toString().length) {
    case 1:
      return "000" + num;
    case 2:
      return "00" + num;
    case 3:
      return "0" + num;
    default:
      return num
  }
}

const capitalizeFirstLetter = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
}