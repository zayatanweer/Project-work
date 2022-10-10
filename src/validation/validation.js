const mongoose = require("mongoose");



//<<----------------Validation for Email --------------------->>
const isValidEmail = function (email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  
  //-------------------Value Validation--------------------------->>
const isEmpty = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

  //--------------------ObjectId----------------------------------->>
const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId);
  };

  const street = function (street) {
    const streetRegex = /^[a-z \, A-Z \d]+$/;
    return streetRegex.test(street);
  };
  
  //--------------------validation for city--------------------------->>
  
  const city = function (city) {
    const cityRegex = /^[a-z A-Z]+$/;
    return cityRegex.test(city);
  };
  //----------------------validation for pin code-------------------->>
  
  const pincode = function (pincode) {
    const pinRegex = /^[\d]{6}$/;
    return pinRegex.test(pincode);
  };


  

// ----------------Name Validation-------------------------->>
const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z ]+$/;
  return nameRegex.test(name);
};
//<<----------------Validation for Phone No. ---------------->>
const isValidPhone = function (phone) {
  return /^([+]\d{2})?\d{10}$/.test(phone);
};



//------------------ Password Validation----------------------->>
const isValidPassword = function (password) {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/;
  return passwordRegex.test(password);
};




module.exports = {
  isEmpty,
  pincode,
  city,
  street,
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  
  isValidName,
  isValidPassword
};
 