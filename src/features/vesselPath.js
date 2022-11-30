import mapboxgl from "mapbox-gl";
import useMapboxDarkable from "../composables/useMapboxDarkable.js";
import {ref} from 'vue'
//
const theme = ref('light')
//
setInterval(() => {
    // theme.value = theme.value === 'dark' ? 'light' : 'dark'
}, 5000)


let layers = []
let sources = []

const hide = (map) => {
    layers.forEach(layer => map.removeLayer(layer))
    sources.forEach(source => map.removeSource(source))

    layers = []
    sources = []
}

const show = (map, vesselPath, otherPath) => {

    const {addDarkableLayer} = useMapboxDarkable(map, theme);

    map.addSource('vessel-points-source', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                ...vesselPath.map((vessel, index) => ({
                    type: 'Feature',
                    geometry: {type: 'Point', coordinates: [vessel.position.lng, vessel.position.lat]},
                    properties: {
                        timestamp: vessel.timestamp,
                        imo: vessel.imo,
                        'icon-name': index === vesselPath.length - 1 ? 'vessel-current' : 'vessel-loc',
                        'icon-size': index === vesselPath.length - 1 ? 0.3 : 0.2
                    },

                }))
            ]
        }
    });

    sources.push('vessel-points-source')

    map.addSource('vessel-route-source', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': vesselPath.map(vessel => [vessel.position.lng, vessel.position.lat])
            }
        }
    });
    sources.push('vessel-route-source')

    map.addSource('green-source', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': otherPath.map(point => [point[1], point[0]])
            }
        }
    })
    sources.push('green-source')

    map.addLayer({
        'id': 'vessel-route',
        'type': 'line',
        'source': 'vessel-route-source',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#666',
            'line-width': 2,
            'line-dasharray': [3, 3]
        }
    });

    layers.push('vessel-route')

    map.addLayer({
        'id': 'green-path',
        'type': 'line',
        'source': 'green-source',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#19DA99',
            'line-width': 2,
        }
    });

    layers.push('green-path')

    map.addLayer({
        'id': 'vessel-route-icons',
        'type': 'symbol',
        'source': 'vessel-points-source',
        'layout': {
            'icon-image': ['get', 'icon-name'],
            'icon-size': ['get', 'icon-size'],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
        }
    })

    layers.push('vessel-route-icons')

    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    })

    map.on('mouseenter', 'routered2', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        popup
            .setLngLat(e.features[0].geometry.coordinates)
            .setText("IMO: " + e.features[0].properties.imo + "\n" + new Date(e.features[0].properties.timestamp))
            .addTo(map);
    })

    map.on('mouseleave', 'routered2', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    })


    addDarkableLayer({
        'id': 'route',
        'type': 'symbol',
        'source': 'vessel-route-source',
        paint: {},
        layout: {
            'symbol-placement': 'line',
            'icon-allow-overlap': true,
            'icon-image': 'filled-arrow',
            'icon-rotate': 270,
            'icon-size': 1,
            'icon-rotation-alignment': 'map',
            'icon-ignore-placement': true
        }
    }, {layout: {'icon-image': 'arroow-dark'}});
    layers.push('route')


}

export default {
    show, hide
}