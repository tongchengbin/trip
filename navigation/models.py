from django.db import models

# Create your models here.


class history(models.Model):
    id=models.AutoField(primary_key=True)
    address=models.CharField(max_length=64,verbose_name='address')
    name=models.CharField(max_length=64,verbose_name='name')
    lat=models.FloatField(verbose_name="lat")
    lng=models.FloatField(verbose_name='lng')
    ctime=models.DateTimeField(auto_now_add=True)