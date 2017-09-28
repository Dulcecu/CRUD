/**
 * Created by Lazarus of Bethany on 28/09/2017.
 */
var mongoose = require('mongoose');
var users = mongoose.Schema({
    name: String,
    password: String
});
var User = mongoose.model('users', users);
module.exports = User;