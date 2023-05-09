(function(){
const loginForm = document.getElementById("login-form");
const signUpForm = document.getElementById("signUp-form");
if(loginForm){
    loginForm.addEventListener('submit', loginValidation);
}
if(signUpForm){
    signUpForm.addEventListener('submit', signUpValidation);
}

function loginValidation(event){
    const error = document.getElementById("error");
    error.hidden = true;
    error.innerHTML ="";
    event.preventDefault();
    let errors =[];
    let email = document.getElementById("emailInput").value;
    let password = document.getElementById("passwordInput").value;
 
    // console.log(password);
    //valid email
    try {
        email = validEmail(email);
    } catch (e) {
        errors.push(e);
    }
    //valid password
    try {
        password = validPassword(password);
    } catch (e) {
        errors.push(e);
    }
    if(errors.length>0){
        for (let e of errors){
            var li = document.createElement("li");
            li.textContent = e;
            error.appendChild(li);
            error.hidden = false;       
        }
    }else{
        event.target.submit();
    }
    return;
}
function signUpValidation(event){
    const error = document.getElementById("error");
    error.hidden = true;
    error.innerHTML ="";
    event.preventDefault(); 
    let errors =[];
    let email = document.getElementById("emailInput").value;
    let password = document.getElementById("passwordInput").value;
    let rePassword = document.getElementById("rePasswordInput").value;
    let role = document.getElementById("roleInput").value;

    // console.log(password);
    //valid email
    try {
        email = validEmail(email);
    } catch (e) {
        errors.push(e);
    }
    //valid password
    try {
        password = validPassword(password);
    } catch (e) {
        errors.push(e);
    }
    if(password != rePassword){
        errors.push("Passwords do not match");
    }
    try {
        role = validTypeOfUser(role);
    } catch (e) {
        errors.push(e);
    }
    if(errors.length>0){
        for (let e of errors){
            var li = document.createElement("li");
            li.textContent = e;
            error.appendChild(li);
            error.hidden = false;       
        }
    }else{
        event.target.submit();
    }
    return;
}

function validString(string, parameter = "input", maxLength = null){
    if (string === undefined || !string || typeof string !== "string")
    throw `${parameter} is needed`;

  string = string.trim();
  if (string.length == 0)
    throw `${parameter} cannot be an empty string or just spaces`;

  if (maxLength) {
    if (string.length > maxLength) {
      throw `${parameter} can be only ${maxLength} character long`;
    }
  }
  return string;
}

function validEmail(email){
    email = validString(email, "email",352);
    const regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    if (!regex.test(email)) {
      throw `Valid email id needed`;
    }
    return email.toLowerCase();
}

function validPassword(pass){
    pass = validString(pass, "password", 15);
    if (pass.length < 8) {
      throw `Password length should be a minimum of 8`;
    }
    let upperCase = /.*[A-Z].*/g;
    let oneNumber = /.*[0-9].*/g;
    let oneSpecial = /[^a-zA-Z0-9\s]/g;
    let whiteSpace = /.*[\s].*/g;
    if (pass.match(whiteSpace)) {
      throw `Password should not contain any spaces`;
    }
    if (!pass.match(upperCase)) {
      throw `Password should have atleast one upercase character`;
    }
    if (!pass.match(oneNumber)) {
      throw `Password should have atleast one number`;
    }
    if (!pass.match(oneSpecial)) {
      throw `Password should have atleast one special character`;
    }
    return pass;
}
function validTypeOfUser(user){
  user = validString(user, "type of user", 16);
  
  user = user.toLowerCase();
  if (
    user !== "titlecompany" &&
    user !== "government" &&
    user !== "user" &&
    user !== "landsurveyor"
  ) {
    throw `Please select correct type of user`;
  }
  return user;
}
})();