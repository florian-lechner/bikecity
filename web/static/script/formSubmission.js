import { context } from "./context.js";
import { showPredictedWeather }  from "./weather.js"


function formSubmission() {
    // Get the submit button element
    var submitBtn = document.querySelector('input[type="submit"]');

    // Add a click event listener to the submit button
    submitBtn.addEventListener('click', function(event) {
        
        // Prevent the default form submission behavior
        event.preventDefault();

        debugger
        // Get the values of the input fields
        let startLocation = document.getElementById('start-location-field').value;
        let endLocation = document.getElementById('end-location-field').value;
        let selectedTime = convertTime(document.getElementById('time-picker').value);
        let departureOrArrival = document.getElementById('departure-arrival-picker').value;
        
        // Call the method to get the 
        showPredictedWeather(selectedTime);
    });
}

// Helper function to convert time from timepicker to database format
// TO DO: Needs to be able to convert selected date/time to hours from now for forecast
function convertTime(time){

    console.log(typeof(time))

    // create new instance of time
    var date = new Date(time);

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