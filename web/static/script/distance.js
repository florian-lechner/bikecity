import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";
import { checkRouteStatus } from "./search.js";

// This function finds the closest stations to a given location
function findDistances(locationLat, locationLng, callback) {
/**
 * availabilityKey is 'bike' for the origin to bike, and 'bike_stations' for bike to dest
 */
    // Fetch the stations data
    return fetch("/getStations")
    .then((response) => response.json())
    .then((stationsData) => {
        // Create a LatLng object for the given location
        let location = new google.maps.LatLng(locationLat, locationLng);
        // Get the 20 closest stations (haversine distance)
        let nearbyStations = filterClosestStations(location, stationsData);
        // Sort the stations by distance from the location
        return sortStationsByDistance(location, nearbyStations, (error, sortedStations) => {
            if (error) {
                console.error("Error while sorting stations:", error);
                return;
            }
            // Get the closest stations based on the specified criteria
            //let closestStations = getClosestStations(sortedStations, availabilityKey);
            // Call populateTable() function to update the table with closest stations data
            callback(sortedStations);
        });
    });
}
  
// Converts degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
// Calculates the Haversine distance between two points with given latitudes and longitudes
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    // Convert differences in latitude and longitude to radians
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    // Calculate the Haversine formula
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Calculate the distance in meters
    return R * c * 1000;
  }
  
// Function get the 20 closest stations to start Location
function filterClosestStations(location, stations) {
    // Map each station to an object containing the station data and its distance to the location
    const stationsWithDistances = stations.map((station) => {
        const distance = haversineDistance(
            location.lat(),
            location.lng(),
            station.position_lat,
            station.position_lng
        );
        return { station, distance };
    });
    // Sort the stations by distance (ascending order)
    stationsWithDistances.sort((a, b) => a.distance - b.distance);
    // Slice the array to get the 20 closest stations
    const closestStations = stationsWithDistances.slice(0, 20);
    // Return the 20 closest stations without their distance data (only station objects)
    return closestStations.map(({ station }) => station);
}

// Function uses the Google Distance Matrix API for distance calculations considering walking routes
function sortStationsByDistance(location, stations, callback) {
    // Create DistanceMatrixService instance
    const service = new google.maps.DistanceMatrixService();
    // Extract the coordinates of all stations
    const destinations = stations.map((station) => new google.maps.LatLng(station.position_lat, station.position_lng));
    // Prepare the request options for DistanceMatrixService
    const requestOptions = {
      origins: [location],
      destinations: destinations,
      travelMode: 'WALKING',
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: true,
      avoidTolls: true,
    };
    // Call DistanceMatrixService with the prepared requestOptions
    return service.getDistanceMatrix(requestOptions, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          const distances = response.rows[0].elements;
          const sortedStations = stations
            .map((station, index) => ({station, distance: distances[index].distance.value }))
            .sort((a, b) => a.distance - b.distance);
          callback(null, sortedStations);
        } else {
          // Log the error status if the request failed
          console.error("Error in DistanceMatrixService:", status);
          callback(status);
        }
      });
  }

// This function populates the HTML table 
function populateDiv(sortedStations, tableID, preselectStartBike, preselectEndBike) {
  /**
 * tableID is 'start' for the first table and 'stop' for the second table
 * closestStations[i].distance returns distance in meters --> changed it to walking minutes
 */
  const parentDiv = document.querySelector(`.${tableID}-locations-popup-more-info`);

  for (let i = 0; i < sortedStations.length; i++) {
    // Create a new div element
    var newDiv = document.createElement("div");
    newDiv.setAttribute("id", `${tableID}-station-${i + 1}`);
    newDiv.setAttribute("class", "bike-box");
    // Append the new div element to the parent div
    parentDiv.appendChild(newDiv);

    const walkingTimeInMinutes = distanceToMinutes(sortedStations[i].distance);
    var chancePrediction = 0;

    var text;
    if (tableID == "start") {
      text = `<span class="station-name" id=${tableID}-station-name-${i + 1}>${sortedStations[i].station.name}</span><span id=${tableID}-available-bikes-${i + 1}>${sortedStations[i].station.bikes}</span><span class="bike-chance" id=${tableID}-chance-to-get-bike-${i + 1}>${chancePrediction}% Chance to get a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${i + 1}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${i + 1}>${sortedStations[i].distance} m</span>`;
    } else {
      text = `<span class="station-name" id=${tableID}-station-name-${i + 1}>${sortedStations[i].station.name}</span><span id=${tableID}-available-bike-stands-${i + 1}>${sortedStations[i].station.bike_stands}</span><span class="bike-chance" id=${tableID}-chance-to-store-bike-${i + 1}>${chancePrediction}% Chance to store a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-${i + 1}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${i + 1}>${sortedStations[i].distance} m</span>`;
    }

    newDiv.innerHTML = text;

    // Add event listener to the new div
    newDiv.addEventListener('click', function() {
      if (tableID === 'start') {
        preselectStartBike = sortedStations[i];
        updateStartBike({ Lat: preselectStartBike.station.position_lat, Long: preselectStartBike.station.position_lng });
        updateWalkDistDur1({ Dist : preselectStartBike.distance, Dur: distanceToMinutes(preselectStartBike.distance) });
        checkRouteStatus();
      } else {
        preselectEndBike = sortedStations[i];
        updateStopBike({ Lat: preselectEndBike.station.position_lat, Long: preselectEndBike.station.position_lng });
        updateWalkDistDur2({ Dist : preselectEndBike.distance, Dur: distanceToMinutes(preselectEndBike.distance) });
        checkRouteStatus();
      }

      // Update the preselect div
      const preselectDiv = document.getElementById(`${tableID}-bike-preselect`);
      const preselectText = `<span class="station-name" id=${tableID}-station-name-${i + 1}>${sortedStations[i].station.name}</span><span id=${tableID}-available-bikes-${i + 1}>${sortedStations[i].station.bikes}</span><span class="bike-chance" id=${tableID}-chance-to-get-bike-${i + 1}>${chancePrediction}% Chance to get a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${i + 1}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${i + 1}>${sortedStations[i].distance} m</span>`;
      preselectDiv.innerHTML = preselectText;

      document.getElementsByClassName("popup-more-info")[0].style.visibility = "hidden";
      document.getElementsByClassName(`${tableID}-locations-popup-more-info`)[0].style.visibility = "hidden";
    });
  }
  document.getElementsByClassName(`${tableID}-locations-popup-more-info`)[0].style.visibility = "hidden";
}


// function to change meter distance to walking minutes
function distanceToMinutes(distance) {
  const averageWalkingSpeed = 1.39; // meters per second
  const timeInSeconds = distance / averageWalkingSpeed;
  const timeInMinutes = timeInSeconds / 60;
  return Math.round(timeInMinutes);
}


// function to create preselected station
function preselectStation(closestStations, availabilityKey, tableID) {
  var stations = closestStations;
  var availableStation;
  var index;
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].station[availabilityKey] > 0) {
       availableStation = stations[i];
       index = i;
       break;
    }
  }
  if (availableStation) {
    const walkingTimeInMinutes = distanceToMinutes(availableStation.distance);
    var chancePrediction = 0;  // to be implemented with prediction function; placeholder
    var canvas_text = `<div class="station-curve"><canvas class="background-canvas" id="${tableID}-graph" width="48" height="48"></canvas><canvas class="station-number-canvas" id="${tableID}-graph-number" width="48" height="48"></canvas><object class="background-station" id="${tableID}-bg"" type="image/svg+xml" data="/static/img/availability-background.svg"></object>`;
    if (tableID == "start") {
      var text = `${canvas_text}<img src="/static/img/toggle-bike-dark.svg" alt="icon" class="icon"><span class="available-number" id=${tableID}-available-bikes-${index}>${availableStation.station.bikes}</span></div><span class="station-name" id=${tableID}-station-name-${index}>${availableStation.station.name}</span><span class="bike-chance" id=${tableID}-chance-to-get-bike-${index}>${chancePrediction}% Chance to get a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${index}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${index}>${availableStation.distance} m</span>`
      updateStartBike({ Lat: availableStation.station.position_lat, Long: availableStation.station.position_lng });
      updateWalkDistDur1({ Dist : availableStation.distance, Dur: walkingTimeInMinutes });
      var id = "preselect-start";
      var available = availableStation.station.bikes;
    } else if (tableID == "stop") {
      var text = `${canvas_text}<img src="/static/img/toggle-stands-dark.svg" alt="icon" class="icon"><span class="available-number" id=${tableID}-available-bike-stands-${index}>${availableStation.station.bike_stands}</span></div><span class="station-name" id=${tableID}-station-name-${index}>${availableStation.station.name}</span><span class="bike-chance" id=${tableID}-chance-to-store-bike-${index}>${chancePrediction}% Chance to store a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${index}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${index}>${availableStation.distance} m</span>`
      updateStopBike({ Lat: availableStation.station.position_lat, Long: availableStation.station.position_lng });
      updateWalkDistDur2({ Dist : availableStation.distance, Dur: walkingTimeInMinutes });
      var id = "preselect-stop";
      var available = availableStation.station.bike_stands;
    }
    document.getElementById(`${tableID}-bike-preselect`).innerHTML = text;
    document.getElementById(`${tableID}-bike-result`).style.display = "block"; 
    availabilityCanvas(tableID, available, 30);
  } else { // error message in case no stations available
    var text = '<span id="preselect-no-result">No available stations in your area.</span>';
    document.getElementById(`${tableID}-bike-preselect`).innerHTML = text;
  }
  return availableStation;
}


var station_canvases = {};
function availabilityCanvas(id, availability, max){

  var border_color = 'rgba(176, 239, 255,1)';
  var background_color = 'rgba(69, 156, 178, 1)';
  var front_color = 'rgba(35, 35, 35, 1)';

  // destroy previous graphs:
  if (id in station_canvases) {
    station_canvases[id][0].destroy();
    station_canvases[id][1].destroy();
  }
  

  // Background
  var availability_graph = document.getElementById(id + "-graph");
  var background = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [10],
            backgroundColor: [
              background_color,
            ],
            borderColor: [
              border_color,
            ],
            borderWidth: 1,
            borderRadius: 4             
        }]

    },
    options: {
        rotation: -120,
        circumference: 240,
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        },
        events: [],
        cutout: "82%"
    }
  };
  var background_canvas_temp = new Chart(availability_graph, background);
  
  // value on graph
  var step_lower = availability;
  var step_upper = max - availability;
  // display it
  var availability_graph_number = document.getElementById(id + "-graph-number");
  var availability_graph_number_canvas = new Chart(availability_graph_number, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [step_lower,step_upper],
            backgroundColor: [
              front_color,
              "rgba(0,0,0,0)",
            ],
            borderColor: [
              front_color,
              'rgba(0, 0, 0 ,0)'
            ],
            borderWidth: 4,
            borderRadius: 5             
        }]

    },
    options: {
        rotation: -120,
        circumference: 240,
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        },
        events: [],
        cutout: "90%"
    }
  });
  station_canvases[id] = [background_canvas_temp ,availability_graph_number_canvas];

  // Background:
  //var hue = ((availability/max)*120).toString(10);
  //var color_bg = ["hsl(",hue,",100%,70%)"].join("");
  //document.getElementById(id+ "-bg").getSVGDocument().getElementById("svgInternalID").setAttribute("fill", color_bg)
}

export { findDistances, distanceToMinutes, populateDiv, preselectStation };