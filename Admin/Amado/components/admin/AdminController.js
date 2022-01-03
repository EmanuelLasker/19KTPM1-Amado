const type = require("../../models/types");
const supplier = require("../../models/suppliers");
const product = require("../../models/products");
const admin = require("../../models/admin");
const bill = require('../../models/bills');
const region = require("../../models/region");
const bcrypt = require('bcrypt'); // !HASH_HERE
const customers = require("../../models/customers");
class AdminController {
  getLoginPage(req, res, next) {
    res.render("login", { message: req.flash("error") });
  }
  getSignUpPage(req, res, next) {
    res.render("sign-up", { message: req.flash("error") });
  }
  postSignUpUser(req, res, next) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var dob = req.body.dob;
    var sex = req.body.sex;
    var phone = req.body.phone;
    var cmnd = req.body.cmnd;
    var address = req.body.address;
    var email = req.body.email;
    var password = req.body.password;
    var re_password = req.body.repassword;
    admin.findOne({ 'loginInformation.userName': username }, (err, adminResult) => {
      if (adminResult) {
        req.flash('error', 'Tài khoản đã tồn tại!');
        res.redirect('/sign-up')
      } else {
        var hash = bcrypt.hashSync(password, 10); // !HASH_HERE
        var data = {
          'fullNameCustomer': { 'firstName': firstname, 'lastName': lastname },
          'dateOfBirth': dob,
          'sex': sex,
          'identityCardNumber': cmnd,
          'address': address,
          'phoneNumber': phone,
          'email': email,
          'loginInformation': { 'userName': username, 'password': hash, 'type': 'Admin', roles: ["All"] },
          'avatar': '/uploads/user-01.png'
        }
        var newUser = new admin(data);
        newUser.save()
          .then(() => {
            req.flash('success', 'Tạo tài khoản thành công!');
            res.redirect('/admin/dashboard');
          })
          .catch((err) => {
            console.log(err);
            req.flash('error', 'Tạo tài khoản không thành công!');
            res.redirect('/admin/dashboard');
          });
      }
    });
  }
  getDashboardPage(req, res, next) {
    if (req.isAuthenticated()) {
      product.find({}, (err, productResult) => {
        bill.find({}, (err, billResult) => {
          type.find({}, (err, typeResult) => {
            admin.findOne(
              { "loginInformation.userName": req.session.passport.user.username },
              (err, customerResult) => {

                function containsProduct(list, productID) {
                  for (var i = 0; i < list.length; i++) {
                    if (list[i][0] == productID)
                      return i
                  }
                  return -1
                }

                function containsDate(list, date) {
                  for (var i = 0; i < list.length; i++) {
                    if (list[i][0] == date)
                      return true
                  }
                  return false
                }

                var currentYear = new Date().getFullYear() - 1
                var proList = []
                var dayList = []
                dayList.push(['Ngày', 'Doanh thu'])
                var months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
                var countMonth = []
                for (var j = 0; j < 12; j++)
                  countMonth.push(0)

                billResult.forEach(e => {
                  var countDay = 0
                  e.listProduct.forEach(pro => {
                    var index = containsProduct(proList, pro.productID)
                    if (index < 0) {
                      proList.push([pro.productID, pro.productName, parseInt(pro.amount), parseInt(pro.productPrice)*parseInt(pro.amount), pro.productType])
                    } else {
                      proList[index][2] += parseInt(pro.amount)
                      proList[index][3] += parseInt(pro.productPrice)*parseInt(pro.amount)
                    }
                    
                    countDay += parseInt(pro.productPrice)*parseInt(pro.amount)

                    if (e.date.year == currentYear)
                      countMonth[parseInt(e.date.month - 1)] += parseInt(pro.amount)*parseInt(pro.productPrice)
                  })

                  if (!containsDate(dayList, e.date.day + "/" + e.date.month + "/" + e.date.year) && e.date.year == currentYear) {
                    dayList.push([e.date.day + "/" + e.date.month + "/" + e.date.year, countDay])
                  }
                })

                proList.sort(function (a, b) {
                  return parseInt(b[2]) - parseInt(a[2]);
                })

                var typeList = []
                typeList.push(['Phân loại', 'Số lượng'])

                typeResult.forEach(e => {
                  var totalAmount = 0;
                  proList.forEach(eTL => {
                    if (e._id == eTL[4]) {
                      totalAmount += parseInt(eTL[2])
                    }
                  })
                  typeList.push([e.typeName, totalAmount]);
                })

                dayList.sort(function (a, b) {
                  var t1 = a[0].split("/")
                  var t2 = b[0].split("/")

                  if (parseInt(t1[2]) > parseInt(t2[2]))
                    return 1
                  else if (parseInt(t1[2]) < parseInt(t2[2]))
                    return -1
                  else {
                    if (parseInt(t1[1]) > parseInt(t2[1]))
                      return 1
                    else if (parseInt(t1[1]) < parseInt(t2[1]))
                      return -1
                    else {
                      if (parseInt(t1[0]) > parseInt(t2[0]))
                        return 1
                      else if (parseInt(t1[0]) < parseInt(t2[0]))
                        return -1
                    }
                  }
                  return 0;
                })

                var monthList = []
                monthList.push(['Tháng', 'Doanh thu'])
                for (var j = 0; j < 12; j++)
                  monthList.push([months[j], countMonth[j]])

                res.render("dashboard", {
                  message: req.flash("success"),
                  customer: customerResult,
                  abc: billResult,
                  products: productResult,
                  topList: proList,
                  typeList: JSON.stringify(typeList),
                  monthList: JSON.stringify(monthList),
                  dayList: JSON.stringify(dayList)
                });
              }
            );
          });
        });
      })
    } else {
      res.redirect("/admin/login");
    }
  }
  getProductManagerAtPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      var page = req.params.page;
      product.find({}, (err, productResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            supplier.find({}, (err, supplierResult) => {
              type.find({}, (err, typeResult) => {
                res.render("products-manager", {
                  products: productResult,
                  customer: resultCustomer,
                  types: typeResult,
                  suppliers: supplierResult,
                  message: req.flash("success"),
                  page: page,
                  numberItemPerpage: numberItemPerpage,
                });
              });
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getAddProductPage(req, res, next) {
    if (req.isAuthenticated()) {
      supplier.find({}, (err, supplierResult) => {
        type.find({}, (err, typeResult) => {
          admin.findOne(
            { "loginInformation.userName": req.session.passport.user.username },
            (err, customerResult) => {
              res.render("add-product", {
                suppliers: supplierResult,
                types: typeResult,
                customer: customerResult,
                message: "",
              });
            }
          );
        });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  postAddProduct(req, res, next) {
    if (req.isAuthenticated()) {
      var data = {
        productName: req.body.productname,
        description: {
          imageList: req.files.map((image) => `/${image.path}`),
          productDescription: req.body.description,
          price: req.body.price,
          unit: "Cái",
          supplierCode: req.body.supplier,
          typeCode: req.body.categories,
          status: Boolean(req.body.status),
        },
        discount: {
          state: "none",
          discountPercent: 0,
          startDate: "04/05/2021",
          endDate: "10/05/2021",
        },
        rating: {
          purchase: 0,
          commentAndVote: [],
        },
      };

      var newProduct = new product(data);
      newProduct
        .save()
        .then(() => {
          req.flash("success", "Thêm sản phẩm thành công!");
          res.redirect("/admin/dashboard/products-manager/");
        })
        .catch((err) => {
          req.flash("error", "Có lỗi xảy ra trong quá trình thêm sản phẩm!");
          next();
        });
    } else {
      res.redirect("/admin/login");
    }
  }
  getAdminListAtPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      var page = req.params.page;
      admin.find({}, (err, adminResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            res.render("admin-list", {
              customer: resultCustomer,
              admins: adminResult,
              message: req.flash("success"),
              page: page,
              numberItemPerpage: numberItemPerpage,
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getAdminListPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      admin.find({}, (err, adminResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            res.render("admin-list", {
              customer: resultCustomer,
              admins: adminResult,
              message: req.flash("success"),
              page: 1,
              numberItemPerpage: numberItemPerpage,
            });
          }
        );
      });
    } else {
      res.redirect("admin/login/");
    }
  }
  getProductManagerPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      product.find({}, (err, productResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            supplier.find({}, (err, supplierResult) => {
              type.find({}, (err, typeResult) => {
                res.render("products-manager", {
                  products: productResult,
                  customer: resultCustomer,
                  types: typeResult,
                  suppliers: supplierResult,
                  message: req.flash("success"),
                  page: 1,
                  numberItemPerpage: numberItemPerpage,
                });
              });
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getHideProductInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOne({ _id: idProduct }, (err, productResult) => {
        product
          .findOneAndUpdate(
            { _id: idProduct },
            { "description.status": !productResult.description.status },
            { new: true }
          )
          .then(() => {
            req.flash("success", "Ẩn/Hiển thị thông tin thành công!");
            res.redirect("/admin/dashboard/products-manager");
          })
          .catch((err) => {
            req.flash(
              "error",
              "Ẩn/Hiển thị thông tin không thành công! Có lỗi xảy ra!"
            );
            console.log(err);
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getDeleteProductInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOneAndRemove({ _id: idProduct }, (err, result) => {
        if (err) {
          console.log(err);
          req.flash("error", "Xóa thông tin không thành công! Có lỗi xảy ra!");
          next();
        }
        req.flash("success", "Xóa thông tin thành công!");
        res.redirect("/admin/dashboard/products-manager");
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getUpdateProductPage(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOne({ _id: idProduct }, (err, productResult) => {
        type.find({}, (err, typeResult) => {
          supplier.find({}, (err, supplierResult) => {
            admin.findOne(
              { "loginInformation.userName": req.session.passport.user.username },
              (err, customerResult) => {
                res.render("update-product", {
                  customer: customerResult,
                  product: productResult,
                  types: typeResult,
                  suppliers: supplierResult,
                });
              }
            );
          });
        });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  postUpdateProductPage(req, res, next) {
    if (req.isAuthenticated()) {
      var idProduct = req.params.id;
      product.findOne({ _id: idProduct }, (err, productResult) => {
        var data = {
          productName: req.body.productname,
          "description.imageList":
            req.files.length > 0
              ? req.files.map((img) => `/${img.path}`)
              : productResult.description.imageList,
          "description.productDescription": req.body.description,
          "description.price": req.body.price,
          "description.supplierCode": req.body.supplier,
          "description.typeCode": req.body.categories,
          "description.status": Boolean(req.body.status),
        };
        product
          .findOneAndUpdate({ _id: idProduct }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin thành công!");
            res.redirect("/admin/dashboard/products-manager");
          })
          .catch((err) => {
            console.log(err);
            req.flash(
              "err",
              "Cập nhật thông tin không thành công! Có lỗi xảy ra!"
            );
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getCategoriesManagerPage(req, res, next) {
    var numberItemPerpage = 6;
    if (req.isAuthenticated()) {
      admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        type.find({}, (err, typeResult) => {
          res.render('categories-manager', {
            customer: customerResult,
            categories: typeResult,
            page: 1,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getCategoriesManagerAtPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 6;
      var page = req.params.page;
      admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        type.find({}, (err, typeResult) => {
          res.render('categories-manager', {
            customer: customerResult,
            categories: typeResult,
            page: page,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getUpdateCategoriesPage(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      type.findOne({ _id: id }, (err, typeResult) => {
        admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
          res.render('update-categories', { type: typeResult, customer: customerResult });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getAddCategoriesPage(req, res, next) {
    if (req.isAuthenticated()) {
      admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        res.render('add-categories', { customer: customerResult });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  postAddCategories(req, res, next) {
    if (req.isAuthenticated()) {
      var data = {
        'typeName': req.body.name,
        'thumbnail': `/${req.file.path}`,
        'status': true
      }
      var newCategories = new type(data);
      newCategories.save()
        .then(() => {
          req.flash('success', 'Thêm danh mục thành công!');
          res.redirect('/admin/dashboard/categories-manager/');
        })
        .catch((err) => {
          console.log(err);
          req.flash('error', 'Thêm danh mục không thành công! Có lỗi xảy ra!');
        });
    } else {
      res.redirect('/admin/login');
    }
  }
  postUpdateCategoriesPage(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      type.findOne({ _id: id }, (err, typeResult) => {
        var data = {
          typeName: req.body.name,
          thumbnail: req.file ? `/${req.file.path}` : typeResult.thumbnail
        };
        type
          .findOneAndUpdate({ _id: id }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin danh mục thành công!");
            res.redirect("/admin/dashboard/categories-manager");
          })
          .catch((err) => {
            req.flash(
              "error",
              "Cập nhật thông tin danh mục không thành công! Có lỗi xảy ra!"
            );
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getDeleteCategoriesInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      type.findOneAndRemove({ _id: id }, (err, result) => {
        if (err) {
          console.log(err);
          req.flash("error", "Xóa danh mục không thành công! Có lỗi xảy ra!");
          next();
        }
        req.flash("success", "Xóa danh mục thành công!");
        res.redirect("/admin/dashboard/categories-manager");
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  getOrdersManagerPage(req, res, next) {
    var numberItemPerpage = 6;
    if (req.isAuthenticated()) {
      admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        bill.find({ status: { $nin: ['Chờ xác nhận'] } }, (err, billResult) => {
          res.render('orders-manager', {
            customer: customerResult,
            bills: billResult,
            page: 1,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getPendingOrderPage(req, res, next) {
    var numberItemPerpage = 6;
    if (req.isAuthenticated()) {
      admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        bill.find({ status: 'Chờ xác nhận' }, (err, billResult) => {
          res.render('pending-order', {
            customer: customerResult,
            bills: billResult,
            page: 1,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getPendingOrderAtPage(req, res, next) {
    var numberItemPerpage = 6;
    var page = req.params.page;
    if (req.isAuthenticated()) {
      admin.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        bill.find({ status: 'Chờ xác nhận' }, (err, billResult) => {
          res.render('pending-order', {
            customer: customerResult,
            bills: billResult,
            page: page,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/admin/login');
    }
  }
  getUpdateStatusOrder(req, res, next) {
    var id = req.params.id;
    var data = { status: 'Chuẩn bị hàng' }
    bill.findOneAndUpdate({ _id: id }, data, { new: true })
      .then(() => {
        req.flash("success", "Đã xác nhận đơn hàng!");
        res.redirect('/admin/dashboard/pending-orders-manager');
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", "Lỗi xác nhận đơn hàng!");
        res.redirect('/admin/dashboard/pending-orders-manager');
      });
  }
  getDeleteStatusOrder(req, res, next) {
    var id = req.params.id;
    var data = { status: 'Đã hủy' }
    bill.findOneAndUpdate({ _id: id }, data, { new: true })
      .then(() => {
        req.flash("success", "Đã hủy đơn hàng!");
        res.redirect('/admin/dashboard/pending-orders-manager');
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", "Lỗi hủy đơn hàng!");
        res.redirect('/admin/dashboard/pending-orders-manager');
      });
  }
  getUpdateAllStatusOrder(req, res, next) {
    var data = { status: 'Chuẩn bị hàng' }
    bill.updateMany({}, { $set: data }, { new: true })
      .then(() => {
        req.flash("success", "Đã xác nhận đơn hàng!");
        res.redirect('/admin/dashboard/pending-orders-manager');
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", "Lỗi xác nhận đơn hàng!");
        res.redirect('/admin/dashboard/pending-orders-manager');
      });
  }
  getUpdateOrder(req, res, next) {
    var id = req.params.id;
    var user = req.session.passport.user.username;
    admin.findOne({ 'loginInformation.userName': user }, (err, customerResult) => {
      bill.findOne({ _id: id }, (err, billResult) => {
        res.render('update-order', { customer: customerResult, bill: billResult });
      });
    });
  }
  postUpdateOrder(req, res, next) {
    var id = req.params.id;
    var fullName = req.body.name;
    var lastIndexSpace = fullName.lastIndexOf(' ');
    var firstName = fullName.slice(0, lastIndexSpace);
    var lastName = fullName.slice(lastIndexSpace + 1, fullName.length);
    var city = req.body.city;
    var district = req.body.district;
    var ward = req.body.ward;
    var address = req.body.address;
    var status = req.body.status;
    region.findOne({ Id: city }, (err, cityResult) => {
      var cityName = cityResult.Name;
      var districtData = cityResult.Districts.filter(e => e.Id == district);
      var districtName = districtData[0].Name;
      var wardName = districtData[0].Wards.filter(e => e.Id == ward)[0].Name;
      var data = {
        'displayName': { firstName: firstName, lastName: lastName },
        'address': `${address}, ${wardName}, ${districtName}, ${cityName}`,
        'status': status
      }
      bill.findOneAndUpdate({ _id: id }, { $set: data }, { new: true })
        .then(() => {
          req.flash('success', 'Cập nhật thông tin đơn hàng thành công!');
          res.redirect('/admin/dashboard/orders-manager');
        })
        .catch((err) => {
          console.log(err);
          req.flash('error', 'Cập nhật thông tin đơn hàng không thành công!');
          res.redirect('/admin/dashboard/orders-manager');
        });
    });
  }
  getDeleteOrder(req, res, next) {
    var id = req.params.id;
    var data = { status: 'Đã hủy' }
    bill.findOneAndUpdate({ _id: id }, data, { new: true })
      .then(() => {
        req.flash("success", "Đã hủy đơn hàng!");
        res.redirect('/admin/dashboard/orders-manager');
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", "Lỗi hủy đơn hàng!");
        res.redirect('/admin/dashboard/orders-manager');
      });
  }
  getLogout(req, res, next) {
    req.logout();
    res.redirect('/admin/login');
  }

  getAdminProfile(req, res, next) {
    if (req.isAuthenticated()) {
      admin.findOne(
        { "loginInformation.userName": req.session.passport.user.username },
        (err, adminResult) => {
          res.render("admin-profile", { adminProfile: adminResult, message: req.flash('success') });
        }
      );
    } else {
      res.redirect("/login");
    }
  }

  postAdminProfile(req, res, next) {
    if (req.isAuthenticated()) {
      var idAdmin = req.params.id;
      admin.findOne({ _id: idAdmin }, (err, adminResult) => {
        var data = {
          fullNameCustomer: {
            firstName: req.body.adminFirstName,
            lastName: req.body.adminLastName
          },
          sex: req.body.adminSex,
          dateOfBirth: req.body.adminDoB,
          identityCardNumber: req.body.adminIdentityCardNumber,
          phoneNumber: req.body.adminPhoneNumber,
          address: req.body.adminAddress,
          email: req.body.adminEmail
        };
        admin
          .findOneAndUpdate({ _id: idAdmin }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin thành công!");
            res.redirect("/admin/profile");
          })
          .catch((err) => {
            console.log(err);
            req.flash(
              "err",
              "Cập nhật thông tin không thành công! Có lỗi xảy ra!"
            );
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }

  getUserListAtPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      var page = req.params.page;
      customers.find({}, (err, userResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            res.render("users-manager", {
              customer: resultCustomer,
              users: userResult,
              message: req.flash("success"),
              page: page,
              numberItemPerpage: numberItemPerpage,
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }

  getUserListPage(req, res, next) {
    if (req.isAuthenticated()) {
      var numberItemPerpage = 12;
      customers.find({}, (err, userResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, resultCustomer) => {
            res.render("users-manager", {
              customer: resultCustomer,
              users: userResult,
              message: req.flash("success"),
              page: 1,
              numberItemPerpage: numberItemPerpage,
            });
          }
        );
      });
    } else {
      res.redirect("admin/login/");
    }
  }

  getUpdateUserPage(req, res, next) {
    if (req.isAuthenticated()) {
      var idCustomer = req.params.id;
      customers.findOne({ _id: idCustomer }, (err, userResult) => {
        admin.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, customerResult) => {
            res.render("update-user", {
              customer: customerResult,
              user: userResult,
              message: req.flash('success')
            });
          }
        );
      });
    } else {
      res.redirect("/admin/login");
    }
  }
  postUpdateUserPage(req, res, next) {
    if (req.isAuthenticated()) {
      var idCustomer = req.params.id;
      customers.findOne({ _id: idCustomer }, (err, userResult) => {
        var data = {
          fullNameCustomer: {
            firstName: req.body.userFirstName,
            lastName: req.body.userLastName
          },
          sex: req.body.userSex,
          dateOfBirth: req.body.userDoB,
          identityCardNumber: req.body.userCardNumber,
          phoneNumber: req.body.userPhoneNumber,
          address: req.body.userAddress,
          email: req.body.userEmail
        };
        customers
          .findOneAndUpdate({ _id: idCustomer }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin thành công!");
            res.redirect("/admin/dashboard/users-manager");
          })
          .catch((err) => {
            console.log(err);
            req.flash(
              "err",
              "Cập nhật thông tin không thành công! Có lỗi xảy ra!"
            );
            next();
          });
      });
    } else {
      res.redirect("/admin/login");
    }
  }

  getDeleteUserInfo(req, res, next) {
    if (req.isAuthenticated()) {
      var idCustomer = req.params.id;
      customers.findOneAndRemove({ _id: idCustomer }, (err, result) => {
        if (err) {
          console.log(err);
          req.flash("error", "Xóa thông tin không thành công! Có lỗi xảy ra!");
          next();
        }
        req.flash("success", "Xóa thông tin thành công!");
        res.redirect("/admin/dashboard/users-manager");
      });
    } else {
      res.redirect("/admin/login");
    }
  }
}
module.exports = new AdminController();
