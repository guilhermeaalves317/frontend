<template>
  <div class="flex justify-center items-center mt-4 p-2 w-100">
    <p class="text-white text-center">{{ $gettext('RER - Rural Environmental Registry.') }} - v{{ version }}</p>
  </div>
</template>

<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import { ref } from 'vue'
const { $gettext } = useGettext()
const version = ref<string>(__APP_VERSION__)
</script>

<style scoped>
div {
  background-color: #04132a;
}
</style>
