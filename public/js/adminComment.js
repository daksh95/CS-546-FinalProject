(function () {
  //   function commentValidaton(comment) {
  //     if (!comment && !(comment == false))
  //       throw new Error("Comment parameter does not exists");
  //     if (comment.trim().length === 0)
  //       throw new Error("Comment cannot contain empty spaces only");
  //     return comment.trim();
  //   }

  const commentBox = document.getElementById("commentTextArea");
  const rejectButton = document.getElementById("rejectButton");
  if (commentBox) {
    commentBox.addEventListener("input", () => {
      if (commentBox.value.trim() === "") rejectButton.disabled = true;
      else rejectButton.disabled = false;
    });
  }
})();
