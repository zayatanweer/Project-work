const express= require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {createProducts, getProductProfile, getProductsWithFilter, updateProduct, deleteProductDetails} = require("../controllers/productController");
const mw = require("../middleware/auth")


//-----------------------user Api's-1---------------------------->>>>>>>>>>>

//-----------------------user creation---------------------->>>>>>>>>
router.post("/register", userController.createUser);

//-----------------------post api (user Login)------------------------>>>>>>>>>>
router.post("/login", userController.loginUser);

//---------------------Get User Profile-------------------->>>>>>>>>>>>>
router.get("/user/:userId/profile",mw.Authentication, userController.getUserProfile);

//-----------------------user Profile update----------------------------->>>>>>>>>>>
router.put("/user/:userId/profile",mw.Authentication, mw.Authorization, userController.updateUserProfile);



//-----------------------product Api's-2---------------------------->>>>>>>>>>>

//-----------------------create product details---------------------->>>>>>>>>
router.post("/products", createProducts);

//-----------------------get product details---------------------->>>>>>>>>
router.get("/products/:productId", getProductProfile);

//-----------------------get product details from query---------------------->>>>>>>>>
router.get("/products", getProductsWithFilter);

//-----------------------update product details---------------------->>>>>>>>>
router.put("/products/:productId", updateProduct);

//-----------------------delete product details---------------------->>>>>>>>>
router.delete("/products/:productId", deleteProductDetails);




router.all('/*',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"});
})
module.exports= router;