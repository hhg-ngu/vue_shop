<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <el-form
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        class="login_form"
        label-width="0"
      >
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-s-custom"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="login_btn">
          <el-button type="primary" @click="submitForm('loginRef')"
            >登录</el-button
          >
          <el-button type="info" @click="resetForm('loginRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("/login", this.loginForm);
        if (res.meta.status !== 200) return this.$message.error("登录失败");
        this.$message.success("登录成功");
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2b4b6b;
  height: 100%;

  .login_box {
    display: flex;
    justify-content: center;
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: relative;
    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      transform: translateY(-50%);
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      img {
        height: 100%;
        width: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 10px;
      box-sizing: border-box;
      .login_btn {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
