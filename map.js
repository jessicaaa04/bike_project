// Set Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoibWlub3VpdWkxMiIsImEiOiJjbTdkb2ZwZTUwMDA4MmxuOGhieDhkdnpqIn0.puPXRJUXMKMc9072BWXsSg';

// Initialize the Map
const map = new mapboxgl.Map({
    container: 'map',  // ID of the div where the map will be displayed
    style: 'mapbox://styles/mapbox/streets-v12', // Base map style
    center: [-71.09415, 42.36027], // Boston area [Longitude, Latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum zoom level
    maxZoom: 18  // Maximum zoom level
});

// Add Navigation Controls
map.addControl(new mapboxgl.NavigationControl());

// Bike Lane Style Configuration (Used for both Boston & Cambridge)
const bikeLaneStyle = {
    'line-color': '#32D400',  // Bright green for visibility
    'line-width': 5,  // Thicker lines
    'line-opacity': 0.6  // Less transparency for better visibility
};

// Ensure the map loads before adding data
map.on('load', () => {
    console.log("✅ Map has successfully loaded.");

    // Add the GeoJSON Data Source for Boston Bike Lanes
    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });

    console.log("📡 Boston bike lanes data source added.");

    // Add a layer to visualize the Boston bike lanes
    map.addLayer({
        id: 'bike-lanes-boston',
        type: 'line',
        source: 'boston_route',
        paint: bikeLaneStyle
    });

    console.log("🚲 Boston bike lanes layer added!");

    map.addSource('cambridge_bike_lanes', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });

    console.log("📡 Cambridge bike lanes data source added.");

    // Add a layer to visualize the Cambridge bike lanes
    map.addLayer({
        id: 'bike-lanes-cambridge',
        type: 'line',
        source: 'cambridge_route',
        paint: bikeLaneStyle
    });

    console.log("🚲 Cambridge bike lanes layer added!");
});

// Debugging: Click Event to Check Coordinates
map.on('click', (event) => {
    console.log("📍 Clicked at: ", event.lngLat);
});
