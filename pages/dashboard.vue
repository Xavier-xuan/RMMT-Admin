<template>
    <div class="dashboard-container">
        <el-row>
            <el-col :push="2" :span="12" class="overviw-container">
                <el-card class="box-card ">
                    <div class="overview-content">
                        <div class="overview-usercount">
                            <div class="usercount-number">
                                {{ userCount }}
                            </div>
                            <div class="usercount-tip">
                                学生总数
                            </div>
                        </div>
                        <el-divider>
                        </el-divider>
                        <el-row class="overview-sub-container " type="flex">
                            <el-col :span="8" class="overview-sub">
                                <div class="overview-questionnaire">
                                    <div class="overview-sub-number finished-questionnaire">
                                        {{ finishedQuestionnaire }}
                                    </div>
                                    <div class="overview-sub-tip">
                                        已完成问卷的学生
                                    </div>
                                </div>
                            </el-col>
                            <el-col :span="8" class="overview-sub">
                                <div class="overview-mated">
                                    <div class="overview-sub-number mated">
                                        {{ mated }}
                                    </div>

                                    <div class="overview-sub-tip">
                                        已组队的学生
                                    </div>
                                </div>
                            </el-col>
                            <el-col :span="8" class="overview-sub">
                                <div class="overview-current-stage">

                                    <div class="overview-sub-number current-stage">
                                        {{ currentStage }}
                                    </div>


                                    <div class="overview-sub-tip">
                                        当前阶段
                                    </div>
                                </div>
                            </el-col>
                        </el-row>
                    </div>

                </el-card>
            </el-col>


            <el-col :span="6" :push="4" class="actions-container">
                <el-card class="box-card action-card team-number">
                    <div class="numeric-data">
                        {{ teamsCount }}
                    </div>
                    <div class="action-tip">
                        队伍数量
                    </div>
                </el-card>

                <el-card class="box-card action-card">
                    <div class="numeric-data">
                        {{ questionnaireItems }}
                    </div>

                    <div class="action-tip">
                        问卷问题数量
                    </div>
                </el-card>
            </el-col>
        </el-row>

    </div>
</template>

<script>
export default {
    name: "dashboard",
    data() {
        return {
            userCount: 200,
            finishedQuestionnaire: 180,
            mated: 140,
            currentStage: "Pre",
            teamsCount: 10,
            questionnaireItems: 35,
        }
    },
    async asyncData({$axios}) {
        let data = {
            userCount: 0,
            finishedQuestionnaire: 0,
            mated: 0,
            currentStage: "",
            teamsCount: 0,
            questionnaireItems: 0,
        }

        let students = await $axios.$get('/student/list').then(data => {
            return data.data.students
        })

        for (let student of students) {
            if (student.team != null)
                data.mated++;

            if (student.has_answered_questionnaire == true)
                data.finishedQuestionnaire++;

        }
        data.userCount = students.length

        let teams = await $axios.$get('/team/list').then(data => {
            if (data.code === 200) {
                return data.data.teams
            }
        })

        data.teamsCount = teams.length;

        let questionnaireItems = await $axios.$get('/questionnaire/list').then(data => {
            return data.data
        })
        data.questionnaireItems = questionnaireItems.length;

        let settings = await $axios.$get("/system_setting/list").then(data => {
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
        });

        let isDuringTime = function (beginDateStr, endDateStr
        ) {
            let curDate = new Date(),
                beginDate = new Date(beginDateStr),
                endDate = new Date(endDateStr);
            if (curDate >= beginDate && curDate <= endDate) {
                return true;
            }
            return false;
        }

        if (new Date() < new Date(settings.step_1_period[0])) {
            data.currentStage ="预开放"
        } else if (isDuringTime(settings.step_1_period[0], settings.step_1_period[1])) {
            data.currentStage = "问卷填写"
        } else if (isDuringTime(settings.step_2_period[0], settings.step_2_period[1])) {
            data.currentStage = "算法匹配"
        } else if (isDuringTime(settings.step_3_period[0], settings.step_3_period[1])) {
            data.currentStage = "自由组队";
        } else {
            data.currentStage = "管理员确认";
        }
        return data;
    }
}
</script>

<style scoped>
.overview-content {
    height: 400px;
}

.overview-usercount {
    height: 250px;
}

.usercount-number {
    padding: 100px 0 10px 15px;
    font-size: 5rem;
    color: #409EFF;
}

.usercount-tip {
    padding: 0 15px;
    font-size: 2rem;
    color: rgba(0, 0, 0, .64);
}

.overview-sub {
    height: 100px;
}

.overview-sub-container .overview-sub:not(:last-child) {
    border-right: 1px solid;
    color: #DCDFE6;
}

.overview-sub-number {
    font-size: 2.8rem;
    color: #409EFF;
}

.overview-sub-tip {
    padding-left: 5px;
    color: rgba(0, 0, 0, .64);
}

.overview-sub {
    padding-left: 10px;
}

.actions-container .box-card:not(:first-child) {
    margin-top: 20px;
}

.action-card {
    height: 210px;
}

.numeric-data {
    color: #409EFF;
    font-size: 5rem;
    margin-top: 15px;
}

.action-tip {
    color: rgba(0, 0, 0, .64);
    font-size: 1.4rem;
}

.team-number .numeric-data {
    margin-top: 40px;
}
</style>
