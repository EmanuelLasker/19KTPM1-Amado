const product = require("../../models/products");
const comments = require("../../models/comments");
const type = require("../../models/types");
const supplier = require("../../models/suppliers");
const customers = require("../../models/customers");
const bills = require("../../models/bills");
const LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

class ProductController {
    productDetail(req, res, next) {
        var id = req.params.id;
        var numberItemPerpage = 5;
        product.findOne({ _id: id }, (err, result) => {
            bills.find({}, (err, billResult) => {
                product.find({}, (err, productResult) => {
                    var name = result.productName;
                    comments.find({ productName: name }, (err, commentResult) => {
                        
                        var count_list = []; // list of related products with count
                        var bill_list = []; // bills with the target product

                        // find the bills that contain the target product
                        for (let j = 0; j < billResult.length; j++) {
                            for (let k = 0; k < billResult[j].listProduct.length; k++) {
                                if (billResult[j].listProduct[k].productID == result._id) {
                                    bill_list.push(billResult[j]);
                                    break;
                                }
                            }
                        }

                        // create the list of products with count of appearances 
                        // related to the target product
                        for (let i = 0; i < productResult.length; i++) {
                            if (productResult[i]._id == String(result._id)) continue;

                            var count = 0;

                            // increase the count with each appearance in each bill
                            for (let j = 0; j < bill_list.length; j++) {
                                for (let k = 0; k < bill_list[j].listProduct.length; k++) {
                                    if (bill_list[j].listProduct[k].productID == productResult[i]._id) {
                                        count++;
                                    }
                                }
                            }
                            if (count == 0) continue;

                            count_list.push(
                                {
                                    product: productResult[i],
                                    count: count
                                });
                        }

                        if (count_list.length > 1) {
                            // sort product list
                            for (let i = 0; i < count_list.length; i++) {
                                let max = i;
                                for (let j = i + 1; j < count_list.length - 1; j++) {
                                    if (count_list[j].count > count_list[max].count) {
                                        max = j;
                                    }
                                }
                                count_list[max] = [count_list[i], count_list[i] = count_list[max]][0];
                            }
                        }

                        // create related list
                        var related_list = []; // LIST OF RELATED PRODUCTS
                        for (let i = 0; i < count_list.length; i++) {
                            related_list.push(count_list[i].product);
                        }
                        
                        if (req.isAuthenticated()) {
                            customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                res.render("product-details", {
                                    data: result,
                                    customer: customerResult,
                                    comments: commentResult,
                                    currentPage: 1,
                                    itemsPerPage: numberItemPerpage,
                                    related: related_list
                                });
                            });
                        } else {
                            res.render("product-details", {
                                data: result,
                                customer: undefined,
                                comments: commentResult,
                                currentPage: 1,
                                itemsPerPage: numberItemPerpage,
                                related: related_list
                            });
                        }
                    });
                });
            });
        });
    }
    productDetailAtPage(req, res, next) {
        var id = req.params.id;
        var numberItemPerpage = 5;
        var page = req.params.page;
        product.findOne({ _id: id }, (err, result) => {
            bills.find({}, (err, billResult) => {
                product.find({}, (err, productResult) => {
                    var name = result.productName;
                    comments.find({ productName: name }, (err, commentResult) => {
                        
                        var count_list = []; // list of related products with count
                        var bill_list = []; // bills with the target product

                        // find the bills that contain the target product
                        for (let j = 0; j < billResult.length; j++) {
                            for (let k = 0; k < billResult[j].listProduct.length; k++) {
                                if (billResult[j].listProduct[k].productID == result._id) {
                                    bill_list.push(billResult[j]);
                                    break;
                                }
                            }
                        }

                        // create the list of products with count of appearances 
                        // related to the target product
                        for (let i = 0; i < productResult.length; i++) {
                            if (productResult[i]._id == String(result._id)) continue;

                            var count = 0;

                            // increase the count with each appearance in each bill
                            for (let j = 0; j < bill_list.length; j++) {
                                for (let k = 0; k < bill_list[j].listProduct.length; k++) {
                                    if (bill_list[j].listProduct[k].productID == productResult[i]._id) {
                                        count++;
                                    }
                                }
                            }
                            if (count == 0) continue;

                            count_list.push(
                                {
                                    product: productResult[i],
                                    count: count
                                });
                        }

                        if (count_list.length > 1) {
                            // sort product list
                            for (let i = 0; i < count_list.length; i++) {
                                let max = i;
                                for (let j = i + 1; j < count_list.length - 1; j++) {
                                    if (count_list[j].count > count_list[max].count) {
                                        max = j;
                                    }
                                }
                                count_list[max] = [count_list[i], count_list[i] = count_list[max]][0];
                            }
                        }

                        // create related list
                        var related_list = []; // LIST OF RELATED PRODUCTS
                        for (let i = 0; i < count_list.length; i++) {
                            related_list.push(count_list[i].product);
                        }
                        
                        if (req.isAuthenticated()) {
                            customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                res.render("product-details", {
                                    data: result,
                                    customer: customerResult,
                                    comments: commentResult,
                                    currentPage: page,
                                    itemsPerPage: numberItemPerpage,
                                    related: related_list
                                });
                            });
                        } else {
                            res.render("product-details", {
                                data: result,
                                customer: undefined,
                                comments: commentResult,
                                currentPage: page,
                                itemsPerPage: numberItemPerpage,
                                related: related_list
                            });
                        }
                    });
                });
            });
        });
    }
    postComment(req, res, next) {
        var date = new Date();
        var day = ("0" + date.getDate()).slice(-2);
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var year = date.getFullYear();
        var date_str = day + "/" + month + "/" + year;

        var customerName = req.body.customerName;
        var productName = req.body.productName;
        var comment = req.body.comment;

        var data = {
            'customerName': customerName,
            'productName': productName,
            'comment': comment,
            'date': date_str
        }

        console.log(data);

        var newCmt = new comments(data);
        newCmt.save()
            .then(() => {
                res.redirect('back');
            })
            .catch((err) => {
                console.log(err);
                req.flash('error', 'Bình luận không thành công!');
                res.redirect('back');
            });
    }
    search(req, res, next) {
        var key = req.query.search;
        type.find({}, (err, typeResult) => {
            supplier.find({}, (err, supplierResult) => {
                product.find({ productName: { $regex: key, $options: 'i' } },
                    (err, productResult) => {
                        if (req.isAuthenticated()) {
                            customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                res.render('search', {
                                    types: typeResult,
                                    suppliers: supplierResult,
                                    products: productResult,
                                    key: key,
                                    customer: customerResult
                                });
                            });
                        } else {
                            res.render('search', {
                                types: typeResult,
                                suppliers: supplierResult,
                                products: productResult,
                                key: key,
                                customer: undefined
                            });
                        }
                    }
                );
            });
        });
    }
    getProductDefault(req, res, next) {
        var itemsPerPage = 6;
        product.find({}, (err, result) => {
            type.find({}, (err, data) => {
                supplier.find({}, (err, supplier) => {
                    if (req.isAuthenticated()) {
                        customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                            res.render("product", {
                                data: result,
                                types: data,
                                suppliers: supplier,
                                itemsPerPage: itemsPerPage,
                                currentPage: 1,
                                message: req.flash('success'),
                                customer: customerResult,
                                priceValue: 0
                            });
                        })
                    } else {
                        let tmp_user = JSON.parse(localStorage.getItem(req.sessionID));

                        if (tmp_user == null) {
                            let data = {
                                'fullNameCustomer': null,
                                'dateOfBirth': null,
                                'sex': null,
                                'identityCardNumber': null,
                                'address': null,
                                'phoneNumber': null,
                                'email': null,
                                'listProduct': [],
                                'listFavorite': [],
                                'loginInformation': null,
                                'avatar': null
                            }
                            tmp_user = new customers(data);
                        }

                        res.render("product", {
                            data: result,
                            types: data,
                            suppliers: supplier,
                            itemsPerPage: itemsPerPage,
                            currentPage: 1,
                            message: req.flash('success'),
                            customer: tmp_user,
                            priceValue: 0
                        });
                    }
                });
            });
        });
    }
    productAtPage(req, res, next) {
        var itemsPerPage = 6;
        var currentPage = req.params.page;
        var priceFilter = req.body.price;
        if(priceFilter==undefined)
            priceFilter = 0;
        product.find({}, (err, result) => {
            type.find({}, (err, data) => {
                supplier.find({}, (err, supplier) => {
                    if (req.isAuthenticated()) {
                        customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                            res.render("product", {
                                data: result,
                                types: data,
                                suppliers: supplier,
                                itemsPerPage: itemsPerPage,
                                currentPage: currentPage,
                                message: req.flash('success'),
                                customer: customerResult,
                              priceValue: priceFilter
                            });
                        })
                    } else {
                        res.render("product", {
                            data: result,
                            types: data,
                            suppliers: supplier,
                            itemsPerPage: itemsPerPage,
                            currentPage: currentPage,
                            message: req.flash('success'),
                            customer: undefined,
                            priceValue: priceFilter
                        });
                    }
                });
            });
        });
    }
    filterProduct(req, res, next) {
        var selection = req.body.selection;
        var supplierFilter = req.body.supplier;
        var priceFilter = req.body.price;
        var currentPage = req.params.page;
        if(currentPage == undefined)
            currentPage = 1;
        if(priceFilter==undefined)
            priceFilter = 0;

        req.session.selection = selection;
        req.session.supplierFilter = supplierFilter;
        //console.log(req.session)
        //console.log(priceFilter);
        var itemsPerPage = 6;
        if (selection) {
            if (supplierFilter) {
                product.find({ description: { $elementMatch: { typeCode: selection, supplierCode: supplierFilter } } }, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            /*if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;*/
                            return a._doc.productName.localeCompare(b._doc.productName);
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            /*if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;*/
                            return b._doc.productName.localeCompare(a._doc.productName);
                        });
                    else
                        return result;
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        supplierFilter: supplierFilter,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    supplierFilter: supplierFilter,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            } else {
                console.log("tsest");
                product.find({ 'description.typeCode': selection }, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;
                        });
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        supplierFilter: supplierFilter,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    supplierFilter: supplierFilter,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            }
        } else {
            if (supplierFilter) {
                product.find({ 'description.supplierCode': supplierFilter }, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;
                        });
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        supplierFilter: supplierFilter,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    supplierFilter: supplierFilter,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            } else {
                product.find({}, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;
                        });
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            }
        }
    }
    filterProductAtPage(req, res, next) {
        var supplierFilter = req.session.supplierFilter;
        var selection = req.session.selection;
        var priceFilter = req.body.price;
        var itemsPerPage = 6;
        var currentPage = req.params.page;
        if(priceFilter==undefined)
            priceFilter = 0;
        if (selection) {
            if (supplierFilter) {
                product.find({ description: { $elementMatch: { typeCode: selection, supplierCode: supplierFilter } } }, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            /*if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;*/
                            return a._doc.productName.localeCompare(b._doc.productName);
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            /*if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;*/
                            return b._doc.productName.localeCompare(a._doc.productName);
                        });
                    else
                        return result;
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        supplierFilter: supplierFilter,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    supplierFilter: supplierFilter,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            } else {
                console.log("tsest");
                product.find({ 'description.typeCode': selection }, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;
                        });
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        supplierFilter: supplierFilter,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    supplierFilter: supplierFilter,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            }
        } else {
            if (supplierFilter) {
                product.find({ 'description.supplierCode': supplierFilter }, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;
                        });
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        supplierFilter: supplierFilter,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    supplierFilter: supplierFilter,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            } else {
                product.find({}, (err, result) => {
                    if (priceFilter == 1)
                        result.sort(function(a, b) {
                            return parseFloat(a._doc.description.price) - parseFloat(b._doc.description.price);
                        });
                    else if (priceFilter == 2)
                        result.sort(function(a, b) {
                            return parseFloat(b._doc.description.price) - parseFloat(a._doc.description.price);
                        });
                    else if (priceFilter == 3)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return -1;
                            if (a._doc.productName > b._doc.productName)
                                return 1;
                            return 0;
                        });
                    else if (priceFilter == 4)
                        result.sort(function(a, b) {
                            if (a._doc.productName < b._doc.productName)
                                return 1;
                            if (a._doc.productName > b._doc.productName)
                                return -1;
                            return 0;
                        });
                    type.find({}, (err, data) => {
                        supplier.find({}, (err, supplier) => {
                            if (req.isAuthenticated()) {
                                customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                                    res.render("product-filter", {
                                        data: result,
                                        types: data,
                                        suppliers: supplier,
                                        itemsPerPage: itemsPerPage,
                                        currentPage: currentPage,
                                        message: req.flash('success'),
                                        customer: customerResult,
                                        selected: selection,
                                        priceValue: priceFilter
                                    });
                                })
                            } else {
                                res.render("product-filter", {
                                    data: result,
                                    types: data,
                                    suppliers: supplier,
                                    itemsPerPage: itemsPerPage,
                                    currentPage: currentPage,
                                    message: req.flash('success'),
                                    customer: undefined,
                                    selected: selection,
                                    priceValue: priceFilter
                                });
                            }
                        });
                    });
                });
            }
        }
    }
}

module.exports = new ProductController();