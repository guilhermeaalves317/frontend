<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import CalendarComponent from '@/components/CalendarComponent.vue'
import RadioButtonGroupComponent from '@/components/RadioButtonGroupComponent.vue'
import TextInputComponent from '@/components/TextInputComponent.vue'
import WholeWidthCardComponent from '@/components/WholeWidthCardComponent.vue'
import { useFormContext } from '@/context/useFormContext'
import { useValidatorContext } from '@/context/validators/useValidatorContext'
import { computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
const { $gettext } = useGettext()

const { formData, validateRegistrationForm, representativeStatus } = useFormContext()
const { validation, isRepresentativeRegistrarRequired } = useValidatorContext()
const router = useRouter()

const representativeOptions = computed(() => [
  { label: $gettext('I do not have a representative'), value: 'noRep' },
  {
    label: $gettext('I have a representative and he/she is the registrar'),
    value: 'hasRepInReg',
  },
  {
    label: $gettext('I have a representative and he/she is not the registrar'),
    value: 'hasRepNotInReg',
  },
])

const isRegistrarEqualRepresentative = () => {
  if (formData.registrarDetails.representative) {
    return formData.registrarDetails.representative!.id === formData.registrarDetails.id
  }
  return false
}

const clearRepresentativeInFormData = () => {
  delete formData.registrarDetails['representative']
}

const resetRepresentativeInFormData = () => {
  formData.registrarDetails['representative'] = {
    id: '',
    dateOfBirth: '',
    name: '',
    mothersName: '',
  }
}

const fillRepresentativeWithRegistrar = () => {
  if (formData.registrarDetails.representative) {
    formData.registrarDetails.representative!.dateOfBirth = formData.registrarDetails.dateOfBirth
    formData.registrarDetails.representative!.name = formData.registrarDetails.name
    formData.registrarDetails.representative!.id = formData.registrarDetails.id
    formData.registrarDetails.representative!.mothersName = formData.registrarDetails.mothersName
  }
}

const showRepresentativeData = computed(
  () => representativeStatus.value === representativeOptions.value[2].value,
)

const handleNextButton = async () => {
  const result = await validation.value.registrarDetails.$validate()
  if (result) {
    if (
      isRepresentativeRegistrarRequired &&
      representativeStatus.value === representativeOptions.value[2].value &&
      isRegistrarEqualRepresentative()
    ) {
      validateRegistrationForm.isRegistrarDetailsValid = false
      window.alert(
        $gettext('Registrar must be different from Representative'),
      )
      return
    }
    validateRegistrationForm.isRegistrarDetailsValid = true
    router.push('/register/landholders_information')
  } else {
    validateRegistrationForm.isRegistrarDetailsValid = false
  }
}
defineExpose({ handleNextButton })

watch(
  formData.registrarDetails,
  () => {
    if (
      isRepresentativeRegistrarRequired.value &&
      representativeStatus.value === representativeOptions.value[1].value
    ) {
      fillRepresentativeWithRegistrar()
    }
  },
  { deep: true },
)

watch(
  representativeStatus,
  (newStatus: string, oldStatus: string) => {
    console.log(oldStatus)
    console.log(newStatus)

    isRepresentativeRegistrarRequired.value =
      representativeStatus.value === representativeOptions.value[1].value ||
      representativeStatus.value === representativeOptions.value[2].value

    //Opção 1 - Sem representante
    if (representativeStatus.value === representativeOptions.value[0].value) {
      //Excluir o representante do formData
      clearRepresentativeInFormData()
    }

    //Opção 2 - Com representante igual ao registrador
    else if (representativeStatus.value === representativeOptions.value[1].value) {
      //Verificar se já existe um representante no formData
      if (!('representative' in formData.registrarDetails)) {
        //Se o representante não existe, criar um novo
        resetRepresentativeInFormData()
      }
      //Preencher os dados do representante com os dados do registrador
      fillRepresentativeWithRegistrar()
    }

    //Opção 3 - Com representante diferente do registrador
    else if (representativeStatus.value === representativeOptions.value[2].value) {
      //Verificar se já existe um representante no formData
      if (!('representative' in formData.registrarDetails)) {
        //Se o representanto não existe, criar um novo
        resetRepresentativeInFormData()
      }

      //Verificar se a opção anterior era a opção 2
      if (oldStatus === representativeOptions.value[1].value) {
        //Se a opção anterior era a opção 2, limpar os dados do representante
        resetRepresentativeInFormData()
      }
    }
  },
  { deep: true },
)

onMounted(() => {
  if ('representative' in formData.registrarDetails) {
    isRepresentativeRegistrarRequired.value = true
    if (isRegistrarEqualRepresentative()) {
      representativeStatus.value = representativeOptions.value[1].value
    } else {
      representativeStatus.value = representativeOptions.value[2].value
    }
  } else {
    isRepresentativeRegistrarRequired.value = false
    representativeStatus.value = representativeOptions.value[0].value
  }
})
</script>

<template>
  <WholeWidthCardComponent bg-color="rgb(243,252,248)">
    <h3 class="text-lg font-bold">{{ $gettext('REGISTRAR\'S DETAILS') }}</h3>
    <p>
      {{ $gettext('Fill in the information of the person responsible for doing the register (landholder, technical assistant, government officer, others).') }}
    </p>
  </WholeWidthCardComponent>

  <WholeWidthCardComponent bg-color="rgb(249,250,249)">
    <h3 class="text-base">{{ $gettext('Data') }}</h3>
    <div class="flex space-x-4">
      <TextInputComponent
        :label="
          $gettext('Personal ID') +
          ' ' +
          $gettext('(Required)')
        "
        id="id"
        v-model="formData.registrarDetails.id"
        :errors="validation.registrarDetails.id.$errors"
      />
      <CalendarComponent
        :label="
          $gettext('Date of birth')
        "
        id="dob"
        v-model="formData.registrarDetails.dateOfBirth"
        :errors="validation.registrarDetails.dateOfBirth.$errors"
      />
    </div>
    <div class="flex space-x-4">
      <TextInputComponent
        :label="
          $gettext('Name') +
          ' ' +
          $gettext('(Required)')
        "
        id="name"
        v-model="formData.registrarDetails.name"
        :errors="validation.registrarDetails.name.$errors"
      />
      <TextInputComponent
        :label="
          $gettext('Mother\'s name') +
          ' ' +
          $gettext('(Required)')
        "
        id="mothers_name"
        v-model="formData.registrarDetails.mothersName"
        :errors="validation.registrarDetails.mothersName.$errors"
      />
    </div>
  </WholeWidthCardComponent>

  <WholeWidthCardComponent bg-color="rgb(249,250,249)">
    <h3 class="text-lg">{{ $gettext('Representative Data') }}</h3>
    <p>
      {{ $gettext('Representative: In the Rural Environmental Registry (RER), the representative is an individual authorized by the property owner or landholder to act on their behalf at all stages of the registration process.') }}
    </p>
    <RadioButtonGroupComponent
      :options="representativeOptions"
      name="representative"
      v-model="representativeStatus"
      group-label=""
      :vertical-alignment="true"
    />
  </WholeWidthCardComponent>

  <WholeWidthCardComponent v-if="showRepresentativeData" bg-color="rgb(249,250,249)">
    <h3 class="text-base">{{ $gettext('Representative Data') }}</h3>

    <div class="flex space-x-4">
      <TextInputComponent
        :label="'Id ' + $gettext('(Required)')"
        id="rep_id"
        v-model="formData.registrarDetails.representative!.id"
        :errors="validation.registrarDetails.representative.id.$errors"
      />
      <CalendarComponent
        id="rep_dob"
        :label="
          $gettext('Date of birth') +
          ' ' +
          $gettext('(Required)')
        "
        v-model="formData.registrarDetails.representative!.dateOfBirth"
        :errors="validation.registrarDetails.representative.dateOfBirth.$errors"
      />
    </div>

    <div class="flex space-x-4">
      <TextInputComponent
        :label="
          $gettext('Name') +
          ' ' +
          $gettext('(Required)')
        "
        id="rep_name"
        v-model="formData.registrarDetails.representative!.name"
        :errors="validation.registrarDetails.representative.name.$errors"
      />
      <TextInputComponent
        :label="
          $gettext('Mother\'s name') +
          ' ' +
          $gettext('(Required)')
        "
        id="rep_mothers_name"
        v-model="formData.registrarDetails.representative!.mothersName"
        :errors="validation.registrarDetails.representative.mothersName.$errors"
      />
    </div>
  </WholeWidthCardComponent>

  <div class="mx-3 flex justify-between">
    <RouterLink class="br-button secondary mr-3" to="/register/property_map">
      {{ $gettext('Previous') }}
    </RouterLink>
    <button class="br-button primary" @click="handleNextButton">
      {{ $gettext('Next') }}
    </button>
  </div>
</template>
