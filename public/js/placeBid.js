(function () {
  function bidValidaton(bid, price) {
    if (!bid && !(bid == false))
      throw new Error("Bid parameter does not exists");
    if (!typeof bid === "number" || bid === NaN || bid === Infinity)
      throw new Error("bid must be of type number");
    if (bid < price - 1000)
      throw new Error(
        "Difference between bid and price cannot be more than $1000"
      );
    return bid;
  }

  const placeBid = document.getElementById("placeBid");
  if (placeBid) {
    placeBid.addEventListener("click", () => {
      const errorDiv = document.getElementById("bidError");
      errorDiv.hidden = true;
    });
  }
  const bidForm = document.getElementById("bidForm");
  if (bidForm) {
    bidForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let bid = document.getElementById("bidInput");
      let price = document.getElementById("price");
      bid = parseInt(bid.value);
      price = parseInt(price.value);
      const errorDiv = document.getElementById("bidError");
      try {
        errorDiv.hidden = true;
        bidValidaton(bid, price);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }
})();
