 function getListReasons(company, location, plant)
 {
    var endpoint2 = '';
    var razones = [];
    var idrazones = [];
    endpoint2 = '/iotajover/webapp/Request/ReaonsListFOGRequest'
    endpoint2 = endpoint2 + '?company='+company+'&location='+location+'&plant='+plant;
    var jqxhr = $.getJSON(endpoint2, function() {});
    jqxhr.done(function(data) {
        razones = data.descr
        idrazones = data.id
    });
    return {
       razones:razones,
       idrazones:idrazones
    }
 }

 function graficarMaquinaMachineStatus(arrayMaq, arrayLen, actualPos, startDttm, endDttm)
    {
            console.log('graficarMaquinaMachineStatus arrayLen: '+arrayLen+' actualPos: '+actualPos);
            var endpoint = '';
            var dates = [];
            var status = [];
            var actividades = [];
            var fechasInicio = [];
            var fechasFin = [];
            var razones = [];
            var descrRazones = [];
            var reasonsId = [];
            var reasonsDescr = [];
            var datalist, option;

            datalist = document.createElement("datalist");
            option = document.createElement("option");

            array = arrayMaq[actualPos].split(".");
            CompanyId = array[0];
            LocationId = array[1];
            PlantId = array[2];
            MachineGroupId = array[3];
            MachineId = array[4];

            reasonsDescr, reasonsId = getListReasons(CompanyId, LocationId, PlantId);

            for (var y = 0; y < reasonsId.length; y++)
            {
                console.log(reasonsDescr[y]);
                option.value = reasonsDescr[y];
                datalist.appendChild(option);
            }


            //chart = new Chart(ctx, config);
            endpoint = '';
            endpoint = '/iotajover/webapp/Request/MachineStatusFOGRequest';
            endpoint = endpoint + '?company='+CompanyId+'&location='+LocationId+'&plant='+PlantId+'&machineGroup='+MachineGroupId+'&machineId='+MachineId+'&startDttm='+startDttm+'&endDttm='+endDttm;
            console.log(endpoint);
            var jqxhr = $.getJSON(endpoint, function() {});

            jqxhr.done(function(data) {
                dates = data.dates
                status = data.status
                actividades = data.actividad
                fechasInicio = data.fechaInicio
                fechasFin = data.fechaFin
                razones = data.motivo

                var config = {
                        type: 'line',
                        data: {labels: [],
                            datasets: []
                        },
                        options: {
                            tooltips: {
                                intersect: false
                            },
                            maintainAspectRatio: false,
                            spanGaps: false,
                            elements: {
                                line: {
                                    tension: 0.000001,
                                    stepped: true
                                },
                                point: { radius: 0 }
                            },
                            plugins: {
                                filler: {
                                    propagate: false
                                }
                            },
                            scales: {
                                xAxes: [{
                                    type: "time",
                                    display: false,
                                    scaleLabel: {
                                        display: false,
                                        labelString: 'Date'
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: MachineId,
                                position: 'left'
                            }
                        }
                    };

                    var endpoint2 = '';
                    var reasons = [];
                    var idreasons = [];
                    endpoint2 = '/iotajover/webapp/Request/ReaonsListFOGRequest'
                    endpoint2 = endpoint2 + '?company='+CompanyId+'&location='+LocationId+'&plant='+PlantId;
                    var jqxhr = $.getJSON(endpoint2, function() {});
                    jqxhr.done(function(data) {
                        reasons = data.descr
                        idreasons = data.id

                        /*Llenado de tabla de paradas*/
                        var myCarouselIndicators = document.getElementById('carouselIndicators');
                        var count = 0;
                        var li, item;
                        var myCarouselInner = document.getElementById('carouselInner');
                        var form, div;
                        var label1, label2, label3, label4, label5;
                        var data1, data2, data3, data4, data5;
                        var bok, bcancel;

                        //for (var h = 0 ; h < actividades.length ; h++)
                        for (var h = 0 ; h < 6 ; h++)
                        {
                            if (actividades[h] == 'UnScheduleDown')
                            {}
                                if (count == 0)
                                {
                                    bok = document.createElement("button");
                                    bok.setAttribute('type','button');
                                    bok.setAttribute('class','btn btn-success')
                                    bok.innerHTML = "OK";
                                    bcancel = document.createElement("button");
                                    bcancel.setAttribute('type','button');
                                    bcancel.setAttribute('class','btn btn-danger')
                                    bcancel.innerHTML = "Cancel";
                                    li = document.createElement("li");
                                    li.setAttribute('data-target','#carouselExampleIndicators');
                                    li.setAttribute('data-slide-to',count);
                                    li.setAttribute('class','active');
                                    myCarouselIndicators.appendChild(li);
                                    form = document.createElement("form");
                                    div = document.createElement("div");
                                    div.setAttribute('class', 'item active');
                                    label1 = document.createElement("label");
                                    label1.innerHTML = "Actividad";
                                    label1.setAttribute('for','Actividad'+count);
                                    label2 = document.createElement("label");
                                    label2.innerHTML  = "Fecha/Hora Inicio";
                                    label2.setAttribute('for','FechaHoraInicio'+count);
                                    label3 = document.createElement("label");
                                    label3.innerHTML  = "Fecha/Hora Fin";
                                    label3.setAttribute('for','FechaHoraFin'+count);
                                    label4 = document.createElement("label");
                                    label4.innerHTML  = "Motivo";
                                    label4.setAttribute('for','Motivo'+count);
                                    label5 = document.createElement("label");
                                    label5.innerHTML  = "Nuevo Motivo";
                                    label5.setAttribute('for','NuevoMotivo'+count);
                                    data1 = document.createElement("input");
                                    data1.setAttribute('type','text');
                                    data1.setAttribute('class','form-control');
                                    data1.setAttribute('id','Actividad'+count);
                                    data1.value  = actividades[h];
                                    data1.disabled  = true;
                                    data2 = document.createElement("input");
                                    data2.setAttribute('type','text');
                                    data2.setAttribute('class','form-control');
                                    data2.setAttribute('id','FechaHoraInicio'+count);
                                    data2.value  = fechasInicio[h];
                                    data2.disabled  = true;
                                    data3 = document.createElement("input");
                                    data3.setAttribute('type','text');
                                    data3.setAttribute('class','form-control');
                                    data3.setAttribute('id','FechaHoraFin'+count);
                                    data3.value  = fechasFin[h];
                                    data3.disabled  = true;
                                    data4 = document.createElement("input");
                                    data4.setAttribute('type','text');
                                    data4.setAttribute('class','form-control');
                                    data4.setAttribute('id','Motivo'+count);
                                    data4.value  = razones[h];
                                    data4.disabled  = true;
                                    data5 = document.createElement("input");
                                    data5.setAttribute('type','text');
                                    data5.setAttribute('class','form-control');
                                    data5.setAttribute('list','List'+count);
                                    data5.required  = true;
                                    form.appendChild(label1);
                                    form.appendChild(data1);
                                    //form.appendChild(document.createElement("br"));
                                    form.appendChild(label2);
                                    form.appendChild(data2);
                                    //form.appendChild(document.createElement("br"));
                                    form.appendChild(label3);
                                    form.appendChild(data3);
                                    //form.appendChild(document.createElement("br"));
                                    form.appendChild(label4);
                                    form.appendChild(data4);
                                    form.appendChild(document.createElement("br"));
                                    form.appendChild(label5);
                                    form.appendChild(data5);
                                    datalist.setAttribute('id','List'+count);
                                    form.appendChild(datalist);
                                    form.appendChild(document.createElement("br"));
                                    form.appendChild(bok);
                                    form.appendChild(bcancel);
                                    div.appendChild(form);
                                    myCarouselInner.appendChild(div);

                                    count = count + 1;
                                }
                                else
                                {
                                    bok = document.createElement("button");
                                    bok.setAttribute('type','button');
                                    bok.setAttribute('class','btn btn-success')
                                    bok.innerHTML = "OK";
                                    bcancel = document.createElement("button");
                                    bcancel.setAttribute('type','button');
                                    bcancel.setAttribute('class','btn btn-danger')
                                    bcancel.innerHTML = "Cancel";
                                    li = document.createElement("li");
                                    li.setAttribute('data-target','#carouselExampleIndicators');
                                    li.setAttribute('data-slide-to',count);
                                    myCarouselIndicators.appendChild(li);
                                    form = document.createElement("form");
                                    div = document.createElement("div");
                                    div.setAttribute('class', 'item');
                                    label1 = document.createElement("label");
                                    label1.innerHTML = "Actividad";
                                    label1.setAttribute('for','Actividad'+count);
                                    label2 = document.createElement("label");
                                    label2.innerHTML  = "Fecha/Hora Inicio";
                                    label2.setAttribute('for','FechaHoraInicio'+count);
                                    label3 = document.createElement("label");
                                    label3.innerHTML  = "Fecha/Hora Fin";
                                    label3.setAttribute('for','FechaHoraFin'+count);
                                    label4 = document.createElement("label");
                                    label4.innerHTML  = "Motivo";
                                    label4.setAttribute('for','Motivo'+count);
                                    label5 = document.createElement("label");
                                    label5.innerHTML  = "Nuevo Motivo";
                                    label5.setAttribute('for','NuevoMotivo'+count);
                                    data1 = document.createElement("input");
                                    data1.setAttribute('type','text');
                                    data1.setAttribute('class','form-control');
                                    data1.setAttribute('id','Actividad'+count);
                                    data1.value  = actividades[h];
                                    data1.disabled  = true;
                                    data2 = document.createElement("input");
                                    data2.setAttribute('type','text');
                                    data2.setAttribute('class','form-control');
                                    data2.setAttribute('id','FechaHoraInicio'+count);
                                    data2.value  = fechasInicio[h];
                                    data2.disabled  = true;
                                    data3 = document.createElement("input");
                                    data3.setAttribute('type','text');
                                    data3.setAttribute('class','form-control');
                                    data3.disabled  = true;
                                    data3.setAttribute('id','FechaHoraFin'+count);
                                    data3.value  = fechasFin[h];
                                    data4 = document.createElement("input");
                                    data4.setAttribute('type','text');
                                    data4.setAttribute('class','form-control');
                                    data4.setAttribute('id','Motivo'+count);
                                    data4.value  = razones[h];
                                    data4.disabled  = true;
                                    data5 = document.createElement("input");
                                    data5.setAttribute('type','text');
                                    data5.setAttribute('class','form-control');
                                    data5.setAttribute('list','List'+count);
                                    data5.required  = true;
                                    form.appendChild(label1);
                                    form.appendChild(data1);
                                    //form.appendChild(document.createElement("br"));
                                    form.appendChild(label2);
                                    form.appendChild(data2);
                                    //form.appendChild(document.createElement("br"));
                                    form.appendChild(label3);
                                    form.appendChild(data3);
                                    //form.appendChild(document.createElement("br"));
                                    form.appendChild(label4);
                                    form.appendChild(data4);
                                    form.appendChild(document.createElement("br"));
                                    form.appendChild(label5);
                                    form.appendChild(data5);
                                    datalist.setAttribute('id','List'+count);
                                    form.appendChild(datalist);
                                    form.appendChild(document.createElement("br"));
                                    form.appendChild(bok);
                                    form.appendChild(bcancel);
                                    div.appendChild(form);
                                    myCarouselInner.appendChild(div);

                                     count = count + 1;
                                }
                             //}
                        }


                    if (document.contains(document.getElementById(MachineId+'-div'))) {
                                document.getElementById(MachineId+'-div').remove();
                    }
                    var newDiv = $('<div/>',{
                            id: MachineId+'-div'
                        });
                    $('#machine-panel').append(newDiv);
                    var newCanvas = $('<canvas/>',{
                            id: MachineId
                        }).prop({
                            width: 400,
                            height: 100
                        });
                    $('#'+MachineId+'-div').append(newCanvas);
                    chart = new Chart(MachineId, config);
                for (i = 0; i < status.length; i++){
                    values = status[i].slice(1, status[i].length);
                    if (status[i][0] != 'none'){
                        if (status[i][0] == 'UnScheduleDown'){
                            agregarSerieTrend(chart, config, dates, status[i][0], values, 'db4343');
                        }else if(status[i][0] == 'Operating'){
                            agregarSerieTrend(chart, config, dates, status[i][0], values, '8adb43');
                        }else{
                            agregarSerieTrend(chart, config, dates, status[i][0], values, '4380db');
                        }
                    }
                }
                if (actualPos < arrayLen - 1)
                {
                    setTimeout(function() {
                        graficarMaquinaMachineStatus(arrayMaq, arrayLen, actualPos + 1, startDttm, endDttm);
                    }, 5000);
                }
                else
                {
                    $('#example2').DataTable();
                }
                });
            });
    }

function reportar()
{
    //alert('hola')
}

function agregarSerieTrend(chart, config, labels, label, data, colorSet){
        if (config.data.labels.length == 0){
            for (var index = 0; index < labels.length; ++index) {
                config.data.labels.push(labels[index]);
            }
        }
        if (colorSet == 'none'){
            color =  colorAleatorio();
            newColor = '#'+color;
            var newDataset = {
                    label: label,
                    data: [],
                    backgroundColor: newColor,
                    borderColor: newColor,
                    fill: false
            };
        }else{
            color = colorSet
            newColor = '#'+color;
            var newDataset = {
                    label: label,
                    data: [],
                    backgroundColor: newColor,
                    borderColor: newColor,
                    fill: true
            };
        }

        for (var index = 0; index < data.length; ++index) {
                newDataset.data.push(data[index]);
        }
        config.data.datasets.push(newDataset);
        chart.update();
    }

function getParamRequest()
{
            var arrayMachine = [];
            var optionMachine;
            optionMachine = document.getElementsByName("machine");
            arrayMachine.push(optionMachine[0].getAttribute("id"));
            array = arrayMachine[0].split(".");
            CompanyId = array[0];
            LocationId = array[1];
            PlantId = array[2];
            MachineGroupId = array[3];
            MachineId = array[4];
            return arrayMachine
}

function graficarMachineStatus()
{
        var arrayReq = getParamRequest();
        f = new Date();
        fechaFin = f.getFullYear() + "-" + ("0"+(f.getMonth() +1)).slice(-2) + "-" + ("0"+f.getDate()).slice(-2);
        f.setDate(f.getDate()-1);
        fechaInicio = f.getFullYear() + "-" + ("0"+(f.getMonth() +1)).slice(-2) + "-" + ("0"+f.getDate()).slice(-2);
        if ((typeof fechaInicio != 'undefined' && fechaInicio) && (typeof fechaFin != 'undefined' && fechaFin) && arrayReq.length > 0 ) {
            graficarMaquinaMachineStatus(arrayReq, arrayReq.length, 0 , fechaInicio, fechaFin);
        }
}