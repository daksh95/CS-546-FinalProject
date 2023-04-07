// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
export let exists = (param) => {
    if (!param && !(param==false)) return false
    else return true
}

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
