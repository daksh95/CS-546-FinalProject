const homeMiddleware = (req, res, next) => {
    if (req.path === "/" || req.path === "/home") {
        if (!req.session.user) return res.redirect("/login");
        else if (req.session.user.typeOfUser === 'user')
            return res.redirect("/land");
        else if (req.session.user.typeOfUser === 'admin')
            return res.redirect("/admin/profile");
        else return res.redirect("/entity")
    }
    next();
}

export { homeMiddleware };
