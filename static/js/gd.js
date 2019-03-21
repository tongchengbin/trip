/**
 * Created by Administrator on 2019/3/21.
 */
// 導航都是point
let map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom:11, //初始化地图层级
    center: [116.397428, 39.90923] //初始化地图中心点
});
//输入提示
let autoa = new AMap.Autocomplete({
    input: "tipinputa"
});
// let autob = new AMap.Autocomplete({
//     input: "tipinputb"
// });
tipb=$("#input");


// AMap.event.addListener(autoa, "select", selecta);//注册监听，当选中某条记录时会触发
// AMap.event.addListener(autob, "select", selectb);
function selectb(a) {
    let location=a.poi.location;
    let tag=$("#tipinputb");
    tag.attr('origin',location.lng+","+location.lat);
    autob.value=a.poi.district+a.poi.name
}
function selecta(a) {
    let location=a.poi.location;
    let tag=$("#tipinputa");
    tag.attr('origin',location.lng+","+location.lat);
    autoa.value=a.poi.district+a.poi.name
}
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
                input_tag.value=result.regeocode.formattedAddress
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
     let transOptions = {
         map: map,
         city:"北京市",
         panel: 'panel-bus',
         policy: AMap.TransferPolicy.LEAST_TIME
     };
     if(!a || !b){
         alert("请选择地点")
     }
     let transfer = new AMap.Transfer(transOptions);
     transfer.search(new AMap.LngLat(a.split(",")[0],a.split(",")[1]), new AMap.LngLat(b.split(",")[0],b.split(",")[1]), function(status, result) {
         console.log(result,status)
    })
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
     transfer.search(new AMap.LngLat(origin.split(",")[0],origin.split(",")[1]), new AMap.LngLat(des.split(",")[0],des.split(",")[1]), function(status, result) {
    // result即是对应的公交路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_TransferResult

    })
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
    walking.search([origin.split(",")[0],origin.split(",")[1]], [des.split(",")[0],des.split(",")[1]], function(status, result) {
    // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
    });
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
    riding.search([origin.split(",")[0],origin.split(",")[1]],[des.split(",")[0],des.split(",")[1]], function(status, result) {
    // result即是对应的骑行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_RidingResult
    })
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
function toaddrname(lng,lat,flag) {
    AMap.service(["AMap.PlaceSearch"], function() {
    //构造地点查询类
    let placeSearch = new AMap.PlaceSearch({
        type: '',
        pageSize: 5, // 单页显示结果条数
        pageIndex: 1, // 页码
        city: "", // 兴趣点城市
        citylimit: false,  //是否强制限制在设置的城市内搜索
        map: map, // 展现结果的地图实例
        panel: "panel", // 结果列表将在此容器中进行展示。#}
        autoFitView: false // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
    });
    let cpoint = [lng, lat]; //中心点坐标
    placeSearch.searchNearBy('', cpoint, 200, function(status, result) {
        if(status==='complete'){
            console.log(result);
            if(flag===0){
                tag = $("#tipinputa");

            }else{
                tag = $("#tipinputb")
            }
            tag.attr('value',result.poiList.pois[0].address);
            tag.attr('origin',result.poiList.pois[0].location.lng+","+result.poiList.pois[0].location.lat)

        }else{
            alert("无法识别定位点")
        }
    });
    });
}
function exchange() {
    // 交换位置
    let a=$("#tipinputa");
    let b=$("#tipinputb");
    valueA=autoa.input.value;
    valueB=autob.input.value;
    autoa.input.value=valueB;
    autob.input.value=valueA;
    originA=a.attr('origin');
    originB=b.attr('origin');
    a.attr('origin',originB);
    b.attr('origin',originA);
}
function savelocation() {
    // 记录地点

}
function searchtip(e,flag) {
    AMap.plugin('AMap.Autocomplete', function(){
        let autoOptions = {
            city: '全国'
        };
        let autoComplete= new AMap.Autocomplete(autoOptions);
        autoComplete.search(e.value, function(status, result) {
        results = JSON.stringify(result);
        localStorage.results = results;
        // to html
        content="";
        for(let i in result){
            content+="<div class='auto-item'>南京1912街区<span class='auto-item-span'>江苏省南京市玄武区</span></div>"
        }
        console.log(content);
        contain=$("#tipa");
        contain.innerHTML="";
        contain.innerHTML="<div><h1>12312321</h1></div>"

    })
    })
}
function sethistory(e,flag) {
    tag=$(e);
    if(tag.value===undefined || tag.value.length===0){
        if(flag===0){
            $(".historya").css("display","block")
        }else{
            $(".historyb").css("display","block")
        }
    }
}
function clearhistory(flag) {
    if(flag===0){
        $(".historya").css('display','none')
    }else{
        $(".historyb").css('display','none')
    }
}



tipinfo=$(".tip-info");

function gettip(e) {
    tag_id=$(e).attr('id');
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
                    let taghtml = '<div '+'onClick="clicktip('+i+')"' +'class='+'"auto-item"'+'data-item="'+i+'">' +item.name+'<span class="auto-item-span">'+item.district+'</span></div>';
                    html=html+taghtml
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
                    let taghtml = '<div '+'onClick="clicktip('+i+')"' +'class='+'"auto-item"'+'data-item="'+i+'">' +item.name+'<span class="auto-item-span">'+item.district+'</span></div>';
                    html=html+taghtml
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