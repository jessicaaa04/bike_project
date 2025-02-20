mapboxgl.accessToken = 'pk.eyJ1IjoibWlub3VpdWkiLCJhIjoiY203ZDFyam0wMHd4ODJscG5zdng3YnYyNyJ9.V5gUL9ivzBE4X8VImnfJ9Qpk.eyJ1IjoibWlub3VpdWkiLCJhIjoiY203ZDJtZmM2MGFndDJrcHR3ZnYyanVobCJ9.zdkwluy8fJVDDbho78Myygpk.eyJ1IjoibWlub3VpdWkxMiIsImEiOiJjbTdkMnJvbWcweXRkMmpvc3V0NHNzd2Y4In0.Dgr0NgTKKnoL-kYYjTMOZA'

// Check if Mapbox GL JS is loaded
if (mapboxgl) {
    console.log("Mapbox GL JS is loaded correctly");

    // Initialize the map
    const map = new mapboxgl.Map({
        container: 'map', // Make sure this matches the <div id="map"> in index.html
        style: 'mapbox://styles/mapbox/streets-v12', // Correct format
        center: [-71.09415, 42.36027], // [Longitude, Latitude] (Boston area)
        zoom: 12, // Initial zoom level
        minZoom: 5, // Minimum zoom level
        maxZoom: 18  // Maximum zoom level
    });

    // Add zoom & rotation controls to the map
    map.addControl(new mapboxgl.NavigationControl());

    // Debugging: Log when map finishes loading
    map.on('load', () => {
        console.log("Map has loaded successfully!");
    });

} else {
    console.error("Mapbox GL JS failed to load.");
}