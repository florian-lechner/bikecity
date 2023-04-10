import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";



function requestRouteDrawPolyline(origin, destination, mode, color, callback) {
/**
 * mode as 'BICYCLING' or 'WALKING' parameters
 */ 
    // Convert position objects to google maps position objects
    console.log("origin: ", origin);
    console.log("destination: ", destination);
    const start = new google.maps.LatLng(origin.Lat, origin.Long);
    const end = new google.maps.LatLng(destination.Lat, destination.Long);
    // Initialize the direction service
    const directionsService = new google.maps.DirectionsService();

    // Make the request for the route
    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode[mode]
        },
        (response) => {
            console.log("response: ", response);
            const distance = response.routes[0].legs[0].distance.value;
            const duration = response.routes[0].legs[0].duration.value;
            
            // Update total distance and duration
            totalDistance += distance;
            totalDuration += duration;

            let polyline = drawPolyline(response.routes[0].overview_polyline, color);
            zoomOnPolyline(polyline);

            // Pass the distance and duration to the callback function
            callback({
                Dist : response.routes[0].legs[0].distance.value,
                Dur : response.routes[0].legs[0].duration.value,
            });
        }
    );
}

function drawPolyline(encodedPolyline, color) {
    const path = google.maps.geometry.encoding.decodePath(encodedPolyline);

    // Create a new Polyline object with the decoded path
    const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: context.map,
    });

    return polyline;
}


function zoomOnPolyline(polyline) {
    // Create a LatLngBounds object which zooms in on a list of points
    var bounds = new google.maps.LatLngBounds();

    // Loop through each point in the polyline and add vertex to bounds
    for (var i = 0; i < polyline.getPath().getLength(); i++) {
        bounds.extend(polyline.getPath().getAt(i));
    }

    // Fit the map viewport to the bounds
    context.map.fitBounds(bounds);
}


// totalDistance variables
let totalDistance, totalDuration;


// Function to show complete route on map
function showCompleteRoute() {
    totalDistance = 0;
    totalDuration = 0;

    requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc, "WALKING", "#B0EFFF")
        .then(walkToBike => {
            updateWalkDistDur1(walkToBike);
            totalDistance += walkToBike.Dist;
            totalDuration += walkToBike.Dur;
            zoomOnPolyline(walkToBike.Polyline);

            return requestRouteDrawPolyline(routeParams.startBikeLoc, routeParams.stopBikeLoc, "BICYCLING", "#459CB2");
        })
        .then(bikeToBike => {
            updateBikeDistDur(bikeToBike);
            totalDistance += bikeToBike.Dist;
            totalDuration += bikeToBike.Dur;
            zoomOnPolyline(bikeToBike.Polyline);

            return requestRouteDrawPolyline(routeParams.stopBikeLoc, routeParams.destinationLoc, "WALKING", "#B0EFFF");
        })
        .then(bikeToWalk => {
            updateWalkDistDur2(bikeToWalk);
            totalDistance += bikeToWalk.Dist;
            totalDuration += bikeToWalk.Dur;
            zoomOnPolyline(bikeToWalk.Polyline);

            updateTotalValues({ Dist: totalDistance, Dur: totalDuration });
        })
        .catch(error => {
            console.error(`Error in showCompleteRoute: ${error.message}`);
        });
}

// ORIGINAL VERSION WITHOUT .THEN
//function showCompleteRoute() {
//    // Reset total distance and duration
//    totalDistance = 0;
//    totalDuration = 0;
    // Draw and save walking section between originLoc and startBikeLoc
//    console.log("walk to bike");
//    console.log(routeParams);
//    requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc,"WALKING", "#B0EFFF", (result) => {
//      updateWalkDistDur1(result);
//      });
    // Draw and save biking section between startBikeLoc and stopBikeLoc
//    console.log("bike to bike");
//    console.log(routeParams);
//    requestRouteDrawPolyline(routeParams.startBikeLoc, routeParams.stopBikeLoc, "BICYCLING", "#459CB2", (result) => {
//      updateBikeDistDur(result);
//    });
    // Draw and save walking section between stopBikeLoc and destinationLoc
//    console.log("bike to walk");
//    console.log(routeParams);
//    requestRouteDrawPolyline(routeParams.stopBikeLoc, routeParams.destinationLoc, "WALKING", "#B0EFFF", (result) => {
//      updateWalkDistDur2(result);
//    });
    // Update total distance and duration
//    updateTotalValues({ Dist: totalDistance, Dur: totalDuration });
//  }

// Function to show partial route (startLocation to startBikeLoc) only
function showPartialRoute() {
    requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc,"WALKING", "#B0EFFF", (result) => {
        updateWalkDistDur1(result); 
    });
}



export { requestRouteDrawPolyline, showCompleteRoute, showPartialRoute };