const product = require("../models/products");
const type = require("../models/types");
const supplier = require("../models/suppliers");
const customers = require("../models/customers");

class ProductController {
  productDetail(req, res, next) {
    var id = req.params.id;
    product.findOne({ _id: id }, (err, result) => {
      if(req.isAuthenticated()) {
        customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
          res.render("product-details", { data: result, customer: customerResult });
        });
      } else {
        res.render("product-details", { data: result, customer: undefined });
      }
    });
  }
  search(req, res, next) {
    var key = req.query.search;
    type.find({}, (err, typeResult) => {
      supplier.find({}, (err, supplierResult) => {
        product.find(
          { productName: { $regex: key, $options: 'i' } },
          (err, productResult) => {
           if(req.isAuthenticated()) {
             customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
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
          if(req.isAuthenticated()) {
            customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
              res.render("product", {
                data: result,
                types: data,
                suppliers: supplier,
                itemsPerPage: itemsPerPage,
                currentPage: 1,
                message: req.flash('success'),
                customer: customerResult
              });
            })
          } else {
            res.render("product", {
              data: result,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: 1,
              message: req.flash('success'),
              customer: undefined
            });
          }
        });
      });
    });
  }
  productAtPage(req, res, next) {
    var itemsPerPage = 6;
    var currentPage = req.params.page;
    product.find({}, (err, result) => {
      type.find({}, (err, data) => {
        supplier.find({}, (err, supplier) => {
          if(req.isAuthenticated()) {
            customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
              res.render("product", {
                data: result,
                types: data,
                suppliers: supplier,
                itemsPerPage: itemsPerPage,
                currentPage: currentPage,
                message: req.flash('success'),
                customer: customerResult
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
              customer: undefined
            });
          }
        });
      });
    });
  }
  filterProduct(req, res, next) {
    var selection = req.body.selection;
    var supplierFilter = req.body.supplier;
    req.session.selection = selection;
    req.session.supplierFilter = supplierFilter;
    console.log(req.session)
    var itemsPerPage = 6;
    if(selection) {
      if(supplierFilter) {
        product.find({description: {$elementMatch: {typeCode: selection, supplierCode: supplierFilter}}}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection,
                    supplierFilter: supplierFilter
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              }
            });
          });
        });
      } else {
        product.find({'description.typeCode': selection}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection,
                    supplierFilter: supplierFilter
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              }
            });
          });
        });
      }
    } else {
      if(supplierFilter) {
        product.find({'description.supplierCode': supplierFilter}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection,
                    supplierFilter: supplierFilter
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection,
                  supplierFilter: supplierFilter
                });
              }
            });
          });
        });
      } else {
        product.find({}, (err, result) => {
          type.find({}, (err, data) => {
            supplier.find({}, (err, supplier) => {
              if(req.isAuthenticated()) {
                customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                  res.render("product-filter", {
                    data: result,
                    types: data,
                    suppliers: supplier,
                    itemsPerPage: itemsPerPage,
                    currentPage: 1,
                    message: req.flash('success'),
                    customer: customerResult,
                    selected: selection
                  });
                })
              } else {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: 1,
                  message: req.flash('success'),
                  customer: undefined,
                  selected: selection
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
    var itemsPerPage = 6;
    var currentPage = req.params.page;
    if(selection) {
      product.find({'description.typeCode': selection}, (err, result) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            if(req.isAuthenticated()) {
              customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: currentPage,
                  message: req.flash('success'),
                  customer: customerResult,
                  selected: selection,
                  supplierFilter: supplierFilter
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
                supplierFilter: supplierFilter
              });
            }
          });
        });
      });
    } else {
      product.find({}, (err, result) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            if(req.isAuthenticated()) {
              customers.findOne({'loginInformation.userName': req.session.passport.user.username}, (err, customerResult) => {
                res.render("product-filter", {
                  data: result,
                  types: data,
                  suppliers: supplier,
                  itemsPerPage: itemsPerPage,
                  currentPage: currentPage,
                  message: req.flash('success'),
                  customer: customerResult,
                  selected: selection,
                  supplierFilter: supplierFilter
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
                supplierFilter: supplierFilter
              });
            }
          });
        });
      });
    }
  }
}

module.exports = new ProductController();
