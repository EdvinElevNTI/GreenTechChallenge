const socket = io(); // Establish a connection to the server

socket.on('mean_update', function(mean_values) {

    console.log('Mean values:', mean_values);
    // Update the displayed mean values
    document.getElementById('mean-climate-friendly').textContent = mean_values['Climate Friendly'];
    document.getElementById('mean-balanced-climate').textContent = mean_values['Balanced Climate'];
    document.getElementById('mean-price-worthy').textContent = mean_values['Price Worthy'];
    document.getElementById('mean-price-price').textContent = mean_values['Price Price'];

    // Calculate the total of all mean values
    var total = mean_values['Climate Friendly'] + mean_values['Balanced Climate'] + mean_values['Price Worthy'] + mean_values['Price'];

    // Calculate the percentage of each mean value out of the total
    var climateFriendlyPercentage = (mean_values['Climate Friendly'] / total) * 100;
    var balancedClimatePercentage = (mean_values['Balanced Climate'] / total) * 100;
    var priceWorthyPercentage = (mean_values['Price Worthy'] / total) * 100;

    slider.addEventListener('input', function() {
        var value = slider.value;

        // Calculate the absolute difference between the slider value and each mean value
        var climateFriendlyDifference = Math.abs(value - climateFriendlyPercentage);
        var balancedClimateDifference = Math.abs(value - balancedClimatePercentage);
        var priceWorthyDifference = Math.abs(value - priceWorthyPercentage);

        // Find the smallest difference
        var smallestDifference = Math.min(climateFriendlyDifference, balancedClimateDifference, priceWorthyDifference);

        // Show the graph with the smallest difference
        if (smallestDifference === climateFriendlyDifference) {
            myChart.data.datasets[0].hidden = true;
            myChart.data.datasets[1].hidden = true;
            myChart.data.datasets[2].hidden = false;
        } else if (smallestDifference === balancedClimateDifference) {
            myChart.data.datasets[0].hidden = false;
            myChart.data.datasets[1].hidden = true;
            myChart.data.datasets[2].hidden = true;
        } else if (smallestDifference === priceWorthyDifference) {
            myChart.data.datasets[0].hidden = true;
            myChart.data.datasets[1].hidden = false;
            myChart.data.datasets[2].hidden = true;
        }

myChart.update();
});
});

var slider = document.getElementById('slider');
var indicator = document.getElementById('slider-indicator');

// Add an event listener for the 'input' event on the slider
slider.addEventListener('input', function() {
    var value = slider.value;

    indicator.textContent = value + '%';



    myChart.update();
});


let myChart; // Declare the chart variable outside the function

function initializeChart(data) {
const ctx = document.getElementById('myChart').getContext('2d');
const labels = Object.values(data)[0].map(item => new Date(item[0])); // Parse the dates

const datasets = Object.entries(data).map(([climate_type, cost_data], index) => {
let color;
switch (index) {
    case 0:
        color = 'black'; // Set color for the first dataset
        break;
    case 1:
        color = 'yellow'; // Set color for the second dataset
        break;
    case 2:
        color = 'red'; // Set color for the third dataset
        break;
    case 3:
        color = 'blue'; // Set color for the fourth dataset
        break;
    // Add more cases if needed
    default:
        color = 'black'; // Default color
}

return {
    label: climate_type,
    data: cost_data.map(item => ({ x: new Date(item[0]), y: item[1] })),
    fill: false,
    borderColor: color, // Set the border color for the line
    backgroundColor: color, // Set the fill color for the line
    pointBackgroundColor: color, // Set the color for the points on the line
    pointBorderColor: 'transparent', // Set the border color for the points
};
});

myChart = new Chart(ctx, {
type: 'line',
data: {
    labels: labels,
    datasets: datasets,
},
options: {
    responsive: true,
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'hour',
                displayFormats: {
                    hour: 'HH:mm'
                }
            },
            title: {
                display: true,
                text: 'Time'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Cost'
            }
        }
    }
}
});
}

const maxPoints = 24;  // Set this to your desired maximum number of points


function addData(climate_type, cost, time) {
    console.log("addData called");
    const datasetIndex = myChart.data.datasets.findIndex(ds => ds.label === climate_type);
    if (datasetIndex !== -1) {
        const dataset = myChart.data.datasets[datasetIndex];

        dataset.data.push({ x: new Date(time), y: cost });

        // If the number of data points exceeds the maximum, remove the oldest point
        if (dataset.data.length > maxPoints) {
            dataset.data.shift();
        }

        // Sort the data by time
        dataset.data.sort((a, b) => a.x - b.x);

        // Update the x axis maximum value to the time of the newest data point
        myChart.options.scales.x.max = dataset.data[dataset.data.length - 1].x;

        // Update the x axis minimum value to the time of the oldest data point
        myChart.options.scales.x.min = dataset.data[0].x;

        myChart.update();

        const lastDataPoint = dataset.data[dataset.data.length - 1];
localStorage.setItem('lastDataPointTime', lastDataPoint.x);
    }
}

// Listen for "cost_update" events from the server
socket.on("cost_update", function (data) {
    console.log("Cost update received:", data);
    if (myChart) {
        addData(data.climate_type, data.cost, data.time);
    }
});

// Initial fetch of data to populate the chart
fetch('/cost_data')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        initializeChart(data);
    });
    
