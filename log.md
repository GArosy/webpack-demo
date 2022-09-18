# 入门

## 初始化项目

```
npm init
npm i -D webpack webpack-cli
```

配置package.json打包命令

```
"scripts": {
  "build": "webpack src/main.js"
},
```

新建src/main.js，并执行打包

```
npm run build
```

此时生成了一个dist文件夹，并且内部含有main.js说明已经打包成功了

## 自定义配置

以上只是webpack的默认配置，我们需要实现基础的自定义配置

- 新建`build/webpack.config.js` 

  ```js
  const path = require("path"); // webpack依赖于node.js运行，因此使用CJS引入包
  
  module.exports = {
    mode: "development", // 开发者模式
    entry: path.resolve(__dirname, "../src/main.js"), // 入口文件，使用resolve构造绝对路径（nodejs中 ./ 为工作目录）
    output: {
      filename: "[name].[hash:8].js", // 打包后的文件名，为方便缓存使用hash值散列每次打包文件
      path: path.resolve(__dirname, "../dist"), // 打包后的目录
    }
  };
  ```

- 更改打包命令

  ```json
  "scripts": {
    "build": "webpack --config ./build/webpack.config.js"
  },
  ```

  执行`npm run build`会发现dist下生成了`main.35c6fb22.js`，打包成功。

## 配置HTML模板

新建`public/index.html`作为入口页面，我们需要将打包好的`main.js`引入其中。但每次打包后`main.js`的文件名是随机的，手动引入不现实。这时需要一个plugin `html-webpack-plugin` 来帮助我们自动引入js：

- 安装

  ```
  npm i -D html-webpack-plugin
  ```

- 默认配置

  `html-webpack-plugin` 默认将会在dist的目录下创建一个 `index.html` 文件， 并在这个文件中插入一个 `script` 标签，标签的 `src` 为 `output.filename`

  ```js
  // ...
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  module.exports = {
    // ...
    plugins: [
      new HtmlWebpackPlugin({})
    ]
  };
  ```

- 手动配置模版

  ```js
  module.exports = {
    // ...
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/index.html')
      })
    ]
  };
  ```

- 执行打包后，dist中的`index.html`内容为：

  ```html
  <head><script defer src="main.35c6fb22.js"></script></head>
  ```

  引入成功。

- 此外，如有多个入口页面，可以通过生成多个`html-webpack-plugin`实例来解决。

  ```js
  module.exports = {
    mode: "development", // 开发者模式
    entry: {
      main: path.resolve(__dirname, "../src/main.js"), // 入口文件，使用resolve构造绝对路径（nodejs中 ./ 为工作目录）
      another: path.resolve(__dirname, "../src/another.js")
    },
    output: {
      filename: "[name].[hash:8].js", // 打包后的文件名，为了缓存使用hash值散列每次打包文件
      path: path.resolve(__dirname, "../dist"), // 打包后的目录
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/index.html'),  // 本地模板文件的位置
        filename: 'index.html', // 输出文件的文件名称
        chunks: ['main']  // 与入口文件对应的entry模块名
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/header.html'),
        filename: 'anotherIndex.html',
        chunks: ['another']
      }),
    ]
  };
  ```

每次执行`npm run build`会发现dist文件夹里会残留上次打包的文件，这里使用一个plugin来帮我们在打包输出前清空文件夹`clean-webpack-plugin` ：

- ```shell
  npm i -D clean-webpack-plugin
  ```

- ```js
  const {CleanWebpackPlugin} = require('clean-webpack-plugin')
  // ...
  plugins: [
    new HtmlWebpackPlugin({}),
    new CleanWebpackPlugin()
  ]
  ```

## 引用CSS

- 新建`src/style/index.less`

- 在入口js中引入CSS文件

  ```js
  // main.js
  import './style/index'
  console.log('hello');
  ```

- 安装**loader**来解析CSS

  ```
  npm i -D style-loader css-loader
  ```

  如果使用了LESS，需要额外安装loader，SCSS同理

  ```
  npm i -D less less-loader
  ```

  配置
  
  ```js
  module: {
    rules: [
      {
        test: /\.css$/, // 正则匹配.css文件
        use: ["style-loader", "css-loader"], // 多个loader从右向左解析
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  ```

### 处理CSS浏览器兼容

postcss-loader可以通过**添加浏览器前缀**完成兼容CSS样式的操作

- 安装`postcss-loader`和它的插件`postcss-preset-env`

  ```
  npm i -D postcss-loader postcss-preset-env
  ```

- 在**根目录**下新建 postcss.config.js 文件，Loader 将会**自动搜索**配置文件：

  ```js
  module.exports = {
    // webpack5中，使用postcss-preset-env即可，它内置了autoprefixer
    plugins: [
      // require("autoprefixer"),
      require('postcss-preset-env')
    ],
  };
  ```

- 在package.json中配置postcss打包规则：

  ```json
  "browserslist": {
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ],
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ]
    }
  ```

  - development--开发环境，*需要在webpack.config.js设置node环境变量：process.env.NODE_ENV = development*

  - production--生产环境，默认为生产环境

  postcss-loader配置于less-loader与css-loader之间 ：

  ```js
  {
    test:/\.less$/,
    use:['style-loader','css-loader','postcss-loader','less-loader']
  }
  ```

  向css中添加一些css3特性用于测试：

  ```css
  html,
  body {
    color: lch(53 105 40);
    display: flex;
    backface-visibility: hidden;
  }
  
  :fullscreen {
    width: auto;
  }
  ```

  打包后浏览器内可见加了浏览器前缀的css通过style标签的方式添加到了html文件中，但实际项目中样式文件数量庞大，最好将css拆分出来以外链的形式引入页面。我们可以借助 `mini-css-extract-plugin` 插件完成这一工作：

### 拆分CSS

- 安装

  ```
  cnpm i -D mini-css-extract-plugin
  ```

- 配置

  ```js
  // webpack.config.js
  // ...
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[hash:8].css",
        chunkFilename: "[id].css",
      }),
    ],
  // ...
  	{
      test: /\.less$/,
      use: [
        // 用MiniCssExtractPlugin代替原来的style-loader
        MiniCssExtractPlugin.loader,
        "css-loader",
        "postcss-loader",
        "less-loader",
      ],
    },
  ```

  



