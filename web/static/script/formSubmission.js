import { context } from "./context.js";
import { showPredictedWeather }  from "./weather.js"
import { searchBoxes } from "./search.js";
import { findDistances, populateTable } from "./distance.js";

function nowLaterButton() {
  const laterDropdown = document.getElementById("now-departure-arrival-picker");

  laterDropdown.addEventListener("change", (event) => {
    if(event.target.value != "Start Now") {
      document.getElementById("date-time-picker").style.display = "inline-block";
    }
    else if (event.target.value == "Start Now") {
      document.getElementById("date-time-picker").style.display = "none";
    }
  });
  }
  
  function addDestination() {
    const addDestination = document.getElementById("add-destination");

    addDestination.addEventListener("click", (event) => {
      document.getElementById("add-destination").style.display = "none";
      document.getElementById("end-location-field").style.display = "block";
    })
  }

  function formSubmission() {
    // Call nowLaterButton function to add event listeners to the buttons
    nowLaterButton();
    addDestination();
    // Initialize search boxes for location input fields
    const locations = searchBoxes();
    // Limits Date selector
    document.getElementById("time-picker").setAttribute("min", formatDay(0) + "T00:00");
    document.getElementById("time-picker").setAttribute("max", formatDay(3) + "T23:59");
  
    // Get the submit button element
    var submitBtn = document.querySelector('input[type="submit"]');
    // Add a click event listener to the submit button
    submitBtn.addEventListener("click", function (event) {
      // Prevent the default form submission behavior
      event.preventDefault();

      // Get the start and end location objects
      const startLocation = locations.getStartLocation();
      const endLocation = locations.getEndLocation();
      // Declare the latitude and longitude variables for start and end locations
      let startLocationLat, startLocationLng, endLocationLat, endLocationLng;
      // Check if start and end location objects are available
      if (startLocation && endLocation) {
        // Get the latitude and longitude of the start and end locations
        startLocationLat = startLocation.geometry.location.lat();
        startLocationLng = startLocation.geometry.location.lng();
        endLocationLat = endLocation.geometry.location.lat();
        endLocationLng = endLocation.geometry.location.lng();
      }

      let hoursToTime = convertTimeToHours(document.getElementById("time-picker").value);
      //let departureOrArrival = document.getElementById("departure-arrival-picker").value;
      if (document.getElementById("time-picker").style.display === "none") {
        // If the time-picker is hidden, assume 'Now' mode
        const now = new Date();
        hoursToTime = convertTimeToHours(now.toISOString().slice(0, 19));
        console.log(hoursToTime);
        departureOrArrival = "departure";
      }
  
      // Call the method to get the predicted weather
      showPredictedWeather(hoursToTime);

      console.log("startLAT:", startLocationLat)
      console.log("startLNG:", startLocationLng)
      // Call the distance method with the given startLocation 
      findDistances(startLocationLat, startLocationLng, 'bike', (closestStations) => {
        populateTable(closestStations, 'distance-calculator-table1');
        document.getElementById("distance-calculator-table1").style.visibility = "visible";
      });
    });
  }

function formatDay(add){
    var day = new Date(); 
    day.setDate(day.getDate() + add);
    var dd = day.getDate();
    var mm = day.getMonth() + 1; // January would 0
    var yyyy = day.getFullYear();

    if (dd < 10) {
    dd = '0' + dd;
    }

    if (mm < 10) {
    mm = '0' + mm;
    } 
        
    day = yyyy + '-' + mm + '-' + dd;
    return day
}

// Helper function to convert time from timepicker to database format
function convertTimeToHours(time){

    let date = new Date(time);
    let now =  new Date();
    let hoursToPlannedTime = Math.ceil(Math.abs(date - now) / 36e5);
    return hoursToPlannedTime; 
}

export { formSubmission };