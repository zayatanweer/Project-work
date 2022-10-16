const express = require("express");
const router = express.Router();

const { authUser } = require("../middleware/auth")
const { createUser, loginUser, getUserProfile, updateUserProfile } = require("../controllers/userController");
const { createProducts, getProductProfile, getProductsWithFilter, updateProduct, deleteProductDetails } = require("../controllers/productController");



//------------------------------------------------------------>     - FEATURE - I --- User Api's      <------------------------------------------------------------//

router.post("/register", createUser);                                                           // >>>>>>>>> user creation (post-api)
router.post("/login", loginUser);                                                               // >>>>>>>>> user login (post-api)
router.get("/user/:userId/profile", authUser, getUserProfile);                                      // >>>>>>>>> get user profile (get-api)     >> protected route
router.put("/user/:userId/profile", authUser, updateUserProfile);                                   // >>>>>>>>> update user profile (put-api)  >> protected route


//---------------------------------------------------------->     - FEATURE - II --- Product Api's      <----------------------------------------------------------//

router.post("/products", createProducts);                       // >>>>>>>>> product creation (post-api)
router.get("/products/:productId", getProductProfile);          // >>>>>>>>> get product by product id (get-api)
router.get("/products", getProductsWithFilter);                 // >>>>>>>>> get filtered products by query (get-api)
router.put("/products/:productId", updateProduct);              // >>>>>>>>> update product (put-api)
router.delete("/products/:productId", deleteProductDetails);    // >>>>>>>>> delete product (delete-api)    




router.all('/*', async (req, res) => { return res.status(404).send({ status: false, message: "Page Not Found" }); });

module.exports = router;