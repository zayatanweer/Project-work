const express= require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//-----------------------post api (user creation)------------------------------->>>
router.post("/register", userController.createUser);

//-----------------------post api (user Login)------------------------------->>>
router.post("/register", userController.loginUser);

//---------------------Get User Profile-------------------->>>>>>>>>>>>>>>
router.get("/user/:userId/profile", userController.getUserProfile);

//-----------------------user Profile update----------------------------->>>>>>>>>>>

router.put("/user/:userId/profile", userController.updateUserProfile);


module.exports= router;