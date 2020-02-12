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

        <el-form-item label="商品图片" prop="picUrl">
          <el-upload v-model="goods.picUrl"
             action="apis/file/uploadGoods"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif">
            <img v-if="goods.picUrl" :src="baseUrl+goods.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品详情图片">
          <el-upload
            action="apis/file/uploadGoods"
            :limit="5"
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
      <el-table :data="attributes">
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
      <el-button type="primary" @click="handlePublish">上架</el-button>
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
  name: 'GoodsCreate',


  data() {
    return {
      baseUrl:this.GLOBAL.serverSrc,
      categoryList: [],
      value:'',
      goodsPicture:[],
      goods: { picUrl: ''},
      attributeVisiable: false,
      attributeForm: { name: '', detail: '' },
      attributes: [],
      rules: {
        goodsName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
        oldPrice: [{ required: true, message: '原价不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '商品状态不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '商品图片不能为空', trigger: 'blur' }],
        stock: [{ required: true, message: '商品库存不能为空', trigger: 'blur' }],
        categoryName: [{ required: true, message: '商品分类不能为空', trigger: 'blur' }],
      },

    }
  },

  created() {
    this.init()
  },

  methods: {
    /**
     * 获取分类
     */
    init: function() {
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

    handleCategoryChange(value) {
      this.goods.categoryId = value[value.length - 1]
    },
    handleCancel: function() {
      this.$router.push({ path: '/goods/goods' })
    },

    /**
     *  添加商品
     */
    handlePublish: function() {
      this.$refs['goods'].validate((valid) => {
        if (valid) {
          if(this.goods.price==null){
            this.goods.price=0
          }
          let token = sessionStorage.getItem('token');
          let userId = sessionStorage.getItem('userId');
          const params = new URLSearchParams();
          params.append('token', token);
          params.append('userId', userId);
          params.append('goods', JSON.stringify(this.goods));
          params.append('attributes', JSON.stringify(this.attributes));
          params.append('goodsPicture', this.goodsPicture);
          this.$axios.post('/apis/goods/insertGoods', params
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
                this.$router.push('goodsList');
                return;
              }
              else{
                this.$message({
                 message: '添加失败',
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
      this.goods.picUrl = response

    },
    uploadOverrun: function() {
      this.$message({
        type: 'error',
        message: '上传文件个数超出限制!最多上传5张图片!'
      })
    },
    handleGalleryUrl(response, file, fileList) {
       this.goodsPicture.push(response)

    },
    handleRemove: function(file, fileList) {
      for (var i = 0; i < this.goods.gallery.length; i++) {
        // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
        //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
        // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
        var url
        if (file.response === undefined) {
          url = file.url
        } else {
          url = file.response.data.url
        }

        if (this.goods.gallery[i] === url) {
          this.goods.gallery.splice(i, 1)
        }
      }
    },


    handleAttributeShow() {
      this.attributeForm = {}
      this.attributeVisiable = true
    },
    handleAttributeAdd() {
      this.attributes.unshift(this.attributeForm)
      this.attributeVisiable = false
    },
    handleAttributeDelete(row) {
      const index = this.attributes.indexOf(row)
      this.attributes.splice(index, 1)
    }
  }
}
</script>
