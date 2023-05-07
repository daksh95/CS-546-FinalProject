(function () {
  function bidValidaton(bid) {
    if (!bid && !(bid == false))
      throw new Error("Bid parameter does not exists");
    if (!typeof bid === "number" || bid === NaN || bid === Infinity)
      throw new Error("bid must be of type number");
    return bid;
  }

  const placeBid = document.getElementById("placeBid");
  placeBid.addEventListener("click", () => {
    const errorDiv = document.getElementById("bidError");
    errorDiv.hidden = true;
  });

  const bidForm = document.getElementById("bidForm");
  if (bidForm) {
    bidForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let bid = document.getElementById("bidInput");
      bid = parseInt(bid);
      const errorDiv = document.getElementById("bidError");
      try {
        errorDiv.hidden = true;
        bidValidaton(bid);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }
})();
