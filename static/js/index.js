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
renderOptions={map: map,panel : "panel",autoViewport:true};
myGeo = new BMap.Geocoder();

driving = new BMap.DrivingRoute(map, {renderOptions: renderOptions,onSearchComplete:onSearchComplete});
walk = new BMap.WalkingRoute(map, {renderOptions: renderOptions});
riding = new BMap.RidingRoute(map, {renderOptions: renderOptions});
transit = new BMap.TransitRoute(map, {renderOptions: renderOptions});
// 自动定位
let geolocation = new BMap.Geolocation();
geolocation.getCurrentPosition(function(r){
    if(r.point.lng){
        let mk = new BMap.Marker(r.point);
        map.addOverlay(mk);
        map.panTo(r.point);
    }else{
        console.log("无法定位")
    }

},{enableHighAccuracy: true});

function onSearchComplete(res) {
    console.log(res.getNumPlans(),"方案个数");
    console.log(res,"onSearchComplete")
}
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
    // let point = new BMap.Point(e.lng, e.lat);
    // let marker = new BMap.Marker(point); // 创建点
    // //检测标记点
    // let len = map.getOverlays().length;
    // for (let i = len; i > 0; i--) {
    //     if (map.getOverlays()[i] && map.getOverlays()[i].z.title === 'end') {
    //         map.removeOverlay(map.getOverlays()[i]);
    //     }
    // }
    // map.addOverlay(marker, {
    //     "title": "end",
    //     "label": "结束点"
    // }); //增加点
    // let geoc = new BMap.Geocoder();
    // geoc.getLocation(point,
    // function(rs) {
    //     ec.setInputValue(rs.address)
    // })
}

// let ac = new BMap.Autocomplete( //建立一个自动完成的对象
// {
//     "input": "tipa",
//     "location": map
// });
// let ec = new BMap.Autocomplete( //建立一个自动完成的对象
// {
//     "input": "tipb",
//     "location": map
// });
// 鼠标放在下拉列表上的事件
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
// ac.addEventListener("onconfirm", function(e) {
//     //鼠标点击下拉列表后的事件
//     let _value = e.item.value;
//     myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
//     window.localStorage.setItem("form",_value.city);
//     setPlace();
//     myGeo.getPoint(myValue, function (res) {
//         inputa.attr("lat",res.lat);
//         inputa.attr('lng',res.lng);
//         myGeo.getLocation(new BMap.Point(res.lng, res.lat),function (result) {
//             inputa.attr('value',result.address)
//         })
//         // $("#tipa").attr("origin",res.lat+","+res.lng)
//     });
// });
// ec.addEventListener("onconfirm",function(e) { //鼠标点击下拉列表后的事件
//     let _value = e.item.value;
//     myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
//     window.localStorage.setItem("go",_value.city);
//     setPlace();
//     myGeo.getPoint(myValue, function (res) {
//         inputb.attr("lat",res.lat);
//         inputb.attr("lng",res.lng);
//         myGeo.getLocation(new BMap.Point(res.lng, res.lat),function (result) {
//             inputb.attr('value',result.address)
//         })
//         // $("#end-addr").attr("destination",res.lat+","+res.lng)
//     });
// });



let myValue = "";



// 点击事件
$("#search-button").click(function( e ) {
    let routeType=$("#search-button").attr('route-type');
    // sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
    //     scale: 0.6,//图标缩放大小
    //     strokeColor:'#fff',//设置矢量图标的线填充颜色
    //     strokeWeight: '2',//设置线宽
    // });
    // icons = new BMap.IconSequence(sy, '10', '30');
    //
    // $.get("/trip/transit/",{"type":routeType},function (res) {
    //    if(res.status!==0){
    //        alert(res.message)
    //    }else{
    //        let points=[];
    //        for(i in res.result.routes[0].steps){
    //            let point = res.result.routes[0].steps[i].end_location;
    //            points.push(new BMap.Point(point.lng,point.lat));
    //            map.centerAndZoom(new BMap.Point(point.lng,point.lat), 15)
    //        }
    //        let polyline =new BMap.Polyline(points, {
    //                enableEditing: false,//是否启用线编辑，默认为false
    //                enableClicking: true,//是否响应点击事件，默认为true
    //                icons:[icons],
    //                strokeWeight:'8',//折线的宽度，以像素为单位
    //                strokeOpacity: 0.8,//折线的透明度，取值范围0 - 1
    //                strokeColor:"#18a45b" //折线颜色
    //             });
    //        map.addOverlay(polyline);          //增加折线
    //
    //    }
    // });
    if(routeType==='bike'){
        $(".bike-tab").click();
    }else if(routeType==='drive'){
        $(".drive-tab").click()
    }else if(routeType==='walk'){
        $(".walk-tab").click()
    }else{
        $(".bus-tab").click()
    }
    // RutePlanning()
});

$(".bus-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("bus");
    $("#search-button").attr("route-type",'bus');
        // RoutePlanning()

    let l=getpoint();
    if(l.start&&l.end){
        map.clearOverlays();
        transit.search(l.start, l.end);
    }

});

$(".drive-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("drive");
    $("#search-button").attr("route-type",'drive');
    //     RoutePlanning()
    let l=getpoint();
    if(l.start&&l.end){
        console.log(l.start,l.end,"驾车");
        map.clearOverlays();
        driving.search(l.start, l.end);
    }

});

$(".walk-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("walk");
    $("#search-button").attr("route-type",'walk');
    let l=getpoint();
    if(l.start && l.end){
        map.clearOverlays();
        console.log(l.start,l.end,"步行");
        walk.search(l.start, l.end);
    }
});

$(".bike-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("bike");
    $("#search-button").attr("route-type",'bike');

    let l=getpoint();
    if(l.start && l.end){
        map.clearOverlays();
        riding.search(l.start, l.end);
    }
});



function setPlace()
{
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


function revertAddr() {
    // 调换位置
    tipaValue=document.getElementById("tipa").value;
    tipbValue=document.getElementById("tipb").value;
    document.getElementById("tipa").value=tipbValue;
    document.getElementById("tipb").value=tipaValue;

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
historya=$("#historya");
historyb=$("#historyb");
inputa=$("#tipa");
inputb=$("#tipb");





const ak='GzVtCw9asuvgprsG0i2Ip4xuC4RDogpq';

function suggestiona(key) {
    url="http://api.map.baidu.com/place/v2/suggestion?query="+key+"&region=北京&city_limit=false&output=json&ak="+ak+"&callback=showLocationa";
    $.getScript(url)
}

function showLocationa(res) {
    content="<ul>";
    for(let i in res.result){
            content+="<li style='width: 368px;'>" +
                "<a><i>广12路</i><em>广州市</em></a>"+
            "</li>"
    }
    content+="</ul>";
    historya.html(content);
}
// suggestion();


// 绑定输入框点击事件
// inputa.click(function(e) {
//     historya.css('display','block')
// });
// 内容变化
// inputa.bind("input propertychange", function(e) {
//     // 获取数据
//     console.log(inputa.value);
//     suggestiona(inputa.value)
//
//
// });
// inputa.blur(function () {
//    historya.css('display','none')
// });


function getlocation() {
    alat=inputa.attr('lat');
    alng=inputa.attr('lng');
    blat=inputb.attr('lat');
    blng=inputb.attr('lng');
    let start=myGeo.getLocation(new BMap.Point(alng, alat), function(result){
        console.log(result.address);
        return result.address;
    });
    let end=myGeo.getLocation(new BMap.Point(blng, blat), function(result){
        return result.address;
    });

    return {"start":inputa.attr('value'),"end":inputb.attr('value')}
}
function getpoint() {
    alat=inputa.attr('lat');
    alng=inputa.attr('lng');
    blat=inputb.attr('lat');
    blng=inputb.attr('lng');
    let start=new BMap.Point(alng,alat);
    let end = new BMap.Point(blng,blat);
    if(alat&&blat){
        return {"start":start,"end":end}
    }else{
        return {"start":null,"end":null}
    }


}



$("#gotrain").click(function (e) {
    let go = window.localStorage.getItem('go');
    let form =window.localStorage.getItem('form');
    if(!go||!form){
        alert("请选择出发地和目的地")
    }else{
        let url ="/trip/train/?start="+go+"&end="+form;
        window.open(url)
    }
});
$("#flight").click(function (e) {
    let go = window.localStorage.getItem('go');
    let form =window.localStorage.getItem('form');
    if(!go||!form){
        alert("请选择出发地和目的地")
    }else{
        let url ="/trip/flight/?start="+go+"&end="+form;
        window.open(url)
    }
});
