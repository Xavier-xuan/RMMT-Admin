<template>
  <Tutorial />
</template>

<script>
export default {
  name: 'IndexPage',
    beforeCreate() {
      this.$router.replace('/dashboard')
    }
}
</script>
