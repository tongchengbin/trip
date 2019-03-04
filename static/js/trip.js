const ak="GzVtCw9asuvgprsG0i2Ip4xuC4RDogpq"
function addrOptionsReq(addr){
    url="http://api.map.baidu.com/place/v2/suggestion?query=天安门&region=北京&city_limit=true&output=json&ak="+ak;
    $.get(url,function (data,status) {
        console.log(data)
    })
}


$(function(){
    $("#start-addr").bind('input porpertychange',function(e){
        addrOptionsReq(e.currentTarget.value);
    });
});