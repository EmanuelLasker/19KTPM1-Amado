const mongoose = require('mongoose');

const bill = new mongoose.Schema({
    userID: String,
    displayName: Object,
    listProduct: Array,
    address: String,
    paymentMethod: String,
    resquest: String,
    date: Object,
    status: String
},{ versionKey: null });

module.exports = mongoose.model('bills', bill);