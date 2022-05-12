const client = require('mongodb').MongoClient;
const db_name = "ecommerce";
var url = "mongodb://localhost:27017/" + db_name;
const name = [ "regions", "comments", "admins", "types", "suppliers", "products", "customers", "bills" ];

client.connect(url, (err, db) => {
    if (err) throw err;

    for (let i = 0; i < name.length; i++) {
        dbo = db.db(db_name);
        dbo.createCollection(name[i], (err, res) => {
            const d = require('./Data/' + name[i] + '.json');
            dbo.collection(name[i]).insertMany(d, (err, res) => {
                if (err) throw err;
                console.log(`Migrated collection: '${name[i]}'. Count: ${res.insertedCount}`);
                if (i == name.length - 1) {
                    db.close();
                }
            });

        });
    }
});