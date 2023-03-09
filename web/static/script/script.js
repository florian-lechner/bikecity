var stations = [] // Declares an empty list of station objects that will store the json we get back from the server
var stylesArray = [
  [
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "weight": 8
        }
      ]
    },
    {
      "featureType": "transit.station.airport",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "transit.station.bus",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "transit.station.rail",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    }
  ]
]

let map; // Declares the map object that will be generated by the google maps api

function getStationsData(onStationDataLoaded) { // Function that will call whatever function is passed in as onStationDataLoaded
  // Get JSON Data
  var xmlhttp = new XMLHttpRequest();
  var url = "http://127.0.0.1:5000/getStations";

  // Empty the current stations list
  stations = []

  // Request station data from our own API, woah
  xmlhttp.onreadystatechange = function () {
    console.log(`readyState: ${this.readyState} and status: ${this.status}`);
    if (xmlhttp.readyState == 4) {
      // If status code is 200 (and the code is good), do this
      if (xmlhttp.status == 200) {
        var stations = JSON.parse(xmlhttp.responseText);
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

function createMarkers(stations) { // Function to create a marker for each station and add it to the map
  // For each station in the stations list, create a new marker
  let markers = [];
  let openInfoWindow;
  for (let i = 0; i < stations.length; i++) {
    var marker = new google.maps.Marker({
      position: { lat: stations[i].position_lat, lng: stations[i].position_lng },
      map,
      title: stations[i].name,
      animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    marker.setMap(map);  

    (function(currentIndex){
      marker.addListener("click", function() {
        console.log(currentIndex);
        getCurrentBikeAvailability(function (availability_data){
          
          // get the html contents of the info window
          let html = createPopUp(availability_data);
          
          // Define infor window
          const infoWindow = new google.maps.InfoWindow({
            content: html,
            ariaLabel: stations[currentIndex].name
          })
          
          // Open window at marker
          infoWindow.open({
            anchor: markers[currentIndex],
            map,
          });

          // Hide open window if there is any, set current window to open window
          if (openInfoWindow != undefined){
            openInfoWindow.close();
          }
          openInfoWindow = infoWindow;
          
          // Make markers bounce :)         
          markers[currentIndex].setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){
            markers[currentIndex].setAnimation(null);
          });

        }, stations[currentIndex].id);
      }
    )})(i)
  };
}

function getCurrentBikeAvailability(onBikeAvailabilityDataLoaded, id) {
  var xmlhttp = new XMLHttpRequest();
  var url = "http://127.0.0.1:5000/getLiveData/" + id

  xmlhttp.onreadystatechange = function () {
    console.log(`readyState: ${this.readyState} and status: ${this.status}`);
    if (xmlhttp.readyState == 4) {
      // If status code is 200 (and the code is good), do this
      if (xmlhttp.status == 200) {
        var availability_data = JSON.parse(xmlhttp.responseText);
        onBikeAvailabilityDataLoaded(availability_data)
      }
    }
  }

  // Open request from our own API, and send it
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function createPopUp(availability_data) { // Function to create a pop up for a station
  var stationInfo =
    '<div id="stationInfo">' +
    '<h1>' + availability_data.name + '<h1>' +
    '<p> Available Bikes: ' + availability_data.available_bikes + '<p>' +
    '<p> Available Stands: ' + availability_data.available_stands + '<p>' +
    '</div>'
  return stationInfo
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.350, lng: -6.260 },
    zoom: 14,
    styles: stylesArray,
  })

  // Call the getStationsData function using the createMarkers function.
  // This will call the function that executes the get request, wait for the stations to load, and then call the create markers function with the loaded stations
  getStationsData(createMarkers);
  searchBoxes();

  let openInfoWindow;
}

// Locations
var place_start;
var place_end;

// Input fields connection with GoogleAPI
function searchBoxes(){
  // Create the search box and link it to the UI element.
  const input_start = document.getElementById("start-location-field");
  const searchBox_start = new google.maps.places.SearchBox(input_start);

  const input_end = document.getElementById("end-location-field");
  const searchBox_end = new google.maps.places.SearchBox(input_end);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox_start.setBounds(map.getBounds());
    searchBox_end.setBounds(map.getBounds());
  });

  searchBox_start.addListener("places_changed", () => {
    place_start = searchBox_start.getPlaces();
  });

  searchBox_end.addListener("places_changed", () => {
    place_end = searchBox_end.getPlaces();
  });

}


window.initMap = initMap; // window.initMap refers to the initmap callback in the html page