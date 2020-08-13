<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <template slot="isok" slot-scope="scope">
          <i
            style="color:lightgreen"
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
          ></i>
          <i style="color:red" v-else class="el-icon-error"></i>
        </template>

        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCate(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%"
      @close="addCateFormClose"
    >
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            :options="parentCateList"
            :props="parentProps"
            v-model="selectKeys"
            @change="parenCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="修改分类"
      :visible.sync="editCatedialogVisible"
      width="50%"
      @close="editCateFormClose"
    >
      <el-form ref="editCateFormRef" :model="editFrom" label-width="100px">
        <el-form-item label="分类名称:" prop="editCateName" required>
          <el-input v-model="editFrom.editCateName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      catelist: [],
      columns: [
        { label: "分类名称", prop: "cat_name" },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      addCatedialogVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      parentCateList: [],
      parentProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      selectKeys: [],
      editFrom: {
        editCateName: "",
        editCateId: "",
      },

      editCatedialogVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`/categories`, {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 增加分类
    showAddCateDialog() {
      this.getParentCateList();
      this.addCatedialogVisible = true;
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get("/categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.parentCateList = res.data;
    },
    parenCateChanged() {
      console.log(this.selectKeys);
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        this.addCateForm.cat_level = this.selectKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不合法");
        const { data: res } = await this.$http.post(
          "/categories",
          this.addCateForm
        );

        if (res.meta.status !== 201) return this.$message.error("添加分类失败");
        this.$message.success(res.meta.msg);
        this.getCateList();
        this.addCatedialogVisible = false;
      });
    },
    addCateFormClose() {
      this.$refs.addCateFormRef.resetFields();
      this.selectKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    showEditCate(val) {
      console.log(val);
      this.editCatedialogVisible = true;
      this.editFrom.editCateName = val.cat_name;
      this.editFrom.editCateId = val.cat_id;
    },
    editCateFormClose() {
      this.$refs.editCateFormRef.resetFields();
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.put(
          `categories/${this.editFrom.editCateId}`,
          {
            cat_name: this.editFrom.editCateName,
          }
        );

        if (res.meta.status !== 200) return this.$message.error("更新分类失败");
        this.$message.success("更新分类成功");
        this.getCateList();
        this.editCatedialogVisible = false;
      });
    },
    async removeCate(val) {
      const { data: res } = await this.$http.delete(
        `/categories/${val.cat_id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除分类失败");
      this.$message.success("删除分类成功");
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
