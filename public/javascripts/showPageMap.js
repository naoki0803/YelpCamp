mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // style: 'mapbox://styles/mapbox/streets-v12', // style URL
    // style: 'mapbox://styles/mapbox/navigation-night-v1',
    style: 'mapbox://styles/mapbox/light-v10',
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 11, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker and add it to the map.
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p> `)
    )

    .addTo(map);