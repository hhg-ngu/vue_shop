<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoles">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRoles(scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addRolesFormRef" :model="addRolesForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form ref="editRolesFormRef" :model="editRolesForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightClose"
    >
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      editRolesForm: {
        id: "",
        roleName: "",
        roleDesc: "",
      },
      rightsList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      setRightDialogVisible: false,
      treeProps: {
        label: "authName",
        children: "children",
      },
      defKeys: [],
      roleId: "",
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    //   获取列表数据
    async getRoleList() {
      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      this.roleList = res.data;
    },
    showAddRoles() {
      this.addDialogVisible = true;
    },
    // 添加用户
    addRoles() {
      this.$refs.addRolesFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.post(
          "/roles",
          this.addRolesForm
        );
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        this.getRoleList();
      });
    },
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },
    // 编辑角色
    showEditRoles(val) {
      this.editDialogVisible = true;
      this.editRolesForm.id = val.id;
      this.editRolesForm.roleName = val.roleName;
      this.editRolesForm.roleDesc = val.roleDesc;
    },
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    editRoles() {
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.put(
          `/roles/${this.editRolesForm.id}`,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) return this.$message.error("修改失败");
        this.$message.success("修改成功");
        this.editDialogVisible = false;
        this.getRoleList();
      });
    },
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
      const { data: res } = await this.$http.delete(`/roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.$message.success("删除用户成功");
      this.getRoleList();
    },
    // 删除权限
    async removeRightById(role, id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm")
        return this.$message.info("删除用户已取消");
      const { data: res } = await this.$http.delete(
        `/roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除权限失败");
      // this.getRoleList();
      role.children = res.data;
    },
    // 渲染tree
    async showSetRightDialog(role) {
      this.roleId = role.id;
      //获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error("获取权限失败");
      this.rightsList = res.data;
      this.getLeaKeys(role, this.defKeys);

      this.setRightDialogVisible = true;
    },
    setRightClose() {
      this.defKeys = [];
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const {
        data: res,
      } = await this.$http.post(`/roles/${this.roleId}/rights`, {
        rids: idStr,
      });
      if (res.meta.status !== 200) return this.$message.error("分配权限失败");
      this.$message.success("分配权限成功");
      this.getRoleList();
      this.setRightDialogVisible = false;
    },
    //递归获取三级权限
    getLeaKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((element) => {
        this.getLeaKeys(element, arr);
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>