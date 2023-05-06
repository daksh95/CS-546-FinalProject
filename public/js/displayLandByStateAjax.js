$(document).ready(() => {
  $("#get-state-form").submit((event) => {
    // console.log("here");
    event.preventDefault();

    const state = $('input[name="stateInput"]').val();
    $.ajax({
      type: "POST",
      url: "/land",
      data: { state },
      success: (response) => {
        const results = response;
        $("#result").empty();
        if (results.length === 0) {
          divElement1 = document.createElement("div");
          divElement1.classList.add("card");
          divElement1.classList.add("border-info");
          divElement1.classList.add("rounded-lg");
          divElement1.classList.add("shadow-lg");
          divElement1.classList.add("p-2");
          divElement1.textContent = "No Lands available to display";
          $("#result").append(divElement1);
        } else {
          for (let i = 0; i < results.length; i++) {
            aElement = document.createElement("a");
            aElement.href = "/land/" + results[i]._id;
            aElement.classList.add("text-decoration-none");
            aElement.classList.add("text-info");
            divElement2 = document.createElement("div");
            divElement2.classList.add("card");
            divElement2.classList.add("border-info");
            divElement2.classList.add("rounded-lg");
            divElement2.classList.add("shadow-lg");
            divElement2.classList.add("p-2");
            pElement = document.createElement("p");
            pElement.textContent =
              results[i].address.line1 + " " + results[i].address.line2 + ",";
            pElement.classList.add("m-0");
            pElement1 = document.createElement("p");
            pElement1.textContent =
              results[i].address.city +
              ", " +
              results[i].address.state +
              " " +
              results[i].address.zipCode;
            pElement2 = document.createElement("p");
            pElement2.textContent = results[i].type + " Area";
            pElement3 = document.createElement("p");
            if (results[i].sale.onSale) pElement3.textContent = "Sale: Yes";
            else pElement3.textContent = "Sale: No";
            brElement = document.createElement("br");
            divElement2.appendChild(pElement);
            divElement2.appendChild(pElement1);
            divElement2.appendChild(pElement2);
            divElement2.appendChild(pElement3);
            aElement.appendChild(divElement2);
            $("#result").append(aElement);
            $("#result").append(brElement);
          }
        }
      },
      error: (error) => {
        $("#stateError").append(error.message);
      },
    });
  });
});
