import { context } from "./context.js";

function createCharts(stationAvailability) {
    
    if (context.openChartWindow == undefined) {
        console.log("Made it here!");
        context.openChartWindow = document.getElementById("chart-window");
        openChartWindow(stationAvailability);
    }

    else if (context.openChartWindow != undefined){
        console.log("Made it here!");
        context.openChartWindow = document.getElementById("chart-window");
        setTimeout(closeChartWindow, 0);
        setTimeout(function(){
            openChartWindow(stationAvailability)
        },10);
    }
    
}

function closeChartWindow(){
    context.openChartWindow.style.right ="0px"
    context.openChartWindow.style.display = "none";
}

function openChartWindow(stationAvailability){
    // context.openChartWindow.innerHTML = stationAvailability.name
    context.openChartWindow.children[1].innerHTML = stationAvailability.name;
    context.openChartWindow.style.right = "0px";
    context.openChartWindow.style.display = "block";
}


function createPopUp(marker, stationAvailability) {

    // Hide open window if there is any, set current window to open window
    if (context.openInfoWindow != undefined) {
        context.openInfoWindow.close();
    }

    const infoWindow = new google.maps.InfoWindow({
        content: createPopUpHTML(stationAvailability),
        ariaLabel: stationAvailability.name
    })

    // Open window at marker
    infoWindow.open({
        anchor: marker,
        map: context.map,
    });

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

export { createPopUp, createCharts }