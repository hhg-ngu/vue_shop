<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为三级分类的添加参数" type="warning" :closable="false" show-icon></el-alert>
      <el-row class="cat_top">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="catekeys"
            :options="catelist"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children' }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="adddialogVisible = true"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleDelete(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 动态tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="adddialogVisible = true"
          >添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleDelete(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 动态tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加属性dialog -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="adddialogVisible"
      @close="addDialogClose"
      width="50%"
    >
      <el-form ref="addformRef" :rules="addformRules" :model="addform" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addform.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editdialogVisible"
      @close="editDialogClose"
      width="50%"
    >
      <el-form ref="editformRef" :rules="editformRules" :model="editform" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editform.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      catekeys: [],
      activeName: "many",
      manyTableData: [],
      onlyTableData: [],
      adddialogVisible: false,
      addform: { attr_name: "" },
      addformRules: {
        attr_name: [{ required: true, message: "请输入参数", trigger: "blur" }],
      },
      editdialogVisible: false,
      editform: {
        id: "",
        attrId: "",
        attr_name: "",
        attr_vals: "",
      },
      editformRules: {
        attr_name: [{ required: true, message: "请输入参数", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getCateList(); //获取级联数据
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("/categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      this.catelist = res.data;
    },
    //获取参数的列表数据
    async getParamsList() {
      if (this.catekeys.length !== 3) {
        this.catekeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) return this.$message.error("获取参数失败");
      res.data.forEach((element) => {
        element.attr_vals = element.attr_vals
          ? element.attr_vals.split(" ")
          : [];
        //控制标签显示/隐藏
        element.inputVisible = false;
        element.inputValue = "";
      });
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    //级联选择
    handleChange() {
      this.getParamsList();
    },
    handleTabsClick() {
      this.getParamsList();
    },
    addDialogClose() {
      this.$refs.addformRef.resetFields();
    },
    addParams() {
      this.$refs.addformRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addform.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.getParamsList();
        this.adddialogVisible = false;
      });
    },
    showEditDialog(val) {
      console.log(val);
      this.editdialogVisible = true;
      this.editform.attr_name = val.attr_name;
      this.editform.attrId = val.attr_id;
      this.editform.id = val.cat_id;
      this.editform.attr_vals = val.attr_vals;
    },
    editDialogClose() {
      this.$refs.editformRef.resetFields();
    },
    editParams() {
      this.$refs.editformRef.validate(async (valid) => {
        if (!valid) return this.$message.error("校检不通过");
        const { data: res } = await this.$http.put(
          `categories/${this.editform.id}/attributes/${this.editform.attrId}`,
          {
            attr_name: this.editform.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success("更新成功");
        this.getParamsList();
        this.editdialogVisible = false;
      });
    },
    async removeParams(val) {
      console.log(val);
      const confirm = await this.$confirm(
        "此操作永久删除这条记录，是否继续",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirm !== "confirm") return this.$message.info("已取消");
      const { data: res } = await this.$http.delete(
        `categories/${val.cat_id}/attributes/${val.attr_id}`
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success("删除成功");
      this.getParamsList();
    },
    //提交
    async handleInputConfirm(val) {
      if (val.inputValue.trim().length === 0) {
        val.inputValue = "";
        val.inputVisible = false;
        return;
      }

      val.attr_vals.push(val.inputValue.trim());
      val.inputValue = "";
      val.inputVisible = false;

      this.saveAttrVals(val);
    },
    //tag显示/隐藏
    showInput(val) {
      val.inputVisible = true;
      //页面渲染完事儿，回调才有用
      this.$nextTick(() => {
        this.$refs.saveInput.$refs.input.focus();
      });
    },
    async saveAttrVals(val) {
      const { data: res } = await this.$http.put(
        `categories/${val.cat_id}/attributes/${val.attr_id}`,
        {
          attr_name: val.attr_name,
          attr_sel: val.attr_sel,
          attr_vals: val.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) return this.$message.error("添加失败");
      this.$message.success("添加成功");
    },

    //删除tag标签
    handleDelete(i, val) {
      val.attr_vals.spli(i, 1);
      this.saveAttrVals(val);
    },
  },
  computed: {
    isBtn() {
      if (this.catekeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.catekeys.length === 3) {
        return this.catekeys[2];
      }
      return null;
    },
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style lang="less" scoped>
.cat_top {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px;
}
.el-tag {
  margin: 5px 10px;
}
</style>