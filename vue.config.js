const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    open: true, // 启动后自动打开浏览器
    host: "localhost",
    port: 8081, // 修改为你需要的端口
    https: false
    }
})
