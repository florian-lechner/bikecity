import { context } from "./context.js";
import { showPredictedWeather }  from "./weather.js"

// --> Would need to include the Now and Later buttons in future time


// Globally available variables
let startLocation;
let endLocation;
let selectedTime;
let departureOrArrival;


function formSubmission() {
    // Get the submit button element
    var submitBtn = document.querySelector('input[type="submit"]');

    // Add a click event listener to the submit button
    submitBtn.addEventListener('click', function(event) {
        
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get the values of the input fields
        startLocation = document.getElementById('start-location-field').value;
        endLocation = document.getElementById('end-location-field').value;
        selectedTime = convertTime(document.getElementById('time-picker').value);
        departureOrArrival = document.getElementById('departure-arrival-picker').value;
        
        // Call the method to get the 
        showPredictedWeather();
    });
}

// Helper function to convert time from timepicker to database format
function convertTime(time){
    // extract values from time
    var timepickerhours = time.split(":")[0];
    var timepickerminutes = time.split(":")[1];

    // create new instance of time
    var today = new Date();
    var date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), timepickerhours, timepickerminutes);
    
    // extract necessary values
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    // Format the date per the necessary formatting
    let formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    // Returns something in the format 2023-03-30 06:04:15
    return formattedTime; 
}

export { formSubmission };