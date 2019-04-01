# Map(一个毕业设计）
### 环境：
Python3.7+Django2.0.7+Linux/Win/Mac
依赖:requirements.txt
### 部署Windows
* 下载Pyhton3.7 url:https://www.python.org/ftp/python/3.7.2/python-3.7.2-amd64.exe
* 安装git https://git-scm.com/download/win
* 使用git下载代码 git clone github:https://github.com/tongchengbin/trip.git
* 切换至项目根目录 安装依赖pip install -r requirements
* python manage.py runserver 0.0.0.0:8000



### 源码解读
##### 目录解析
    navigation:导航应用
        views:接口函数
        models:模型
        urls:子路由
    static：静态文件 js/css/img.
        css:index 主页样式
        js:
            index:函数，事件
    templates:html模板文件
        index:主页
        fight:飞机票查询
        train:火车票查询
    
    Trip：主项目，包含配置信息等
        settings:配置文件
        urls:主路由
        wsgi:服务器网关接口
    manage:项目的脚本文件，用于添加APP，启动，调试等

###### Views视图函数
    gd：
        主页接口，直接加载html文件
    addhistory: 
        添加搜索记录 包含地址名称，区域，坐标点，同时做去重
    gethistory: 
        在数据库中查询最近的10条记录,用字段ctime记录的创建时间。
    getTrainList：火车高铁查询
        传入坐标点通过百度api地址解析出目标市区  然后调用12306数据接口进行解析
    flight：
        飞机票查询  通过上传的坐标点解析出市区地址，然后请求12306的票务数据，对返回结果进行解析并传递给前端 
    getprice: 
        获取班次价格（调用12306接口）
    geocoder:
        逆地址解析(坐标点-> 地址 同时解析出市区)

##### 前端
    前端部分调用了高度德图组件
    AMap.Autocomplete：地址搜索
    AMap.Transfer：公交导航
    AMap.Riding:骑行导航
    AMap.Walking：步行导航
    AMap.Driving：驾车导航
    AMap.MouseTool:菜单组件
>***详细函数参考代码注释。***


