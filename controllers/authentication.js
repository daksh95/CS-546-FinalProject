import auth from "../data/credential.js";
import validation from "../utils/validation.js";
import hash from "../utils/encryption.js";
import userData from "../data/user.js";
import entityData from "../data/entities.js";
import session from "express-session";

//Login
const getLogin = async (req, res) => {
  res.status(200).render("authentication/login", { title: "Login Page" });
};

const postLogin = async (req, res) => {
  let { emailInput, passwordInput } = req.body;
  let errors = [];
  //validation for email
  try {
    emailInput = validation.validEmail(emailInput);
  } catch (e) {
    errors.push(e);
  }

  //validation for password
  try {
    passwordInput = validation.validPassword(passwordInput);
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    res.status(400).render("authentication/login", {
      title: "Login Page",
      email: emailInput,
      password: passwordInput,
      hasError: true,
      error: [errors],
    });
    return;
  }

  let validUser;

  //check if user exist
  try {
    validUser = await auth.getCredentialByEmailId(emailInput);
  } catch (error) {
    res.status(401).render("authentication/login", {
      title: "Login Page",
      email: emailInput,
      pasword: passwordInput,
      hasError: true,
      error: ["Invalid Email or Password"],
    });
    return;
  }

  //Checking if password is correct
  const validPass = await hash.compareHash(passwordInput, validUser.password);

  if (!validPass) {
    res.status(401).render("authentication/login", {
      title: "Login Page",
      email: emailInput,
      pasword: passwordInput,
      hasError: true,
      error: ["Invalid Email or Password"],
    });
    return;
  }
  let id = undefined;
  try {
    if (validUser.typeOfUser === "user") {
      let userObj = await userData.getUserByEmail(emailInput);
      id = userObj._id;
    } else if (validUser.typeOfUser === "admin") id = undefined;
    else {
      let entityObj = await entityData.getEntityByEmail(emailInput);
      id = entityObj._id;
    }
  } catch (error) {
    res.status(400).render("Error", {
      title: "Error",
      hasError: true,
      error: [error.message],
    });
  }

  //create session
  req.session.user = {
    email: emailInput,
    id: id,
    credentialId: validUser._id,
    typeOfUser: validUser.typeOfUser,
    isApproved: validUser.isApproved,
  };

  //if profile is not set up
  if (!validUser.profileSetUpDone) {
    if (validUser.typeOfUser == "user") {
      res.status(200).redirect(`/user/${id}/profile`);
      return;
    } else if (validUser.typeOfUser != "admin") {
      res.status(200).redirect(`/entity/myProfile`);
      return;
    }
  }

  if (validUser.isApproved == false) {
    return res
      .status(200)
      .render("approvalWaiting", { title: "Approval waiting" }); //TODO create HTML page for this
  }

  //If profile is set up then we will redirect them to their appropriate pages
  // For admin
  if (validUser.typeOfUser == "admin") {
    res.status(200).redirect("/admin/profile");
    return;
  }

  // For users buyer or seller
  if (validUser.typeOfUser == "user") {
    res.status(200).redirect("/land");
    return;
  }

  // For land surveyor or title company or government, basically, any entity
  if (
    validUser.typeOfUser == "landsurveyor" ||
    validUser.typeOfUser == "titlecompany" ||
    validUser.typeOfUser == "government"
  ) {
    res.status(200).redirect("/entity");
    return;
  }
};

//Sign up
const getSignUp = async (req, res) => {
  res.status(200).render("authentication/signUp");
};

const postSignUp = async (req, res) => {
  let { emailInput, passwordInput, rePasswordInput, roleInput } = req.body;
  let queryData = {};
  let errors = [];
  //valid email
  try {
    queryData.emailId = validation.validEmail(emailInput);
  } catch (e) {
    errors.push(e);
  }

  //valid password
  try {
    queryData.password = validation.validPassword(passwordInput);
  } catch (e) {
    errors.push(e);
  }

  try {
    queryData.repassword = validation.validPassword(rePasswordInput);
  } catch (e) {
    errors.push(e);
  }

  // check if both the passwords are same
  if (passwordInput !== rePasswordInput) errors.push(`Passwords do not match!`);

  //valid type of user
  try {
    queryData.typeOfUser = validation.validTypeOfUser(roleInput);
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    res.status(400).render("authentication/signUp", {
      title: "Registration Page",
      email: emailInput,
      password: passwordInput,
      hasError: true,
      error: errors,
    });
    return;
  }

  //add new credentials
  let signup;
  try {
    signup = await auth.addCredential(queryData);
  } catch (error) {
    //error due to server issue
    if (error == "Could not create account") {
      res.status(500).render("error", {
        title: "Error Page",
        hasError: true,
        error: [error],
      });
      return;
    }

    //error due to bad data or email already getting used
    res.status(400).render("authentication/signUp", {
      title: "Registration Page",
      hasError: true,
      error: errors,
      emailInput: emailInput,
      passwordInput: passwordInput,
    });

    return;
  }

  //add user to user collection
  if (queryData.typeOfUser === "user") {
    try {
      await userData.initializeProfile(queryData.emailId);
    } catch (error) {
      //TODO delete user credentials;
      await auth.deleteCredentialByEmailId(queryData.emailId);
      res.status(500).render("authentication/signUp", {
        title: "Registration Page",
        hasError: true,
        error: [error],
        emailInput: emailInput,
        passwordInput: passwordInput,
      });
      return;
    }
  } else if (queryData.typeOfUser !== "admin") {
    try {
      await entityData.initializeEntityProfile(
        queryData.emailId,
        queryData.typeOfUser
      );
    } catch (error) {
      //TODO delete user;
      await auth.deleteCredentialByEmailId(queryData.emailId);
      res.status(500).render("authentication/signUp", {
        title: "Registration Page",
        hasError: true,
        error: [error],
        emailInput: emailInput,
        passwordInput: passwordInput,
      });
      return;
    }
  }
  //successful creation
  if (signup) {
    // redirect user to login page
    return res.status(200).redirect("/login");
  }
};

const getLogout = async (req, res) => {
  req.session.destroy();
  return res.status(200).render("authentication/logout", { title: "logout" });
};

const authController = {
  getLogin: getLogin,
  postLogin: postLogin,
  getSignUp: getSignUp,
  postSignUp: postSignUp,
  getLogout: getLogout,
};

export default authController;
