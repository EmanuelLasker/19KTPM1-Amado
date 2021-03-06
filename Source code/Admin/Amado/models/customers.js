const mongoose = require('mongoose');

const customer = new mongoose.Schema({
    fullNameCustomer: Object,
    dateOfBirth: String,
    sex: String,
    identityCardNumber: String,
    address: String,
    phoneNumber: String,
    email: String,
    listProduct: Array,
    listFavorite: Array,
    loginInformation: Object,
    avatar: String,
    verified: Boolean,
    locked: Boolean
},{ versionKey: null });

module.exports = mongoose.model('customers', customer);