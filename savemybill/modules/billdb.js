const mongoose = require('Mongoose');
const mongodb = require('Mongodb').MongoClient;
const connectionString = 'mongodb+srv://Mansi:mansi123@cluster0-8zqjv.mongodb.net/savemybill?retryWrites=true&w=majority';
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    // socketTimeoutMS: 30000,
    // keepAlive: true,
    // reconnectTries: 30000
};
mongoose.connect(connectionString, options)
    .then(() => console.log("DB server connected billdb"))
    .catch(e => console.log("DB error billdb", e));
var conn = mongoose.connection;
var schema = new mongoose.Schema({
    CategoryName:{
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    BillDetails:{
        type: String,
        required: true,
    },
    Image:{
        type: String,
    },
    Date:{
        type:Date,
        default:Date.now
    }

});

var billdb = mongoose.model('Bills', schema);
module.exports = billdb;