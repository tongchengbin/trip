# Map(一个毕业设计）
### 环境：
Python3.7+Django2.0.7+Linux/Win/Mac
依赖:requirements.txt
### 部署Windows
* 下载Pyhton3.7 url:https://www.python.org/ftp/python/3.7.2/python-3.7.2-amd64.exe
* 下载代码 github:https://github.com/tongchengbin/trip.git
* 切换至项目根目录 python manage.py runserver 0.0.0.0:8000 打开浏览器链接



### 源码解读
#### 后端
##### 目录解析
    navigation:导航应用
        views:接口函数
        models:模型
        urls:子路由
    static：静态文件 js/css/img.
    templates:html模板文件
    Trip：主项目，包含配置信息等
        settings:配置文件
        urls:主路由

###### 视图函数
    gd：主页跳转(高德地图)
    addhistory: 添加搜索记录 包含地址名称，区域，坐标点，同时做去重
    gethistory: 获取地址列表 根据时间倒倒序
    getTrainList：火车高铁查询
        传入坐标点通过百度api地址解析出目标市区  然后调用12306数据接口进行解析
    flight：飞机票查询




