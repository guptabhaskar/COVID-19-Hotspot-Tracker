var express = require("express");
var router  = express.Router();
var Hotspot = require("../models/hotspot");
var middleware = require("../middleware");
var geolib = require('geolib');

//Geocoder
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  // Optional depending on the providers
//   fetch: customFetchImplementation,
  apiKey: process.env.key, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all hotspots
router.get("/", middleware.isLoggedIn, function(req, res){
    // Get all hotspots from DB
    Hotspot.find({}, function(err, allHotspots){
       if(err){
           console.log(err);
       } else {
          res.render("hotspots/index",{hotspots:allHotspots});
       }
    });
});

//CREATE - add new hotspot to DB
router.post("/", function(req, res){
    // get data from form and add to hotspots array
    var name = req.body.name;
    var range = req.body.range;
    var source = req.body.source;
    var result;
    // Using callback
    async function f(){
        await geocoder.geocode(name).then(x=>result=x);
        if(result.length==0)
        {
            req.flash("error", "Enter Valid Address");
            res.redirect("/hotspots/new");
        }
        else
        {
            var newHotspot = {name: name, range: range, latitude: result[0].latitude, longitude: result[0].longitude, timestamp: Date(Date.now()), source: source};
            // Create a new hotspot and save to DB
            Hotspot.create(newHotspot, function(err, newlyCreated){
                if(err){
                    req.flash("error", "Error:"+err);
                    res.redirect("/hotspots/new");
                    // console.log(err);
                } else {
                    //redirect back to hotspots page
                    req.flash("success", "Hotspot successfully added.");
                    res.redirect("/hotspots/new");
                }
            });
        }
    }
    f();
});

//NEW - show form to create new hotspot
router.get("/new",function(req, res){
   res.render("hotspots/new"); 
});

// EDIT HOTSPOT ROUTE
router.get("/:id/edit",middleware.isLoggedIn, function(req, res){
    Hotspot.findById(req.params.id, function(err, foundHotspot){
        res.render("hotspots/edit", {hotspot: foundHotspot});
    });
});

// UPDATE HOTSPOT ROUTE
router.put("/:id",middleware.isLoggedIn, function(req, res){
    // find and update the correct hotspot
    Hotspot.findByIdAndUpdate(req.params.id, req.body.hotspot, function(err, updatedHotspot){
       if(err){
           req.flash("error", "Error:"+err);
           res.redirect("/hotspots");
       } else {
           //redirect somewhere(show page)
           req.flash("success", "Hotspot successfully updated.");
           res.redirect("/hotspots");
       }
    });
});

// DESTROY HOTSPOT ROUTE
router.delete("/:id",middleware.isLoggedIn, function(req, res){
   Hotspot.findByIdAndRemove(req.params.id, function(err){
      if(err){
          req.flash("error", "Error:"+err);
          res.redirect("/hotspots");
      } else {
          req.flash("success", "Hotspot successfully deleted.");
          res.redirect("/hotspots");
      }
   });
});

router.get("/true",function(req, res){
    Hotspot.find({verified:true}, function(err, allHotspots){
        if(err){
            console.log(err);
        } else {
           res.send(allHotspots);
        }
     });
 });

 router.get("/false",function(req, res){
    Hotspot.find({verified:false}, function(err, allHotspots){
        if(err){
            console.log(err);
        } else {
           res.send(allHotspots);
        }
     });
 });

 router.get("/:lat/:long",function(req, res){
    var within5km=[]; 
    Hotspot.find({verified:true}, function(err, allHotspots)
    {
        if(err)
        {
            console.log(err);
        } 
        else 
        {
           allHotspots.forEach(function(hotspot)
           {
                var dist=geolib.getDistance(
                    { latitude: hotspot.latitude, longitude: hotspot.longitude },
                    { latitude: req.params.lat, longitude: req.params.long }
                );
                dist=(dist/1000);
                if(dist<5)
                {
                    within5km.push(hotspot);
                }
           });
           res.send(within5km);
        }
    });
 });

module.exports = router;

