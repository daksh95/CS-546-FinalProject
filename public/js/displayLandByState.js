(function () {
  var lands = document.getElementById("lands");
  var landsJSON = lands.dataset.landStates;
  var landByState = JSON.parse(landsJSON);
  let resultsDiv = document.getElementById("results");

  let sort = document.getElementById("sort");
  sort.addEventListener("change", function () {
    let selectedValue = this.value;
    if (selectedValue === "priceAsc") {
      landByState.sort(function (a, b) {
        return a.sale.price - b.sale.price;
      });
    } else if (selectedValue === "priceDesc") {
      landByState.sort(function (a, b) {
        return b.sale.price - a.sale.price;
      });
    }
    resultsDiv.remove();
    resultsDiv = document.createElement("div");
    resultsDiv.classList.add("col-md-8");
    for (let i = 0; i < landByState.length; i++) {
      aElement = document.createElement("a");
      aElement.href = "/land/" + landByState[i].id;
      divElement = document.createElement("div");
      pElement = document.createElement("p");
      pElement.textContent = "Name: " + landByState[i].address;
      pElement1 = document.createElement("p");
      pElement1.textContent = "Dimensions: " + landByState[i].dimensions;
      pElement2 = document.createElement("p");
      pElement2.textContent = "Price: " + landByState[i].price;
      pElement3 = document.createElement("p");
      pElement3.textContent = "Sale: " + landByState[i].sale;
      divElement.appendChild(pElement);
      divElement.appendChild(pElement1);
      divElement.appendChild(pElement2);
      divElement.appendChild(pElement3);
      aElement.appendChild(divElement);
      resultsDiv.appendChild(aElement);
    }
  });
})();
