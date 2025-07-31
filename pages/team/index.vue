<template>
    <div class="team-index">
        <PageHeader title="组队管理"></PageHeader>
        <el-row type="flex" align="center" justify="center" style="flex-wrap: wrap; flex-direction: row">
            <el-col :span="20">
                <div class="default-container">
                    <el-row class="search-bar" style="margin-bottom: 20px">
                        <el-col :span="8">
                            <el-input v-model="searchQuery" placeholder="输入队伍ID或学生姓名搜索" clearable
                                @clear="handleSearchClear" @keyup.enter.native="handleSearch">
                                <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                            </el-input>
                        </el-col>
                    </el-row>

                    <el-row type="flex" align="center" justify="center">
                        <el-col :span="24">
                            <el-table :data="paginatedTeams" @filter-change="handleFilterChange" style="width: 100%">
                                <el-table-column label="ID" prop="id">
                                </el-table-column>
                                <el-table-column prop="gender" label="性别"
                                    :filters="[{ text: '男', value: 1 }, { text: '女', value: 2 }]"
                                    :filter-method="gender_filter_handler" column-key="gender">
                                    <template slot-scope="scope">
                                        <el-tag v-if="scope.row.gender === 1" size="medium">男</el-tag>
                                        <el-tag v-if="scope.row.gender === 2" size="medium" type="danger">女
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="'学生 ' + index" prop="students"
                                    v-for="index in team_max_student_count" :key="index">
                                    <template slot-scope="scope">
                                        <el-dropdown v-if="scope.row.students[index - 1]" trigger="click">
                                            <span class="el-dropdown-link student-list">
                                                {{ scope.row.students[index - 1].name }}
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <nuxt-link
                                                    :to="'/student/' + scope.row.students[index - 1].id + '/edit'">
                                                    <el-dropdown-item icon="el-icon-edit">
                                                        编辑
                                                    </el-dropdown-item>
                                                </nuxt-link>
                                                <nuxt-link
                                                    :to="'/student/' + scope.row.students[index - 1].id + '/questionnaire'">
                                                    <el-dropdown-item icon="el-icon-document">
                                                        问卷
                                                    </el-dropdown-item>
                                                </nuxt-link>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" fixed="right" width="240">
                                    <template slot-scope="scope">
                                        <el-button v-if="scope.row.students.length < team_max_student_count"
                                            type="warning" @click="show_add_student_plane(scope.row)" size="mini">添加学生
                                        </el-button>
                                        <el-button v-else type="warning" size="mini" @click="show_add_student_plane"
                                            disabled>添加学生
                                        </el-button>
                                        <el-button type="danger" @click="delete_team(scope.row.id)" size="mini">删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>

                            <el-pagination style="margin-top: 20px" @size-change="handleSizeChange"
                                @current-change="handleCurrentChange" :current-page="currentPage"
                                :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                                layout="total, sizes, prev, pager, next, jumper" :total="filteredTeams.length">
                            </el-pagination>
                        </el-col>
                    </el-row>

                    <el-row type="flex" align="right" justify="end" style="margin-top: 20px">
                        <el-col :span="8">
                            <el-button @click="exportAsExcel" type="success">导出为Excel
                            </el-button>

                            <el-button @click="show_create_team_plane = true" type="primary">创建队伍
                            </el-button>
                        </el-col>
                    </el-row>

                </div>
            </el-col>

        </el-row>

        <el-dialog title="Basic information of the new team" :visible.sync="show_create_team_plane">
            <el-form :model="new_team_data">
                <el-form-item label="Gender" label-width="240px">
                    <el-select v-model.number="new_team_data.gender" placeholder="请选择性别">
                        <el-option label="男" :value="1"></el-option>
                        <el-option label="女" :value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Description" label-width="240px">
                    <el-input v-model="new_team_data.description" placeholder="Created by Admin" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="show_create_team_plane = false">取消</el-button>
                <el-button type="primary" @click="create_team">创建</el-button>
            </div>
        </el-dialog>

        <el-dialog :title="'请选择你想要添加到这个队伍的学生 (ID: #' + add_student.team_id + ' )'" :visible.sync="show_add_student"
            width="650px">
            你最多可以选择 {{ add_student.limit }} 名学生
            <el-form>
                <el-select v-model="add_student.selected_students" filterable placeholder="请选择至少一名学生"
                    :multiple-limit="add_student.limit" multiple style="width: 300px;margin-top: 20px">
                    <el-option v-for="student in add_student.available_students" :key="student.id" :label="student.name"
                        :value="student.id">
                        <span style="float: left">{{ student.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{ student.id }}</span>
                    </el-option>
                </el-select>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="show_add_student = false">取消</el-button>
                <el-button type="primary" @click="do_import">确定</el-button>
            </div>
        </el-dialog>


    </div>
</template>

<script>
import FileSaver from 'file-saver'
import { computed } from 'vue';
let XLSX = require("xlsx");
export default {
    name: "index",
    data() {
        return {
            teams: [],
            originalTeams: [],
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
            },
            currentPage: 1,
            pageSize: 10,
            searchQuery: '',
            activeFilters: {
                gender: null
            }
        }
    },
    computed: {
        filteredTeams() {
            let filtered = this.originalTeams;

            // 应用搜索条件
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(team => {
                    // 搜索队伍ID或学生姓名
                    return (
                        String(team.id).includes(query) ||
                        team.students.some(student =>
                            student.name && student.name.toLowerCase().includes(query)
                        )
                    );
                });
            }

            console.info(this.activeFilters)

            // 应用筛选条件
            if (this.activeFilters.gender !== null && this.activeFilters.gender !== undefined) {
                filtered = filtered.filter(team => team.gender === this.activeFilters.gender);
            }

            return filtered;
        },
        paginatedTeams() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.filteredTeams.slice(start, end);
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
                    this.$message.success("新队伍已创建 (ID: #" + data.data.team_id + " )")
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
                '队伍 ID', '性别', '备注'
            ]

            for (let i = 1; i <= this.team_max_student_count; i++) {
                table_headers.push("学生 " + i + " ID", "学生 " + i + " Name")
            }
            let table_data = []
            table_data.push(table_headers)
            for (let team of this.teams) {
                let row_data = [
                    team.id,
                    team.gender === 1 ? '男' : "女",
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
                    new Blob([table_write], { type: "application/octet-stream" }),
                    "队伍名单.xlsx"
                );
            } catch (e) {
                if (typeof console !== "undefined") console.log(e, table_write);
                this.$message.error("导出失败!")
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
                    let team = _.find(this.teams, { id: this.add_student.team_id })
                    for (let student_id of this.add_student.selected_students) {
                        let student = _.find(this.add_student.available_students, { id: student_id })
                        team.students.push({
                            id: student.id,
                            name: student.name
                        })
                    }
                    this.show_add_student = false
                    this.$message.success("成功")
                }
            }).catch(() => {
                return
            }, 5000)
        }),

        handleFilterChange(filters) {
            // 处理筛选变化
            this.activeFilters = {
                gender: filters.gender ? filters.gender[0] : null
            };
            this.currentPage = 1; // 重置到第一页
        },
        handleSearch() {
            this.currentPage = 1; // 搜索时回到第一页
        },

        handleSearchClear() {
            this.searchQuery = '';
            this.currentPage = 1;
        },

        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
        },

        handleCurrentChange(val) {
            this.currentPage = val;
        },

    },
    async asyncData({ $axios }) {
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
            originalTeams: [...teams],
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
