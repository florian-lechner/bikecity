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
        let hoursToTime = convertTimeToHours(document.getElementById('time-picker').value);
        let departureOrArrival = document.getElementById('departure-arrival-picker').value;
        
        // Call the method to get the 
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

    let date = new Date(time);
    let now =  new Date();
    let hoursToPlannedTime = Math.ceil(Math.abs(date - now) / 36e5);

    return hoursToPlannedTime; 
}



export { formSubmission };