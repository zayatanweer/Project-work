const jwt = require("jsonwebtoken")
const bookModel = require("../Models/bookModel")
const{objectIdValid }=require('../validators/validator')

const authentication = function (req, res, next) {
    try {
      let token = req.headers["x-api-key"];
      if (!token)
        return res
          .status(401)
          .send({ status: false, message: "token must be present" });
  
        const decodedToken=jwt.verify(token,"secret-key-Group32")

            req['decodedToken']=decodedToken.userId
            
            next()

    } catch (error) {
      if (error.message=="invalid token"){  
        return res.status(401).send({ status: false, message: "token is invalid" });
      }
   
        if(error.message=="jwt expired"){
        return res.status(400).send({status:false,message:"Login once again"})
      }

        if(error.message=="invalid signature"){
        return res.status(401).send({status:false,message:"invalid signature"})
      }

    return res.status(500).send({ status: false, Error: error.message });
    }
  };
   
module.exports= {authentication}