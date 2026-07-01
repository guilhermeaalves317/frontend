import type { Validation } from '@vuelidate/core'
import type { Language } from 'vue3-gettext'
import type { Ref } from 'vue'

export interface InvalidFieldDetail {
  step: string
  fields: string[]
}

export interface ValidationHelperOptions {
  validation: Ref<Validation>
  formData: any
  $gettext: Language["$gettext"]
}

export class ValidationHelper {
  private validation: Ref<Validation>
  private formData: any
  private $gettext: Language["$gettext"]

  constructor(options: ValidationHelperOptions) {
    this.validation = options.validation
    this.formData = options.formData
    this.$gettext = options.$gettext
  }

  private getFieldDisplayName(fieldKey: string, stepContext: string): string {
    const fieldMappings: { [key: string]: { [field: string]: string } } = {
      registrarDetails: {
        id: this.$gettext('Personal ID'),
        dateOfBirth: this.$gettext('Date of birth'),
        name: this.$gettext('Name'),
        mothersName: this.$gettext('Mother\'s name'),
        'representative.id': `${this.$gettext('Representative Data')} - ${this.$gettext('Personal ID')}`,
        'representative.dateOfBirth': `${this.$gettext('Representative Data')} - ${this.$gettext('Date of birth')}`,
        'representative.name': `${this.$gettext('Representative Data')} - ${this.$gettext('Name')}`,
        'representative.mothersName': `${this.$gettext('Representative Data')} - ${this.$gettext('Mother\'s name')}`,
      },
      landHoldersInformation: {
        id: this.$gettext('Personal ID'),
        dateOfBirth: this.$gettext('Date of birth'),
        name: this.$gettext('Name'),
        mothersName: this.$gettext('Mother\'s name'),
        legalPersonality: this.$gettext('Legal personality of landholder'),
        wayToAddLandholdersInformation: this.$gettext(
          "Choose a way to add landholder's information",
        ),
      },
      ruralProperties: {
        propertyName: this.$gettext('Property Name'),
        state: this.$gettext('State'),
        city: this.$gettext('City'),
        zipCode: this.$gettext('Zip Code'),
        'mailingAddress.recipientName': `${this.$gettext('Mailing Address')} - ${this.$gettext('Recipient Name')}`,
        'mailingAddress.addressStreet': `${this.$gettext('Mailing Address')} - ${this.$gettext('Address/Street')}`,
        'mailingAddress.number': `${this.$gettext('Mailing Address')} - ${this.$gettext('Number')}`,
        'mailingAddress.neighborhood': `${this.$gettext('Mailing Address')} - ${this.$gettext('Neighborhood')}`,
        'mailingAddress.zipCode': `${this.$gettext('Mailing Address')} - ${this.$gettext('Zip Code')}`,
        'mailingAddress.state': `${this.$gettext('Mailing Address')} - ${this.$gettext('State')}`,
        'mailingAddress.city': `${this.$gettext('Mailing Address')} - ${this.$gettext('City')}`,
      },
      propertyRights: {
        propertyLandholding: this.$gettext('Property or Landholding'),
        registeredPropertyName: this.$gettext('Registered Property Name'),
        area: this.$gettext('Area'),
        documentType: this.$gettext('Document Type'),
        titleDeedLandDocument: this.$gettext('Title deed/ Land Document'),
        documentDate: this.$gettext('Document Date'),
        book: this.$gettext('Book'),
        page: this.$gettext('Page'),
        stateOfTheNotaryOffice: this.$gettext('State of The Notary Office'),
        cityOfTheNotaryOffice: this.$gettext('City of The Notary Office'),
        propertyCertification: this.$gettext('Property Certification'),
        nationalRuralPropertyRegistrationNumber: this.$gettext(
          'National Rural Property Registration Number',
        ),
      },
    }

    return fieldMappings[stepContext]?.[fieldKey] || fieldKey
  }

  getInvalidFieldsDetails(): InvalidFieldDetail[] {
    const invalidFields: InvalidFieldDetail[] = []

    // Check registrarDetails validation
    if (this.validation.value.registrarDetails.$invalid) {
      const fields = Object.keys(this.validation.value.registrarDetails)
        .filter((key) => key !== '$invalid' && this.validation.value.registrarDetails[key].$invalid)
        .map((key) => {
          if (key === 'representative') {
            const repFields = Object.keys(
              this.validation.value.registrarDetails.representative,
            ).filter(
              (repKey) =>
                repKey !== '$invalid' &&
                this.validation.value.registrarDetails.representative[repKey].$invalid,
            )
            return repFields.map((repField) =>
              this.getFieldDisplayName(`representative.${repField}`, 'registrarDetails'),
            )
          }
          return this.getFieldDisplayName(key, 'registrarDetails')
        })
        .flat()

      if (fields.length > 0) {
        invalidFields.push({ step: this.$gettext('REGISTRAR\'S DETAILS'), fields })
      }
    }

    // Check landHoldersInformation validation
    if (this.validation.value.landHoldersInformation.$invalid) {
      const fields = Object.keys(this.validation.value.landHoldersInformation)
        .filter(
          (key) => key !== '$invalid' && this.validation.value.landHoldersInformation[key].$invalid,
        )
        .map((key) => this.getFieldDisplayName(key, 'landHoldersInformation'))

      if (fields.length > 0) {
        invalidFields.push({
          step: this.$gettext('LANDHOLDERS INFORMATION'),
          fields,
        })
      }
    }

    // Check ruralProperties validation
    if (this.validation.value.ruralProperties.$invalid) {
      const fields = Object.keys(this.validation.value.ruralProperties)
        .filter((key) => key !== '$invalid' && this.validation.value.ruralProperties[key].$invalid)
        .map((key) => {
          if (key === 'mailingAddress') {
            const mailFields = Object.keys(
              this.validation.value.ruralProperties.mailingAddress,
            ).filter(
              (mailKey) =>
                mailKey !== '$invalid' &&
                this.validation.value.ruralProperties.mailingAddress[mailKey].$invalid,
            )
            return mailFields.map((mailField) =>
              this.getFieldDisplayName(`mailingAddress.${mailField}`, 'ruralProperties'),
            )
          }
          return this.getFieldDisplayName(key, 'ruralProperties')
        })
        .flat()

      if (fields.length > 0) {
        invalidFields.push({ step: this.$gettext('RURAL PROPERTY'), fields })
      }
    }

    // Check propertyRights validation
    if (this.validation.value.propertyRights.$invalid) {
      const fields = Object.keys(this.validation.value.propertyRights)
        .filter((key) => key !== '$invalid' && this.validation.value.propertyRights[key].$invalid)
        .map((key) => this.getFieldDisplayName(key, 'propertyRights'))

      if (fields.length > 0) {
        invalidFields.push({ step: this.$gettext('OWNER DETAILS AND DOCUMENTATION.'), fields })
      }
    }

    // Check if landholders data is missing
    if (
      !this.formData.landHoldersInformation?.landHoldersData ||
      this.formData.landHoldersInformation.landHoldersData.length === 0
    ) {
      invalidFields.push({
        step: this.$gettext('LANDHOLDERS INFORMATION'),
        fields: [this.$gettext('Please add at least one landholder.')],
      })
    }

    // Check if property rights documents are missing
    if (
      !this.formData.propertyRights?.propertyRightsData ||
      this.formData.propertyRights.propertyRightsData.length === 0
    ) {
      invalidFields.push({
        step: this.$gettext('OWNER DETAILS AND DOCUMENTATION.'),
        fields: [this.$gettext('Please add at least one Land Document')],
      })
    }

    return invalidFields
  }

  buildValidationMessage(invalidFields: InvalidFieldDetail[]): string {
    if (invalidFields.length === 0) return ''

    let detailedMessage =
      this.$gettext('There are required fields that need to be filled before submitting:') + '\n\n'

    invalidFields.forEach((stepInfo) => {
      detailedMessage += `${this.$gettext('Step')}: ${stepInfo.step}\n`
      detailedMessage += `${this.$gettext('Required fields')}: ${stepInfo.fields.join(', ')}\n\n`
    })

    detailedMessage += this.$gettext('Please go back to the previous steps and fill in all required fields before proceeding.')

    return detailedMessage
  }

  getPropertyRightsInvalidFields(): string[] {
    return Object.keys(this.validation.value.propertyRights)
      .filter((key) => key !== '$invalid' && this.validation.value.propertyRights[key].$invalid)
      .map((key) => this.getFieldDisplayName(key, 'propertyRights'))
  }
}
