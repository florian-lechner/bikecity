import { context } from "./context.js";
import { showPredictedWeather }  from "./weather.js"
import { searchBoxes } from "./search.js";
import { findDistances, populateDiv } from "./distance.js";

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
    // Add "+ add destination" button
    addDestination();
  
    // Limits Date selector
    document.getElementById("time-picker").setAttribute("min", formatDay(0) + "T00:00");
    document.getElementById("time-picker").setAttribute("max", formatDay(3) + "T23:59");
    
    // Listener Date change
    document.getElementById("time-picker").addEventListener("change", function (event) {
      let time = new Date(document.getElementById("time-picker").value);
      let hoursToTime = convertTimeToHours(time);
      context.applicationTime = time;
      let departureOrArrival = document.getElementById("now-departure-arrival-picker").value;
  
      if (departureOrArrival == "Start Now") {
        // If now, current date as start time
        hoursToTime = 0;
        departureOrArrival = "Departure";
      }
      
      else if (hoursToTime > 90) {
        hoursToTime = 90;
      }
      else if (hoursToTime < 0) {
        hoursToTime = 0;
      }

      // Call the method to get the predicted weather
      showPredictedWeather(hoursToTime);
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
    let now =  new Date();
    let hoursToPlannedTime = Math.ceil(Math.abs(time - now) / 36e5);
    return hoursToPlannedTime; 
}



export { formSubmission };