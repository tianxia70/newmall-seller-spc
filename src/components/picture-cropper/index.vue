<template>
  <a-modal
    :visible="visible"
    :width="900"
    :mask-closable="false"
    :esc-to-close="false"
    :style="{ zIndex: 3000 }"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ t('图片裁切') }}</template>
    
    <div v-if="cropperImage">
      <VuePictureCropper
        :boxStyle="{
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f8f8',
          margin: 'auto',
        }"
        :img="cropperImage"
        :options="{
          viewMode: 1,
          dragMode: 'crop',
          aspectRatio: width / height,
        }"
      />
    </div>
    <template #footer>
      <a-button @click="handleCancel">{{ t('取消') }}</a-button>
      <a-button type="primary" @click="submitHandle">{{ t('提交') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  file: {
    type: File,
    default: () => null
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 400
  }
})

const emits = defineEmits(['update:visible', 'confirm'])

const cropperImage = ref(null)

const handleCancel = () => {
  emits('update:visible', false)
}

const submitHandle = async () => {
  if (!cropper) return
  const base64 = cropper.getDataURL()
  const blob = await cropper.getBlob()
  if (!blob) return
  const file = await cropper.getFile()

  const obj = {
    dataURL: base64,
    blobURL: URL.createObjectURL(blob),
    file: file
  }

  emits('confirm', obj)
  handleCancel()
}

watch(() => props.visible, (val) => {
  if (val && props.file) {
    const reader = new FileReader()
    reader.readAsDataURL(props.file)
    reader.onload = () => {
      cropperImage.value = String(reader.result)
    }
  }
})
</script>
