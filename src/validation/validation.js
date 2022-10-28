//=====================Importing mongoose package=====================//
const mongoose = require("mongoose");


//*==================================================    >>>>>>>>    Some globally used function        <<<<<<<<     =======================================================//


const checkEmptyBody = (object) => { return Object.keys(object).length > 0 };                                  // >>>> to check that object has keys or not 

const isValidObjectId = (objectId) => { return mongoose.Types.ObjectId.isValid(objectId); };                  // to validate an ObjectId

const isValid = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};                                                                                                            // Validating that the Input must be a non-empty String


//* USER DETAILS VALIDATIONS *//
const isValidName = (name) => { return ((/^[a-zA-Z ]+$/).test(name)); };                                                                              // Name Validation
const isValidPhone = (phone) => { return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(phone)); };                                                         // Validation for Phone No. (indian only)
const isValidEmail = (email) => { return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email); };                                              // Validation for Email 
const isValidPassword = (password) => { return (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).test(password); };    // validation for password


//* ADDRESS VALIDATIONS *//
const streetValidation = (street) => { return /^[a-zA-Z0-9 -\.]+$/.test(street); };                           // Validation for street
const cityValidation = (city) => { return ((/^[a-z A-Z]+$/).test(city)); };                                   // validation for city
const pinCodeValidation = (pinCode) => { return ((/^[\d]{6}$/).test(pinCode)); };                             // validation for pin code


//* AWS link VALIDATIONS *//
const isValidImageLink = (imageUrlLink) => {
  const urlRegex = /(http[s]:\/\/)([a-z\-0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-\/._~:?#\[\]@!$&'()+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png|bmp|gif)/i;
  return urlRegex.test(imageUrlLink);
};                                                                                                            // Validation for image link (jpg, jpeg, bmp, gif, png)


//* PRODUCT VALIDATIONS *//
const isValidTitle = (title) => { return (/^[a-zA-Z][a-zA-Z0-9 $!-_#@%&\.]+$/.test(title)); }                 // title Validation
const isValidSize = (sizes) => { return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes); }            // size Validation
const isValidPrice = (price) => { return (/^[(0-9)+.?(0-9)*]+$/.test(price)); }                               // price Validation
const isValidInstallments = (installments) => { return ((/^[\d]+$/).test(installments)); }                    // installment Validation
const isValidNum = (num) => { return /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(num); }                             // number Validation
const isValidStyle = (style) => { return /^[a-zA-Z _-]+$/.test(style); }                                      // style Validation
const isValidBoolean = (value) => { return (typeof value === "boolean"); }                                    // boolean validation




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
