const express= require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const mw = require("../middleware/auth")


//-----------------------post api (user creation)------------------------------->>>
router.post("/register", userController.createUser);

//-----------------------post api (user Login)------------------------------->>>
router.post("/login", userController.loginUser);

//---------------------Get User Profile-------------------->>>>>>>>>>>>>>>
router.get("/user/:userId/profile",mw.Authentication, userController.getUserProfile);

//-----------------------user Profile update----------------------------->>>>>>>>>>>

router.put("/user/:userId/profile",mw.Authentication, mw.Authorization, userController.updateUserProfile);


router.all('/*',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"});
})
module.exports= router;