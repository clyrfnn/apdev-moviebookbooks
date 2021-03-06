const mongoose = require('mongoose');
//const internal = require('stream');
const bcrypt = require('bcrypt');
let SALT = 10;

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Female','Male','Non-Binary'],
        required: true,
    },
    birthday: {
        type: Date,
        required: true
    },
    contactNum: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 6,
        required: true,
        unique: true
    },
    picture: {
        type: String,
        required: true,
        unique: true
    }
});
userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(SALT, (err, salt)=>{
            if(err) return next(err)

            bcrypt.hash(user.password, salt, (err, hash)=>{
                if(err) return next(err)
                user.password = hash;
                next();
            })
        })
    }
    else{
        next();
    }
})

userSchema.methods.comparePassword = function(possiblePassword, checkpassword){
    bcrypt.compare(possiblePassword, this.password, (err, isMatch)=>{
        if(err) return checkpassword(err)
        checkpassword(null, isMatch)
    })
}

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;
