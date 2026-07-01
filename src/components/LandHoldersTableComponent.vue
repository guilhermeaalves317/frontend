<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import type { LandHoldersData } from '@/context/LandHoldersInformation'
import { faMap, faPenToSquare, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
const { $gettext } = useGettext()

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { PropType } from 'vue'
import { ref } from 'vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const editingIndex = ref<number | null>(null)

const props = defineProps({
  landHoldersData: {
    type: Array as PropType<LandHoldersData[]>,
    required: true,
  },
})

const emit = defineEmits<{
  removeOwnerHolder: [index: number]
  editOwnerHolder: [data: LandHoldersData, index: number]
  clearEditing: []
}>()

const editHolder = (data: LandHoldersData, index: number) => {
  if (editingIndex.value === index) {
    editingIndex.value = null
    emit('clearEditing')
  } else {
    editingIndex.value = index
    emit('editOwnerHolder', data, index)
  }
}

const clearEditing = () => {
  editingIndex.value = null
}

defineExpose({
  clearEditing,
})
</script>

<template>
  <table>
    <thead>
      <tr>
        <th class="font-bold">
          {{ $gettext('Legal personality') }}
        </th>
        <th class="font-bold">
          {{ $gettext('Taxpayer ID') }}
        </th>
        <th class="font-bold">
          {{ $gettext('Name') }}
        </th>
        <th class="font-bold">
          {{ $gettext('Actions') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        :class="editingIndex === ix ? 'bg-[#EEF6FD]' : ''"
        v-for="(el, ix) in props.landHoldersData"
        :key="ix"
      >
        <td>
          {{
            el.legalPersonality == 'natural_person'
              ? $gettext('Natural Person')
              : $gettext('Legal Entity')
          }}
        </td>
        <td>{{ el.id }}</td>
        <td>{{ el.name }}</td>
        <td>
          <div class="space-x-2">
            <FontAwesomeIcon
              :icon="faMap"
              :style="{ color: '#42916e' }"
              @click="router.push('/register/property_map')"
              class="cursor-pointer"
            />
            <button @click="editHolder(el, ix)">
              <FontAwesomeIcon
                :icon="editingIndex === ix ? faTimes : faPenToSquare"
                :style="{ color: '#42916e' }"
                class="cursor-pointer"
              />
            </button>
            <button @click="emit('removeOwnerHolder', ix)">
              <FontAwesomeIcon
                :icon="faTrash"
                :style="{ color: '#42916e' }"
                class="cursor-pointer"
              />
            </button>
          </div>
        </td>
      </tr>
      <tr v-if="props.landHoldersData.length == 0">
        <td colSpan="4">{{ $gettext('There is no data to show.') }}</td>
      </tr>
    </tbody>
  </table>
</template>
