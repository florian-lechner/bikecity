import { context } from "./context.js";
import { createPopUp } from "./popup.js";
import { stylesArray } from "./stylesArray.js";

function drawMap() {
  context.map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3468, lng: -6.2913 },
    zoom: 14,
    styles: stylesArray,
    disableDefaultUI: true
  })

  // This will call the function that executes the get request, wait for the stations to load, and then call the create markers function with the loaded stations
  fetch("/getStations")
    .then((response) => response.json())
    .then((stations) => createMarkers(stations));

}

function createMarkers(stations) { // Function to create a marker for each station and add it to the map
  console.log("Creating markers...")
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
        strokeWeight: 1,
      },
      //label: station.bikes.toString()
    });
    context.markers.push(marker);
    marker.setMap(context.map);
    addMarkerListener(marker, station);
  };

  // Code to cluster the markers

  let algorithm = new markerClusterer.SuperClusterAlgorithm({ maxZoom: 13, radius: 80});
  let config = { map: context.map, markers: context.markers, algorithm: algorithm };
  let cluster = new markerClusterer.MarkerClusterer(config);
}

function availabilityColor(station) {
  let value = parseInt(station.bikes) / (parseInt(station.bikes) + parseInt(station.bike_stands));
  let hue = ((value)*120).toString(10);
  return ["hsl(",hue,",100%,70%)"].join("");
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


export { drawMap };