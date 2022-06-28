/*
contains necessary callback functions to be called for a given client request related to index.hbs
*/
// import module `location` from `../models/location/location.js`
const LocationModel = require('../model/location/location.js');
const MovieModel = require('../model/location/movie.js');
const ScheduleModel = require('../model/location/schedule.js');
const SeatModel = require('../model/location/seats.js');
const TimeModel = require('../model/location/time.js');
const MovieFileModel= require('../model/location/movieFile.js');

// import module `user` from `../models/user/user.js`
const UserModel = require('../model/user/user.js');
const BookingModel = require('../model/user/booking.js');
const CardModel = require('../model/user/card.js');
const PaymentMethodModel = require('../model/user/paymentMethod.js');
const UserPictureModel = require('../model/user/userPicture.js');

// import module `manager` from `../models/manager.js`
const ManagerModel = require('../model/manager/manager.js');
const ManagerPictureModel = require('../model/manager/managerPicture.js');

/*
POSSIBLE FUNCTIONS FOR THE CONTROLLER
addMovie, deleteMovie, editUser, editManager, postLogin, postRegister
searchMovie, editMovie, getProfile(?), bookMovie, deleteBooking, submitMovie, logIN, logOut
*/

const controller = {

    /*
       executed when the client sends an HTTP GET request `/`
       as defined in `../routes/routes.js`
   */
       getIndex: function (req, res)
       {

           // render `../views/index.hbs`
           /*
           */
           /* //remove comment later
           if(req.cookies.user){
               req.session.user = req.cookies.user;
           }*/
           res.render('index');
       },
       getRegister: (req, res)=>//for sign up
       {
           if(req.cookies.user){
               req.session.user = req.cookies.user;
           }
           if(req.session.user)
                res.render('registration', {user: req.session.user});
           else
                res.render('registratoin');
       },
       getRegDetails: (req,res)=>
       {
           //use this to get the details from registering
           //INCOMPLETE
           if(req.cookies.user)
               req.session.user = req.cookies.user;
       },
       getLogin: (req, res)=>
       {
            if(req.cookies.user)
               req.session.user = req.cookies.user;
            if(req.session.user)
                res.render('login', {user: req.session.user});
            else
                res.render('login');
       },
       getMovieDetails: (req, res)=> //not sure if async or not
       {
           if(req.cookies.user)
               req.session.user = req.cookies.user;
            //do smth to render the movie details page that the user wants to see
            //hmm how 
            await MovieModel.findById(req.params.MovieName), (function(err, movie){//not sure pa if to use findbyId or findOne and if tama si params.MovieName or _id
                res.render('movie-details')//edit this bc idk how to specify which details are needed
                //hala do i include ScheduleModel pa for the schedule ahgjkl
            })
       },
       getAllLoc: (req, res)=>
       {
        if(req.cookies.user)
             req.session.user = req.cookies.user;
        res.render('all_locations');
       },
       getMoviesPerLoc: (req, res)=>
       {
        if(req.cookies.user)
            req.session.user = req.cookies.user;
       },
       postLogin: (req, res)=>
       {
           UserModel.findOne({'email': req.body.email}, (err, user)=>{
               if(!user){
                   res.render('login', {
                       error: "User not found"
                   })
               }else{
                   user.comparePassword(req.body.password, (err, isMatch)=>{
                       if(!isMatch){
                           res.render('login', {
                               error: "Wrong password"
                           })
                       }
                       else{
                           req.session.user = user
                           res.locals.user = user
                           if(req.body.remember){
                               res.cookie("user", req.session.user,{
                                   maxAge:1000*60*60*24*365,
                                   httpOnly:true
                               })
                           }
                           //unsure what to render here

                       }
                   })
               }
           })
       },
       getAboutUs: (req, res)=>{
           if(req.cookies.user)
               req.session.user = req.cookies.user;
           res.render('about_us');
       },

       bookMovie: (req, res)=>
       {
       //this might be under user pala
       },

       /*
           allows manager to submit a new movie
       */
       submitMovie: (req, res)=>
       {

       },

}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;
