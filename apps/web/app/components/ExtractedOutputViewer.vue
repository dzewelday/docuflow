<script setup lang="ts">
const props = defineProps<{
  extractedText?: string | null
  formattedExtractedData?: string | null
  errorMessage?: string | null
}>()

const activeTab = ref<'text' | 'json'>('text')
</script>

<template>
  <div class="glass-panel rounded-[1.75rem] p-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="eyebrow">Result</p>
        <p class="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-color">Review the extracted content</p>
      </div>
      <StatusTag :label="props.formattedExtractedData ? 'Ready' : 'Waiting'" :tone="props.formattedExtractedData ? 'success' : 'neutral'" />
    </div>

    <Message
      v-if="props.errorMessage"
      severity="error"
      :closable="false"
      class="mt-6"
    >
      {{ props.errorMessage }}
    </Message>

    <Tabs v-model:value="activeTab" class="doc-tabs mt-6">
      <TabList :pt="{ activeBar: 'hidden' }">
        <Tab value="text">Text</Tab>
        <Tab value="json">Structured</Tab>
      </TabList>

      <TabPanels :pt="{ root: 'mt-1' }">
        <TabPanel value="text">
          <ScrollPanel class="doc-scrollpanel h-[24rem]">
            <div class="rounded-[1.4rem] bg-night p-5 text-sm leading-7 text-white">
              <p v-if="props.extractedText" class="whitespace-pre-wrap break-words">{{ props.extractedText }}</p>
              <Message v-else severity="secondary" :closable="false">
                No text yet.
              </Message>
            </div>
          </ScrollPanel>
        </TabPanel>

        <TabPanel value="json">
          <ScrollPanel class="doc-scrollpanel h-[24rem]">
            <div class="rounded-[1.4rem] bg-night p-5">
              <pre v-if="props.formattedExtractedData" class="overflow-x-auto text-xs leading-6 text-white">{{ props.formattedExtractedData }}</pre>
              <Message v-else severity="secondary" :closable="false">
                No structured data yet.
              </Message>
            </div>
          </ScrollPanel>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
