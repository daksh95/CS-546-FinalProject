const homeMiddleware = (req, res, next)=>{
    if(req.path == "/"){
        if(!req.session.user){
            res.status(200).redirect("/login");
            return;
         }else{
            res.status(200).redirect("/land");
            return;
         }
    }
    next();
}
export {homeMiddleware};