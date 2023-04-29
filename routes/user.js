import express from "express";
const routes = express.Router();
import { getPropertiesOfUser, getProfile } from "../controllers/user.js";

routes.route("/:id/land").get(getPropertiesOfUser);
routes.route("/:id/profile").get(getProfile);

export default routes;
