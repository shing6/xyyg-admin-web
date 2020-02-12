'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // BASE_API: '"http://localhost:8081"',
  BASE_API: '"https://shing6.cn:8081"',
  API_ROOT:'"/apis/"'   //本地域名
})


