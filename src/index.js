"use strict";

var OSRM = require('osrm-client')
var osrm = new OSRM("//localhost:5000");
var polyline = require('polyline');

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([-17.486068, 178.159672], 9);

// add an OpenStreetMap tile layer


// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY2hhdXBvdyIsImEiOiJkZDU1ZjAyM2I5ZGRjNGY2MmY0MTcyZjA1NmEwZjBjOSJ9.qxMtsqJFLAAgEVuz6gLahg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'chaupow.n7cd4clk',
    accessToken: 'pk.eyJ1IjoiY2hhdXBvdyIsImEiOiJkZDU1ZjAyM2I5ZGRjNGY2MmY0MTcyZjA1NmEwZjBjOSJ9.qxMtsqJFLAAgEVuz6gLahg'
}).addTo(map);

var route = L.layerGroup().addTo(map);
var currRoute = [];

// add markers when clicked on map and save them in an array
var markerArray = [];
var markerOptions = {draggable: true};
map.on('click', newMarkerLocs);

function displayRoute(e) {
  var query = [];
  var m;
  for (m = 0; m < markerArray.length; m++) {
    query.push([markerArray[m].getLatLng().lat, markerArray[m].getLatLng().lng]);
  }

  osrm.trip({coordinates:query}, function (err, result) {
    if (result != undefined && result.trips != undefined) {
      var i;
      for (i = 0; i < currRoute.length; ++i) {
        route.removeLayer(currRoute[i]);
      }
      currRoute = [];
      console.log(result);
      var t;
      for (t = 0; t < result.trips.length; t++) {
        console.log("trips.length " + i);
        if (result.trips[t].route_geometry != undefined) {
          var roundtrip = polyline.decode(result.trips[t].route_geometry, 6);

          var latlng;
          var lineLatLng = [];
          for (latlng = 0; latlng < roundtrip.length; latlng++) {
            var newLatLng = L.latLng(roundtrip[latlng][0], roundtrip[latlng][1]);
            lineLatLng.push(newLatLng);
          }
          currRoute.push(L.polyline(lineLatLng));

          var p;
          for (p = 0; p < result.trips[t].permutation.length; p++){
            markerArray[result.trips[t].permutation[p]].bindPopup('Stop ' + p);
          }
        }
      }
      for (i = 0; i < currRoute.length; ++i) {
        route.addLayer(currRoute[i]);
      }
    }
  });
};

function newMarkerLocs(e) {
  var newMarker = L.marker(e.latlng, markerOptions);
  newMarker.addTo(map);
  markerArray.push(newMarker);
  displayRoute(e);
  newMarker.on('dragend', displayRoute);
};
