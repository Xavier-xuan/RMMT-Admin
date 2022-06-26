<template>
</template>

<script>
export default {
  name: 'IndexPage',
    beforeRouteEnter(to, from, next) {
      next("/dashboard")
  }
}
</script>
