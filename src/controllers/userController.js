const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../controllers/AWSController");
const {
    checkEmptyBody,
    isEmpty,
    pincode,
    city,
    street,
    isValidEmail,
    isValidPhone,
    isValidObjectId,
    isValidName,
    isValidPassword } = require("../validation/validation");

//------------------------User Create------------------->>>>>

const createUser = async function (req, res) {
    try {
        let body = req.body;
        if (!checkEmptyBody(body)) return res(400).send({status: false, message: "please provide data in request body"});

        let { fname, lname, email, profileImage, phone, password, address, ...rest } = body;
        // if (rest)return res(400).send({status: false, message: "please provide required details only"})

        if(!isEmpty(fname)) return res(400).send({status: false, message: "fname is required"});
        
        if(!isValidName(fname)) return res(400).send({status: false, message: "fname is invalid"});

        if(!isEmpty(lname)) return res(400).send({status: false, message: "lname is required"})

        if(!isValidName(lname)) return res(400).send({status: false, message: "lname is invalid"})
        
        if(!isEmpty(email)) return res(400).send({status: false, message: "email is required"})
        
        if(!isValidEmail(email)) return res(400).send({status: false, message: "lname is invalid"})
        
        // if(!isEmpty(profileImage)) return res(400).send({status: false, message: "profileImage is required"})
        let files = req.files;
        if (!files || files.length == 0) return res.status(400).send({status: false, message: "please provide file"})
        let imageUrl = await uploadFile(files[0])
        body.profileImage = imageUrl;

        if(!isEmpty(phone)) return res(400).send({status: false, message: "phone is required"})

        if(!isValidPhone(phone)) return res(400).send({status: false, message: "lname is invalid"})

        if(!isEmpty(password)) return res(400).send({status: false, message: "password is required"})
        
        if(!isValidPassword(password)) return res(400).send({status: false, message: "lname is invalid"})

        if(!isEmpty(address)) return res(400).send({status: false, message: "address is required"})

        if (typeOf(address) != 'object') return res(400).send({status: false, message: "please provide address as object"})

        const {street, city, pincode} = address.shipping 
        if(!isEmpty(street)) return res(400).send({status: false, message: "street is required for shipping"})
        if(!street(street)) return res(400).send({status: false, message: "street is invalid for shipping"})
        if(!isEmpty(city)) return res(400).send({status: false, message: "city is required for shipping"})
        if(!city(city)) return res(400).send({status: false, message: "city is invalid for shipping"})
        if(!isEmpty(pincode)) return res(400).send({status: false, message: "pincode is required for shipping"})
        if(!pincode(pincode)) return res(400).send({status: false, message: "pincode is invalid for shipping"})

        if(!isEmpty(address.billing.street)) return res(400).send({status: false, message: "street is required for billing"})
        if(!street(address.billing.street)) return res(400).send({status: false, message: "street is invalid for billing"})
        if(!isEmpty(address.billing.city)) return res(400).send({status: false, message: "city is required for billing"})
        if(!city(address.billing.city)) return res(400).send({status: false, message: "city is invalid for billing"})
        if(!isEmpty(address.billing.pincode)) return res(400).send({status: false, message: "pincode is required for billing"})
        if(!pincode(address.billing.pincode)) return res(400).send({status: false, message: "pincode is invalid for billing"})







        const createdUser = await userModel.create(body);
        res.status(201).send({ status: true, message: "User created successfully", data: createdUser });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

//----------------User Login------------------------>>>>>
const loginUser = async function (req, res) {
    try {


    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


//----------------------Get User Profile---------------------------->>>>>>>>>>>
const getUserProfile = async function (req, res) {
    try {


    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

//----------------------User Profile update-------------------------->>>>>>>>

const updateUserProfile = async function (req, res) {
    try {


    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser;
module.exports.getUserProfile = getUserProfile;
module.exports.updateUserProfile = updateUserProfile;
