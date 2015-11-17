# lego 脚手架

## 使用
### 需要（推荐）安装的包
* fis3
* fis3-hook-commonjs
* fis3-postpackager-loader
* fis3-postprocessor-extras_uri
* fis3-packager-smart
* fis-parser-imweb-tpl
* fis-parser-imweb-tplv2（测试中）
* fis-parser-sass （兼容以前的）
* fis-parser-node-sass （推荐）
* fis-postprocessor-autoprefixer
* fis-prepackager-csswrapper


npm install -g fis3 fis3-hook-commonjs fis3-postpackager-loader fis3-postprocessor-extras_uri fis-parser-imweb-tpl fis-parser-imweb-tplv2 fis-postprocessor-autoprefixer fis-prepackager-csswrapper fis3-parser-babel fis-postpackager-iconfont fis3-packager-smart fis3-parser-node-sass

### 安装脚手架

### 编译
切换至 `src` 目录下。

* 在 src 目录下执行如下命令开发调试
```
fis3 release dev -wL // 开发，自动watch并刷新
fis3 server start --root ../dev     //启动调试服务器
fis3 server start --root ../dev --port 80 // 开发目录
fis3 server start --root ../dist --port 80 // 发布目录
```

* 发布
```
fis3 release dist
```
生成的 `dist` 目录即为可发布版本。
