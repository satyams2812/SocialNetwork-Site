const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  username: {
    type: String,
    
  },
  email: {
    type: String,
    
  },
  password: {
    type: String,
    
  },
  avatar: {
    type: String

  },
  gender : {
    type : String,
  },
  location: {
    type: String
  },
  about: {
    type: String,
    default :'This is a nice day'
    
  },
  college :{
         type : String,
  },
  
  followers: Array,
  following: Array
,
  
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('users', UserSchema);

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}