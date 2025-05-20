<template>
  <a-modal
    :visible="visible"
    :width="670"
    :mask-closable="false"
    :esc-to-close="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ t('头像选择') }}</template>
    <div class="avatar-content">
      <div class="avatar-item" :class="{'active': currentAvatar === index}" v-for="(item, index) in userAvatarData" :key="index" @click="currentAvatar = index">
        <div class="avatar-item-box" @click="currentAvatar = index">
          <van-image
            fit="cover"
            width="70"
            height="70"
            :src="item.href"
          />
        </div>
        <div class="check"><icon-check /></div>
      </div>
      <div class="avatar-item" :class="{'active': currentAvatar === userAvatarData.length}" @click="currentAvatar = userAvatarData.length">
        <div class="avatar-item-box">
          <div v-if="avatarIcon.length && avatarIcon[0].status === 'success'" class="delete" @click="avatarIcon = []">{{ t('删除') }}</div>
          <Uploader
            v-model="avatarIcon"
            :max-count="1"
            :after-read="(file) => afterRead(file, 'avatar')"
            :max-size="10 * 1024 * 1024"
            :preview-options="{
              closeOnClickOverlay: true,
              closeable: true
            }"
            @oversize="onOversize"
          />
        </div>
        <div class="check"><icon-check /></div>
      </div>
    </div>

    <template #footer>
      <a-button @click="handleCancel">{{ t('取消') }}</a-button>
      <a-button :loading="subLoading" type="primary" @click="submitHandle">{{ t('提交') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { userAvatarData } from '@/configs'
  import { Uploader, Image as VanImage} from 'vant'
  import { Message } from '@arco-design/web-vue'
  import { compressImage } from '@/utils'
  import { imageUpload } from '@/api/system'
  import { refreshAvatar } from '@/api/user'

  const { t } = useI18n()
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)

  const currentAvatar = ref(0)
  const avatarIcon = ref([])

  const emits = defineEmits(['update:visible']);
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })

  const onOversize = () => {
    Message.error(t('图片大小不能超过{0}', ['10MB']))
  }

  const afterRead = async (file, moduleName) => {
    file.status = 'uploading'
    file.message = t('上传中...')

    try {
      // 如果文件大于10MB，直接提示并返回
      if (file.file.size > 10 * 1024 * 1024) {
        Message.error(t('图片大小不能超过{0}', ['10MB']))
        file.status = 'failed'
        return
      }

      const compressedFile = await compressImage(file.file)

      const formData = new FormData();// 通过formdata上传
      formData.append('file', compressedFile);
      formData.append('moduleName', moduleName)
      imageUpload(formData).then(res => {
        file.status = 'success'
        file.message = t('上传成功')
        file.url = res.url
      }).catch(function (err) {
        file.status = 'failed'
        file.message = t('上传失败')

        avatarIcon.value = []
      })
    } catch (error) {
      console.error('Upload error:', error)
      file.status = 'failed'
    }
  }

  const handleCancel = () => {
    // 重置状态
    currentAvatar.value = 0
    avatarIcon.value = []
    emits('update:visible', false)
  }
  
  const subLoading = ref(false)
  const submitHandle = () => {
    if (currentAvatar.value === userAvatarData.length) {
      if (!avatarIcon.value.length || !avatarIcon.value[0].url) {
        Message.error(t('请上传头像'))
        return
      }
    }

    const params = currentAvatar.value === userAvatarData.length ? {
      iconUrl: avatarIcon.value[0].url
    } : {
      idx: currentAvatar.value
    }

    subLoading.value = true

    refreshAvatar(params).then(async () => {
      await userStore.getUserInfo()

      Message.success(t('修改成功'))
      handleCancel()
    }).catch(function (err) {
      Message.error(t('修改失败'))
    }).finally(() => {
      subLoading.value = false
    })
  }

  watch(() => props.visible, (newVal) => {
    if (newVal) {
      const num = Number(userInfo.value.avatar)
      if (userInfo.value.icon) {
        avatarIcon.value = [
          {
            url: userInfo.value.icon,
            status: 'success'
          }
        ]

        currentAvatar.value = userAvatarData.length
      } else {
        currentAvatar.value = num
      }
    }
  })
</script>

<style lang="less" scoped>
  .avatar-content {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20px;
    .avatar-item {
      position: relative;
      .avatar-item-box {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid transparent;
        cursor: pointer;
        position: relative;
        .delete {
          width: 100%;
          position: absolute;
          top: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.4);
          color: rgb(var(--danger-6));
          padding: 5px 5px;
          border-radius: 5px;
          font-size: 11px;
          z-index: 9;
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover {
            background-color: rgba(0, 0, 0, 0.6);
          }
        }
      }
      .check {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgb(var(--primary-6));
        color: #fff;
        right: 0;
        bottom: 0;
        opacity: 0;
      }
      &.active {
        .avatar-item-box {
          border: 1px solid rgb(var(--primary-6));
        }
        .check {
          opacity: 1;
        }
      }
      :deep(.van-uploader) {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        overflow: hidden;
        .van-uploader__upload {
          width: 70px;
          height: 70px;
          margin: 0;
        }
        .van-uploader__preview-image {
          width: 70px;
          height: 70px;
          border-radius: 50%;
        }
      }
    }
  }
</style>
