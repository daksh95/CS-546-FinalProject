(function () {
  function priceValidation(price) {
    if (!price && !(price == false))
      throw new Error("price parameter does not exists");
    if (
      !typeof price === "number" ||
      price === NaN ||
      price === Infinity ||
      price <= 0
    )
      throw new Error("price must be of type number or a positive number");
    return price;
  }

  const sale = document.getElementById("sale");
  if (sale) {
    sale.addEventListener("click", () => {
      const errorDiv = document.getElementById("saleError");
      errorDiv.hidden = true;
    });
  }
  const saleForm = document.getElementById("saleForm");
  if (saleForm) {
    saleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let price = document.getElementById("priceInput");
      price = parseInt(price.value);
      const errorDiv = document.getElementById("saleError");
      try {
        errorDiv.hidden = true;
        priceValidation(price);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }
})();
