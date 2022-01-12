const type = require("../../models/types");
const supplier = require("../../models/suppliers");
const product = require("../../models/products");
const customers = require("../../models/customers");
const region = require('../../models/region');
const bill = require('../../models/bills');
const OjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const jwt_decoder = require("jwt-decode");
// const email_exist = require("email-existence");
// const ExpressRedisCache = require('express-redis-cache');
// const cache = ExpressRedisCache({
//     expire: 30, // optional: expire every 10 seconds
// })

const EMAIL_SECRET = 'asdf1093KMnzxcvnkljvasdu09123nlasdasdf';

class UserController {
  index(req, res, next) {

    type.find({}, (err, result) => {
      if (req.isAuthenticated()) {
        let tmp_user = JSON.parse(localStorage.getItem(req.sessionID));

        customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
          let curUser = customerResult;

          if(tmp_user != undefined && tmp_user.listProduct){
            tmp_user.listProduct.forEach(x => {
              // console.log(userListProduct);
              curUser.listProduct.forEach(y=>{
                if(x.productID==y.productID){
                  x.amount += y.amount;
                }
                else{
                  tmp_user.listProduct.push(y);
                }
              })
            })
            curUser.listProduct = tmp_user.listProduct;
            tmp_user = curUser;
            let x = tmp_user;
            customers.findOneAndUpdate({ 'loginInformation.userName': req.session.passport.user.username },x,{upsert: true},
                (err, resultQuery)=>{
                    //console.log(resultQuery);
                });
          }
        })

        customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err,result ) => {
          tmp_user = result;
          //res.render("index", { data: result, message: req.flash("success"), customer: customerResult, title: "Amado - Trang chủ" });
        })
        //console.log("TMp_useser ",tmp_user);

        localStorage.setItem(req.sessionID,null);
        customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
          res.render("index", { data: result, message: req.flash("success"), customer: customerResult, title: "Amado - Trang chủ" });
        })
      } else {
        let tmp_user = JSON.parse(localStorage.getItem(req.sessionID));
        if (tmp_user == null) {
          var data = {
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
        res.render("index", { data: result, message: req.flash("success"), customer: tmp_user, title: "Amado - Trang chủ" });
      }
    });
  }
  getLoginPage(req, res, next) {
    var messageError = req.flash("error");
    var messageSuccess = req.flash("success");
    res.render("loginuser", { message: messageError.length != 0 ? messageError : messageSuccess, typeMessage: messageSuccess.length != 0 ? 'success' : 'error' });
  }
  getLogout(req, res, next) {
    req.logout();
    localStorage.setItem(req.sessionID, null);
    res.redirect('/');
  }
  getChangePassword(req, res, next){
    if (req.isAuthenticated()) {
      var messageError = req.flash("error");
      var messageSuccess = req.flash("success");
      customers.findOne(
          { "loginInformation.userName": req.session.passport.user.username },
          (err, customerResult) => {
            res.render("change-pass", { title: "Thay đổi mật khẩu", customer: customerResult, message: messageError.length != 0 ? messageError : messageSuccess, typeMessage: messageError.length != 0 ? "error":"success"  });
          }
      );
    } else {
      res.redirect("/login");
    }
  }
  postChangePassword(req, res, next){


    if (req.isAuthenticated()) {

      var username = req.session.passport.user.username;
      var oldPass = req.body.oldPass;
      var newPass = bcrypt.hashSync(req.body.newPass, 10);

      if(oldPass == "" || req.body.newPass == "" || req.body.retypeNewPass == ""){
        req.flash("error", "Vui lòng điền đủ thông tin!");
        res.redirect("/change-pass");
        return;
      }

      if(req.body.newPass !== req.body.retypeNewPass){
      req.flash("error", "Mật khẩu nhập lại không khớp!");
      res.redirect("/change-pass");
      return;
      }


      customers.findOne(
          { 'loginInformation.userName': username },
          function (err, user) {

            //console.log(bcrypt.compareSync(oldPass, user.loginInformation.password));
            if (bcrypt.compareSync(oldPass, user.loginInformation.password)==false) {
              req.flash("error", "Mật khẩu cũ không đúng!");
              return res.redirect("/change-pass");
          }
            else if(bcrypt.compareSync(req.body.newPass, user.loginInformation.password)){
              req.flash("error", "Mật khẩu mới trùng với mật khẩu cũ!");
              return res.redirect("/change-pass");
            }
          else{
            customers
                .findOneAndUpdate({ 'loginInformation.userName': username }, {'loginInformation.password': newPass }, { new: true })
                .then(() => {
                  req.flash("success", "Đổi mật khẩu thành công!");
                  res.redirect("/change-pass");
                })
                .catch((err) => {
                  console.log(err);
                  req.flash(
                      "error",
                      "Cập nhật thông tin không thành công! Có lỗi xảy ra!"
                  );
                });

          }
          })



      }

     else {
      res.redirect("/login");
    }
  }
  getUserInformation(req, res, next) {
    if (req.isAuthenticated()) {
      customers.findOne(
        { "loginInformation.userName": req.session.passport.user.username },
        (err, customerResult) => {
          res.render("user-profile", { title: "Thông tin người dùng", customer: customerResult, message: req.flash('success') });
        }
      );
    } else {
      res.redirect("/login");
    }
  }
  postUserInformation(req, res, next) {
    //console.log(req.session.passport.user.username);
    var firstname = req.body.firstName;
    var lastname = req.body.lastName;
    var username = req.session.passport.user.username;
    var phone = req.body.phone;
    var cmnd = req.body.cmnd;
    var email = req.body.email;
    var sex = req.body.sex.toLowerCase() == "nam" ? true : false;
    var address = req.body.addr;
    var avatar = req.body.avatar;
    //console.log(req.params.id);
    //'loginInformation.userName': username

    // var password = req.body.password;
    // var re_password = req.body.repassword;
    // var hashed_password = bcrypt.hashSync(password, 10);

    if (req.isAuthenticated()) {
      // var idProduct = req.params.id;
      customers.findOne({ 'loginInformation.userName': username }, (err, customerResult) => {
        var data = {
          'fullNameCustomer': { 'firstName': firstname, 'lastName': lastname },
          // 'dateOfBirth': customerResult.dateOfBirth,
          'sex': sex,
          'identityCardNumber': cmnd,
          'address': address,
          'phoneNumber': phone,
          'email': email,
          'avatar': avatar
        }
        customers
          .findOneAndUpdate({ 'loginInformation.userName': username }, data, { new: true })
          .then(() => {
            req.flash("success", "Cập nhật thông tin thành công!");
            res.redirect("/user-info");
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
      res.redirect("/login");
    }
  }
  getCartPage(req, res, next) {
    if (req.isAuthenticated()) {
      customers.findOne(
        { "loginInformation.userName": req.session.passport.user.username },
        (err, customerResult) => {
          res.render("cart", { customer: customerResult, message: req.flash('success') });
        }
      );
    } else {
      var tmp_user = JSON.parse(localStorage.getItem(req.sessionID));

      if (tmp_user == null) {
        var data = {
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
        // const LocalStorage = require('node-localstorage').LocalStorage,
        //     localStorage = new LocalStorage('./scratch');
        localStorage.setItem(req.sessionID, JSON.stringify(tmp_user));
      }

      res.render("cart", { customer: tmp_user, message: req.flash('success') });
    }

  }
  getAddToCartSingle(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      product.findOne({ _id: id }, (err, productResult) => {
        customers
          .findOneAndUpdate(
            { "loginInformation.userName": user },
            {
              $push: {
                listProduct: [
                  {
                    productID: productResult._id.toString(),
                    productName: productResult.productName,
                    productPrice: productResult.description.price,
                    productImage: productResult.description.imageList[0],
                    productType: productResult.description.typeCode,
                    amount: 1,
                  },
                ],
              },
            }
          )
          .then(() => {
            req.flash("success", "Sản phẩm đã thêm vào giỏ!");
            res.redirect(`/product/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào giỏ!");
            next();
          });
      });
    } else {
      var id = req.params.id;
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
      //res.redirect("/login");
      product.findOne({ _id: id }, (err, productResult) => {
        let data =
        {
          productID: productResult._id.toString(),
          productName: productResult.productName,
          productPrice: productResult.description.price,
          productImage: productResult.description.imageList[0],
          productType: productResult.description.typeCode,
          amount: 1
        };
        tmp_user.listProduct.push(data)

      }).then(() => {
        req.flash("success", "Sản phẩm đã thêm vào giỏ!");
        localStorage.setItem(req.sessionID, JSON.stringify(tmp_user));
        res.redirect(`/product/`);
      })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Lỗi khi thêm sản phẩm vào giỏ!");
          next();
        });


    }
  }
  postAddToCartMulti(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      var amount = req.body.quantity ? req.body.quantity : 1;
      product.findOne({ _id: id }, (err, productResult) => {
        customers
          .findOneAndUpdate(
            { "loginInformation.userName": user },
            {
              $push: {
                listProduct: [
                  {
                    productID: productResult._id.toString(),
                    productName: productResult.productName,
                    productPrice: productResult.description.price,
                    productImage: productResult.description.imageList[0],
                    productType: productResult.description.typeCode,
                    amount: amount,
                  },
                ],
              },
            }
          )
          .then(() => {
            req.flash("success", "Sản phẩm đã thêm vào giỏ!");
            res.redirect(`/product/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào giỏ!");
            next();
          });
      });
    } else {
      // res.redirect("/login");
      var id = req.params.id;
      var amount = req.body.quantity ? req.body.quantity : 1;
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
      //res.redirect("/login");
      product.findOne({ _id: id }, (err, productResult) => {
        let data =
            {
              productID: productResult._id.toString(),
              productName: productResult.productName,
              productPrice: productResult.description.price,
              productImage: productResult.description.imageList[0],
              productType: productResult.description.typeCode,
              amount: amount
            };
        tmp_user.listProduct.push(data)

      }).then(() => {
        req.flash("success", "Sản phẩm đã thêm vào giỏ!");
        localStorage.setItem(req.sessionID, JSON.stringify(tmp_user));
        res.redirect(`/product/`);
      })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào giỏ!");
            next();
          });

    }
  }
  postUpdateQTYInCart(req, res, next) {
    var id = req.params.id;
    var quantity = parseInt(req.body.amount);
    if(req.isAuthenticated()){
      var user = req.session.passport.user.username;
      customers.updateOne({ "loginInformation.userName": user, "listProduct.productID": id }, { $set: { "listProduct.$.amount": quantity } })
          .then(() => {
            res.redirect('/cart');
          })
          .catch((err) => {
            console.log(err);
          });
    }
    else{
      let tmp_user = JSON.parse(localStorage.getItem(req.sessionID));
      let index = tmp_user.listProduct.findIndex(x => x.productID == id);
      tmp_user.listProduct[index].amount = quantity;
      localStorage.setItem(req.sessionID,JSON.stringify(tmp_user));
      res.redirect('/cart');
    }
  }
  getDeleteProductInCart(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      customers.updateMany({ 'loginInformation.userName': user }, { $pull: { listProduct: { productID: id } } })
        .then(() => {
          req.flash("success", "Đã xóa sản phẩm khỏi giỏ!");
          res.redirect('/cart');
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    } else {
      // res.redirect('/login');
      var id = req.params.id;
      let tmp_user = JSON.parse(localStorage.getItem(req.sessionID));
      // tmp_user.listProduct.remove(tmp_user.listProduct.findIndex(x => x.productID === id));
      if(tmp_user.listProduct){
        tmp_user.listProduct.splice(tmp_user.listProduct.findIndex(x => x.productID === id), 1);
        localStorage.setItem(req.sessionID,JSON.stringify(tmp_user));
        req.flash("success", "Đã xóa sản phẩm khỏi giỏ!");
        res.redirect('/cart');
        return;
      }
    }
  }
  getCheckoutPage(req, res, next) {
    if (req.isAuthenticated()) {
      var user = req.session.passport.user.username;
      customers.findOne({ 'loginInformation.userName': user }, (err, customerResult) => {
        res.render("checkout", { customer: customerResult });
      });
    } else {
      res.redirect('/login');
    }
  }
  postCheckout(req, res, next) {
    if (req.isAuthenticated()) {
      var user = req.session.passport.user.username;
      var city = req.body.city;
      var district = req.body.district;
      var ward = req.body.ward;
      var address = req.body.address;

      var today = new Date();
      var year = today.getFullYear()
      var month = today.getMonth() + 1
      var day = today.getDate()

      customers.findOne({ 'loginInformation.userName': user }, (err, customerResult) => {
        region.findOne({ Id: city }, (err, cityResult) => {
          var cityName = cityResult.Name;
          var districtData = cityResult.Districts.filter(e => e.Id == district);
          var districtName = districtData[0].Name;
          var wardName = districtData[0].Wards.filter(e => e.Id == ward)[0].Name;

          var currentDate =
          {
            day: day,
            month: month,
            year: year
          }

          var data = {
            'userID': customerResult._id,
            'displayName': customerResult.fullNameCustomer,
            'listProduct': customerResult.listProduct,
            'address': `${address}, ${wardName}, ${districtName}, ${cityName}`,
            'paymentMethod': parseInt(req.body.payment) == 1 ? "Thanh toán khi nhận hàng" : "Paypal",
            'resquest': req.body.comment,
            'date': currentDate,
            'status': 'Chờ xác nhận'
          }
          var newBill = new bill(data);
          newBill.save(data)
            .then(() => {
              req.flash('success', 'Đặt hàng thành công!');
              res.redirect('/cart');
            })
            .catch((err) => {
              console.log(err);
              next();
            });
          customers.findOneAndUpdate({ 'loginInformation.userName': user }, { "listProduct": []},
              {new: false},(err, result)=>{
                  console.log("result: ",result);
              });
        })
      })
    } else {
      res.redirect('/login');
    }
  }
  search(req, res, next) {
    var key = req.query.search;
    type.find({}, (err, typeResult) => {
      supplier.find({}, (err, supplierResult) => {
        product.find(
          { productName: { $regex: key, $options: "i" } },
          (err, productResult) => {
            if (req.isAuthenticated()) {
              customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
                res.render("search", {
                  title: "Tìm kiếm",
                  types: typeResult,
                  suppliers: supplierResult,
                  products: productResult,
                  key: key,
                  customer: customerResult
                });
              });
            } else {
              res.render("search", {
                title: "Tìm kiếm",
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
  getRegisterPage(req, res, next) {
    res.render('sign-up', { message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error') });
  }
  postRegisterUser(req, res, next) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var phone = req.body.phone;
    var cmnd = req.body.cmnd;
    var email = req.body.email;
    var password = req.body.password;
    var re_password = req.body.repassword;
    var hashed_password = bcrypt.hashSync(password, 10);
    customers.findOne({ 'loginInformation.userName': username }, (err, customerResult) => {
      if (customerResult) {
        req.flash('error', 'Tài khoản đã tồn tại!');
        res.redirect('/sign-up')
      } else if (password != re_password) {
        req.flash('error', 'Mật khẩu không khớp!');
        res.redirect('/sign-up');
      } else {
        var data = {
          'fullNameCustomer': { 'firstName': firstname, 'lastName': lastname },
          'dateOfBirth': null,
          'sex': null,
          'identityCardNumber': cmnd,
          'address': null,
          'phoneNumber': phone,
          'email': email,
          'listProduct': [],
          'listFavorite': [],
          'loginInformation': { 'userName': username, 'password': hashed_password, 'type': 'User', roles: [] },
          'avatar': '/uploads/user-01.png',
          'verified': false,
          'locked': false
        }

        customers.findOne({ 'email': email }, (err, emailDBResult) => {
          // email already exists in database
          if (emailDBResult) {
            console.log("[ERROR] Email has already been used!");
            req.flash('error', 'Email này đã được sử dụng.');
            res.redirect('/sign-up');

            // email doesn't exist in database
          } else {
            // email_exist.check(email, (err, emailExistResult) => {

              // email exists on the internet
              // if (emailExistResult) {

                // == Account registration section start ===========================
                var newUser = new customers(data);
                newUser.save()
                  .then(() => {

                    // Send verification email
                    try {

                      // Generate token
                      const token = jwt.sign(
                        {
                          user: data.loginInformation.userName,
                        },
                        EMAIL_SECRET,
                        {
                          expiresIn: '1d',
                        },
                      );

                      const url = `http://localhost:3000/confirmation/${token}`;

                      var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'johndoe.alexa.19clc5@gmail.com',
                          pass: 'helloiamjohn123'
                        }
                      });

                      var mailOptions = {
                        from: 'johndoe.alexa.19clc5@gmail.com',
                        to: email,
                        subject: 'Kích hoạt tài khoản Amado',
                        html: `Chúc mừng bạn đã đăng ký thành công tài khoản Amado. Kích hoạt tài khoản của bạn <a href="${url}">tại đây</a>`
                      }

                      transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });

                      // render new page
                      req.flash('success', 'Tạo tài khoản thành công!');
                      res.render('confirm', { type: 0, message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error'), email: undefined });
        
                    } catch (e) {
                      console.log(e);
                    }

                  })
                  .catch((err) => {
                    console.log(err);
                    req.flash('error', 'Tạo tài khoản không thành công!');
                    res.redirect('/login');
                  });
                // == Account registration section end =============================

                // email doesn't exist on the internet
              // } else {
              //   console.log("[ERROR] Email doesn't exist!");
              //   req.flash('error', 'Email không tồn tại.');
              //   res.redirect('/sign-up');
              // }

            // });
          }
        });

      }
    });
  }
  getConfirmPage(req, res, next) {
    res.render('confirm', { type: 0, message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error'), email: undefined });
  }
  getForgotPasswordPage(req, res, next) {
    res.render('confirm', { type: 2, message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error'), email: undefined });
  }
  getResetPasswordPage(req, res, next) {
      res.render('confirm', { type: 3, message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error'), email_token: req.params.email_token });
  }
  postResetPassword(req, res, next) {
    var password = req.body.password;
    var repassword = req.body.repassword;
    var email = jwt_decoder(req.body.email).original;

    // check for password matching
    if (password != repassword) {
      req.flash('error', 'Mật khẩu không khớp.');
      res.render('confirm', { type: 3, message: req.flash('error'), email_token: req.body.email, typeMessage: 'error' });
    } else {

      var hashed_password = bcrypt.hashSync(password, 10);

      customers.findOne({ 'email': email}, (err, customerResult) => {
        // email found
        if (customerResult) {
          customers.updateOne(
            { "email": email },
            { $set: { "loginInformation.password": hashed_password } }
            , (err, res) => {
              console.log(res);
            });
            req.flash('success', 'Đặt lại mật khẩu thành công.')
            res.render('loginuser', { 
              message: req.flash('success'), typeMessage: 'success' });
  
        // email not found
        } else {
          req.flash('error', 'Tài khoản chứa email này không tồn tại.');
          res.render('confirm', { type: 2, message: req.flash('error'), email: undefined, typeMessage: 'error' });
        }
      });
    }

  }
  getConfirmEmail(req, res, next) {
    const user = jwt.verify(req.params.token, EMAIL_SECRET);
    customers.updateOne(
      { "loginInformation.userName": user.user },
      { $set: { "verified": true } }
      , (err, res) => {
        console.log(res);
      });
      res.render('confirm', { type: 1, message: req.flash('success').length != 0 ? req.flash('success') : req.flash('error'), email: undefined });
  }
  postSendPasswordEmail(req, res, next) {
    var email = req.body.email;

    const email_token = jwt.sign(
      {
        original: email,
      },
      EMAIL_SECRET,
      {
        expiresIn: '1d',
      },
    );
    
    customers.findOne({ 'email': email}, (err, customerResult) => {

      // email found
      if (customerResult) {
        
        const url = `http://localhost:3000/reset-password/${email_token}`;

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'johndoe.alexa.19clc5@gmail.com',
            pass: 'helloiamjohn123'
          }
        });

        var mailOptions = {
          from: 'johndoe.alexa.19clc5@gmail.com',
          to: email,
          subject: 'Đặt lại mật khẩu Amado',
          html: `Bạn vừa gửi yêu cầu đặt lại mật khẩu. Đặt lại mật khẩu cho tài khoản <a href="${url}">tại đây</a>`
        }
        
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        // render new page
        req.flash('success', 'Đã gửi email đặt lại mật khẩu!');
        res.render('confirm', { type: 2, message: req.flash('success'), email: undefined, typeMessage: 'success' });

      // email not found
      } else {
        req.flash('error', 'Tài khoản chứa email này không tồn tại.');
        res.render('confirm', { type: 2, message: req.flash('error'), email: undefined, typeMessage: 'error' });
      }

    });
  }
  getAddFavorite(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      product.findOne({ _id: id }, (err, productResult) => {
        customers
          .findOneAndUpdate(
            { "loginInformation.userName": user },
            {
              $push: {
                listFavorite: [
                  productResult
                ],
              },
            }
          )
          .then(() => {
            req.flash("success", "Đã thêm vào danh sách yêu thích!");
            res.redirect(`/product/`);
          })
          .catch((err) => {
            console.log(err);
            req.flash("error", "Lỗi khi thêm sản phẩm vào danh sách yêu thích!");
            next();
          });
      });
    } else {
      res.redirect("/login");
    }
  }
  getFavoritePage(req, res, next) {
    var itemsPerPage = 6;
    if (req.isAuthenticated()) {
      customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            res.render("favorites", {
              data: customerResult.listFavorite,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: 1,
              message: req.flash('success'),
              customer: customerResult
            });
          });
        });
      });
    } else {
      res.redirect('/login');
    }
  }
  getFavoriteAtPage(req, res, next) {
    var itemsPerPage = 6;
    var page = req.params.page;
    if (req.isAuthenticated()) {
      customers.findOne({ 'loginInformation.userName': req.session.passport.user.username }, (err, customerResult) => {
        type.find({}, (err, data) => {
          supplier.find({}, (err, supplier) => {
            res.render("favorites", {
              data: customerResult.listFavorite,
              types: data,
              suppliers: supplier,
              itemsPerPage: itemsPerPage,
              currentPage: page,
              message: req.flash('success'),
              customer: customerResult
            });
          });
        });
      });
    } else {
      res.redirect('/login');
    }
  }
  getDeleteFavorite(req, res, next) {
    if (req.isAuthenticated()) {
      var id = req.params.id;
      var user = req.session.passport.user.username;
      customers.updateMany({ 'loginInformation.userName': user }, { $pull: { listFavorite: { _id: OjectId(id) } } })
        .then(() => {
          req.flash("success", "Đã sản phẩm khỏi yêu thích!");
          res.redirect('/favorite');
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    } else {
      res.redirect('/login');
    }
  }

  getOrdersManagerPage(req, res, next) {
    var numberItemPerpage = 6;
    if (req.isAuthenticated()) {
      customers.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        bill.find({userID: customerResult._id}, (err, billResult) => {
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
      res.redirect('/login');
    }
  }
  getOrdersManagerAtPage(req, res, next) {
    var numberItemPerpage = 6;
    var page = req.params.page;
    if (req.isAuthenticated()) {
      customers.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        bill.find({userID: customerResult._id}, (err, billResult) => {
          res.render('orders-manager', {
            customer: customerResult,
            bills: billResult,
            page: page,
            numberItemPerpage: numberItemPerpage,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/login');
    }
  }
  getOrderDetails(req, res, next) {
    var id = req.params.id;
    if (req.isAuthenticated()) {
      customers.findOne({ "loginInformation.userName": req.session.passport.user.username }, (err, customerResult) => {
        bill.findOne({_id: id}, (err, billResult) => {
          res.render('order-details', {
            customer: customerResult,
            bills: billResult,
            message: req.flash("success")
          });
        });
      });
    } else {
      res.redirect('/orders-manager');
    }
  }
}

module.exports = new UserController();