var mongoose = require("mongoose");

var hotspotSchema = new mongoose.Schema({
   name: String,
   range: String,
   latitude: String,
   longitude: String,
   verified:{
      type: Boolean,
      default: false
   },
   source: String,
   timestamp: Date
});

module.exports = mongoose.model("Hotspot", hotspotSchema);