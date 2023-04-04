import { context } from "./context.js";
import { createPopUp } from "./popup.js";
import { stylesArray } from "./stylesArray.js";

function drawMap() {
  console.log("Hello from the other side")
  context.map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.350, lng: -6.260 },
    zoom: 14,
    styles: stylesArray,
  })

  // This will call the function that executes the get request, wait for the stations to load, and then call the create markers function with the loaded stations
  fetch("/getStations")
    .then((response) => response.json())
    .then((stations) => createMarkers(stations));

}

function createMarkers(stations) { // Function to create a marker for each station and add it to the map
  for (let station of stations) { // For each station in the stations list, create a new marker
    var marker = new google.maps.Marker({
      position: { lat: station.position_lat, lng: station.position_lng },
      map: context.map,
      title: station.name,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 8,
        fillColor: availabilityColor(station), // Set the fill color to blue
        fillOpacity: 1,
        strokeWeight: 0
      }
    });
    marker.setMap(context.map);
    addMarkerListener(marker, station);
  };
}

function availabilityColor(station){

  // let value = parseInt(station.bikes) / (parseInt(station.bikes) + parseInt(station.bike_stands));
  console.log(station);
  // let hue = ((1-value)*120).toString(10);
  // console.log("hi colors");
  // console.log("value: " + value + " hue: " + hue);
  // return ["hsl(",hue,",100%,50%)"].join("");
  return "#0000FF"
}

function addMarkerListener(marker, station) {
  marker.addListener("click", function () {
    getLiveBikeData(marker, station)
  });
}

function getLiveBikeData(marker, station) {
  fetch("/getLiveBikeData/" + station.id)
    .then((response) => response.json())
    .then((stationAvailability) => createPopUp(marker, stationAvailability))
}

export {drawMap};