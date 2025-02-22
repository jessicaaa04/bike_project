mapboxgl.accessToken = 'pk.eyJ1IjoibWlub3VpdWkxMiIsImEiOiJjbTdkb2ZwZTUwMDA4MmxuOGhieDhkdnpqIn0.puPXRJUXMKMc9072BWXsSg';

// Initialize the Map
const map = new mapboxgl.Map({
    container: 'map',  
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: [-71.09415, 42.36027], 
    zoom: 12, 
    minZoom: 5, 
    maxZoom: 18  
});

// Add Navigation Controls
map.addControl(new mapboxgl.NavigationControl());

// Define Bike Lane Styling
const bikeLaneStyle = {
    'line-color': '#32D400',
    'line-width': 5,  
    'line-opacity': 0.6  
};

// Append SVG for D3 Elements
const svg = d3.select("#map").append("svg")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("width", "100%")
    .style("height", "100%")
    .style("pointer-events", "none"); 

// Create Tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("visibility", "hidden");

// Global Variables
let stations = [];
let trips = [];
let radiusScale;
let filteredTrips = []; 
let filteredArrivals = new Map();
let filteredDepartures = new Map();
let filteredStations = [];
let timeFilter = -1;
// Define traffic flow scale
let stationFlow = d3.scaleQuantize()
    .domain([0, 1])  // Input: Departure ratio (0 - 1)
    .range([0, 0.5, 1]);  // Output: Three discrete color values

// Select the slider and time display elements
const timeSlider = document.getElementById('time-slider');
const selectedTime = document.getElementById('selected-time');
const anyTimeLabel = document.getElementById('any-time');

// Function to format time as HH:MM AM/PM
function formatTime(minutes) {
    const date = new Date(0, 0, 0, 0, minutes);
    return date.toLocaleTimeString('en-US', { timeStyle: 'short' });
}

// Function to compute station traffic dynamically
function computeStationTraffic(stations, trips) {
    const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
    const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);

    return stations.map(station => {
        let id = station.short_name;
        return {
            ...station,
            arrivals: arrivals.get(id) ?? 0,
            departures: departures.get(id) ?? 0,
            totalTraffic: (arrivals.get(id) ?? 0) + (departures.get(id) ?? 0)
        };
    });
}

// Function to convert date to minutes since midnight
function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
}

// Function to filter trips by time
function filterTripsByTime(trips, timeFilter) {
    return timeFilter === -1 ? trips : trips.filter(trip => {
        const startedMinutes = minutesSinceMidnight(trip.started_at);
        const endedMinutes = minutesSinceMidnight(trip.ended_at);
        return Math.abs(startedMinutes - timeFilter) <= 60 || Math.abs(endedMinutes - timeFilter) <= 60;
    });
}

// Function to update scatterplot dynamically
// Function to update scatterplot dynamically
function updateScatterPlot(timeFilter) {
    // Filter trips based on time
    filteredTrips = filterTripsByTime(trips, timeFilter);

    // Recompute station traffic based on filtered trips
    filteredStations = computeStationTraffic(stations, filteredTrips);

    // Adjust circle scale dynamically based on filtering
    timeFilter === -1 ? radiusScale.range([0, 25]) : radiusScale.range([3, 50]);

    // Bind data and update circles
    const circles = svg.selectAll('circle')
        .data(filteredStations, d => d.short_name);

    circles.join(
        enter => enter.append('circle')
            .attr("pointer-events", "auto")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0.8)  // Increase visibility
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`<b>${d.totalTraffic} trips</b><br>${d.departures} departures, ${d.arrivals} arrivals`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY - 20}px`).style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"))
            .merge(circles)
            .attr('r', d => radiusScale(d.totalTraffic))
            .style('--departure-ratio', d => {
                let ratio = d.totalTraffic > 0 ? d.departures / d.totalTraffic : 0.5;
                return ratio;
            }),
        update => update
            .attr('r', d => radiusScale(d.totalTraffic))
            .style('--departure-ratio', d => {
                let ratio = d.totalTraffic > 0 ? d.departures / d.totalTraffic : 0.5;
                return ratio;
            }),
        exit => exit.remove()
    );

    updatePositions();
}

// Function to update time display and scatterplot
function updateTimeDisplay() {
    let timeFilter = Number(timeSlider.value); // Get slider value

    if (timeFilter === -1) {
        selectedTime.textContent = ''; // Clear displayed time
        anyTimeLabel.style.display = 'block'; // Show "(any time)"
    } else {
        selectedTime.textContent = formatTime(timeFilter); // Display formatted time
        anyTimeLabel.style.display = 'none'; // Hide "(any time)"
    }

    // Call updateScatterPlot to update colors dynamically
    updateScatterPlot(timeFilter);
}


// Function to update positions when map moves
function updatePositions() {
    if (!radiusScale) {
        console.error("🚨 radiusScale is not initialized yet!");
        return;
    }

    svg.selectAll('circle')
        .attr('cx', d => getCoords(d).cx)
        .attr('cy', d => getCoords(d).cy);
}

// Function to project coordinates to the map
function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}

// Load data and initialize visualization
map.on('load', () => {
    console.log("✅ Map has successfully loaded.");

    // Load bike lanes
    map.addSource('boston_route', { type: 'geojson', data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson' });
    map.addLayer({ id: 'bike-lanes-boston', type: 'line', source: 'boston_route', paint: bikeLaneStyle });

    map.addSource('cambridge_bike_lanes', { type: 'geojson', data: 'assets/cambridge_bike_lanes.geojson' });
    map.addLayer({ id: 'bike-lanes-cambridge', type: 'line', source: 'cambridge_bike_lanes', paint: bikeLaneStyle });

    console.log("🚲 Bike lanes added!");

    // Load station data
    d3.json('assets/bluebikes-stations.json')
        .then(jsonData => {
            stations = jsonData.data.stations;
            return d3.csv('assets/bluebikes-traffic-2024-03.csv', trip => ({
                ...trip,
                started_at: new Date(trip.started_at),
                ended_at: new Date(trip.ended_at)
            }));
        })
        .then(csvData => {
            trips = csvData;
            stations = computeStationTraffic(stations, trips);

            // Initialize radius scale
            radiusScale = d3.scaleSqrt()
                .domain([0, d3.max(stations, d => d.totalTraffic)])
                .range([0, 25]);

            // Draw initial visualization
            updateScatterPlot(timeFilter);
            timeSlider.addEventListener('input', updateTimeDisplay);
            updateTimeDisplay();
        })
        .catch(error => console.error("❌ Error loading data:", error));

    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('resize', updatePositions);
    map.on('moveend', updatePositions);
});

document.querySelectorAll("circle").forEach(circle => {
    console.log("CSS Departure Ratio:", circle.style.getPropertyValue("--departure-ratio"));
});
