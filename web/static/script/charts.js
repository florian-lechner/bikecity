import { context, routeParams } from "./context.js";
import { availabilityCanvas } from "./distance.js";
import { zoomOnPolyline } from "./route.js";

var dailyChart;
var weeklyChart;

function createCircleCharts(stationAvailability){
    let totalBikes = stationAvailability.available_bikes + stationAvailability.available_stands;
    availabilityCanvas('chart-bikes', stationAvailability.available_bikes, totalBikes);
    let available_bike_num = document.getElementById('chart-available-bikes');
    available_bike_num.innerHTML = stationAvailability.available_bikes;
    availabilityCanvas('chart-stands', stationAvailability.available_stands, totalBikes);
    let available_stand_num = document.getElementById('chart-available-stands');
    available_stand_num.innerHTML = stationAvailability.available_stands;
}

function createCharts(stationAvailability, historicalStationData) {

    // Add close event to X
    addChartWindowCloseEvent();

    // Set the title of the window
    if (context.openChartWindow == undefined) {
        context.openChartWindow = document.getElementById("chart-window");
    }
    context.openChartWindow.children[0].children[0].innerHTML = stationAvailability.name;

    // Variable for open hours
    const openHours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    let openTime = openHours.map((hour) => hoursToLabel(hour));
    // Variable to hold days of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let today = days[context.applicationTime.getDay()];
    let now = hoursToLabel(context.applicationTime.getHours());
  

    // Get all values that correspond to the selected day
    let singleDay = historicalStationData.filter(
        entry => entry.day == days[context.applicationTime.getDay()] && openHours.includes(entry.hour));
    singleDay = singleDay.sort((a, b) => a.hour - b.hour);

    // Generate array for each hour of the day
    let dailyData = singleDay.map((hour) => hour.average_bike_availability);

    // Get constant to store the total bikes  
    let totalBikes = stationAvailability.available_bikes + stationAvailability.available_stands;

    if (context.markerDisplayMode != 'bikes'){
        dailyData = dailyData.map((hour) => totalBikes - hour);
    }

    // If there is already a chart, destroy it
    if (dailyChart != undefined) {
        dailyChart.destroy();
    }
    // Display the daily chart
    dailyChart = displayChart('daily', openTime, 'Available Bikes', dailyData, dailyData, now, totalBikes);

    // Declare array to store the average per day of the week
    let weeklyData = []
    // Get the average

    days.forEach(day => {
        let bikes = 0;
        let count = 0;
        historicalStationData.forEach(entry => {
            if (entry.day == day) {
                bikes += entry.average_bike_availability;
                count++;
            }
        });
        weeklyData.push(bikes / count);
    })

    // If there is already a chart, destroy it
    if (weeklyChart != undefined) {
        weeklyChart.destroy();
    }
    // Display the weekly chart
    weeklyChart = displayChart('weekly', days, 'Available Bikes', weeklyData, null, today, totalBikes);

    // Open the chart window
    openChartWindow(stationAvailability);
    let max = stationAvailability.available_bikes + stationAvailability.available_stands;
}

function displayChart(chartId, chartLabels, chartTitle, historicalChartData, realChartData, highlightLabel, chartMax) {
    const chart = new Chart(
        document.getElementById(chartId),
        {
            data: {
              labels: chartLabels,
              datasets: [
                {
                  type: 'bar',
                  label: "Historical" + chartTitle,
                  data: historicalChartData,
                  yAxisID: 'y',
                  xAxisID: 'x',
                  backgroundColor: populateBarColors(chartLabels, historicalChartData, '#B0EFFF', '#459CB2', highlightLabel),
                  borderColor: '#243c42',
                  order: 0
                },
                {
                  type: 'line',
                  label: "Current " + chartTitle,
                  data: realChartData,
                  yAxisID: 'y',
                  xAxisID: 'x',
                  borderColor: 'White',
                  borderWidth: 1,
                  order: 1
                }
              ]
            },
            options: {
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: {
                  id: 'x',
                  grid: { color: '#243c42' }
                },
                y: {
                  id: 'y',
                  grid: { color: '#243c42' },
                  ticks: {  beginAtZero: true},
                  max: chartMax,
                }
              }
            }
          }
    );
    return chart;
}

function hoursToLabel(hour){
    if (hour < 12) {
        return String(hour + ":00 AM");
    } else if (hour === 12) {
        return String(hour + ":00 PM");
    } else {
        return String(hour - 12 + ":00 PM");
    }
}

function populateBarColors(labels, dataset, mainColor, highlightColor, highlightCondition) {
    let backgroundColors = []
    labels.map((label) => {
        if (label == highlightCondition) {
            backgroundColors.push(highlightColor);
        }
        else {
            backgroundColors.push(mainColor);
        }
    });

    return backgroundColors
}

function openChartWindow() {
    context.openChartWindow.style.right = "30px";
    context.openChartWindow.style.display = "block";
    if (routeParams.routePolylines != undefined) {
        zoomOnPolyline(routeParams.routePolylines);
    }
}

function closeChartWindow() {
    var pos = 30;
    var id = setInterval(frame, 10);

    function frame() {
        if (pos <= -360) {
            clearInterval(id);
            context.openChartWindow.style.display = "none";
            context.openChartWindow = undefined;
            if (routeParams.routePolylines != undefined) {
                zoomOnPolyline(routeParams.routePolylines);
            }
        } else {
            pos -= 20;
            context.openChartWindow.style.right = pos + "px";
        }
    }
}

function addChartWindowCloseEvent() {
    document.getElementById("close-chart-window").addEventListener("click", closeChartWindow);
}


export { createCharts, createCircleCharts }