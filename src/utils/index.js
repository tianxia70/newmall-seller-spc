import Compressor from 'compressorjs'
import router from '@/router';
import i18n from '@/i18n'
import { useCurrencyStore } from '@/store'

export const loadSiteConfig = async (siteName = 'argos') => {
  try {
    // 动态导入对应站点的配置
    const config = await import(`@/configs/sites/${siteName}.js`)
    return config.default
  } catch (err) {
    console.warn(`[loadSiteConfig] 加载站点配置失败: ${siteName}，尝试加载默认配置...`, err)

    // fallback 到默认配置 argos
    const fallback = await import('@/configs/sites/argos.js')
    return fallback.default
  }
}

export const navigationTo = (path, blank = false) => {
  if (blank) {
    window.open(path, '_blank');
  } else {
    router.push(path);
  }
};

export const goBack = () => {
  router.back();
};


/**
 * 获取字符串中所有的数字
 */
export function extractNumbers(str) {
  // 使用正则表达式匹配所有的数字
  const regex = /\d+/g;
  const numbers = str.match(regex);

  // 如果没有匹配的数字，返回空数组
  return numbers ? numbers.map(Number) : [];
}

// 数字格式化
export const numberStrFormat = (number, decimal = 2, flag = false, hideUnit = false) => {
  const currencyStore = useCurrencyStore()
  const unit = hideUnit ? '' : currencyStore.currencyUnit

  let resStr = decimal === 0 ? "0" : "0.00"
  const amount = Number(number)

  if (!isNaN(amount)) {
    // **手动截断小数**
    const factor = Math.pow(10, decimal)
    const truncatedAmount = Math.floor(Math.abs(amount) * factor) / factor

    // **格式化数字**
    resStr = flag
      ? String(truncatedAmount)
      : truncatedAmount.toLocaleString("en-US", { minimumFractionDigits: decimal, maximumFractionDigits: decimal })

    // **确保小数点后位数正确**
    if (resStr.indexOf(".") > -1) {
      const arr = resStr.split(".")
      if (arr[1].length === 1) {
        resStr = resStr + "0" // 确保 1 位小数时补 0
      }
    } else {
      resStr = decimal === 0 ? resStr : resStr + ".00" // 确保整数时补 `.00`
    }
  }

  return !isNaN(amount) && amount < 0 ? "-" + `${unit}${resStr}` : `${unit}${resStr}`
}

export const loadJs = (src) => {
  return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.type = "text/javascript";
      script.src = src;
      document.body.appendChild(script);

      script.onload = () => {
          resolve();
      }
      script.onerror = () => {
          reject();
      }
  })
}

// 日期时间格式化
export const dateFormat = (date, format = "") => {
  if (!date) return ''
  const _date = new Date(date)
  let _format = format || 'yyyy-MM-dd hh:mm:ss'
  const o = {
      "M+": _date.getMonth() + 1, //month
      "d+": _date.getDate(), //day
      "h+": _date.getHours(), //hour
      "m+": _date.getMinutes(), //minute
      "s+": _date.getSeconds(), //second
      "q+": Math.floor((_date.getMonth() + 3) / 3), //quarter
      "S": _date.getMilliseconds() //millisecond
  }
  if (/(y+)/.test(_format)) {
      _format = _format.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
      if (new RegExp("(" + k + ")").test(_format)) {
          _format = _format.replace(RegExp.$1, RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length))
      }
  }
  return _format
}

// 是否是阿拉伯语
export const isArLang = () => {
  return i18n.global.locale.value === 'ar'
}

// 是否为真
export const isTruthy = (value) => {
  if (typeof value === 'boolean') {
    return value === true;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

// 图片压缩
export const compressImage = (file) => {
  // 根据文件大小决定压缩质量
  const getQuality = (size) => {
    const mbSize = size / (1024 * 1024)
    if (mbSize <= 1) return 0.8
    if (mbSize <= 2) return 0.7
    if (mbSize <= 3) return 0.6
    return 0.5
  }

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: getQuality(file.size),
      maxWidth: 3000,
      maxHeight: 3000,
      convertSize: 0,
      success(result) {
        // 确保压缩后的文件保持原始文件类型和名称
        const compressedFile = new File([result], file.name, {
          type: file.type,
          lastModified: new Date().getTime()
        })

        // 如果压缩后比原图还大，则使用原图
        if (compressedFile.size > file.size) {
          console.log('压缩后文件更大，使用原图')
          resolve(file)
        } else {
          resolve(compressedFile)
        }
      },
      error(err) {
        console.error('Compress error:', err)
        resolve(file)
      },
      mimeType: file.type || 'image/jpeg',
      preserveExif: true,
      checkOrientation: true,
      strict: true,
      resize: 'none'
    })
  })
}

export const getType = (obj) => {
  const typeStr = Object.prototype.toString.call(obj);
  const type = typeStr.slice(8, -1); // 截取 "[object Xxx]" 中的 "Xxx"
  return type.toLowerCase()
}


export const getImageSize = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file);

    reader.onload = function () {
      const img = new Image()
      img.src = reader.result;

      img.onload = function () {
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = function (err) {
        reject(err);
      };
    };

    reader.onerror = function (err) {
      reject(err);
    }
  })
}

// 下载图片
export const downloadImage = (imgsrc, name) => {
  const image = new Image();
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    // @ts-ignore
    context.drawImage(image, 0, 0, image.width, image.height);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const event = new MouseEvent('click');
    a.download = name || 'photo';
    a.href = url;
    a.dispatchEvent(event);
  };
  image.src = imgsrc
}