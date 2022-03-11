<template>
    <div class="team-index">
        <PageHeader title="组队管理"></PageHeader>
        <el-row type="flex" align="center" justify="center" style="flex-wrap: wrap; flex-direction: row">
            <el-col :span="20">
                <div class="default-container">
                    <el-row type="flex" align="center" justify="center">
                        <el-col :span="24">
                            <el-table :data="teams">
                                <el-table-column label="ID" prop="id">
                                </el-table-column>
                                <el-table-column prop="gender" label="Gender"
                                                 :filters="[{text: 'Male', value: 1}, {text: 'Female', value: 2}]"
                                                 :filter-method="gender_filter_handler">
                                    <template slot-scope="scope">
                                        <el-tag v-if="scope.row.gender === 1" size="medium">Male</el-tag>
                                        <el-tag v-if="scope.row.gender === 2" size="medium" type="danger">Female
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="'Student ' + index" prop="students"
                                                 v-for="index in team_max_student_count" :key="index">
                                    <template slot-scope="scope">
                                        <nuxt-link class="student-list" v-if="scope.row.students[index -1]"
                                                   :to="'/student/' + scope.row.students[index -1].id + '/questionnaire'">
                                            {{ scope.row.students[index - 1].name }}
                                        </nuxt-link>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Action" fixed="right" width="240">
                                    <template slot-scope="scope">
                                        <el-button v-if="scope.row.students.length < team_max_student_count"
                                                   type="warning" @click="show_add_student_plane(scope.row)"
                                                   size="mini">Add
                                            Student
                                        </el-button>
                                        <el-button v-else type="warning" size="mini" @click="show_add_student_plane"
                                                   disabled>Add Student
                                        </el-button>
                                        <el-button type="danger" @click="delete_team(scope.row.id)" size="mini">Delete
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>

                    <el-row type="flex" align="right" justify="end" style="margin-top: 20px">
                        <el-col :span="8">
                            <el-button @click="exportAsExcel" type="success">Export as Excel
                            </el-button>

                            <el-button @click="show_create_team_plane = true" type="primary">Create a New Team
                            </el-button>
                        </el-col>
                    </el-row>

                </div>
            </el-col>

        </el-row>

        <el-dialog title="Basic information of the new team" :visible.sync="show_create_team_plane">
            <el-form :model="new_team_data">
                <el-form-item label="Gender" label-width="240px">
                    <el-select v-model.number="new_team_data.gender" placeholder="Please select gender for new team.">
                        <el-option label="Male" :value="1"></el-option>
                        <el-option label="Female" :value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Description" label-width="240px">
                    <el-input v-model="new_team_data.description" placeholder="Created by Admin"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="show_create_team_plane = false">Cancel</el-button>
                <el-button type="primary" @click="create_team">Create</el-button>
            </div>
        </el-dialog>

        <el-dialog :title="'Select students that you want to join the team (ID: #' + add_student.team_id + ' )' "
                   :visible.sync="show_add_student" width="650px">
            You can select {{ add_student.limit }} student(s) at most
            <el-form>
                <el-select v-model="add_student.selected_students" filterable
                           placeholder="Please select one or more students."
                           :multiple-limit="add_student.limit"
                           multiple
                           style="width: 300px;margin-top: 20px">
                    <el-option
                        v-for="student in add_student.available_students"
                        :key="student.id"
                        :label="student.name"
                        :value="student.id"
                    >
                        <span style="float: left">{{ student.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ student.id }}</span>
                    </el-option>
                </el-select>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="show_add_student = false">Cancel</el-button>
                <el-button type="primary" @click="do_import">Confirm</el-button>
            </div>
        </el-dialog>


    </div>
</template>

<script>
import XLSX from 'xlsx'
import FileSaver from 'file-saver'

export default {
    name: "index",
    data() {
        return {
            teams: [],
            team_max_student_count: 4,
            show_create_team_plane: false,
            new_team_data: {
                gender: 1,
                description: "Created by admin."
            },
            show_add_student: false,
            add_student: {
                team_id: null,
                available_students: [],
                selected_students: [],
                limit: 1
            }
        }
    },
    methods: {
        gender_filter_handler(value, row, column) {
            return row.gender === value
        },
        delete_team(team_id) {
            this.$confirm("你确定要删除编号为 #" + team_id + " 的队伍吗？", "确认操作", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$axios.$delete("/team/delete", {
                    data: {
                        team_id
                    }
                }).then(data => {
                    if (data.code === 200) {
                        this.teams = _.remove(this.teams, function (value) {
                            return value.id !== team_id
                        })
                        this.$message.success("已删除编号为 #" + team_id + " 的队伍")
                    }
                })
            })
        },
        create_team() {
            this.$axios.$post('/team/create', this.new_team_data).then(data => {
                if (data.code === 200) {
                    this.teams.push({
                        description: this.new_team_data.description,
                        gender: this.new_team_data.gender,
                        students: [],
                        id: data.data.team_id
                    })
                    this.$message.success("A new team has been created. (ID: #" + data.data.team_id + " )")
                    this.new_team_data = {
                        gender: 1,
                        description: "Created by admin."
                    }
                    this.show_create_team_plane = false
                }
            })
        },
        exportAsExcel() {

            // 构造数据 Start
            let table_headers = [
                'Team ID', 'Gender', 'Description'
            ]

            for (let i = 1; i <= this.team_max_student_count; i++) {
                table_headers.push("Student " + i + " ID", "Student " + i + " Name")
            }
            let table_data = []
            table_data.push(table_headers)
            for (let team of this.teams) {
                let row_data = [
                    team.id,
                    team.gender === 1 ? 'Male' : "Female",
                    team.description
                ]

                for (let student of team.students) {
                    row_data.push(student.id, student.name)
                }

                if (team.students.length < this.team_max_student_count) {
                    for (let i = 1; i <= this.team_max_student_count - team.students.length; i++) {
                        row_data.push(null, null)
                    }
                }
                table_data.push(row_data)
            }

            // 构造数据 End

            let worksheet = XLSX.utils.aoa_to_sheet(table_data)
            let workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet)
            let table_write = XLSX.write(workbook, {
                    bookType: "xlsx",
                    bookSST: true,
                    type: "array"
                }
            )

            try {
                FileSaver.saveAs(
                    new Blob([table_write], {type: "application/octet-stream"}),
                    "sheetjs.xlsx"
                );
            } catch (e) {
                if (typeof console !== "undefined") console.log(e, table_write);
                this.$message.error("Export Failed!")
            }
            return table_write;
        },
        async show_add_student_plane(team_row) {
            let team_id = team_row.id
            let gender = team_row.gender
            let students = await this.$axios.$get("/student/list").then(data => {
                if (data.code === 200) {
                    return data.data.students
                } else {
                    return null
                }
            }).catch(e => {
                return null
            })
            if (students == null) {
                return false
            }

            this.add_student.team_id = team_id
            this.add_student.limit = this.team_max_student_count - team_row.students.length
            this.add_student.available_students = _.filter(students, function (item) {
                return item.gender === gender && item.team == null
            })
            this.add_student.selected_students = []

            this.show_add_student = true

        },
        do_import: _.throttle(async function () {
            return this.$axios.$post('/team/add_student', {
                team_id: this.add_student.team_id,
                students: this.add_student.selected_students
            }).then(data => {
                console.info(data.code)
                if (data.code === 200) {
                    let team = _.find(this.teams, {id: this.add_student.team_id})
                    for (let student_id of this.add_student.selected_students) {
                        let student = _.find(this.add_student.available_students, {id: student_id})
                        team.students.push({
                            id: student.id,
                            name: student.name
                        })
                    }
                    this.show_add_student = false
                    this.$message.success("Success")
                }
            }).catch(() => {
                return
            }, 5000)
        })

    },
    async asyncData({$axios}) {
        let teams = await $axios.$get('/team/list').then(data => {
            if (data.code === 200) {
                return data.data.teams
            }
        })

        let team_max_student_count = await $axios.$get('/system_setting/list').then(data => {
            if (data.code === 200) {
                return data.data.team_max_student_count || 4
            }
        })

        return {
            teams,
            team_max_student_count
        }
    }
}
</script>

<style scoped>
.student-list {
    text-decoration: none;
    color: rgba(0, 0, 0, .87);
    border-bottom-style: dotted;
    border-bottom-color: rgba(0, 0, 0, .60);
    border-bottom-width: medium;
}
</style>
