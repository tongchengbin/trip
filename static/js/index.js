// 百度地图API功能
function G(id) {
    return document.getElementById(id);
}
// 百度地图API功能
let map = new BMap.Map("allmap"); // 创建Map实例
map.centerAndZoom(new BMap.Point(116.404, 39.915), 11); // 初始化地图,设置中心点坐标和地图级别
// //添加地图类型控件
map.addControl(new BMap.MapTypeControl({
    mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
}));
myGeo = new BMap.Geocoder();
// 自动定位
let geolocation = new BMap.Geolocation();
geolocation.getCurrentPosition(function(r) {
        let mk = new BMap.Marker(r.point);
        map.addOverlay(mk);
        map.panTo(r.point);
},
{
    enableHighAccuracy: true
});

map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放


// 右键
let menu = new BMap.ContextMenu();
let txtMenuItem = [{
    text: '设置为出发点',
    callback: menuAddStartAddr
},
{
    text: '设置为结束点',
    callback: menuAddEndAddr
}];
for (let i = 0; i < txtMenuItem.length; i++) {
    menu.addItem(new BMap.MenuItem(txtMenuItem[i].text, txtMenuItem[i].callback, 100));
}
map.addContextMenu(menu);

//
function menuAddStartAddr(e) {
    let point = new BMap.Point(e.lng, e.lat);
    //检测标记点
    let len = map.getOverlays().length
    for (let i = len; i > 0; i--) {
        if (map.getOverlays()[i] && map.getOverlays()[i].z.title === 'start') {
            map.removeOverlay(map.getOverlays()[i]);
        }
    }
    let marker = new BMap.Marker(point, {
        "title": "start",
        "label": "起始点"
    }); // 创建点
    map.addOverlay(marker); //增加点
    let geoc = new BMap.Geocoder();
    geoc.getLocation(point,
    function(rs) {
        ac.setInputValue(rs.address)
    })
}
function menuAddEndAddr(e) {
    let point = new BMap.Point(e.lng, e.lat);
    let marker = new BMap.Marker(point); // 创建点
    //检测标记点
    let len = map.getOverlays().length;
    for (let i = len; i > 0; i--) {
        if (map.getOverlays()[i] && map.getOverlays()[i].z.title === 'end') {
            map.removeOverlay(map.getOverlays()[i]);
        }
    }
    map.addOverlay(marker, {
        "title": "end",
        "label": "结束点"
    }); //增加点
    let geoc = new BMap.Geocoder();
    geoc.getLocation(point,
    function(rs) {
        ec.setInputValue(rs.address)
    })
}

let ac = new BMap.Autocomplete( //建立一个自动完成的对象
{
    "input": "start-addr",
    "location": map
});
let ec = new BMap.Autocomplete( //建立一个自动完成的对象
{
    "input": "end-addr",
    "location": map
});
//鼠标放在下拉列表上的事件
// ac.addEventListener("onhighlight", function(e) {
// 	let str = "";
// 	let _value = e.fromitem.value;
// 	let value = "";
// 	if (e.fromitem.index > -1) {
// 		value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
// 	}
// 	str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
// 	value = "";
// 	if (e.toitem.index > -1) {
// 		_value = e.toitem.value;
// 		value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
// 	}
// 	str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
// 	G("searchResultPanel").innerHTML = str;
// });
// 结束鼠标放在下拉列表上的事件
// let ec = new BMap.Autocomplete(    //建立一个自动完成的对象
// 	{"input" : "end-addr"
// 	,"location" : map
// });
// ec.addEventListener("onhighlight", function(e) {
// 	let str = "";
// 	let _value = e.fromitem.value;
// 	let value = "";
// 	if (e.fromitem.index > -1) {
// 		value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
// 	}
// 	str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
// 	value = "";
// 	if (e.toitem.index > -1) {
// 		_value = e.toitem.value;
// 		value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
// 	}
// 	str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
// 	G("searchResultPanel").innerHTML = str;
// });

let myValue = "";
ac.addEventListener("onconfirm", function(e) {
    //鼠标点击下拉列表后的事件
    let _value = e.item.value;
    myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
    setPlace();
    myGeo.getPoint(myValue, function (res) {
        $("#start-addr").attr("origin",res.lat+","+res.lng)
    });

});


// 点击事件
$("#search-button").click(function() {
    RoutePlanning()
});

$(".bus-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("bus");
    $("#search-button").attr("route-type",'bus');
        RoutePlanning()

});

$(".drive-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("drive");
    $("#search-button").attr("route-type",'drive')
        RoutePlanning()
});

$(".walk-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("walk");
    $("#search-button").attr("route-type",'walk')
        RoutePlanning()
});

$(".bike-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("bike");
    $("#search-button").attr("route-type",'bike')
        RoutePlanning()
});



function setPlace() {
    map.clearOverlays(); //清除地图上所有覆盖物
    function myFun() {
        let pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
        map.centerAndZoom(pp, 18);
        map.addOverlay(new BMap.Marker(pp)); //添加标注
    }
    let local = new BMap.LocalSearch(map, { //智能搜索
        onSearchComplete: myFun
    });
    local.search(myValue);
}
ec.addEventListener("onconfirm",function(e) { //鼠标点击下拉列表后的事件
    let _value = e.item.value;
    myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
    setPlace();
    myGeo.getPoint(myValue, function (res) {
        $("#end-addr").attr("destination",res.lat+","+res.lng)
    });
});



function revertAddr() {
    // 调换位置
    let start = $("#start-addr")[0].value;
    let end = $("#end-addr")[0].value;
    ac.setInputValue(end);
    ec.setInputValue(start)
}


//隐藏路径
$('#cards-level1').on('click', '.navtrans-navlist-title', function(){
    let bt=$(".navtrans-navlist-content");
    let tip=$("#route_tips");
    if(bt.hasClass('clear')){
        bt.removeClass("clear");
        tip.addClass('clear')
    }else{
        tip.removeClass("clear");
        bt.addClass('clear')
    }
});

//线路规划
function RoutePlanning() {
    let origin=$("#start-addr").attr('origin');
    let destination = $("#end-addr").attr('destination');
    let routeType=$("#search-button").attr("route-type");
    if(!origin&&!destination){
        alert("请选择出发地和目的地")
    }
    let data={
        "origin":origin,
        "destination":destination,
        "type":routeType};
    let url='http://127.0.0.1:8000/trip/transit/';
    $.ajax({ url: url, data:data,dataType:'html', success: function(res){
        document.getElementById('cards-level1').innerHTML=res;
    }});
}