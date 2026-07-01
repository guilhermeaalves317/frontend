import type { Language } from 'vue3-gettext'
import Layers from '@/config/map/layers.ts'
import { translateByLegacyKey } from '@/i18n/dynamicTranslations'
import { DEFAULT_LOCALE } from '@/i18n/locale'
import { LEGACY_KEY_MAP } from '@/i18n/legacyKeyMap'

/** Memorial descritivo usa inglês independente do idioma da UI. */
export const DESCRIPTIVE_MEMORIAL_LANGUAGE = DEFAULT_LOCALE

type GettextFn = Language['$gettext']

const DESCRIPTIVE_MEMORIAL_PREFIX = 'descriptiveMemorial.'

export const getTranslatedDescriptiveMemorial = ($gettext: GettextFn) => {
  const result: Record<string, string> = {}

  for (const [key, msgid] of Object.entries(LEGACY_KEY_MAP)) {
    if (key.startsWith(DESCRIPTIVE_MEMORIAL_PREFIX)) {
      const shortKey = key.slice(DESCRIPTIVE_MEMORIAL_PREFIX.length)
      result[shortKey] = $gettext(msgid)
    }
  }

  return result
}

export const MAP_LAYERS = Layers

export function getTranslatedLayers($gettext: GettextFn) {
  const layersCopy = JSON.parse(JSON.stringify(MAP_LAYERS))

  const translateObject = (obj: Record<string, unknown>): void => {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          translateObject(item as Record<string, unknown>)
        }
      })
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

        if (key.endsWith('Key') && typeof obj[key] === 'string') {
          const legacyKey = obj[key] as string
          const translatedText = translateByLegacyKey(legacyKey, $gettext)
          const baseKey = key.replace('Key', '')
          obj[baseKey] = translatedText
        } else if (key === 'toggle' && typeof obj[key] === 'object' && obj[key] !== null) {
          const toggle = obj[key] as Record<string, string>
          if (toggle.active === 'active') {
            toggle.active = $gettext('Active')
          }
          if (toggle.inactive === 'inactive') {
            toggle.inactive = $gettext('Inactive')
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          translateObject(obj[key] as Record<string, unknown>)
        }
      }
    }
  }

  translateObject(layersCopy)

  return layersCopy
}

export const MapOptions = {
  map: {
    config: {
      zoomControl: true,
      minZoom: 3,
      maxZoom: 17,
      center: [-15.235, -51.9253],
      zoom: 4,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      preferCanvas: false,
      markerZoomAnimation: false,
      stabilizeMarkersOnZoom: true,
    },
  },
  layersMenu: {
    size: 'medium',
  },
  drawing: {
    show: true,
    options: {
      position: 'topright',
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawRectangle: false,
      drawPolygon: false,
      drawPolyline: false,
      editMode: false,
      removalMode: false,
    },
  },
  tools: {
    show: true,
    position: 'topright',
    fullscreen: { show: true, title: 'Fullscreen' },
    center: { show: true, title: 'Center map', target: 'drawn' },
    measureArea: {
      show: true,
      title: 'Measure',
    },
    texts: {
      measureResult: 'Measurement',
      measureLength: 'Distance',
      measureArea: 'Area',
      measurePanelTitle: 'Measure distances and areas',
      measureLineTitle: 'Measure line',
      measurePolygonTitle: 'Measure polygon',
      measureLineHelp: 'Click two points on the map. Double-click to finish the line.',
      measurePolygonHelp:
        'Click to add vertices. Finish on the first point, use Finish, or double-click.',
      measureCancel: 'Cancel',
      measureFinish: 'Finish measurement',
      noGeometry: 'No geometry to center on',
    },
  },
}
