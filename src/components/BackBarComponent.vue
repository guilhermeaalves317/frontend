<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import { useFormContext } from '@/context/useFormContext'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { $gettext } = useGettext()

const route = useRoute()
const router = useRouter()

const { resetFormData } = useFormContext()
const propertyEditing = computed(() => {
  if (localStorage.getItem('EditingRegistry')) {
    return JSON.parse(localStorage.getItem('EditingRegistry')!)
  } else {
    return {}
  }
})
const isEditingProperty = computed(() => Object.keys(propertyEditing.value).length > 0)
const propertyEditingName = computed(() => {
  return String(propertyEditing.value['name']).toUpperCase() || ''
})

const handleCancelEditing = () => {
  localStorage.removeItem('EditingRegistry')
  resetFormData()
  sessionStorage.removeItem('mapCaptured')
  sessionStorage.removeItem('mapState')
  window.location.href = router.resolve({ name: 'properties' }).href
}

const getBackBarText = computed(() => {
  if (route.path.includes('/register')) {
    return isEditingProperty.value
      ? $gettext('Edit property')
      : $gettext('Register property')
  }
  if (route.path.includes('properties/details/')) {
    return $gettext('Property Details')
  }

  switch (route.path) {
    case '/properties':
      return $gettext('Rural Properties')
    case '/profile':
      return 'Profile'
    default:
      return ''
  }
})

const goBack = () => {
  if (route.path.includes('/properties/details/')) {
    router.push({ name: 'properties' })
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div v-if="getBackBarText" class="ml-4 mr-3 mt-5">
    <div class="flex w-full">
      <div class="flex-1">
        <button @click="goBack">
          <FontAwesomeIcon :icon="faArrowLeft" class="primary-color" />
        </button>
        <span class="ml-4 text-3xl justify-self-start">{{ getBackBarText }}</span>
        <span
          v-if="isEditingProperty && getBackBarText.includes($gettext('Edit property'))"
          class="text-2xl justify-self-start"
          >: {{ propertyEditingName }}</span
        >
      </div>
      <div
        v-if="isEditingProperty && getBackBarText.includes($gettext('Edit property'))"
      >
        <button class="br-button secondary" @click.prevent="handleCancelEditing">
          {{ $gettext('Cancel editing') }}
        </button>
      </div>
    </div>
    <hr class="mt-3 mb-2 border" />
  </div>
</template>
