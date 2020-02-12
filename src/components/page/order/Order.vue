<template>
    <div class="table">

        <div class="container">
            <div class="handle-box">
                <!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->
                <el-select v-model="select_cate" placeholder="请选择订单状态" class="handle-select mr10" @change="selectOne">
                  <el-option v-for="(key, value) in statusMap" :key="key" :label="key" :value="value"/>
                </el-select>
                <el-input v-model="select_word" placeholder="请输入订单编号" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">查询</el-button>
                <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="exportExcel">导出</el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
                <!--<el-table-column type="selection" width="55" align="center"></el-table-column>-->
                <el-table-column align="center" min-width="100" label="订单编号" prop="orderNo"/>
                <el-table-column align="center" label="用户ID" prop="wechatUserId"/>
                <el-table-column align="center" label="订单金额" prop="needPrice"/>
                <el-table-column align="center" label="支付金额" prop="payPrice"/>
                <el-table-column prop="createTime" label="日期" sortable width="180" :formatter="timestampToTime">
                </el-table-column>
                <el-table-column align="center" label="订单状态" prop="status">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status | statusFilter">{{scope.row.status | orderStatusFilter }}</el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="操作" width="180" align="center">

                      <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
                        <el-button v-if="scope.row.status==2" type="success" size="mini" @click="handleShip(scope.row)">发货</el-button>
                        <el-button v-if="scope.row.status==7" type="warning" size="mini" @click="handleRefund(scope.row)">同意退款</el-button>
                      </template>

                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="total" :page-size="10"
                               :current-page="pageNum" >
                </el-pagination>
            </div>
        </div>

      <!-- 订单详情对话框 -->
      <el-dialog :visible.sync="orderDialogVisible"  title="订单详情" width="800">

        <el-form :data="orderDetail" label-position="left" id="orderDetail">
          <el-form-item label="订单编号">
            <span>{{ orderDetail.orderNo }}</span>
          </el-form-item>
          <el-form-item label="订单状态">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status | statusFilter">{{ orderDetail.status | orderStatusFilter }}</el-tag>
            </template>
          </el-form-item>
         <el-form-item label="收货信息">
            <span>（收货人）{{address.name}}</span>
            <span>（手机号）{{address.mobile}}</span>
            <span>（地址）{{address.address}} {{address.detailAddr}}</span>
          </el-form-item>
          <el-form-item label="商品信息">
            <el-table :data="orderDetail.orderGoodsList" size="small" border fit highlight-current-row>
              <el-table-column align="center" label="商品名称" prop="goodsName" />
              <el-table-column align="center" label="商品编号" prop="id" />
              <el-table-column align="center" label="货品价格" prop="price" />
              <el-table-column align="center" label="货品数量" prop="counts" />
              <el-table-column align="center" label="货品图片" prop="mainPic">

                <template slot-scope="scope">
                  <viewer :images="picArr"><!-- viewer插件放大图片-->
                  <img :src="baseUrl+scope.row.mainPic" width="40">
                  </viewer>
                </template>

              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="费用信息">
          <span>
            <br/>

             商品总价：{{ orderDetail.totalPrice }}元 <br/>
             运费：{{ orderDetail.freight }}元<br/>
             实付：{{ orderDetail.payPrice }}元
           </span>

          </el-form-item>


          <!--<el-form-item label="收货信息">-->
            <!--<span v-if="scope.row.status==4||scope.row.status==5" :formatter="timestampToTime">（确认收货时间）{{ orderDetail.createTime }}</span>-->
          <!--</el-form-item>-->
        </el-form>
        <el-button  v-print="'#orderDetail'">打印</el-button >
      </el-dialog>



        <!--&lt;!&ndash; 删除提示框 &ndash;&gt;-->
        <!--<el-dialog title="提示" :visible.sync="delVisible" width="300px" center>-->
            <!--<div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>-->
            <!--<span slot="footer" class="dialog-footer">-->
                <!--<el-button @click="delVisible = false">取 消</el-button>-->
                <!--<el-button type="primary" @click="deleteRow">确 定</el-button>-->
            <!--</span>-->
        <!--</el-dialog>-->
    </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  const statusTagMap = {
    1: 'info',
    // 2: 'warning',
    3: 'info',
    4: 'info',
    5: 'success',
    6: 'danger',
    7: 'warning',
    8: 'danger',
    9: 'danger',

  }

 const statusMap = {
      0: '全部',
      1: '待付款',
      2: '待发货',
      3: '待收货',
      4: '待评价',
      5: '已完成',
      6: '已取消(系统)',
      7: '申请退款',
      8.:'已退款',
      9: '已取消(用户)',
  }
    export default {
        name: 'basetable',
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

                baseUrl: this.GLOBAL.serverSrc,
                tableData: [],
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                is_search: false,
                editVisible: false,
                delVisible: false,
                downloadLoading: false,
                statusMap,
                total:0,
                pageNum:1,
                pageSize:10,
                orderDialogVisible: false,
                orderDetail: {
                 orderGoodsList: []
                },
                picArr:[],
                address:{},
                form: {
                    name: '',
                    date: '',
                    address: ''
                },
                idx: -1
            }
        },
        created() {
            this.getData();
        },
        computed: {
            data() {
                return this.tableData.filter((d) => {
                    let is_del = false;
                    for (let i = 0; i < this.del_list.length; i++) {
                        if (d.name === this.del_list[i].name) {
                            is_del = true;
                            break;
                        }
                    }
                    if (!is_del) {
                        if (d.address.indexOf(this.select_cate) > -1 &&
                            (d.name.indexOf(this.select_word) > -1 ||
                                d.address.indexOf(this.select_word) > -1)
                        ) {
                            return d;
                        }
                    }
                })
            }
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {

              if(this.select_cate!=''&&this.select_cate!=0){

                this.pageNum = val;
                this.getDataByStatus(this.select_cate);
              }

              else{
                this.pageNum = val;
                this.getData();
              }
            },

            selectOne(){
               this.getDataByStatus(this.select_cate);
               if(this.select_cate==0){
                 this.getData();
               }
            },
            // 获取订单数据
            getData() {
              let token = sessionStorage.getItem('token');
              let userId = sessionStorage.getItem('userId');
              const params = new URLSearchParams();
              params.append('token', token);
              params.append('userId', userId);
              params.append('pageNum', this.pageNum);
              params.append('pageSize', this.pageSize);
              this.$axios.post('/apis/order/getOrderBySellerId', params
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

                  }


                }
              })
                .catch(function (error) {
                  console.log(error)

                })
            },

          // 根据订单状态获取订单数据
          getDataByStatus(status) {
            let token = sessionStorage.getItem('token');
            let userId = sessionStorage.getItem('userId');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('userId', userId);
            params.append('status', status);
            params.append('pageNum', this.pageNum);
            params.append('pageSize', this.pageSize);
            this.$axios.post('/apis/order/selectOrderByStatus', params
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
                  console.log(response)
                }


              }
            })
              .catch(function (error) {
                console.log(error)

              })
          },

          // 根据订单编号获取订单数据
          getDataByNo(orderNo) {
            let token = sessionStorage.getItem('token');
            let userId = sessionStorage.getItem('userId');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('userId', userId);
            params.append('orderNo', orderNo);
            params.append('pageNum', this.pageNum);
            params.append('pageSize', this.pageSize);
            this.$axios.post('/apis/order/selectOrderByNo', params
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
                  console.log(response)
                }


              }
            })
              .catch(function (error) {
                console.log(error)

              })
          },

           //获取订单详情
            getOrderDetail(id){
              let userId = sessionStorage.getItem('userId');
              let token = sessionStorage.getItem('token');
              const params = new URLSearchParams();
              params.append('token', token);
              params.append('userId', userId);
              params.append('orderId', id);
              this.$axios.post('/apis/order/getOrderById', params
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
                    let arrPic = response.data.orderGoodsList;
                    let picArr=[]
                    //获取图片数组用于放大
                    for(let i=0;i<arrPic.length;i++){
                       picArr.push(arrPic[i].mainPic);
                     }
                    this.orderDetail=response.data;
                    this.orderDialogVisible = true;
                    this.picArr=picArr;
                    this.address=JSON.parse(response.data.snapAddr);
                    console.log(this.address);
                 }



                }
              })
                .catch(function (error) {
                  console.log(error)

                })

            },

          /**
           * 搜索
           */
          search() {
                this.is_search = true;
                this.getDataByNo(this.select_word);
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleEdit(index, row) {
                this.idx = index;
                const item = this.tableData[index];
                this.form = {
                    name: item.name,
                    date: item.date,
                    address: item.address
                }
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.idx = index;
                this.delVisible = true;
            },
            delAll() {
                const length = this.multipleSelection.length;
                let str = '';
                this.del_list = this.del_list.concat(this.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += this.multipleSelection[i].name + ' ';
                }
                this.$message.error('删除了' + str);
                this.multipleSelection = [];
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            // 确定删除
            deleteRow(){
                this.tableData.splice(this.idx, 1);
                this.$message.success('删除成功');
                this.delVisible = false;
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
          //点击详情按钮
          handleDetail(row) {
            //调用获取订单详情方法
            this.getOrderDetail(row.id);

          },
          //点击发货按钮
          handleShip(row) {

            let token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('orderNo', row.orderNo);
           this.$axios.post('/apis/order/sendGoods', params
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
                    message: '发货成功',
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

          //点击退款按钮
          handleRefund(row) {

            let token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('orderNo', row.orderNo);
            this.$axios.post('/apis/order/agreeRefund', params
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
                    message: '退款成功',
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
         //导出excel
          exportExcel() {
            /* generate workbook object from table */
            var wb = XLSX.utils.table_to_book(document.querySelector('.table'))
            /* get binary string as output */
            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
            try {
              FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'sheetjs.xlsx')
            } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
            this.downloadLoading = false
            return wbout
          },


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
