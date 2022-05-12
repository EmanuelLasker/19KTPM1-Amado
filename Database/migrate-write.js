const client = require('mongodb').MongoClient;
const fs = require('fs');
const db_name = "ecommerce";
var url = "mongodb://localhost:27017/" + db_name;
const name = [ "regions", "comments", "admins", "types", "suppliers", "products", "customers", "bills" ];

client.connect(url, (err, db) => {
    if (err) throw err;

    for (let i = 3; i < name.length - 1; i++) {
        dbo = db.db(db_name);
        
            
        // write new ids
        if (i >= 3 && i <= 6) {
            dbo.collection(name[i]).find().toArray((err, res) => {
                if (err) throw err;

                var id_new = "";
                res.forEach(element => {
                    id_new += element._id.toString() + "\n";
                });
                fs.writeFile("./Id/" + name[i] + "_new_id.txt", id_new, err => {
                    if (err) throw err;
                });
                if (i == 6) {
                    db.close();
                }
            });
        }

    }
});