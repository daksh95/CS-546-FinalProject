(function(){
    const profileForm = document.getElementById("profileSetUp-form");
    profileForm.addEventListener('submit', profileValidation);
    
    function profileValidation(event){
        const error = document.getElementById("error");
        error.hidden = true;
        error.innerHTML ="";
        event.preventDefault();
        let errors =[];
        let name = document.getElementById("nameInput").value;
        let phone = document.getElementById("phoneInput").value;
        let email = document.getElementById("emailIdInput").value;
        let typeofGovernmentId= document.getElementById("typeofGovernmentIdInput");
        let role = document.getElementById("roleInput");
        //valid name
        try {
            name = validString(name, "name", 40);
        } catch (e) {
            errors.push(e);
        }

        //valid phone
        try {
            phone = validPhone(phone);
        } catch (e) {
            errors.push(e);
        }

        //valid email
        try {
            email = validEmail(email);
        } catch (e) {
            errors.push(e);
        }
        //If its a user
        if(typeofGovernmentId){
            typeofGovernmentId = typeofGovernmentId.value;
            //type of government ID
            try {
                typeofGovernmentId = validGovernmentIdType(typeofGovernmentId);
            } catch (e) {
                errors.push(e);
            }
            //valid government Id number
            let governmentId = document.getElementById("governmentIdInput").value;
            if(typeofGovernmentId =="ssn"){
                try {
                    governmentId = validSSN(governmentId);
                } catch (e) {
                    errors.push(e);
                }
            }else{
                try {
                    governmentId = validDriverLicense(governmentId);
                } catch (e) {
                    errors.push(e);
                }
            }
            //dob validate
            let dob = document.getElementById("dobInput").value;
            try {
                dob = validDOB(dob);
            } catch (e) {
                errors.push(e);
            }

            //valid gender
            let gender = document.getElementById("genderInput").value;
            try {
                gender = validGender(gender);
            } catch (e) {
                errors.push(e);
            }
        }
        //its an entity
        if(role){
            role = role.value;
            try {
                role = validTypeOfUser(role);
            } catch (e) {
                errors.push(e);
            }

            //Website URL
            try {
                let website = document.getElementById("websiteInput").value;
                    website = validWebsite(website);
            } catch (e) {
                errors.push(e);  
            }
            
            // License
            try {
                let license = document.getElementById("licenseInput").value;
                license = validString(license, "License",15);
            } catch (e) {
                errors.push(e);
            }
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
    function validPhone(phone){
        phone = validString(phone, "Phone Number", 10);
        
        let numberOnly = /^[0-9]{8,11}$/g;
        if(!numberOnly.test(phone)){
            throw `Length phone number should between 8 to 10 numebrs`; 
        }
        return phone;
    }  

    function validDriverLicense(driverLicense){
        driverLicense = validString(driverLicense, "Driver's License", 14);
        let onlyAlphaNumeric = /[a-zA-Z0-9]{8,14}$/g;
        if(!onlyAlphaNumeric.test(driverLicense)){
            throw `please provide valid drivers license`;
        }
        let oneSpecial = /[^a-zA-Z0-9\s]/g;
        let whiteSpace = /.*[\s].*/g;
        if (driverLicense.match(whiteSpace)) {
          throw `Driver's License should not contain any spaces`;
        }
        if (driverLicense.match(oneSpecial)) {
            throw `Driver's License must not have special character(s)`;
          }
        return driverLicense;
    }

    function validSSN(ssn){
        ssn = validString(ssn, "SSN number", 11);
        let ssnFormat = /^\d{3}-\d{2}-\d{4}$/g;
        if(!ssn.match(ssnFormat)){
            throw `please provide valid ssn with "-" in between`;
        }
        return ssn;
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
    function validDOB(dob){
        dob = validString(dob, "Date of Birth");
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateFormat.test(dob)) {
            throw "Proper date formated is needed";
        } 
        let dateArry = dob.split("-");
        let excact18 = false;
        // console.log( parseInt(dateArry[0])+18, new Date().getFullYear()) ;
        //minus years
        if(parseInt(dateArry[0]) + 18 > new Date().getFullYear()){
            throw 'User should be between 18 and 110 years old';    
        }
        if(parseInt(dateArry[0]) + 18 == new Date().getFullYear()){
            // console.log("here i am exact 18");
            excact18= true;
        }
        if(new Date().getFullYear() - parseInt(dateArry[0]) >110 ){
            throw 'User should be between 18 and 110 years old';
        }
        //month check and date check
        if(excact18){
            // console.log(parseInt(dateArry[1]), new Date().getMonth()+1, "this is month comparison");
            if(parseInt(dateArry[1]) > new Date().getMonth()+1){
                throw "User should be between 18 and 110 years old";
            }
            // console.log(dateArry);
            // console.log(parseInt(dateArry[2]), new Date().getDate(), "this is day comparison");
            if(parseInt(dateArry[2]) > new Date().getDate()){//edge case, leap year.
                throw "User should be between 18 and 110 years old";
            } 
        }
        return dob;
    }
    function validGovernmentIdType(governmentIdType){
        governmentIdType = validString(governmentIdType, "Government ID Type");
        if(governmentIdType != "ssn" && governmentIdType != "driverLicense"){
            throw "Not a valid government id type";
        }
        return governmentIdType;
    }

    function validWebsite(website){
        website = validString(website, "website");
        const regex = new RegExp(/^http:\/\/www\.[\w\W]{5,}\.com$/i);
        if (!regex.test(website)) {
          throw `Valid website URL needed ${website}`;
        }
        return website;
    }
    function validGender(gender){
        gender = validString(gender,"gender");
        gender = gender.toLowerCase();
        let validGenders = ["male", "female", "other"];
        if (!validGenders.includes(gender))
          throw `${gender} is not a recognized gender`;
        
          return gender;
    }
    })();