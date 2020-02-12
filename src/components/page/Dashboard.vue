<template>
    <div class="dashboard-editor-container">
      <div class="openswitch" >
        <el-switch
          v-model="svalue"
          active-color="#13ce66"
         inactive-color="#ff4949"
          @change="changeStatus()"
        >
        </el-switch>
        <svg-icon  v-if="status==3" icon-class="dayangle" style="width: 150px;height: 100px" />

      </div>
      <div class="openswitch" >
        <svg-icon  v-if="status==2" icon-class="signopen" style="width: 100px;height: 50px" />
      </div>
      <!-- 营业logo -->



        <el-row :gutter="40" class="panel-group">
            <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
                <div class="card-panel" @click="handleEditLowPrice()">
                    <div class="card-panel-icon-wrapper icon-people">
                        <svg-icon icon-class="money" class-name="card-panel-icon" />
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">起送费</div>
                        <count-to :start-val="0" :end-val="lowPrice" :duration="2600" class="card-panel-num"/>
                    </div>
                </div>
            </el-col>
            <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
                <div class="card-panel" @click="handleEditFreight()">
                    <div class="card-panel-icon-wrapper icon-message">
                        <svg-icon icon-class="money" class-name="card-panel-icon" />
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">配送费</div>
                        <count-to :start-val="0" :end-val="freight" :duration="3000" class="card-panel-num"/>
                    </div>
                </div>
            </el-col>
            <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
                <div class="card-panel" @click="">
                    <div class="card-panel-icon-wrapper icon-money">
                        <svg-icon icon-class="shangpin" class-name="card-panel-icon" />
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">商品数量</div>
                        <count-to :start-val="0" :end-val="goodsCount" :duration="3200" class="card-panel-num"/>
                    </div>
                </div>
            </el-col>
            <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
                <div class="card-panel" @click="">
                    <div class="card-panel-icon-wrapper icon-shoppingCard">
                        <svg-icon icon-class="order" class-name="card-panel-icon" />
                    </div>
                    <div class="card-panel-description">
                        <div class="card-panel-text">订单数量</div>
                        <count-to :start-val="0" :end-val="orderCount" :duration="3600" class="card-panel-num"/>
                    </div>
                </div>
            </el-col>
        </el-row>

      <div class="schart-box">
       <div class="content-title">营业额</div>
        <div class="block">

          <el-date-picker
            v-model="selectyear"
            type="year"
            @change="changeYear"
            placeholder="选择年">
          </el-date-picker>
          <span class="demonstration">年</span>
        </div>
        <schart class="schart" canvasId="line" :data="data1"  type="line" :options="options2"></schart>

      </div>


      <!-- 修改起送费 -->
      <el-dialog :visible.sync="editlowPriceFormVisible" title="修改起送费">
        <el-form ref="editlowPriceForm" :rules="rules" :model="editlowPriceForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
          <el-form-item label="起送费" prop="content">
            <el-input  v-model="editlowPriceForm.content" type="text"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editlowPriceFormVisible = false">取消</el-button>
          <el-button type="primary" @click="editLowPrice">确定</el-button>
        </div>
      </el-dialog>

      <!-- 修改配送费 -->
      <el-dialog :visible.sync="editFreightFormVisible" title="修改配送费">
        <el-form ref="editFreightForm" :rules="rules" :model="editFreightForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
          <el-form-item label="配送费" prop="content">
            <el-input  v-model="editFreightForm.content" type="text"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editFreightFormVisible = false">取消</el-button>
          <el-button type="primary" @click="editFreight">确定</el-button>
        </div>
      </el-dialog>


    </div>
</template>

<script>
    import Schart from 'vue-schart';
    import CountTo from 'vue-count-to';
    import bus from '../common/bus';
    export default {
        name: 'dashboard',
        data() {
            return {
                name: localStorage.getItem('ms_username'),
                lowPrice: 0,
                freight: 0,
                goodsCount: 0,
                orderCount: 0,
                value55: '',
                year:'',
                selectyear:'',
                data1:[],
                svalue: true,
                status:null,
              rules: {
                content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
              },
              options2: {
                title: '月营业额',
                bgColor: '#fff',
                titleColor: '#666',
                fillColor: '#36A3F7',
                contentColor: '#ccc'
               },

              editlowPriceForm: {
                id:0,
                content: 0
              },
              editlowPriceFormVisible: false,

              editFreightForm: {
                id:0,
                content: 0
              },
              editFreightFormVisible: false,

            }
        },
        components: {
            Schart,
            CountTo
        },

         created(){
             this.getMoney()
             this.getData()
             this.getCount()

         },

         methods: {
           changeYear(){
             console.log(this.selectyear.getFullYear())
             this.year=this.selectyear.getFullYear()
             this.getMoney()
           },
           getData(){
             let token = sessionStorage.getItem('token');
             let userId = sessionStorage.getItem('userId');
             const params = new URLSearchParams();
             params.append('token', token);
             params.append('userId', userId);
            this.$axios.post('/apis/shop/getShopByUserId', params
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
                      this.freight = response.data.freight;
                      this.lowPrice = response.data.lowPrice;
                      this.editlowPriceForm.content=response.data.lowPrice
                      this.editFreightForm.content=response.data.freight
                      this.status=response.data.status
                      if(response.data.status==2){
                        this.svalue=true;
                      }
                     if(response.data.status==3){
                        this.svalue=false;
                     }
                 }


               }
             })
               .catch(function (error) {


               })
           },

           getCount(){
             let token = sessionStorage.getItem('token');
             let userId = sessionStorage.getItem('userId');
             const params = new URLSearchParams();
             params.append('token', token);
             params.append('userId', userId);
             this.$axios.post('/apis/shop/getCount', params
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
                   this.orderCount = response.data.orderCount;
                   this.goodsCount = response.data.goodsCount;
                 }


               }
             })
               .catch(function (error) {


               })
           },
           //获取营业额
           getMoney(){
             if(this.year==""){
               var date = new Date();
               this.year=date.getFullYear();
             }
             this.options2.title=this.year+'年 月营业额'
             let token = sessionStorage.getItem('token');
             let userId = sessionStorage.getItem('userId');
             const params = new URLSearchParams();
             params.append('token', token);
             params.append('userId', userId);
             params.append('year', this.year);
             this.$axios.post('/apis/shop/getShopMoneyByYear', params
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
                   let redata =response.data;


                   this.data1=[
                     {name:'1',value:0},
                     {name:'2',value:0},
                     {name:'3',value:0},
                     {name:'4',value:0},
                     {name:'5',value:0},
                     {name:'6',value:0},
                     {name:'7',value:0},
                     {name:'8',value:0},
                     {name:'9',value:0},
                     {name:'10',value:0},
                     {name:'11',value:0},
                     {name:'12',value:0}

                   ]
                   this.data1[0].value =  redata.value1
                   this.data1[1].value =  redata.value2
                   this.data1[2].value =  redata.value3
                   this.data1[3].value =  redata.value4
                   this.data1[4].value =  redata.value5
                   this.data1[5].value =  redata.value6
                   this.data1[6].value =  redata.value7
                   this.data1[7].value =  redata.value8
                   this.data1[8].value =  redata.value9
                   this.data1[9].value =  redata.value10
                   this.data1[10].value =  redata.value11
                   this.data1[11].value =  redata.value12

                 }


               }
             })
               .catch(function (error) {
                   console.log(error)

               })
           },

           handleEditLowPrice(){
             this.editlowPriceFormVisible = true;

           },
           //修改配送费
           editLowPrice(){
             this.$refs['editlowPriceForm'].validate((valid) => {
               if (valid) {
                 let token = sessionStorage.getItem('token');
                 let userId = sessionStorage.getItem('userId');
                 const params = new URLSearchParams();
                 params.append('token', token);
                 params.append('userId', userId);
                 params.append('lowPrice', this.editlowPriceForm.content);
                 this.$axios.post('/apis/shop/updateLowPrice', params
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
                         type: 'success'
                       })
                       this.editlowPriceFormVisible = false
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
           handleEditFreight(){
             this.editFreightFormVisible = true;

           },
           //修改运费
           editFreight(){
             this.$refs['editFreightForm'].validate((valid) => {
               if (valid) {
                 let token = sessionStorage.getItem('token');
                 let userId = sessionStorage.getItem('userId');
                 const params = new URLSearchParams();
                 params.append('token', token);
                 params.append('userId', userId);
                 params.append('freight', this.editFreightForm.content);
                 this.$axios.post('/apis/shop/updateFreight', params
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
                         type: 'success'
                       })
                       this.editFreightFormVisible = false
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

           //商家开门或打烊
           changeStatus(){
             let status=0;
             if(this.svalue){
              status=2;
             }
             else{
               status=3;
             }

             let token = sessionStorage.getItem('token');
             let userId = sessionStorage.getItem('userId');
             const params = new URLSearchParams();
             params.append('token', token);
             params.append('userId', userId);
             params.append('status', status);
             this.$axios.post('/apis/shop/openShop', params
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
                     type: 'success'
                   })

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
           }

         }
    }

</script>

<style  scoped>
    .dashboard-editor-container .chart-wrapper {
        background: #fff;
        padding: 16px 16px 0;
        margin-bottom: 32px;
    }
    .dashboard-editor-container {
        padding: 32px;
        background-color: rgb(240, 242, 245);

    }
    .panel-group .card-panel-col{
        margin-bottom: 32px;
    }
    .card-panel:hover .card-panel-icon-wrapper {
        color: #fff;
    }
    .card-panel:hover  .icon-people {
        background: #40c9c6;
    }
    .card-panel:hover .icon-message {
        background: #36a3f7;
    }
    .card-panel:hover .icon-money {
        background: #f4516c;
    }
    .card-panel:hover .icon-shoppingCard {
        background: #34bfa3
    }

    .icon-people {
        color: #40c9c6;
    }
    .icon-message {
        color: #36a3f7;
    }
    .icon-money {
        color: #f4516c;
    }
    .icon-shoppingCard {
        color: #34bfa3
    }
    .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;

    }

    .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
    }
    .card-panel-icon {
        float: left;
        font-size: 48px;
    }

    .card-panel-description .card-panel-text {

        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
    }
    .card-panel-description .card-panel-num {
        font-size: 20px;
    }

    .card-panel {
        height: 108px;
        cursor: pointer;
        font-size: 12px;
        position: relative;
        overflow: hidden;
        color: #666;
        background: #fff;
        box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
        border-color: rgba(0, 0, 0, .05);




    }
    .panel-group {
        margin-top: 18px;



    }

    .schart-box{

      display: inline-block;

      margin: 20px;

    }

    .schart{

      width: 500px;

      height: 400px;

    }

    .content-title{

      clear: both;

      font-weight: 400;

      line-height: 50px;

      margin: 10px 0;

      font-size: 22px;

      color: #1f2f3d;

    }
  .block{
    margin-bottom: 10px;
  }
</style>
