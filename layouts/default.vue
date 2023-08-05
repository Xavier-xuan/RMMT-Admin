<template>

    <div>
        <el-container>
            <el-header>

                <el-row class="header" type="flex" align="middle" justify="space-between" >
                    <el-col class="site-name" :span="6">
                        <a href="/">RMMT Admin</a>
                    </el-col>

                    <el-col class="site-name" :span="4" >
                    </el-col>

                    <el-col class="menu" :span="10" :lg="10" :md="14" >
                        <el-menu ref="navigation_bar" mode="horizontal" :default-active="navUrl"
                                 :router="true">
                            <el-menu-item index="/dashboard">仪表盘</el-menu-item>

                            <el-submenu index="student">
                                <template slot="title">账号管理</template>
                                <el-menu-item index="/student/list">账号列表</el-menu-item>
                                <el-menu-item index="/student/import">批量导入账号</el-menu-item>
                            </el-submenu>

                            <el-submenu index="system">
                                <template slot="title">系统管理</template>
                                <el-menu-item index="/system/setting">基本设置</el-menu-item>
                                <el-menu-item index="/system/questionnaire">问卷管理</el-menu-item>
                                <el-menu-item index="/system/reset">一键还原</el-menu-item>
                            </el-submenu>

                            <el-menu-item index="/team">组队管理</el-menu-item>

                            <el-submenu index="account">
                                <template slot="title">您好，{{ this.$auth.user.username }}</template>
                                <el-menu-item @click="show_change_password_panel = true">修改密码</el-menu-item>
                                <el-menu-item @click="logout">退出登录</el-menu-item>
                            </el-submenu>
                        </el-menu>
                    </el-col>
                </el-row>

            </el-header>

            <el-main>
                <Nuxt/>
            </el-main>
        </el-container>

        <el-dialog :visible.sync="show_change_password_panel" title="修改密码" width="600px">
            <el-form ref="change_password_panel" :rules="rules" :model="change_password" label-width="100px">
                <el-form-item label="当前密码" prop="current_password">
                    <el-input type="password" v-model="change_password.current_password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="new_password">
                    <el-input type="password" v-model="change_password.new_password" autocomplete="off"
                              placeholder="新密码不能少于八位"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirm_password">
                    <el-input type="password" v-model="change_password.confirm_password" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="show_change_password_panel = false">取消</el-button>
                <el-button type="primary" @click="do_change_password">确认</el-button>
            </div>
        </el-dialog>
    </div>


</template>

<script>
export default {
    name: "default",
    data() {
        let confirm_password = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.change_password.new_password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            navUrl: null,
            show_change_password_panel: false,
            change_password: {
                current_password: null,
                new_password: null,
                confirm_password: null
            },
            rules: {
                current_password: [{
                    type: 'string',
                    pattern: /^[^\s]*$/,
                    message: "密码必须大于八位",
                    required: true,
                    min: 8,
                    trigger: 'blur'

                }],
                new_password: [{
                    type: 'string',
                    pattern: /^[^\s]*$/,
                    message: "新密码必须大于八位",
                    required: true,
                    min: 8,
                    trigger: 'blur'

                }],
                confirm_password: [
                    {
                        validator: confirm_password,
                        trigger: 'blur',
                        required: true,
                    }
                ],
            }
        }
    },
    methods: {
        logout() {
            this.$auth.logout()
        },
        do_change_password() {
            this.$refs['change_password_panel'].validate(valid => {
                if (!valid) return;
                this.$axios.$post('/change_password', {
                    'current_password': this.change_password.current_password,
                    'new_password': this.change_password.new_password
                }).then(data => {
                    if (data.code === 200) {
                        this.show_change_password_panel = false
                        this.$refs['change_password_panel'].resetFields()
                        this.$message.success("修改密码成功！")
                    }
                })
            })
        }
    },
    created() {
        this.navUrl = this.$route.path

        // 五分钟发送一次心跳包 刷新token
        setInterval(async () => {
            await this.$auth.fetchUser()
        }, 5 * 60 * 1000)
    }
}
</script>

<style scoped>
.header {
    height: 100%;
    border-bottom: solid 1px #e6e6e6;

}

.site-name {
    text-align: center;
}

a {
    font-family: Consolas, sans-serif;
    text-decoration: none;
    color: rgba(0, 0, 0, .87);
    font-size: 2rem;
}

.el-header {
    background: #ffffff;
}
</style>
