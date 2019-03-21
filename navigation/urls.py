"""Trip URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from navigation import views
urlpatterns = [
    path('',views.index ),
    path("get_options/",views.get_options),
    path("transit/", views.transit),
    path("gd/", views.gd),
    path('gethistory/',views.gethistory),
    path('train/',views.getTrainList),
    path('flight/',views.flight)

]
