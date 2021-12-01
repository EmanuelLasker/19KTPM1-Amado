const product = require("../models/products");
const supplier = require("../models/suppliers");
const type = require("../models/types");

class CategoriesController {
  getList(req, res, next) {
    var id = req.params.id;
    var itemsPerPage = 6;
    req.session.idCategories = id;
    product.find({ "description.typeCode": id }, (err, result) => {
      supplier.find({}, (err, supllierResult) => {
        type.findOne({ _id: id }, (err, typeResult) => {
          res.render("categories-list-item", {
            suppliers: supllierResult,
            products: result,
            type: typeResult,
            itemsPerPage: itemsPerPage,
            currentPage: 1
          });
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
          res.render("categories-list-item", {
            suppliers: supllierResult,
            products: result,
            type: typeResult,
            itemsPerPage: itemsPerPage,
            currentPage: currentPage
          });
        });
      });
    });
  }
}

module.exports = new CategoriesController();
