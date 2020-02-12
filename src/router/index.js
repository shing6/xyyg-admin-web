import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: 'dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },
                {
                    path: 'icon',
                    component: resolve => require(['../components/page/Icon.vue'], resolve),
                    meta: { title: '自定义图标' }
                },
              {
                path: 'shop_info',
                component: resolve => require(['../components/page/shop/shop_info.vue'], resolve),
                meta: { title: '商家信息' }
              },
                {
                    path: 'table',
                    component: resolve => require(['../components/page/order/Order.vue'], resolve),
                    meta: { title: '订单管理' }
                },

               {
                    path: 'goodsList',
                    component: resolve => require(['../components/page/goods/list.vue'], resolve),
                    meta: { title: '商品列表' }
                },
               {
                    path: 'createGoods',
                    component: resolve => require(['../components/page/goods/create.vue'], resolve),
                    meta: { title: '商品上架' , noCache: true},
                },

               {
                    path: 'editGoods',
                    component: resolve => require(['../components/page/goods/edit.vue'], resolve),
                    meta: { title: '商品编辑' , noCache: true},
                    hidden: true
                },
               {
                    path: 'goodsCommentList',
                    component: resolve => require(['../components/page/goods/comment.vue'], resolve),
                    meta: { title: '商品评论' }
               },
              {
                path: 'goodsCategory',
                component: resolve => require(['../components/page/goods/goodsCategory.vue'], resolve),
                meta: { title: '商品分类' }
              },
              {
                path: 'shop',
                component: resolve => require(['../components/page/shop/shop.vue'], resolve),
                meta: { title: '商家审核' , permission: true}
              },
              {
                path: 'shopCategory',
                component: resolve => require(['../components/page/shop/shopCategory.vue'], resolve),
                meta: { title: '商家分类' , permission: true}
              },
              {
                path: 'advertList',
                component: resolve => require(['../components/page/banner/advertList.vue'], resolve),
                meta: { title: '广告列表' , permission: true}
              },
              {
                path: 'createAdvert',
                component: resolve => require(['../components/page/banner/createAdvert.vue'], resolve),
                meta: { title: '广告添加', permission: true }
              },
              {
                path: 'editAdvert',
                component: resolve => require(['../components/page/banner/editAdvert.vue'], resolve),
                meta: { title: '广告修改', permission: true }
              },

              {
                path: 'workList',
                component: resolve => require(['../components/page/work/workList.vue'], resolve),
                meta: { title: '兼职列表', permission: true }
              },
              {
                path: 'createWork',
                component: resolve => require(['../components/page/work/createWork.vue'], resolve),
                meta: { title: '兼职发布', permission: true }
              },
              {
                path: 'editWork',
                component: resolve => require(['../components/page/work/editWork.vue'], resolve),
                meta: { title: '修改兼职' , permission: true}
              },



                {
                    // 权限页面
                    path: 'permission',
                    component: resolve => require(['../components/page/Permission.vue'], resolve),
                    meta: { title: '权限测试', permission: true }
                },
                {
                    path: '404',
                    component: resolve => require(['../components/page/404.vue'], resolve),
                    meta: { title: '404' }
                },
                {
                    path: '403',
                    component: resolve => require(['../components/page/403.vue'], resolve),
                    meta: { title: '403' }
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
