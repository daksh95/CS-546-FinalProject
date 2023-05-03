import auth from "../data/credential.js";
import validation from "../utils/validation.js";
import hash from "../utils/encryption.js";
import userData from "../data/user.js"

//Login 
const getLogin = async (req, res) =>{
    res.status(200).render("authentication/login", {title: "Login Page"});
}

const postLogin = async (req, res) =>{
    let {emailInput, passwordInput} = req.body;
    //validation for email
    emailInput = validation.validEmail(emailInput);
    
    //validation for password
    passwordInput = validation.validPassword(passwordInput);
    
    let validUser;
    console.log(emailInput);

    //check if user exist
    try {
        validUser = await auth.getCredentialByEmailId(emailInput);
        console.log(validUser.password);
    }catch (error) {
        res.status(401).render("authentication/login", 
        {title: "Login Page", email: emailInput, pasword: passwordInput, error: "Invalid Email or Password"});     
        return;
    }

    //Checking if password is correct
    const validPass = await hash.compareHash(passwordInput, validUser.password);
    // console.log(hashPass, validUser.password);
    if(!validPass){
        res.status(401).render("authentication/login", 
        {title: "Login Page", email: emailInput, pasword: passwordInput, error: "Invalid Email or Password"}); 
        return;
    }
    
    //create session
    req.session.user = {email:emailInput, id: validUser.id, typeOfUser: validUser.typeOfUser};
    console.log("here i am in");
    // check if user is approved
    if(!validUser.approved){
        
        //set up profile
        res.status(200).redirect("/land");
        // res.status(200).redirect(`/user/${userApproved.id}/profile`);
        return;
    }
    
    const userApproved = await userData.getUserByEmail(emailInput);
    //Valid credential therfore, redirect them to appropriate pages;
    //admin
    if(validUser.typeOfUser =="admin"){
        res.status(200).redirect("/admin/profile");
        return;
    }

    //users buyer or seller
    if(validUser.typeOfUser == "user"){
        res.status(200).redirect("/land");
        return;
    }

    //title company
    if(validUser.typeOfUser == "titleCompany"){

    }

    //surveyor
    if(validUser.typeOfUser == "surveyor"){
        
    }

    //government
    if(validUser.typeOfUser == "government"){

    }
}


//Sign up
const getSignUp = async (req, res) =>{
    res.status(200).render("authentication/signUp");
}

const postSignUp = async (req, res) =>{
    let {typeOfUserInput, emailInput, passwordInput} = req.body; 
    let queryData ={};
    typeOfUserInput = "user";
    //valid email
    queryData.emailId = validation.validEmail(emailInput); 

    //valid password 
    queryData.password = validation.validPassword(passwordInput);

    //valid type of user
    queryData.typeOfUser = validation.validTypeOfUser(typeOfUserInput); 
    
    //add new credentials
    let signup;
    try {
        signup = await auth.addCredential(queryData);
    } catch (error) {
        //error due to server issue
        console.log(error);
        if (error == "Could not create account"){
            res.status(500).render("error", {title: "Error Page", error:error})
            return;
        }
        //error due to bad data or email already getting used
        res.status(400).render("authentication/signUp", {title: "Registration Page", error:error, emailInput:emailInput, passwordInput:passwordInput});
        return;
    }
    
    //add user to user collection
    
    
    //successful creation
    if(signup){
        // redirect user to login page
        res.status(200).redirect("/login");
        return;
    }



}

const authController = {
    getLogin:getLogin,
    postLogin: postLogin,
    getSignUp: getSignUp,
    postSignUp: postSignUp
}

export default authController;