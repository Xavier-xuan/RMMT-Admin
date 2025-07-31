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
                        注意，ID 在系统中应该具有唯一性且必须为正整数，长度不超过13位，否则也会导入失败
                        <br/>
                        系统将分批导入数据，每次10条
                    </div>
                    <el-form>
                        <el-input type="textarea" :autosize="{ minRows: 10}" v-model="accounts_text"
                                  placeholder="1111423 卢#光之使徒#笛 1 1230909123
1111769 Alex#Jack 1 1230909123">
                        </el-input>
                    </el-form>
                    <el-button class="import-btn" type="primary" @click="import_accounts" :loading="isImporting">
                        导入
                    </el-button>
                    <el-progress v-if="isImporting" :percentage="importProgress" :format="formatProgress"></el-progress>
                </div>
            </el-col>
        </el-row>

        <el-dialog :visible.sync="show_import_result" title="导入结果">
            <h4>成功导入: {{ successCount }} 条</h4>
            <h4>失败导入: {{ fail_to_import.length }} 条</h4>
            <div v-if="fail_to_import.length > 0">
                <h4>失败原因可能是ID已存在、格式不符合要求或ID不是正数或超过13位:</h4>
                <div style="margin-top: 5px" v-for="(piece, index) in fail_to_import" :key="index">
                    <el-tag size="medium">{{ piece }}</el-tag>
                    <br/>
                </div>
            </div>
            <el-button style="margin-top: 30px" type="primary" @click="show_import_result = false">确定</el-button>
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
            fail_to_import: [],
            isImporting: false,
            importProgress: 0,
            successCount: 0,
            totalCount: 0
        }
    },
    methods: {
        formatProgress(percentage) {
            return `导入进度: ${percentage}% (${this.successCount + this.fail_to_import.length}/${this.totalCount})`;
        },
        
        // 验证ID是否为正整数且不超过13位
        isValidId(id) {
            const idStr = id.toString();
            return /^\d+$/.test(idStr) && idStr.length <= 13 && parseInt(id) > 0;
        },
        
        // 分批处理函数
        async processInBatches(accounts, batchSize = 10) {
            this.fail_to_import = [];
            this.successCount = 0;
            this.totalCount = accounts.length;
            this.isImporting = true;
            
            for (let i = 0; i < accounts.length; i += batchSize) {
                const batch = accounts.slice(i, i + batchSize);
                
                // 验证ID格式
                const invalidIds = batch.filter(account => {
                    const parts = account.split(/\s+/);
                    return parts.length < 4 || !this.isValidId(parts[0]);
                });
                
                // 将无效ID添加到失败列表
                this.fail_to_import.push(...invalidIds);
                
                // 有效的账户
                const validAccounts = batch.filter(account => {
                    const parts = account.split(/\s+/);
                    return parts.length >= 4 && this.isValidId(parts[0]);
                });
                
                if (validAccounts.length > 0) {
                    try {
                        const response = await this.$axios.$post("/student/import", {
                            students: validAccounts
                        });
                        
                        if (response.code === 200) {
                            this.successCount += (validAccounts.length - response.data.fail_to_import.length);
                            this.fail_to_import.push(...response.data.fail_to_import);
                        }
                    } catch (error) {
                        console.error("导入出错:", error);
                        this.fail_to_import.push(...validAccounts);
                    }
                }
                
                // 更新进度
                this.importProgress = Math.round(((i + batchSize) / accounts.length) * 100);
                if (this.importProgress > 100) this.importProgress = 100;
                
                // 稍微延迟一下，避免UI卡顿
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            this.isImporting = false;
            this.show_import_result = true;
        },
        
        import_accounts: _.throttle(async function () {
            if (!this.accounts_text) return;
            this.accounts_text = this.accounts_text.trim();
            let accounts = this.accounts_text.split("\n").filter(line => line.trim() !== "");
            
            await this.processInBatches(accounts);
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

.el-progress {
    margin-top: 20px;
}
</style>