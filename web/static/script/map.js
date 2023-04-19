import { context, routeParams } from "./context.js";
import { createMarkerBounce } from "./popup.js";
import { createCharts, createCircleCharts } from "./charts.js";
import { stylesArray } from "./stylesArray.js";

function drawMap() {
  context.map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3468, lng: -6.270 },
    zoom: 14,
    styles: stylesArray,
    disableDefaultUI: true
  })

  // This will call the function that executes the get request, wait for the stations to load, and then call the create markers function with the loaded stations
  fetch("/getStations")
    .then((response) => response.json())
    .then((stations) => createMarkers(stations));

}



function createMarkers(stations) { // Function to create a marker for each station and add it to the map
  console.log("Creating markers...")
  for (let station of stations) { // For each station in the stations list, create a new marker
    var marker = new google.maps.Marker({
      position: { lat: station.position_lat, lng: station.position_lng },
      map: context.map,
      title: station.name,
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7.5,
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: "#232323"
      },
      stationId: station.id,
      //label: station.bikes.toString()
    });
    marker.icon.fillColor = availabilityColor(station);
    context.markers.push(marker);
    marker.setMap(context.map);
    addMarkerListener(marker, station);
  };

  // Code to cluster the markers
  let renderer = {
    render: ({ count, position }) =>
      new google.maps.Marker({
        label: {
          text: String(count),
          color: "#232323",
          fontSize: "14px",
          fontWeight: "700",
          fillColor: "#232323",
          labelClass: "cluster-marker-class"
        },
        position,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#B0EFFF",
          scale: 8,
          strokeWeight: 16,
          strokeColor: "#B0EFFF"
        },
        // adjust zIndex to be above other markers
        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      }),
  };

  let algorithm = new markerClusterer.SuperClusterAlgorithm({ maxZoom: 13, radius: 80 });
  let config = { map: context.map, markers: context.markers, renderer: renderer, algorithm: algorithm };
  let cluster = new markerClusterer.MarkerClusterer(config);
}

function availabilityColor(station) {
  let value = parseInt(station.bikes) / (parseInt(station.bikes) + parseInt(station.bike_stands));
  let hue = ((value) * 120).toString(10);
  return ["hsl(", hue, ",100%,70%)"].join("");
}

function addMarkerListener(marker, station) {
  marker.addListener("click", function () {
    getStationData(marker, station);
  });
}


function getStationData(marker, station) {
  let liveData = fetch("/getLiveBikeData/" + station.id)
    .then((response) => response.json());
  let historicalData = fetch("/getStationHistoricalData/" + station.id)
    .then((response) => response.json());

  Promise.all([liveData, historicalData])
    .then(([stationAvailability, historicalAvailability]) => {
      createMarkerBounce(marker);
      createCharts(stationAvailability, historicalAvailability);
      createCircleCharts(stationAvailability);
    });
}

function hideStationMarkersExcept(markerIDs) {
  if (!Array.isArray(markerIDs)) {
    markerIDs = [markerIDs]
  }

  context.markers.forEach(marker => {
    if (markerIDs.includes(marker.stationId)) {
      marker.setVisible(true);
    }
    else {
      marker.setVisible(false);
    }
  });
}

function addStartMarker(loc) {
  if (context.startMarker != undefined) {
    context.startMarker.setMap(null)
  }
  var marker = new google.maps.Marker({
    position: { lat: loc.Lat, lng: loc.Long },
    map: context.map,
    title: "Start",
    animation: google.maps.Animation.DROP,
    icon: createIcon("#B0EFFF"),
  });
  context.startMarker = marker;
}

function addEndMarker(loc) {
  if (context.endMarker != undefined) {
    context.endMarker.setMap(null)
  }
  var marker = new google.maps.Marker({
    position: { lat: loc.Lat, lng: loc.Long },
    map: context.map,
    title: "End",
    animation: google.maps.Animation.DROP,
    icon: createIcon("#B0EFFF"),
  });
  context.endMarker = marker;
}

function createIcon(color) {
  var icon = {
    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
    scale: 7.5,
    fillColor: color, // Set the fill color to blue
    fillOpacity: 1,
    strokeWeight: 1.5,
    strokeColor: "#232323"
  };

  return icon
}



export { drawMap, hideStationMarkersExcept, addStartMarker, addEndMarker };