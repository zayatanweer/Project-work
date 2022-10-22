const mongoose = require("mongoose");


//===================== >>>>>>>>     Some globally used function       <<<<<<<<<<< =====================//


const checkEmptyBody = (object) => { return Object.keys(object).length > 0 }            // >>>> to check that object has keys or not 


//===================== Validating that the Input must be a non-empty String =====================//
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//===================== Validation for image =====================//
// const validImage = function (image) {
//   return /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/.test(image)
// }
const isValidImageLink = (imageUrlLink) => {
  const urlRegex = /(http[s]:\/\/)([a-z\-0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-\/._~:?#\[\]@!$&'()+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png|bmp|gif)/i;
  return urlRegex.test(imageUrlLink);
};
//<<----------------Validation for Email --------------------->>
const isValidEmail = function (email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

//--------------------ObjectId----------------------------------->>
const isValidObjectId = (objectId) => { return mongoose.Types.ObjectId.isValid(objectId); };

const streetValidation = function (street) {
  const streetRegex = /^[a-zA-Z0-9 -\.]+$/                   ///^[a-z \, A-Z \d]+$/;       // check regex
  return streetRegex.test(street);
};

//--------------------validation for city--------------------------->>
const cityValidation = function (city) { return ((/^[a-z A-Z]+$/).test(city)); };
//----------------------validation for pin code-------------------->>
const pinCodeValidation = (pinCode) => { return ((/^[\d]{6}$/).test(pinCode)); };
// ----------------Name Validation-------------------------->>
const isValidName = (name) => { return ((/^[a-zA-Z ]+$/).test(name)); };
//<<----------------Validation for Phone No. ---------------->>
const isValidPhone = (phone) => { return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(phone)); };
//------------------ Password Validation----------------------->>
const isValidPassword = (password) => { return (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).test(password); };


//* PRODUCT VALIDATIONS *//

//------------------ title Validation----------------------->>
const isValidTitle = (title) => { return (/^[a-zA-Z][a-zA-Z0-9 $!-_#@%&\.]+$/.test(title)); }

//------------------ size Validation----------------------->>
const isValidSize = (sizes) => { return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes); }
//------------------ price Validation----------------------->>
const isValidPrice = (price) => { return (/^[(0-9)+.?(0-9)*]+$/.test(price)); }
//------------------ installment Validation----------------------->>
const isValidInstallments = (installments) => { return ((/^[\d]+$/).test(installments)); }
//------------------ number Validation----------------------->>
const isValidNum = (num) => { return /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(num); }
//------------------ style Validation----------------------->>
const isValidStyle = (style) => { return /^[a-zA-Z _-]+$/.test(style); }
//------------------ boolean Validation----------------------->>
const isValidBoolean = (value) => {
  if (!(typeof value === "boolean")) return false
  return true
}






module.exports = {
  checkEmptyBody,
  isValid,
  isValidImageLink,
  pinCodeValidation,
  cityValidation,
  streetValidation,
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  isValidName,
  isValidPassword,
  isValidTitle,
  isValidSize,
  isValidPrice,
  isValidInstallments,
  isValidNum,
  isValidStyle,
  isValidBoolean
};
