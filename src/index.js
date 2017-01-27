var mapboxgl = require('mapbox-gl');
var request = require('request');

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhdXBvdyIsImEiOiJZX29XRnNFIn0.5eui1ITuIWOxZdPyF0kWTA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v9', //hosted style id
  //center: [135.768, 35.0116], // starting position
  center: [7.439641,43.746728], // starting position
  zoom: 13 // starting zoom
});




map.on('load', function () {
  map.addSource('roundtrip', {
    type: 'geojson',
    data: {
       "type": "FeatureCollection",
       "features": []
    }
  });
});


var pizzeria = new mapboxgl.Popup({closeOnClick: false, closeButton: false})
  //.setLngLat([135.768, 35.0116])
  .setLngLat([7.439641,43.746728])
  .setHTML('🍕')
  .addTo(map);

var deliveries = [];


// add onClick event
map.on('click', addDelivery);
function addDelivery(e) {
  var popup = new mapboxgl.Popup({closeOnClick: false})
  .setLngLat(e.lngLat)
  .setHTML('🏡')
  .addTo(map);
  deliveries.push(popup);

  popup.on('close', closePopup);

  displayTrip()
}

function displayTrip() {
  //var url = 'https://router.project-osrm.org/trip/v1/driving/';
  var url = 'http://localhost:8080/trip/v1/mapbox/driving/';
  url += deliveriesLngLat() + '?geometries=geojson&access_token=pk.eyJ1IjoiZnJlZW5lcmQ5IiwiYSI6ImNpcHBjbWd2bDAwMG9kZmtzMmU5MXhmNHkifQ._1rzNzfq83Nx-h2IYiu0WQ';
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      result = JSON.parse(body);
      for (t = 0; t < result.trips.length; t++) {
        map.getSource('roundtrip').setData({
          "type": "FeatureCollection",
          "features": [{
              "type": "Feature",
              "properties": {},
              "geometry": result.trips[t].geometry
          }]
        });
        map.addLayer({
            'id': 'roundtrip',
            'type': 'line',
            'source': 'roundtrip',
            "layout": {
              "line-join": "round",
              "line-cap": "round"
            },
            "paint": {
              "line-color": "#60BAD9",
              "line-width": 4
            }
        });
      }
    }
  })
}

// YES, I am abusing popups. I'm sorry. Marker seem non-intuitive and I'm too tired to look at them.
// @TODO clean this up some day
function closePopup(p) {
  for (var i = 0, len = deliveries.length; i < len; i++) {
    if (!deliveries[i].isOpen()) {
      deliveries.splice(i, 1)[0].remove();
      break;
    }
  }
  displayTrip();
}

function deliveriesLngLat() {
  var lng_lat_string = pizzeria.getLngLat().lng + "," + pizzeria.getLngLat().lat;
  for (var i = 0, len = deliveries.length; i < len; i++) {
    lng_lat_string = lng_lat_string + ";" + deliveries[i].getLngLat().lng + "," + deliveries[i].getLngLat().lat;
  }
  return lng_lat_string;
}


