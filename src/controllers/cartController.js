//===================== Importing module and packages =====================//
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');


const { checkEmptyBody, isValid, isValidObjectId } = require('../validation/validation');       // destructuring validations functions



//-------------------------------------------------------------->     Cart Api's      <-------------------------------------------------------------------//

//============================================ create Cart (add items to cart) ===============================================<<< /users/:userId/cart >>> //
const addToCart = async (req, res) => {
    try {
        let { cartId, productId } = req.body            // taking data from body
        let userId = req.params.userId                  // accessing userId from path params
        userId = userId.trim();

        // validating required fields
        if (!checkEmptyBody(req.body)) return res.status(400).send({ status: false, message: "no data provided" });

        // for user
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid, please provide a valid userId` });

        let checkUser = await userModel.findById(userId);
        if (!checkUser) return res.status(404).send({ status: false, message: "user not found" });

        // Authorization
        if (userId !== req.userId) return res.status(403).send({ status: false, msg: 'unauthorized user access detected !!' });



        if (cartId) {

            if (typeof cartId != "string") return res.status(400).send({ status: false, message: " cartId should be in string format !!!" });

            cartId = cartId.trim();

            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `cartId: ${cartId} is invalid, please enter valid cartId` });

            let cartDetails = await cartModel.findById(cartId);
            if (!cartDetails) return res.status(404).send({ status: false, message: "cart not found" });

            if (cartDetails) {
                if (userId != cartDetails.userId) return res.status(400).send({ status: false, message: "cart does not belong to this user" });
            }
        }


        // checking productId present & it's validations
        if (!isValid(productId)) return res.status(400).send({ status: false, message: " Enter a productId !!! " });

        if (typeof productId != "string") return res.status(400).send({ status: false, message: " productId should be in string format !!!" });
        productId = productId.trim();

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `productId: ${productId} is invalid, please provide a valid productId` });

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!checkProduct) return res.status(404).send({ status: false, message: "product not found" });

        let productPrice = checkProduct.price;
        let newProductObj = { productId: productId, quantity: 1 };


        // if (checkCart) {

        //     let checkProductId = checkCart.items.map(x => x.productId.toString())

        //     if (checkProductId.includes(productId)) {
        //         let itemsArray = checkCart.items
        //         for (let i = 0; i < itemsArray.length; i++) {
        //             if (checkCart.items[i].productId.toString() == productId) {
        //                 itemsArray[i].quantity = itemsArray[i].quantity + 1
        //             }
        //         }
        //         let increaseQuantity = await cartModel.findOneAndUpdate({ userId: userId }, { items: array, totalPrice: checkCart.totalPrice + productPrice }, { new: true })
        //         return res.status(200).send({ status: true, message: "items added successfully", data: increaseQuantity })

        //     } else {
        //         let addProduct = await cartModel.findOneAndUpdate({ userId: userId }, { $push: { items: productObj }, $inc: { totalItems: 1, totalPrice: productPrice } }, { new: true })
        //         return res.status(200).send({ status: true, message: "items added successfully", data: addProduct })
        //     }

        // }

        // create cart

        let checkCart = await cartModel.findOne({ userId: userId });
        // console.log(checkCart);

        if (checkCart) {

            for (let i in checkCart.items) {
                if (checkCart.items[i].productId.toString() == productId) {

                    //updating quantity of an existing product
                    checkCart.items[i].quantity += 1;
                    checkCart.totalPrice += productPrice;

                    checkCart.save();
                    return res.status(201).send({ status: true, message: "Success", data: checkCart });
                }
            }

            //adding a new product in existing cart
            let userCart = await cartModel.findOneAndUpdate(
                { userId: userId },
                { $push: { items: newProductObj }, $inc: { totalPrice: productPrice, totalItems: 1 } },
                { new: true }
            );
            return res.status(201).send({ status: true, message: "Success", data: userCart });
        }
        else {
            let createNewCartObject = {
                userId: userId,
                items: [newProductObj],
                totalItems: 1,
                totalPrice: productPrice
            }

            const newUserCartData = await cartModel.create(createNewCartObject);
            return res.status(201).send({ status: true, message: 'Success', data: newUserCartData });
        }
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//============================ Update Cart (remove product or decrease item's quantity from cart ) ===========================<<< /users/:userId/cart >>> //
const updateCart = async (req, res) => {
    try {

        const userIdFromParams = req.params.userId;             // taking :userId from params
        const bodyData = req.body;                              // accessing data found from body

        // checking non empty body
        if (!checkEmptyBody(bodyData)) return res.status(400).send({ status: false, message: "please provide data in request body to update." });

        // checking userId is a correct id
        if (!isValidObjectId(userIdFromParams)) return res.status(400).send({ status: false, message: `userId: ${userIdFromParams}, is not a valid object id.` });

        // searching for user document in DB
        const userData = await userModel.findById(userIdFromParams);
        if (!userData) return res.status(400).send({ status: false, msg: `user with id (${userIdFromParams}), does not exist.` });

        // authorizing user with token's userId
        if (userIdFromParams !== req.userId) return res.status(403).send({ status: false, message: "Unauthorized user access." });


        // destructuring fields from body
        const { cartId, productId, removeProduct } = bodyData;

        // checking and validating cartId
        if (!isValid(cartId)) return res.status(400).send({ status: false, msg: "cartId is required." });

        bodyData.cartId = cartId.trim();

        if (typeof cartId !== "string") return res.status(400).send({ status: false, message: "cartId should be in string format!!! " });
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, msg: `cartId: ${cartId}, is invalid.` });


        // checking and validating productId
        if (!isValid(productId)) return res.status(400).send({ status: false, msg: "productId is required.." });

        bodyData.productId = productId.trim();

        if (typeof productId !== "string") return res.status(400).send({ status: false, message: "cartId should be in string format!!! " });
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: `productId: ${productId}, is invalid.` });


        // searching data in cart collection
        const searchCart = await cartModel.findById(cartId);
        if (!searchCart) return res.status(404).send({ status: false, msg: `cart does not exist.` });

        if (userIdFromParams != searchCart.userId) return res.status(403).send({ status: false, message: "Access denied !! detected: trying to access someone else's cart" });

        // searching data in product collection
        const searchProduct = await productModel.findById(productId);
        if (!searchProduct) return res.status(404).send({ status: false, msg: `product does not exist.` });

        if (searchProduct['isDeleted'] == true) return res.status(400).send({ status: false, msg: `product has already been deleted.` });

        if (!(removeProduct == 0 || removeProduct == 1)) return res.status(400).send({ status: false, msg: `invalid removeProduct: ${removeProduct}, it must be either 0 or 1.` });


        let productPrice = searchProduct.price;
        let items = searchCart.items;

        if (items.length == 0) return res.status(404).send({ status: false, message: "cart is empty!!!!!" })
        let i = 0, flag = 0;
        for (i; i < items.length; i++) {
            if (items[i].productId.toString() == productId) {
                flag = 1;                          //set flag when given  productId is found in cart
                if (removeProduct == 1) {
                    items[i].quantity--;
                    searchCart.totalPrice -= productPrice;

                } else if (removeProduct == 0) {
                    let price = items[i].quantity * productPrice;
                    searchCart.totalPrice -= price;
                    items[i].quantity = 0;
                }
                if (items[i].quantity == 0) {
                    items.splice(i, 1);
                }
            }
        }
        if (flag == 0) return res.status(404).send({ status: false, message: "productId not found in cart" });    //set flag when given  productId is not found in cart


        searchCart.totalItems = items.length;
        searchCart.save();
        return res.status(200).send({ status: true, message: "Success", data: searchCart });
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error", error: error.message });
    }
}

//============================================== get Cart ====================================================================<<< /users/:userId/cart >>> //
const getCart = async (req, res) => {
    try {
        let userId = req.params.userId          // accessing userId from path params
        userId = userId.trim();

        // validation for userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });

        // finding user in DB
        let checkUserId = await userModel.findById(userId);
        if (!checkUserId) return res.status(404).send({ status: false, message: `User details are not found with this userId ${userId}` });

        //authorization
        if (req.userId != userId) return res.status(403).send({ status: false, message: "unauthorized user access detected !!!" });

        // fetching cart data
        let getCartData = await cartModel.findOne({ userId: userId });
        // if (getCartData.items.length == 0) return res.status(400).send({ status: false, message: "Items Is empty " });

        if (!getCartData) return res.status(404).send({ status: false, message: `Cart does not Exist with this userId :${userId}` });

        res.status(200).send({ status: true, message: 'Success', data: getCartData });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//============================================== delete cart =================================================================<<< /users/:userId/cart >>> //
const deleteCart = async (req, res) => {
    try {

        userId = req.params.userId              // accessing userId from path params
        userId = userId.trim();

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });

        //  To check user is present or not
        const userSearch = await userModel.findById(userId);
        if (!userSearch) return res.status(404).send({ status: false, message: `User details are not found with this userId ${userId}` });

        // AUTHORIZATION
        if (req.userId != userId) return res.status(403).send({ status: false, message: "You are not an authorized Person" });

        // To check cart is present or not
        const cartSearch = await cartModel.findOne({ userId })
        if (!cartSearch) return res.status(404).send({ status: false, message: "Cart details are not found " });

        if (cartSearch.totalPrice == 0 && cartSearch.totalItems == 0 && cartSearch.items.length == 0) return res.status(404).send({ status: false, message: "cart already empty!!" });

        const cartDelete = await cartModel.findOneAndUpdate(
            { userId },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } },
            { new: true }
        );
        return res.status(204).send({ status: true, message: "deleted", data: cartDelete });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



//===================== Exporting functions to use globally =====================//
module.exports = { addToCart, updateCart, getCart, deleteCart }