<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">后台管理系统</div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="username">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="password" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')">
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
                </div>
                <!--<p class="login-tips">Tips : 用户名和密码随便填。</p>-->
            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        data: function(){
            return {
                ruleForm: {
                    username: '935924925',
                    password: 'weihaisheng'
                },
                rules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            submitForm(formName) {
              this.$refs[formName].validate((valid) => {
                    if (valid) {
                      const params = new URLSearchParams();
                      params.append('username', this.ruleForm.username);
                      params.append('password', this.ruleForm.password);

                      this.$axios.post('apis/user/adminLogin', params
                      ).then((response) => {
                          if (response.status === 200) {

                            if( response.data.login==0){
                              this.$store.commit('SET_TOKEN', response.data.token)
                              this.$store.commit('GET_USER', response.data.user)
                              this.$store.commit('GET_IMAGE', response.data.user_image)
                              this.$store.commit('GET_USERID', response.data.userId)
                              this.$store.commit('ROLE', response.data.role)
                              if( response.data.role==3){
                                // window.sessionStorage.removeItem('role')
                                // window.sessionStorage.removeItem('user_image')
                                this.$store.commit('GET_USER', '')
                                this.$store.commit('GET_IMAGE', '')
                                this.$router.push('/shop');
                              }
                              if(response.data.role==2){
                                this.$router.push('/');
                              }
                              this.$message({
                                message: '登陆成功',
                                type: 'success'
                              })
                              // this.$router.push({name: 'activity'})


                            }
                            else if(response.data.errno==508){
                              this.$message({
                                message: '密码错误',
                                type: 'failed'
                              })
                            }
                            else if(response.data.errno==511){
                              this.$message({
                                message: '用户名不存在',
                                type: 'failed'
                              })
                            }


                          }
                        })
                        .catch(function (error) {
                          console.log(error)

                        })

                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap{
        position: relative;
        width:100%;
        height:100%;
        background-image: url(../../assets/bg.jpg);
        background-size: 100%;
    }
    .ms-title{
        width:100%;
        line-height: 50px;
        text-align: center;
        font-size:20px;
        color: #fff;
        border-bottom: 1px solid #ddd;
    }
    .ms-login{
        position: absolute;
        left:50%;
        top:50%;
        width:350px;
        margin:-190px 0 0 -175px;
        border-radius: 5px;
        background: rgba(255,255,255, 0.3);
        overflow: hidden;
    }
    .ms-content{
        padding: 30px 30px;
    }
    .login-btn{
        text-align: center;
    }
    .login-btn button{
        width:100%;
        height:36px;
        margin-bottom: 10px;
    }
    .login-tips{
        font-size:12px;
        line-height:30px;
        color:#fff;
    }
</style>
