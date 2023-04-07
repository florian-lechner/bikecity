import { context } from "./context.js";
import { findDistances, populateTable } from "./distance.js";

// Locations
var place_start;
var place_end;

function place_changed(places, start) {
  let LocationLat, LocationLng;

  places.forEach((place) => {
    LocationLat = place.geometry.location.lat();
    LocationLng = place.geometry.location.lng();
  });

  //Call the distance method with the given startLocation and endLocation
  console.log("LAT:", LocationLat)
  console.log("LNG:", LocationLng)
  // Call the distance method with the given startLocation 
  // Add arg: start (boolean) to know if start or end
  findDistances(LocationLat, LocationLng, 'bike', (closestStations) => {
    populateTable(closestStations, 'distance-calculator-table1');
    document.getElementById("distance-calculator-table1").style.visibility = "visible";
  });
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
      place_changed(searchBox_start.getPlaces(), True);

    });
  
    searchBox_end.addListener("places_changed", () => {
      place_changed(searchBox_end.getPlaces(), False);
    });
  }

export { searchBoxes };