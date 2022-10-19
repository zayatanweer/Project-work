const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')

const {
    checkEmptyBody,
    isValid,
    pincodeValidation,
    cityValidation,
    streetValidation,
    isValidEmail,
    isValidPhone,
    isValidObjectId,
    isValidName,
    isValidPassword } = require("../validation/validation");


const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId;
        let bodyData = req.body;

        // validating userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid.` });

        // fetching userData from DB
        const isPresentUser = await userModel.findById(userId);
        if (!isPresentUser) return res.status(404).send({ status: false, message: "user is not exist." });

        // Authorizing user
        if (userId !== req.userId) return res.status(403).send({ status: false, msg: 'unauthorized User access !!' });

        if (!checkEmptyBody(bodyData)) return res.status(400).send({ status: false, message: "request Body cant be empty" });

        let { cartId, cancellable, status } = bodyData;

        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "cartId must be present" });
        if (typeof cartId != "string") return res.status(400).send({ status: false, message: " Enter cartId in valid (String) format!!! " });
        cartId = cartId.trim();
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `Invalid cartId: ${cartId} provided.` });
        // finding the user's cart
        let cartData = await cartModel.findOne({ userId: userId }).select({ _id: 0, userId: 1, items: 1, totalPrice: 1, totalItems: 1, createdAt: 0, updatedAt: 0 }).lean();


        let items = cartData.items

        let totalQuantity = 0

        for (let i = 0; i < items.length; i++) {
            let product = items[i]
            totalQuantity = totalQuantity + product.quantity
        }

        let finalDataObj = {
            ...cartData,
            totalQuantity: totalQuantity
        }

        if (status) {
            status = status.trim().toLowerCase();
            if (typeof status != "string") return res.status(400).send({ status: false, message: "Status is in Invalid format." });
            if (status !== "pending") return res.status(400).send({ status: false, message: "Status field should be pending while creating an order" })
            finalDataObj.status = status;
        }

        if (isValid(cancellable)) {
            if (typeof cancellable != "boolean") return res.status(400).send({ status: false, message: "Cancellable should be of Boolean type" })
            finalDataObj.cancellable = cancellable;
        }

        const orderCreated = await orderModel.create(finalDataObj);

        let deleteCartObject = { items: [], totalPrice: 0, totalItems: 0 }
        let deletedCart = await cartModel.findOneAndUpdate(
            { userId: userId },
            deleteCartObject,
            { new: true }
        );

        return res.status(201).send({ status: true, message: "Success", data: orderCreated })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

        const isPresent = await userModel.findById(userId)

        if (!isPresent) return res.status(404).send({ status: false, message: "userId id not exist" })

        let body = req.body

        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, message: "empty body ..." })
        }

        // if(!(body.status == pending || body.status == completed || body.status == cancled ) )
        // return res.status(400).send({ status: false, message: "status invalid" })

        if ([pending, completed, canceled].indexOf(body.status) == -1)
            return res.status(400).send({ status: false, message: "status invalid" })

        let orderId = body.oredrId

        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "order id is invalid" })

        let order = await orderModel.findById(orderId)//.lean()

        if (order.userId != userId) return res.status(403).send({ status: false, message: "order does not belong to user" })

        if (order.cancellable != true) return res.status(403).send({ status: false, message: "this is not cancellable item" })

        const orderUpdated = await orderModel.findByIdAndUpdate(oredrId, { $set: { status: body.status, cancellable: body.cancellable } }, { new: true })

        return res.status(200).send({ status: true, message: "Succeess", data: orderUpdated })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


module.exports = { createOrder, updateOrder }