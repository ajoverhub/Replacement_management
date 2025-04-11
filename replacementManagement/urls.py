from django.urls import path
from django.conf.urls import url
from . import views
 
urlpatterns = [
    path('/inicio_prueba', views.inicio, name='inicio'),
    path('/busqueda_repuestos', views.busqueda_repuestos, name='busqueda_repuestos'),
    path('/searchOt', views.searchOt, name='searchOt'),
    path('/buscarProducto', views.buscarProducto, name='buscarProducto'),
    path('/unidadMantenimiento', views.unidadMantenimiento, name='unidadMantenimiento'),
    path('/actualizarCantidades', views.actualizarCantidades, name='actualizarCantidades'),
    path('/formulario_actualizar_cantidades', views.formulario_actualizar_cantidades, name='formulario_actualizar_cantidades'),
    
]