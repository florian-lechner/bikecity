import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";
import { checkRouteStatus } from "./search.js";
import { formatDateTime } from "./formSubmission.js";


let svgBG = ' class="background-station" width="44" height="33" viewBox="0 0 44 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path id="svgInternalID" fill-rule="evenodd" clip-rule="evenodd" d="M38.9671 31.9137C42.111 28.5415 44 24.2163 44 19.5C44 8.73045 34.1503 0 22 0C9.84974 0 0 8.73045 0 19.5C0 24.6369 2.24099 29.31 5.9037 32.7929C16.3968 28.1295 28.2971 27.8365 38.9671 31.9137Z" fill="hsl(1,100%,70%)"/></svg>'


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
        // get prediction for each station
        fetch("/getForecastWeather/" + context.forecast_hour)
          .then(response => response.json())
          .then(weatherData => {
            let promises = nearbyStations.map(station => get_station_prediction(station.id, station.bikes, station.bike_stands, weatherData));
            return promises;
          })
          .then(promises => {
            Promise.all(promises)
            .then(results => {
              // Update the nearbyStations array with the results
              for (let i = 0; i < nearbyStations.length; i++) {
                nearbyStations[i].bikes = results[i].bikes;
                nearbyStations[i].bike_stands = results[i].stands;
              }
              return nearbyStations;
            })
            .then(nearbyStations => {
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
            })
            .catch(error => {
              console.error("Error while getting station predictions:", error);
            });
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
    var available;
    //var canvas_text = '<div class="station-curve"><canvas class="background-canvas" id="' + `${tableID}-${i + 1}-graph"` + ' width="48" height="48"></canvas><canvas class="station-number-canvas" id="' + `${tableID}-${i + 1}-graph-number"` + ' width="48" height="48"></canvas><object class="background-station" id="' + `${tableID}-${i + 1}-bg"` + '" type="image/svg+xml" data="/static/img/availability-background.svg"></object>';
    var canvas_text = '<div class="station-curve"><canvas class="background-canvas" id="' + `${tableID}-${i + 1}-graph"` + ' width="48" height="48"></canvas><canvas class="station-number-canvas" id="' + `${tableID}-${i + 1}-graph-number"` + ' width="48" height="48"></canvas><svg id="' + `${tableID}-${i + 1}-bg"` + svgBG;
    if (tableID == "start") {
      available = sortedStations[i].station.bikes;
      text = canvas_text +'<img src="/static/img/toggle-bike-dark.svg" alt="icon" class="icon"><span class="available-number" id='+`${tableID}-available-bikes-${i + 1}`+'>'+`${sortedStations[i].station.bikes}`+'</span></div>' + `<span class="station-name" id=${tableID}-station-name-${i + 1}>${sortedStations[i].station.name}</span><span class="bike-chance" id=${tableID}-chance-to-get-bike-${i + 1}>${chancePrediction}% Chance to get a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${i + 1}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${i + 1}>${sortedStations[i].distance} m</span>`;
    } else {
      available = sortedStations[i].station.bike_stands;
      text = canvas_text + '<img src="/static/img/toggle-stands-dark.svg" alt="icon" class="icon"><span class="available-number" id='+`${tableID}-available-bike-stands-${i + 1}`+'>'+`${sortedStations[i].station.bike_stands}`+'</span></div>' + `<span class="station-name" id=${tableID}-station-name-${i + 1}>${sortedStations[i].station.name}</span><span class="bike-chance" id=${tableID}-chance-to-store-bike-${i + 1}>${chancePrediction}% Chance to store a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-${i + 1}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${i + 1}>${sortedStations[i].distance} m</span>`;
    }

    newDiv.innerHTML = text;

    availabilityCanvas(`${tableID}-${i + 1}`, available, 30); //  ############# add max
    addCloseSelectionEvent();
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
      preselectStation(sortedStations[i], toString(i), tableID)

      document.getElementsByClassName("popup-more-info")[0].style.visibility = "hidden";
      document.getElementsByClassName(`${tableID}-locations-popup-more-info`)[0].style.visibility = "hidden";
    });
  }
  document.getElementsByClassName(`${tableID}-locations-popup-more-info`)[0].style.visibility = "hidden";
}
function closeSelectionPopup(){
  document.getElementsByClassName("popup-more-info")[0].style.visibility = "hidden";
  document.getElementsByClassName(`start-locations-popup-more-info`)[0].style.visibility = "hidden";
  document.getElementsByClassName(`stop-locations-popup-more-info`)[0].style.visibility = "hidden";
};


function addCloseSelectionEvent() {
  document.getElementById("close-popup").addEventListener("click", closeSelectionPopup);
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
  var index;
  
  if(availabilityKey == "bikes" || availabilityKey == "bike_stands" ) {
    // Select closest one
    for (let i = 0; i < stations.length; i++) {
      if (stations[i].station[availabilityKey] > 0) {
        var availableStation = stations[i];
        index = i;
        break;
      }
    }
  } else {
    var availableStation = stations;
    index = Number(availabilityKey);
  }


  if (availableStation) {
    const walkingTimeInMinutes = distanceToMinutes(availableStation.distance);
    var chancePrediction = 0;  // to be implemented with prediction function; placeholder
    var canvas_text = '<div class="station-curve"><canvas class="background-canvas" id="' + `${tableID}-graph"`+ ' width="48" height="48"></canvas><canvas class="station-number-canvas" id="' + `${tableID}-graph-number"`+ ' width="48" height="48"></canvas><svg id="' + `${tableID}-bg"` + svgBG;
    
    let max = availableStation.station.bikes + availableStation.station.bike_stands;
    let bikes = availableStation.station.bikes;
    let stands= availableStation.station.bike_stands;
    // get prediciton
    //get_station_prediction(availableStation.station.id)
    //.then(result => {
    //  max  = result.max;
    //  bikes = result.bikes;
    //  stands = result.stands;
    

    if (tableID == "start") {
      var available = bikes;
      var text = `${canvas_text}<img src="/static/img/toggle-bike-dark.svg" alt="icon" class="icon"><span class="available-number" id=${tableID}-available-bikes-${index}>${available}</span></div><span class="station-name" id=${tableID}-station-name-${index}>${availableStation.station.name}</span><span class="bike-chance" id=${tableID}-chance-to-get-bike-${index}>${chancePrediction}% Chance to get a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${index}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${index}>${availableStation.distance} m</span>`
      updateStartBike({ Lat: availableStation.station.position_lat, Long: availableStation.station.position_lng });
      updateWalkDistDur1({ Dist : availableStation.distance, Dur: walkingTimeInMinutes });
      var id = "preselect-start";
    } else if (tableID == "stop") {
      var available = stands;
      var text = `${canvas_text}<img src="/static/img/toggle-stands-dark.svg" alt="icon" class="icon"><span class="available-number" id=${tableID}-available-bike-stands-${index}>${available}</span></div><span class="station-name" id=${tableID}-station-name-${index}>${availableStation.station.name}</span><span class="bike-chance" id=${tableID}-chance-to-store-bike-${index}>${chancePrediction}% Chance to store a bike</span><span class="station-walking-time" id=${tableID}-walking-distance-min-${index}>${walkingTimeInMinutes} min</span><span class="station-distance" id=${tableID}-walking-distance-m-${index}>${availableStation.distance} m</span>`
      updateStopBike({ Lat: availableStation.station.position_lat, Long: availableStation.station.position_lng });
      updateWalkDistDur2({ Dist : availableStation.distance, Dur: walkingTimeInMinutes });
      var id = "preselect-stop";
    }
    document.getElementById(`${tableID}-bike-preselect`).innerHTML = text;
    document.getElementById(`${tableID}-bike-result`).style.display = "block"; 
    availabilityCanvas(tableID, available, 30); //  ############# add max
  //});
  } else { // error message in case no stations available
    var text = '<span id="preselect-no-result">There are no available stations in your area.<br>Stations are closed between 0:30am and 5:00am.</span>';
    document.getElementById(`${tableID}-bike-preselect`).innerHTML = text;
    document.getElementById(`${tableID}-bike-result`).style.display = "block";
  }
  checkRouteStatus();
  return availableStation;
  
}


var station_canvases = {};
function availabilityCanvas(id, availability, max){

  var border_color = 'rgba(176, 239, 255, 0)';
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
  var hue = ((availability/max)*120).toString(10);
  var color_bg = ["hsl(",hue,",100%,70%)"].join("");
  var svgBg = document.getElementById(id+ "-bg").getElementById("svgInternalID");
  svgBg.setAttribute("fill", color_bg)

}

async function get_station_prediction(id, bike_org, stands_org, weatherData) {
  try {
    // get prediction
    let date = formatDateTime(context.applicationTime).split(' ').join('');

    if (context.forecast_hour == 0) {
      const bikes = bike_org;
      const stands = stands_org;
      const max = bikes + stands;
      return { bikes, stands, max };
    } else {
      const response = await fetch("/getBikePrediction/" + id + "/" + context.forecast_hour + "/" + date + "/" + weatherData.forecast_temp + "/" + weatherData.pressure + "/" + weatherData.humidity + "/" + weatherData.clouds + "/" + weatherData.precipitation_value  + "/" + weatherData.precipitation_probability);
      const availability = await response.json();
      const bikes = availability.bikes;
      const stands = availability.stands;
      const max = bikes + stands;
      return { bikes, stands, max };
    }
  } catch (error) {
    console.error('Error fetching bike prediction:', error);
    const bikes = 0;
    const stands = 0;
    const max = bikes + stands;
    return { bikes, stands, max };
  }
}

export { findDistances, distanceToMinutes, populateDiv, preselectStation };