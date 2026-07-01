<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import RadioButtonGroupComponent from '@/components/RadioButtonGroupComponent.vue'
import SelectInputComponent from '@/components/SelectInputComponent.vue'
import TextAreaComponent from '@/components/TextAreaComponent.vue'
import TextInputComponent from '@/components/TextInputComponent.vue'
import WholeWidthCardComponent from '@/components/WholeWidthCardComponent.vue'
import { useFormContext } from '@/context/useFormContext'
import { useValidatorContext } from '@/context/validators/useValidatorContext'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import States from '../../config/states_municipalities.json'
const { $gettext } = useGettext()

const { formData, validateRegistrationForm } = useFormContext()
const { validation } = useValidatorContext()
const router = useRouter()

const locationZonevOptions = computed(() => [
  { label: $gettext('Urban'), value: 'urban' },
  { label: $gettext('Rural'), value: 'rural' },
])

const handleNextButton = async () => {
  const result = await validation.value.ruralProperties.$validate()
  if (result) {
    validateRegistrationForm.isRuralPropertiesValid = true
    router.push('/register/property_rights')
  } else {
    validateRegistrationForm.isRuralPropertiesValid = false
  }
}
defineExpose({ handleNextButton })

const states = ref(States)
const selectedRuralPropertyState = computed(() => formData.ruralProperties.state)
const selectedMailingRuralPropertyState = computed(
  () => formData.ruralProperties.mailingAddress.state,
)
const ruralPropertiesCities = computed(() => {
  for (const state of states.value) {
    if (state.value == formData.ruralProperties.state) {
      return state.cities
    }
  }
  return []
})
const ruralPropertiesMailingCities = computed(() => {
  for (const state of states.value) {
    if (state.value == formData.ruralProperties.mailingAddress.state) {
      return state.cities
    }
  }
  return []
})

watch(
  selectedRuralPropertyState,
  () => {
    formData.ruralProperties.city = ''
  },
  { deep: true },
)
watch(
  selectedMailingRuralPropertyState,
  () => {
    formData.ruralProperties.mailingAddress.city = ''
  },
  { deep: true },
)
</script>

<template>
  <WholeWidthCardComponent bg-color="#f0fcf7">
    <h1 class="text-lg font-bold">{{ $gettext('RURAL PROPERTY') }}</h1>
    <p>{{ $gettext('Fill in the information of the rural property.') }}</p>
  </WholeWidthCardComponent>

  <WholeWidthCardComponent bg-color="#F8FAF9">
    <div class="flex flex-col space-y-4">
      <TextInputComponent
        :label="$gettext('Property Name')"
        id="property-name"
        v-model="formData.ruralProperties.propertyName"
        :errors="validation.ruralProperties.propertyName.$errors"
      />

      <div class="flex flex-row space-x-4">
        <SelectInputComponent
          id="state"
          :placeholder="$gettext('Select the state')"
          :label="$gettext('State')"
          :items="states"
          width="250px"
          v-model="formData.ruralProperties.state"
          :errors="validation.ruralProperties.state.$errors"
        />
        <SelectInputComponent
          id="city"
          :placeholder="$gettext('Select the city')"
          :label="$gettext('City')"
          :items="ruralPropertiesCities"
          :disabled="!selectedRuralPropertyState"
          width="250px"
          v-model="formData.ruralProperties.city"
          :errors="validation.ruralProperties.city.$errors"
        />
        <TextInputComponent
          :label="$gettext('Zip Code')"
          id="zip-code"
          v-model="formData.ruralProperties.zipCode"
          :errors="validation.ruralProperties.zipCode.$errors"
        />
        <RadioButtonGroupComponent
          name="locationZonev"
          :groupLabel="$gettext('Location Zone (Optional)')"
          :options="locationZonevOptions"
          :vertical-alignment="false"
          :show-divider="true"
          v-model="formData.ruralProperties.locationZonenv"
        />
      </div>

      <div class="flex flex-row w-full">
        <TextAreaComponent
          :label="$gettext('Description of Property Access (Optional)')"
          id="propertyAccessDescription"
          :tooltip-text="
            $gettext('Provide details about how the property can be accessed, such as roads, landmarks, or specific directions. This field is optional.')
          "
          v-model="formData.ruralProperties.propertyAccessDescription"
        />
      </div>
    </div>
  </WholeWidthCardComponent>

  <WholeWidthCardComponent bg-color="#F8FAF9">
    <div class="flex flex-col space-y-4">
      <h1 class="text-lg font-bold">
        {{ $gettext('Mailing Address') }}
      </h1>
      <div class="flex flex-row space-x-4 flex-grow">
        <TextInputComponent
          :label="$gettext('Recipient Name')"
          id="recipient-name"
          v-model="formData.ruralProperties.mailingAddress.recipientName"
          :errors="validation.ruralProperties.mailingAddress.recipientName.$errors"
        />
      </div>
      <div class="flex flex-row space-x-4">
        <div class="flex flex-grow">
          <TextInputComponent
            :label="$gettext('Address/Street')"
            id="mailing-address-street"
            :tooltip-text="
              $gettext('Enter the official address or street name where the property is located.')
            "
            v-model="formData.ruralProperties.mailingAddress.addressStreet"
            classes="w-full"
            :errors="validation.ruralProperties.mailingAddress.addressStreet.$errors"
          />
        </div>
        <div class="flex flex-grow-0">
          <TextInputComponent
            :label="$gettext('Number')"
            id="number"
            v-model="formData.ruralProperties.mailingAddress.number"
            :errors="validation.ruralProperties.mailingAddress.number.$errors"
          />
        </div>

        <div class="flex flex-grow">
          <TextInputComponent
            :label="$gettext('Additional Information (Optional)')"
            id="mailing-additional-information"
            v-model="formData.ruralProperties.mailingAddress.additionalInformation"
            classes="w-full"
          />
        </div>
      </div>
      <div class="flex flex-row space-x-4 w-full">
        <TextInputComponent
          :label="$gettext('Neighborhood')"
          id="mailing-neighborhood"
          v-model="formData.ruralProperties.mailingAddress.neighborhood"
          :errors="validation.ruralProperties.mailingAddress.neighborhood.$errors"
        />
        <TextInputComponent
          :label="$gettext('Zip Code')"
          id="mailing-zip-code"
          v-model="formData.ruralProperties.mailingAddress.zipCode"
          :errors="validation.ruralProperties.mailingAddress.zipCode.$errors"
        />
        <SelectInputComponent
          id="mailing-state"
          :placeholder="$gettext('Select the state')"
          :label="$gettext('State')"
          width="250px"
          v-model="formData.ruralProperties.mailingAddress.state"
          :items="states"
          :errors="validation.ruralProperties.mailingAddress.state.$errors"
        />
        <SelectInputComponent
          id="mailing-city"
          :placeholder="$gettext('Select the city')"
          :label="$gettext('City')"
          width="250px"
          :items="ruralPropertiesMailingCities"
          v-model="formData.ruralProperties.mailingAddress.city"
          :errors="validation.ruralProperties.mailingAddress.city.$errors"
          :disabled="!selectedMailingRuralPropertyState"
        />
      </div>
      <div class="flex flex-row space-x-4">
        <TextInputComponent
          :label="$gettext('E-mail (Optional)')"
          id="mailing-email"
          v-model="formData.ruralProperties.mailingAddress.email"
        />
        <TextInputComponent
          :label="$gettext('Contact Number (Optional)')"
          id="mailing-telephone"
          type="tel"
          v-model="formData.ruralProperties.mailingAddress.telephone"
        />
      </div>
    </div>
  </WholeWidthCardComponent>

  <div class="flex justify-between space-x-4 mt-4 mb-10 mx-3">
    <RouterLink class="br-button secondary" to="/register/landholders_information">
      {{ $gettext('Previous') }}
    </RouterLink>
    <button class="br-button primary" @click="handleNextButton">
      {{ $gettext('Next') }}
    </button>
  </div>
</template>
