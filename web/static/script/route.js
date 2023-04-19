import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";
import { formSubmission, calculateDepartureArrivalTimes, formatDateTime, updateDepArrBox } from "./formSubmission.js"
import { hideStationMarkersExcept, addStartMarker, addEndMarker } from "./map.js";

function requestRouteDrawPolyline(origin, destination, mode, color, callback) {

    // Set start and end points
    const start = new google.maps.LatLng(origin.Lat, origin.Long);
    const end = new google.maps.LatLng(destination.Lat, destination.Long);
   
    // Initialize the direction service
    const directionsService = new google.maps.DirectionsService();

    // Make the request for the route
    return directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode[mode],
        })
        .then(response => {
            const distance = response.routes[0].legs[0].distance.value;
            const duration = Math.ceil(response.routes[0].legs[0].duration.value/ 60);  // returns time in seconds!!! 

            // Update total distance and duration
            routeParams.totalValues.Dist += distance;
            routeParams.totalValues.Dur += duration;

            let polyline = drawPolyline(response.routes[0].overview_polyline, color);

            // Pass the distance and duration to the callback function           
            callback({
                Dist: distance,
                Dur: duration,
            });

            return polyline;
        });
}

function clearPolylines(){
    // Remove all polylines from the map
    if (routeParams.routePolylines != undefined) {
        let isArray = Array.isArray(routeParams.routePolylines);
        if (!isArray){
            routeParams.routePolylines = [routeParams.routePolylines];
        }
        routeParams.routePolylines.forEach(polyline => {
            polyline.setMap(null);
        })

        routeParams.routePolylines = undefined;
    }
    
}

function drawPolylineFromPoints(origin, destination, color){
    
    const polyline = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: context.map
    })

    return polyline
}

function drawPolyline(encodedPolyline, color) {
    // get path from encoded polyline
    const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
    
    // Create a new Polyline object with the decoded path
    const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 4,
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

    let paddingRight = 0;
    if (context.openChartWindow != undefined) {
        paddingRight = 425;
    }
    else {
        paddingRight = 100;
    }

    let padding = {
        top: 100,
        right: paddingRight,
        bottom: 100,
        left: 525
    };



    // Fit the map viewport to the bounds
    context.map.fitBounds(bounds, padding);
}


function showCompleteRoute() {
    // Reset total distance and duration
    routeParams.totalValues.Dist = 0;
    routeParams.totalValues.Dur = 0;

    // Draw and save walking section between originLoc and startBikeLoc
    let walk1 = requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc, "WALKING", "#459CB2", (result) => {
        updateWalkDistDur1(result);
    });

    // Draw and save biking section between startBikeLoc and stopBikeLoc
    let bike = requestRouteDrawPolyline(routeParams.startBikeLoc, routeParams.stopBikeLoc, "BICYCLING", "#232323", (result) => {
        updateBikeDistDur(result);
    });

    // Draw and save walking section between stopBikeLoc and destinationLoc
    let walk2 = requestRouteDrawPolyline(routeParams.stopBikeLoc, routeParams.destinationLoc, "WALKING", "#459CB2", (result) => {
        updateWalkDistDur2(result);
    });

    // let toOrigin = // method to draw polyline from end of route to destination

    Promise.all([walk1, bike, walk2]).then(values => {
        clearPolylines();
        routeParams.routePolylines = values;
        routeParams.routePolylines.push(drawPolylineFromPoints({lat: routeParams.originLoc.Lat, lng: routeParams.originLoc.Long}, values[0].getPath().getAt(0), "#459CB2"));
        routeParams.routePolylines.push(drawPolylineFromPoints(values[0].getPath().getAt(values[0].getPath().getLength()-1), {lat:routeParams.startBikeLoc.Lat, lng: routeParams.startBikeLoc.Long}, "#459CB2"));
        routeParams.routePolylines.push(drawPolylineFromPoints({lat:routeParams.startBikeLoc.Lat, lng: routeParams.startBikeLoc.Long}, values[1].getPath().getAt(0), "#459CB2"));
        routeParams.routePolylines.push(drawPolylineFromPoints(values[1].getPath().getAt(values[1].getPath().getLength()-1), {lat:routeParams.stopBikeLoc.Lat, lng: routeParams.stopBikeLoc.Long}, "#459CB2"));
        routeParams.routePolylines.push(drawPolylineFromPoints({lat:routeParams.stopBikeLoc.Lat, lng: routeParams.stopBikeLoc.Long}, values[2].getPath().getAt(0), "#459CB2"));
        routeParams.routePolylines.push(drawPolylineFromPoints(values[2].getPath().getAt(values[2].getPath().getLength() - 1), {lat: routeParams.destinationLoc.Lat, lng: routeParams.destinationLoc.Long}, "#459CB2"));

        zoomOnPolyline(values);
        // fill duration-calculation-box with values from routeParams
        var durationBox = document.getElementById("duration-calculation-box");
        var icons = '<img src="/static/img/walking.svg" alt="icon" id="start-walking-icon">' + '<img src="/static/img/bike.svg" alt="icon" id="bike-icon">' + '<img src="/static/img/walking.svg" alt="icon" id="stop-walking-icon">' + '<img src="/static/img/destination-flag.svg" alt="icon" id="destination-flag">';
        var lines = '<div id="line-1"></div>' + '<div id="line-2"></div>' + '<div id="line-3"></div>';
        durationBox.innerHTML = icons + lines + `<span id="start-walking-distance-display-min">${routeParams.walkDistDur1.Dur} min</span><span id="start-walking-distance-display-m">${transform_m_to_km(routeParams.walkDistDur1.Dist)}</span><span id="biking-distance-display-min">${routeParams.bikeDistDur.Dur} min</span><span id="biking-distance-display-m">${transform_m_to_km(routeParams.bikeDistDur.Dist)}</span><span id="stop-walking-distance-display-min">${routeParams.walkDistDur2.Dur} min</span><span id="stop-walking-distance-display-m">${transform_m_to_km(routeParams.walkDistDur2.Dist)}</span><span id="total-distance-display-min">${routeParams.totalValues.Dur} min</span><span id="total-distance-display-m">${transform_m_to_km(routeParams.totalValues.Dist)}</span>`;
        durationBox.style.visibility = "visible";
        updateDepArrBox(routeParams.totalValues.Dur);
        hideStationMarkersExcept([routeParams.startBikeStation.id,routeParams.stopBikeStation.id]);
        addStartMarker(routeParams.originLoc);
        addEndMarker(routeParams.destinationLoc);
        });
}

function transform_m_to_km(distance){
    if(distance > 1000) {
        const result = (distance / 1000).toFixed(2);
        const string = `${result} km`;
        return string;
    } else {
        const string = `${distance} m`;
        return string;
    }
}

// Function to show partial route (startLocation to startBikeLoc) only
function showPartialRoute() {
    
    let walk1 = requestRouteDrawPolyline(routeParams.originLoc, routeParams.startBikeLoc, "WALKING", "#459CB2", (result) => {
        updateWalkDistDur1(result);
    }).then(result => {
        clearPolylines();
        routeParams.routePolylines = [result];
        routeParams.routePolylines.push(drawPolylineFromPoints({lat: routeParams.originLoc.Lat, lng: routeParams.originLoc.Long}, result.getPath().getAt(0), "#459CB2"));
        routeParams.routePolylines.push(drawPolylineFromPoints(result.getPath().getAt(result.getPath().getLength()-1), {lat: routeParams.startBikeLoc.Lat, lng: routeParams.startBikeLoc.Long}, "#459CB2"));
        zoomOnPolyline(result);
        updateDepArrBox(routeParams.walkDistDur1.Dur);
        hideStationMarkersExcept(routeParams.startBikeStation.id);
        addStartMarker(routeParams.originLoc);
        });
}   



export { requestRouteDrawPolyline, showCompleteRoute, showPartialRoute, zoomOnPolyline, clearPolylines };