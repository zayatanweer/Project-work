const mongoose=require('mongoose')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
    }
    
    const isVAlidRequestBody = function (requestBody) {
        return Object.keys(requestBody).length > 0
    }

    const isValidPassword = function (pw) {
        let pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/;
        if (pass.test(pw)) return true;
      };

      const validString=function(value){
        if(typeof value==='string' && value.trim().length===0) return false
        return true
      }
      
    const objectIdValid = function (value) {
      return mongoose.Types.ObjectId.isValid(value);
      };

      let regexSpaceChar = function (attribute) {
        return (/^[A-Za-z\s]{1,}[\,]{0,1}[A-Za-z\s]{0,}$/.test(attribute))
        }

    const nameRegex = /^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)*/
    const phoneRegex =  /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    const dateFormate = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
    const pincodeValid=/^(\d{4}|\d{6})$/
    const isbnValid=	/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/

    const ratingRegex= /^(\d*\.)?\d+$/
module.exports={isValid,isVAlidRequestBody,isValidPassword,validString,objectIdValid,regexSpaceChar, nameRegex,phoneRegex,emailRegex,dateFormate,pincodeValid,isbnValid,ratingRegex}