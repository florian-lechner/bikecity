import { context, storeTimelineData } from "./context.js";

function createSlider() {
    // set slider initial value to be now

    const hourSlider = document.getElementById("heat-map-slider");

    var getTimelineData = fetch("/getTimelineAvailability")
        .then((response) => response.json());

    var getCurrentTime = fetch("/getCurrentTimeForTesting")
        .then((response) => response.json())
        .then((time) => {
            let timelineTime = new Date(time.time);
            let hour = timelineTime.getHours();
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
        })
}


function addSliderListener() {
    const hourSlider = document.getElementById("heat-map-slider");
    hourSlider.addEventListener("input", function () {
        const sliderValue = parseInt(hourSlider.value);
        hourSlider.value = sliderValue;
        console.log("Value changed, new value is:" + sliderValue);
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

function addResetButtonListener(){
    const hourSlider = document.getElementById("heat-map-slider");
    const resetButton = document.getElementById("reset-slider");
    resetButton.addEventListener('click', function () {
        hourSlider.value = context.timeline_start_value; 
        updateMarkers(context.timeline_start_value);
    });

}


function animateSliderToMidnight() {
    const hourSlider = document.getElementById("heat-map-slider");

    function updateSlider() {
        const sliderValue = parseInt(hourSlider.value);
        if (sliderValue < 24 && context.timeline_is_animating) {
            hourSlider.value = sliderValue + 1;
            updateMarkers(sliderValue);
            setTimeout(updateSlider, 500);
        } 
        else if (context.timeline_is_animating) {
            hourSlider.value = context.timeline_start_value; 
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
    let hourData = context.timeline_data[sliderValue];

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
    let value = parseInt(station.average_bikes) / (parseInt(station.average_bikes) + parseInt(station.average_stands));
    let hue = ((value) * 120).toString(10);
    return ["hsl(", hue, ",100%,70%)"].join("");
}

export { createSlider }