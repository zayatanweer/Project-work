const collegeModel=require("../model/collegeModels")
const regitrationCollege= async function(req,res){
 try{
    let data=req.body
  let savedata= await collegeModel.create(data)
  return res.status(201).send({ status: true,msg:"college registration successfully done" ,data: savedata })
 }
 catch(error){
    return res.status(500).send({ msg: error.message })
 }


}
module.exports.regitrationCollege=regitrationCollege