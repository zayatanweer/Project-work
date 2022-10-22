//=====================Importing mongoose package=====================//
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

//===================== Creating cart Schema =========================//
const cartSchema = new mongoose.Schema({
    userId: { type: ObjectId, refs: "User", required: true },

    items: [{
        productId: { type: ObjectId, refs: "Product", required: true },
        quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    deletedAt: { type: Date, default: null },
    isdeleted: { type: Boolean, default: false }

}, { timestamps: true });

//===================== Exporting cart model =========================//
module.exports = mongoose.model('Cart', cartSchema);
