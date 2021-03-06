// controls processes related to movie details
const db = require('../model/db.js');
const LocationModel = require('../model/location/location.js');
const MovieModel = require('../model/location/movie.js');
const ScheduleModel = require('../model/location/schedule.js');
const SeatModel = require('../model/location/seats.js');
const ManagerModel = require('../model/manager/manager.js');
const TimeModel = require('../model/location/time.js');
const MovieFileModel= require('../model/location/movieFile.js');
const BookingModel= require('../model/user/booking.js');
var mongoose = require('mongoose');

const fileUpload = require('express-fileupload');
const path = require('path');

const movieController = {
      /*
          executed when the client sends an HTTP GET request `/movie-details/:movieName`
          as defined in `../routes/routes.js`
      */

      getMovieDetails: function (req, res) {
        var id = req.params.id;

        db.findOne(MovieModel, {_id: id}, {}, async function (result){
          const moviedetails = await result;
          // console.log(moviedetails);

          var movieName = moviedetails.movieName;

          // res.send()
          res.render('movie-details', {title: movieName, moviedetails: moviedetails});
        });

      },



      getMovie: function (req, res) {
        var movie = req.query.movie;
        db.findOne(MovieModel, {movieName: movie}, {}, async function (result){
          const moviedetails = await result;
          console.log(moviedetails);
          res.send({moviedetails: moviedetails});
        });

      },

      getMovieID: function (req, res) {
        var id = req.query.id;
        console.log(id)
        db.findMovieByID(id, function (result){
          const moviedetails = result;
          console.log("movie")
          console.log(moviedetails);
          res.send({moviedetails: moviedetails});
        });

      },

      getSchedule: function (req, res) {
        console.log("getting sched")
        var movieName = req.query.movie;
        console.log(movieName)
        var times;
        var allTime;
        var allCinemas;
        var schedule;

        // get the schedule of the movie
        db.findMovieSched(movieName, async function (result) {
          schedule = await result;
          // console.log("SCHEDULE: " + schedule);
          // get time IDs array
          db.findMany(ScheduleModel, {movieName: movieName}, {timeID: 1, _id:0}, async function (result) {
            times = await result;
            // console.log(times);
            movieController.getTimesDetails(times, function (time_res) {
              allTime = time_res;
              // console.log(typeof allTime)
              // console.log("TIME ARRAY: " + allTime);
              // console.log("length: " + allTime.length);
            });
            // get cinemaIDs array
            db.findMany(ScheduleModel, {movieName: movieName}, {cinemaID: 1, _id:0}, async function (result) {
              cinemas = await result;
              // console.log(cinemas);
              movieController.getCinemaDetails(cinemas, function (cinema_res) {
                allCinemas = cinema_res;
                // console.log("CINEMA ARRAY: " + allCinemas);
                // console.log("length: " + allCinemas.length);
                //
                // console.log(allTime)

                var data = {
                  times: allTime,
                  cinemas: allCinemas,
                  schedule: schedule
                }

                res.send(data);
              });
            });
          });
        });


      },

      getAvailableSeats: function (req, res) {
        var cinemaID = req.query.cinemaID;
        // console.log("in controller");
        // console.log(cinemaID)
        db.findMany(LocationModel, {cinemaID: cinemaID, 'seats.status': 'Available'}, {seatName: 1, _id:0}, async function (result) {
          const availSeats = await result;
          // console.log(availSeats)
        });
        // res.send({cinemaID: cinemaID})
      },

      getCinemaDetails: function (res, callback) {
        var array = [];
        // console.log("temp : " + array);
        return new Promise(resolve =>
        {
          var i = res.length; //get length of time array
          if  (i > 0)
          {
              for (var cinemaID of res)
              {
                  const cinema = cinemaID
                  // console.log(time)
                  db.findCinema(cinema.cinemaID, async function(result)
                  {
                    const fullCinema = result;
                    array.push(fullCinema);
                      i--;
                      if (i <= 0) {
                        return callback(array);
                        resolve();
                      }
                  })
              }
          }
          else resolve();
          });
      },

      getTimesDetails: function (res, callback) {
        var array = [];
        // console.log("temp : " + array);
        return new Promise(resolve =>
        {
          var i = res.length; //get length of time array
          if  (i > 0)
          {
              for (var timeID of res)
              {
                  const time = timeID
                  // console.log(time)
                  db.findTimeSched(time.timeID, async function(result)
                  {
                    const fullTime = result;
                    array.push(fullTime)
                      i--;
                      if (i <= 0) {
                        return callback(array);
                        resolve();
                      }
                  })
              }
          }
          else resolve();
          });
      },

      // check all instances of schedule and if viewingSched is null
      checkScheds: function (req, res) {
          console.log("checking")
          db.findNullViews (function (result) {
            if(result){
              const scheds = result;
              console.log(scheds)

              res.send(scheds)
            }
          });
      },

      // inserts based on cinemaid, adds start/end date/time and seats from passed var
      addViewing: function (req, res) {
        var schedule = req.query.schedule
        var allDates = req.query.allDates
        var allTimes = req.query.allTimes
        var seats = req.query.seats
        // var i = req.query.i

        // console.log("ADDING AT " + i)

        // console.log(schedule)
        for(let i in allDates){
          for(let j in allTimes){
            add(i, j)
          }
        }

        async function add(x, y) {
          const sched = new ScheduleModel({
            cinemaID: schedule.cinemaID,
            movieName: schedule.movieName,
            timeID: schedule.timeID,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            viewingSched: {
              viewDate: allDates[x],
              viewTime: allTimes[y],
            }
          })
          await sched.save();
          // console.log(sched);
          for(let k in seats){
            sched.viewingSched.seats.push(seats[k])
            await sched.save();
          }

          res.end();
        }

        // console.log(allDates)
        // console.log(allTimes)
        // console.log(seats)

        //update views first without seats
        // db.updateOne(ScheduleModel, {cinemaID: cinemaID}, { $set: {} })

      },

      getTimeID: function (req, res) {
        var timeID = req.query.timeID;
        // console.log(timeID)
        db.findTimeID(timeID, function(result) {
            const time = result;
            // console.log(time)
            res.send(time)
        })
      },

      // addNewTime: function (req, res) {
      //   var insert = req.query.newTime
      //   console.log("CREATING")
      //   create()
      //   async function create() {
      //     const time = new TimeModel({
      //       timeID: insert.
      //     })
      //     await time.save();
      //     console.log(time);
      //   }
      //
      // }

      addNewSeat: function (req, res) {
        var insert = req.query.seat
        // console.log("CREATING")
        // console.log(insert)
        // console.log(insert.seatName)
        add()
        async function add() {
          const seat = new SeatModel({
            seatName: insert.seatName,
            status: insert.status
          })
          await seat.save();
          // console.log(seat);
        }
        return seat;
      },

      deleteSched: function (req, res) {
        var id = req.query._id
        db.deleteOne(ScheduleModel, {_id: id}, function (result){
          res.send(result)
        })
      },

      getTimesByDate: function (req, res) {
        var cinemaID = req.query.cinemaID
        var date = req.query.date
        // console.log("GETTING TIME FOR " +cinemaID + " => " + date);
        //same cinemaID with same date as req
        db.findMany(ScheduleModel, {cinemaID: cinemaID, "viewingSched.viewDate": date}, {"viewingSched.viewTime": 1, "viewingSched.viewDate": 1, _id:0}, async function (result) {
          // console.log("success " + date)
          const getting = await result
          // console.log(getting)
        })
        // db.findViewTimes({cinemaID: cinemaID, date:date}, function (result){
        //   res.send(result)
        // })
      },

      bookMovie: function(req, res) {
        var loc = req.params.loc
        var date = req.params.date
        var time = req.params.time
        var id = req.params.id

        console.log(date + " on " + time)

        res.render('booking', {id: id,date: date, time: time, location: loc})
      },

      // setBooking: function(req, res) {
      //   var id = req.query.id
      //   var date = req.query.date
      //   var time = req.query.time
      //
      //   console.log(date)
      //   console.log(time)
      //   res.send({id: id, date: date, time: time})
      //   // res.redirect('/movie-details/'+id+'/booking?id=' + id +'&date=' + date + '&time=' + time);
      //   // res.redirect('booking', {id: id, date: date, time: time})
      // }

      checkOut: function (req, res) {
        var id = req.params.id
        var schedID = req.params.sid
        var locID = req.params.cid
        var seats = req.params.seats

        var selected = seats

        db.findOne(LocationModel, {_id: locID}, {}, async function(result) {
          const cinema = await result
          console.log(cinema)
          db.findOne(ScheduleModel, {'viewingSched._id': schedID}, {}, async function(result) {
            const sched = await result
            console.log(sched)
            const viewing = sched.viewingSched
            // console.log(sched.viewDate)
            const date = new Date(viewing.viewDate)
            const viewDate = date.toLocaleString('en-us',{month:'long'}) + " " + date.getDate() + ", " + date.getFullYear()
            console.log(viewDate)
            const time = viewing.viewTime
            const viewTime = time.hour + ":" + time.minute + " " + time.period;
            console.log(viewTime)

            var schedule = {
              id: sched._id,
              movieName: sched.movieName,
              date: viewDate,
              time: viewTime,
              location: cinema.location,
              cinemaNum: cinema.cinemaNum,
              vewingID: sched.viewingSched._id
            }
            console.log(selected)
            const seat = selected.split(",");
            console.log(seat)

            db.findOne(MovieModel, {_id: id}, {}, function (result) {
              const movie = result
              console.log(movie)

              var seats = {
                  seat1: seat[0],
                  seat2: seat[1],
                  seat3: seat[2],
                  price: movie.price
              }

              res.render('checkout', {schedule, seats})
            })




          })
        })

        // res.send("success")
        // id,sid,cid,seats
        // res.render('checkout' )
      },

      paidBooking: function(req, res) {
        var viewID = req.query.viewID;
        var schedID = req.query.schedID;
        var seats = req.query.seats;
        var total = req.query.total;
        var username = req.session.user;

        db.createBooking(username, schedID, viewID, seats, total, function (result){
          if (result){
            console.log(req.session.user + " is booking")
            db.updateSeats(viewID, seats, 'Unavailable', function(result) {
              // console.log(result)
              if(result){
                console.log("updated status of seats")
                res.send(true)
              }
              else{
                console.log("no update")
                // res.send(false)
              }
            })
          }
          else{
            console.log("not booked")
            res.send(false)
          }
        })
      },

      movieRedirect: function(req, res) {
        var id = req.params.id;
        res.redirect('/movie-details/' + id)
      },


      editMovie: function(req, res) {
        var username = req.session.user;
        var movieName = req.params.movie;

        MovieModel.findOne({'movieName': movieName}, (err, movie)=>{
          var moviePoster = movie.moviePoster;
          var movieBanner = movie.movieBanner;
          var movieGenre1 = movie.movieGenre1;
          var movieGenre2 = movie.movieGenre2;
          var movieGenre3 = movie.movieGenre3;
          var movieSynopsis = movie.movieSynopsis;
          var movieDirector = movie.movieDirector;
          var movieCast = movie.movieCast;
          var movieTrailer = movie.movieTrailer;
          var status = movie.status;
          var locations = movie.locations;
          var price = movie.price;

          var newmovieName = req.body.movieName;
          var newmoviePoster = req.body.moviePoster;
          var newmovieBanner = req.body.movieBanner;
          var genre1 = req.body.genre1;
          var genre2 = req.body.genre2;
          var genre3 = req.body.genre3;
          var genre4 = req.body.genre4;
          var genre5 = req.body.genre5;
          var genre6 = req.body.genre6;
          var genre7 = req.body.genre7;
          var newmovieSynopsis = req.body.movieSynopsis;
          var newmovieDirector = req.body.movieDirector;
          var newmovieCast = req.body.movieCast;
          var newmovieTrailer = req.body.movieTrailer;
          var newstatus = req.body.status;
          var newprice = req.body.price;

          if(newmovieName != ''){
            movie.movieName = newmovieName;
          }
          if(newmoviePoster != ''){
            MovieModel.findOne({'email': email}, (err, movie2)=>{
              if(movie2 == null){
                moviePoster = newmoviePoster;
              }
              else{
                  res.render('managerEditMoviesPage', {
                  error: "This is a different movie's poster"
                  })
              }
          })
          }
          if(newmovieBanner != ''){
            MovieModel.findOne({'email': email}, (err, movie2)=>{
              if(movie2 == null){
                movieBanner = newmovieBanner;
              }
              else{
                  res.render('managerEditMoviesPage', {
                  error: "This is a different movie's banner"
                  })
              }
          })
          }

          if(genre1=="Animation"){
            movieGenre1 = genre1;
          }
          if(genre2=="Adventure"){
            if(movieGenre1 == ""){
              movieGenre1 = genre2;
            }
            else{
              movieGenre2 = genre2;
            }
          }
          if(genre3=="Action"){
            if(movieGenre1 == ""){
              movieGenre1 = genre3;
            }
            if(movieGenre2 == ""){
              movieGenre2 = genre3;
            }
            else{
              movieGenre3 = genre3;
            }
          }
          if(genre4=="Comedy"){
            if(movieGenre1 == ""){
              movieGenre1 == genre4;
            }
            if(movieGenre2 == ""){
              movieGenre2 = genre4;
            }
            else{
              movieGenre3 = genre4;
            }
          }
          if(genre5=="Drama"){
            if(movieGenre1 == ""){
              movieGenre1 = genre5;
            }
            if(movieGenre2 == ""){
              movieGenre2 = genre5;
            }
            else{
              movieGenre3 = genre5;
            }
          }
          if(genre6=="Fantasy"){
            if(movieGenre1 == ""){
              movieGenre1 = genre6;
            }
            if(movieGenre2 == ""){
              movieGenre2 = genre6;
            }
            else{
              movieGenre3 = genre6;
            }
          }
          if(genre7=="Romance"){
            if(movieGenre1 == ""){
              movieGenre1 = genre7;
            }
            if(movieGenre2 == ""){
              movieGenre2 = genre7;
            }
            else{
              movieGenre3 = genre7;
            }
          }

          if(newmovieSynopsis != ''){
            movieSynopsis = newmovieSynopsis;
          }
          if(newmovieDirector != ''){
            movieDirector = newmovieDirector;
          }
          if(newmovieCast != ''){
            movieCast = newmovieCast;
          }
          if(newmovieTrailer != ''){
            movieTrailer = newmovieTrailer;
          }
          if(newstatus != ''){
            status = newstatus;
          }
          if(newprice != ''){
            price = newprice;
          }

          let edited = MovieModel({
            _id: movie._id,
            movieName: movieName,
            moviePoster: moviePoster,
            movieBanner: movieBanner,
            movieGenre1: movieGenre1,
            movieGenre2: movieGenre2,
            movieGenre3: movieGenre3,
            movieSynopsis: movieSynopsis,
            movieDirector: movieDirector,
            movieCast: movieCast,
            movieTrailer: movieTrailer,
            locations: locations,
            price: price
          })

          MovieModel.updateOne(movie, edited, function(err,result) {
            res.redirect("/editmovies")
          });
        })
      },
      addMovie: function(req, res) {
        var username = req.session.user;

        var movieName = req.body.movieName;
        var moviePoster = req.body.moviePoster;
        var movieBanner = req.body.movieBanner;
        var genre1 = req.body.genre1;
        var genre2 = req.body.genre2;
        var genre3 = req.body.genre3;
        var genre4 = req.body.genre4;
        var genre5 = req.body.genre5;
        var genre6 = req.body.genre6;
        var genre7 = req.body.genre7;
        var movieSynopsis = req.body.movieSynopsis;
        var movieDirector = req.body.movieDirector;
        var movieCast = req.body.movieCast;
        var movieTrailer = req.body.movieTrailer;
        var price = req.body.price;
        var locations = req.body.location;
        var movieGenre1 = "";
        var movieGenre2 = "";
        var movieGenre3 = "";


        MovieModel.findOne({'movieName': movieName}, (err,mov)=>{
          if(mov = null || mov == undefined){
            let count = 0;

            if(genre1=="Animation"){
              movieGenre1 = genre1;
            }
            if(genre2=="Adventure"){
              if(movieGenre1 == ""){
                movieGenre1 = genre2;
              }
              else{
                movieGenre2 = genre2;
              }
            }
            if(genre3=="Action"){
              if(movieGenre1 == ""){
                movieGenre1 = genre3;
              }
              if(movieGenre2 == ""){
                movieGenre2 = genre3;
              }
              else{
                movieGenre3 = genre3;
              }
            }
            if(genre4=="Comedy"){
              if(movieGenre1 == ""){
                movieGenre1 == genre4;
              }
              if(movieGenre2 == ""){
                movieGenre2 = genre4;
              }
              else{
                movieGenre3 = genre4;
              }
            }
            if(genre5=="Drama"){
              if(movieGenre1 == ""){
                movieGenre1 = genre5;
              }
              if(movieGenre2 == ""){
                movieGenre2 = genre5;
              }
              else{
                movieGenre3 = genre5;
              }
            }
            if(genre6=="Fantasy"){
              if(movieGenre1 == ""){
                movieGenre1 = genre6;
              }
              if(movieGenre2 == ""){
                movieGenre2 = genre6;
              }
              else{
                movieGenre3 = genre6;
              }
            }
            if(genre7=="Romance"){
              if(movieGenre1 == ""){
                movieGenre1 = genre7;
              }
              if(movieGenre2 == ""){
                movieGenre2 = genre7;
              }
              else{
                movieGenre3 = genre7;
              }
            }

            if (!req.files){
              console.log("no pic")
            }
            else{
              const poster = req.files.moviePoster
              const banner = req.files.movieBanner
              moviePoster = poster.name
              movieBanner = banner.name
              console.log(poster)
              console.log(banner)
              poster.mv(path.resolve(__dirname+'/..','public/images', poster.name));
              banner.mv(path.resolve(__dirname+'/..','public/images/banners', banner.name));
            }

            let movie = new MovieModel({
              _id: new mongoose.Types.ObjectId(),
              movieName: movieName,
              moviePoster: moviePoster,
              movieBanner: movieBanner,
              movieGenre1: movieGenre1,
              movieGenre2: movieGenre2,
              movieGenre3: movieGenre3,
              movieSynopsis: movieSynopsis,
              movieDirector: movieDirector,
              movieCast: movieCast,
              movieTrailer: movieTrailer,
              locations: [locations],
              price: price
            })

            console.log(movie);

            movie.save(function(err){
              if (err){
                console.log(err)
                ManagerModel.findOne({'username': username}, (err, user)=>{
                  var managerlocation = user.location;
                  db.findMovieByLocation(managerlocation, function(movies){
                      LocationModel.findOne({'location': managerlocation}, (err, location)=>{
                          res.render('managerEditCinema', {
                          managerMovieOptions: movies,
                          managerCinemaOptions: location,
                          user: user,
                          error: "Error: ${err}"
                        });
                      })
                  });
                });
              }
              else{
                ManagerModel.findOne({'username': username}, (err, user)=>{
                  var managerlocation = user.location;
                  db.findMovieByLocation(managerlocation, function(movies){
                      LocationModel.findOne({'location': managerlocation}, (err, location)=>{
                          res.render('managerEditCinema', {
                          managerMovieOptions: movies,
                          managerCinemaOptions: location,
                          user: user
                        });
                      })
                  });
                });
              }
            })
          }
        })
      },
      editCinema: function(req, res){

      },
      searchMovies: (req,res)=>{
        let search = new RegExp (req.body.search, 'gi');

        MovieModel.aggregate([{$match: {movieName: search}}], (err, movies)=>{
            console.log(movies)
            if (movies.length == 0){
              res.render('search-results', {
                  movies: movies,
                  text:  'No current movies containing "' + req.body.search +'" were found'
              })
            }
            else{
                res.render('search-results', {
                    movies: movies,
                    text:  'Results for current movies containing "' + req.body.search +'" were found'
                })
            }
        })
    },
}

module.exports = movieController;
