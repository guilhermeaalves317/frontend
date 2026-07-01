import type { Language } from 'vue3-gettext'
import { LEGACY_KEY_MAP } from './legacyKeyMap'

type GettextFn = Language['$gettext']

export function translateByLegacyKey(key: string | undefined | null, $gettext: GettextFn): string {
  if (!key) return ''
  const msgid = LEGACY_KEY_MAP[key]
  if (!msgid) return key
  return $gettext(msgid)
}

const LANDHOLDER_TYPE_MSGIDS: Record<string, string> = {
  naturalPerson: 'Natural Person',
  legalEntity: 'Legal Entity',
}

export function translateLandholderType(type: string, $gettext: GettextFn): string {
  const msgid = LANDHOLDER_TYPE_MSGIDS[type]
  return msgid ? $gettext(msgid) : type
}

const HOLDING_TYPE_MSGIDS: Record<string, string> = {
  property: 'Property',
  landholding: 'Landholding',
}

export function translateHoldingType(type: string, $gettext: GettextFn): string {
  const msgid = HOLDING_TYPE_MSGIDS[type]
  return msgid ? $gettext(msgid) : type
}

const FILTER_KEY_MSGIDS: Record<string, string> = {
  filter: 'Filter',
  location: 'Location',
  stateDistrict: 'State',
  selectState: 'Select State',
  municipality: 'City',
  selectCity: 'Select City',
  details: 'Details',
  propertyName: 'Property Name',
  code: 'Property Registration Number',
  add: 'Add',
  landholder: 'Landholder',
  ownersName: 'Landholder Name',
  ownersIdentifier: 'Landholder Identifier',
  propertyNumbers: 'Property Numbers',
  landholderId: 'Landholder ID',
  clean: 'Clean',
  apply: 'Apply',
}

export function translateFilterKey(key: string, $gettext: GettextFn): string {
  const msgid = FILTER_KEY_MSGIDS[key]
  return msgid ? $gettext(msgid) : key
}

const LAYER_ERROR_MSGIDS: Record<string, string> = {
  invalidPolygon:
    'The layer being applied is not a valid polygon. Please verify and try again.',
  invalidType:
    'The layer being applied has an incompatible geometry with the expected one. Please verify and try again.',
  layerRemoval:
    'One or more layers ({layers}) presented errors and were removed from the map after being processed. Please verify and try again.',
}

export function translateDocumentType(type: string, $gettext: GettextFn): string {
  const normalized = String(type).toLowerCase()
  const msgids: Record<string, string> = {
    deed: 'Deed',
    titledeed: 'Title Deed',
    purchaseandsaleagreement: 'Purchase and Sale Agreement',
  }
  const msgid = msgids[normalized]
  return msgid ? $gettext(msgid) : type
}

export function translateLayerLabel(
  keyOrText: string | undefined | null,
  fallbackText: string | undefined | null,
  $gettext: GettextFn,
): string {
  if (!keyOrText) return fallbackText || ''
  const fromLegacy = translateByLegacyKey(keyOrText, $gettext)
  if (fromLegacy !== keyOrText) return fromLegacy
  if (fallbackText && keyOrText !== fallbackText) return fallbackText
  return $gettext(keyOrText)
}

export function translateLayerError(errorType: string, $gettext: GettextFn): string {
  const msgid = LAYER_ERROR_MSGIDS[errorType]
  return msgid ? $gettext(msgid) : errorType
}
