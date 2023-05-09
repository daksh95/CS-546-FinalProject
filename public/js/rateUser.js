(function () {
  function ratingValidation(rating) {
    if (!rating && !(rating == false))
      throw new Error("rating parameter does not exists");
    if (
      !typeof rating === "number" ||
      rating === NaN ||
      rating === Infinity ||
      rating < 0 ||
      rating > 5
    )
      throw new Error("Rating must be of type number and between 0-5");
    return rating;
  }

  const rating = document.getElementById("rating");
  if (rating) {
    rating.addEventListener("click", () => {
      const errorDiv = document.getElementById("rateError");
      errorDiv.hidden = true;
    });
  }
  const ratingForm = document.getElementById("ratingForm");
  if (ratingForm) {
    ratingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let rating = document.getElementById("ratingInput");
      rating = parseInt(rating.value);
      const errorDiv = document.getElementById("rateError");
      try {
        errorDiv.hidden = true;
        ratingValidation(rating);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }
})();
