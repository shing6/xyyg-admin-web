<template>
  <div class="container">

    <!-- 查询和其他操作 -->
    <div class="handle-box">
      <el-button type="danger" icon="delete" class="handle-del mr10" @click="centerDialogVisible = true">删除</el-button>
      <el-input v-model="select_word" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品名称"/>
      <el-select v-model="select_cate" placeholder="请选择商品分类" class="handle-select mr10" @change="selectOne">
        <el-option v-for="item in categoryList" :key="item.id" :label="item.categoryName" :value="item.id"/>
      </el-select>
     <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <!--<el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>-->
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="tableData" @selection-change="selsChange" size="small" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="table-expand">
            <el-form-item label="商品详情图">
              <viewer :images="props.row.goodsPictureList.picAddr">
              <img v-for="pic in props.row.goodsPictureList" :key="pic.id" :src="baseurl+pic.picAddr" class="gallery">
              </viewer>
            </el-form-item>
            <el-form-item label="商品参数">
              <span v-for="attr in props.row.goodsDescList" :key="attr.id" >{{attr.name}}:{{attr.detail}} &nbsp; &nbsp; &nbsp; </span>
            </el-form-item>

            <el-form-item label="所属分类">
              <span>{{categoryFilter( props.row.categoryId)}}</span>
            </el-form-item>

          </el-form>
        </template>
      </el-table-column>

      <el-table-column align="center" label="商品编号" prop="id"/>

      <el-table-column align="center" min-width="100" label="名称" prop="goodsName"/>

      <el-table-column align="center" property="iconUrl" label="图片">
        <template slot-scope="scope">
          <viewer :images="tableData.mainPic">
          <img v-if="scope.row.mainPic" :src="baseurl+scope.row.mainPic" width="40">
          </viewer>
        </template>
      </el-table-column>


      <el-table-column align="center" label="原价" prop="oldPrice"/>
      <el-table-column align="center" label="折扣价格" prop="price"/>
      <el-table-column align="center" label="库存" prop="stock"/>

       <el-table-column align="center" label="商品状态" prop="isOnSale">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'success' : 'error' ">{{ scope.row.status ? '销售中' : '已下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否上架" >
        <template slot-scope="scope">
        <el-switch

          active-color="#13ce66" @change="changeStatus(scope.row)"
          v-model="scope.row.status"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0">
        </el-switch>
        </template>
      </el-table-column>
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

<style>
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

<script>



export default {
  name: 'goodsList',
  computed:{
    categoryFilter() {
      return function (id) {
        for(let i=0;i<this.categoryList.length;i++){
          if(id==this.categoryList[i].id){
            return this.categoryList[i].categoryName
          }
        }
      }

    }
  },
  data() {
    return {
      value5:true,
      baseurl:this.GLOBAL.serverSrc,
      list: [],
      total: 0,
      listLoading: true,
      select_word:'',
      select_cate: '',
      goodsDetail: '',
      detailDialogVisible: false,
      centerDialogVisible : false,
      downloadLoading: false,
      tableData:[],
      pageNum:0,
      pageSize:10,
      categoryList:[]
    }
  },
  created() {
    this.getData()
    this.initCatagory()
  },
  methods: {
    // 分页导航
    handleCurrentChange(val) {
      if(this.select_cate!=''){
        this.pageNum = val-1;
        this.getDataByStatus(this.select_cate);
        this.pageNum = val;
      }
      else{
        this.pageNum = val-1;
        this.getData();
        this.pageNum = val;
      }

    },

    selectOne(){
      this.getDataByCategoryId(this.select_cate);
      if(this.select_cate==0){
        this.getData();
      }
    },
    changeStatus(row){

      const params = new URLSearchParams();
      let token = sessionStorage.getItem('token');
      params.append('token', token);
      params.append('goods', JSON.stringify(row));
      this.$axios.post('/apis/goods/updateGoodsStatus', params
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


          }
          else{
            this.$message({
              message: '修改失败',
              type: 'failed'
            })

          }


        }
      })
        .catch(function (error) {

          this.listLoading = false
        })

    },
    // 获取商品数据
    getData() {

      this.listLoading = true
      let token = sessionStorage.getItem('token');
      let userId = sessionStorage.getItem('userId');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('userId', userId);
      params.append('pageNum', this.pageNum);
      params.append('pageSize', this.pageSize);
      this.$axios.post('/apis/goods/getGoodsBySellerId', params
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

    // 根据分类分页查询商品数据
    getDataByCategoryId(categoryId) {

      this.listLoading = true
      let token = sessionStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('categoryId', categoryId);
      params.append('pageNum', this.pageNum);
      params.append('pageSize', this.pageSize);
      this.$axios.post('/apis/goods/getGoodsByCategory', params
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
    // 模糊查询商品数据
    getDataByName(name) {

      this.listLoading = true
      let token = sessionStorage.getItem('token');
      let userId = sessionStorage.getItem('userId');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('userId', userId);
      params.append('goodsName', name);
      params.append('pageNum', this.pageNum);
      params.append('pageSize', this.pageSize);
      this.$axios.post('/apis/goods/selectGoodsByName', params
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

    /**
     * 获取分类
     */
    initCatagory: function() {
      let token = sessionStorage.getItem('token');
      let userId = sessionStorage.getItem('userId');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('userId', userId);
      this.$axios.post('/apis/category/getCategoryById', params).then((response) => {
        if (response.status === 200) {
          this.categoryList=response.data;

        }
      })
        .catch(function (error) {
          console.log(error)

        })
    },

    handleFilter() {
      this.select_cate=""
      this.pageNum = 0;
      this.getDataByName(this.select_word);
    },
    handleCreate() {
      this.$router.push({ path: '/createGoods' })
    },
    handleUpdate(row) {
      this.$router.push({ path: '/editGoods', query: { id: row.id }})
    },
    showDetail(detail) {
      this.goodsDetail = detail
      this.detailDialogVisible = true
    },
    handleDelete(row) {
      deleteGoods(row).then(response => {
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    //批量删除
    delAll(){
      this.listLoading = true;
      var id = this.sels.map(item => item.id).join()
      var ids=[]
      ids.push(id);
      let token = sessionStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('ids', ids);
      this.$axios.post('/apis/goods/deleteGoodsByIds', params
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

    //监听多选框
    selsChange(sels) {
      //被选中的行组成数组
      this.sels = sels;
      //console.log(this.sels.id)
    },


    // handleDownload() {
    //   this.downloadLoading = true
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['商品编号', '名称', '原价', '折扣价格', '库存']
    //     const filterVal = ['id', 'goodsSn', 'name', 'counterPrice', 'retailPrice', 'isNew', 'isHot', 'isOnSale', 'listPicUrl', 'gallery', 'brief', 'detail', 'picUrl', 'goodsUnit', 'keywords', 'categoryId', 'brandId']
    //     excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
    //     this.downloadLoading = false
    //   })
    // }
  }
}
</script>
