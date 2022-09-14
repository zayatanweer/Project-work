const internModel = require("../model/internModels")
const collegeModel = require("../model/collegeModels")

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "string") 
    return true;
};

const isvalidRequest = function (requestBody) {
  return Object.keys(requestBody).length > 0
}
//---------------------------creating data for interns------------------//

const createIntern = async function (req, res) {
  try {
    const requestBody = req.body
      if (!isvalidRequest(requestBody)) return res.status(400).send({ status: false, message: "invalid request parameter ,please provied intern detail" })

    let { name, email, mobile, collegeName } = requestBody

      if (!name) return res.status(400).send({ status: false, message: "Name is required" })
     if (!isValid(name)) return res.status(400).send({ status: false, message: "Name is invalid" })

     
     if (!isValid(email)) return res.status(400).send({ status: false, message: "email is required" })
     if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) return res.status(400).send({ status: false, message: "email Id is invalid" })
     let Email = await internModel.findOne({ email })
     if (Email) return res.status(404).send({ status: false, message: "email is already used" })


     if (!isValid(mobile)) return res.status(400).send({ status: false, message: "mobile is required" })
     if(!(/^[6-9]{1}[0-9]{9}$/im.test(mobile)))  return res.status(400).send({ status: false, message: "Mobile No is invalid. +91 is not required" })
     let checkMobile = await internModel.findOne({ mobile })
     if (checkMobile) return res.status(404).send({ status: false, message: "Mobile Number is already used" })


      if (!collegeName) return res.status(400).send({ status: false, message: "collegeName is required" })
      if (!isValid(collegeName)) return res.status(400).send({ status: false, message: "collegeName is invalid" })


    let collegeDetails = await collegeModel.findOne({ name: requestBody.collegeName })
     return res.send(collegeDetails)
    requestBody.collegeId = collegeDetails._id
    let saveData = await internModel.create(requestBody)
    return res.status(201).send({ status: true, data: saveData })
  } catch (err) {
    console.log(err)
    return res.status(500).send({status: false,message: err.message })
  }
}

module.exports = {
  createIntern
}




     

