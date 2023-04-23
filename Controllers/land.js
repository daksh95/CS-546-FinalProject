import landData from "../Data/land.js";
import { checkInputType, exists, validStateCodes } from "../Utils/helpers.js";

const getLand = async (req, res) => {
  const result = await landData.getLand(req.params.id);
  res.status(200).json({ data: result });
};
const getAllLand = async (req, res) => {
  const result = await landData.getAllLand();
  res.status(200).json(result);
};

const getLandByState = async (req, res) => {
  res.status(200).render("getLandByState", { title: "Get Lands By State" });
};

const postLandByState = async (req, res) => {
  let state = req.body.stateInput;
  let error = [];
  if (!exists(state)) error.push("State is not entered");
  if (!checkInputType(state, "string"))
    error.push("State must be of type string only");
  if (state.trim().length === 0)
    error.push("State cannot contain empty spaces only");
  state = state.trim();
  if (!validStateCodes.includes(state.toUpperCase()))
    error.push(
      "State parameter must be a valid statecode in abbreviations only"
    );
  if (error.length !== 0)
    return res.status(400).render("getLandByState", {
      title: "Get Lands By State",
      hasError: true,
      error: error,
    });

  try {
    let landByState = await landData.getLandByState(state);
    res
      .status(200)
      .render("displayLandByState", {
        title: "Lands",
        landByState: landByState,
      });
  } catch (error) {
    return res.status(400).render("getLandByState", {
      title: "Get Lands By State",
      hasError: true,
      error: error.message,
    });
  }
};

const updateLand = async (req, res) => {};

const postLand = async (req, res) => {};

const removeLand = async (id) => {};

// const landRestMethods = {
//     getAllLand: getAllLand,
//     getLand:getLand,
//     updateLand: updateLand,
//     postLand: postLand,
//     removeLand:removeLand
// }

export {
  getAllLand,
  getLand,
  updateLand,
  postLand,
  removeLand,
  getLandByState,
  postLandByState,
};
