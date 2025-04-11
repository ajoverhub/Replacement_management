from django.shortcuts import render # type: ignore
from django.http import HttpResponse # type: ignore
import requests
import json
from rest_framework.views import APIView
from rest_framework.response import Response
# Create your views here.

def inicio(request):
    if request.method == 'POST':
        kronos_code = request.POST.get('kronos_code')
        work_order = request.POST.get('work_order')

        return HttpResponse(f'Código Kronos: {kronos_code}, Orden de Trabajo: {work_order}')

    return render(request, 'replacementapp/inicio.html')

def searchOt(request):
    
    if request.method == 'GET':
        print("ENTRO")
        codigo_kronos = request.GET.get('codigo_kronos')
        orden_trabajo = request.GET.get('orden_trabajo')
        businessunit = request.GET.get('businessunit')
            
        if not codigo_kronos or not orden_trabajo or not businessunit:
            return HttpResponse(json.dumps({"error": "Todos los campos (código kronos, orden de trabajo y unidad de negocio) son obligatorios"}))

        headers = {'Accept': 'application/json'}
        url = 'http://microintegratortst.ajover.com:8290/consulta_ot_empleado?bu={0}&ot={1}&emplid={2}'.format(businessunit,orden_trabajo,codigo_kronos) 
        r = requests.get(url,headers= headers)
        print(url)
        print("estado de la solicitud",r.status_code)
    if r.status_code == 200:
        try:
            casoRs = json.loads(r.text)
            print(casoRs)  # Verifica la estructura completa de la respuesta
            
            if 'response' in casoRs and 'fields' in casoRs['response']:
                if casoRs['response']['fields']:
                    businessunit =casoRs ['response']['fields'][0].get('businessunit', 'Desconocido')
                    orden_trabajo = casoRs['response']['fields'][0].get('ot', 'Desconocido')
                    emplid=casoRs['response']['fields'][0].get('emplid', 'Desconocido')
                    nombre_Empleado = casoRs['response']['fields'][0].get('nombre_empleado', 'Desconocido')
                    status = casoRs['response']['fields'][0].get('status', 'error')
                    message=casoRs['response']['fields'][0].get('mesaage', 'error')
                    
                    print(f"Valor de status: '{status}'")  # Verifica el valor de 'status'
                    
                    if status == 'success':
                        context = {
                            'orden_trabajo': orden_trabajo,
                            'tecnico': nombre_Empleado
                        }
                        print(context)  # Verifica el contexto antes de renderizar
                        return HttpResponse(json.dumps(context))
                    else:
                        return HttpResponse(json.dumps({"error": casoRs.get('MENSAJE', 'Error en la respuesta')}))
                else:
                    return HttpResponse(json.dumps({"error": "No se encontró información en 'fields'."}), status=404)
            else:
                return HttpResponse(json.dumps({"error": "La estructura de la respuesta es incorrecta."}), status=500)
        except json.JSONDecodeError:
            return HttpResponse(json.dumps({"error": "Error al decodificar la respuesta de la API externa."}), status=500)
    else:
        return HttpResponse(json.dumps({"error": f"La solicitud falló con código: {r.status_code}"}), status=r.status_code)
     

def busqueda_repuestos(request):
    if request.method == 'GET':
        # orden_trabajo = request.GET.get('orden_trabajo')
        # tecnico =request.GET.get('tecnico')
        # context = {
        #        'orden_trabajo': orden_trabajo,
        #        'tecnico': tecnico
        #                 }
        return render(request, 'replacementapp/busqueda_seleccion.html')


def buscarProducto(request):
    if request.method == 'GET':  
        repuesto = request.GET.get('repuesto')
        businessUnit = request.GET.get('inventoryUnit')
        print(f"Buscando producto: {repuesto} en BU: {businessUnit}")

        url = "http://10.25.7.116:8290/services/bodegaRepuesto/consulta" 
            
        data = {
            "objeto": {
                'bu': f'{businessUnit}',
                'INV_ITEM_ID': f'{repuesto}',
                'DESCR': f'%{repuesto}%'
            }
        }
        
        headers = {
            'Content-Type': 'application/json',  
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)

            if response.status_code == 200:
                # Obtenemos la respuesta JSON
                data = response.json()
                
                arreglo = data.get("objeto", {}).get("filas", [])
                if arreglo:
                    arreglo_json = json.dumps(arreglo, indent=4)
                    print("Productos encontrados:", arreglo_json)
                    return HttpResponse(arreglo_json, content_type='application/json')  # Enviar los datos al frontend
                else:
                    print("No se encontraron productos.")
                    return HttpResponse(json.dumps({"message": "No se encontraron productos."}), 
                                       content_type='application/json', status=404)
            else:
                print(f"Error en la respuesta: {response.status_code}")
                return HttpResponse(json.dumps({"message": "Error en la solicitud"}), 
                                   content_type='application/json', status=500)

        except requests.exceptions.RequestException as e:
            print(f"Error de conexión: {e}")
            return HttpResponse(json.dumps({"message": f"Error de conexión: {str(e)}"}), 
                               content_type='application/json', status=500)

        
def unidadMantenimiento(request):
    if request.method == 'GET':
        # Obtener el parámetro 'businessUnit' de la URL
        businessUnit = request.GET.get('businessUnit')

        # Verificar si el parámetro está presente
        if not businessUnit:
            return HttpResponse(
                json.dumps({"message": "El parámetro 'businessUnit' es obligatorio."}),
                content_type='application/json', status=400)

        print("Consultando unidades de mantenimiento para BU:", businessUnit)

        # URL de la API externa
        url = "http://10.25.7.116:8290/services/unidad_mantenimiento/consultaunidadinventario"

        # Datos para la solicitud
        data = {
            "objeto": {
                "bu": businessUnit
            }
        }
        
        headers = {
            'Content-Type': 'application/json',
            # Si es necesario agregar más encabezados como token o autenticación:
            # 'Authorization': 'Bearer <tu_token>',
        }

        try:
            # Realizar la solicitud POST a la API
            response = requests.post(url, json=data, headers=headers)

            # Verificar si la respuesta es exitosa
            if response.status_code == 200:
                # Obtener los datos JSON de la respuesta
                data = response.json()

                # Procesar la respuesta y obtener el arreglo de inventario
                arreglo = data.get("salida", {}).get("inventario", [])

                if arreglo:
                    # Si hay datos de inventario, devolverlos como JSON
                    arreglo_json = json.dumps(arreglo, indent=4)
                    print("Unidades de mantenimiento encontradas:", arreglo_json)
                    return HttpResponse(arreglo_json, content_type='application/json')
                else:
                    # Si no se encuentran unidades de mantenimiento
                    print("No se encontraron unidades de mantenimiento.")
                    return HttpResponse(
                        json.dumps({"message": "No se encontraron unidades de mantenimiento."}),
                        content_type='application/json', status=404)

            else:
                # Si la respuesta tiene un código de estado diferente a 200
                print(f"Error en la respuesta de la API: {response.status_code}")
                return HttpResponse(
                    json.dumps({"message": f"Error en la solicitud, código: {response.status_code}"}),
                    content_type='application/json', status=response.status_code)

        except requests.exceptions.RequestException as e:
            # Si ocurre un error en la conexión
            print(f"Error de conexión a la API: {e}")
            return HttpResponse(
                json.dumps({"message": f"Error de conexión a la API: {str(e)}"}),
                content_type='application/json', status=500)
        
def actualizarCantidades(request):
    if request.method == 'POST':
        try:
            # Recibe los datos JSON del cuerpo de la solicitud
            data = json.loads(request.body)
            
            print (data)
            print ("esta es la lista ")

            # Crear la estructura de datos que espera el servicio
            items_data = {
                "items": data
            }

            # URL del servicio WSO2
            url = "http://10.25.7.116:8290/actualizarCantidades/informacion"
            headers = {'Content-Type': 'application/json'}

            # Realizar la solicitud POST al servicio WSO2
            response = requests.post(url, json=items_data, headers=headers)

            if response.status_code == 200:
                result = response.json()
                return HttpResponse(result, status=200)
            else:
                return HttpResponse({"message": "Error al actualizar cantidades", "error": response.text}, status=400)

        except requests.exceptions.RequestException as e:
            return HttpResponse({"message": f"Error de conexión: {str(e)}"}, status=500)

    return HttpResponse({"message": "Método no permitido. Solo se aceptan solicitudes POST."}, status=405)
            
def formulario_actualizar_cantidades(request):
    if request.method == 'GET':
     
        if 'identificadorRegistro' in request.GET:
            
            identificador_registro = request.GET.get('identificadorRegistro')
            warehouse_id = request.GET.get('warehouse_id')
            item_id = request.GET.get('item_id')
            location_id = request.GET.get('location_id')
            status = request.GET.get('status', 'A')
            disponible = request.GET.get('disponible')
            reservado = request.GET.get('reservado')
            requerida = request.GET.get('requerida')
            uom = request.GET.get('uom', 'UN')
            kronos_code = request.GET.get('ARI_KRONOSCODE')
            
            # Crear la estructura de datos para enviar al servicio
            data = {
                "items": [
                    {
                        "identificadorRegistro": identificador_registro,
                        "warehouse_id": warehouse_id,
                        "item_id": item_id,
                        "location_id": location_id,
                        "status": status,
                        "disponible": disponible,
                        "reservado": reservado,
                        "requerida": requerida,
                        "uom": uom,
                        "ARI_KRONOSCODE": kronos_code
                    }
                ]
            }  
            # URL del servicio WSO2
            url = "http://10.25.7.116:8290/actualizarCantidades/informacion"
            
            try:
                # Realizar la solicitud POST al servicio WSO2
                headers = {'Content-Type': 'application/json'}
                response = requests.post(url, json=data, headers=headers)
                
                if response.status_code == 200:
                    result = response.json()
                    context = {
                        'success': True,
                        'message': 'Cantidades actualizadas correctamente',
                        'result': result
                    }
                else:
                    context = {
                        'success': False,
                        'message': f'Error al actualizar cantidades: {response.status_code}',
                        'error': response.text
                    }
                    
                return render(request, 'replacementapp/resultado_actualizacion.html', context)
                
            except requests.exceptions.RequestException as e:
                context = {
                    'success': False,
                    'message': f'Error de conexión: {str(e)}'
                }
                return render(request, 'replacementapp/resultado_actualizacion.html', context)
    
        # Si no hay parámetros, mostrar el formulario
        return render(request, 'replacementapp/formulario_actualizacion.html')
   