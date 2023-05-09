const homeMiddleware = (req, res, next) => {
  let typeOfUser;
  let isApproved;
  let isPending;
  let isRejected;
  let isAuthenticated = false;
  let profileSetUpDone;
  if (req.session.user) {
    typeOfUser = req.session.user.typeOfUser;
    isApproved = req.session.user.approvalStatus === 'approved';
    isPending = req.session.user.approvalStatus === 'pending';
    isRejected = req.session.user.approvalStatus === 'rejected';
    profileSetUpDone = req.session.user.profileSetUpDone;
    isAuthenticated = true;
  }

  if (req.path === '/login' || req.path === '/signup' || req.path === '/') {
    if (isAuthenticated) {
      if (!profileSetUpDone) {
        if (typeOfUser === 'user') res.redirect("/user/" + id + "/profile");
        else if (typeOfUser === 'entity') res.redirect(`/entity/myProfile`);
      }
      else if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
      else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
      else if (typeOfUser === 'user') res.redirect('/land');
      else if (typeOfUser === 'admin') res.redirect('/admin');
      else res.redirect('/entity');
    }
    return next();
  }
  else if (req.path === '/logout') {
    if (!isAuthenticated) res.redirect('/login');
    return next();
  }
  else if (!isAuthenticated) {
    res.redirect('/login');
  }
  else if (req.path === '/') {
    if (!isAuthenticated) res.redirect("/login");
    if (!profileSetUpDone) {
      if (typeOfUser === 'user') res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') res.redirect(`/entity/myProfile`);
    }
    else if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (typeOfUser === 'user')
      res.redirect("/land");
    else if (typeOfUser === 'admin')
      res.redirect("/admin");
    else res.redirect("/entity");
  }
  else if (req.path.startsWith('/land') || req.path.startsWith('/user') || req.path.startsWith('/transactions')) {
    if (!profileSetUpDone) {
      if (typeOfUser === 'user') res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') res.redirect(`/entity/myProfile`);
    }
    else if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (typeOfUser === 'admin') res.redirect('/admin');
    else if (typeOfUser === 'user') return next();
    else res.redirect('/entity');
  }
  else if (req.path.startsWith('/admin')) {
    if (!profileSetUpDone) {
      if (typeOfUser === 'user') res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') res.redirect(`/entity/myProfile`);
    }
    else if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (typeOfUser === 'admin') return next();
    else if (typeOfUser === 'user') res.redirect('/land');
    else res.redirect('/entity');
  }
  else if (req.path.startsWith('/entity')) {
    if (!profileSetUpDone) {
      if (typeOfUser === 'user') res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') res.redirect(`/entity/myProfile`);
    }
    else if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (typeOfUser === 'admin') res.redirect('/admin');
    else if (typeOfUser === 'user') res.redirect('/land');
    else return next();
  }
  return next();
}

export { homeMiddleware };