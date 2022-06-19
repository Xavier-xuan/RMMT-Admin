<template>
    <div class="system-settings">
        <PageHeader title="基本设置"></PageHeader>
        <el-row type="flex">
            <el-col :span="14" :offset="2">
                <div class="default-container">
                    <el-form label-width="140px" label-position="left">
                        <el-form-item label="个人信息补充时间段">
                            <el-col :span="11">
                                <el-date-picker
                                    v-model="step_1_period"
                                    type="datetimerange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="yyyy-MM-dd HH:mm:ss">
                                </el-date-picker>
                            </el-col>
                        </el-form-item>

                        <el-form-item label="算法匹配时间段">
                            <el-col :span="11">
                                <el-date-picker
                                    v-model="step_2_period"
                                    type="datetimerange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="yyyy-MM-dd HH:mm:ss">
                                </el-date-picker>
                            </el-col>
                        </el-form-item>

                        <el-form-item label="自由组队时间段">
                            <el-date-picker
                                v-model="step_3_period"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                value-format="yyyy-MM-dd HH:mm:ss">
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item label="队伍最大人数" prop="team_max_student_count">
                            <el-input-number v-model="team_max_student_count"></el-input-number>
                        </el-form-item>

                        <el-button type="primary" @click="save">保存</el-button>

                    </el-form>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "setting",
    data() {
        return {
            team_max_student_count: null,
            step_1_period: [],
            step_2_period: [],
            step_3_period: [],
        }

    },
    methods: {
        save: _.throttle(async function () {
            let data_to_store = {
                team_max_student_count: this.team_max_student_count,
                step_1_start_at: this.step_1_period[0],
                step_1_end_at: this.step_1_period[1],
                step_2_start_at: this.step_2_period[0],
                step_2_end_at: this.step_2_period[1],
                step_3_start_at: this.step_3_period[0],
                step_3_end_at: this.step_3_period[1],
            }
            this.$axios.$post("/system_setting/update", data_to_store).then(data => {
                if (data.code === 200) {
                    this.$message.success("设置已保存")
                }
            }).catch(e => {
                return false
            })
        }, 2000)
    },
    async asyncData({$axios}) {
        return $axios.$get("/system_setting/list").then(data => {
            let kv_system_settings = {}
            data.data.forEach(function (element) {
                kv_system_settings[element.key] = element.value
            })

            return {
                step_1_period: [
                    kv_system_settings.step_1_start_at,
                    kv_system_settings.step_1_end_at,
                ],
                step_2_period: [
                    kv_system_settings.step_2_start_at,
                    kv_system_settings.step_2_end_at,
                ],
                step_3_period: [
                    kv_system_settings.step_3_start_at,
                    kv_system_settings.step_3_end_at,
                ],
                team_max_student_count: kv_system_settings.team_max_student_count
            }
        })
    }
}
</script>

<style scoped>

</style>
