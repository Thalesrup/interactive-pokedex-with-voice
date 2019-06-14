$("document").ready(function() {
  function getData() {
    const searchKeyword = $("#searchInput").val();
    const url = "https://pokeapi.co/api/v2/pokemon/" + searchKeyword;

    fetch(url)
      .then(data => data.json())
      .then(data => {
        const types = data.types;
        const height = data.height;
        const weight = data.weight;

        $("#searchInput").val(
          `#${("000" + data.id).substr(-3, 3)} - ${data.name}`
        );
        $("#height").html(getHeight(data.height));
        $("#weight").html(getWeight(data.weight));

        return fetch(data.species.url);
      })
      .then(data => data.json())
      .then(data => console.log(data));
  }

  function getHeight(height) {
    return `${height / 10} m`;
  }

  function getWeight(weight) {
    return `${weight / 10} kg`;
  }

  $("#searchInput").keypress(function(e) {
    if (e.keyCode == "13") {
      getData();
    }
  });
});
