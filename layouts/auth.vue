<template>
    <div class="auth-page">
        <div class="background">
            <img src="/login-background.jpg" style="object-fit: cover;" width="100%"
                 height="100%" alt=""/>
        </div>
        <div class="content">
            <Nuxt/>
        </div>
    </div>
</template>

<script>
export default {
    name: "auth"
}
</script>

<style scoped>
.background {
    width: 100%;
    height: 100%; /**宽高100%是为了图片铺满屏幕 **/
    z-index: -1;
    position: absolute;
    background-image: url("https://s2.loli.net/2022/02/01/X5meEt3qr4bKPZB.jpg");

}

.content {
    z-index: 1;
    position: absolute;
    height: 100%;
    width: 100%;
}
</style>
