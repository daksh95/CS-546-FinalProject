(function(){
    const landForm = document.getElementById("addLand-form");
    landForm.addEventListener('submit', landValidation);
    
    function landValidation(event){
        const error = document.getElementById("error");
        error.hidden = true;
        error.innerHTML ="";
        event.preventDefault();
        let errors =[];
        let line1 = document.getElementById("line1Input").value;
        let line2 = document.getElementById("line2Input").value;
        let city = document.getElementById("cityInput").value;
        let state= document.getElementById("stateInput").value;
        let zipCode = document.getElementById("zipCodeInput").value;
        let type = document.getElementById("typeInput").value;
        let length = document.getElementById("dimensionsLengthInput").value;
        let breadth = document.getElementById("dimensionsBreadthInput").value;
        let restrictionText = document.getElementById("restrictionsInput").value;
        let restrictions = document.getElementsByName("restrictions");
        
        //valid line1
        try {
            line1 = validString(line1, "line1", 46);
        } catch (e) {
            errors.push(e);
        }

        //valid line2
       if (line2.length>46){
            errors.push("line2 shouldnt be more than 46 characters");
       }

        //valid city
        try {
            city = validString(city, "city", 17);
        } catch (e) {
            errors.push(e);
        }
        // state
        try {
            state = validState(state);
        } catch (e) {
            errors.push(e);
        }

        //zipcode
        try {
            zipCode = validZip(zipCode);
    
        } catch (e) {
            errors.push(e);
        }

        //type of land
        try {
            type = validLandType(type);
        } catch (e) {
            errors.push(e);
        }
 
        //length
        try {
            length = validNumber(length, "length", 1);
        } catch (e) {
            errors.push(e);
        }
        //breadth
        try {
            breadth = validNumber(breadth, "breadth", 1);
        } catch (e) {
            errors.push(e);
        }
        console.log(restrictions);
        let count = 0;
        let noRestriction =false;
        try {
            for(let checkbox of restrictions){
                if(checkbox.checked){
                    count = count+1;
                    if(checkbox.value.toLowerCase() == "No restrictions".toLowerCase()){
                        noRestriction = true;
                    }
                    validrestrictions(checkbox.value);
                }
                // validrestrictions(checkbox.value);
            }
        } catch (e) {
            errors.push(e);
        } 
        if(restrictionText.trim().length>0){
            count +=1;
            try {
                restrictionText = validString(restrictionText);
            } catch (e) {
                errors.push(e)
            }
        }
        if(count==0 && restrictionText.trim().length==0){
            errors.push("If you don't have any restrictions, please select 'No restrictions'.");
        }
        if(count>1 && noRestriction == true){
            errors.push(`Please verify your input as it seems that you have selected "No restrictions" and other restrictions, which contradict each other.`)
        }
        if(restrictionText>400){
            errors.push("Only 400 characters allowed for 'other restriction(s)'")
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

    function validZip(zip){
        zip = validString(zip, "zipCode");
        numbersOnly = /^[0-9]+$/g;
        if(!numbersOnly.test(zip)){
            throw `valid zipcode is needed`;
        }
        zip = parseInt(zip);
        if(zip<501 || zip>99950){
            throw 'Please provide a valid zipcode';
        }
    }

    function validLandType(type){
        type = validString(type, "Type of Land", 20);
        if(type != "residential" && type!= "commercial" && type != "industrial" && type != "agricultural"){
            throw  `Valid Land Type is needed`;
        }
        return type;
    }


    function validNumber(num, parameter, min){
        if (typeof num == "undefined") {
            throw `${parameter} should be provided`;
          }
          num = parseInt(num);
          if (typeof num != "number") {
            throw ` number is needed but "${typeof num}" was provided for ${parameter}`;
          }
          if (Number.isNaN(num)) {
            throw `Valid number required for ${parameter}`;
          }
          if (min) {
            if (num < min) {
              throw `${parameter} can must be greater than ${min}`;
            }
          }
          return num;
    }
    function validrestrictions(restrictions){
        restrictions = validString(restrictions);
        if(restrictions!="Environmental restrictions" &&
        restrictions != "Deed restrictions" && 
        restrictions != "Zoning restrictions" &&
        restrictions != "No restrictions"){
            throw 'valid restriction needed';
         }
    }
    function validState(state){
       const validStateCodes = [
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
          ];
         state = validString(state, "State",2);
         state = state.toUpperCase();
         if(!validStateCodes.includes(state)){
            throw `please provide valid state`;
         } 
         return state;
    }

    })();