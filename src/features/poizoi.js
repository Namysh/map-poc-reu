import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true,

    },
    defaultMode: 'draw_polygon',
});

let isSetup = false

const hide = (map) => {
    if(!isSetup) return
    map.removeControl(draw);
    isSetup = false
}

const show = map => {
    map.addControl(draw);
    isSetup = true
}

export default {
    show,
    hide
}