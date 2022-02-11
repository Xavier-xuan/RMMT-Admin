<template>
    <el-row>
        <el-col :span="6" :offset="2">
            <div class="page-header">
                {{title}}
            </div>
        </el-col>
    </el-row>
</template>

<script>
export default {
    name: "PageHeader",
    props: ['title']
}
</script>

<style scoped>
.page-header{
    color: rgba(0,0,0,.87);
    font-size: 1.8rem;
}
</style>
