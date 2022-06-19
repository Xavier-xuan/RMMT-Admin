<template>
    <div class="reset">
        <PageHeader title="一键还原"></PageHeader>
        <el-row>
            <el-col :offset="2" :span="12">
                <div class="default-container">
                    <div class="tip">
                        本操作将会清除系统中除问卷问题、系统设置以及管理员账号以外的
                        <el-tag effect="dark" type="danger">所有数据</el-tag>
                        ，请谨慎操作！
                    </div>
                    <br/>
                    <el-button @click="confirm_reset" type="warning">一键还原</el-button>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "reset",
    methods: {
        // 以下代码未经测试 待需要时再来
        confirm_reset() {
            this.$prompt('请输入密码以确认操作', '确认操作', {
                inputType: "password",
                type: "warning"
            }).then(({value}) => {
                this.$axios.$post("/system_reset/perform", {
                    password: value
                }).then(data => {
                    if (data.code === 200) {
                        this.$message.success("系统数据已清除")
                    } else {
                        this.$message.error("一键还原失败")
                    }
                })
            })
        }
    }
}
</script>

<style scoped>
.tip {
    line-height: 30px;
}
</style>
