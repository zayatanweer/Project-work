const jwt = require("jsonwebtoken")
const bookModel = require("../Models/bookModel")
const{objectIdValid }=require('../validators/validator')


let token 
let decodedToken
// const authentication  = async function(req,res,next){
//     try{
//          token = req.headers["x-api-key"]

//          if (!token)
//          return res.status(404).send({ status: false, msg: "missing a mandatory token" });
   
//         let decodedToken = jwt.verify(token, "secret-key-Group32") 

//          req['decodedToken']=decodedToken.userId
 
//          next()

//     }
//     catch(error){
//         res.status(500).send({message: error.message})
//     }
// }


const authentication = function (req, res, next) {
    try {
      let token = req.headers["x-api-key"];
      if (!token) token = req.headers["X-API-KEY"];
      if (!token)
        return res
          .status(401)
          .send({ status: false, message: "token must be present" });
  
          decodedToken =  jwt.verify(token,"secret-key-Group32",function (err, decodedToken) {
          if (err)  return res.status(401).send({ status: false, message: "token is invalid" });
          if (Date.now() > decodedToken.exp * 1000) { 
            return res.status(401).send({ status: false, message: "Token expired" }); //checking if the token is expired
          }
          req['decodedToken']=decodedToken.userId
  
          next();
        }
      );
    } catch (error) {
      res.status(500).send({ status: false, Error: error.message });
    }
  };
  
  

const authorisation = async function(req,res,next){
    try{
        let bookId = req.params.bookId

        if(!objectIdValid(bookId)) return res.status(400).send({status:false,message:"the BookId should be valid"})

            let data = await bookModel.findById(bookId)
            if(!data) return res.status(404).send({msg: "no book available with this BookId"})

            let loggedInUser = data.userId.toString()  //person who has token
            let privilagedUser = decodedToken.userId //person who is logedin (has token)

            if(loggedInUser != privilagedUser) return res.status(403).send({msg: "u r not authorised for this"})

            next()

    }
    catch(error){
        res.status(500).send({status: false, error: error.message})
    }
}

module.exports= {authentication,authorisation}