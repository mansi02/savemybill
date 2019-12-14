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
    .then(() => console.log("DB server connected users"))
    .catch(e => console.log("DB error users", e));
var conn = mongoose.connection;

var schma = new mongoose.Schema({
    Username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    Email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    Password: {
        type: String,
        required: true,
    },
    Date:{
        type:Date,
        default:Date.now
    }

});

var usermodel = mongoose.model('Userdata', schma);
module.exports = usermodel;