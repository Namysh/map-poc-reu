<script setup>
import {onMounted, ref} from "vue";
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import clusters from './features/cluster.js'
import poizoi from './features/poizoi.js'
import line from './features/vesselPath.js'
import 'mapbox-gl/dist/mapbox-gl.css';
import Toolbar from './components/Toolbar.vue'
import {CLUSTERS, VESSEL_PATH, OTHER_PATH} from "./data.js";

console.log('v1')

const mapRef = ref()
const mapLoaded = ref(false)

let map

onMounted(() => {
  mapboxgl.accessToken = 'pk.eyJ1IjoibmFteXNoIiwiYSI6ImNsNm5qYmIwajAxZHIzaXFwOHpraWhsNHoifQ.x6kTRjPrVRWz9JVl_doDPQ';
  map = new mapboxgl.Map({
    container: mapRef.value,
    style: 'mapbox://styles/mapbox/dark-v10?optimize=true',
    enter: [0, 0],
    zoom: 2
  });

  const loadImage = async (name, path) => {
    return new Promise((resolve, reject) => {
      map.loadImage(path, (error, image) => {
        if (error) {
          reject(error)
        } else {
          map.addImage(name, image)
          resolve()
        }
      })
    })
  }

  const loadClusterImages = async (clusters) => {
    return Promise.all(clusters.map(cluster => loadImage(cluster.name, cluster.path)))
  };

  map.on('load', async () => {
    console.time('addSource')
    await Promise.all([
      loadClusterImages(CLUSTERS),
      loadImage('arroow', 'marker-cluster/arrow.png'),
      loadImage('arroow-dark', 'marker-cluster/arrow-dark.png'),
      loadImage('vessel-loc', 'map/vessel_loc.png'),
      loadImage('vessel-current', 'map/vessel_current.png'),
      loadImage('filled-arrow', 'map/filled-arrow.png'),
      loadImage('container-green', 'map/container_green.png')
    ])
    console.timeEnd('addSource')
    mapLoaded.value = true
  })
})

const loading = ref(false)

const toggleCluster = value => {
  if (value) clusters.show(map, CLUSTERS, loading)
  else clusters.hide(map)
}

const toggleLine = value => {
  if (value) line.show(map, VESSEL_PATH, OTHER_PATH)
  else line.hide(map)
}

const togglePoiZoi = value => {
  if (value) poizoi.show(map)
  else poizoi.hide(map)
}
</script>

<template>
  <Toolbar v-if="mapLoaded" class="fixed  z-50 top-4 left-4" @toggleCluster="toggleCluster" @toggleLine="toggleLine"
           @togglePoiZoi="togglePoiZoi" ></Toolbar>
  <div id="map" ref="mapRef"></div>

  <div class="fixed inset-0 z-[100] backdrop-blur flex flex-col items-center justify-center" v-if="loading">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 transition-all h-12 text-white/50 animate-spin ">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
    <span class="font-bold uppercase text-white/50">creating clusters ...</span>

  </div>


</template>

<style>


</style>
