const userModel=require('../Models/userModel')
const {isValid,isVAlidRequestBody,nameRegex,phoneRegex,emailRegex,isValidPassword,}=require('../validators/validator')
const createUser = async function (req, res) {
 try {

        const requestBody = req.body
       

        if (!isVAlidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please give the Input to Create the User" })
        }

        // extract
        const { title, name, phone, email, password,address} = requestBody

        //validations

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is Required' })
        }

        let titles = ["Mr", "Mrs", "Miss"]

        if(!title.includes(titles)) {
            return res.status(400).send({ status: false, message:`titles should contain only ${titles}`})
        } 
 
     if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'First Name is Required' })
        }

        if (!nameRegex.test(name)) {
            return res.status(400).send({ status: false, message: "Invalid format of Name" })
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'Phone Number is Required' })
        }

        const isPhoneAlreadyUsed = await userModel.findOne({phone:phone})
        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Phone Number Already Registered" })
        }

        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ status: false, message: "Invalid format of Phone Number" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email is Required' })
        }

        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "Invalid format of Email" })
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Email Already Registered" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is Required' })
        }
        if(!isValidPassword(password)) { 
            return res.status(400).send({status: false, message: 'Password Should be Valid' })
    }

        const newUser = await userModel.create(requestBody)
        return res.status(201).send({ status: true, message: 'File Created Succesfully', data: newUser })

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};

module.exports.createUser = createUser;