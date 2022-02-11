<template>
    <div class="import-students">
        <PageHeader title="批量导入学生"></PageHeader>
        <el-row type="flex">
            <el-col :span="14" :offset="2">
                <div class="default-container">
                    <div class="hint">
                        Please paste your students' accounts in following format: <br/>
                        <el-tag size="mini">ID</el-tag>
                        <el-tag size="mini">Name</el-tag>
                        <el-tag size="mini">Gender(1 for male and 2 for female)</el-tag>
                        <el-tag size="mini">Password(at least 8 characters)</el-tag>
                        <br/>
                        If a student's name contains spaces, you should replace them by
                        <el-tag size="mini">#</el-tag>
                        before pasting, and the
                        system will convert
                        <el-tag size="mini">#</el-tag>
                        to spaces in importing <br/>
                        In other words, there should be only 3 spaces in a row, for example: <br/>
                        <code>1111423 Alex#Jack 1 1230909123</code><br/>
                        One more thing, the ID of a account should be unique in this system, or this account won't be
                        imported successfully
                    </div>
                    <el-form>
                        <el-input type="textarea" :autosize="{ minRows: 10}" v-model="accounts_text"
                                  placeholder="1111423 Alex#Jack 1 1230909123
1111769 Alex#Jack 1 1230909123">

                        </el-input>
                    </el-form>
                    <el-button class="import-btn" type="primary" @click="import_accounts">
                        Import
                    </el-button>
                </div>
            </el-col>
        </el-row>

        <el-dialog :visible.sync="show_import_result" title="Importing is Complete">
            <h4>Those accounts fail to imported, because their ids have already existed in the system or they don't
                match our format:</h4>
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
                        this.$message.success("All accounts have been imported successfully")
                    }
                }
            })
        }, 3000)
    }
}
</script>

<style scoped>
.hint {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    line-height: 2;
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
