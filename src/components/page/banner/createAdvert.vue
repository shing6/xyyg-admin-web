<template>
  <div class="container" style="height: 500px;">



      <el-form ref="banner" :rules="rules"  :model="banner" >


        <el-form-item label="轮播图片" prop="picAddr" >
          <el-upload v-model="banner.picAddr"
                     action="apis/file/uploadGoods"
                     :show-file-list="false"
                     :on-success="uploadPicUrl"
                     class="avatar-uploader"
                     accept=".jpg,.jpeg,.png,.gif" >
            <img v-if="banner.picAddr" :src="baseUrl+banner.picAddr" class="avatar" >
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>

        <el-form-item label="跳转链接" prop="toUrl"  >
          <el-input v-model="goodsId"/>
        </el-form-item>

      </el-form>



    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePublish">添加</el-button>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'createAdvert',
    data() {
      return {
        baseUrl:this.GLOBAL.serverSrc,
        goodsId:"",
        banner:{
          picAddr:"",
          toUrl:"../products-item/products-item?id=",
        },
       rules: {
         picAddr: [{ required: true, message: '图片不能为空', trigger: 'blur' }],
        },

      }
    },

    methods:{

      //取消
      handleCancel: function() {
        this.$router.push({ path: '/banner/advertList' })
      },
      //添加轮播图
      handlePublish: function() {

        this.$refs['banner'].validate((valid) => {
          if (valid) {
            let token = sessionStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('toUrl', this.banner.toUrl+this.goodsId);
            params.append('picAddr', this.banner.picAddr);
           this.$axios.post('/apis/banner/insertBanner', params
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
                  // this.$router.push({name: 'activity'})
                  this.$router.push('advertList');
                  return;
                }
                else{
                  this.$message({
                    message: '添加失败',
                    type: 'failed'
                  })
                  this.$router.push({ path: '/banner/advertList' })

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

      uploadPicUrl: function(response) {
        this.banner.picAddr = response

      },
    }
  }
</script>

<style scoped>

  .avatar-uploader el-upload {
    width: 145px;
    height: 145px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload{

  }
  .avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }

  .avatar {
    width: 145px;
    height: 145px;
    display: block;
  }
  .op-container{
      float: right;
      display: block;
      margin-bottom: 50px;
  }
  .avatar-uploader .el-upload--text{
    width: 145px;
    height: 145px;
  }

</style>
