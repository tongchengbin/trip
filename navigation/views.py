from django.shortcuts import render,HttpResponse
from django.http.response import JsonResponse
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