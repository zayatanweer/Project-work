
const internModel = require("../model/internModels")
const collegeModel = require("../model/collegeModels")
const mongoose = require('mongoose');
const validator = require("email-validator");

//---------------------------creating data for interns---------------------//


const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const createIntern = async function (req, res) {
  try{

  let data =req.body;
  let {name,email,mobile,collegeName} = data
  let college= data.collegeName
  let intern= await collegeModel.findOne({name:college})

  if (Object.keys(data).length === 0){
    return res.status(400).send({ status : false, message: "Please give some data"})
  }
  if(!isValid(data.name)){
    return res.status(400).send({ status : false, message: "name is missing or you left empty"})
  }
  if (!/^[a-z ,.'-]+$/i.test(data.name)) {
    return res.status(400).send({status: false, message: "name should be in alphabate",});
  }  
  if(!isValid(data.email)){
    return res.status(400).send({ status : false, message: "email is missing or you left empty"})
  }
  if (!validator.validate(data.email)) {
    return res.status(400).send({ status: false, message: "Please provide a valid email" });
  }
  const dbemail = await internModel.findOne({ email: data.email });
  if (dbemail) {
    return res.status(400).send({ status: false, message: "email is already used" });
  }
  if(!isValid(data.mobile)){
    return res.status(400).send({ status : false, message: "mobile is missing or you left empty"})
  }
  const dbmobile = await internModel.findOne({ mobile: data.mobile });
  if (dbmobile) {
    return res.status(400).send({ status: false, message: "mobile no is already used" });
  }
  if (data.mobile.length < 10 || data.mobile.length >10) {
    return res.status(400).send({ status: false, msg: "Mobile no should be 10 digits" })
  }
  if(!isValid(data.collegeName)){
    return res.status(400).send({ status : false, message: "collegeName is missing or you left empty"})
  }
     
  res.send(intern)  
  data.collegeId= intern._id
  let saveData = await internModel.create(data)
  return res.status(201).send({ status: true, data: saveData })
} catch(err){
  return res.status(500).send({ msg: "Error", err: err.message });
}
}    

const collegeDetails = async function (req , res) {
  
  try{
  let {collegeName} = req.query
  let collegeData= await collegeModel.findOne({name:collegeName})
  let details = await internModel.find({ collegeId: collegeData._id }).select({ _id: 1, name: 1, email: 1, mobile: 1 })
  collegeData = {
        name: collegeData.name,
        fullName: collegeData.fullName,
        logoLink: collegeData.logoLink,  
        interns: details
  }
  res.status(200).send({ status: true, data: collegeData})
} catch(err){
  return res.status(500).send({ msg: "Error", err: err.message });
}
} 

module.exports = { createIntern, collegeDetails }

