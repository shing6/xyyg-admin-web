<template>
  <div class="table">

    <div class="container">
      <div class="handle-box">
        <!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->

        <!--<el-input v-model="select_word" placeholder="请输入订单编号" class="handle-input mr10"></el-input>-->
        <!--<el-button type="primary" icon="search" @click="search">搜索</el-button>-->
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" >
        <!--<el-table-column type="selection" width="55" align="center"></el-table-column>-->
        <el-table-column align="center" min-width="100" label="商家编号" prop="shop.id"/>
        <el-table-column align="center" label="商家名称" prop="shop.name"/>
        <el-table-column align="center" property="iconUrl" label="商家店面图">
          <template slot-scope="scope">
             <viewer :images="picArr">
              <img v-if="scope.row.shop.logoPic" :src="baseUrl + scope.row.shop.logoPic" width="40">
             </viewer>
          </template>
        </el-table-column>
        <!--<el-table-column align="center" label="起送费" prop="lowPrice"/>-->
        <!--<el-table-column align="center" label="配送费" prop="freight"/>-->
        <el-table-column align="center" label="商家地址" prop="shop.address"/>
        <el-table-column align="center" label="详细地址" prop="shop.detailAddr"/>
        <el-table-column align="center" label="提交人" prop="name"/>
        <el-table-column align="center" label="联系方式" prop="phone"/>
        <el-table-column align="center" label="所属分类" prop="status">
          <template slot-scope="scope">
           {{categoryFilter(scope.row.shop.sellerCategoryId)}}
          </template>
        </el-table-column>
        <el-table-column prop="shop.createTime" label="提交时间" sortable width="180" :formatter="timestampToTime">
        </el-table-column>

        <el-table-column align="center" label="审核状态" prop="status">
          <template slot-scope="scope">
            <el-tag :type="scope.row.shop.status | statusFilter">{{scope.row.shop.status | shopStatusFilter }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center">

          <template slot-scope="scope">
            <el-button v-if="scope.row.shop.status==0||scope.row.shop.status==1" type="success" size="mini" @click="handlePass(scope.row.shop)">批准</el-button>
            <el-button v-if="scope.row.shop.status==1" type="warning" size="mini" @click="handleShip(scope.row.shop)">拒绝</el-button>
            <el-button v-if="scope.row.shop.status==2||scope.row.shop.status==3" type="danger" size="mini" @click="handleClose(scope.row.shop)">关闭商家</el-button>
          </template>

        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="10"
                       :current-page="pageNum" >
        </el-pagination>
      </div>
      <!-- 不批准理由 -->
      <el-dialog :visible.sync="replyFormVisible" title="理由">
        <el-form ref="replyForm" :rules="rules" :model="replyForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
          <el-form-item label="不通过理由" prop="content">
            <el-input :autosize="{ minRows: 4, maxRows: 8}" v-model="replyForm.content" type="textarea"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="replyFormVisible = false">取消</el-button>
          <el-button type="primary" @click="reply">确定</el-button>
        </div>
      </el-dialog>

      <!-- 关闭理由 -->
      <el-dialog :visible.sync="closeFormVisible" title="理由">
        <el-form ref="closeForm" :rules="rules" :model="closeForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
          <el-form-item label="关闭理由" prop="content">
            <el-input :autosize="{ minRows: 4, maxRows: 8}" v-model="closeForm.content" type="textarea"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeFormVisible = false">取消</el-button>
          <el-button type="primary" @click="close">确定</el-button>
        </div>
      </el-dialog>

    </div>





  </div>
</template>

<script>
  const statusTagMap = {
    0:'danger',
    1: 'warning',
    2: 'success',
    3: 'success',


  }
  const statusMap = {
    0: '未通过',
    1: '待审核',
    2: '已通过',
    3: '已通过',

  }

  export default {
    name: 'shop',
    filters: {
      shopStatusFilter(status) {
        return statusMap[status]
      },
      statusFilter (status) {
        return statusTagMap[status]
      },


    },
    computed:{
      categoryFilter() {
        return function (id) {
          for(let i=0;i<this.categoryMap.length;i++){
            if(id==this.categoryMap[i].id){
              return this.categoryMap[i].name
            }
          }
        }


      }
    },
     data() {
      return {

        baseUrl: this.GLOBAL.serverSrc,
        tableData: [],
        delVisible: false,
        total:0,
        pageNum:1,
        pageSize:10,
        picArr:[],
        idx: -1,
        categoryMap : [],
        replyForm: {

          content: ''
        },
        replyFormVisible: false,

        closeForm: {

          content: ''
        },
        closeFormVisible: false,
        rules: {
          content: [{ required: true, message: '回复理由不能为空', trigger: 'blur' }],
        },
        shopId:0
      }
    },
    created() {
      this.getData();
      this.getCategoryData()
    },

    methods: {
      // 分页导航
      handleCurrentChange(val) {
        this.pageNum = val;
        this.getData();
      },
      // 获取商家数据
      getData() {
        let token= sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('pageNum', this.pageNum);
        params.append('pageSize', this.pageSize);
        this.$axios.post('/apis/user/getUserWithShop',params
        ).then((response) => {
          if (response.status === 200) {
               let numberOneValue = Number(response.headers['x-total-count']);
               this.total=numberOneValue;

              this.tableData=response.data;

          }
        })
          .catch(function (error) {
            console.log(error)

          })
      },
// 获取商家分类数据
      getCategoryData() {

        this.$axios.get('/apis/category/getShopCategory'
        ).then((response) => {
          if (response.status === 200) {
            this.categoryMap = response.data;
          }
        })
          .catch(function (error) {
          })

      },
      search() {
        this.is_search = true;
      },
      formatter(row, column) {
        return row.address;
      },
      filterTag(value, row) {
        return row.tag === value;
      },






      //时间格式化

      timestampToTime (row, column) {
        var date = new Date(row.shop.createTime) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-'
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        var D = date.getDate() + ' '
        var h = date.getHours() + ':'
        var m = date.getMinutes() + ':'
        var s = date.getSeconds()
        return Y+M+D+h+m+s

      },



      //审核通过
      handlePass(row) {

        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('id', row.id);
        params.append('isPass', 1);
        this.$axios.post('/apis/shop/auditing', params
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
            else if(response.data.errno==0){
              this.$message({
                message: '已审核通过',
                type: 'success'
              })
              this.getData();

            }


          }
        })
          .catch(function (error) {
            console.log(error)

          })

      },
      reply(){
        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('id', this.shopId);
        params.append('text', this.replyForm.content);
        params.append('isPass', 0);
        this.$axios.post('/apis/shop/auditing', params
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
            else if(response.data.errno==0){
              this.$message({
                message: '已拒绝商家',
                type: 'success'
              })
              this.replyFormVisible=false
              this.getData();

            }


          }
        })
          .catch(function (error) {
            console.log(error)

          })
       },
      //审核未通过
      handleShip(row){
        this.replyFormVisible = true;
        this.shopId=row.id
      },
      //关闭商家
      handleClose(row){
        this.closeFormVisible = true;
        this.shopId=row.id
      },
      //关闭商家
      close(){
        let token = sessionStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('id', this.shopId);
        params.append('text', this.closeForm.content);
        params.append('isPass', 2);
        this.$axios.post('/apis/shop/auditing', params
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
            else if(response.data.errno==0){
              this.$message({
                message: '已关闭商家',
                type: 'success'
              })
              this.closeFormVisible=false
              this.getData();

            }


          }
        })
          .catch(function (error) {
            console.log(error)

          })
      }

    }
  }

</script>

<style scoped>
  .handle-box {
    margin-bottom: 20px;
  }

  .handle-select {
    width: 150px;
  }

  .handle-input {
    width: 300px;
    display: inline-block;
  }
  .del-dialog-cnt{
    font-size: 16px;
    text-align: center
  }
  .table{
    width: 100%;
    font-size: 14px;
  }
  .red{
    color: #ff0000;
  }
  .pagination{
    padding: 32px 16px;
  }
</style>
