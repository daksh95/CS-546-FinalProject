(function () {
  function validations(comment, approved, rejected) {
    if (!comment) throw `Comment is missing!`;
    if (typeof comment !== "string") throw `Comment must be a string!`;
    if (comment.trim().length === 0)
      throw `Comment cannot be an empty string or just spaces!`;
    comment = comment.trim();
    if (!approved && !rejected) throw `Invalid approval/rejection status!`;
  }

  const approval = document.getElementById("approvalForm");

  if (approval) {
    const approved = document.getElementById("approveButton");
    const rejected = document.getElementById("rejectButton");
    const comment = document.getElementById("commentTextArea");
    const errorContainer = document.getElementById("errors");

    approval.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        validations(comment, approved, rejected);
        approval.submit();
        errorContainer.hidden = true;
      } catch (e) {
        const message = typeof e === "string" ? e : e.message;
        errorContainer.textContent = message;
        errorContainer.style.backgroundColor = "green";
        errorContainer.style.border = "dashed";
        errorContainer.hidden = false;
      }
    });
  }
})();
