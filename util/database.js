'use strict';

const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    // the connection returns a Promise
    MongoClient
        .connect(
            "mongodb+srv://himelMazumder:v43Sp6Y4qJWswrFT@cluster0.tduuh.mongodb.net/node_test?retryWrites=true&w=majority&appName=Cluster0"
        )
        .then(client => {
            console.log("successfully connected");
            _db = client.db();

            callback();
        })
        .catch(err => {
            console.log(err); 
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw "database not found!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;