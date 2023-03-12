import { context } from "./context.js";

function createPopUp(marker, stationAvailability) {

    const infoWindow = new google.maps.InfoWindow({
        content: createPopUpHTML(stationAvailability),
        ariaLabel: stationAvailability.name
    })

    // Open window at marker
    infoWindow.open({
        anchor: marker,
        map: context.map,
    });

    // Hide open window if there is any, set current window to open window
    if (context.openInfoWindow != undefined) {
        context.openInfoWindow.close();
    }
    context.openInfoWindow = infoWindow;

    // Make markers bounce       
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    });
}

function createPopUpHTML(stationAvailability) { // Function to create a pop up for a station
    var stationInfo =
        '<div id="stationInfo">' +
        '<h1>' + stationAvailability.name + '<h1>' +
        '<p> Available Bikes: ' + stationAvailability.available_bikes + '<p>' +
        '<p> Available Stands: ' + stationAvailability.available_stands + '<p>' +
        '</div>'
    return stationInfo
}

export { createPopUp }