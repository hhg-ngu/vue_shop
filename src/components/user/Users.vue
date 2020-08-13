<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 输入 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userList" border style="width: 100%" stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialog(scope.row)"
              type="primary"
              icon="el-icon-edit"
              size="small"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="small"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUserInfo">确 定</el-button>
    </el-dialog>

    <el-dialog @close="setRoleClose" title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="roleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/;
      if (regEmail.test(value)) {
        return cb();
      } else {
        return cb(new Error("邮箱不合法"));
      }
    };
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/;
      if (regMobile.test(value)) {
        return cb();
      } else {
        return cb(new Error("手机填写不合法"));
      }
    };

    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      editForm: {
        id: "",
        username: "",
        email: "",
        mobile: "",
      },
      userInfo: {
        //权限管理
        id: "",
        username: "",
        role_name: "",
      },
      addFormRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
        ],
        email: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editRules: {
        email: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      setRoleDialogVisible: false, //分配角色
      roleList: [],
      roleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //   获取列表
    async getUserList() {
      const { data: res } = await this.$http.get("/users", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    async userChange(val) {
      const { data: res } = await this.$http.put(
        `/users/${val.id}/state/${val.mg_state}`
      );
      if (res.meta.status !== 200) {
        val.mg_state = !val.mg_state;
        return this.$message.error("更新状态失败");
      }
      this.$message.error("更新状态成功");
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.post("/users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    // 修改
    showEditDialog(val) {
      this.editDialogVisible = true;
      this.editForm.id = val.id;
      this.editForm.username = val.username;
      this.editForm.email = val.email;
      this.editForm.mobile = val.mobile;
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.put(
          `/users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status !== 200) return this.$message.error("更新信息失败");
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success("更新信息成功");
      });
    },
    // 删除
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm")
        return this.$message.info("删除用户已取消");
      const { data: res } = await this.$http.delete(`/users/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.$message.success("删除用户成功");
      this.getUserList();
    },
    async setRole(userInfo) {
      this.userInfo.id = userInfo.id;
      this.userInfo.username = userInfo.username;
      this.userInfo.role_name = userInfo.role_name;

      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    async setRoleInfo() {
      if (!this.roleId) return this.$message.error("请选择分配的角色");
      const { data: res } = await this.$http.put(
        `/users/${this.userInfo.id}/role`,
        {
          rid: this.roleId,
        }
      );
      if (res.meta.status !== 200) return this.$message.error("更新角色失败");
      this.$message.success("更新角色成功");
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    setRoleClose() {
      this.roleId = "";
      this.userInfo.username = "";
      this.userInfo.role_name = "";
    },
  },
};
</script>

<style lang="less" scoped>
</style>