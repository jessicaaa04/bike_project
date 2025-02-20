mapboxgl.accessToken = 'pk.eyJ1IjoibWlub3VpdWkiLCJhIjoiY203ZDFyam0wMHd4ODJscG5zdng3YnYyNyJ9.V5gUL9ivzBE4X8VImnfJ9Qpk.eyJ1IjoibWlub3VpdWkiLCJhIjoiY203ZDJtZmM2MGFndDJrcHR3ZnYyanVobCJ9.zdkwluy8fJVDDbho78Myygpk.eyJ1IjoibWlub3VpdWkxMiIsImEiOiJjbTdkMnJvbWcweXRkMmpvc3V0NHNzd2Y4In0.Dgr0NgTKKnoL-kYYjTMOZA'
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-71.09415, 42.36027], // Longitude, Latitude (Boston area)
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18 // Maximum allowed zoom
});
