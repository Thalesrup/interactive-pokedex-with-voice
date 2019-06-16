$("document").ready(function() {
  window.speechSynthesis.cancel();

  function getData() {
    const searchKeyword = $("#searchInput").val();
    const url = "https://pokeapi.co/api/v2/pokemon/" + searchKeyword;

    let name;
    let description;

    fetch(url)
      .then(data => data.json())
      .then(data => {
        $("#searchInput").val(`${getId(data.id)} - ${data.name.toUpperCase()}`);
        $("#type").html(`${getType(data.types)}`);
        $("#height").html(getHeight(data.height));
        $("#weight").html(getWeight(data.weight));
        $("#screen").css(
          "background-image",
          "url(" + getImageUrl(data.name) + ")"
        );

        name = data.name;

        return fetch(data.species.url);
      })
      .then(data => data.json())
      .then(data => {
        $("#species").html(getSpecies(data.genera));
        $("#description").html(getDescription(data.flavor_text_entries));

        description = getDescription(data.flavor_text_entries);
        return fetch(data.evolution_chain.url);
      })
      .then(data => data.json())
      .then(data => {
        const evo1 = `<p>${cap(data.chain.species.name)}</p>`;
        let evo2 = [];
        let evo3 = [];

        data.chain.evolves_to.forEach(data => {
          evo2.push(`<p>${cap(data.species.name)}</p>`);

          data.evolves_to.forEach(data3 => {
            evo3.push(`<p>${cap(data3.species.name)}</p>`);
          });
        });

        if (evo2.length == 0) {
          evo2.push("N\\A");
        }

        if (evo3.length == 0) {
          evo3.push("N\\A");
        }

        $("#evo1").html(evo1);
        $("#evo2").html(evo2);
        $("#evo3").html(evo3);
      })
      .then(() => {
        setTimeout(function() {
          var msg = new SpeechSynthesisUtterance(`${name}, ${description}`);
          window.speechSynthesis.speak(msg);
        }, 1500);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const cap = capitalizeWord;
  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
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
      .map(currentType => cap(currentType.type.name))
      .join("\\");
  }

  function getHeight(height) {
    return `${height / 10} m`;
  }

  function getWeight(weight) {
    return `${weight / 10} kg`;
  }

  $("#searchInput").keypress(function(e) {
    if (e.keyCode == "13") {
      window.speechSynthesis.cancel();

      getData();
    }
  });

  (function() {
    getData();
  })();
});
