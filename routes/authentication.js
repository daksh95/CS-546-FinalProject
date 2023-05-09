import auth from "../controllers/authentication.js";
import { Router } from "express";
const loginRoutes = Router();
const signUpRoutes = Router();
const logoutRoutes = Router();

//login page routes
loginRoutes.route("/").get(auth.getLogin).post(auth.postLogin);

//signup page routes
signUpRoutes.route("/").get(auth.getSignUp).post(auth.postSignUp);

logoutRoutes.route("/").get(auth.getLogout);

export {loginRoutes, signUpRoutes, logoutRoutes};
