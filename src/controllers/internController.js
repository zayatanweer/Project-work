
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
const validMob = function(mobile){
  if (mobile == 0000000000){
    return true;
  }
}

const createIntern = async function (req, res) {
  try{

  let data =req.body;
  let {name,email,mobile,collegeName,isDeleted} = data
  let college= data.collegeName
  let intern = await collegeModel.findOne({name:college})

  if (Object.keys(data).length === 0){
    return res.status(400).send({ status : false, message: "Please give some data"})
  }
  if(!isValid(name)){
    return res.status(400).send({ status : false, message: "name is missing or you left empty"})
  }
  if (!/^[a-z ,.'-]+$/i.test(name)) {
    return res.status(400).send({status: false, message: "name should be in alphabate",});
  }  
  if(!isValid(email)){
    return res.status(400).send({ status : false, message: "email is missing or you left empty"})
  }
  if (!validator.validate(email)) {
    return res.status(400).send({ status: false, message: "Please provide a valid email" });
  }
  const dbemail = await internModel.findOne({ email: email });
  if (dbemail) {
    return res.status(400).send({ status: false, message: "email is already used" });
  }
  if(!isValid(mobile)){
    return res.status(400).send({ status : false, message: "mobile is missing or you left empty"})
  }
  const dbmobile = await internModel.findOne({ mobile: mobile });
  if (dbmobile) {
    return res.status(400).send({ status: false, message: "mobile no is already used" });
  }
  if (mobile.length < 10 || mobile.length >10) {
    return res.status(400).send({ status: false, msg: "Mobile no should be 10 digits" })
  }
  if (!/^[0-9]+$/.test(mobile)){
    return res.status(400).send({ status: false, msg: "Mobile no accepted only digits" });
  }
  if (validMob(mobile)){
    return res.status(400).send({ status: false, msg: "please provide valid Mobile no" });
  }
  if(!isValid(collegeName)){
    return res.status(400).send({ status : false, message: "collegeName is missing or you left empty"})
  }
     
  let collegeNew= intern._id
  let docum ={
    name:name ,
    email: email,
    mobile: mobile,
    collegeId: collegeNew,
    isDeleted : isDeleted ?isDeleted : false
  }
  let saveData = await internModel.create(docum)
  return res.status(201).send({ status: true, msg : "successfully create intern data", data: saveData })
} catch(err){
  return res.status(500).send({ msg: "Error", err: err.message });
}
}    


//---------------------------get details of interns---------------------//

const collegeDetails = async function (req, res) {
  
  try{
  let {collegeName} = req.query
  if (!collegeName){
    return res.status(400).send({ status : false, msg : "collegeName is missing or you left empty" })
  }
  let collegeData= await collegeModel.findOne({name:collegeName})
  if (!collegeData){
    return res.status(400).send({ status : false, msg : "collegeData you have provided is incorrect" })
  }
  let details = await internModel.find({ collegeId: collegeData._id }).select({ _id: 1, name: 1, email: 1, mobile: 1 })

  collegeData = {
        name: collegeData.name,
        fullName: collegeData.fullName,
        logoLink: collegeData.logoLink,  
        interns: details
  }
  return res.status(200).send({ status: true, msg : "successfully fetch intern details" , data: collegeData})
} catch(err){
  return res.status(500).send({ msg: "Error", err: err.message });
}
} 

module.exports = { createIntern, collegeDetails }

