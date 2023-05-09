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

  if (req.path === '/login' || req.path === '/signup') {
    if (isAuthenticated) {
      if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
      else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
      else if (!profileSetUpDone) {
        if (typeOfUser === 'user') return res.redirect("/user/" + id + "/profile");
        else if (typeOfUser === 'entity') return res.redirect(`/entity/myProfile`);
      }
      else if (typeOfUser === 'user') return res.redirect('/land');
      else if (typeOfUser === 'admin') return res.redirect('/admin');
      else return res.redirect('/entity');
    }
    return next();
  }
  else if (req.path === '/logout') {
    if (!isAuthenticated) return res.redirect('/login');
    return next();
  }
  else if (!isAuthenticated) {
    return res.redirect('/login');
  }
  else if (req.path === '/') {
    if (!isAuthenticated) return res.redirect("/login");
    if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (!profileSetUpDone) {
      if (typeOfUser === 'user') return res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') return res.redirect(`/entity/myProfile`);
    }
    else if (typeOfUser === 'user')
      return res.redirect("/land");
    else if (typeOfUser === 'admin')
      return res.redirect("/admin");
    else return res.redirect("/entity");
  }
  else if (req.path.startsWith('/land') || req.path.startsWith('/user') || req.path.startsWith('/transactions')) {
    if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (!profileSetUpDone) {
      if (typeOfUser === 'user') return res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') return res.redirect(`/entity/myProfile`);
    }
    else if (typeOfUser === 'admin') return res.redirect('/admin');
    else if (typeOfUser === 'user') return next();
    else return res.redirect('/entity');
  }
  else if (req.path.startsWith('/admin')) {
    if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (!profileSetUpDone) {
      if (typeOfUser === 'user') return res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') return res.redirect(`/entity/myProfile`);
    }
    else if (typeOfUser === 'admin') return next();
    else if (typeOfUser === 'user') return res.redirect('/land');
    else return res.redirect('/entity');
  }
  else if (req.path.startsWith('/entity')) {
    if (isPending) return res.render("approvalWaiting", { title: "Account Approval Pending" });
    else if (isRejected) return res.render("accountRejected", { title: "Account Rejected" });
    else if (!profileSetUpDone) {
      if (typeOfUser === 'user') return res.redirect("/user/" + id + "/profile");
      else if (typeOfUser === 'entity') return res.redirect(`/entity/myProfile`);
    }
    else if (typeOfUser === 'admin') return res.redirect('/admin');
    else if (typeOfUser === 'user') return res.redirect('/land');
    else return next();
  }
  return next();
}

export { homeMiddleware };