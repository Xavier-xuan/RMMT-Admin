<template>
    <div class="login-box">
        <div class="login-card">
            <ZhixinLogo></ZhixinLogo>
            <div class="logo">
                Roommate Matcher Admin
            </div>
            <div class="login-form">
                <el-form ref="login_form" :model="login_form" :rules="rules">
                    <el-form-item label="电子邮箱" prop="email">
                        <el-input v-model="login_form.email"></el-input>
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="login_form.password"></el-input>
                    </el-form-item>

                    <el-button type="primary" @click="login">登录</el-button>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "login",
    auth: 'guest',
    layout: "auth",
    data() {
        return {
            login_form: {
                email: "",
                password: ""
            },
            rules: {
                email: {
                    type: 'email',
                    required: true,
                    trigger: 'blur'
                },
                password: {
                    type: 'string',
                    pattern: /^[^\s]*$/,
                    message: "密码需大于8位",
                    required: true,
                    min: 8,
                    trigger: 'blur'

                }
            }
        }
    },
    methods: {
        login: _.throttle(async function () {
            this.$refs['login_form'].validate(async (valid) => {
                if (valid) {
                    try {
                        let response = await this.$auth.login({
                            data: this.login_form
                        })

                        if (response.data.code === 200) {
                            this.$message.success("你好， " + this.$auth.user.username + "!")
                        }

                    } catch (e) {
                        console.error(e)
                    }

                    return true
                } else {
                    return false
                }
            })
        }, 3000)
    }
}

</script>

<style scoped>
.login-box {
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;

}

.login-form {
    padding: 50px 30px;
}

.login-card {
    width: 30%;
    background: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 10px;
}

.logo {
    margin-top: 20px;
    text-align: center;
    font-family: Consolas, fantasy;
    font-size: 2rem;

}

</style>
