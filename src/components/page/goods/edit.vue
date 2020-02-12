<template>
  <div class="container">

    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goods" :rules="rules" :model="goods" label-width="150px">

        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="goods.goodsName"/>
        </el-form-item>
        <el-form-item label="原价" prop="oldPrice">
          <el-input v-model="goods.oldPrice" placeholder="0.00">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="折扣价格" prop="price">
          <el-input v-model="goods.price" placeholder="0.00">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>

        <el-form-item label="是否在售" prop="status">
          <el-radio-group v-model="goods.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="商品图片" prop="mainPic">
          <el-upload v-model="goods.mainPic"
                     action="apis/file/uploadGoods"
                     :show-file-list="false"
                     :on-success="uploadPicUrl"
                     class="avatar-uploader"
                     accept=".jpg,.jpeg,.png,.gif">
            <img v-if="goods.mainPic" :src="this.GLOBAL.serverSrc+goods.mainPic" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品详情图片">
          <el-upload
            action="apis/file/uploadGoods"
            :limit="5"
            :file-list="pictureListUrl"
            :on-exceed="uploadOverrun"
            :on-success="handleGalleryUrl"
            :on-remove="handleRemove"
            multiple
            accept=".jpg,.jpeg,.png,.gif"
            list-type="picture-card">
            <i class="el-icon-plus"/>
          </el-upload>
        </el-form-item>



        <el-form-item label="商品库存" prop="stock">
          <el-input v-model="goods.stock" />
        </el-form-item>

        <el-form-item label="所属分类" prop="categoryName">
          <el-select   v-model="goods.categoryName" placeholder="请选择所属分类">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>商品参数</h3>
      <el-button :plain="true" type="primary" @click="handleAttributeShow">添加</el-button>
      <el-table :data="goods.goodsDescList">
        <el-table-column property="id" v-if="show"/>
        <el-table-column property="name" label="商品参数名称"/>
        <el-table-column property="detail" label="商品参数值"/>
        <el-table-column align="center" label="操作" width="100" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleAttributeDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="attributeVisiable" title="设置商品参数">
        <el-form
          ref="attributeForm"
          :model="attributeForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left:50px;">
          <el-form-item label="商品参数名称" prop="name">
            <el-input v-model="attributeForm.name"/>
          </el-form-item>
          <el-form-item label="商品参数值" prop="detail">
            <el-input v-model="attributeForm.detail"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="attributeVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleAttributeAdd">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleEdit">确认修改</el-button>
    </div>

  </div>
</template>

<style>
.el-card {
  margin-bottom: 10px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}

.avatar-uploader .el-upload {
  width: 145px;
  height: 145px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
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
</style>

<script>

import Editor from '@tinymce/tinymce-vue'
import { MessageBox } from 'element-ui'


export default {
  name: 'GoodsEdit',

  data() {
    return {
      baseurl:this.GLOBAL.serverSrc,
      show:false,
      categoryList: [],
      value:'',
      goodsPicture:[],
      pictureListUrl:[],
      goods: {
        goodsDescList: [],
        goodsPictureList:[],
      },
      attributeVisiable: false,
      attributeForm: { name: '', detail: '' },
      attributes: [],
      rules: {
        goodsName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
        oldPrice: [{ required: true, message: '原价不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '商品状态不能为空', trigger: 'blur' }],
        mainPic: [{ required: true, message: '商品图片不能为空', trigger: 'blur' }],
        stock: [{ required: true, message: '商品库存不能为空', trigger: 'blur' }],
        categoryName: [{ required: true, message: '商品分类不能为空', trigger: 'blur' }],
      },

    }
  },
  computed: {

  },
  created() {
    this.init()
    this.initCatagory()
  },
  methods: {

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

    /**
     * 根据商品id获取商品
     */
    init: function() {
      if (this.$route.query.id == null) {
        return
      }

      const id = this.$route.query.id

      this.$axios.get('/apis/goods/getGoodsById',{
        params:{
          id:id,
        }
      }).then((response) => {
        if (response.status === 200) {
          this.goods=response.data;

          for (var i = 0; i < this.goods.goodsPictureList.length; i++) {
            this.pictureListUrl.push({
              url: this.GLOBAL.serverSrc+this.goods.goodsPictureList[i].picAddr,
              picAddr:this.goods.goodsPictureList[i].picAddr,
              id:this.goods.goodsPictureList[i].id
            })
          }

        }
      })
        .catch(function (error) {
          console.log(error)

        })


    },


    handleCategoryChange(value) {
      this.goods.categoryId = value[value.length - 1]
    },
    handleCancel: function() {
      this.$router.push({ path: 'list' })
    },

    //修改商品
    handleEdit: function() {

      this.$refs['goods'].validate((valid) => {
        if (valid) {
          let token = sessionStorage.getItem('token');
          let userId = sessionStorage.getItem('userId');
          const params = new URLSearchParams();
          params.append('token', token);
          params.append('userId', userId);
          params.append('goods', JSON.stringify(this.goods));
          params.append('attributes', JSON.stringify(this.goods.goodsDescList));
          params.append('goodsPicture', JSON.stringify(this.goods.goodsPictureList));
          this.$axios.post('/apis/goods/updateGoods', params
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
                // this.$router.push({name: 'activity'})
                this.$router.push('goodsList');
                return;
              }
              else{
                this.$message({
                  message: '修改失败',
                  type: 'failed'
                })
                this.$router.push('goodsList');

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

      this.goods.mainPic = response
    },

    uploadOverrun: function() {
      this.$message({
        type: 'error',
        message: '上传文件个数超出限制!最多上传5张图片!'
      })
    },
    //详情图片上传
    handleGalleryUrl(response, file, fileList) {
     var newPic ={
        id:null,
          picAddr: {},
      };
      newPic.picAddr =response

      this.goods.goodsPictureList.push(newPic)

      // this.pictureListUrl.push(response)

    },
    //详情图片删除
    handleRemove: function(file, fileList) {

      for (var i = 0; i < this.goods.goodsPictureList.length; i++) {
        // 这里存在两种情况
        // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
        //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
        // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
        var url
        if (file.response === undefined) {
          url = file.picAddr;
          if (this.goods.goodsPictureList[i].picAddr === url) {

            this.goods.goodsPictureList[i].picAddr=null;
        }
        }
        else {
          url = file.response;
          if (this.goods.goodsPictureList[i].picAddr=== url) {

            this.goods.goodsPictureList.splice(i, 1)
          }
        }


      }
    },


    handleAttributeShow() {
      this.attributeForm = {}
      this.attributeVisiable = true
    },
    handleAttributeAdd() {

      this.goods.goodsDescList.unshift(this.attributeForm)
      this.attributeVisiable = false
    },
    handleAttributeDelete(row) {

      const index = this.goods.goodsDescList.indexOf(row)
      //this.goods.goodsDescList.splice(index, 1)
      this.goods.goodsDescList[index].name=null
      this.goods.goodsDescList[index].detail=null


    }
  }
}
</script>
