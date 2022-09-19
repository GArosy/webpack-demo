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

- 打包后可见CSS已经独立出来

## 使用babel转义js

Babel是JavaScript的编译工具，可以将高版本的js语法特性转换为低版本，保证代码兼容所有浏览器，以便在生产环境直接运行。

在Babel 7之前，存在按年度区分的语法预设包如preset-es2015、preset-es2016、preset-es2017等，从Babel 7开始，Babel团队删除（并停止发布）了任何年度的preset（preset-es2015 等）， `@babel/preset-env`取代了对这些内容的需求，因为它包含了所有年度所添加内容以及针对特定浏览器集兼容的能力。

babel 本身不具有任何转化功能，它把转化的功能都分解到一个个 plugin 里面，代码转换功能以plugin的形式出现，plugin是一个个的小型的 JavaScript 程序，用于指导 Babel 如何对代码进行转换。这些插件虽然颗粒度小，效率高，但是插件需要逐个安装，还有严格的配置声明顺序，不便使用。Babel提供了多组插件的集合`Preset 预设`，例如：

```
@babel/preset-env
@babel/preset-typescript
@babel/preset-react
@babel/preset-flow
```

插件与预设有着不同的执行顺序：

- 插件比预设先执行
- 插件数组**从前向后**执行
- 预设数组**从后向前**执行

使用：

- 安装

  ```
  cnpm i -D babel-loader @babel/preset-env @babel/core
  ```

- 配置

  >  [Babel配置详解 - 掘金 (juejin.cn)](https://juejin.cn/post/7067728539096711199#heading-4) 

  babel的配置主要分为 `presets`预设 和 `plugins`插件。

  babel-loader 默认会在当前项目根目录查找 `.babelrc`、`.babelrc.js`、`.babelrc.json`、`babel.config.json`、`babel.config.js`、`package.json`配置文件。我们常用`babel.config.json`对loader进行配置：

  ```json
  {
    "presets": [
      [
        "@babel/env",
        {
          // 设置兼容到哪些目标浏览器
          "targets": {
            "edge": "17",
            "firefox": "60",
            "chrome": "67",
            "safari": "11.1"
          },
          "useBuiltIns": "usage",
          "corejs": "3.6.5"
        }
      ]
    ]
  }
  ```

  **targets**

  用于设置兼容到哪些目标浏览器，如果不配置，则尝试读取 `package.json` 和 `.browserslistrc` 中的配置， `browserslist` 的配置也同样作用于 `autoprefixer`、`postcss`等插件。 如果没有 `targets` 和 `browserslist` 配置，则转换所有的ES6语法为ES5版本

  **useBuiltIns**

  取值有 `usage/entry/false`，默认为 `false`

  - `false` 不使用 `polyfill`，**只转换语法**
  - `entry` 会根据目标浏览器环境，引用未支持的所有的 `polyfill`，需要在入口文件引用 `@babel/polyfill`
  - `usage` 会先分析代码中使用到的新特性，**只为用到的新特性添加** `polyfill`，不需要手动添加 `@babel/polyfill`，但需要配置 `corejs` 的版本，不配置会有警告。

  **corejs**

  取值为 2 或 3，3 是 2 的升级版，会扩展一些新的API的polyfill，比如数组的flat方法，一般使用 3 的版本。 

  需要安装相应模块 ` npm i --save core-js@3 `

# 热更新

**模块热替换**(Hot Module Replacement 或 **HMR**)是 webpack 提供的最有用的功能之一。它允许在运行时更新各种模块，而无需进行完全刷新。 

- 实现

  使用webpack-dev-server搭配webpack内置的HMR启动服务

  - 安装

    ```
    cnpm i -D webpack-dev-server
    ```

  - 配置webpack.config.js

    ```js
    const Webpack = require("webpack")
    
    module.exports = {
      // ...省略其他配置
      devServer:{
        port:3000,
        hot:true
      },
      plugins:[
      // ...
        new Webpack.HotModuleReplacementPlugin()
      ]
    }
    ```

  - 配置打包指令

    ```json
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "build": "webpack --config ./build/webpack.config.js",
      "dev": "webpack-dev-server --config ./build/webpack.config.js --open"
    },
    ```

  运行 `npm run dev` 后打开localhost:3000，既可体验HMR自动化带来的乐趣。

# 优化

## 打包优化

`webpack-dashboard`、`speed-measure-webpack-plugin`、`jarvis` 等分析工具还未支持webpack5，官方提供了可以解析日志的可视化页面 [upload (webpack.github.io)](https://webpack.github.io/analyse/) ，我们只需在打包指令后加上 `--profile --json > stats.json` ，打包日志 `stats.json` 就会存放在根目录下，将日志拖入页面即可查看清晰的构建信息。

### 构建分析

`webpack-dashboard` 为webpack在命令行上构建了一个一目了然的仪表盘(dashboard)，其中包括**构建过程**和**状态**、**日志**以及涉及的**模块列表**。

- 安装

  ```
  cnpm i -D webpack-dashboard
  ```

- 引入

  ```js
  //引入模块
  var Dashboard = require('webpack-dashboard');
  var DashboardPlugin = require('webpack-dashboard/plugin');
  var dashboard = new Dashboard();
  
  //添加插件方法
  new DashboardPlugin(dashboard.setData)
  ```

- 修改打包指令

  ```json
  "dev": "webpack-dashboard -- webpack-dev-server --config ./build/webpack.config.js --open"
  ```

  

### 速度分析

`speed-measure-webpack-plugin`  可以分析 webpack 的总打包耗时以及每个 plugin 和 loader 的打包耗时，从而让我们对打包时间较长的部分进行针对性优化。 

- 安装

  ```
  cnpm install -D speed-measure-webpack-plugin
  ```

- 使用

  引入后创建实例，将默认的webpack配置文件包裹起来

  ```js
  const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
  const SMP = new SpeedMeasurePlugin();
  
  module.exports = SMP.wrap({
  	// webpack默认配置
  })
  ```

==注意：speed-measure-webpack-plugin 插件在 webpack5 中会导致 mini-css-extract-plugin 插件报错==