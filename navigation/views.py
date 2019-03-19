from django.shortcuts import render,HttpResponse
from django.http.response import JsonResponse
from navigation.models import history
import json
import os
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


def transit(request,*args,**kwargs):
    tp=request.GET.get('type','walk')
    origin=request.GET.get('origin')
    if not tp or not origin:
        return HttpResponse("")
    destination=request.GET.get('destination')
    drive="http://api.map.baidu.com/directionlite/v1/driving"
    bike="http://api.map.baidu.com/directionlite/v1/riding"
    walk="http://api.map.baidu.com/directionlite/v1/walking"
    bus="http://api.map.baidu.com/directionlite/v1/transit"
    params={
        "ak":"GRVPtshoVTO5plLfP8EwCmrehtlOmEmg",
        "origin":origin,
        "destination":destination,
    }
    if tp=="drive":
        url=drive
    elif tp=='bike':
        url=bike
    elif tp=='walk':
        url=walk
    else:
        url=bus
    print(url)
    data = requests.get(url,params=params).json()
    if data['status']!=0:
        return HttpResponse(data['message'])
    routes=data['result']['routes'][0]
    origin=data['result']['origin']  #秒
    destination=data['result'] ['destination'] #米
    stepsCount=len(routes['steps'])
    return render(request,'transit.html',{"routes":routes,"origin":origin,"destination":destination,"stepsCount":stepsCount})

def gd(request,*args,**kwargs):
    return render(request,"gd.html")


def historylocation(request,*args,**kwargs):
    queryset=history.objects.all().order_by('-ctime').values('name','address','lng','lat')[:10]
    results=[]
    for i in queryset:
        print(i)
        results.append(i)
    return HttpResponse(json.dumps(results))


def getlocation(request,*args,**kwargs):
    pass


def getTrainList(request,*args,**kwargs):
    tripType=request.GET.get('type','train')
    start=request.GET.get("start","武汉")
    end=request.GET.get("end","北京")
    if start.endswith("市"):
        start=start[:-1]
    if end.endswith("市"):
        end = end[:-1]
    day=request.GET.get('day',None)
    station_file=os.path.join(settings.BASE_DIR,"static/station_code.json")
    stations=json.load(open(station_file,'r',encoding='utf-8'))
    start=stations.get(start)
    end= stations.get(end)
    if not day:
        day=datetime.today().strftime("%Y-%m-%d")
    if tripType=='train':
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
            return render(request,'train.html',{"result":result})
    elif tripType=="fly":
        url = 'https://touch.dujia.qunar.com/list?modules=list%2CbookingInfo%2CactivityDetail&dep={}&query={}&dappDealTrace=false&mobFunction=%E6%89%A9%E5%B1%95%E8%87%AA%E7%94%B1%E8%A1%8C&cfrom=zyx&it=FreetripTouchin&date=&configDepNew=&needNoResult=true&originalquery={}&limit=10,28&includeAD=true&qsact=search'.format(
            start, end, end)
        headers= {
            'cookie':'QN99=8770; QN1=eIQjmVtYQgbBDaEiPevvAg==; csrfToken=zKMVroGqYK6fdBphXg8rqQ3MpcaiZ7TZ; QN269=AA9586A58FEC11E88A24FA163E233FC1; QN601=3f55b4673bbd18ac3206bfea7c5996d3; QunarGlobal=10.86.213.148_6291bf49_164d0ba9dbf_-1a4d|1532510727219; _i=RBTKSaIAM3KBlurx6OwRjfuQ8pEx; QN300=auto_4e0d874a; QN163=0; QN6=auto_4e0d874a; QN48=tc_427b9f2555dccb4c_164d9787381_d960; _RSG=Ue4lzWGVuXAKnGpozKI.OB; _RDG=28c738c8ddc979203b2642a9f86b2ac273; _RGUID=a8787d08-3dbc-4a1e-b63e-494f72cd0c54; QN205=auto_4e0d874a; QN234=home_free_t; _vi=Xan8_FldA2NGBwqzRSKDNIYHisxd4ARxiomsg1mowQsC4OV3wCXnooJECkbZWsL9_3XGq9mmj5lTyMlGPRfgZD0jC_eS-Vas8fJyOdtOVO02USpBUqqwRZ1LfhiofVGvkPVi9NW0omogB1BkpWCaX2atkxba7uWItHjFuSd5R2NK; QN162=%E6%B7%B1%E5%9C%B3; QN233=FreetripTouchin; DJ12=eyJxIjoi5p2t5bee6Ieq55Sx6KGMIiwic3UiOiI4MDU5MjU4OTIiLCJkIjoi5rex5ZyzIiwiZSI6IkEiLCJsIjoiMCwyOCIsInRzIjoiZGQxNDZmZWYtMWY2NC00N2U5LWIyNjAtMTY0ODE2ZTlmYmQ0In0; _RF1=113.110.176.137; _pk_ref.1.8600=%5B%22%22%2C%22%22%2C1533395038%2C%22http%3A%2F%2Ftouch.qunar.com%2F%22%5D; _pk_ses.1.8600=*; _pk_id.1.8600=92302397325aca81.1533353790.5.1533395068.1533392908.; QN243=168',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 '
                          '(KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
            'Referer': 'https://touch.dujia.qunar.com/p/list?cfrom=zyx&dep={}&query={}&it=FreetripTouchin&et=home_free_t'.format(quote(start),quote(end))
        }
    return render(request,'train.html',{"res":{}})
    