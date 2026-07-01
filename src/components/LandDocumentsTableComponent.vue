<script setup lang="ts">
import { translateDocumentType, translateHoldingType } from '@/i18n/dynamicTranslations'
import { useGettext } from 'vue3-gettext'
import type { PropertyRightsData } from '@/context/PropertyRights'
import { faMap, faPenToSquare, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { PropType } from 'vue'
import { ref } from 'vue'
const { $gettext } = useGettext()

import { useRouter } from 'vue-router'

const router = useRouter()

const editingIndex = ref<number | null>(null)

const { propertyRightsData } = defineProps({
  propertyRightsData: {
    type: Array as PropType<PropertyRightsData[]>,
    required: true,
  },
})

const emit = defineEmits<{
  removePropertyInformation: [index: number]
  editPropertyInformation: [data: PropertyRightsData, index: number]
  clearEditing: []
}>()

const editProperty = (data: PropertyRightsData, index: number) => {
  if (editingIndex.value === index) {
    editingIndex.value = null
    emit('clearEditing')
  } else {
    editingIndex.value = index
    emit('editPropertyInformation', data, index)
  }
}

const clearEditing = () => {
  editingIndex.value = null
}

defineExpose({
  clearEditing,
})

const cityState = (el: any) => {
  const city = el?.cityOfTheNotaryOffice
    ? el.cityOfTheNotaryOffice
        .split('_')
        .map((word) => (word ? word[0].toUpperCase() + word.substring(1) : ''))
        .join(' ')
    : ''

  const state = el?.stateOfTheNotaryOffice || ''

  return [city, state].filter(Boolean).join('-')
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th class="font-bold">{{ $gettext('Type') }}</th>
        <th class="font-bold">{{ $gettext('Document Type') }}</th>
        <th class="font-bold">
          {{ $gettext('Title deed/ Land Document') }}
        </th>
        <th class="font-bold">{{ $gettext('Property Name') }}</th>
        <th class="font-bold">
          {{ $gettext('State and City of the Notary Office') }}
        </th>
        <th class="font-bold">{{ $gettext('Area') + '(ha)' }}</th>
        <th class="font-bold">{{ $gettext('Actions') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        :class="editingIndex === ix ? 'bg-[#EEF6FD]' : ''"
        v-for="(el, ix) in propertyRightsData"
        :key="ix"
      >
        <td>{{ translateHoldingType(el.propertyLandholding, $gettext) }}</td>
        <td>
          {{
            el.documentType ? translateDocumentType(String(el.documentType), $gettext) : ''
          }}
        </td>
        <td>{{ el.titleDeedLandDocument }}</td>
        <td>{{ el.registeredPropertyName }}</td>
        <td>{{ cityState(el) }}</td>
        <td>{{ el.area + ' ha' }}</td>
        <td>
          <div class="space-x-2">
            <FontAwesomeIcon
              :icon="faMap"
              :style="{ color: '#42916e' }"
              @click="router.push('/register/property_map')"
              class="cursor-pointer"
            />
            <button @click="editProperty(el, ix)">
              <FontAwesomeIcon
                :icon="editingIndex === ix ? faTimes : faPenToSquare"
                :style="{ color: '#42916e' }"
                class="cursor-pointer"
              />
            </button>
            <button @click="emit('removePropertyInformation', ix)">
              <FontAwesomeIcon
                :icon="faTrash"
                :style="{ color: '#42916e' }"
                class="cursor-pointer"
              />
            </button>
          </div>
        </td>
      </tr>

      <tr v-if="propertyRightsData.length == 0">
        <td colspan="7">{{ $gettext('There is no data to show.') }}</td>
      </tr>
    </tbody>
  </table>
</template>
