<template>
<div class="zhixin-logo">
  <img :width="width" :height="height" src="/zhixin-logo.jpg" />
</div>
</template>

<script>
export default {
  name: "ZhixinLogo",
  props: {
    width: {
      default: "196.5px"
    },
    height: {
      default: "98.6px"
    }
  }
}
</script>

<style scoped>
.zhixin-logo{
  text-align: center;
}
</style>