<script setup lang="ts">
import { translateByLegacyKey, translateDocumentType, translateLandholderType, translateHoldingType } from '@/i18n/dynamicTranslations'
import { useGettext } from 'vue3-gettext'
import { faDownload, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { $gettext } = useGettext()

import type { DocumentForView, PropertyForView } from '@/adapters/propertyAdapter'
import GlobalLoading from '@/components/GlobalLoading.vue'
import WholeWidthCardComponent from '@/components/WholeWidthCardComponent.vue'
import {
  fetchPropertyDetails,
  fetchPropertyImage,
  fetchReceipt,
} from '@/services/propertiesService'
import { useGlobalLoading } from '@/states/useGlobalLoading'

import { formatNumberWithCommas, latLonToDMS } from '@/utils/generalUtils'

const router = useRouter()
const route = useRoute()

const { isLoading, showLoading, hideLoading } = useGlobalLoading()
const property = ref<PropertyForView>({} as PropertyForView)
const image = ref<string | null>(null)
const placeholderImage = `${import.meta.env.VITE_BASE_URL}/images/map_property_details.png`
const isDownloading = ref(false)

const sendToEditRegistry = () => {
  router.push({ name: 'register', query: { id: property.value.id } })
}

onMounted(async () => {
  const id = route.params.id as string
  showLoading()

  try {
    property.value = await fetchPropertyDetails(id)
    image.value = await fetchPropertyImage(id)
  } catch (err) {
    console.error('Failed to load property details:', err)
  } finally {
    hideLoading()
  }
})

const mainArea = computed(() => {
  const areas = property.value?.areas ?? []
  return areas.find((area) => area.type === 'main') || null
})

const subAreas = computed(() => {
  const areas = property.value?.areas ?? []
  return areas.filter((area) => area.type === 'subarea') || null
})

const bufferAreas = computed(() => {
  const areas = property.value?.areas ?? []
  return areas.filter((area) => area.type === 'buffer') || null
})

const latLonDMS = computed(() => {
  const lat = mainArea.value?.properties.lat || 0
  const lon = mainArea.value?.properties.lon || 0
  return latLonToDMS(lat, lon)
})

type detailDocuments = DocumentForView & { type: string }

const documents = computed<detailDocuments[]>(() => property.value?.documents || [])

function getAttribute(name: string) {
  const attr = property.value?.attributes?.find((a: any) => a.name === name)?.value
  return attr && attr !== 'null' ? attr : 'N/A'
}

watch(
  documents,
  () => {
    documents.value.forEach((doc) => {
      doc.type = doc.documentType
        ? translateDocumentType(doc.documentType, $gettext)
        : ''
    })
  },
  { deep: true },
)

const handleRegistrationButton = async (event: Event) => {
  event.preventDefault()
  isDownloading.value = true
  try {
    await fetchReceipt(property.value.id)
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <GlobalLoading v-if="isLoading" />

  <div v-else>
    <WholeWidthCardComponent v-if="property" bg-color="rgb(249,250,249)">
      <!-- Property Info -->
      <div class="px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="text-lg font-bold">{{ $gettext('PROPERTY') }}</h3>
          <p class="pt-3">{{ $gettext('Property Name') }}</p>
          <p>{{ property.propertyName }}</p>
        </div>
        <div class="mt-2 md:mt-5">
          <p>{{ $gettext('Code') }}</p>
          <p>{{ property.code }}</p>
        </div>
      </div>

      <div class="px-3 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p>{{ $gettext('State') }}</p>
          <p>{{ property.stateDistrict }}</p>
        </div>
        <div>
          <p>{{ $gettext('City') }}</p>
          <p>{{ property.municipality }}</p>
        </div>
        <div>
          <p>{{ $gettext('Zip Code') }}</p>
          <p>{{ property.zipcode }}</p>
        </div>
        <div>
          <p>{{ $gettext('Location Zone') }}</p>
          <p>{{ property.locationZone }}</p>
        </div>
      </div>

      <div class="mx-3 mt-3">
        <p>{{ $gettext('Description of Property Access') }}</p>
        <p>{{ getAttribute('property_access_description') }}</p>

        <hr class="mt-3 mb-2 border" />

        <div class="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button class="flex items-center primary-color px-3" @click="sendToEditRegistry">
            <FontAwesomeIcon :icon="faPenToSquare" class="text-green-700 mr-2" />
            <p class="font-bold primary-color">{{ $gettext('Edit') }}</p>
          </button>

          <div class="hidden sm:block w-px h-6 mx-5 bg-gray-300"></div>

          <button class="flex items-center primary-color px-3" @click="handleRegistrationButton">
            <template v-if="isDownloading">
              <svg
                class="animate-spin h-5 w-5 text-green-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </template>
            <template v-else>
              <FontAwesomeIcon :icon="faDownload" class="text-green-700 mr-2" />
            </template>
            <p class="font-bold primary-color">{{ $gettext('Download Receipt') }}</p>
          </button>
        </div>
      </div>
    </WholeWidthCardComponent>

    <!-- Map and Areas -->
    <div v-if="property" class="mx-3 flex flex-col lg:flex-row items-center gap-4 min-h-96">
      <section class="w-full lg:w-3/5 h-full flex justify-center items-center">
        <img
          :src="image || placeholderImage"
          alt="Map example"
          class="object-contain w-full h-full"
        />
      </section>

      <WholeWidthCardComponent
        bg-color="rgb(249,250,249)"
        class="w-full lg:w-2/5 p-4 flex flex-col min-h-96"
      >
        <h1 class="text-lg font-bold">{{ $gettext('REGISTERED AREAS') }}</h1>

        <div class="flex flex-col sm:flex-row items-start sm:items-center mt-4 gap-2">
          <h1 class="text-[17px] font-bold mr-2">Lon:</h1>
          <p class="mr-4">{{ latLonDMS.lon }}</p>
          <h1 class="text-[17px] font-bold mr-2">Lat:</h1>
          <p>{{ latLonDMS.lat }}</p>
        </div>

        <div class="mt-5 grid grid-cols-[40px_1fr_auto] items-center gap-2">
          <div
            class="h-[30px] w-[30px] bg-[#9a9b9a] border-dashed border-[2px] border-[#f7ff00]"
          ></div>
          <h1 class="text-[17px] font-bold truncate">
            {{ $gettext('Rural Property Area') }}:
          </h1>
          <p class="text-right">
            {{
              mainArea?.properties?.area
                ? formatNumberWithCommas(mainArea.properties.area, language)
                : 'N/A'
            }}
            ha
          </p>
        </div>

        <div
          v-for="subarea in subAreas"
          :key="subarea.id"
          class="mt-3 grid grid-cols-[40px_1fr_auto] items-center gap-2"
        >
          <div
            class="h-[30px] w-[30px] border border-gray-300"
            :style="{ backgroundColor: subarea.layerData?.rules.style.color }"
          ></div>

          <h1 class="text-[17px] font-bold truncate">
            {{ translateByLegacyKey(subarea.layerData?.displayNameKey!, $gettext) }}:
          </h1>

          <p v-if="subarea.properties.area === 0" class="text-right">N/A</p>
          <p v-else class="text-right">
            {{ formatNumberWithCommas(subarea.properties.area, language) }}
            {{ subarea.layerData?.rules.geometricUnit }}
          </p>
        </div>

        <div
          v-for="bufferArea in bufferAreas"
          :key="bufferArea.id"
          class="mt-3 grid grid-cols-[40px_1fr_auto] items-center gap-2"
        >
          <div
            class="h-[30px] w-[30px] border border-gray-300"
            :style="{ backgroundColor: bufferArea.layerData?.rules.buffer.style.color }"
          ></div>

          <h1 class="text-[17px] font-bold truncate">
            Buffer {{ translateByLegacyKey(bufferArea.layerData?.displayNameKey!, $gettext) }}:
          </h1>

          <p v-if="bufferArea.properties.area === 0" class="text-right">N/A</p>
          <p v-else class="text-right">
            {{ formatNumberWithCommas(bufferArea.properties.area, language) }} ha
          </p>
        </div>
      </WholeWidthCardComponent>
    </div>

    <!-- Owner Table -->
    <WholeWidthCardComponent v-if="property" bg-color="rgb(249,250,249)">
      <h1 class="text-lg font-bold px-3 py-2">{{ $gettext('OWNER') }}</h1>

      <div class="px-3 py-2 mt-2 grid grid-cols-2 sm:grid-cols-5 gap-4 border-b">
        <div>
          <p>{{ $gettext('Name') }}</p>
        </div>
        <div>
          <p>{{ $gettext('ID') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Date of birth') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Owner or Holder') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Mother\'s name') }}</p>
        </div>
      </div>

      <div
        v-for="owner in property.owners"
        :key="owner.id"
        class="px-3 py-2 grid grid-cols-2 sm:grid-cols-5 gap-4 border-b"
      >
        <div :title="owner.name">
          <p>{{ owner.name }}</p>
        </div>
        <div :title="owner.identifier">
          <p>{{ owner.identifier }}</p>
        </div>
        <div>
          <p>{{ owner.dateOfBirth }}</p>
        </div>
        <div>
          <p>
            {{ translateLandholderType(owner.landholderType, $gettext) }}
          </p>
        </div>
        <div :title="owner.mothersName">
          <p>{{ owner.mothersName }}</p>
        </div>
      </div>
    </WholeWidthCardComponent>

    <!-- Registrars Table -->
    <WholeWidthCardComponent v-if="property" bg-color="rgb(249,250,249)">
      <h1 class="text-lg font-bold px-3 py-2">{{ $gettext('REGISTRAR\'S') }}</h1>

      <div
        class="px-3 py-2 mt-2 grid grid-cols-1 md:grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] gap-4 border-b"
      >
        <div>
          <p>{{ $gettext('Type') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Document Type') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Title deed/Land Document') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Registered Property Name') }}</p>
        </div>
        <div>
          <p>{{ $gettext('City/State of Notary Office') }}</p>
        </div>
        <div>
          <p>{{ $gettext('Document Area') }}</p>
        </div>
      </div>

      <div
        v-for="doc in documents"
        :key="doc.id"
        class="px-3 py-2 grid grid-cols-1 md:grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] gap-4 border-b"
      >
        <div :title="translateHoldingType(doc.holdingType, $gettext)">
          <p>{{ translateHoldingType(doc.holdingType, $gettext) }}</p>
        </div>
        <div
          :title="translateDocumentType(doc.documentType, $gettext)"
        >
          <p>
            {{ doc.type }}
          </p>
        </div>
        <div :title="doc.deed">
          <p>{{ doc.deed }}</p>
        </div>
        <div :title="doc.registeredPropertyName">
          <p>{{ doc.registeredPropertyName }}</p>
        </div>
        <div :title="`${doc.cityOfNotaryOffice} / ${doc.stateOfNotaryOffice}`">
          <p>
            {{
              doc.cityOfNotaryOffice && doc.stateOfNotaryOffice
                ? `${doc.cityOfNotaryOffice} /
            ${doc.stateOfNotaryOffice}`
                : doc.cityOfNotaryOffice || doc.stateOfNotaryOffice
            }}
          </p>
        </div>
        <div>
          <p>{{ `${formatNumberWithCommas(doc.area, language)} (ha)` }}</p>
        </div>
      </div>
    </WholeWidthCardComponent>
  </div>
</template>
