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
        if (!checkEmptyBody(body)) return res.status(400).send({ status: false, message: "please provide data in request body" });

        let { fname, lname, email, profileImage, phone, password, address, ...rest } = body;
        // if (rest)return res(400).send({status: false, message: "please provide required details only"})

        if (!isEmpty(fname)) return res.status(400).send({ status: false, message: "fname is required" });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "fname is invalid" });

        if (!isEmpty(lname)) return res.status(400).send({ status: false, message: "lname is required" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "lname is invalid" })

        if (!isEmpty(email)) return res.status(400).send({ status: false, message: "email is required" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "lname is invalid" })

        // if(!profileImage) return res.status(400).send({status: false, message: "profileImage is required"})
        let files = req.files;
        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "please provide file" })
        let imageUrl = await uploadFile(files[0])
        body.profileImage = imageUrl;

        if (!isEmpty(phone)) return res.status(400).send({ status: false, message: "phone is required" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "lname is invalid" })

        if (!isEmpty(password)) return res.status(400).send({ status: false, message: "password is required" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "lname is invalid" })


        //validate address
        // if (!address) return res.status(400).send({ status: false, message: "address is required" })

        try {
            address = JSON.parse(address);
        }
        catch (err) {
            console.log(err);
        }

        // if (typeof address !== "object") return res.status(400).send({ status: false, message: "address should be in object format" })
        
        if (Object.keys(address).length == 0) return res.status(400).send({ status: false, message: "please enter a valid address" })

        if (!address.shipping) return res.status(400).send({ status: false, message: "please enter shipping address and it should be in object also." })
        else {

            let { street, city, pincode } = address.shipping;

            if (!isEmpty(street)) return res.status(400).send({ status: false, message: "enter shipping street" })
            if (!street(street)) return res.status(400).send({ status: false, message: "provide a valid Shipping Street Name" })

            if (!isEmpty(city)) return res.status(400).send({ status: false, message: "enter Shipping city" })
            if (!city(city.trim())) return res.status(400).send({ status: false, message: "provide a valid Shipping City Name" })

            if (!isEmpty(pincode)) return res.status(400).send({ status: false, message: "enter Shipping Pincode" })
            if (!pincode(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" })
        }


        if (!address.billing) return res.status(400).send({ status: false, message: "Please enter Billing address and it should be in object also." })

        let { street, city, pincode } = address.billing;

        if (!isEmpty(street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" })
        if (!street(street)) return res.status(400).send({ status: false, message: "provide a valid Billing Street Name" })

        if (!isEmpty(city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" })
        if (!city(city.trim())) return res.status(400).send({ status: false, message: "provide a Billing City Name" })


        if (!keyValid(pincode)) return res.status(400).send({ status: false, message: "Enter Shipping Pincode" })
        if (!pincode(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" })

        if (!keyValid(street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" })

        if (!street(street)) return res.status(400).send({ status: false, message: "provide a valid Billing Street Name" })

        if (!keyValid(city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" })
        if (!city(city.trim())) return res.status(400).send({ status: false, message: "provide a Billing City Name" })


        if (!keyValid(pincode)) return res.status(400).send({ status: false, message: "Enter Shipping Pincode" })
        if (!pincode(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" })
        
        const salt = await bcrypt.genSalt(10);
        let pass = await bcrypt.hash(password, salt);
        console.log(pass)


        const createdUser = await userModel.create(body);
        return res.status(201).send({ status: true, message: "User created successfully", data: createdUser });
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
