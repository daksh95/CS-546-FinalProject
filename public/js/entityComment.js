(function () {
  const commentBox = document.getElementById("commentTextArea");
  const rejectButton = document.getElementById("rejectButton");
  const approveButton = document.getElementById("approveButton");
  if (commentBox) {
    commentBox.addEventListener("input", () => {
      if (commentBox.value.trim() === "") {
        rejectButton.disabled = true;
        approveButton.disabled = true;
      } else {
        rejectButton.disabled = false;
        approveButton.disabled = false;
      }
    });
  }
})();
