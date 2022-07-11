<template>
    <div class="questionnaire">
        <div class="form-designer">
            <v-form-designer ref="form_designer" :banned-widgets="bannedWidgets" :designer-config="designerConfig">
                <template #customToolButtons>
                    <el-button type="primary" @click="preSave">保存</el-button>
                </template>
            </v-form-designer>
        </div>

        <el-dialog title="默认权重设置" :visible.sync="show_weight_plane">
            <div class="tips">
                目前系统仅对能够量化评估的项目进行算法匹配，因此只能设置问卷中部分问题的权重，其他没有权重（或权重为0）的问题代表仅作个人资料展示，不作算法匹配的参考项目 <br/>
                如果某个问题的答案可能出现波动较大的情况，例如每个月的生活费这类的问题，建议根据情况减少其权重。反之亦然 <br/>
                <span style="color: #E6A23C;">目前支持对必填且答案为数值类型的问题进行算法匹配，因此非必填选项将不能设置权重</span><br/>
                要禁止某问题作为算法匹配的参考项（即禁止学生设置该问题的权重），请将该项权重调整为 -1 <br/>
                <span style="color: #E6A23C;">请务必将答案为非数值类型问题的权重设置为 -1 ，否则可能引起程序奔溃</span><br/>
            </div>
            <el-table :data="formJson.widgetList" stripe>
                <el-table-column
                    prop="id"
                    label="#ID">
                </el-table-column>
                <el-table-column
                    prop="options.label"
                    label="问题">
                </el-table-column>
                <el-table-column
                    prop="weight"
                    label="权重">

                    <template slot-scope="scope">

                        <el-input-number
                            v-model.number="scope.row.weight" v-if="scope.row.weight >= -1" :min="-1">
                        </el-input-number>
                    </template>
                </el-table-column>
            </el-table>
            <el-button class="save-btn" type="primary" @click="save">保存</el-button>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "questionnaire",
    data() {
        return {
            designerConfig: {
//是否显示语言切换菜单
                languageMenu: false,

//是否显示GitHub、文档等外部链接
                externalLink: false,

//是否显示表单模板
                formTemplates: false,

//是否禁止修改唯一名称
                widgetNameReadonly: false,

//是否显示组件事件属性折叠面板
                eventCollapse: true,

//是否显示清空设计器按钮
                clearDesignerButton: false,

//是否显示预览表单按钮
                previewFormButton: true,

//是否显示导入JSON按钮
                importJsonButton: true,

//是否显示导出JSON器按钮
                exportJsonButton: true,

//是否显示导出代码按钮
                exportCodeButton: false,

//是否显示生成SFC按钮
                generateSFCButton: false,

//工具按钮栏最大宽度（单位px）
//如新增按钮后不可见，请调大
//如右侧空白区域过大，请调小
                toolbarMaxWidth: 420,

//工具栏按钮最小宽度（单位px）
//值必须小于toolbarMaxWidth
                toolbarMinWidth: 300,

//表单设计器预设CSS代码
                presetCssCode: '',

                productName: '',
                productTitle: '',

            },
            bannedWidgets: [
                'picture-upload',
                'file-upload',
                'cascader',
                'html',
                'table',
                'tab',
                'color',
                'button'

            ],
            show_weight_plane: false,
            formJson: {
                widgetList: []
            },
            oldQuestionnaireItems: [], // 数据库中的问卷问题 主要用来读取权重

        }
    },
    methods: {
        preSave() {

            this.formJson = _.cloneDeep(this.$refs.form_designer.getFormJson())

            this.formJson.widgetList.forEach(element => {
                switch (element.type) {
                    case "radio":
                        // 要看选项是不是都是 Integer 才能判断类型
                        let is_int = true
                        element.options.optionItems.forEach(item => {
                            if (isNaN(item.value))
                                is_int = false
                            else
                                item.value = Number(item.value) // 能转数字的都转数字 不然修改表单时会出现数据类型不匹配的问题
                        })
                        if (is_int)
                            this.$set(element, 'weight', 5) // 必须要通过这种方式动态增加属性，不然Vue无法监听事件，无法使用v-model双向绑定
                        else
                            this.$set(element, 'weight', -2) // 系统禁止设置权重的项目 设置为-2
                        break
                    case "checkbox":
                        this.$set(element, 'weight', 1)
                    case "time-range":
                    case "date-range":
                    case "slider":
                    case "rate":
                    case "date":
                    case "time":
                    case "number":
                        this.$set(element, 'weight', 1)
                        break
                    default:
                        this.$set(element, 'weight', -2) // 系统禁止设置权重的项目 设置为-2
                }

                // 仅支持必填选项
                if (!element.options.required) {
                    this.$set(element, 'weight', -2) // 系统禁止设置权重的项目 设置为-2
                    return
                }

                // 如果不是禁止设置权重的项目 再读取用户原来设置的权重
                if (element.weight !== -2) {
                    let old_item = _.filter(this.oldQuestionnaireItems, {id: element.id})
                    if (old_item.length > 0 && old_item[0].weight !== -2)
                        element.weight = old_item[0].weight
                }

            })

            this.show_weight_plane = true
        },
        save: _.throttle(async function () {
            this.$prompt('保存问卷将删除所有学生的问卷回答和匹配分数，继续操作请输入 [confirm]', '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(async ({value, action}) => {
                if (value === "confirm") {
                    let items = []
                    let current_index = 1
                    let data_type = "text"
                    this.formJson.widgetList.forEach(element => {
                        if (!element.formItemFlag) {
                            return
                        }

                            // if (element.validation === "number") {
                            //     data_type = "number"
                            // }
                        else {
                            switch (element.type) {
                                case "radio":
                                    if (element.weight > -2)
                                        data_type = "number"
                                    else
                                        data_type = "text"
                                    break
                                case "checkbox":
                                    data_type = "text_array" // 只有这个array是多元数组
                                    break
                                case "time":
                                    data_type = "time"
                                    break
                                case "time-range":
                                    data_type = "time_array"
                                    break
                                case "date":
                                    data_type = "date"
                                    break
                                case "date-range":
                                    data_type = "date_array"
                                    break
                                case "slider":
                                    data_type = "number_array"
                                    break
                                case "rate":
                                case "number":
                                    data_type = "number"
                                    break
                                default:
                                    data_type = "text"
                            }
                        }

                        items.push({
                            id: element.id,
                            title: element.options.label,
                            weight: element.weight,
                            data_type: data_type,
                            params: JSON.stringify(element),
                            index: current_index,
                            type: element.type
                        })
                        current_index++
                    })

                    let questionnaire_update_result = await this.$axios.$post("/questionnaire/set", items).then(data => {
                        if (data.code === 200) {
                            return true
                        }
                    })

                    if (questionnaire_update_result) {
                        this.$axios.$post("/system_setting/update", {
                            "questionnaire_json": JSON.stringify(this.formJson)
                        }).then(data => {
                            if (data.code === 200) {
                                this.$notify.success("问卷保存成功，学生问卷回答及匹配分数数据已清除")
                                this.show_weight_plane = false
                            }
                        })
                    }

                } else {
                    this.$message.warning("取消操作")
                }
            }).catch(() => {
                return true
            })
        }, 5000)
    },
    async asyncData({$axios}) {
        let formJson = await $axios.$get('/system_setting/get', {
            params: {
                key: "questionnaire_json"
            }
        }).then(data => {
            if (data.code === 200) {
                return data.data.questionnaire_json ? JSON.parse(data.data.questionnaire_json) : null
            }
        })

        let oldQuestionnaireItems = await $axios.$get('/questionnaire/list').then(data => {
            return data.data
        })

        if (formJson != null) {
            return {
                formJson,
                oldQuestionnaireItems
            }
        } else {
            return true
        }
    },
    mounted() {
        if (this.formJson != null) {
            this.$refs.form_designer.setFormJson(this.formJson)
        }
    }
}
</script>

<style scoped>
.form-designer {
    background-color: white;
    margin: 30px auto;
    padding: 50px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
}

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
