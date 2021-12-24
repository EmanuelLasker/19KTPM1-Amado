const mongoose = require('mongoose');

const comment = new mongoose.Schema({
    customer: String,
    customerName: String,
    productName: String,
    comment: String,
    order: String,
    date: String
},{ versionKey: null });

module.exports = mongoose.model('comments', comment);