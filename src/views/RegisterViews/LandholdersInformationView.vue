<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import CalendarComponent from '@/components/CalendarComponent.vue'
import LandHoldersTableComponent from '@/components/LandHoldersTableComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import RadioButtonGroupComponent from '@/components/RadioButtonGroupComponent.vue'
import TextInputComponent from '@/components/TextInputComponent.vue'
import WholeWidthCardComponent from '@/components/WholeWidthCardComponent.vue'
import { type LandHoldersData } from '@/context/LandHoldersInformation'
import { useFormContext } from '@/context/useFormContext'
import { useValidatorContext } from '@/context/validators/useValidatorContext'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
const { $gettext } = useGettext()

const router = useRouter()
const { validation, newLandHoldersInformation } = useValidatorContext()
const { formData, validateRegistrationForm } = useFormContext()
const selectedIndex = ref<number | null>(null)
const scrollSection = ref<HTMLElement | null>(null)
const landHoldersTableRef = ref<InstanceType<typeof LandHoldersTableComponent> | null>(null)

const legalPersinalityOfLandholderOptions = computed(() => [
  {
    label: $gettext('Natural persons'),
    value: 'natural_person',
  } /*
  {
    label: $gettext('Legal entities'),
    value: 'legal_entity',
  }, */,
])

// const wayToAddLandholdersInformationOptions = computed(() => [
//   { label: $gettext('Fill in data'), value: "fill" },
//   { label: $gettext('Import data files'), value: "import" },
// ]);

const initialLandHoldersData: LandHoldersData = {
  legalPersonality: 'natural_person',
  wayToAddLandholdersInformation: 'fill',
  id: '',
  dateOfBirth: '',
  name: '',
  mothersName: '',
}

onMounted(() => {
  Object.assign(newLandHoldersInformation.value, initialLandHoldersData)
})

const handleEditOwnerHolder = (data: LandHoldersData, index: number) => {
  if (scrollSection.value) {
    scrollSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  selectedIndex.value = index
  Object.assign(newLandHoldersInformation.value, data)
}

const handleSaveChanges = () => {
  const requiredFields: (keyof LandHoldersData)[] = ['id', 'name', 'mothersName']

  const isValid = requiredFields.every((field) => {
    return (
      newLandHoldersInformation.value[field] &&
      (newLandHoldersInformation.value[field] as string).trim() !== ''
    )
  })

  if (isValid) {
    if (selectedIndex.value !== null) {
      if (formData.landHoldersInformation.landHoldersData) {
        formData.landHoldersInformation.landHoldersData[selectedIndex.value] = {
          ...newLandHoldersInformation.value,
        }
        handleClear()
      }
    }
  } else {
    isWarningEditModalOpen.value = true
  }
}

const handleAddOwnerHolder = async () => {
  const result = await validation.value.landHoldersInformation.$validate()
  if (result) {
    const temp = { ...newLandHoldersInformation.value }
    formData.landHoldersInformation.landHoldersData = formData.landHoldersInformation
      .landHoldersData
      ? [...formData.landHoldersInformation.landHoldersData, temp]
      : [temp]
    validateRegistrationForm.isLandHoldersInformationValid = true
    handleClear()
    validation.value.$reset()
  }
}

const handleRemoveOwnerHolder = (index: number) => {
  ownerHolderToRemove.value = index
  isConfirmModalOpen.value = true
}

const handleDeleteOwner = () => {
  if (ownerHolderToRemove.value !== null && formData.landHoldersInformation.landHoldersData) {
    formData.landHoldersInformation.landHoldersData.splice(ownerHolderToRemove.value, 1)
    if (!formData.landHoldersInformation.landHoldersData?.length) {
      validateRegistrationForm.isLandHoldersInformationValid = false
    }
    isConfirmModalOpen.value = false
    ownerHolderToRemove.value = null
    selectedIndex.value = null
    landHoldersTableRef.value?.clearEditing()
  }
}

const cancelRemoveOwnerHolder = () => {
  isConfirmModalOpen.value = false
  ownerHolderToRemove.value = null
}

const handleClear = () => {
  selectedIndex.value = null
  landHoldersTableRef.value?.clearEditing()
  Object.assign(newLandHoldersInformation.value, initialLandHoldersData)
  validation.value.$reset()
}

const handleNextButton = async () => {
  if (formData.landHoldersInformation.landHoldersData) {
    const result = formData.landHoldersInformation.landHoldersData.length > 0
    if (result) {
      validateRegistrationForm.isLandHoldersInformationValid = true
      router.push('/register/rural_property')
    } else {
      isWarningModalOpen.value = true
      validateRegistrationForm.isLandHoldersInformationValid = false
    }
  }
}

defineExpose({ handleNextButton })

const isWarningModalOpen = ref(false)
const isWarningEditModalOpen = ref(false)
const isConfirmModalOpen = ref(false)

const ownerHolderToRemove = ref<number | null>(null)
</script>

<template>
  <WholeWidthCardComponent bg-color="#f0fcf7">
    <h1 class="text-lg font-bold">{{ $gettext('LANDHOLDERS INFORMATION') }}</h1>
    <p>
      {{ $gettext('Fill in the information about the landholder or land owner. This person is legally responsible for the land being registered.') }}
    </p>
  </WholeWidthCardComponent>

  <WholeWidthCardComponent :bg-color="selectedIndex !== null ? '#EEF6FD' : '#F8FAF9'">
    <h2 class="text-lg font-bold text-center text-gray-700">
      {{
        selectedIndex !== null
          ? $gettext('Editing Landholder')
          : $gettext('Add New Landholder')
      }}
    </h2>
    <div class="h-10 mb-5">
      <RadioButtonGroupComponent
        :options="legalPersinalityOfLandholderOptions"
        name="legalPersonality"
        v-model="newLandHoldersInformation.legalPersonality"
        :group-label="
          $gettext('Legal personality of landholder')
        "
        :vertical-alignment="false"
        :show-divider="false"
      />
    </div>
    <!-- <div class="flex items-center space-x-2">
      <RadioButtonGroupComponent name="wayToAddLandholdersInformation"
        :group-label="$gettext('Choose a way to add landholder\'s information')"
        :options="wayToAddLandholdersInformationOptions"
        :tooltip-text="$gettext('Select how you want to provide the landholder\'s details: manually entering the data or importing from a file.')"
        v-model="newLandHoldersInformation.wayToAddLandholdersInformation" :vertical-alignment="false" />
    </div> -->
    <!-- <br /> -->

    <div class="flex flex-col">
      <div class="flex flex-row space-x-4">
        <div class="flex flex-col">
          <TextInputComponent
            :label="$gettext('Personal ID')"
            id="id"
            v-model="newLandHoldersInformation.id"
            :errors="validation.landHoldersInformation.id.$errors"
          />
        </div>
        <CalendarComponent
          :label="$gettext('Date of birth')"
          id="dateOfBirth"
          v-model="newLandHoldersInformation.dateOfBirth"
          :errors="validation.landHoldersInformation.dateOfBirth.$errors"
        />
      </div>
      <div class="flex flex-row space-x-4 w-full py-2">
        <div class="w-1/2">
          <TextInputComponent
            :label="$gettext('Name')"
            id="name"
            v-model="newLandHoldersInformation.name"
            :errors="validation.landHoldersInformation.name.$errors"
          />
        </div>
        <div class="w-1/2">
          <TextInputComponent
            :label="$gettext('Mother\'s name')"
            id="mothersName"
            v-model="newLandHoldersInformation.mothersName"
            :errors="validation.landHoldersInformation.mothersName.$errors"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-row space-x-4 mt-4">
      <button class="br-button secondary" @click="handleClear">
        {{
          selectedIndex !== null
            ? $gettext('Cancel')
            : $gettext('Clear')
        }}
      </button>
      <button
        class="br-button primary"
        @click="selectedIndex !== null ? handleSaveChanges() : handleAddOwnerHolder()"
      >
        {{
          selectedIndex !== null
            ? $gettext('Save changes')
            : $gettext('Add owner/holder')
        }}
      </button>
    </div>
  </WholeWidthCardComponent>

  <h1 class="text-lg font-bold pl-4 primary-color">
    {{ $gettext('List of Owners/Holders') }}
  </h1>

  <ModalComponent
    :is-open="isWarningEditModalOpen"
    @close="() => (isWarningEditModalOpen = false)"
    :title="$gettext('Attention')"
  >
    <p>{{ $gettext('All fields must be filled in before saving.') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isConfirmModalOpen"
    @close="cancelRemoveOwnerHolder"
    @confirm="handleDeleteOwner"
    :title="$gettext('Attention')"
  >
    <p>{{ $gettext('Are you sure you want to delete the Owner/Holder?') }}</p>
  </ModalComponent>

  <ModalComponent
    :is-open="isWarningModalOpen"
    @close="() => (isWarningModalOpen = false)"
    :title="$gettext('Attention')"
  >
    <p>{{ $gettext('Please add at least one landholder.') }}</p>
  </ModalComponent>

  <WholeWidthCardComponent>
    <LandHoldersTableComponent
      :landHoldersData="formData.landHoldersInformation.landHoldersData || []"
      ref="landHoldersTableRef"
      @remove-owner-holder="handleRemoveOwnerHolder"
      @edit-owner-holder="handleEditOwnerHolder"
      @clearEditing="handleClear"
    />
  </WholeWidthCardComponent>

  <div class="flex justify-between space-x-4 mt-4 mb-10 mx-3">
    <RouterLink class="br-button secondary" to="/register/registrars_details">
      {{ $gettext('Previous') }}
    </RouterLink>
    <button class="br-button primary mr-3" @click="handleNextButton">
      {{ $gettext('Next') }}
    </button>
  </div>
</template>
