var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique:true
    },
    userName: {
        type: String,
        required: true,
        unique:true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    passWord:{
        type: String,
        required: true
    },
    createdDate:{
        type: Date
    },
    institute:{
        type: String
    },
    counter:{
        type: Number
    }

});

module.exports = mongoose.model('users', userSchema);
