import { createCharts } from "./charts.js";
import { context, storeTimelineData } from "./context.js";

function createSlider() {
    // set slider initial value to be now

    const hourSlider = document.getElementById("heat-map-slider");
    const dateTime = document.getElementById("slider-date-time");
    const dateTimeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };
    const toggleDescription = document.getElementById("marker-toggle-description");

    var getTimelineData = fetch("/getTimelineAvailability")
        .then((response) => response.json());

    var getCurrentTime = fetch("/getCurrentTimeForTesting")
        .then((response) => response.json())
        .then((time) => {
            context.timeline_time = new Date(time.time);
            let hour = context.timeline_time.getHours();
            dateTime.innerHTML = context.timeline_time.toLocaleString(undefined, dateTimeOptions);
            toggleDescription.style.display = 'block';
            dateTime.style.display = 'block';
            context.timeline_start_value = hour;
            hourSlider.value = hour;
            return time;
        });

    Promise.all([getTimelineData, getCurrentTime])
        .then((responses) => {
            let timelineData = responses[0];
            let time = responses[1];
            storeTimelineData(timelineData);
            addSliderListener();
            addPlayButtonListener();
            addPauseButtonListener();
            addResetButtonListener();
            addMarkerToggleListener();
        })
}


function addSliderListener() {
    const hourSlider = document.getElementById("heat-map-slider");
    hourSlider.addEventListener("input", function () {
        const sliderValue = parseInt(hourSlider.value);
        hourSlider.value = sliderValue;
        updateTime(hourSlider.value);
        updateMarkers(sliderValue);
    });
}

function addPlayButtonListener() {
    const playButton = document.getElementById("play-button");
    playButton.addEventListener('click', function () {
        togglePausePlay();
        console.log("Animation?" + context.timeline_is_animating)
        animateSliderToMidnight();
    });
}

function addPauseButtonListener() {
    const pauseButton = document.getElementById("pause-button");
    pauseButton.addEventListener('click', function () {
        togglePausePlay();
    });
}

function addResetButtonListener() {
    const hourSlider = document.getElementById("heat-map-slider");
    const resetButton = document.getElementById("reset-slider");
    resetButton.addEventListener('click', function () {
        hourSlider.value = context.timeline_start_value;
        updateTime(hourSlider.value);
        updateMarkers(context.timeline_start_value);
    });

}


function animateSliderToMidnight() {
    const hourSlider = document.getElementById("heat-map-slider");

    function updateSlider() {
        const sliderValue = parseInt(hourSlider.value);
        if (sliderValue < 24 && context.timeline_is_animating) {
            hourSlider.value = sliderValue + 1;
            updateTime(hourSlider.value);
            updateMarkers(sliderValue);
            setTimeout(updateSlider, 500);
        }
        else if (context.timeline_is_animating) {
            hourSlider.value = context.timeline_start_value;
            updateTime(hourSlider.value);
            updateMarkers(context.timeline_start_value);
            togglePausePlay();
        }
    }



    updateSlider();
}

function togglePausePlay() {
    const playButton = document.getElementById("play-button");
    const pauseButton = document.getElementById("pause-button");

    context.timeline_is_animating = !context.timeline_is_animating;

    if (context.timeline_is_animating) {
        playButton.style.display = 'none';
        pauseButton.style.display = 'flex';
    } else {
        playButton.style.display = 'flex';
        pauseButton.style.display = 'none';
    }

}


function updateMarkers(sliderValue) {
    let hourData = context.timeline_data[sliderValue-1];

    context.markers.forEach(marker => {
        let station_data = hourData.filter(data => data.stationID == marker.stationId)[0];
        let color;
        if (station_data != undefined) {
            color = timelineAvailabilityColor(station_data);
        }
        else {
            color = '#888888'
        }
        marker.icon.fillColor = color;
        marker.setIcon(marker.icon);
    });
}

function timelineAvailabilityColor(station) {
    let value;
    if (context.markerDisplayMode == 'bikes') {
        value = parseInt(station.average_bikes) / (parseInt(station.average_bikes) + parseInt(station.average_stands));
    }
    else {
        value = parseInt(station.average_stands) / (parseInt(station.average_bikes) + parseInt(station.average_stands));
    }
    let hue = ((value) * 120).toString(10);
    return ["hsl(", hue, ",100%,70%)"].join("");
}

function addMarkerToggleListener() {
    const markerToggle = document.getElementById("marker-toggle");
    const hourSlider = document.getElementById("heat-map-slider");
    const description = document.getElementById("marker-toggle-description");
    const dailyChartTitle = document.getElementById("daily-chart-title");
    const weeklyChartTitle = document.getElementById("weekly-chart-title");

    markerToggle.addEventListener('change', function () {
        if (markerToggle.checked) {
            context.markerDisplayMode = 'stands';
            description.innerHTML = 'Viewing Bike Stands';
            dailyChartTitle.innerHTML = 'Average Hourly Bike Stand Availability';
            weeklyChartTitle.innerHTML = 'Average Daily Bike Stand Availability';
        }
        else {
            context.markerDisplayMode = 'bikes';
            description.innerHTML = 'Viewing Bikes';
            dailyChartTitle.innerHTML = 'Average Hourly Bike Availability';
            weeklyChartTitle.innerHTML = 'Average Daily Bike Availability';
        }
        updateMarkers(parseInt(hourSlider.value));

        if (context.openChartWindow != undefined) {
            let liveData = fetch("/getLiveBikeData/" + context.openInfoWindowStation)
                .then((response) => response.json());
            let historicalData = fetch("/getStationHistoricalData/" + context.openInfoWindowStation)
                .then((response) => response.json());
            let realData = fetch("/getTimelineStation/" + context.openInfoWindowStation)
                .then((response) => response.json());

            Promise.all([liveData, historicalData, realData])
                .then(([stationAvailability, historicalAvailability, realAvailability]) => {
                    createCharts(stationAvailability, historicalAvailability, realAvailability);
                });
        }
    })

}

function updateTime(hours) {
    const dateTime = document.getElementById("slider-date-time");
    const dateTimeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };

    const date = new Date(context.timeline_time); // Convert Unix timestamp to Date object
    date.setHours(hours);

    let dateString = date.toLocaleString('en-US', dateTimeOptions);

    dateTime.innerHTML = dateString;
}

export { createSlider }