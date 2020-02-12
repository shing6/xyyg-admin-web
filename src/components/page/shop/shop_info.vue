<template>

  <div class="container">

    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form ref="goods" :rules="rules" :model="goods" label-width="150px">
        <el-form-item label="商家logo" prop="picUrl">
          <el-upload v-model="goods.picUrl"
                     action="apis/file/uploadShop"
                     :show-file-list="false"
                     :on-success="uploadPicUrl"
                     class="avatar-uploader"
                     accept=".jpg,.jpeg,.png,.gif">
            <img v-if="goods.picUrl" :src="baseUrl+goods.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
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



  </div>
</template>

<script>
  export default {
    name: 'shop_info'
  }
</script>

<style scoped>

</style>
