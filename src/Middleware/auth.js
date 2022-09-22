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
  
        jwt.verify(token,"secret-key-Group32",function (err,decode) {
            if (err){  
              return res.status(401).send({ status: false, message: "token is invalid" });
            }
            if(Date.now()>decode.exp*1000) {
              return res.status(400).send({status:false,message:"Token expired"})
            }

            req['decodedToken']=decode.userId
            
            next()
          }
      );
    } catch (error) {
      res.status(500).send({ status: false, Error: error.message });
    }
  };
   
module.exports= {authentication}