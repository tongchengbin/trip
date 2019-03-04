from django.shortcuts import render
from django.http.response import JsonResponse
ak="GzVtCw9asuvgprsG0i2Ip4xuC4RDogpq"
# Create your views here.
import requests
def index(request,*args,**kwargs):
    return render(request,"navigation/index.html")


def get_options(request,*args,**kwargs):
    url="http://api.map.baidu.com/place/v2/suggestion?query=天安门&region=false&city_limit=false&output=json&ak={ak}".format(ak=ak)
    res=requests.get(url)
    return JsonResponse({"options":res.json().get("result")})