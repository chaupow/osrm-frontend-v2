"use strict";

var OSRM = require('osrm-client')
var osrm = new OSRM("//localhost:5000");
var polyline = require('polyline');

// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([52.516628,13.452569], 13);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var route = L.layerGroup().addTo(map);
var currRoute;

// add markers when clicked on map and save them in an array
var markerArray = [];
var markerOptions = {draggable: true};
map.on('click', newMarkerLocs);

function displayRoute(e) {
  var query = [];
  var m;
  for (m = 0; m < markerArray.length; m++) {
    console.log(m);
    query.push([markerArray[m].getLatLng().lat, markerArray[m].getLatLng().lng]);
  }

  osrm.trip({coordinates:query}, function (err, result) {
    if (result != undefined && result.route_geometry != undefined) {
      var roundtrip = polyline.decode(result.route_geometry, 6);
      
      var latlng;
      var lineLatLng = [];
      for (latlng = 0; latlng < roundtrip.length; latlng++) {
        var newLatLng = L.latLng(roundtrip[latlng][0], roundtrip[latlng][1]);
        lineLatLng.push(newLatLng); 
      }
      if (currRoute != undefined) {
        route.removeLayer(currRoute);
      }
      currRoute = L.polyline(lineLatLng);
      route.addLayer(currRoute);

      var p;
      for (p = 0; p < result.loc_permutation.length; p++){
        if (result.loc_permutation[p] == -1) {
          markerArray[p].bindPopup('Couldn\'t find a route to here.').openPopup();
        }
        else {
          markerArray[p].bindPopup('Stop ' + result.loc_permutation[p]);  
        }
      }
    }
    else if (markerArray.length > 1) {
      markerArray[p].bindPopup('Couldn\'t find a route.');  
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
