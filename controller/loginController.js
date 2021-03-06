// import module `user` from `../models/user/user.js`
const db = require('../model/db.js');
const UserModel = require('../model/user/user.js');
const ManagerModel = require('../model/manager/manager.js');
const CardModel = require('../model/user/card.js');
//const PaymentMethodModel = require('../model/user/paymentMethod.js');
const UserPictureModel = require('../model/user/userPicture.js');

// const { render } = require('../routes/routes.js');
// const { findOne } = require('../model/user/user.js');
const bcrypt = require('bcrypt');
const controller = require('../controller/controller.js');

const loginController ={
    getLogin: function (req, res)
    {
        /*if(req.cookies.user)
            req.session.user = req.cookies.user;*/
        //res.redirect('login');
        res.render('login');
    },
    postLogin: function (req, res)
    {
       /*
        UserModel.findOne({username : req.body.username, password: req.body.password}, (err,user)=>{
            if(user)//user means that nasa database siya, !user means opposite
            {
                req.session.user = user
                res.locals.user = user
                console.log(req.session.user.email)
                if(req.body.remember)
                {
                        console.log("remember me!")
                        res.cookie("user", req.session.user,{
                            maxAge:1000*60*60*24*365,
                            httpOnly:true
                        })
                }

            }
            else
            {
                //let username_input = req.body.username.val();
                res.render('login',{error: "error"})
                //res.send("not in database");
            }
        });   */
        var username = req.body.username;
        var password = req.body.password;
        var password2 = req.body.password2;
        console.log("hallo" +" " + username + " " + password + " " + password2)

        if(UserModel.findOne({'username': username}, (err, user)=>{
            console.log("check if user " + user)
            if(user == null){
                if(ManagerModel.findOne({'username': username}, (err, user)=>{
                    console.log("check if manager" + user)
                    if(user == null){
                        console.log("check if manager2")
                        res.render('login', {
                            error: "User not found!"
                        })
                    }
                    else
                    {
                        //check manager password
                        console.log("checking manager password " + user.password + " " + password + " " + password2)
                        try{
                            bcrypt.compare(password, user.password, function(err,result){
                                if(result && (password == password2))
                                {
                                    console.log("passwords match")
                                    if(req.body.remember)
                                     {
                                        console.log("remember me!")
                                        res.cookie("user", req.session.user,{
                                            maxAge:1000*60*60*24*365,
                                            httpOnly:true
                                        })
                                     }
                                    console.log("time to log in")
                                    req.session.user = username
                                    console.log(req.session)
                                    // console.log()
                                    // res.render('index')
                                    // controller.getIndex(req, res)
                                    res.redirect('/')
                                }
                                else
                                {
                                    console.log("passwords do not match")
                                    res.render('login', {error: "Wrong Password"})
                                }
                            })

                        }
                        catch(err)
                        {
                            console.log(err);

                        }
                    }
                }))
                {
                }
            }
            else
            {
                try{
                   // const validPassword = bcrypt.compare(req.body.password, user.password);
                    console.log("checking input and db passwords from users " + user.password + " " + req.body.password)
                    bcrypt.compare(password, user.password, function(err,result){
                        if(result && (password == password2))
                        {
                            console.log("passwords match")
                            if(req.body.remember)
                             {
                                console.log("remember me!")
                                res.cookie("user", req.session.user,{
                                    maxAge:1000*60*60*24*365,
                                    httpOnly:true
                                })
                             }
                            console.log("time to log in")
                            req.session.user = username
                            console.log(req.session)
                           
                            res.redirect('/')
                        }
                        else
                        {
                            console.log("passwords do not match")
                            res.render('login', {error: "Wrong Password"})
                        }
                    })

                }
                catch(err)
                {
                    console.log(err);

                }
            }
            console.log("done checking if user")
        })){
        }
        {}
    },
    getLogout: (req, res) =>{
      if (req.session) {
            req.session.destroy(() => {
              res.clearCookie('connect.sid');
              // go back to index
              res.redirect('/');
            });
        }
    }

}
module.exports = loginController;
