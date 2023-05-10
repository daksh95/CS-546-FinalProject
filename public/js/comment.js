(function () {
  function commentValidaton(comment) {
    if (!comment && !(comment == false))
      throw new Error("Comment parameter does not exists");
    if (comment.trim().length === 0)
      throw new Error("Comment cannot contain empty spaces only");
    return comment.trim();
  }

  const reject = document.getElementById("reject");
  if (reject) {
    reject.addEventListener("click", () => {
      const errorDiv = document.getElementById("rejectError");
      errorDiv.hidden = true;
    });
  }
  const rejectForm = document.getElementById("rejectForm");
  if (rejectForm) {
    rejectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let comment = document.getElementById("commentInput");
      const errorDiv = document.getElementById("rejectError");
      try {
        errorDiv.hidden = true;
        commentValidaton(comment.value);
        event.target.submit();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.hidden = false;
      }
    });
  }
})();
