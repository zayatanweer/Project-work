
const mongoose = require('mongoose');
const collegeModel = require("../model/collegeModels");


//--------------------------create college details------------------//


const isValid = function (value){
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};
const createCollege = async function(req, res){
    try{
        let data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Please give some data" });
        }
        if (!isValid(data.name)){
            return res.status(400).send({ status: false, message: "name is missing or you left empty" });
        }
        if (!/^[a-z ,.'-]+$/i.test(data.name)){
            return res.status(400).send({ status: false, message: "name should be in alphabate" });
        }
        const dbName = await collegeModel.findOne({ name: data.name });
        if (dbName) {
        return res.status(400).send({ status: false, message: "name is already used" });
        }
        if (!isValid(data.fullName)){
            return res.status(400).send({ status: false, message: "fullName is missing or you left empty" });
        }
        if (!isValid(data.logoLink)){
            return res.status(400).send({ status: false, message: "logoLink is missing or you left empty" });
        }
        let savedData = await collegeModel.create(data);
        return res.status(201).send({ status: true, msg: "college created successfully", data: savedData })
    }
    catch(err){ 
        return res.status(500).send({ msg: "Error", err: err.message });
    }
}

module.exports = { createCollege }