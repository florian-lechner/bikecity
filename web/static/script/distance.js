import { context } from "./context.js";
//import { formSubmission } from "./formSubmission.js";

// STILL WORKING ON IT!


function showDistances() { 
    fetch("/getStations")
      .then((response) => response.json())
      .then((aaa) => findDistances(startLocation, endLocation));
}

// feed in startLocation and endLocation from formSubmission --> calculate all desired outcomes
function findDistances(startLocation, endLocation) {
    var originLoc = new google.maps.LatLng(startLocation);
    var startBikeStation; 
    var destinationBikeStation;
    var finishLoc = new google.maps.LatLng(endLocation);

    var matrixService = new google.maps.DistanceMatrixService(); // From Google documentation
    matrixService.getDistanceMatrix(
    {
        origins: [origin1, origin2],
        destinations: [destinationA, destinationB],
        travelMode: 'WALKING',
        transitOptions: TransitOptions,
        drivingOptions: DrivingOptions,
        unitSystem: UnitSystem,
        avoidHighways: Boolean,
        avoidTolls: Boolean,
    }, callback);

    function callback(response, status) {
    // See Parsing the Results for
    // the basics of a callback function.
    }

}

export { showDistances }; // add the function to main.js
























export {  };