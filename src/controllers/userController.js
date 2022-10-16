const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { uploadFile } = require("../AWS/aws");

const {
    checkEmptyBody,
    isValid,
    pinCodeValidation,
    cityValidation,
    streetValidation,
    isValidEmail,
    isValidPhone,
    isValidObjectId,
    isValidName,
    isValidPassword } = require("../validation/validation");

const passEncryption = async (pass) => {
    const salt = await bcrypt.genSalt(10);
    let encryptedPassword = await bcrypt.hash(pass, salt);
    return encryptedPassword;
}


//------------------------User Create------------------->>>>>>>>>>>
const createUser = async (req, res) => {
    try {
        // taking data from body
        let body = req.body;
        if (!checkEmptyBody(body)) return res.status(400).send({ status: false, message: "please provide data in request body" });

        // checking that profile image is present
        let files = req.files;
        if (!files || files.length == 0) return res.status(400).send({ status: false, message: "please provide image for profileImage" })
        body.profileImage = await uploadFile(files[0]);

        // destructuring all the required fields
        let { fname, lname, email, phone, password, address } = body;

        // checking & validating all the required fields .. if correct then assigning it 
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is required" });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "fname is invalid" });

        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is required" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "lname is invalid" })

        //validating address
        if (!address) return res.status(400).send({ status: false, message: "address is required" })
        if (address) {
            // here we are parsing the address 
            let fullAddress = JSON.parse(address);

            // checking for a non empty object
            if (!checkEmptyBody(fullAddress)) return res.status(400).send({ status: false, message: "please enter a valid address" })

            if (typeof (fullAddress) !== "object") return res.status(400).send({ status: false, message: "address should be in object format" })

            // destructuring shipping and billing addresses
            let { shipping, billing } = fullAddress;

            // checking required fields present and it has all required keys
            if (!shipping) return res.status(400).send({ status: false, message: "please enter shipping address and it should be in object format." });
            if (!checkEmptyBody(shipping)) return res.status(400).send({ status: false, message: "shipping address should not be empty" });

            if (!billing) return res.status(400).send({ status: false, message: "Please enter Billing address and it should be in object format." });
            if (!checkEmptyBody(billing)) return res.status(400).send({ status: false, message: "billing address should not be empty" });

            // if shipping and billing address are available
            if (shipping) {
                let { street, city, pincode } = shipping;

                if (!isValid(street)) return res.status(400).send({ status: false, message: "enter shipping street" })
                if (!streetValidation(street)) return res.status(400).send({ status: false, message: "provide a valid Shipping Street Name" })

                if (!isValid(city)) return res.status(400).send({ status: false, message: "enter Shipping city" })
                if (!cityValidation(city)) return res.status(400).send({ status: false, message: "provide a valid Shipping City Name" })

                if (!isValid(pincode)) return res.status(400).send({ status: false, message: "enter Shipping Pincode" })
                if (!pinCodeValidation(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" })
            }

            if (billing) {
                let { street, city, pincode } = billing;

                if (!isValid(street)) return res.status(400).send({ status: false, message: "Please Enter Billing street Name" })
                if (!streetValidation(street)) return res.status(400).send({ status: false, message: "provide a valid Billing Street Name" })

                if (!isValid(city)) return res.status(400).send({ status: false, message: "Please enter Billing City Name" })
                if (!cityValidation(city.trim())) return res.status(400).send({ status: false, message: "provide a Billing City Name" })


                if (!isValid(pincode)) return res.status(400).send({ status: false, message: "Enter Billing Pincode" })
                if (!pinCodeValidation(pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode" })
            }
            // if all validations checked successfully assigning parsed address(object) to body
            body.address = fullAddress
        }

        // validating and assigning encrypted password
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: `provided password: (${password}). is not valid (required at least: 8-15 characters with at least one capital letter, one special character & one number)` })

        body.password = await passEncryption(password);         // assigning encrypted password to body

        // validating email & phone
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is required" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })

        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is invalid" })

        // checking that email and password must be unique
        let isPresentEmail = await userModel.findOne({ email: email })
        if (isPresentEmail) return res.status(409).send({ status: false, message: `Email: ${email} is already present in DB. please try again..` })

        let isPresentPhone = await userModel.findOne({ phone: phone })
        if (isPresentPhone) return res.status(409).send({ status: false, message: `phone: ${phone} is already present in DB. please try again..` });

        // creating new user
        const createdUser = await userModel.create(body);
        return res.status(201).send({ status: true, message: "User created successfully", data: createdUser });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

//-------------------------User Login------------------->>>>>>>>>>>
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
        if (!findUserData) return res.status(404).send({ status: false, message: `incorrect email: ${email}. please check the email and try again !!` });

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
        let token = jwt.sign(payLoad, " ~ functionUp--project-5--product-management-group-44 ~ ", { expiresIn: '2h' });

        // setting token in response header
        res.header('Authorization', token);

        return res.status(201).send({ status: true, message: 'User login successful', data: { userId: `${findUserData._id}`, token: token } });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

//----------------------Get User Profile---------------->>>>>>>>>>>
const getUserProfile = async (req, res) => {
    try {
        // taking userId from url
        let userIdFromParam = req.params.userId;

        // checking userId is a valid object id
        if (!isValidObjectId(userIdFromParam)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParam}, is invalid.` });

        // finding the user with the userId we got
        let getUserData = await userModel.findById(userIdFromParam);

        // if any data not present in DB
        if (!getUserData) return res.status(404).send({ status: false, message: `No user found with this userId: ${userIdFromParam}.` });

        // authorizing user
        if (userIdFromParam != req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });           // 403 - not authorized

        //sending happy response
        return res.status(200).send({ status: true, message: 'User profile details', data: getUserData });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

//----------------------User Profile update-------------------------->>>>>>>>
const updateUserProfile = async (req, res) => {
    try {
        // accessing userId fro url(path param)
        let userIdFromParam = req.params.userId;
        if (!isValidObjectId(userIdFromParam)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParam} is invalid, Please Provide Valid userId.` });

        // accessing data from body
        let data = req.body
        if (!checkEmptyBody(data)) return res.status(400).send({ status: false, message: "please provide Some field to update." });

        // finding user in DB
        let findUserData = await userModel.findById(userIdFromParam)
        if (!findUserData) return res.status(400).send({ status: false, message: `User with userId: ${userIdFromParam} is not exist in database.` });

        // authorizing user with token's userId
        if (userIdFromParam != req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });

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

            const uniqueEmail = await userModel.findOne({ email: email });
            if (uniqueEmail) return res.status(400).send({ status: false, message: `email: ${email} is already stored in Database , please provide unique email id.` });

            findUserData.email = email;
        }

        if (phone) {
            phone = phone.trim();

            if (!isValidPhone(phone.trim())) return res.status(400).send({ status: false, message: `phone: ${phone}, is not valid.` });

            let uniquePhone = await userModel.findOne({ phone: phone });
            if (uniquePhone) return res.status(400).send({ status: false, message: `phone: ${phone} is already stored in Database, please provide unique phone no.` });

            findUserData.phone = phone;
        }

        if (password) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: `Password: ${password}, is not valid` });
            const encryptedPass = await passEncryption(password);

            findUserData.password = encryptedPass;
        }

        if (address) {

            address = JSON.parse(address)

            if (typeof (address) !== "object") return res.status(400).send({ status: false, message: "please enter address in Object format to update." });

            if (!checkEmptyBody(address)) return res.status(400).send({ status: false, message: "please enter shipping and billing address !!" })

            // if (address.shipping == "") {
            //     return res.status(400).send({ status: false, message: "please enter shipping address to update" })
            // }
            // if (address.billing == "") {
            //     return res.status(400).send({ status: false, message: "please enter billing address to update" })
            // }

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

        // accessing image from request body
        const image = req.files;
        if (image.length > 0) {
            const img = await uploadFile(image[0]);
            data.profileImage = img;
        }

        // let update = await userModel.findByIdAndUpdate({ _id: userIdFromParam }, { $set: { fname: fname, lname: lname, email: email, phone: phone, password: pass, address: add, image: profileImage } }, { new: true })

        //updating user document
        findUserData.save();

        return res.status(200).send({ status: true, message: "User profile updated", data: findUserData });
    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


module.exports = { createUser, loginUser, getUserProfile, updateUserProfile };
