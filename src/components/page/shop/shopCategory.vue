<template>
  <div class="container">

    <!-- 查询和其他操作 -->
    <div class="handle-box">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="tableData"  size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>


      <el-table-column align="center" label="分类编号" prop="id"/>

      <el-table-column align="center" min-width="100" label="名称" prop="name"/>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="10"
                     :current-page="pageNum" >
      </el-pagination>
    </div>

    <!-- 添加分类 -->
    <el-dialog :visible.sync="addCategoryFormVisible" title="添加分类">
      <el-form ref="addCategoryForm" :rules="rules" :model="addCategoryForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类名字" prop="content">
          <el-input  v-model="addCategoryForm.content" type="text"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCategoryFormVisible = false">取消</el-button>
        <el-button type="primary" @click="create">确定</el-button>
      </div>
    </el-dialog>

    <!-- 修改分类 -->
    <el-dialog :visible.sync="editCategoryFormVisible" title="修改分类">
      <el-form ref="editCategoryForm" :rules="rules" :model="editCategoryForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类名字" prop="content">
          <el-input  v-model="editCategoryForm.content" type="text"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCategoryFormVisible = false">取消</el-button>
        <el-button type="primary" @click="edit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog title="提示" :visible.sync="centerDialogVisible" width="20%" center>
      <span>确定删除吗？</span>
      <span slot="footer" class="dialog-footer">
      <el-button @click="centerDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="hdelete()">确 定</el-button>
      </span>
    </el-dialog>



  </div>
</template>

<script>
  export default {
    name: 'shopCategory',
    data () {
      return {
        total: 0,
        listLoading: true,
        tableData: [],
        pageNum: 0,
        pageSize: 10,
        categoryId:0,
        addCategoryForm: {
          content: ''
        },
        addCategoryFormVisible: false,
        centerDialogVisible:false,
        editCategoryForm: {
          id:0,
          content: ''
        },
        editCategoryFormVisible: false,
        rules: {
          content: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
        },
      }
    },
    created() {
      this.getData()
    },

    methods: {
      // 分页导航
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getData();
      },

      // 获取商家分类数据
      getData() {
        this.listLoading = true
        let token = sessionStorage.getItem('token');

        const params = new URLSearchParams();
        params.append('token', token);
        params.append('pageNum', this.pageNum);
        params.append('pageSize', this.pageSize);
        this.$axios.post('/apis/category/getShopCategoryByPage', params
        ).then((response) => {
          if (response.status === 200) {

            if( response.data.errno==501){
              this.$message({
                message: '请登录',
                type: 'failed'
              })
              window.sessionStorage.removeItem('token')
              // this.$router.push({name: 'activity'})
              this.$router.push('/');
              return;
            }
            else{
              let numberOneValue = Number(response.headers['x-total-count']);
              this.total=numberOneValue;
              this.tableData=response.data;
              this.listLoading = false;

            }


          }
        })
          .catch(function (error) {

            this.listLoading = false
          })

      },


      //打开添加分类窗口
      handleCreate(){
        this.addCategoryFormVisible=true
      },
      //添加分类
      create() {

        this.$refs['addCategoryForm'].validate((valid) => {
          if (valid) {
            let token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('name', this.addCategoryForm.content);
            params.append('desc', "");
            this.$axios.post('/apis/category/insertCategoryShop', params
            ).then((response) => {
              if (response.status === 200) {

                if( response.data.errno==501){
                  this.$message({
                    message: '请登录',
                    type: 'failed'
                  })
                  window.sessionStorage.removeItem('token')
                  // this.$router.push({name: 'activity'})
                  this.$router.push('/');
                  return;
                }
                else if( response.data.errno==0){
                  this.$message({
                    message: '添加成功',
                    type: 'successd'
                  })
                  this.addCategoryFormVisible = false
                  this.getData()
                  return;
                }
                else{
                  this.$message({
                    message: '添加失败',
                    type: 'failed'
                  })


                }


              }
            })
              .catch(response => {
                MessageBox.alert('业务错误：' + response.data.errmsg, '警告', {
                  confirmButtonText: '确定',
                  type: 'error'
                })
              })
          } else {

            return false;
          }
        });

      },
      //打开分类修改窗口
      handleUpdate(row){
        this.editCategoryFormVisible=true;
        this.editCategoryForm.content=row.name;
        this.editCategoryForm.id=row.id
      },
      //修改分类
      edit() {

        this.$refs['editCategoryForm'].validate((valid) => {
          if (valid) {
            let token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('id', this.editCategoryForm.id);
            params.append('name', this.editCategoryForm.content);
            this.$axios.post('/apis/category/updateCategoryShop', params
            ).then((response) => {
              if (response.status === 200) {

                if( response.data.errno==501){
                  this.$message({
                    message: '请登录',
                    type: 'failed'
                  })
                  window.sessionStorage.removeItem('token')
                  // this.$router.push({name: 'activity'})
                  this.$router.push('/');
                  return;
                }
                else if( response.data.errno==0){
                  this.$message({
                    message: '修改成功',
                    type: 'successd'
                  })
                  this.editCategoryFormVisible = false
                  this.getData()
                  return;
                }
                else{
                  this.$message({
                    message: '修改失败',
                    type: 'failed'
                  })


                }


              }
            })
              .catch(response => {
                MessageBox.alert('业务错误：' + response.data.errmsg, '警告', {
                  confirmButtonText: '确定',
                  type: 'error'
                })
              })
          } else {

            return false;
          }
        });

      },
      handleDelete(row){
        this.categoryId=row.id
        this.centerDialogVisible = true
        console.log(row.id)
      },
      //删除分类
      hdelete(){
        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('id', this.categoryId);
        this.$axios.post('/apis/category/deleteCategoryShop', params
        ).then((response) => {
          if (response.status === 200) {

            if( response.data.errno==501){
              this.$message({
                message: '请登录',
                type: 'failed'
              })
              window.sessionStorage.removeItem('token')
              // this.$router.push({name: 'activity'})
              this.$router.push('/');
              return;
            }
            else if( response.data.errno==0){
              this.centerDialogVisible = false
              this.$message({
                message: '删除成功',
                type: 'successd'
              })
              this.getData()
              return;
            }
            else if( response.data.errno==-1){
              this.$message({
                message: '删除失败，该分类下还有商店',
                type: 'failed'
              })


            }


          }
        })
          .catch(response => {
            MessageBox.alert('业务错误：' + response.data.errmsg, '警告', {
              confirmButtonText: '确定',
              type: 'error'
            })
          })

      }

    }
  }
</script>

<style scoped>
  .handle-box{
    margin-bottom: 20px;
  }
  .handle-box{
    margin-bottom: 20px;
  }
  .table-expand {
    font-size: 0;
  }
  .table-expand label {
    width: 100px;
    color: #99a9bf;
  }
  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  .gallery {
    width: 80px;
    margin-right: 10px;
  }
  .pagination{
    padding: 32px 16px;
  }
</style>
