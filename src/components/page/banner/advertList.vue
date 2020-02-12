<template>

    <div class="container">

      <!-- 查询和其他操作 -->
      <div class="handle-box">
        <el-button type="danger" icon="delete" class="handle-del mr10" @click="centerDialogVisible = true">删除</el-button>
        <!--<el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>-->
      </div>

      <!-- 查询结果 -->
      <el-table v-loading="listLoading" :data="tableData" @selection-change="selsChange" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
        <el-table-column type="selection" width="55" align="center"></el-table-column>


        <el-table-column align="center" label="广告编号" prop="id"/>
       <el-table-column align="center" property="iconUrl" label="图片">
          <template slot-scope="scope">
            <viewer :images="tableData.picAddr">
              <img v-if="scope.row.picAddr" :src="baseurl+scope.row.picAddr" width="40">
            </viewer>
          </template>
        </el-table-column>
        <el-table-column align="center" label="跳转链接" prop="toUrl"/>

        <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
            <!--<el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="10"
                       :current-page="pageNum" >
        </el-pagination>
      </div>

      <!-- 删除提示框 -->
      <el-dialog title="提示" :visible.sync="centerDialogVisible" width="20%" center>
        <span>确定删除吗？</span>
        <span slot="footer" class="dialog-footer">
      <el-button @click="centerDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="delAll()">确 定</el-button>
      </span>
      </el-dialog>

    </div>

</template>

<script>
  export default {
    name: 'banner',
    data() {
      return {
        baseurl:this.GLOBAL.serverSrc,
        list: [],
        total: 0,
        listLoading: true,
        centerDialogVisible : false,
        tableData:[],
        pageNum:0,
        pageSize:10,
      }
    },

    created() {
      this.getData()
    },
    methods:{
      // 分页导航
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getData();
      },

      handleUpdate(row){
        this.$router.push({ path: '/editAdvert', query: { id: row.id }})
      },

      // 获取广告数据
      getData() {

        this.listLoading = true
        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('pageNum', this.pageNum);
        params.append('pageSize', this.pageSize);
        this.$axios.post('/apis/banner/getBanner', params
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
      //监听多选框
      selsChange(sels) {
        //被选中的行组成数组
        this.sels = sels;
        //console.log(this.sels.id)
      },

      delAll(){
        this.listLoading = true;
        var id = this.sels.map(item => item.id).join()
        var ids=[]
        ids.push(id);
        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('ids', ids);
        this.$axios.post('/apis/banner/deleteBanner', params
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
            if( response.data.errno==0){
              this.centerDialogVisible = false
              this.$message({
                message: '已删除',
                type: 'success'
              })
              this.listLoading = false;
              this.getData()
            }
            if( response.data.errno==-1){
              this.$message({
                message: '删除失败',
                type: 'failed'
              })
              this.listLoading = false;

            }


          }
        })
          .catch(function (error) {

            this.listLoading = false
          })
      }
    }
  }
</script>

<style scoped>

</style>
