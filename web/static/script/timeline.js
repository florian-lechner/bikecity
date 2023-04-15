import { context } from "./context.js";

function createSlider(){
    // set slider initial value to be now

    const hourSlider = document.getElementById("heat-map-slider");

    fetch("/getTimelineAvailability")
    .then((response) => response.json())
    // .then((stations) => (stations));

}


function addSliderListener() {

    const hourSlider = document.getElementById("heat-map-slider");

    hourSlider.addEventListener("input", function () {
        const sliderValue = parseInt(hourSlider.value);
        hourSlider.value = sliderValue;
        console.log("Value changed, new value is:" + sliderValue);
        context.markers.forEach(marker => {
            let value = sliderValue/24;
            let hue = ((value) * 120).toString(10);
            let color = ["hsl(", hue, ", 100%, 70%)"].join("")
            marker.icon.fillColor = color;
            marker.setIcon(marker.icon);
            // marker.setMap(null);
            // marker.setMap(context.map);
        });
    });

}

export { addSliderListener }