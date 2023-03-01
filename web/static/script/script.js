var stations = []

// Function to get relevant marker info from stations objects
function getMarkerInfo(myStation) {
  var stationMarkerInfo = {
    stationName: myStation.address,
    stationPosition: { lat: myStation.position.lat, lng: myStation.position.lng }
  };
  return stationMarkerInfo;
}

// Function getStationsData, which will call whatever function is passed in as onStationDataLoaded
function getStationsData(onStationDataLoaded) {
  // Get JSON Data
  var xmlhttp = new XMLHttpRequest();
  var url = "http://127.0.0.1:5000/testingGetRoute";

  // Empty the current stations list
  stations = []

  // Request station data from our own API, woah
  xmlhttp.onreadystatechange = function () {
    console.log(`readyState: ${this.readyState} and status: ${this.status}`);
    if (xmlhttp.readyState == 4) {
      // If status code is 200 (and the code is good), do this
      if (xmlhttp.status == 200) {
        var myStations = JSON.parse(xmlhttp.responseText);
        for (let i = 0; i < myStations.length; i++) {
          stations.push(getMarkerInfo(myStations[i]));
        }
        if (typeof (onStationDataLoaded) === "function") {
          // Once the data has been loaded, call the function that has been passed into onStationDataLoaded (in our case the create Markers)
          onStationDataLoaded(stations);
        }
      }
    }
  }

  // Open request from our own API, and send it
  xmlhttp.open("GET", url, true);
  xmlhttp.send();

}

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.350, lng: -6.260 },
    zoom: 14,
  })

  function createMarkers(stations) {
    // For each station in the stations list, create a new marker
    for (let i = 0; i < stations.length; i++) {
      var marker = new google.maps.Marker({
        position: stations[i].stationPosition,
        map,
        title: stations[i].stationName,
      });
      marker.setMap(map)
    };
  }

  // Call the getStationsData function using the createMarkers function.
  // This will call the function that executes the get request, wait for the stations to load, and then call the create markers function with the loaded stations
  getStationsData(createMarkers);

}

// window.initMap refers to the initmap callback in the html page
window.initMap = initMap;