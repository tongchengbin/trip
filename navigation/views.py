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
from django.utils import timezone

def wbdflightlist(start, end, date):
    '''
        获取飞机票策略1
        抓包地址:https://flight.qunar.com/site/oneway_list.html

    '''
    url = 'https://flight.qunar.com/touch/api/domestic/wbdflightlist'
    params = {"departureCity": start, "arrivalCity": end, "departureDate": date, "ex_track": "",
        "__m__": "a5ae1b541ae88b44d4eec8f8d47d39b9", "sort": 1, "_v": 3}
    try:
        res = requests.get(url, params=params)
        return res.json()
    except:
        return False


def touchInnerList(start, end, date):
    '''获取飞机票策略2'''
    url = "https://m.flight.qunar.com/flight/api/touchInnerList"
    data = {"arrCity": end, "baby": "0", "cabinType": "0", "child": "0", "depCity": start, "from": "touch_index_search",
            "goDate": date, "firstRequest": True, "startNum": 0, "sort": 5, "_v": 2, "underageOption": "", "more": 1,
            "__m__": "29da7c7146186274c3b33c7dcef04133"}
    try:
        res = requests.post(url, json=data)
        return res.json()
    except:
        return False


def index(request,*args,**kwargs):
    '''百度地图'''
    return render(request, "bd.bak.html")
def gethistory(request,*args,**kwargs):
    '''
        获取搜索历史
    :param request:
    :param args:
    :param kwargs:
    :return: 最后十条记录
    '''
    
    queryset = history.objects.raw('''select * from navigation_history ORDER BY id desc limit 10''')
    results=[]
    for item in queryset:
        results.append({
            "ctime":item.ctime,
            "name":item.name,
            "district":item.district,
            "location":{"lng": item.lng,
                        "lat": item.lat
                        },
            "address":item.address
        })
    return JsonResponse({"results":results})
    
def transit(request,*args,**kwargs):
    '''
        web导航
    :param request:
    :param args:
    :param kwargs:
    :return:
    '''
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
    pprint(data)
    if data['status']!=0:
        return JsonResponse(data)
    return JsonResponse(data)
    # return render(request,'transit.html',{"data":data})

def gd(request,*args,**kwargs):
    '''高德地图'''
    return render(request, "index.html")

def getTrainList(request,*args,**kwargs):
    '''
        火车高铁查询
    :param request:
    :param args:
    :param kwargs:
    :return:
    '''
    source=request.GET.get("start","武汉")
    des=request.GET.get("end","北京")
    #地址解析
    start=geocoder(source)
    end=geocoder(des)
    day=request.GET.get('date',None)
    station_file=os.path.join(settings.BASE_DIR,"static/station_code.json")
    stations=json.load(open(station_file,'r',encoding='utf-8'))
    start=stations.get(start)
    end= stations.get(end)
    if not start or not end:
        return HttpResponse("无法解析地址")
    if not day:
        day=datetime.today().strftime("%Y-%m-%d")
    train_url = "https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date={day}&leftTicketDTO.from_station={start}&leftTicketDTO.to_station={end}&purpose_codes=ADULT".format(day=day,start=start,end=end)
    res=requests.get(train_url)
    if res.status_code==200:
        data=res.json()['data']
        pprint(data)
        citydata = data['map']
        lis=data['result']
        result=[]
        for item in lis:
            temp=item.split("|")
            result.append({
                "car_id":temp[2],
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
                "from_station_no":temp[16],
                "to_station_no":temp[17],
                "seat_types":temp[-4]
            })
        if not result:
            return HttpResponse("没有合适的高铁票")
        return render(request,'train.html',{"result":result})

    return render(request,'train.html',{"res":{}})





def flight(request, *args, **kwargs):
    '''飞机票查询'''
    source = request.GET.get("start")
    des = request.GET.get("end")
    # 地址解析
    start = geocoder(source)
    end = geocoder(des)
    date = request.GET.get('date', datetime.today().strftime("%Y-%m-%d"))
    data = wbdflightlist(start, end, date)
    if data:
        print("策略1获取成功")
    else:
        data = touchInnerList(start, end, date)
        if data:
            print("策略2获取成功")
        else:
            return HttpResponse("没有查询到合适的航班")
    date = request.GET.get('date')
    if not date:
        date = request.GET.get('date', datetime.today().strftime("%Y-%m-%d"))
    url = "https://m.flight.qunar.com/flight/api/touchInnerList"
    data = {"arrCity": end, "baby": "0", "cabinType": "0", "child": "0", "depCity": start, "from": "touch_index_search",
            "goDate": date, "firstRequest": True, "startNum": 0, "sort": 5, "_v": 2, "underageOption": "", "more": 1,
            "__m__": "29da7c7146186274c3b33c7dcef04133"}
    res = requests.post(url, json=data)
    data = res.json()
    items = []
    if data['ret']:
        try:
            for item in data['data']['flights']:
                info = item['binfo']
                info['price'] = item['minPrice']
                items.append(info)
        except:
            pass
    if not items:
        return HttpResponse("没有查询到合适的航班")
    return render(request, 'flight.html', {"items": items})


def geocoder(origin,all=False):
    '''
        地址解析
    :param origin: 坐标
    :param all: 是否返回所有信息
    :return: city | 所有信息
    '''
   
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
    if all:
        return data
    city=data['result']['addressComponent']['city']
    if city.endswith("市"):
        city=city[:-1]
    return city

def addhistory(request,*args,**kwargs):
    '''
        添加搜索记录
    :param request:
    :param args:
    :param kwargs:
    :return:
    '''
    try:
        data=json.loads(request.body)
    except:
        return JsonResponse({})
    has=history.objects.filter(address=data['address'])
    if has:
        has.delete()
    else:
        history.objects.create(
            ctime=timezone.now(),
            address=data['address'],
            name=data['name'],
            lng=data['location']['lng'],
            lat=data['location']['lat'],
            district=data['district']
        )
    return JsonResponse({})



def getprice(request,*args,**kwargs):
    try:
        data=json.loads(request.body)
    except:
        return JsonResponse({})
    url="https://kyfw.12306.cn/otn/leftTicket/queryTicketPrice"
    train_date=datetime.strptime(data['date'],"%Y%m%d").strftime("%Y-%m-%d")
    params={"train_no":data['train_no'],
            "from_station_no":data['from_station_no'],
            "to_station_no":data['to_station_no'],
            "seat_types":data['seat_types'],
            "train_date":train_date}
    resp=requests.get(url,params=params)
    if resp.status_code==200:
        data=resp.json()
        try:
            data=data['data']
        except:
            print(data)
            data={}
        data['edz']=data.get("O","")
        data['swz']=data.get("A9",'')
        data['ydz']=data.get("M",'')
        data['WZ']=data.get('edz','')
        data['yw']=data.get('A3','')
        data['rw']=data.get('A4','')
        return JsonResponse(data)
    else:
        return HttpResponse("无法获取价格")