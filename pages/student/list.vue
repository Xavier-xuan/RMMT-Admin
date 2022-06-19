<template>
    <div class="student-list">
        <PageHeader title="账号列表"></PageHeader>

        <el-row type="flex" align="center" justify="center">
            <el-col :span="22">
                <div class="table-container">
                    <el-table :data="students" :default-sort="{prop: 'name', order:'ascending'}" stripe>
                        <el-table-column prop="id" label="#ID" sortable>
                        </el-table-column>

                        <el-table-column prop="name" label="Name" sortable>

                        </el-table-column>

                        <el-table-column prop="gender" label="Gender"
                                         :filters="[{text: 'Male', value: 1}, {text: 'Female', value: 2}]"
                                         :filter-method="gender_filter_handler">
                            <template slot-scope="scope">
                                <el-tag v-if="scope.row.gender === 1" size="medium">Male</el-tag>
                                <el-tag v-if="scope.row.gender === 2" size="medium" type="danger">Female</el-tag>
                            </template>

                        </el-table-column>

                        <el-table-column prop="has_answered_questionnaire" label="Has Answered Questionnaire"
                                         :filters="[{text: 'Yes', value: true}, {text: 'No', value: false}]"
                                         :filter-method="questionnaire_filter_handler">
                            <template slot-scope="scope">
                                <el-tag v-if="scope.row.has_answered_questionnaire" type="success" size="medium">Yes
                                </el-tag>
                                <el-tag v-else size="medium" type="danger">No</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column prop="team_id" label="Team"
                                         :filters="[{text: 'Has Joined Team', value: '1'}, {text: 'Hasn\'t Joined Team', value: undefined}]"
                                         :filter-method="team_filter_handler">
                            <template slot-scope="scope">
                                <el-tag v-if="scope.row.team != null" size="medium" type="success">
                                    Team ID: {{ scope.row.team.id }}
                                </el-tag>
                                <el-tag v-if="scope.row.team == null" size="medium" type="warning">None
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column prop="last_logged_at" label="Last Logged At" sortable>
                        </el-table-column>

                        <el-table-column prop="created_at" label="Created at" sortable>
                        </el-table-column>

                        <el-table-column label="" fixed="right" width="240">
                            <template slot-scope="scope">
                                <el-dropdown>
                                    <span class="el-dropdown-link">
                                             Actions <i class="el-icon-arrow-down el-icon--right"></i>
                                     </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <nuxt-link :to="'/student/' + scope.row.id + '/edit'">
                                            <el-dropdown-item icon="el-icon-edit">
                                                Edit
                                            </el-dropdown-item>
                                        </nuxt-link>
                                        <nuxt-link :to="'/student/' + scope.row.id + '/questionnaire'">
                                            <el-dropdown-item icon="el-icon-document">
                                                Questionnaire
                                            </el-dropdown-item>
                                        </nuxt-link>
                                        <el-dropdown-item icon="el-icon-delete" @click="delete_student(scope.row)">
                                            Delete
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!--                    <div class="pagination">-->
                    <!--                        <el-pagination-->
                    <!--                            layout="prev, pager, next"-->
                    <!--                            :total="students.length"-->
                    <!--                            :page-size="pageSize"-->
                    <!--                            @current-change="page_change">-->
                    <!--                        </el-pagination>-->
                    <!--                    </div>-->
                </div>
            </el-col>
        </el-row>


    </div>

</template>

<script>
export default {
    name: "list",
    data() {
        return {
            pageSize: 30,
            currentPage: 1,
        }
    },
    methods: {
        gender_filter_handler(value, row, column) {
            return row.gender === value
        },
        questionnaire_filter_handler(value, row, column) {
            return row.has_answered_questionnaire === value
        },
        page_change(currentPage) {
            this.currentPage = currentPage
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        },
        team_filter_handler(value, row) {
            console.info(value)
            if (value === undefined) {
                return row.team == null
            } else {
                return row.team != null
            }
        },
        delete_student: _.throttle(async function (item) {
            this.$confirm('你确认要删除 [' + item.id + ']' + item.name + ' 的账号吗？', '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios.$delete('/student/delete', {
                    data: {
                        student_id: item.id
                    }
                }).then(data => {
                    if (data.code === 200) {
                        this.students = _.remove(this.students, function (value) {
                            return value.id !== item.id
                        })
                        this.$message.success("已删除 " + item.name + " 的账号")
                    }
                })
            }).catch(() => {
                return true
            })
        }, 2000)
    },
    asyncData({params, $axios}) {
        return $axios.$get('/student/list').then(data => {
            console.info(data.data)
            return data.data
        })

    },
    computed: {
        // tableData() {
        //     return this.students.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
        // }
    }
}
</script>

<style scoped>
.table-container {
    background-color: white;
    margin: 30px auto;
    padding: 30px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
}

.pagination {
    margin: 20px auto;
    text-align: center;
}
</style>
