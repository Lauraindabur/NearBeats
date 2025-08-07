from django.shortcuts import render
from django.http import HttpResponse    

# Create your views here.

def base(request):
    #return HttpResponse("<h1>Welcome to the Near Beats Project!</h1>")   
    return render(request, "main/base.html")  # Le pasamos el request y llamamos a la template base.html 
    
def home(request):
    return render(request, "main/home.html")  # Asegúrate de que el archivo home.html existe en la carpeta templates/main
