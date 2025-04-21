<template>
  <div class="pc-number-code" @click="refreshCode">
    <canvas id="s-canvas" :width="contentWidth" :height="contentHeight"></canvas>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const emits = defineEmits(['done'])

  const identifyCode = ref('')
  const backgroundColorMin = ref(180)
  const backgroundColorMax = ref(240)
  const contentWidth = ref(100)
  const contentHeight = ref(42)
  const colorMin = ref(50)
  const colorMax = ref(160)
  const fontSizeMin = ref(32)
  const fontSizeMax = ref(40)
  const lineColorMin = ref(40)
  const lineColorMax = ref(100)

  // 生成一个随机数
  const randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
  }

  // 生成一个随机的颜色
  const randomColor = (min, max) => {
    let r = randomNum(min, max);
    let g = randomNum(min, max);
    let b = randomNum(min, max);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  const drawPic = () => {
    let canvas = document.getElementById("s-canvas");
    let ctx = canvas.getContext("2d");
    ctx.textBaseline = "bottom";
    // 绘制背景
    ctx.fillStyle = randomColor(backgroundColorMin.value, backgroundColorMax.value);
    ctx.fillRect(0, 0, contentWidth.value, contentHeight.value);
    // 绘制文字
    for (let i = 0; i < identifyCode.value.length; i++) {
      drawText(ctx, identifyCode.value[i], i);
    }
    drawLine(ctx);
    drawDot(ctx);
  }

  const drawText = (ctx, txt, i) => {
    ctx.fillStyle = randomColor(colorMin.value, colorMax.value);
    ctx.font = randomNum(fontSizeMin.value, fontSizeMax.value) + "px SimHei";
    let x = (i + 1) * (contentWidth.value / (identifyCode.value.length + 1));
    let y = randomNum(fontSizeMax.value, contentHeight.value - 5);
    var deg = randomNum(-15, 15);
    // 修改坐标原点和旋转角度
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillText(txt, 0, 0);
    // 恢复坐标原点和旋转角度
    ctx.rotate((-deg * Math.PI) / 180);
    ctx.translate(-x, -y);
  }

  const drawLine = (ctx) => {
    // 绘制干扰线
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = randomColor(
        lineColorMin.value,
        lineColorMax.value
      );
      ctx.beginPath();
      ctx.moveTo(
        randomNum(0, contentWidth.value),
        randomNum(0, contentHeight.value)
      );
      ctx.lineTo(
        randomNum(0, contentWidth.value),
        randomNum(0, contentHeight.value)
      );
      ctx.stroke();
    }
  }

  const drawDot = (ctx) => {
    // 绘制干扰点
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = randomColor(0, 100);
      ctx.beginPath();
      ctx.arc(
        randomNum(0, contentWidth.value),
        randomNum(0, contentHeight.value),
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  const refreshCode = () => {
    identifyCode.value = ''
    makCode()
  }

  const makCode = () => {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    let rTxt = ''
    for (let i = 0; i < 4; i++) {
      const index = Math.floor(Math.random() * numbers.length)
      rTxt += numbers[index]
    }
    identifyCode.value = rTxt

    emits('done', rTxt)
    drawPic()
  }

  onMounted(() => {
    refreshCode()
  })
</script>

<style lang="less" scoped>
  .pc-number-code {
    cursor: pointer;
  }
</style>
