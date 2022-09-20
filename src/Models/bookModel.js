// const mongoose = require('mongoose');
// const ObjectId = mongoose.Schema.Types.ObjectId

// const bookSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     excerpt: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     userId: {
//         type: ObjectId,
//         unique: true,
//         ref: 'user'
//     },
//     ISBN: {
//         type: String,
//         required: true,
//         trim: true,
//         unique: true
//     },
//     category: {
//         type: String,
//         trim: true,
//         required: true,
//     },
//     subcategory: [{ type: String, required: true }],
//     reviews: {
//         type: Number,
//         default: 0,
//         trim: true,
//         comment: Holds number of reviews of this book
//     },
//     deletedAt: {
//         type: Date,
//         when the document is deleted
//     },
//     isDeleted: {
//         type: Boolean,
//         default: false
//     },
//     releasedAt: {
//         type: Date,
//         required: true,
//         format("YYYY-MM-DD")
//     },
// }, { timestamps: true })


// module.exports = mongoose.model('book', bookSchema)