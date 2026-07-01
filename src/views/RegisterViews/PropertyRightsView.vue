<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import RadioButtonGroupComponent from '@/components/RadioButtonGroupComponent.vue'
import SelectInputComponent from '@/components/SelectInputComponent.vue'
import TextInputComponent from '@/components/TextInputComponent.vue'
import WholeWidthCardComponent from '@/components/WholeWidthCardComponent.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import States from '../../config/states_municipalities.json'
const { $gettext } = useGettext()

import CalendarComponent from '@/components/CalendarComponent.vue'
import LandDocumentsTableComponent from '@/components/LandDocumentsTableComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import type { PropertyRightsData } from '@/context/PropertyRights'
import { useFormContext } from '@/context/useFormContext'
import { useValidatorContext } from '@/context/validators/useValidatorContext'
import router from '@/router'
import axios from '@/services/axios'
import { buildFormData } from '@/services/propertiesService'

import DiffAreaConfig from '@/config/diff_area.json'
import type { AxiosResponse } from 'axios'
import { ValidationHelper } from '@/utils/validationHelper'

const { validation, newPropertyRightsInformation } = useValidatorContext()
const { formData, validateRegistrationForm, resetFormData } = useFormContext()

const warningOptions = {
  invalidForm: $gettext('Please add at least one Land Document'),
  requestError: $gettext('You are about to submit a form with invalid data. Please check the fields and try again.'),
  previousStepsBlankFields: $gettext('There are required fields in previous steps that need to be filled'),
  noMapData: $gettext('No map data found. Please return to the property map step to vectorize the required areas.'),
  serverError: $gettext('Unexpected server error. Please try again.'),
  connectionError: $gettext('Connection error or server unavailable. Please check your connection and try again.'),
}
const warningText = ref('')

const isConfirmModalOpen = ref(false)
const isWarningModalOpen = ref(false)
const isWarningEditModalOpen = ref(false)
const isDiffAreaOverLimitModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const isDeletePropertyInformationModalOpen = ref(false)
const isSavingDataModalOpen = ref(false)

const propertyInformationToRemove = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)
const scrollSection = ref<HTMLElement | null>(null)
const landDocumentsTableRef = ref<InstanceType<typeof LandDocumentsTableComponent> | null>(null)

const propertyLandholding = computed(() => [
  {
    label: $gettext('Property'),
    value: 'property',
  },
  /*{
    label: $gettext('Landholding'),
    value: 'landholding',
  },*/
])

const documentTypes = computed(() => [
  { value: 'deed', label: $gettext('Deed') },
  {
    value: 'titleDeed',
    label: $gettext('Title Deed'),
  },
  {
    value: 'purchaseAndSaleAgreement',
    label: $gettext('Purchase and Sale Agreement'),
  },
])

// const legalReserveOptions = computed(() => [
//   { label: $gettext('Yes'), value: true },
//   { label: $gettext('No'), value: false }
// ]);

const initialPropertyRightsData: PropertyRightsData = {
  propertyLandholding: 'property',
  registeredPropertyName: '',
  area: '',
  documentType: '',
  titleDeedLandDocument: '',
  documentDate: '',
  book: '',
  page: '',
  stateOfTheNotaryOffice: '',
  cityOfTheNotaryOffice: '',
  // nationalRuralLandRegistrySystemCode: "",
  propertyCertification: '',
  nationalRuralPropertyRegistrationNumber: '',
  // legalReserve: false,
}

const states = ref(States)
const selectedState = computed(() => newPropertyRightsInformation.value.stateOfTheNotaryOffice)
const cities = computed(() => {
  for (const state of states.value) {
    if (state.value == selectedState.value) {
      return state.cities
    }
  }
  return []
})
watch(
  selectedState,
  () => {
    newPropertyRightsInformation.value.cityOfTheNotaryOffice = ''
  },
  { deep: true },
)

onMounted(async () => {
  Object.assign(newPropertyRightsInformation.value, initialPropertyRightsData)
  validation.value.$reset()
})

const propertyAreaFromDocs = computed(() => {
  if (formData.propertyRights && formData.propertyRights.propertyRightsData) {
    const propertyRightsData = formData.propertyRights.propertyRightsData
    if (propertyRightsData.length > 0) {
      return propertyRightsData.reduce(
        (total: number, doc: any) => total + parseFloat(doc.area || '0'),
        0,
      )
    }
  }
  return 0
})

const propertyAreaFromMap = computed(() => {
  const sessionStorage = window.sessionStorage.getItem('formData')
  if (sessionStorage) {
    const parsedData = JSON.parse(sessionStorage)
    if (parsedData.mapData && parsedData.mapData.mainArea) {
      return parsedData.mapData.mainArea.area
    }
  }
  return 0
})

const calculateAreaDifference = (areaFromMap: number, areaFromDocuments: number): number => {
  if (areaFromMap && areaFromDocuments) {
    const diff = Math.abs(areaFromMap - areaFromDocuments)
    return (diff / areaFromMap) * 100
  }
  return 0
}

const isAreaOverDiffLimit = computed(() => {
  const diffPercentage = calculateAreaDifference(
    propertyAreaFromMap.value,
    propertyAreaFromDocs.value,
  )
  const diffMax = DiffAreaConfig.percentual_limit * 100
  return diffPercentage > diffMax
})

const isDiffLimitProhibitive = computed(() => {
  return DiffAreaConfig.is_prohibitive
})

watch(
  newPropertyRightsInformation,
  () => {
    if (newPropertyRightsInformation.value.documentType) {
      const docTypeIndex = documentTypes.value.findIndex(
        (item) =>
          String(item.value).toLowerCase() ===
          String(newPropertyRightsInformation.value.documentType).toLowerCase(),
      )
      newPropertyRightsInformation.value.documentType =
        documentTypes.value[docTypeIndex]?.value || ''
    }
  },
  { deep: true, immediate: true },
)

const handleEditPropertyInformation = async (data: PropertyRightsData, index: number) => {
  if (scrollSection.value) {
    scrollSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const keys = Object.keys(data)
  for (const key of keys) {
    newPropertyRightsInformation.value[key as keyof PropertyRightsData] = data[
      key as keyof PropertyRightsData
    ] as (string & 'property') | 'landholding'
    await nextTick()
  }
  selectedIndex.value = index
}

const handleSaveChanges = () => {
  const requiredFields: (keyof PropertyRightsData)[] = ['area', 'registeredPropertyName']

  let isValid: boolean = true
  for (const field of requiredFields) {
    if (String(newPropertyRightsInformation.value[field]).trim() === '') {
      isValid = false
    }
  }

  if (isValid) {
    if (selectedIndex.value !== null) {
      if (formData.propertyRights.propertyRightsData) {
        formData.propertyRights.propertyRightsData[selectedIndex.value] = {
          ...newPropertyRightsInformation.value,
        }
        handleClear()
      }
    }
  } else {
    isWarningEditModalOpen.value = true
  }
}

const handleClear = () => {
  selectedIndex.value = null
  landDocumentsTableRef.value?.clearEditing()
  Object.assign(newPropertyRightsInformation.value, initialPropertyRightsData)
  validation.value.$reset()
}

const handleAddPropertyInformation = async () => {
  const result = await validation.value.propertyRights.$validate()
  if (result) {
    const temp = {} as PropertyRightsData
    Object.assign(temp, newPropertyRightsInformation.value)
    formData.propertyRights.propertyRightsData = formData.propertyRights.propertyRightsData
      ? [...formData.propertyRights.propertyRightsData, temp]
      : [temp]
    validateRegistrationForm.isPropertyRightsValid = true
    handleClear()
    validation.value.$reset()
  } else {
    // Show specific invalid fields for current property rights form
    const invalidFields = validationHelper.getPropertyRightsInvalidFields()

    if (invalidFields.length > 0) {
      let message = $gettext('All fields must be filled in before saving.') + '\n\n'
      message += `${$gettext('Required fields')}: ${invalidFields.join(', ')}`
      warningText.value = message
      isWarningModalOpen.value = true
    }
  }
}

const cancelRemovePropertyInformation = () => {
  isDeletePropertyInformationModalOpen.value = false
  propertyInformationToRemove.value = null
}

const handleRemovePropertyInformation = (index: number) => {
  propertyInformationToRemove.value = index
  isDeletePropertyInformationModalOpen.value = true
}

const handleDeletePropertyInformation = () => {
  if (propertyInformationToRemove.value !== null && formData.propertyRights.propertyRightsData) {
    formData.propertyRights.propertyRightsData.splice(propertyInformationToRemove.value, 1)
    if (!formData.propertyRights.propertyRightsData?.length) {
      validateRegistrationForm.isPropertyRightsValid = false
    }
    isDeletePropertyInformationModalOpen.value = false
    propertyInformationToRemove.value = null
    selectedIndex.value = null
    landDocumentsTableRef.value?.clearEditing()
  }
}

const validateForm = () => {
  if (formData.propertyRights.propertyRightsData) {
    const result = formData.propertyRights.propertyRightsData.length > 0
    if (result) {
      validateRegistrationForm.isPropertyRightsValid = true
    } else {
      validateRegistrationForm.isPropertyRightsValid = false
    }
  }
}

const validationHelper = new ValidationHelper({
  validation,
  formData,
  $gettext,
})

const handleRegisterButton = async () => {
  validateForm()

  // Trigger validation on all steps
  await validation.value.$validate()

  const isFormValid = Object.values(validateRegistrationForm).every(Boolean)

  if (isFormValid) {
    if (isAreaOverDiffLimit.value && isDiffLimitProhibitive.value) {
      isDiffAreaOverLimitModalOpen.value = true
      return
    }
    isConfirmModalOpen.value = true
    return
  }

  // Get detailed validation information
  const invalidFieldsDetails = validationHelper.getInvalidFieldsDetails()

  if (invalidFieldsDetails.length > 0) {
    warningText.value = validationHelper.buildValidationMessage(invalidFieldsDetails)
    isWarningModalOpen.value = true
  } else if (!validateRegistrationForm.isPropertyRightsValid) {
    warningText.value = warningOptions.invalidForm
    isWarningModalOpen.value = true
  } else {
    warningText.value = warningOptions.previousStepsBlankFields
    isWarningModalOpen.value = true
  }
}

const propertyEditing = computed(() => {
  if (localStorage.getItem('EditingRegistry')) {
    return JSON.parse(localStorage.getItem('EditingRegistry')!)
  } else {
    return {}
  }
})
const isEditingProperty = computed(() => Object.keys(propertyEditing.value).length > 0)

const lastPropertyId = ref<string | null>(null)
const handleConfirm = async () => {
  isConfirmModalOpen.value = false

  // Check if mapData exists and has content
  if (!formData.mapData || Object.keys(formData.mapData).length === 0) {
    warningText.value = warningOptions.noMapData
    isWarningModalOpen.value = true
    return
  }

  isSavingDataModalOpen.value = true
  const formDataToSend = buildFormData(formData)

  try {
    let response: AxiosResponse<any>
    if (isEditingProperty.value) {
      response = await axios.put(`/properties/${propertyEditing.value['id']}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      response = await axios.post('/properties', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }

    if (response.status === 200) {
      isSavingDataModalOpen.value = false
      isSuccessModalOpen.value = true
      lastPropertyId.value = response.data?.id
    } else {
      warningText.value = warningOptions.serverError
      isSavingDataModalOpen.value = false
      isWarningModalOpen.value = true
    }
  } catch {
    warningText.value = warningOptions.connectionError
    isSavingDataModalOpen.value = false
    isConfirmModalOpen.value = false
    isWarningModalOpen.value = true
  }
}

const handleSuccessConfirm = async () => {
  if (lastPropertyId.value) {
    sessionStorage.setItem('downloadReceiptId', lastPropertyId.value)
  }
  isSuccessModalOpen.value = false
  resetFormData()
  localStorage.removeItem('EditingRegistry')
  sessionStorage.removeItem('mapCaptured')
  window.sessionStorage.removeItem('mapState')
  validation.value.$reset()
  window.location.href = router.resolve({ path: '/properties' }).href
}
</script>

<template>
  <div ref="scrollSection">
    <WholeWidthCardComponent bg-color="#f0fcf7">
      <h1 class="text-lg font-bold">{{ $gettext('OWNER DETAILS AND DOCUMENTATION.') }}</h1>
      <p>{{ $gettext('Provide information of the property or landholding documentation.') }}</p>
    </WholeWidthCardComponent>
  </div>

  <!-- <form onSubmit={handleSubmit(customHandleSubmit)}> -->
  <WholeWidthCardComponent :bg-color="selectedIndex !== null ? '#EEF6FD' : '#F8FAF9'">
    <h2 class="text-lg font-bold text-center text-gray-700">
      {{
        selectedIndex !== null
          ? `${$gettext('Editing Property')}`
          : `${$gettext('Add New Property')}`
      }}
    </h2>
    <div class="py-3">
      <RadioButtonGroupComponent
        name="propertyLandholgin"
        :groupLabel="`${$gettext('Property or Landholding')}`"
        :options="propertyLandholding"
        v-model="newPropertyRightsInformation.propertyLandholding"
        :vertical-alignment="false"
        :show-divider="false"
      />
    </div>
    <div class="grid grid-cols-6 gap-4">
      <div class="col-span-3 col-start-1">
        <TextInputComponent
          :label="`${$gettext('Registered Property Name')} ${$gettext('(Required)')}`"
          id="property-name"
          v-model="newPropertyRightsInformation.registeredPropertyName"
          :errors="validation.propertyRights.registeredPropertyName.$errors"
        />
      </div>
      <div class="col-span-1 col-start-4">
        <TextInputComponent
          :label="`${$gettext('Area')} ${$gettext('(Required)')}`"
          type="number"
          id="area"
          v-model="newPropertyRightsInformation.area"
          :errors="validation.propertyRights.area.$errors"
        />
      </div>
      <div class="col-span-2 col-start-5">
        <SelectInputComponent
          id="document-type"
          :placeholder="`${$gettext('Select the document type')}`"
          :label="`${$gettext('Document Type')}`"
          :items="documentTypes"
          v-model="newPropertyRightsInformation.documentType"
          :errors="validation.propertyRights.documentType.$errors"
        />
      </div>
    </div>
    <div class="grid grid-cols-8 gap-4 mt-3">
      <div class="col-span-4 col-start-1">
        <TextInputComponent
          :label="`${$gettext('Title deed/ Land Document')}`"
          id="title-deed-land-document"
          :tooltip-text="`${$gettext('Official legal document proving ownership of a property or land. Ensure it is properly registered and up to date.')}`"
          v-model="newPropertyRightsInformation.titleDeedLandDocument"
          :errors="validation.propertyRights.titleDeedLandDocument.$errors"
        />
      </div>
      <div class="col-span-2 col-start-5">
        <CalendarComponent
          :label="`${$gettext('Document Date')}`"
          id="document-date"
          v-model="newPropertyRightsInformation.documentDate"
          :errors="validation.propertyRights.documentDate.$errors"
        />
      </div>
      <div class="col-span-2 col-start-7">
        <TextInputComponent
          :label="`${$gettext('Book')}`"
          id="book"
          v-model="newPropertyRightsInformation.book"
          :errors="validation.propertyRights.book.$errors"
        />
      </div>
    </div>
    <div class="grid grid-cols-8 gap-4 mt-3">
      <div class="col-span-2 col-start-1">
        <TextInputComponent
          :label="`${$gettext('Page')}`"
          id="page"
          v-model="newPropertyRightsInformation.page"
          :errors="validation.propertyRights.page.$errors"
        />
      </div>
      <div class="col-span-2 col-start-3">
        <SelectInputComponent
          :label="`${$gettext('State of The Notary Office')}`"
          :items="states"
          :placeholder="`${$gettext('Select the state')}`"
          id="state"
          v-model="newPropertyRightsInformation.stateOfTheNotaryOffice"
          :errors="validation.propertyRights.stateOfTheNotaryOffice.$errors"
        />
      </div>
      <div class="col-span-4 col-start-5">
        <SelectInputComponent
          :label="`${$gettext('City of The Notary Office')}`"
          :items="cities"
          :placeholder="`${$gettext('Select the city')}`"
          id="city"
          v-model="newPropertyRightsInformation.cityOfTheNotaryOffice"
          :errors="validation.propertyRights.cityOfTheNotaryOffice.$errors"
          :disabled="!selectedState"
        />
      </div>
    </div>
    <div class="grid grid-cols-4 gap-4 mt-3">
      <div class="col-span-2 col-start-1">
        <!-- <TextInputComponent
          :label="`${$gettext('National Rural Land Registry System Code')} ${$gettext('(Required)')}`"
          id="national-rural-land-registry-system-code"
          :tooltip-text="`${$gettext('Unique identifier assigned to rural properties within the National Rural Land Registry System.')}`"
          v-model="newPropertyRightsInformation.nationalRuralLandRegistrySystemCode"
          :errors="validation.propertyRights.nationalRuralLandRegistrySystemCode.$errors" /> -->
        <TextInputComponent
          :label="`${$gettext('Property Certification')}`"
          id="property-certification"
          :tooltip-text="`${$gettext('Certification that verifies the legal status and compliance of the property according to national regulations.')}`"
          v-model="newPropertyRightsInformation.propertyCertification"
          :errors="validation.propertyRights.propertyCertification.$errors"
        />
      </div>
      <div class="col-span-2 col-start-3">
        <TextInputComponent
          :label="`${$gettext('National Rural Property Registration Number')}`"
          id="national-rural-property-registration-number"
          :tooltip-text="`${$gettext('Official registration number of the rural property, used for legal and administrative purposes.')}`"
          v-model="newPropertyRightsInformation.nationalRuralPropertyRegistrationNumber"
          :errors="validation.propertyRights.nationalRuralPropertyRegistrationNumber.$errors"
        />
      </div>
    </div>
    <!-- <div class="grid grid-cols-2 gap-4 mt-3">
      <div class="col-span-1 col-start-1">
      </div>
    </div> -->

    <!-- <div class="py-3">
      <RadioButtonGroupComponent :groupLabel="`${$gettext('Does it have a registered Legal Reserve and/or an approved but not registered Legal Reserve?')}`"
        name="legal-reserve" :options="legalReserveOptions" v-model="newPropertyRightsInformation.legalReserve"
        :vertical-alignment="false" />
    </div>

    <p v-if="!newPropertyRightsInformation.legalReserve">
      {{ $gettext('Does not have a registered Legal Reserve and/or an approved but not registered Legal Reserve.') }}
    </p> -->
    <div class="flex flex-row space-x-4 mt-4 mb-5">
      <button class="br-button secondary" @click="handleClear">
        {{
          selectedIndex !== null
            ? `${$gettext('Cancel')}`
            : `${$gettext('Clear')}`
        }}
      </button>
      <button
        class="br-button primary"
        @click="selectedIndex !== null ? handleSaveChanges() : handleAddPropertyInformation()"
      >
        {{
          selectedIndex !== null
            ? `${$gettext('Save Changes')}`
            : `${$gettext('Add')}`
        }}
      </button>
    </div>
  </WholeWidthCardComponent>
  <!-- </form> -->

  <h1 class="text-lg font-bold pl-4 primary-color">
    {{ $gettext('List of informed land documents') }}
  </h1>

  <WholeWidthCardComponent>
    <LandDocumentsTableComponent
      :propertyRightsData="formData.propertyRights.propertyRightsData || []"
      ref="landDocumentsTableRef"
      @remove-property-information="handleRemovePropertyInformation"
      @edit-property-information="handleEditPropertyInformation"
      @clearEditing="handleClear"
    />
    <div class="flex flex-col justify-start">
      <span class="font-bold text-gray-400"
        >Area Total (ha): {{ propertyAreaFromDocs.toFixed(4) }}</span
      >
    </div>
  </WholeWidthCardComponent>

  <ModalComponent
    :is-open="isConfirmModalOpen"
    @close="() => (isConfirmModalOpen = false)"
    @confirm="handleConfirm"
    :title="
      isAreaOverDiffLimit
        ? $gettext('Area difference exceeded')
        : $gettext('Attention')
    "
  >
    <div v-if="isAreaOverDiffLimit && !isDiffLimitProhibitive">
      <p>
        {{ $gettext('The property area specified in the documents differs from the area calculated on the map.') }}
      </p>
      <p>
        <b>
          {{ $gettext('Area from map: ') }}
        </b>
        {{ parseFloat(propertyAreaFromMap).toFixed(4) }}(ha)
      </p>
      <p>
        <b>
          {{ $gettext('Area from documents: ') }}
        </b>
        {{ propertyAreaFromDocs.toFixed(4) }}(ha)
      </p>
      <p>
        {{ $gettext('As a rule, the difference should not exceed: ') }}
        <b>{{ DiffAreaConfig.percentual_limit * 100 }}%.</b>
      </p>
      <p>{{ $gettext('Do you wish to proceed with the registration?') }}</p>
    </div>
    <p v-else>{{ $gettext('Are you sure you want to send register?') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isSavingDataModalOpen"
    @close="() => (isSavingDataModalOpen = false)"
    :hide-buttons="true"
    :title="$gettext('Wait')"
  >
    <p>{{ $gettext('Saving property\'s data.') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isDiffAreaOverLimitModalOpen"
    @close="() => (isDiffAreaOverLimitModalOpen = false)"
    :title="$gettext('Area difference exceeded')"
  >
    <p>
      {{ $gettext('The property area specified in the documents differs from the area calculated on the map.') }}
    </p>
    <p>
      <b>
        {{ $gettext('Area from map: ') }}
      </b>
      {{ parseFloat(propertyAreaFromMap).toFixed(4) }}(ha)
    </p>
    <p>
      <b>
        {{ $gettext('Area from documents: ') }}
      </b>
      {{ propertyAreaFromDocs.toFixed(4) }}(ha)
    </p>
    <p>
      {{ $gettext('As a rule, the difference should not exceed: ') }}
      <b>{{ DiffAreaConfig.percentual_limit * 100 }}%.</b>
    </p>
    <p>{{ $gettext('Please check the information provided and try again.') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isDeletePropertyInformationModalOpen"
    @close="cancelRemovePropertyInformation"
    @confirm="handleDeletePropertyInformation"
    :title="$gettext('Attention')"
  >
    <p>{{ $gettext('Are you sure you want to delete the entered land documents?') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isWarningModalOpen"
    @close="() => (isWarningModalOpen = false)"
    :title="$gettext('Attention')"
  >
    <p>{{ warningText }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isWarningEditModalOpen"
    @close="() => (isWarningEditModalOpen = false)"
    :title="$gettext('Attention')"
  >
    <p>{{ $gettext('All fields must be filled in before saving.') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isSuccessModalOpen"
    @close="handleSuccessConfirm"
    :title="$gettext('Success')"
  >
    <p>{{ $gettext('Data registered successfully') }}</p>
  </ModalComponent>

  <div class="flex justify-between space-x-4 mt-4 mb-10 mx-3">
    <RouterLink class="br-button secondary" to="/register/rural_property">
      {{ $gettext('Previous') }}
    </RouterLink>
    <button class="br-button primary" @click="handleRegisterButton">
      {{ $gettext('Register') }}
    </button>
  </div>
</template>
