// const mongoose = require('mongoose');
// const ObjectId = mongoose.Schema.Types.ObjectId

// const reviewSchema = new mongoose.Schema({
//     bookId: {
//         required: true,
//         type: ObjectId,
//         refs: 'book'
//     },
//     reviewedBy: {
//         type: String,
//         required: true,
//         trim: true,
//         default: 'Guest',
//         value: reviewer's name
//     },
//     reviewedAt: {
//         type: Date,
//         required: true,
//     },
//     rating: {
//         type: Number,
//         required: true,
//         min: [1, "Minimum length charecter is 1"],
//         max: [5, "Maximum length charecter is 5"],
//     },
//     review: {
//         type: String,
//         trim: true,
//         optional
//     },
//     isDeleted: {
//         type: Boolean,
//         default: false
//     },
// })

// module.exports = mongoose.model('review', reviewSchema)