const client = require('mongodb').MongoClient;
const fs = require('fs');
const db_name = "ecommerce";
var url = "mongodb://localhost:27017/" + db_name;
const name = [ "regions", "comments", "admins", "types", "suppliers", "products", "customers", "bills" ];

client.connect(url, (err, db) => {
    if (err) throw err;

    for (let i = 5; i < name.length; i++) {
        dbo = db.db(db_name);
        switch (i) {
            case 5:
                var types_id_new = fs.readFileSync("./Id/types_new_id.txt").toString().split("\n");
                var types_id_old = fs.readFileSync("./Id/types_old_id.txt").toString().split("\r\n");
                var suppliers_id_new = fs.readFileSync("./Id/suppliers_new_id.txt").toString().split("\n");
                var suppliers_id_old = fs.readFileSync("./Id/suppliers_old_id.txt").toString().split("\r\n");
                for (let j = 0; j < types_id_old.length; j++) {
                    dbo.collection(name[i]).updateMany({"description.typeCode": types_id_old[j]}, 
                        {$set: {"description.typeCode": types_id_new[j]}}, (err, res) => {
                            if (err) throw err;
                    });
                }
                for (let j = 0; j < suppliers_id_old.length; j++) {
                    dbo.collection(name[i]).updateMany({"description.supplierCode": suppliers_id_old[j]}, 
                        {$set: {"description.supplierCode": suppliers_id_new[j]}}, (err, res) => {
                            if (err) throw err;
                    });
                }
                break;
            case 6:
                var products_id_new = fs.readFileSync("./Id/products_new_id.txt").toString().split("\n");
                var products_id_old = fs.readFileSync("./Id/products_old_id.txt").toString().split("\r\n");
                for (let j = 0; j < products_id_old.length; j++) {
                    dbo.collection(name[i]).updateMany({"listProduct.productID": products_id_old[j]}, 
                        {$set: {"listProduct.$[].productID": products_id_new[j]}}, (err, res) => {
                            if (err) throw err;
                    });
                }
                break;
            case 7:
                var products_id_new = fs.readFileSync("./Id/products_new_id.txt").toString().split("\n");
                var products_id_old = fs.readFileSync("./Id/products_old_id.txt").toString().split("\r\n");
                for (let j = 0; j < products_id_old.length; j++) {
                    dbo.collection(name[i]).updateMany({"listProduct.productID": products_id_old[j]}, 
                        {$set: {"listProduct.$[].productID": products_id_new[j]}}, (err, res) => {
                            if (err) throw err;
                    });
                }
                var customers_id_new = fs.readFileSync("./Id/customers_new_id.txt").toString().split("\n");
                var customers_id_old = fs.readFileSync("./Id/customers_old_id.txt").toString().split("\r\n");
                for (let j = 0; j < customers_id_old.length; j++) {
                    dbo.collection(name[i]).updateMany({userID: customers_id_old[j]}, 
                        {$set: {userID: customers_id_new[j]}}, (err, res) => {
                            if (err) throw err;
                            if (j == customers_id_old.length - 1) {
                                db.close();
                            }
                    });
                }
                break;
        }
    }
});