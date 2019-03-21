from django.shortcuts import render,HttpResponse
from django.http.response import JsonResponse
from navigation.models import history
import json
import os
import re
from urllib.parse import quote
from pprint import pprint
from datetime import datetime
from django.conf import settings
ak="GzVtCw9asuvgprsG0i2Ip4xuC4RDogpq"
# Create your views here.
import requests
def index(request,*args,**kwargs):
    return render(request, "index.html")


def get_options(request,*args,**kwargs):
    url="http://api.map.baidu.com/place/v2/suggestion?query=天安门&region=false&city_limit=false&output=json&ak={ak}".format(ak=ak)
    res=requests.get(url)
    return JsonResponse({"options":res.json().get("result")})
def gethistory(request,*args,**kwargs):
    queryset = history.objects.all().order_by('-ctime')[:10]
    results=[]
    for item in queryset:
        results.append({
            "name":item.name,
            "district":item.address,
            "location":{"lng": item.lng,
                        "lat": item.lat
                        },
            "address":item.address
        })
    return JsonResponse({"results":results})
    
def transit(request,*args,**kwargs):
    tp=request.GET.get('type','walk')
    origin=request.GET.get('origin')
    destination = request.GET.get('destination')
    origin="30.489599,114.422979"
    destination="30.513467,114.404654"
    if not tp or not origin:
        return HttpResponse()
    drive="http://api.map.baidu.com/directionlite/v1/driving"
    bike="http://api.map.baidu.com/directionlite/v1/riding"
    walk="http://api.map.baidu.com/directionlite/v1/walking"
    bus="http://api.map.baidu.com/directionlite/v1/transit"
    params={
        "ak":"GRVPtshoVTO5plLfP8EwCmrehtlOmEmg",
        "origin":origin,
        "destination":destination
    }
    if tp=="drive":
        url=drive
    elif tp=='bike':
        url=bike
    elif tp=='walk':
        url=walk
    else:
        url=bus
    response= requests.get(url,params=params)
    data=response.json()
    if data['status']!=0:
        return JsonResponse(data)
    print(data)
    return JsonResponse(data)
    # return render(request,'transit.html',{"data":data})

def gd(request,*args,**kwargs):
    return render(request,"gd.html")


def tip(request,*args,**kwargs):
    queryset=history.objects.all().order_by('-ctime').values('name','address','lng','lat')[:10]
    results=[]
    for i in queryset:
        results.append(i)
    return render(request,"TipBody.html")

def getTrainList(request,*args,**kwargs):
    source=request.GET.get("start","武汉")
    des=request.GET.get("end","北京")
    #地址解析
    start=geocoder(source)
    end=geocoder(des)
    
    day=request.GET.get('day',None)
    station_file=os.path.join(settings.BASE_DIR,"static/station_code.json")
    stations=json.load(open(station_file,'r',encoding='utf-8'))
    start=stations.get(start)
    end= stations.get(end)
    if not day:
        day=datetime.today().strftime("%Y-%m-%d")
    train_url = "https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date={day}&leftTicketDTO.from_station={start}&leftTicketDTO.to_station={end}&purpose_codes=ADULT".format(day=day,start=start,end=end)
    print(train_url)
    res=requests.get(train_url)
    if res.status_code==200:
        data=res.json()['data']
        citydata = data['map']
        lis=data['result']
        result=[]
        for item in lis:
            temp=item.split("|")
            print(temp)
            result.append({
                "car_no":temp[3],
                "start":citydata[temp[6]],
                "end":citydata[temp[7]],
                "start_time":temp[8],
                "end_time":temp[9],
                "time":temp[10],
                "departure_date":temp[13],
                "swz":temp[32],#商务座
                "ydz":temp[31],
                "edz":temp[30],#二等座
                "rw":temp[23],#软卧
                "yw":temp[19],#硬卧
                "status":temp[29] or "无",
            })
        if not result:
            return HttpResponse("没有合适的高铁票")
        return render(request,'train.html',{"result":result})

    return render(request,'train.html',{"res":{}})


def flight(request,*args,**kwargs):
    '''飞机票查询'''
    source = request.GET.get("start", "武汉")
    des = request.GET.get("end", "北京")
    # 地址解析
    start = geocoder(source)
    end = geocoder(des)
    date=request.GET.get('date',datetime.today().strftime("%Y-%m-%d"))
    url = "https://m.flight.qunar.com/flight/api/touchInnerList"
    data = {"arrCity": end, "baby": "0",
            "cabinType": "0",
            "child": "0",
            "depCity": start,
            "from": "touch_index_search",
            "goDate": date,
            "firstRequest": True,
            "startNum": 0,
            "sort": 5,
            "_v": 2,
            "underageOption": "",
            "more": 1,
            "__m__": "29da7c7146186274c3b33c7dcef04133"}
    res=requests.post(url,json=data)
    data=res.json()
    items=[]
    print(data)
    if data['ret']:
        try:
            for item in data['data']['flights']:
                pprint(item)
                info=item['binfo']
                info['price']=item['minPrice']
                items.append(info)
        except:
            pass
    if not items:
        return HttpResponse("没有查询到合适的航班")
    return render(request,'flight.html',{"items":items})


def geocoder(origin):
    '''地址解析 返回city name'''
    lng,lat = origin.split(",")
    url="http://api.map.baidu.com/geocoder/v2/"
    params={
        "ak":ak,
        "latest_admin":1,
        "pois":1,
        "location":"%s,%s"%(lat,lng),
        "output":"json"
    }
    response=requests.get(url,params=params)
    data=response.json()
    pprint(data)
    city=data['result']['addressComponent']['city']
    if city.endswith("市"):
        city=city[:-1]
    return city