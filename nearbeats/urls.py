"""
URL configuration for nearbeats project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path
from busqueda import views as busqueda_views


from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
<<<<<<< Updated upstream
    path('', busqueda_views.home, name='home'),  # Include the URLs from the busqueda app
    path('buscar/', busqueda_views.base, name='buscar'),

]




urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
    path('',mainViews.home, name = 'home'), #debería poder acceder a la base directamente? no
    path('buscar/', mainViews.base, name='buscar') #esto lo que hace es 
    #path('home/',mainViews.home),
]

>>>>>>> Stashed changes
