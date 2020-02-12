<template>
  <div class="container">

    <!-- 查询和其他操作 -->
    <div class="handle-box">
      <el-input v-model="listQuery.userId" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户ID"/>
      <el-input v-model="listQuery.valueId" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品ID"/>
      <!--<el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>-->
      <!--<el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>-->
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" label="用户ID" prop="wechatUserId"/>

      <el-table-column align="center" label="商品ID" prop="goodsId"/>

      <el-table-column align="center" label="打分" prop="score"/>

      <el-table-column align="center" label="评论内容" prop="content"/>

      <el-table-column align="center" label="评论图片" prop="commentPictureList">
        <template slot-scope="scope">
          <viewer :images="scope.row.commentPictureList">
          <img v-for="item in scope.row.commentPictureList" :key="item.picAddr" :src=" baseurl+item.picAddr" width="40">
          </viewer>
        </template>
      </el-table-column>

      <el-table-column align="center" label="时间" prop="createTime" :formatter="timestampToTime"/>

      <el-table-column align="center" label="我的回复" prop="reply.content"/>



      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button  v-if="scope.row.reply==null"type="primary" size="mini" @click="handleReply(scope.row)">回复</el-button>
          <el-tag v-if="scope.row.reply!=null">已回复</el-tag>
          <!--<el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="10"
                     :current-page="pageNum" >
      </el-pagination>
    </div>

    <!-- 评论回复 -->
    <el-dialog :visible.sync="replyFormVisible" title="回复">
      <el-form ref="replyForm" :rules="rules" :model="replyForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="回复内容" prop="content">
          <el-input :autosize="{ minRows: 4, maxRows: 8}" v-model="replyForm.content" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyFormVisible = false">取消</el-button>
        <el-button type="primary" @click="reply">确定</el-button>
      </div>
    </el-dialog>




  </div>
</template>

<style>
  .handle-box{
    margin-bottom: 20px;
  }
  .pagination{
    padding: 32px 16px;
  }
</style>
<script>


export default {
  name: 'goodsCommentList',
  data() {
    return {
      baseurl:this.GLOBAL.serverSrc,
      list: undefined,
      total: 0,
      pageNum:0,
      pageSize:10,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        valueId: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false,
      replyForm: {
        commentId: 0,
        content: ''
      },
      replyFormVisible: false,
      rules: {
        content: [{ required: true, message: '回复内容不能为空', trigger: 'blur' }],
       },
    }
  },
  created() {
    this.getList()
  },
  methods: {

    // 分页导航
    handleCurrentChange(val) {
      this.pageNum = val-1;
      this.getData();
      this.pageNum = val;
    },
    // 获取商品数据
    getList() {

      this.listLoading = true
      let token = sessionStorage.getItem('token');
      let userId = sessionStorage.getItem('userId');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('userId', userId);
      params.append('pageNum', this.pageNum);
      params.append('pageSize', this.pageSize);
      this.$axios.post('/apis/comment/getCommentWithPictureBySellerId', params
      ).then((response) => {
        if (response.status === 200) {

          if( response.data.errno==501){
            this.$message({
              message: '请登录',
              type: 'failed'
            })
            // this.$router.push({name: 'activity'})
            this.$router.push('/');
            return;
          }
          else{
            let numberOneValue = Number(response.headers['x-total-count']);
            this.total=numberOneValue;
            this.list=response.data;
            this.listLoading = false;

          }


        }
      })
        .catch(function (error) {

          this.listLoading = false
        })

    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleReply(row) {
      this.replyForm = { commentId: row.id, content: '' }
      this.replyFormVisible = true
    },
    reply() {

      this.$refs['replyForm'].validate((valid) => {
        if (valid) {
          let token = sessionStorage.getItem('token');
          let userId = sessionStorage.getItem('userId');
          const params = new URLSearchParams();
          params.append('token', token);
          params.append('userId', userId);
          params.append('content', this.replyForm.content);
          params.append('commentId', this.replyForm.commentId);

          this.$axios.post('/apis/comment/insertReply', params
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
                  message: '回复成功',
                  type: 'successd'
                })
                this.replyFormVisible = false
                this.getList()
                return;
              }
              else{
                this.$message({
                  message: '回复失败',
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
    // handleDelete(row) {
    //   deleteComment(row).then(response => {
    //     this.$notify({
    //       title: '成功',
    //       message: '删除成功',
    //       type: 'success',
    //       duration: 2000
    //     })
    //     const index = this.list.indexOf(row)
    //     this.list.splice(index, 1)
    //   })
    // },

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
    // handleDownload() {
    //   this.downloadLoading = true
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['评论ID', '用户ID', '商品ID', '评论', '评论图片列表', '评论时间']
    //     const filterVal = ['id', 'userId', 'valueId', 'content', 'picUrls', 'addTime']
    //     excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品评论信息')
    //     this.downloadLoading = false
    //   })
    // }
  }
}
</script>
