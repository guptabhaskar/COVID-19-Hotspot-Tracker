var modal1=document.getElementById("modal1");
var modal2=document.getElementById("modal2");
var ContainmentZones = document.getElementById("ContainmentZones");
var current=document.getElementById("current");
var button=document.getElementById("submit");

var map, infoWindow;

var geocoder;
var circles=[];
var markers=[];
function init() 
{
  	geocoder = new google.maps.Geocoder();
  	button.onclick=function() 
  	{
    	geocodeAddress(geocoder);
  	};
  	map = new google.maps.Map(document.getElementById('map'), 
  	{
  		center: {lat: 28.6139, lng: 77.2090},
  		zoom: 8
	});
	infoWindow = new google.maps.InfoWindow;
}

function addCircle(latitude,longitude,range)
{
	var pos = {
	          	lat: Number(latitude),
	          	lng: Number(longitude)
			};
	range=Number(range)*1000;
	var cityCircle = new google.maps.Circle({
            					strokeColor: '#FF0000',
						        strokeOpacity: 0.8,
						        strokeWeight: 2,
						        fillColor: '#FF0000',
						        fillOpacity: 0.35,
						        map: map,
						        center: pos,
						        radius: range
          						});
	circles.push(cityCircle);
}

var latitude;
var longitude;

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getLatLng);
	} else {
		x.innerHTML = "Geolocation is not supported by this browser.";
	}
}

function getLatLng(position) {
	latitude=position.coords.latitude;
	longitude=position.coords.longitude;
	findContainment(latitude,longitude);
}

function findContainment(latitude,longitude) {
	var apiurl="./hotspots/"+latitude+"/"+longitude;

	var pos = {
          lat: latitude,
          lng: longitude
        	};
    DeleteMarkers();
    map.setCenter(pos);
    map.setZoom(13);
	var marker = new google.maps.Marker({
			position: pos,
			map: map,
			title:'Your Address'
			});
	markers.push(marker); 
	axios.get(apiurl).then((response) => {
		const data = response.data;
	          if(data.length>0){
	          	nearContainmentZone(data);
	          }
	          else{
	          	notNearContainmentZone();
	          }
	});
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
	                      'Error: The Geolocation service failed.' :
	                      'Error: Your browser doesn\'t support geolocation.');
	infoWindow.open(map);
}

function nearContainmentZone(data){
	ContainmentZones.innerHTML="";
	data.forEach(function(zone){
		ContainmentZones.innerHTML+="<li>"+zone.name+"</li>";
		addCircle(zone.latitude,zone.longitude,zone.range);
	});
	$("#modal1").modal();
}

function notNearContainmentZone(){
	$("#modal2").modal();
}

current.onclick=function(){
	getLocation();
}

function geocodeAddress(geocoder) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
    	// console.log("Results",results);
    	if(results.length==0)
	    {
	        alert("Address not found.")
	    }
	    else
	    {
	      	latitude=results[0].geometry.location.lat();
			longitude=results[0].geometry.location.lng();
	      	findContainment(latitude,longitude);
	    }
    } 
    else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function DeleteMarkers() {
    //Loop through all the markers and remove
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    for (var i = 0; i < circles.length; i++) {
        circles[i].setMap(null);
    }
    circles = [];
};

