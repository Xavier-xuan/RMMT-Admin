<template>
    <div class="student-questionnaire">
        <PageHeader :title="student.name + '的问卷回答'"></PageHeader>
        <el-row type="flex">

            <el-col :span="14" :offset="2">
                <div class="default-container ">

                    <v-form-render :form-json="formJson" :form-data="formData" ref="vFormRef">
                    </v-form-render>

                    <el-dialog title="权重设置" :visible.sync="showWeightPlane">
                        <div class="tips">
                            目前系统仅对能够量化评估的项目进行算法匹配，因此只能设置问卷中部分问题的权重，其他没有权重（或权重为0）的问题代表仅作个人资料展示，不作算法匹配的参考项目 <br/>
                            如果某个问题的答案可能出现波动较大的情况，例如每个月的生活费这类的问题，建议根据情况减少其权重。反之亦然 <br/>
                            要禁止某问题作为算法匹配的参考项（即禁止学生设置该问题的权重），请将该项权重调整为 -1 <br/>
                            <span style="color: #E6A23C;">请务必将答案为非数值类型问题的权重设置为 -1 ，否则可能引起程序奔溃</span><br/>
                        </div>
                        <el-table :data="questionWithWeight" stripe>
                            <el-table-column
                                prop="id"
                                label="#ID">
                            </el-table-column>
                            <el-table-column
                                prop="title"
                                label="问题">
                            </el-table-column>
                            <el-table-column
                                prop="weight"
                                label="权重">

                                <template slot-scope="scope">

                                    <el-input-number
                                        v-model.number="scope.row.weight" v-if="scope.row.weight >= 0" :min="-1">
                                    </el-input-number>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-button class="save-btn" type="primary" @click="save">保存</el-button>
                    </el-dialog>
                    <el-button type="primary" @click="preSave">保存</el-button>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "questionnaire",
    data() {
        return {
            student: {},
            formJson: {},
            formData: {},
            questionWithWeight: [],
            showWeightPlane: false
        }
    },
    methods: {
        preSave() {
            this.$refs.vFormRef.getFormData().then( formData => {
                this.showWeightPlane = true
            }).catch(error => {
                this.$message.error(error)
            })
        },
        save: _.throttle(async function () {
            this.$refs.vFormRef.getFormData().then(formData => {
                // 构造数据
                let data_to_store = {}
                _.forIn(formData, (value, key) => {
                    data_to_store[key] = {
                        weight: _.filter(this.questionWithWeight, {id: key})[0].weight,
                        answer: JSON.stringify(value),
                        id: key
                    }
                })
                this.$axios.$post("/student/questionnaire", {
                    "student_id": this.student.id,
                    "questionnaire_answers": data_to_store
                }).then(data => {
                    if (data.code === 200) {
                        this.showWeightPlane = false
                        this.$message.success("学生问卷数据已保存")
                    }
                }).catch(error => {
                    this.showWeightPlane = false
                    this.$message.error(error)
                })
            })
        }, 2000)
    },
    async asyncData({params, $axios}) {
        function convert_data(str) {
            try {
                let obj = JSON.parse(str);
                return obj
            } catch (e) {
                return str
            }
        }

        let student = await $axios.$get('/student/info', {
            params: {
                student_id: params.id
            }
        }).then(data => {
            return data.data.student
        })

        let formJson = await $axios.$get('/system_setting/get', {
            params: {
                key: "questionnaire_json"
            }
        }).then(data => {
            return convert_data(data.data.questionnaire_json)
        })

        let questionnaireItems = await $axios.$get('/questionnaire/list').then(data => {
            return data.data
        })

        let questionWithWeight = []

        questionnaireItems.forEach(element => {
            let item_id = element.id
            // 先找找用户有没有回答过这个问题 有就用他设置的权重 没有就用默认权重
            let answer = _.filter(student.questionnaire_answers, {item_id: item_id})
            let weight
            if (answer.length > 0)
                weight = answer[0].weight
            else
                weight = element.weight

            questionWithWeight.push({
                id: item_id,
                title: element.title,
                weight: weight,
            })
        })

        let formData = {}

        student.questionnaire_answers.forEach(element => {
            formData[element.item_id] = convert_data(element.answer)
        })
        return {
            student,
            formJson,
            formData,
            questionWithWeight
        }
    },
    mounted() {

    }
}
</script>

<style scoped>

.tips {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    line-height: 2;
    font-size: 14px;
    color: rgba(0, 0, 0, .87);
    margin-bottom: 10px;
}

.save-btn {
    margin-top: 20px;
}
</style>
