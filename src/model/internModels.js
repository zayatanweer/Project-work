const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const internShcema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    mobile:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    collegeId: {
        type: ObjectId,
        ref: 'colleges',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }

},
{ timestamps: true })
module.exports = mongoose.model("interns", internShcema) 