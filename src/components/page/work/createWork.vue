<template>
  <div class="container">



      <el-form ref="work" :rules="rules" :model="work" label-width="150px">

        <el-form-item label="标题" prop="title"  style="width: 600px">
          <el-input v-model="work.title"/>
        </el-form-item>
        <el-form-item label="结算周期" prop="type">
            <el-select   v-model="work.type" placeholder="请选择所属分类">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.categoryName"
              :value="item.id">
            </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="工资" prop="salary" style="width: 280px">
          <el-input v-model="work.salary" />
        </el-form-item>

        <el-form-item label="招聘人数" prop="counts" style="width: 280px">
          <el-input v-model="work.counts" />
        </el-form-item>

        <el-form-item label="工作内容" prop="detail"  style="width: 1500px">
          <quill-editor
            v-model="work.detail"
            ref="myQuillEditor"
            :options="editorOption"
            @blur="onEditorBlur($event)"
            @focus="onEditorFocus($event)"
            @change="onEditorChange($event)">
          </quill-editor>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="work.startTime"
            type="date"
            value-format="timestamp"
            placeholder="选择日期">
          </el-date-picker>

        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="work.endTime"
            type="date"
            value-format="timestamp"
            placeholder="选择日期">
          </el-date-picker>

        </el-form-item>
        <el-form-item label="工作地点" prop="address" style="width: 600px">
          <el-input v-model="work.address" />
        </el-form-item>

      </el-form>


    <div class="op-container">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePublish">发布</el-button>
    </div>

  </div>
</template>

<script>
  import 'quill/dist/quill.core.css';
  import 'quill/dist/quill.snow.css';
  import 'quill/dist/quill.bubble.css';
 export default {
    name: 'createWork',
    data() {
      return {
        baseUrl:this.GLOBAL.serverSrc,
        categoryList: [
          {id:0,categoryName:"日结"},
          {id:1,categoryName:"月结"},
          {id:2,categoryName:"完工结"}
        ],
        value:'',
        work:{},
        rules: {
          title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
          detail: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
          type: [{ required: true, message: '结算周期不能为空', trigger: 'blur' }],
          counts: [{ required: true, message: '招聘人数不能为空', trigger: 'blur' }],
          startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
          address: [{ required: true, message: '工作地点不能为空', trigger: 'blur' }],
          salary: [{ required: true, message: '工资不能为空', trigger: 'blur' }],
        },
        content: ``,
        editorOption: {}

      }
    },
    methods:{

      //取消
      handleCancel: function() {
        this.$router.push({ path: '/workList' })
      },
      //发布兼职
      handlePublish: function() {

        this.$refs['work'].validate((valid) => {
          if (valid) {
            let token = sessionStorage.getItem('token');
            let userId = sessionStorage.getItem('userId');
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('userId', userId);
            params.append('work', JSON.stringify(this.work));
            this.$axios.post('/apis/work/insertWork', params
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
                  this.$router.push('workList');
                  return;
                }
                else{
                  this.$message({
                    message: '添加失败',
                    type: 'failed'
                  })
                  this.$router.push({ path: '/work/workList' })

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
      onEditorReady(editor) { // 准备编辑器
         },
      onEditorBlur(){}, // 失去焦点事件
      onEditorFocus(){}, // 获得焦点事件
       onEditorChange(){}, // 内容改变事件
     },
    computed: {

      editor() {

        return this.$refs.myQuillEditor.quill;

      },

    }
  }
</script>

<style scoped>

</style>
