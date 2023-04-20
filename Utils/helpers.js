// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
export let exists = (param) => {
  if (!param && !(param == false)) return false;
  else return true;
};

export let stringPalindromes = (str) => {
  let stringArray = str.split("");
  let stringArrayReverse = stringArray.reverse();
  let strReverse = stringArrayReverse.join("");
  if (str === strReverse) return true;
  return false;
};

export let isObjectDeepEqual = (object1, object2) => {
  // console.log(object1, object2);
  if (object1 === object2) return true;
  if (typeof object1 === "string" || typeof object2 === "string") {
    if (object1.trim() === object2.trim()) return true;
    else return false;
  }
  if (typeof object1 != "object" || typeof object2 != "object") return false;
  let object1Keys = Object.keys(object1);
  let object2Keys = Object.keys(object2);
  if (object1Keys.length != object2Keys.length) return false;
  else {
    // console.log("here");
    for (let key of object1Keys) {
      if (
        !object2Keys.includes(key) ||
        !isObjectDeepEqual(object1[key], object2[key])
      )
        return false;
    }
    return true;
  }
};

export let objectSameKeys = (obj1, obj2) => {
  const obj1keyslength = Object.keys(obj1).length;
  const obj2keyslength = Object.keys(obj2).length;
  if (obj1keyslength === obj2keyslength) {
    return Object.keys(obj1).every((key) => {
      return obj2.hasOwnProperty(key);
    });
  }
  return false;
};

export let checkInputType = (input, type) => {
  // console.log(input, type);
  if (type == "Array") {
    if (Array.isArray(input)) return true;
    else return false;
  } else if (type == "object") {
    if (typeof input === type && !Array.isArray(input)) return true;
    else return false;
  } else {
    // console.log(typeof input);
    if (typeof input === type) return true;
    else return false;
  }
};

export let inputValidation = (input, type) => {
  if (!exists(input)) throw new Error(`${input} parameter does not exists`);
  if (!checkInputType(input, type))
    throw new Error(`${input} must be of type ${type} only`);
  if (type === "string" && input.trim().length === 0)
    throw new Error(`${input} cannot contain empty spaces only`);
  if (type === "number" && (input === NaN || input === Infinity))
    throw new Error(`${input} must be of type number only`);
  return input;
};

export let objectType = (object, type) => {
  return Object.values(object).every((value) => typeof value === type);
};

export let arrayLength = (array, count, exact = false) => {
  if (exact) return array.length == count;
  return array.length >= count;
};

export let objectLength = (object, count) => {
  return Object.keys(object).length >= count;
};

export let emptyArrayCheck = (...args) => {
  let result = false;
  for (let arr of args) {
    if (arr.length === 0) {
      return true;
    }
    for (let i = 0; i < arr.length; i++) {
      if (Array.isArray(arr[i])) {
        if (emptyArrayCheck(arr[i])) {
          result = true;
        }
      }
    }
  }
  return result;
};

export const validStateCodes = [
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
