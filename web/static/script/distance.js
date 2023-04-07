import { context } from "./context.js";

// This function finds the closest stations to a given location
function findDistances(locationLat, locationLng, availabilityKey, tableID) {
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
    console.log("radians");
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
    console.log("madeDestinations")
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
    const availableStation = sortedStations.find((station) => station[availabilityKey] > 0);
    if (availableStation) {
      closestStations.push(availableStation);
    }
    console.log("got the closest ones")
    return closestStations;
  }

// This function populates the HTML table 
/**
 * tableID is 'start' for the first table and 'stop' for the second table
 */
function populateTable(closestStations, tableID) {
    for (let i = 0; i < closestStations.length; i++) {
      document.getElementById(`${tableID}-station-name-${i + 1}`).textContent = closestStations[i].station.name;
      document.getElementById(`${tableID}-available-bikes-${i + 1}`).textContent = closestStations[i].station.bike;
      document.getElementById(`${tableID}-chance-to-get-bike-${i + 1}`).textContent = closestStations[i].station.probability; // assuming you have a probability field in your station object
      document.getElementById(`${tableID}-walking-distance-${i + 1}`).textContent = closestStations[i].distance; // update the distance textContent
    }
    console.log("populated")
  }


export { findDistances, populateTable };