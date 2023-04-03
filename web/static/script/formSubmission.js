import { context } from "./context.js";
import { showPredictedWeather }  from "./weather.js"


function formSubmission() {
    // Limits Date selector
    document.getElementById("time-picker").setAttribute("min", formatDay(0)+"T00:00");
    document.getElementById("time-picker").setAttribute("max", formatDay(3)+"T23:59");

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