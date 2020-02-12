<template>

  <div class="container">

    <!-- 查询和其他操作 -->
    <div class="handle-box">
      <el-button type="danger" icon="delete" class="handle-del mr10" @click="centerDialogVisible = true">删除</el-button>
      <!--<el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>-->
    </div>

    <!-- 查询结果 -->
    <el-table  v-loading="listLoading" :data="tableData" @selection-change="selsChange" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column type="selection"  align="center"></el-table-column>
      <el-table-column align="center" label="兼职编号" prop="id"/>
      <el-table-column align="center" label="标题" prop="title"/>
      <el-table-column align="center" label="工作内容"  prop="detail" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <p v-html="scope.row.detail"></p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="工资" prop="salary"/>
      <el-table-column align="center" label="类型" prop="type">
      <template slot-scope="scope">
        <el-tag :type="scope.row.type | statusFilter">{{scope.row.type | orderStatusFilter }}</el-tag>
      </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" prop="startTime" :formatter="timestampToTime" />
      <el-table-column align="center" label="结束时间" prop="endTime" :formatter="timestampToTime"/>
      <el-table-column align="center" label="工作地点" prop="address"/>

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
  const statusTagMap = {

    0: 'success',
    1: 'danger',
    2: 'warning',
  }

  const statusMap = {
    0: '日结',
    1: '月结',
    2: '完工结',
  }
  export default {
    name: 'workList',
    filters: {
      orderStatusFilter (status) {
        return statusMap[status]
      },
      statusFilter (status) {
        return statusTagMap[status]

      }
    },
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

      // 获取兼职数据
      getData() {

        this.listLoading = true
        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('pageNum', this.pageNum);
        params.append('pageSize', this.pageSize);
        this.$axios.post('/apis/work/getWork', params
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
              console.log(response.data)
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
        this.$axios.post('/apis/work/deleteWork', params
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
      },

      handleUpdate(row){
        this.$router.push({ path: '/editWork', query: { id: row.id }})
     },
      //时间格式化
      timestampToTime (row, column) {
        var date = new Date(row.createTime) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-'
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        var D = date.getDate() + ' '
        var h = date.getHours() + ':'
        var m = date.getMinutes() + ':'
        var s = date.getSeconds()
        return Y+M+D+h+m+s

      },
    }
  }
</script>

<style scoped>

</style>
