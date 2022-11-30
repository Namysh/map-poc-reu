// https://medium.com/@droushi/mapbox-cluster-icons-based-on-cluster-content-d462a5a3ad5c
import mapboxgl from "mapbox-gl";

let sources = []
let layers = []
// let events = []

const hide = (map) => {
    layers.forEach(layer => map.removeLayer(layer))
    sources.forEach(source => map.removeSource(source))

    layers = []
    sources = []
}

const show = (map, CLUSTERS, loading) => {

    const fakeData = {
        type: 'FeatureCollection',
            features: Array.from({ length: 2000000 }, () => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    Math.random() * 45 - 0,
                    Math.random() * 45 - 0
                ]
            }
        }))
    }
    console.time()
    map.addSource('earthquakes', {
        type: 'geojson',
        data: fakeData,
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50
    });
    console.timeEnd()

    loading.value=true

    console.time()
    map.on('sourcedata', (r) => {
        if(r.sourceId === 'earthquakes') {
            if(r.isSourceLoaded) {
                if(!loading.value) return
                loading.value = false
                console.timeEnd()
                console.log('loaded', loading.value)
            }
        }
    })

    sources.push('earthquakes')

    map.addLayer({
        id: 'clusters',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
            'icon-image': [
                'step',
                ['get', 'point_count'],
                ...CLUSTERS.flatMap(cluster => [cluster.name, ...cluster?.max ? [cluster.max] : []])
            ],
            'icon-size': 1,
            'icon-allow-overlap': true,
        },
    });
    layers.push('clusters')


    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });
    layers.push('cluster-count')

    map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        layout: {
            'icon-image': 'container-green',
            'icon-size': 0.4,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true

        }
    });
    layers.push('unclustered-point')

    const handleCluterClick = (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('earthquakes').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    }
    map.on('click', 'clusters', handleCluterClick);
    // events.push(['click', 'clusters', handleCluterClick])

    const handlePointClick = (e) => {
        alert('Vessel clicked')
    }

    map.on('click', 'unclustered-point', handlePointClick);
    // events.push(['click', 'unclustered-point', handlePointClick])

    const handleMouseEnter = () => {
        map.getCanvas().style.cursor = 'pointer';
    }
    map.on('mouseenter', 'clusters', handleMouseEnter);
    // events.push(['mouseenter', 'clusters', handleMouseEnter])

    const handleMouseLeave = () => {
        map.getCanvas().style.cursor = '';
    }
    map.on('mouseleave', 'clusters', handleMouseLeave);
    // events.push(['mouseleave', 'clusters', handleMouseLeave])

    setupShiftSelect(map)
}

// https://docs.mapbox.com/mapbox-gl-js/example/using-box-queryrenderedfeatures/
const setupShiftSelect = map => {
    map.boxZoom.disable();
    const canvas = map.getCanvasContainer();
    let start;
    let current;
    let box;
    canvas.addEventListener('mousedown', mouseDown, true);

    function mousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return new mapboxgl.Point(
            e.clientX - rect.left - canvas.clientLeft,
            e.clientY - rect.top - canvas.clientTop
        );
    }

    function mouseDown(e) {
        if (!(e.shiftKey && e.button === 0)) return;

        map.dragPan.disable();

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('keydown', onKeyDown);

        start = mousePos(e);
    }

    function onMouseMove(e) {
        current = mousePos(e);

        if (!box) {
            box = document.createElement('div');
            box.classList.add('boxdraw');
            canvas.appendChild(box);
        }

        const minX = Math.min(start.x, current.x),
            maxX = Math.max(start.x, current.x),
            minY = Math.min(start.y, current.y),
            maxY = Math.max(start.y, current.y);

        const pos = `translate(${minX}px, ${minY}px)`;
        box.style.transform = pos;
        box.style.width = maxX - minX + 'px';
        box.style.height = maxY - minY + 'px';
    }

    function onMouseUp(e) {
        finish([start, mousePos(e)]);
    }

    function onKeyDown(e) {
        if (e.keyCode === 27) finish();
    }

    function finish(bbox) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('mouseup', onMouseUp);

        if (box) {
            box.parentNode.removeChild(box);
            box = null;
        }

        if (bbox) {
            const features = map.queryRenderedFeatures(bbox, {
                layers: ['unclustered-point', 'clusters']
            });

            if (features.length) {
                const bounds = new mapboxgl.LngLatBounds();
                features.forEach(feature => {
                    bounds.extend(feature.geometry.coordinates);
                    console.log(feature.geometry.coordinates)

                })

                map.easeTo(
                    {
                        center: bounds.getCenter(),
                        zoom: map.getZoom() + 1
                    }
                )
            }
        }

        map.dragPan.enable();
    }
}

export default {
    hide,
    show
}