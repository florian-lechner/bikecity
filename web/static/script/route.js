import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";



function requestRouteDrawPolyline(origin, destination, mode, color, callback) {
    /**
     * mode as 'BICYCLING' or 'WALKING' parameters
     */
    // Convert position objects to google maps position objects

    if (routeParams.routePolylines != undefined){
        let isArray = Array.isArray(routeParams.routePolylines);
        routeParams.routePolylines.forEach(polyline => {
            polyline.setMap(null);
        })
    }

    console.log("origin: ", origin);
    console.log("destination: ", destination);
    const start = new google.maps.LatLng(origin.Lat, origin.Long);
    const end = new google.maps.LatLng(destination.Lat, destination.Long);
    // Initialize the direction service
    const directionsService = new google.maps.DirectionsService();

    // Make the request for the route
    return directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode[mode]
        })
        .then(response => {
            console.log("response: ", response);
            const distance = response.routes[0].legs[0].distance.value;
            const duration = response.routes[0].legs[0].duration.value;

            // Update total distance and duration
            totalDistance += distance;
            totalDuration += duration;

            let polyline = drawPolyline(response.routes[0].overview_polyline, color);

            // Pass the distance and duration to the callback function
            callback({
                Dist: response.routes[0].legs[0].distance.value,
                Dur: response.routes[0].legs[0].duration.value,
            });

            return polyline;
        });
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

    // Turn polyline into an array if it's not one already
    if (!Array.isArray(polyline)) {
        polyline = [polyline];
    }

    // Create a LatLngBounds object which zooms in on a list of points
    var bounds = new google.maps.LatLngBounds();

    // For each polyline in my polylines array
    polyline.forEach(p => {
        // Loop through each point in the polyline and add vertex to bounds
        for (var i = 0; i < p.getPath().getLength(); i++) {
            bounds.extend(p.getPath().getAt(i));
        }
    });

    // Fit the map viewport to the bounds
    context.map.fitBounds(bounds);
}


// totalDistance variables
let totalDistance, totalDuration;


// ORIGINAL VERSION WITHOUT .THEN
function showCompleteRoute() {
    // Reset total distance and duration
    totalDistance = 0;
    totalDuration = 0;

    // Draw and save walking section between originLoc and startBikeLoc
    let walk1 = requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc, "WALKING", "#B0EFFF", (result) => {
        updateWalkDistDur1(result);
    });

    // Draw and save biking section between startBikeLoc and stopBikeLoc
    let bike = requestRouteDrawPolyline(routeParams.startBikeLoc, routeParams.stopBikeLoc, "BICYCLING", "#459CB2", (result) => {
        updateBikeDistDur(result);
    });


    // Draw and save walking section between stopBikeLoc and destinationLoc
    let walk2 = requestRouteDrawPolyline(routeParams.stopBikeLoc, routeParams.destinationLoc, "WALKING", "#B0EFFF", (result) => {
        updateWalkDistDur2(result);
    });
    // Update total distance and duration
    updateTotalValues({ Dist: totalDistance, Dur: totalDuration });
    Promise.all([walk1, bike, walk2]).then(values => {
        routeParams.routePolylines = values;
        zoomOnPolyline(values);
    });
}

// Function to show partial route (startLocation to startBikeLoc) only
function showPartialRoute() {
    debugger
    let walk1 = requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc, "WALKING", "#B0EFFF", (result) => {
        updateWalkDistDur1(result);
    }).then(result => {
        routeParams.routePolylines = [result];
        zoomOnPolyline(result);
    });
}



export { requestRouteDrawPolyline, showCompleteRoute, showPartialRoute };