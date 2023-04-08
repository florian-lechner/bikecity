import { context } from "./context.js";

var dailyChart;
var weeklyChart;

function createCharts(stationAvailability, historicalStationData) {
    
    addChartWindowCloseEvent();
    // Set the title of the window
    if (context.openChartWindow == undefined) {
        context.openChartWindow = document.getElementById("chart-window");
    }
    context.openChartWindow.children[1].innerHTML = stationAvailability.name;

    const openHours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    
    var openTime = openHours.map((hour) => {
        if (hour < 12) {
          return String(hour + ":00 AM");
        } else if (hour === 12) {
          return String(hour + ":00 PM");
        } else {
          return String(hour - 12 + ":00 PM");
        }
      });
    
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    // Get all values that correspond to the selected day
    var singleDay = historicalStationData.filter(
        entry => entry.day == days[context.applicationTime.getDay()] && openHours.includes(entry.hour));
    singleDay = singleDay.sort((a, b) => a.hour - b.hour);

    // Generate array for each hour of the day
    const dailyData = singleDay.map((hour) => hour.average_bike_availability);

    // Display the daily chart data
    if (dailyChart != undefined) {
        dailyChart.destroy();
    }
     dailyChart = displayChart('daily', openTime, 'Available Bikes', dailyData);


    let weeklyData = []
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
    if (weeklyChart != undefined) {
        weeklyChart.destroy();
    }
    weeklyChart = displayChart('weekly', days, 'Available Bikes', weeklyData);
    
    openChartWindow(stationAvailability);
}

function displayChart(chartId, chartLabels, chartTitle, chartData) {
    var chart = new Chart(
        document.getElementById(chartId),
        {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [ { label: chartTitle, data: chartData,backgroundColor: '#B0EFFF' } ]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            },
        }
    );
    return chart;
}

function openChartWindow() {
    context.openChartWindow.style.right = "0px";
    context.openChartWindow.style.display = "block";
}

function closeChartWindow() {
    var pos = 0;
    var id = setInterval(frame, 10);

    function frame() {
        if (pos <= -360) {
            clearInterval(id);
            context.openChartWindow.style.display = "none";
        } else {
            pos -= 20;
            context.openChartWindow.style.right = pos + "px";
        }
    }
}

function addChartWindowCloseEvent() {
    document.getElementById("close-chart-window").addEventListener("click", closeChartWindow);
}


export { createCharts }