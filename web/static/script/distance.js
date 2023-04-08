import { context } from "./context.js";

// This function finds the closest stations to a given location
function findDistances(locationLat, locationLng, availabilityKey, callback) {
/**
 * availabilityKey is 'bike' for the origin to bike, and 'bike_stations' for bike to dest
 */
    // Fetch the stations data
    fetch("/getStations")
    .then((response) => response.json())
    .then((stationsData) => {
        // Create a LatLng object for the given location
        let location = new google.maps.LatLng(locationLat, locationLng);
        // Get the filtered stations within 1.5 km radius
        let nearbyStations = filterClosestStations(location, stationsData, 1500);
        // Sort the stations by distance from the location
        sortStationsByDistance(location, nearbyStations, (error, sortedStations) => {
            if (error) {
                console.error("Error while sorting stations:", error);
                return;
            }
            // Get the closest stations based on the specified criteria
            let closestStations = getClosestStations(sortedStations, availabilityKey);
            // Call populateTable() function to update the table with closest stations data
            callback(closestStations);
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
    console.log("calculations");
    return R * c * 1000;
  }
  
// Filter the 10 closest stations
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
    // Slice the array to get the 10 closest stations
    const closestStations = stationsWithDistances.slice(0, 10);
    // Return the 10 closest stations without their distance data (only station objects)
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
    console.log("destinations: ", destinations)
    // Call DistanceMatrixService with the prepared requestOptions
    service.getDistanceMatrix(requestOptions, (response, status) => {
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
  
// This function returns the 5 closest stations, with the 5th station meeting a specified availability criteria
function getClosestStations(sortedStations, availabilityKey) {
    const closestStations = sortedStations.slice(0, 4);
    console.log(closestStations)
    const remainingStations = sortedStations.slice(4, 10); // Get the next 6 stations
    console.log(remainingStations)

    // checks the remaining stations for availability key and pushes to array if found
    for (let i = 0; i < remainingStations.length; i++) {
      if (remainingStations[i].station[availabilityKey] > 0) {
         var availableStation = remainingStations[i];
         break;
      }
    }
    if (availableStation) {
      closestStations.push(availableStation);
    }
    return closestStations;
  }

// This function populates the HTML table 
/**
 * tableID is 'start' for the first table and 'stop' for the second table
 * closestStations[i].distance returns distance in meters --> changed it to walking minutes
 */
function populateTable(closestStations, tableID) {
    if (tableID == "start") {
      for (let i = 0; i < closestStations.length; i++) {
        const walkingTimeInMinutes = distanceToMinutes(closestStations[i].distance);
        var chancePrediction = 0;
        var text = '<td id='+`${tableID}-station-name-${i + 1}`+'>'+`${closestStations[i].station.name}`+'</td><td id='+`${tableID}-available-bikes-${i + 1}`+'>'+`${closestStations[i].station.bikes}`+'</td><td id='+`${tableID}-chance-to-get-bike-${i + 1}`+'>'+`${chancePrediction}`+'</td><td id='+`${tableID}-walking-distance-${i + 1}`+'>'+`${walkingTimeInMinutes} min`+'</td>'
        document.getElementById(`${tableID}-row-${i + 1}`).innerHTML = text;
        // old version:
        //document.getElementById(`${tableID}-station-name-${i + 1}`).innerHTML = closestStations[i].station.name;
        //document.getElementById(`${tableID}-available-bikes-${i + 1}`).innerHTML = closestStations[i].station.bikes;
        //document.getElementById(`${tableID}-chance-to-get-bike-${i + 1}`).innerHTML = "add func here"; // need to write percentage calculator here
        //document.getElementById(`${tableID}-walking-distance-${i + 1}`).innerHTML = `${walkingTimeInMinutes} min`;
      if (closestStations.length == 4) {
        var text = '<td colspan="4">No stations with available bikes in this area.</td>';
        document.getElementById(`${tableID}-row-5`).innerHTML = text;
      }
    }
  } else {
      for (let i = 0; i < closestStations.length; i++) {
        const walkingTimeInMinutes = distanceToMinutes(closestStations[i].distance);
        var chancePrediction = 0;
        var text = '<td id='+`${tableID}-station-name-${i + 1}`+'>'+`${closestStations[i].station.name}`+'</td><td id='+`${tableID}-available-bike-stands-${i + 1}`+'>'+`${closestStations[i].station.bikes}`+'</td><td id='+`${tableID}-chance-to-store-bike-${i + 1}`+'>'+`${chancePrediction}`+'</td><td id='+`${tableID}-walking-distance-${i + 1}`+'>'+`${walkingTimeInMinutes} min`+'</td>'
        document.getElementById(`${tableID}-row-${i + 1}`).innerHTML = text;
    }
    if (closestStations.length == 4) {
      var text = '<td colspan="4">No stations with available bike stands in this area.</td>';
      document.getElementById(`${tableID}-row-5`).innerHTML = text;
    }
  }
}

// function to change meter distance to walking minutes
function distanceToMinutes(distance) {
  const averageWalkingSpeed = 1.39; // meters per second
  const timeInSeconds = distance / averageWalkingSpeed;
  const timeInMinutes = timeInSeconds / 60;
  return Math.round(timeInMinutes);
}

export { findDistances, populateTable };