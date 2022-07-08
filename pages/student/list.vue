<template>
    <div class="student-list">
        <PageHeader title="账号列表"></PageHeader>

        <el-row type="flex" align="center" justify="center">
            <el-col :span="22">
                <div class="table-container">
                    <el-table :data="students" :default-sort="{prop: 'name', order:'ascending'}" stripe>
                        <el-table-column prop="id" label="#ID" sortable>
                        </el-table-column>

                        <el-table-column prop="name" label="姓名" sortable>

                        </el-table-column>

                        <el-table-column prop="gender" label="性别"
                                         :filters="[{text: '男', value: 1}, {text: '女', value: 2}]"
                                         :filter-method="gender_filter_handler">
                            <template slot-scope="scope">
                                <el-tag v-if="scope.row.gender === 1" size="medium">男</el-tag>
                                <el-tag v-if="scope.row.gender === 2" size="medium" type="danger">女</el-tag>
                            </template>

                        </el-table-column>

                        <el-table-column prop="has_answered_questionnaire" label="已回答问卷"
                                         :filters="[{text: '是', value: true}, {text: '否', value: false}]"
                                         :filter-method="questionnaire_filter_handler">
                            <template slot-scope="scope">
                                <el-tag v-if="scope.row.has_answered_questionnaire" type="success" size="medium">是
                                </el-tag>
                                <el-tag v-else size="medium" type="danger">否</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column prop="team_id" label="队伍"
                                         :filters="[{text: '已组队', value: '1'}, {text: '未组队', value: undefined}]"
                                         :filter-method="team_filter_handler">
                            <template slot-scope="scope">
                                <el-tag v-if="scope.row.team != null" size="medium" type="success">
                                    队伍ID： {{ scope.row.team.id }}
                                </el-tag>
                                <el-tag v-if="scope.row.team == null" size="medium" type="warning">无
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column prop="last_logged_at" label="最后一次登录时间" sortable>
                        </el-table-column>

                        <el-table-column prop="created_at" label="账号创建时间" sortable>
                        </el-table-column>

                        <el-table-column label="" fixed="right">
                            <template slot-scope="scope">
                                <el-dropdown>
                                    <span class="el-dropdown-link">
                                             操作 <i class="el-icon-arrow-down el-icon--right"></i>
                                     </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <nuxt-link :to="'/student/' + scope.row.id + '/edit'">
                                            <el-dropdown-item icon="el-icon-edit">
                                                编辑
                                            </el-dropdown-item>
                                        </nuxt-link>
                                        <nuxt-link :to="'/student/' + scope.row.id + '/questionnaire'">
                                            <el-dropdown-item icon="el-icon-document">
                                                问卷
                                            </el-dropdown-item>
                                        </nuxt-link>
                                        <el-dropdown-item icon="el-icon-delete" @click="delete_student(scope.row)">
                                            删除
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
