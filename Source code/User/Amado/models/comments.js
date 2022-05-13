const mongoose = require('mongoose');

const comment = new mongoose.Schema({
    customerName: String,
    productName: String,
    comment: String,
    date: String
},{ versionKey: null });

module.exports = mongoose.model('comments', comment);