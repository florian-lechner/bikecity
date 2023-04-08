import { context, routeParams } from "./context.js";




function requestRouteDrawPolyline(originLatLong, destinationLatLong, mode) {
    // Convert position objects to google maps position objects
    const origin = new google.maps.LatLng(originLatLong.Lat, originLatLong.Long);
    const destination = new google.maps.LatLng(destinationLatLong.Lat, destinationLatLong.Long);
      
    // Initialize the direction service
    const directionsService = new google.maps.DirectionsService();

    // Make the request for the route
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode[mode]
        },
        (response) => {
            console.log('Distance:', response.routes[0].legs[0].distance.value);
            console.log('Duration:', response.routes[0].legs[0].duration.value);
            console.log('Encoded Polyline:', response.routes[0].overview_polyline);
            
            let polyline = drawPolyline(response.routes[0].overview_polyline);
            zoomOnPolyline(polyline);
        }
    );
}

function drawPolyline(encodedPolyline) {
    const path = google.maps.geometry.encoding.decodePath(encodedPolyline);

    // Create a new Polyline object with the decoded path
    const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#459CB2",
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

export { requestRouteDrawPolyline };