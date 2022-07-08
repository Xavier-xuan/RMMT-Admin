<template>
    <div class="import-students">
        <PageHeader title="批量导入学生"></PageHeader>
        <el-row type="flex">
            <el-col :span="14" :offset="2">
                <div class="default-container">
                    <div class="hint">
                        请按照以下格式导入学生数据: <br/>
                        <el-tag size="mini">ID</el-tag>
                        <el-tag size="mini">姓名</el-tag>
                        <el-tag size="mini">性别（1 代表男性，2 代表女性）</el-tag>
                        <el-tag size="mini">密码（最少8位字符）</el-tag>
                        <br/>
                        如果学生的名字中间包含空格，请用
                        <el-tag size="mini">#</el-tag>
                        替换空格，否则将导入失败
                        <br/>
                        换句话说，一行中仅且只能出现三个空格，比如： <br/>
                        <code>1111423 卢#光之使徒#笛 1 1230909123</code><br/>
                        注意，ID 在系统中应该具有唯一性，否则也会导入失败
                        <br/>
                        点击导入后页面卡住属于正常现象，每条数据将耗时大约0.5s，请不要重复点击导入按钮
                    </div>
                    <el-form>
                        <el-input type="textarea" :autosize="{ minRows: 10}" v-model="accounts_text"
                                  placeholder="1111423 卢#光之使徒#笛 1 1230909123
1111769 Alex#Jack 1 1230909123">

                        </el-input>
                    </el-form>
                    <el-button class="import-btn" type="primary" @click="import_accounts">
                        导入
                    </el-button>
                </div>
            </el-col>
        </el-row>

        <el-dialog :visible.sync="show_import_result" title="Importing is Complete">
            <h4>无法导入这些账户，因为他们的ID可能已经在系统中存在了，或者格式不符合系统的要求:</h4>
            <div style="margin-top: 5px" v-for="piece in fail_to_import">
                <el-tag size="medium">{{ piece }}</el-tag>
                <br/>
            </div>
            <el-button style="margin-top: 30px" type="primary" @click="show_import_result = false">OK</el-button>
        </el-dialog>

    </div>
</template>

<script>
export default {
    name: "import",
    data() {
        return {
            accounts_text: null,
            show_import_result: false,
            fail_to_import: []
        }
    },
    methods: {
        import_accounts: _.throttle(async function () {
            if (!this.accounts_text) return;
            this.accounts_text = this.accounts_text.trim()
            let accounts = this.accounts_text.split("\n")
            return this.$axios.$post("/student/import", {
                students: accounts
            }).then(data => {
                if (data.code === 200) {
                    if (data.data.fail_to_import.length > 0) {
                        this.fail_to_import = data.data.fail_to_import
                        this.show_import_result = true
                    } else {
                        this.accounts_text = null
                        this.$message.success("所有账户都已经顺利导入")
                    }
                }
            })
        }, 10000)
    }
}
</script>

<style scoped>
.hint {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    line-height: 2.3;
    font-size: 14px;
    color: rgba(0, 0, 0, .87);
    margin-bottom: 10px;
}

code {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    background-color: #f9fafc;
    padding: 0 4px;
    border: 1px solid #eaeefb;
    border-radius: 4px;
}

.import-btn {
    margin-top: 30px;
}
</style>
