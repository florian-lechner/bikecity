import { context } from "./context.js";
import { findDistances, populateTable } from "./distance.js";

// function that calls findDistances and populates tables
function place_changed(places, start) {
  let LocationLat, LocationLng;

  places.forEach((place) => {
    LocationLat = place.geometry.location.lat();
    LocationLng = place.geometry.location.lng();
  });

  //Call the distance method with the given startLocation and endLocation
  console.log("LAT:", LocationLat)
  console.log("LNG:", LocationLng)
  
  if (start) {
    findDistances(LocationLat, LocationLng, 'bikes', (closestStations) => {
      populateTable(closestStations, 'start');
      document.getElementById("distance-calculator-table1").style.visibility = "visible"; });
  } else {
    findDistances(LocationLat, LocationLng, 'bike_stands', (closestStations) => {
      populateTable(closestStations, 'stop');
      document.getElementById("distance-calculator-table2").style.visibility = "visible"; });
  }
}

// Input fields connection with GoogleAPI
function searchBoxes() {
    // Create the search box and link it to the UI element.
    const input_start = document.getElementById("start-location-field");
    const searchBox_start = new google.maps.places.SearchBox(input_start);
  
    const input_end = document.getElementById("end-location-field");
    const searchBox_end = new google.maps.places.SearchBox(input_end);
  
    // Bias the SearchBox results towards current map's viewport.
    context.map.addListener("bounds_changed", () => {
      searchBox_start.setBounds(context.map.getBounds());
      searchBox_end.setBounds(context.map.getBounds());
    });
  
    searchBox_start.addListener("places_changed", () => {
      place_changed(searchBox_start.getPlaces(), true);

    });
  
    searchBox_end.addListener("places_changed", () => {
      place_changed(searchBox_end.getPlaces(), false);
    });
  }

export { searchBoxes };