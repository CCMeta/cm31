[/source/sagereal]    hello-sagereal/*

[/layers/meta-unisoc/recipes-core/hello-sagereal]    hello-sagereal.bb
[/layers/meta-unisoc/recipes-core/packagegroup]    packagegroup-unisoc-base.bb
[/layers/meta-unisoc/recipes-core/packagegroup]    packagegroup-unisoc-console.bb

[/layers/meta-unisoc/conf/machine/]    sl8581e-nand-marlin3e-mifi.conf

[/prebuilts/pac-binary/]    sl8581e-nand-marlin3e-mifi.xml

[TIPS]
- 其实修改版本号之后，source里面的东西就会自动重新编译，真的不需要再rm -rf 太麻烦了

[V3-230803]
- 基本整理了除DHCP之外的所有内容接口
- 优化了登录
- 底层接口区域完成

[V3-230726]
- 优化golang编译大小 并且配方中添加already-stripped
- 开机启动Web服务时，会自动尝试开启RNDIS和WIFI
- 假的接口初步已经完成
- 用户配置的存储逻辑初步完成，存储在toml格式中

[V2-230725]
- 已经烧录golang进入，约等于20MB
- 添加开机启动脚本关联golang，可以开机自动进入后台执行并且目录正确
- RNDIS用地址42.1已经可以访问main.html，接下来优化后端API即可

[V1-230720]
- 添加DEMO模块到console，可以运行
- 添加开机启动脚本DEMO，可以开机自动执行

