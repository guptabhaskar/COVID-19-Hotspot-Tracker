var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");


//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register",middleware.isLoggedIn, function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", middleware.isLoggedIn, function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to COVID-19 App " + user.username);
           res.redirect("/hotspots"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/hotspots",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
//    req.flash("success", "Logged you out!");
   res.redirect("/");
});



module.exports = router;