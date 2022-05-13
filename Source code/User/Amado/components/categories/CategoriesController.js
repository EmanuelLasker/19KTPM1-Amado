const product = require("../../models/products");
const supplier = require("../../models/suppliers");
const type = require("../../models/types");
const customer = require("../../models/customers");

class CategoriesController {
  getList(req, res, next) {
    var id = req.params.id;
    var itemsPerPage = 6;
    req.session.idCategories = id;
    product.find({ "description.typeCode": id }, (err, result) => {
      supplier.find({}, (err, supllierResult) => {
        type.findOne({ _id: id }, (err, typeResult) => {
          if (req.isAuthenticated()) {
            customer.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
              res.render("categories-list-item", { 
                data: result, 
                message: req.flash("success"), 
                customer: customerResult ,
                suppliers: supllierResult,
                products: result,
                type: typeResult,
                itemsPerPage: itemsPerPage,
                currentPage: 1,
                priceValue: 0
              });
            })
          } else {
            res.render("categories-list-item", { 
              data: result, 
              message: req.flash("success"), 
              customer: undefined,
              suppliers: supllierResult,
              products: result,
              type: typeResult,
              itemsPerPage: itemsPerPage,
              currentPage: 1,
              priceValue: 0
            });
          }
        });
      });
    });
  }
  getListAtPage(req, res, next) {
    var id = req.session.idCategories;
    var itemsPerPage = 6;
    var currentPage = req.params.page;
    product.find({ "description.typeCode": id }, (err, result) => {
      supplier.find({}, (err, supllierResult) => {
        type.findOne({ _id: id }, (err, typeResult) => {
          if (req.isAuthenticated()) {
            customer.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
              res.render("categories-list-item", { 
                data: result, 
                message: req.flash("success"), 
                customer: customerResult ,
                suppliers: supllierResult,
                products: result,
                type: typeResult,
                itemsPerPage: itemsPerPage,
                currentPage: currentPage,
                priceValue: 0
              });
            })
          } else {
            res.render("categories-list-item", { 
              data: result, 
              message: req.flash("success"), 
              customer: undefined,
              suppliers: supllierResult,
              products: result,
              type: typeResult,
              itemsPerPage: itemsPerPage,
              currentPage: currentPage,
              priceValue: 0
            });
          }
        });
      });
    });
  }
}

module.exports = new CategoriesController();