const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Order', orderSchema);

// status: { type: String, enum: ["pending", "completed", "canceled"], default: 'pending' },

// totalQuantity: { type: Number, required: true },

// cancellable: { type: Boolean, default: true },