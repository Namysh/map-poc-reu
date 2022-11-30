import {watch, ref} from 'vue'

const storeUseMapboxDarkable = () => {
    const layers = []

    const useMapboxDarkable = (map, theme = ref('light')) => {
        const addDarkableLayer = (properties, darkableProperties) => {
            map.addLayer(properties);
            layers.push({id: properties.id, ...darkableProperties})
        }

        const toggleLayers = () => {
            layers.forEach((properties) => {
                properties.layout &&= Object.entries(properties.layout).reduce((acc, [layoutProperty, layoutValue]) => {
                    const currentLayoutValue = map.getLayoutProperty(properties.id, layoutProperty)
                    console.log(map, properties.id, layoutProperty, layoutValue)
                    map.setLayoutProperty(properties.id, layoutProperty, layoutValue)
                    return {...acc, [layoutProperty]: currentLayoutValue}
                }, {})

                properties.paint &&= Object.entries(properties.paint).reduce((acc, [paintProperty, paintValue]) => {
                    const currentPaintValue = map.getPaintProperty(properties.id, paintProperty)
                    map.setPaintProperty(properties.id, paintProperty, paintValue)
                    return {...acc, [paintProperty]: currentPaintValue}
                }, {})

            })
        }

        theme.value === 'dark' && toggleLayers()
        watch(theme, toggleLayers)

        return {
            addDarkableLayer
        }
    }

    return useMapboxDarkable
}


export default storeUseMapboxDarkable()

export {
    storeUseMapboxDarkable
}