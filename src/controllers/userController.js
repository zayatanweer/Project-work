//===================== Importing module and packages =====================//
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const { uploadFile } = require("../AWS/aws");                   // aws

const { checkEmptyBody, isValid, isValidImageLink, pinCodeValidation, cityValidation, streetValidation, isValidEmail, isValidPhone, isValidObjectId, isValidName, isValidPassword } = require("../validation/validation");        // validations          

// >>>>>>>>>>  function to encrypt a password ============================//
const encryptPassword = async (pass) => {
    const salt = await bcrypt.genSalt(10);                          // generating salt
    const encryptedPassword = await bcrypt.hash(pass, salt);        // hashing given password to generate encrypted password 
    return encryptedPassword;
}


//------------------------------------------------------------>     User Api's      <------------------------------------------------------------------//

//================================== Register User ====================================<<< /register >>> //
const registerUser = async (req, res) => {
    try {

        let requestBody = req.body;         // taking data from body
        let files = req.files;              // accessing image file

        // destructuring all the required fields from requestBody
        let { fname, lname, email, phone, password, address } = requestBody;

        // checking if request body is empty
        if (!checkEmptyBody(requestBody)) return res.status(400).send({ status: false, message: "please provide data in request body" });


        // checking & validating all the required fields .. if correct then assigning it 
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is required" });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: `fname: ${fname} is invalid` });

        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is required" });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: `lname: ${lname} is invalid` });

        //validating address
        if (!address) return res.status(400).send({ status: false, message: "address is required" });
        if (address) {

            // here we are parsing the address 
            let fullAddress;
            try {
                fullAddress = JSON.parse(address)
            }
            catch (err) {
                console.log(`error: \n ${err}`);
                return res.status(400).send({ status: false, message: "please provide address in JSON object" })
            }
            // checking the type of address
            if (typeof (fullAddress) !== "object") return res.status(400).send({ status: false, message: "address should be in object format" });

            // checking for a non empty object
            if (!checkEmptyBody(fullAddress)) return res.status(400).send({ status: false, message: "please enter a valid address" })


            // destructuring shipping and billing addresses
            let { shipping, billing } = fullAddress;

            // checking required fields present and it has all required keys
            if (!shipping) return res.status(400).send({ status: false, message: "please enter shipping address and it should be in object format." });
            if (!checkEmptyBody(shipping)) return res.status(400).send({ status: false, message: "shipping address should not be empty" });

            // if (!billing) return res.status(400).send({ status: false, message: "Please enter Billing address and it should be in object format." });
            // if (!checkEmptyBody(billing)) return res.status(400).send({ status: false, message: "billing address should not be empty" });

            // if shipping and billing address are available
            if (shipping) {

                if (typeof shipping != "object") return res.status(400).send({ status: false, message: "Shipping Address is in wrong format required in object format" });

                let { street, city, pincode } = shipping;

                if (!isValid(street)) return res.status(400).send({ status: false, message: "enter shipping street" });
                if (!streetValidation(street)) return res.status(400).send({ status: false, message: "provide a valid Shipping Street Name" });

                if (!isValid(city)) return res.status(400).send({ status: false, message: "enter Shipping city" });
                if (!cityValidation(city)) return res.status(400).send({ status: false, message: "provide a valid Shipping City Name" });

                if (!isValid(pincode)) return res.status(400).send({ status: false, message: "enter Shipping Pincode" });
                if (!pinCodeValidation(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" });
            }

            if (!billing) {
                fullAddress.billing.street = fullAddress.shipping.street;
                fullAddress.billing.city = fullAddress.shipping.city;
                fullAddress.billing.pincode = fullAddress.shipping.pincode;
            } else {

                if (typeof billing != "object") return res.status(400).send({ status: false, message: "Billing Address is in wrong format required in object format" });

                let { street, city, pincode } = billing;

                if (!isValid(street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" });
                if (!streetValidation(street)) return res.status(400).send({ status: false, message: "provide a valid Billing Street Name" });

                if (!isValid(city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" });
                if (!cityValidation(city.trim())) return res.status(400).send({ status: false, message: "provide a Billing City Name" });


                if (!isValid(pincode)) return res.status(400).send({ status: false, message: "Enter Billing Pincode" });
                if (!pinCodeValidation(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" });
            }
            // if (billing) {

            //     if (typeof shipping != "object") return res.status(400).send({ status: false, message: "Billing Address is in wrong format required in object format" });

            //     let { street, city, pincode } = billing;

            //     if (!isValid(street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" })
            //     if (!streetValidation(street)) return res.status(400).send({ status: false, message: "provide a valid Billing Street Name" })

            //     if (!isValid(city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" })
            //     if (!cityValidation(city.trim())) return res.status(400).send({ status: false, message: "provide a Billing City Name" })


            //     if (!isValid(pincode)) return res.status(400).send({ status: false, message: "Enter Billing Pincode" })
            //     if (!pinCodeValidation(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" })
            // }
            // if all validations checked successfully assigning parsed address(object) to body
            requestBody.address = fullAddress;
        }

        // validating and assigning encrypted password
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: `provided password: (${password}). is not valid (required at least: 8-15 characters with at least one capital letter, one special character & one number)` });

        body.password = await encryptPassword(password);         // assigning encrypted password to body

        // validating email & phone
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is required" });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: `email: ${email} is invalid` });

        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" });
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: `phone: ${phone} is invalid` });

        // checking that email and password must be unique
        let isPresentEmail = await userModel.findOne({ email: email });
        if (isPresentEmail) return res.status(409).send({ status: false, message: `Email: ${email} is already present in DB. please try again..` });

        let isPresentPhone = await userModel.findOne({ phone: phone });
        if (isPresentPhone) return res.status(409).send({ status: false, message: `phone: ${phone} is already present in DB. please try again..` });

        // checking that profile image is present and validating.. then assigning to body
        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "please provide image for profileImage" });
        const image = await uploadFile(files[0]);
        if (!isValidImageLink(image)) return res.status(400).send({ status: false, msg: "profileImage is in incorrect format required format must be between: .jpg / .jpeg / .png / .bmp / .gif " });
        body.profileImage = image;

        // creating new user
        const createdUser = await userModel.create(body);
        return res.status(201).send({ status: true, message: "User created successfully", data: createdUser });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

//================================== User Login =======================================<<< /login >>>//
const loginUser = async (req, res) => {
    try {
        // taking body data
        const credentials = req.body;

        // checking if user does not enters any data
        if (!checkEmptyBody(credentials)) return res.status(400).send({ status: false, message: "please provide email & password" });

        // destructuring required fields
        let { email, password } = credentials;

        // checking for email
        if (!isValid(email)) return res.status(400).send({ status: false, message: "please enter email" });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "please enter valid email address" });

        // checking for password
        if (!isValid(password)) return res.status(400).send({ status: false, message: "please enter password" });
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: 'please enter valid password << at least 8-15 characters with at least one capital letter, one special character & one number >>' });

        // searching in DB
        let findUserData = await userModel.findOne({ email: email });
        if (!findUserData) return res.status(404).send({ status: false, message: `user not found, with email: ${email}. please check the email and try again !!` });

        // checking password with bcrypt's compare
        let ValidPassword = await bcrypt.compare(password, findUserData.password);
        if (!ValidPassword) return res.status(404).send({ status: false, message: `incorrect password: ${password}. please check the password and try again !! ` });

        // creating payload separately
        let payLoad = {
            userId: findUserData._id.toString(),
            userName: `${findUserData.fname} ${findUserData.lname}`,
            userEmail: findUserData['email']
        }

        // creating token & adding expiry time
        let token = jwt.sign(payLoad, " ~ functionUp--project-5--product-management-group-44 ~ ", { expiresIn: '6h' });

        // setting token in response header
        res.header('Authorization', token);

        return res.status(201).send({
            status: true,
            message: 'User login successful',
            data: { userId: `${findUserData._id}`, token: token }
        });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

//================================== Get User Profile =================================<<< /user/:userId/profile >>> //
const getUserProfile = async (req, res) => {
    try {
        // taking userId from url
        let userIdFromParam = req.params.userId;

        // checking userId is a valid object id
        if (!isValidObjectId(userIdFromParam)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParam}, is invalid.` });

        // authorizing user
        if (userIdFromParam !== req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access !!!" });           // 403 - not authorized

        // finding the user with the userId we got
        let getUserData = await userModel.findById(userIdFromParam);
        if (!getUserData) return res.status(404).send({ status: false, message: `No user found with this userId: ${userIdFromParam}.` });

        //sending happy response
        return res.status(200).send({ status: true, message: 'User profile details', data: getUserData });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

//================================== update User Profile ==============================<<< /user/:userId/profile >>> //
const updateUserProfile = async (req, res) => {
    try {

        const userIdFromParam = req.params.userId;          // accessing userId fro url(path param)
        const data = req.body;                              // accessing data from body
        const files = req.files;                            // accessing image from request

        // validating userId got from path params
        if (!isValidObjectId(userIdFromParam)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.` });

        // checking that request body is empty or not
        if (!checkEmptyBody(data)) return res.status(400).send({ status: false, message: "please provide Some field to update." });

        // authorizing user with token's userId
        if (userIdFromParam !== req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });

        // finding user in DB
        let findUserData = await userModel.findById(userIdFromParam)
        if (!findUserData) return res.status(400).send({ status: false, message: `User with userId: ${userIdFromParam} is not exist in database.` });



        //------------------------------------------update address---------------------------------------------------------

        // destructuring fields to update
        let { fname, lname, email, phone, password, address, profileImage } = data;

        if (fname) {
            fname = fname.trim();

            if (!isValidName(fname)) return res.status(400).send({ status: false, message: `fname: ${fname}, is Not valid` });

            findUserData.fname = fname;
        }

        if (lname) {
            lname = lname.trim();

            if (!isValidName(lname)) return res.status(400).send({ status: false, message: `lname: ${lname}, is Not valid` });
            findUserData.lname = lname;
        }

        if (email) {
            email = email.trim();

            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: `email: ${email}, is not valid` });

            const existEmail = await userModel.findOne({ email: email });
            if (existEmail) return res.status(400).send({ status: false, message: `email: ${email} is already stored in Database , please provide unique email id.` });

            findUserData.email = email;
        }

        if (phone) {
            phone = phone.trim();

            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: `phone: ${phone}, is not valid.` });

            let existPhone = await userModel.findOne({ phone: phone });
            if (existPhone) return res.status(400).send({ status: false, message: `phone: ${phone} is already stored in Database, please provide unique phone no.` });

            findUserData.phone = phone;
        }

        if (password) {

            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: `Password: ${password}, is not valid. (required at least: 8-15 characters with at least one capital letter, one special character & one number) ` });

            const encryptedPass = await encryptPassword(password);

            findUserData.password = encryptedPass;
        }

        if (address) {

            try {
                address = JSON.parse(address);
            }
            catch (err) {
                console.log(err)
                return res.status(400).send({ status: false, message: "please enter address in object format, check if its values are in valid format !!" });
            }

            if (typeof (address) !== "object") return res.status(400).send({ status: false, message: "please enter address in Object format to update." });

            if (!checkEmptyBody(address)) return res.status(400).send({ status: false, message: "please enter shipping and billing address !!" });


            let { shipping, billing } = address;

            if (shipping) {

                if (typeof (shipping) != "object") return res.status(400).send({ status: false, message: "please enter shipping address in object format to update" });

                if (!checkEmptyBody(shipping)) return res.status(400).send({ status: false, message: "enter street, city, pincode for shipping address." });

                let { street, city, pincode } = shipping;

                if (isValid(street)) {
                    street = street.trim();
                    if ((typeof (street) !== 'string') || (!streetValidation(street))) return res.status(400).send({ status: false, message: "enter valid Shipping Street name." });
                    findUserData.address.shipping.street = street;
                }

                if (isValid(city)) {
                    city = city.trim();
                    if ((typeof (city) !== 'string') || (!cityValidation(city))) return res.status(400).send({ status: false, message: "enter valid Shipping city name." });
                    findUserData.address.shipping.city = city;
                }

                if (isValid(pincode)) {
                    pincode = pincode.trim();
                    if ((typeof (pincode) !== 'string') || (!pinCodeValidation(pincode))) return res.status(400).send({ status: false, message: "enter valid Shipping address pincode." });
                    findUserData.address.shipping.pincode = pincode;
                }
            }


            if (billing) {

                if (typeof (billing) != "object") return res.status(400).send({ status: false, message: "please enter billing address in object format to update" });

                if (!checkEmptyBody(billing)) return res.status(400).send({ status: false, message: "enter street, city, pincode for billing address." });

                let { street, city, pincode } = billing;

                if (isValid(street)) {
                    street = street.trim();
                    if ((typeof (street) !== 'string') || (!streetValidation(street))) return res.status(400).send({ status: false, message: "enter valid Billing street name." });
                    findUserData.address.billing.street = street;
                }

                if (isValid(city)) {
                    city = city.trim();
                    if ((typeof (city) !== 'string') || (!cityValidation(city))) return res.status(400).send({ status: false, message: "enter valid Billing city name." });
                    findUserData.address.billing.city = city;
                }

                if (isValid(pincode)) {
                    pincode = pincode.trim();
                    if ((typeof (pincode) !== 'string') || (!pinCodeValidation(pincode))) return res.status(400).send({ status: false, message: "enter valid billing address pincode." });
                    findUserData.address.billing.pincode = pincode;
                }
            }
        }

        // checking profileImage
        if (profileImage) return res.status(400).send({ status: false, message: "ProfileImage format invalid!!" });

        if (files && files.length > 0) {
            const image = await uploadFile(image[0]);
            if (!isValidImageLink(image)) return res.status(400).send({ status: false, msg: "profileImage is in incorrect format required format must be between: .jpg / .jpeg / .png / .bmp / .gif " });
            findUserData.profileImage = image;
        }


        //updating user document
        findUserData.save();

        return res.status(200).send({ status: true, message: "User profile updated", data: findUserData });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


//===================== Exporting functions to use globally =====================//
module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
