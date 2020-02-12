<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse"  unique-opened router>
            <template v-if="role==2" v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-menu-item v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
                                    {{ threeItem.title }}
                                </el-menu-item>
                            </el-menu-item>
                            <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                                {{ subItem.title }}
                            </el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </template>
          <template v-if="role==3" v-for="item in items2">
            <template v-if="item.subs">
              <el-submenu :index="item.index" :key="item.index">
                <template slot="title">
                  <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                </template>
                <template v-for="subItem in item.subs">
                  <el-menu-item v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                    <template slot="title">{{ subItem.title }}</template>
                    <el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
                      {{ threeItem.title }}
                    </el-menu-item>
                  </el-menu-item>
                  <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                    {{ subItem.title }}
                  </el-menu-item>
                </template>
              </el-submenu>
            </template>
            <template v-else>
              <el-menu-item :index="item.index" :key="item.index">
                <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
              </el-menu-item>
            </template>
          </template>
        </el-menu>
    </div>
</template>

<script>
    import bus from '../common/bus';
    export default {

        data() {
            return {
                collapse: false,
                role:sessionStorage.getItem('role'),
                items: [
                    {
                        icon: 'el-icon-lx-home',
                        index: 'dashboard',
                        title: '系统首页'
                    },

                    {
                        icon: 'el-icon-document',
                        index: 'table',
                        title: '订单管理'
                    },

                  {
                    icon: 'el-icon-goods',
                    index: '2',
                    title: '商品管理',
                    subs: [
                      {
                        index: 'goodsList',
                        title: '商品列表'
                      },

                      {
                        index: 'createGoods',
                        title: '商品上架'
                      },
                      {
                        index: 'goodsCommentList',
                        title: '商品评论'
                      },

                      {
                        index: 'goodsCategory',
                        title: '商品分类'
                      }
                    ]
                  },

                ],
              items2: [

                {
                  icon: 'el-icon-document',
                  index: 'shop',
                  title: '商家审核'
                },
                {
                  icon: 'el-icon-document',
                  index: 'shopCategory',
                  title: '商家分类'
                },
                {
                  icon: 'el-icon-goods',
                  index: '2',
                  title: '广告管理',
                  subs: [
                    {
                      index: 'advertList',
                      title: '广告列表'
                    },

                    {
                      index: 'createAdvert',
                      title: '广告添加'
                    },

                  ]
                },

                {
                  icon: 'el-icon-goods',
                  index: '3',
                  title: '兼职管理',
                  subs: [
                    {
                      index: 'workList',
                      title: '兼职列表'
                    },

                    {
                      index: 'createWork',
                      title: '兼职发布'
                    },

                  ]
                },


              ],
            }
        },
        computed:{
            onRoutes(){
                return this.$route.path.replace('/','');
            }
        },
        created(){
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
            })
        }
    }
</script>

<style scoped>
    .sidebar{
        display: block;
        position: absolute;
        left: 0;
        top: 70px;
        bottom:0;
        overflow-y: scroll;
    }
    .sidebar::-webkit-scrollbar{
        width: 0;
    }
    .sidebar-el-menu:not(.el-menu--collapse){
        width: 250px;
    }
    .sidebar > ul {
        height:100%;
    }
</style>
