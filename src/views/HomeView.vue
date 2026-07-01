<script setup lang="ts">
import { useGettext } from 'vue3-gettext'
import CardComponent from '@/components/CardComponent.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faNoteSticky, faMap, faUser, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { RouterLink } from 'vue-router'
const { $gettext } = useGettext()

import { ref } from 'vue'

const showBanner = ref(true)
</script>

<template>
  <div class="flex flex-col">
    <div
      v-if="showBanner"
      class="br-message info mb-4"
      style="padding-top: 0.15rem; padding-bottom: 0.15rem"
    >
      <div class="icon">
        <i class="fas fa-info-circle fa-lg" aria-hidden="true"></i>
      </div>
      <div class="content" role="alert">
        <span class="message-title">{{ $gettext('Information.') }}</span>
        <span class="message-body">{{ $gettext(' This environment is for demonstration purposes. Data is deleted daily and should not be considered permanent.') }}</span>
      </div>
      <div class="close">
        <button class="br-button circle small" type="button" @click="showBanner = false">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <div class="flex-grow max-w-7xl mx-auto w-full flex flex-col justify-center">
      <div class="grid grid-cols-1 md:grid-cols-[30%_70%] items-center gap-8 w-full mt-10">
        <div class="hidden md:flex justify-center">
          <img src="/images/Logo-RER.png" width="500" height="500" alt="image of Logo RER" />
        </div>

        <div class="flex flex-col justify-center w-full">
          <h1 class="text-lg md:text-xl pl-2 mb-3">
            {{ $gettext('Choose the option based on what you want to do.') }}
          </h1>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 mr-5">
            <CardComponent>
              <RouterLink to="/register/property_map">
                <div>
                  <FontAwesomeIcon
                    :icon="faNoteSticky"
                    style="color: #1351b4"
                    class="cursor-pointer !w-[48px] !h-[48px]"
                  />
                </div>
                <div>
                  <h2 class="text-lg">{{ $gettext('Register property') }}</h2>
                </div>
              </RouterLink>
            </CardComponent>
            <CardComponent>
              <RouterLink to="/properties">
                <div>
                  <FontAwesomeIcon
                    :icon="faMap"
                    style="color: #1351b4"
                    class="cursor-pointer !w-[48px] !h-[48px]"
                  />
                </div>
                <div>
                  <h2 class="text-lg">{{ $gettext('Properties') }}</h2>
                </div>
              </RouterLink>
            </CardComponent>
            <CardComponent>
              <RouterLink to="/profile">
                <div>
                  <FontAwesomeIcon
                    :icon="faUser"
                    style="color: #1351b4"
                    class="cursor-pointer !w-[48px] !h-[48px]"
                  />
                </div>
                <div>
                  <h2 class="text-lg">{{ $gettext('Profile') }}</h2>
                </div>
              </RouterLink>
            </CardComponent>
          </div>

          <div class="flex items-center">
            <FontAwesomeIcon
              :icon="faCircleQuestion"
              style="color: #1351b4"
              class="cursor-pointer w-[16px] h-[16px] pb-4 pl-3"
            />
            <a
              href="https://github.com/Rural-Environmental-Registry/core"
              target="_blank"
              class="text-[#1351b4] text-lg font-bold pl-2 cursor-pointer hover:underline"
            >
              {{ $gettext('Learn more about the project.') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
