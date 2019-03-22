/**
 * Created by Administrator on 2019/3/21.
 */
// 導航都是point
let map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom:14, //初始化地图层级
});
//输入提示
let autoa = new AMap.Autocomplete({
    input: "tipinputa"
});
// let autob = new AMap.Autocomplete({
//     input: "tipinputb"
// });
tipb=$("#input");


ERROR={
    "OK":"请求正常",
    "INVALID_USER_KEY":"key不正确或过期",
    "SERVICE_NOT_AVAILABLE":"服务不可用",
    "INVALID_USER_DOMAIN":"INVALID_USER_DOMAIN",
    "USERKEY_PLAT_NOMATCH":"USERKEY_PLAT_NOMATCH",
    "NOT_SUPPORT_HTTPS":"服务不支持https请求",
    "INSUFFICIENT_PRIVILEGES":"权限不足，服务请求被拒绝",
    "USER_KEY_RECYCLED":"Key被删除",
    "INVALID_PARAMS":"请求参数非法",
    "MISSING_REQUIRED_PARAMS":"缺少必填参数",
    "UNKNOWN_ERROR":"其他未知错误",
    "OUT_OF_SERVICE":"规划点（包括起点、终点、途经点）不在中国陆地范围内",
    "NO_ROADS_NEARBY":"划点（起点、终点、途经点）附近搜不到路",
    "ROUTE_FAIL":"路线计算失败，通常是由于道路连通关系导致",
    "OVER_DIRECTION_RANGE":"起点终点距离过长。",
    "ENGINE_RESPONSE_DATA_ERROR":"服务响应失败。"
};
// AMap.event.addListener(autoa, "select", selecta);//注册监听，当选中某条记录时会触发
// AMap.event.addListener(autob, "select", selectb);

// 右键菜单
let menu = new ContextMenu(map);
function ContextMenu(map) {
    let me = this;
    //地图中添加鼠标工具MouseTool插件
    this.mouseTool = new AMap.MouseTool(map);

    this.contextMenuPositon = null;
    let content = [];
    content.push("<div class='info context_menu'>");
    content.push("<p onclick='menu.menuadd(0)'>选择为起点</p>");
    content.push("<p onclick='menu.menuadd(1)'>选择为终点</p>");
    content.push("</div>");
     //通过content自定义右键菜单内容
    this.contextMenu = new AMap.ContextMenu({isCustom: true, content: content.join('')});
    //地图绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', function (e) {
        me.contextMenu.open(map, e.lnglat);
        me.contextMenuPositon = e.lnglat; //右键菜单位置
    });
    ContextMenu.prototype.menuadd = function (tag) {
        this.mouseTool.close();
        if(tag===0){
            inputTagid='tipa'
        }else{
            inputTagid='tipb'
        }
        input_tag=document.getElementById(inputTagid);
        lnglat = [this.contextMenuPositon.lng, this.contextMenuPositon.lat];
        window.localStorage.setItem(inputTagid,this.contextMenuPositon.lng+","+this.contextMenuPositon.lat);
        AMap.plugin('AMap.Geocoder', function() {
            let geocoder = new AMap.Geocoder({
                city: '全国'
            });
            geocoder.getAddress(lnglat, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // result为对应的地理位置详细信息
                input_tag.value=result.regeocode.formattedAddress;
                console.log(result);
                // 添加紀錄
                let data={"address":result.regeocode.formattedAddress,"name":result.regeocode.formattedAddress,
                    "district":result.regeocode.addressComponent.district,
                    "location":{"lng":lnglat[0],"lat":lnglat[1]}};
                $.ajax({
                    url:'/trip/addhistory/',
                    data:JSON.stringify(data),
                    type:"POST",
                    contentType:"application/json",
                    success:function (res) {
                    console.log(res)
                    }
                    });
            }
        });
        });
        this.contextMenu.close();
    };
}
function bus() {
    handleActiveClass('bus');
    let a=window.localStorage.getItem("tipa");
    let b =window.localStorage.getItem("tipb");
     if(!a || !b){
         alert("请选择地点")
     }
     city=null;
     cityd=null;
     AMap.plugin('AMap.Geocoder', function() {
            let geocoder = new AMap.Geocoder({
                city: '全国'
            });
            let lnglata=a.split(",");
            let lnglatb=b.split(",");
            geocoder.getAddress(lnglata, function(status, result) {
                console.log(result,"dsfsdfdsf");
            if (status === 'complete' && result.info === 'OK') {
                city=result.regeocode.addressComponent.city || result.regeocode.addressComponent.province ;
                geocoder.getAddress(lnglatb, function(status, result) {
                  cityd= result.regeocode.addressComponent.city || result.regeocode.addressComponent.province ;
                  let transOptions = {
                      map: map,
                      city:city,
                      cityd:cityd,
                      panel: 'panel-bus',
                      policy: AMap.TransferPolicy.LEAST_TIME
                  };
                  let transfer = new AMap.Transfer(transOptions);
                  transfer.search(new AMap.LngLat(a.split(",")[0],a.split(",")[1]), new AMap.LngLat(b.split(",")[0],b.split(",")[1]), searchResult)
                })
            }
        });
        });

}
function driving() {
    // 驾车导航
    handleActiveClass('driving');
     let transfer = new AMap.Driving({
         map: map,
         panel: "panel-driving"
     });
     let origin=window.localStorage.getItem("tipa");
    let des =window.localStorage.getItem("tipb");
     if(!origin || !des){
         return
     }
     transfer.search(new AMap.LngLat(origin.split(",")[0],origin.split(",")[1]), new AMap.LngLat(des.split(",")[0],des.split(",")[1]),searchResult)
}
function walking() {
    //步行导航
    handleActiveClass('walking');
    let walking = new AMap.Walking({
        map: map,
        panel: "panel-walking"
    });
    let origin=window.localStorage.getItem("tipa");
    let des =window.localStorage.getItem("tipb");
     if(!origin || !des){
         return
     }
    // 根据起终点坐标规划步行路线
    walking.search([origin.split(",")[0],origin.split(",")[1]], [des.split(",")[0],des.split(",")[1]], searchResult);
}
function bike() {
    //骑行导航
    handleActiveClass('bike');
    let riding = new AMap.Riding({
        map: map,
        panel: "panel-bike"
    });
    let origin=window.localStorage.getItem("tipa");
    let des =window.localStorage.getItem("tipb");
     if(!origin || !des){
         return
     }
    //根据起终点坐标规划骑行路线
    riding.search([origin.split(",")[0],origin.split(",")[1]],[des.split(",")[0],des.split(",")[1]],searchResult)
}
function handleActiveClass(name) {
    $('#walking').removeClass("active");
    $('#bike').removeClass("active");
    $('#driving').removeClass("active");
    $("#bus").removeClass("active");
    let temp=$("#"+name);
    temp.addClass("active");
    $("#go").attr('route',name);

    $("#panel-bike").empty();
    $("#panel-bus").empty();
    $("#panel-walking").empty();
    $("#panel-driving").empty()
}



tipinfo=$(".tip-info");

function gettip(e) {
    tag_id=$(e).attr('id');
    window.localStorage.removeItem(tag_id);
    keywords = document.getElementById(tag_id).value;
    if(keywords.length>0){
        AMap.plugin('AMap.Autocomplete', function(){
        // 实例化Autocomplete
        let autoOptions = {
          city: '全国'
        };
        let autoComplete = new AMap.Autocomplete(autoOptions);
        tipinfo.empty();
        autoComplete.search(keywords, function(status, result) {
          // 搜索成功时，result即是对应的匹配数据
            html="";
            console.log(result.info==="OK");
            if(result.info==="OK"){
                window.localStorage.setItem("tips",JSON.stringify(result.tips));
                for(let i in result.tips){
                    let item =result.tips[i];
                    if(item.location.lat){
                        let taghtml = '<div '+'onClick="clicktip('+i+')"' +'class='+'"auto-item"'+'data-item="'+i+'">' +item.name+'<span class="auto-item-span">'+item.district+'</span></div>';
                        html=html+taghtml
                    }
                }
                tipinfo.html(html);
                tipinfo.attr('item',tag_id)
            }
        })
      })
    }else{
        $.get('/trip/gethistory',function (result) {
            window.localStorage.setItem('tips',JSON.stringify(result.results));
            html="";
            for(let i=0;i<result.results.length;i++){
                let item =result.results[i];
                    if(item.location.lat){
                        let taghtml = '<div '+'onClick="clicktip('+i+')"' +'class='+'"auto-item"'+'data-item="'+i+'">' +item.name+'<span class="auto-item-span">'+item.district+'</span></div>';
                        html=html+taghtml
                    }
            }
            tipinfo.html(html);
            tipinfo.attr('item',tag_id)

        })
    }
}
function clicktip(index) {
    target_id=tipinfo.attr('item');
    console.log(JSON.parse(window.localStorage.getItem('tips')));
    data = JSON.parse(window.localStorage.getItem('tips'))[index];
    $.ajax({
            url:'/trip/addhistory/',
            data:JSON.stringify(data),
            type:"POST",
            contentType:"application/json",
            success:function (res) {
                console.log(res)
            }
        });
    document.getElementById(target_id).value=data.name;
    window.localStorage.setItem(target_id,data.location.lng+","+data.location.lat);
    $(tipinfo).empty()

}


// 点击事件
$("#search-button").click(function( e ) {
    // 添加记录
    map.clearMap();
    let a=window.localStorage.getItem("tipa");
    let b =window.localStorage.getItem("tipb");
    if(!a||!b){
        alert("请选择地址");
        return
    }
    let routeType=$("#search-button").attr('route-type');
    if(routeType==='bike'){
        bike()
    }else if(routeType==='drive'){
        driving()
    }else if(routeType==='walk'){
        walking()
    }else{
        bus()
    }


});

$(".bus-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("bus");
    $("#search-button").attr("route-type",'bus');
});

$(".drive-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("drive");
    $("#search-button").attr("route-type",'drive')

});

$(".walk-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("walk");
    $("#search-button").attr("route-type",'walk');

});

$(".bike-tab").click(function() {
    let searchBtn=$("#route-searchbox-content");
    searchBtn.removeClass("bus drive walk bike");
    searchBtn.addClass("bike");
    $("#search-button").attr("route-type",'bike');
});




$("#gotrain").click(function (e) {
    console.log("火车票")
    let go = window.localStorage.getItem('tipb');
    let form =window.localStorage.getItem('tipa');
    if(!go||!form){
        alert("请选择出发地和目的地")
    }else{
        let url ="/trip/train/?start="+go+"&end="+form;
        window.open(url)
    }
});
$("#flight").click(function (e) {
    let go = window.localStorage.getItem('tipb');
    let form =window.localStorage.getItem('tipa');
    if(!go||!form){
        alert("请选择出发地和目的地")
    }else{
        let url ="/trip/flight/?start="+go+"&end="+form;
        window.open(url)
    }
});



function revertAddr() {
    // 调换位置
    tipaValue=document.getElementById("tipa").value;
    tipbValue=document.getElementById("tipb").value;
    document.getElementById("tipa").value=tipbValue;
    document.getElementById("tipb").value=tipaValue;
    itema=window.localStorage.getItem('tipa');
    itemb=window.localStorage.getItem('tipb');
    window.localStorage.setItem('tipa',itemb);
    window.localStorage.setItem('tipb',itema)
}


function inputClear(tag_id) {
    document.getElementById(tag_id).value=null;
    window.localStorage.removeItem(tag_id)
}

function searchResult(status,result) {
    console.log(status,result);
    if(status!=="complete" && result){
        alert(ERROR[result])
    }
}