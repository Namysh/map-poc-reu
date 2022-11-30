<script setup>
import {ref, reactive, computed} from 'vue'

const emit = defineEmits(['toggleCluster', 'toggleLine', 'togglePoiZoi'])

const actions = reactive([
  {
    label: 'Cluster',
    emit: 'toggleCluster',
    value: true,
  },
  {
    label: 'Line',
    emit: 'toggleLine',
    value: true,
  },
  {
    label: 'POI',
    emit: 'togglePoiZoi',
    value: false,
    // subActions: [
    //   {
    //     label: 'Draw',F
    //     emit: 'drawPoiZoi'
    //   }
    // ]
  },
])

actions.forEach(action => emit(action.emit, action.value))
</script>

<template>
  <ul class="p-4 rounded-xl bg-teal-500">
    <li
        v-for="action in actions"
        :key="action.label"
    >
      <label >
        <input type="checkbox" :checked="action.value" v-model="action.value" @change="emit(action.emit, action.value)"/>
        {{ action.label }}
      </label>
<!--      <ul>-->
<!--        <li v-if="action.subActions && action.value" v-for="subAction in action.subActions" :key="subAction.label">-->
<!--          <button @click="emit(subAction.emit)">{{subAction.label}}</button>-->
<!--        </li>-->
<!--      </ul>-->
    </li>
  </ul>
</template>

<style>

</style>

