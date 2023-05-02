(function () {
  const validStateCodes = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  let sort = document.getElementById("sort");
  sort.addEventListener("change", function () {
    var lands = document.getElementById("lands");
    var landsJSON = lands.dataset.landstates;
    var landByState = JSON.parse(landsJSON);
    let mainResultsDiv = document.getElementById("mainResults");
    let resultsDiv = document.getElementById("results");
    let selectedValue = this.value;
    if (selectedValue === "priceAsc") {
      landByState.sort(function (a, b) {
        return a["sale"]["price"] - b["sale"]["price"];
      });
    } else if (selectedValue === "priceDesc") {
      landByState.sort(function (a, b) {
        return b["sale"]["price"] - a["sale"]["price"];
      });
    }
    resultsDiv.remove();
    resultsDiv = document.createElement("div");
    resultsDiv.setAttribute("id", "results");
    mainResultsDiv.appendChild(resultsDiv);
    resultsDiv.classList.add("col-sm-8");
    for (let i = 0; i < landByState.length; i++) {
      aElement = document.createElement("a");
      aElement.href = "/land/" + landByState[i].id;
      aElement.classList.add("text-decoration-none");
      aElement.classList.add("text-info");
      divElement = document.createElement("div");
      divElement.classList.add("card");
      divElement.classList.add("border-info");
      divElement.classList.add("rounded-lg");
      divElement.classList.add("shadow-lg");
      divElement.classList.add("p-2");
      pElement = document.createElement("p");
      pElement.textContent =
        landByState[i].address.line1 + " " + landByState[i].address.line2 + ",";
      pElement.classList.add("m-0");
      pElement1 = document.createElement("p");
      pElement1.textContent =
        landByState[i].address.city +
        ", " +
        landByState[i].address.state +
        " " +
        landByState[i].address.zipCode;
      pElement2 = document.createElement("p");
      pElement2.textContent = landByState[i].type + " Area";
      pElement3 = document.createElement("p");
      if (landByState[i].sale.onSale) pElement3.textContent = "Sale: Yes";
      else pElement3.textContent = "Sale: No";
      brElement = document.createElement("br");
      divElement.appendChild(pElement);
      divElement.appendChild(pElement1);
      divElement.appendChild(pElement2);
      divElement.appendChild(pElement3);
      aElement.appendChild(divElement);
      resultsDiv.appendChild(aElement);
      resultsDiv.appendChild(brElement);
    }
  });

  function stateValidation(state) {
    if (!state && !(state == false))
      throw new Error("State parameter does not exists");
    if (state.trim().length === 0)
      throw new Error("State cannot contain empty spaces only");
    state = state.trim();
    if (!validStateCodes.includes(state.toUpperCase()))
      throw new Error(
        "State parameter must be a valid statecode in abbreviations only"
      );
    return state;
  }

  function areaValidation(minArea, maxArea) {
    if (!minArea && !(minArea == false))
      throw new Error("minArea parameter does not exists");
    if (minArea.trim().length === 0)
      throw new Error("minArea cannot contain empty spaces only");
    minArea = minArea.trim();
    if (!maxArea && !(maxArea == false))
      throw new Error("maxArea parameter does not exists");
    if (maxArea.trim().length === 0)
      throw new Error("maxArea cannot contain empty spaces only");
    maxArea = maxArea.trim();
    if (Number(maxArea) < Number(minArea))
      throw new Error("minArea must be less than maxArea");
    return [minArea, maxArea];
  }

  function priceValidation(minPrice, maxPrice) {
    if (!minPrice && !(minPrice == false))
      throw new Error("minPrice parameter does not exists");
    if (!maxPrice && !(maxPrice == false))
      throw new Error("maxPrice parameter does not exists");
    if (maxPrice < minPrice)
      throw new Error("minPrice must be less than maxPrice");
    return [minPrice, maxPrice];
  }

  const stateForm = document.getElementById("get-state-form");
  if (stateForm) {
    stateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let state = document.getElementById("stateInput");
      const errorDiv = document.getElementById("stateError");
      try {
        errorDiv.hidden = true;
        stateValidation(state.value);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }

  const areaForm = document.getElementById("filter-area");
  if (areaForm) {
    areaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let minArea = document.getElementById("minAreaInput");
      let maxArea = document.getElementById("maxAreaInput");
      const errorDiv = document.getElementById("filterError");
      try {
        errorDiv.hidden = true;
        areaValidation(minArea.value, maxArea.value);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }

  const priceForm = document.getElementById("filter-price");
  if (priceForm) {
    priceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let minPrice = document.getElementById("minPriceInput");
      let maxPrice = document.getElementById("maxPriceInput");
      const errorDiv = document.getElementById("filterError");
      try {
        errorDiv.hidden = true;
        priceValidation(parseInt(minPrice.value), parseInt(maxPrice.value));
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }
})();
