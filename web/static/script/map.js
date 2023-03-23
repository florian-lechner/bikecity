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
      animation: google.maps.Animation.DROP
    });
    marker.setMap(context.map);
    addMarkerListener(marker, station);
  };
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