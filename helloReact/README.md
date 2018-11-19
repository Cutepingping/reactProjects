## 公共壳工程模板，为所有后台管理系统的壳工程的初始化版
使用步骤
1. 为方便调试，该工程为可直接运行版的，如果需要当做shell工程使用，需要删除biz、router.js、config、package.json文件或文件夹
2. 各自系统用拷贝方式，将公共壳工程模板重命名之后放入项目的独立git, 如 maotai-shell-web
3. 发布到npm（npm包名必须以-shell-web结尾）
4. 使用yx-npm工具将 maotai-shell-web 模块重新组装入项目（具体yx-npm使用看该工具说明）


## 组件编写规则
1. 大写字母开头(参考 PopUpSelect)
2. 必须要有作者(参考 PopUpSelect)
3. 组件最好是纯react，不依赖其他框架(例如不依赖dva，之后可以任意复用到其他react框架中，可参考component/PopUpSelect/popUpSelectDemo.jsx)
4. 路由菜单中配置可运行的案例（如 popUpSelect/popUpSelect）
5. 做好readme.md中的history的记录

## History
* 06/30/2018（乐毅）
1. 修改文件名大小写问题
2. 引入webpack-parallel-uglify-plugin 打包插件
3. 去掉登录后查询用户详情的接口
4. 增加登录页验证码的mock

* 06/22/2018（乐毅）
1. 调整打包工具为webpack，去掉yx-npm依赖，并精简目录结构为如下
assets
config
css
pages
pubBiz
utils
widget
favicon.ico
index.html
index.js
router.js
theme.js
2. 去掉多余的utils/cmpt_utils.js文件，去掉locale语言包，去掉antd默认的utils/mock.js
3. 增加assets/mock下对应json为对应接口的mock
4. BasicTable增加自定义显示多少列
5. 修复路由home固定为第二个的问题，改为最后一个

* 06/21/2018（苏离）
1. 添加组件例子 category

* 06/12/2018（苏离）
1. 添加组件demo编写规则
README.md
2. 加入PopUpSelect demo例子
popUpSelect/popUpSelect 改路由下关联文件
3. 加入KingEditor demo例子
kingEditor/kingEditorDemo 改路由下关联文件
4. 去除路由里面的resId参数
SiderView.jsx
5. 更改logo文件

* 05/06/2018（苏离）
1. 解决表格里面浮动栏显示错乱
skin.less
2. 解决菜单栏滚动条美观问题
SiderView.jsx
3. 解决左侧菜单中不存在页面的面包屑无法显示页面标题
bread.jsx
AppView.jsx
4. 解决logo图片需要手动转base64位问题
通过引入 import logoImg from '../../../asset/img/logo.png'
loginView.jsx
BannerView.jsx
5. 删除无用的config配置参数
6. 规范化component的命名规则，组件全部以大写开头
7. logo显示样式优化
8. 忘记密码/退出登录下拉样式更改
BannerView.jsx
9. 登录请求双错误弹框问题修复
LoginView
