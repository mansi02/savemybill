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
    .then(() => console.log("DB server connected categorydb"))
    .catch(e => console.log("DB error categorydb", e));
var conn = mongoose.connection;

var schema = new mongoose.Schema({
    CategoryName:{
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    Date:{
        type:Date,
        default:Date.now
    }

});

var categorydb = mongoose.model('Categories', schema);
module.exports = categorydb;