<template>
    <div class="student-list">
        <PageHeader title="账号列表"></PageHeader>

        <el-row type="flex" align="center" justify="center">
            <el-col :span="22">
                <div class="table-container">
                    <!-- 添加搜索框 -->
                    <el-row class="search-bar">
                        <el-col :span="8">
                            <el-input
                                v-model="searchQuery"
                                placeholder="输入姓名或ID搜索"
                                clearable
                                @clear="handleSearchClear"
                                @keyup.enter.native="handleSearch">
                                <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                            </el-input>
                        </el-col>
                    </el-row>
                    
                    <el-table 
                        ref="elTable"
                        :height="tableHeight" 
                        use-virtual 
                        :data="paginatedStudents" 
                        :border="false" 
                        :default-sort="{prop: 'name', order:'ascending'}" 
                        @filter-change="handleFilterChange"
                        stripe>
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
                                <el-tag v-if="scope.row.has_answered_questionnaire" type="success" size="medium">是</el-tag>
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
                                <el-tag v-if="scope.row.team == null" size="medium" type="warning">无</el-tag>
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
                                        <el-dropdown-item icon="el-icon-delete" @click.native="delete_student(scope.row)">
                                            删除
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 添加分页 -->
                    <div class="pagination">
                        <el-pagination
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                            :current-page="currentPage"
                            :page-sizes="[10, 20, 30, 50]"
                            :page-size="pageSize"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="filteredStudents.length">
                        </el-pagination>
                    </div>
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
            pageSize: 20,
            currentPage: 1,
            searchQuery: '',
            originalStudents: [], // 保存原始数据
            students: [], // 用于显示的数据
            filters: { // 新增：存储当前的筛选条件
                gender: null,
                has_answered_questionnaire: null,
                team_id: null
            }
        }
    },
    methods: {
        gender_filter_handler(value, row, column) {
            return row.gender === value
        },
        questionnaire_filter_handler(value, row, column) {
            return row.has_answered_questionnaire === value
        },
        team_filter_handler(value, row) {
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
        }, 2000),
        // 处理搜索
        handleSearch() {
            if (!this.searchQuery) {
                this.students = [...this.originalStudents];
                return;
            }
            
            const query = this.searchQuery.toLowerCase();
            console.info(this.originalStudents)
            this.students = this.originalStudents.filter(student => {
                return (
                    String(student.id).includes(query) ||
                    (student.name && student.name.toLowerCase().includes(query))
                );
            });
            this.currentPage = 1; // 重置到第一页
        },
        // 清除搜索
        handleSearchClear() {
            this.students = [...this.originalStudents];
            this.currentPage = 1;
        },
        // 分页大小变化
        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
        },
        // 当前页变化
        handleCurrentChange(val) {
            this.currentPage = val;
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        },
        handleFilterChange(filters) {
            console.log("原始 filters 数据:", filters); // 调试用

            // 初始化筛选条件
            const newFilters = {
                gender: null,
                has_answered_questionnaire: null,
                team_id: null
            };

            // 遍历所有列，动态匹配筛选值
            this.$refs.elTable.columns.forEach(column => {
                const columnKey = column.id; // 例如 "el-table_1_column_4"
                if (filters[columnKey]) {
                    const filterValue = filters[columnKey][0]; // 取数组第一个值
                    switch (column.property) { // 根据列的 prop 分配筛选值
                        case "gender":
                            newFilters.gender = filterValue;
                            break;
                        case "has_answered_questionnaire":
                            newFilters.has_answered_questionnaire = filterValue;
                            break;
                        case "team_id":
                            newFilters.team_id = filterValue;
                            break;
                    }
                }
            });

            this.filters = newFilters;
            this.currentPage = 1; // 重置分页
        }
    },
    computed: {
        tableHeight() {
            return window.screen.height - 400;
        },
        // 过滤后的学生列表（用于搜索和筛选）
        filteredStudents() {
            console.log("Recalculating filteredStudents..."); // 调试用

            let filtered = this.students;
            
            // 应用搜索条件
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(student => {
                    return (
                        String(student.id).includes(query) ||
                        (student.name && student.name.toLowerCase().includes(query))
                    );
                });
            }
            
            // 应用筛选条件
            if (this.filters.gender !== null) {
                filtered = filtered.filter(student => student.gender === this.filters.gender);
            }
            if (this.filters.has_answered_questionnaire !== null) {
                filtered = filtered.filter(student => 
                    student.has_answered_questionnaire === this.filters.has_answered_questionnaire
                );
            }
            if (this.filters.team_id !== null) {
                if (this.filters.team_id === undefined) {
                    filtered = filtered.filter(student => student.team == null);
                } else {
                    filtered = filtered.filter(student => student.team != null);
                }
            }
            console.info(filtered, this.filters)
            
            return filtered;
        },
        // 分页后的学生列表
        paginatedStudents() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            const result = this.filteredStudents.slice(start, end);
            return result;
        }
    },
    async asyncData({params, $axios}) {
        const data = await $axios.$get('/student/list');
        return {
            originalStudents: data.data.students,
            students: data.data.students
        };
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

.search-bar {
    margin-bottom: 20px;
}

.el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
}
</style>