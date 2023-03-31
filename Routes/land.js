import express from "express";
const routes = express.Router();
import {getAllLand, getLand, updateLand, postLand, removeLand, } from "../Controllers/land.js";
routes.route('/').get(getAllLand).post(postLand);
routes.route('/:id').get(getLand).patch(updateLand).delete(removeLand);


export default routes;