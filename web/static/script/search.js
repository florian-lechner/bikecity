import { context } from "./context.js";

// Locations
var place_start;
var place_end;

// Input fields connection with GoogleAPI
function searchBoxes() {
  debugger
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
      place_start = searchBox_start.getPlaces();
    });
  
    searchBox_end.addListener("places_changed", () => {
      place_end = searchBox_end.getPlaces();
    });

    // Return the place_start and place_end objects
    return {
      getStartLocation: () => place_start && place_start[0],
      getEndLocation: () => place_end && place_end[0]
    };
  }

export { searchBoxes };