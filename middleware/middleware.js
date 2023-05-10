const homeMiddleware = (req, res, next) => {
  let typeOfUser;
  let isApproved;
  let isPending;
  let isRejected;
  let isAuthenticated = false;
  let profileSetUpDone;
  let id;
  if (req.session.user) {
    id = req.session.user.id;
    typeOfUser = req.session.user.typeOfUser;
    isApproved = req.session.user.approvalStatus === "approved";
    isPending = req.session.user.approvalStatus === "pending";
    isRejected = req.session.user.approvalStatus === "rejected";
    profileSetUpDone = req.session.user.profileSetUpDone;
    isAuthenticated = true;
  }
  if (req.path === "/") {
    return res.redirect("/login");
  }

  if (req.path === "/login" || req.path.toLowerCase() === "/signup") {
    if (!isAuthenticated) return next();
    else {
      if (!profileSetUpDone) {
        if (typeOfUser === "user") return res.redirect(`/user/${id}/profile`);
        else return res.redirect("/entity/myProfile");
      }
      if (isPending)
        return res.render("approvalWaiting", {
          title: "Account Approval Pending",
        });
      if (isRejected)
        return res.render("accountRejected", { title: "Account Rejected" });
      if (typeOfUser === "user") return res.redirect("/land");
      if (typeOfUser === "admin") return res.redirect("/admin");
      return res.redirect("/entity");
    }
  }

  if (req.path === "/logout") {
    if (!isAuthenticated) return res.redirect("/login");
  }

  if (
    req.path.startsWith("/land") ||
    req.path.startsWith("/user") ||
    req.path.startsWith("/transactions")
  ) {
    if (!isAuthenticated) return res.redirect("/login");
    else {
      if (!profileSetUpDone) {
        if (typeOfUser === "user") {
          if (req.path === `/user/${id}/profile`) return next();
          return res.redirect(`/user/${id}/profile`);
        } else return res.redirect("/entity/myProfile");
      }
      if (isPending)
        return res.render("approvalWaiting", {
          title: "Account Approval Pending",
        });
      if (isRejected)
        return res.render("accountRejected", { title: "Account Rejected" });
      if (typeOfUser === "admin") return res.redirect("/admin");
      if (typeOfUser !== "user") return res.redirect("/entity");
    }
  }

  if (req.path.startsWith("/entity")) {
    if (!isAuthenticated) return res.redirect("/login");
    if (!profileSetUpDone) {
      if (typeOfUser === "user") return res.redirect(`/user/${id}/profile`);
      else {
        if (req.path === "/entity/myProfile") return next();
        return res.redirect("/entity/myProfile");
      }
    }
    if (isPending)
      return res.render("approvalWaiting", {
        title: "Account Approval Pending",
      });
    if (isRejected)
      return res.render("accountRejected", { title: "Account Rejected" });
    if (typeOfUser === "admin") return res.redirect("/admin");
    if (typeOfUser === "user") return res.redirect("/land");
  }

  if (req.path.startsWith("/admin")) {
    if (!isAuthenticated) return res.redirect("/login");
    if (!profileSetUpDone) {
      if (typeOfUser === "user") return res.redirect(`/user/${id}/profile`);
      else return res.redirect("/entity/myProfile");
    }
    if (isPending)
      return res.render("approvalWaiting", {
        title: "Account Approval Pending",
      });
    if (isRejected)
      return res.render("accountRejected", { title: "Account Rejected" });
    if (typeOfUser === "user") return res.redirect("/land");
    if (typeOfUser !== "admin") return res.redirect("/entity");
  }

  return next();
};

export { homeMiddleware };
