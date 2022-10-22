const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')

const { checkEmptyBody, isValid, isValidObjectId } = require("../validation/validation");


const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId;         // accessing userId from params 
        userId = userId.trim();
        let bodyData = req.body;                // accessing details from request body

        // validating userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid.` });

        // fetching userData from DB
        const isPresentUser = await userModel.findById(userId);
        if (!isPresentUser) return res.status(404).send({ status: false, message: `user is not exist, by the given userId: ${userId}` });

        // Authorizing user
        if (userId !== req.userId) return res.status(403).send({ status: false, msg: 'unauthorized User access !!' });


        if (!checkEmptyBody(bodyData)) return res.status(400).send({ status: false, message: "request body cant be empty" });

        let { cartId, cancellable, status } = bodyData;

        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "cartId must be present" });
        if (typeof cartId != "string") return res.status(400).send({ status: false, message: " Enter cartId in valid (String) format!!! " });
        cartId = cartId.trim();
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `Invalid cartId: ${cartId} provided.` });

        // finding the user's cart
        let cartData = await cartModel.findOne({ userId: userId }).select({ _id: 0, userId: 1, items: 1, totalPrice: 1, totalItems: 1 }).lean();    // lean create fetched doc to js object
        if (!cartData) return res.status(404).send({ status: false, message: "cart not found" })

        if (cartData.totalItems == 0 || cartData.totalPrice == 0) return res.status(400).send({ status: false, message: `there is no product available in your cart.` });


        let items = cartData.items;

        let totalQuantity = 0;

        for (let i = 0; i < items.length; i++) {
            let product = items[i];
            totalQuantity += product.quantity;
        };

        let finalDataObj = {
            ...cartData,
            totalQuantity: totalQuantity
        };

        if (status) {
            status = status.trim().toLowerCase();
            if (typeof status != "string") return res.status(400).send({ status: false, message: "Status is in Invalid format." });
            if (status !== "pending") return res.status(400).send({ status: false, message: "status field should be pending while creating an order" });
            finalDataObj.status = status;
        };

        if (isValid(cancellable)) {
            if (typeof cancellable != "boolean") return res.status(400).send({ status: false, message: "cancellable should be in Boolean type" });
            finalDataObj.cancellable = cancellable;
        };

        const orderCreated = await orderModel.create(finalDataObj);

        let deleteCartObject = { items: [], totalPrice: 0, totalItems: 0 }
        let deletedCart = await cartModel.findOneAndUpdate({ userId: userId }, deleteCartObject, { new: true });

        return res.status(201).send({ status: true, message: "Success", data: orderCreated });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}

const updateOrder = async function (req, res) {
    try {


        let userId = req.params.userId.trim();              // taking userId from path param
        let body = req.body;                                // accessing details from request body

        // validating userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `userId: ${userId} is invalid.` });

        // fetching userData from DB
        const isPresent = await userModel.findById(userId);
        if (!isPresent) return res.status(404).send({ status: false, message: `user with this userId: ${userId} id not exist` });

        // Authorizing user
        if (userId !== req.userId) return res.status(403).send({ status: false, msg: 'unauthorized User access !!' });


        if (!checkEmptyBody(body)) return res.status(400).send({ status: false, message: "empty body ..." });



        let { orderId, status } = body;

        if (!isValid(orderId)) return res.status(400).send({ status: false, message: `orderId required` });
        orderId = orderId.trim();
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: `orderId: ${orderId} is invalid.` });


        let findOrder = await orderModel.findOne({ _id: orderId, isDeleted: false });
        if (!findOrder) return res.status(404).send({ status: false, message: "order not found for this user !!" });

        if (findOrder.userId != userId) return res.status(403).send({ status: false, message: "ACCESS DENIED !!! order does not belong to user" });


        if (!isValid(status)) return res.status(400).send({ status: false, message: "status required to update." });

        if (['completed', 'canceled'].indexOf(status) == -1) return res.status(400).send({ status: false, message: "status is invalid, please provide status between >> completed, canceled" });

        if (findOrder.status == 'canceled' || findOrder.status == 'completed') return res.status(400).send({ status: false, message: "this order is already closed, can't update further" });

        // if (findOrder.cancellable != true) return res.status(400).send({ status: false, message: "this is not cancellable item" });

        if (status == 'cancelled') {
            if (findOrder.cancellable == false) return res.status(400).send({ status: false, message: "this order is already cancelled !!!" });
        }

        findOrder.status = status;

        // findOrder.save();

        const orderUpdated = await orderModel.findByIdAndUpdate(
            orderId,
            { $set: { status: body.status, cancellable: body.cancellable } },
            { new: true }
        );

        return res.status(200).send({ status: true, message: "Success", data: orderUpdated })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


module.exports = { createOrder, updateOrder }


