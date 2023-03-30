import { context } from "./context.js";

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
    selectedTime = document.getElementById('time-picker').value; // time input changed
    departureOrArrival = document.getElementById('departure-arrival-picker').value;
   
    });
}

export {formSubmission};