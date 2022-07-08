<template>
    <div class="student-edit">
        <PageHeader title="编辑账号"></PageHeader>
        <el-row type="flex">
            <el-col :span="14" :offset="2">
                <div class="form-container">
                    <el-form ref="editForm" :model="student">
                        <el-form-item prop="id" label="ID">
                            <el-input type="number" v-model="student.id" disabled></el-input>
                        </el-form-item>

                        <el-form-item prop="name" label="姓名">
                            <el-input v-model="student.name"></el-input>
                        </el-form-item>
                        <el-form-item prop="gender" label="性别" >
                            <el-radio v-model="student.gender" disabled :label="1">男</el-radio>
                            <el-radio v-model="student.gender" disabled :label="2">女</el-radio>
                        </el-form-item>

                        <el-form-item prop="password" label="密码">
                            <el-input v-model="student.password"
                                      placeholder="如果不想更改密码，请留空"></el-input>
                        </el-form-item>

                        <el-form-item prop="contact" label="联系方式">
                            <el-input type="textarea" v-model="student.contact"></el-input>
                        </el-form-item>

                        <el-form-item prop="teamID" label="队伍ID">
                            <el-select v-model="student.team_id" filterable placeholder="请选择一个队伍">
                                <el-option :value="null" :key="-1" label="None"></el-option>
                                <el-option
                                    v-for="item in team_options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-button class="save-btn" type="primary" @click="save">
                            Save
                        </el-button>
                    </el-form>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "edit.vue",
    data() {
        return {
            student: {
                'id': '',
                'name': '',
                'gender': 0,
                'password': null,
                'contact': '',
                'team_id': ''
            },
            team_options: []
        }
    },
    async asyncData({params, $axios}) {
        let student = await $axios.$get('/student/info', {
            params: {
                student_id: params.id
            }
        }).then(data => {
            return data.data
        })

        let team_options = await $axios.$get('/team/list').then(data => {
            let options = []

            data.data.teams.forEach(function (element) {
                if (element.gender === student.student.gender) {
                    options.push({
                        value: element.id,
                        label: element.id
                    })
                }
            })

            return {
                team_options: options
            }
        })

        return _.assign(student, team_options)
    },
    methods: {
        save: _.throttle(async function () {
            return this.$axios.$post("/student/update", this.student).then(data => {
                if (data.code === 200) {
                    this.$message.success("The profile of the student has saved.")
                }
            })
        }, 2000)
    },
    created() {
        this.$refs['navigation_bar']
    }
}
</script>

<style scoped>
.form-container {
    width: 100%;
    background-color: white;
    margin: 30px auto;
    padding: 50px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
}

.save-btn {
    margin-top: 20px;
}

</style>
