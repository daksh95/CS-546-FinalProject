import auth from "../controllers/authentication.js";
import { Router } from "express";
const loginRoutes = Router();
const signUpRoutes = Router();

//login page routes
loginRoutes.route("/").get(auth.getLogin).post(auth.postLogin);

//signUp page routes
signUpRoutes.route("/").get(auth.getSignUp).post(auth.postSignUp);

export {loginRoutes, signUpRoutes};
