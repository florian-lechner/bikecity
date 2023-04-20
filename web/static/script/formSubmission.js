import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination } from "./context.js";
import { showPredictedWeather }  from "./weather.js"
import { searchBoxes, refreshBox } from "./search.js";
import { findDistances, populateDiv } from "./distance.js";


function nowLaterButton() {
  const laterDropdown = document.getElementById("now-departure-arrival-picker");

  laterDropdown.addEventListener("change", (event) => {
    if(event.target.value != "Start Now") {
      document.getElementById("date-time-picker").style.display = "inline-block";
      if (storedDateTimePickerValue != undefined) {
        timePickChange();
      }
    }
    else if (event.target.value == "Start Now") {
      document.getElementById("date-time-picker").style.display = "none";
      context.forecast_hour = 0;
      
      refreshBox();
      // Call the method to get the predicted weather
      showPredictedWeather(context.forecast_hour);
    }
  });
  }
  
function addDestination() {
    const addDestination = document.getElementById("add-destination");

    addDestination.addEventListener("click", (event) => {
      document.getElementById("add-destination").style.display = "none";
      document.getElementById("destination-section").style.display = "block";
    })
  }

// enables to keep datetime value set and then Departure/Arrival option is changed
let storedDateTimePickerValue;

function formSubmission() {
    // Call nowLaterButton function to add event listeners to the buttons
    nowLaterButton();
    // Add "+ add destination" button
    addDestination();
  
    // Limits Date selector
    document.getElementById("time-picker").min = new Date().toISOString().slice(0, 16);
    document.getElementById("time-picker").setAttribute("max", formatDay(3) + "T23:59");

    // Listener Date change
    document.getElementById("time-picker").addEventListener("change", timePickChange);

    // listener checks if storedDateTimePickerValue exists upon Departure->Arrival or Arrival->Departure change
    /*document.getElementById("now-departure-arrival-picker").addEventListener("change", function (event) {
      if (storedDateTimePickerValue) {
        document.getElementById("time-picker").value = storedDateTimePickerValue.toISOString().slice(0, 16);
      }
    });*/
  }

function timePickChange() {
  let time = new Date(document.getElementById("time-picker").value);
  storedDateTimePickerValue = time;
  let hoursToTime = convertTimeToHours(time);
  context.applicationTime = time;
  console.log(context.applicationTime);
  let departureOrArrival = document.getElementById("now-departure-arrival-picker").value;

  if (departureOrArrival == "Start Now") {
    // If now, current date as start time
    hoursToTime = 0;
    departureOrArrival = "Departure";
  } else if (hoursToTime > 90) {
    hoursToTime = 90;
  } else if (hoursToTime < 1) {
    hoursToTime = 0;
  }
  context.forecast_hour = hoursToTime;
  
  // Call the method to get the predicted weather
  showPredictedWeather(hoursToTime);

  refreshBox();
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

// Function to calculate the departure or arrival times 
function calculateDepartureArrivalTimes(totalDuration) {
  const departureOrArrival = document.getElementById("now-departure-arrival-picker").value;
  let departureTime, arrivalTime, nowTime;

  if (departureOrArrival === "Departure") {
    departureTime = context.applicationTime;
    arrivalTime = new Date(departureTime.getTime() + totalDuration * 60000);
  } else if (departureOrArrival === "Arrival") {
    arrivalTime = context.applicationTime;
    departureTime = new Date(arrivalTime.getTime() - totalDuration * 60000);
  } else if (departureOrArrival === "Start Now") {
    departureTime = new Date();
    arrivalTime = new Date(departureTime.getTime() + totalDuration * 60000);
  }

  return { departureTime, arrivalTime };
}

// Helper funtion to format datetime in the correct format for departure-arrival-times div
function formatDateTime(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}-${month}-${year}, ${hours}:${minutes}`;
}

// Helper function to display times for the Departure Arrival display
function updateDepArrBox(duration) {
  const departureArrivalPicker = document.getElementById("now-departure-arrival-picker");
  const dateTimePicker = document.getElementById("date-time-picker");
  
  // inner function holding the update operations
  function updateBox(duration) {
    const times = calculateDepartureArrivalTimes(duration);
    const formattedDepartureTime = formatDateTime(times.departureTime);
    const formattedArrivalTime = formatDateTime(times.arrivalTime);
    var depArrBox = document.getElementsByClassName("departure-arrival-times")[0];
    depArrBox.innerHTML = `<div id="divider-weather"></div><span id="departure-date-time"><span class="dep-arr-date">Depature:</span><span class="dep-arr-time"> ${formattedDepartureTime}</span></span><span id="arrival-date-time"><span class="dep-arr-date">Arrival:</span><span class="dep-arr-time"> ${formattedArrivalTime}</span></span>`;
    depArrBox.style.visibility = "visible";
  }

  updateBox(duration);

  departureArrivalPicker.addEventListener("change", (event) => {
    if (dateTimePicker.value !== undefined) {
      updateBox(duration);
    }
  });

  dateTimePicker.addEventListener("change", (event) => {
    updateBox(duration);
  });
}


export { formSubmission, calculateDepartureArrivalTimes, formatDateTime, updateDepArrBox };