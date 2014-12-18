require(
[
    "esri/map",
    "esri/layers/FeatureLayer",
	"esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/renderers/HeatmapRenderer",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/FeatureSet",
    "esri/graphic",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
    "esri/renderers/UniqueValueRenderer",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "esri/tasks/GeometryService",
    "esri/tasks/ProjectParameters",
    "esri/geometry/webMercatorUtils",
    "esri/dijit/PopupTemplate",
	"esri/config",
	"esri/request",
    "esri/IdentityManager",
    "esri/arcgis/OAuthInfo",
    "esri/dijit/analysis/FindHotSpots",
    "esri/tasks/Geoprocessor",
    "esri/urlUtils",
    "dojox/collections/ArrayList",
    "dojox/collections/SortedList",
	"dojo/on",
	"dojo/dom",
	"dojo/json",
    "dojo/domReady!"

]
,function(Map,FeatureLayer,tile,dynamic,heat,QueryParams,QueryTask,
           featSet,graphic,ePoint,sms,sls,Color,UVR,
           ext,spatRef,geomservice,prjParams,mercUtil,PopupTemplate,esriConfig,
           esriRequest,IDMAN,ArcGISOAuthInfo,hotSpot,gp,urlUtils,xArrayList,xSortedList,on,dom,JSON){
   
    
    
    
    
    
    
    urlUtils.addProxyRule({
    urlPrefix: "analysis.arcgis.com",
    proxyUrl: "http://jeffb/proxy/proxy.ashx"
});
    
     urlUtils.addProxyRule({
    urlPrefix: "services.arcgis.com",
    proxyUrl: "http://jeffb/proxy/proxy.ashx"
});

	esriConfig.defaults.io.proxyUrl = "http://jeffb/proxy/proxy.ashx";
    
   

    var mape = new ext({"xmin":-7958454,"ymin":5186146,"xmax":-7876850,"ymax":5228152,"spatialReference":{"wkid":102100}});
    // basemap: "gray",
    
    var myMap = new Map("map",{
          basemap: "gray",
		  extent:mape
        });
    myMap.on("pan",function(myMap){
        console.log(myMap)});
	//Add reporting layers
    var bosReportLyr = new FeatureLayer("http://jeffb:6080/arcgis/rest/services/MassRA/MapServer/0",{id:'bostonreport'});
    //var basket = new //FeatureLayer("http://services.arcgis.com/XWaQZrOGjgrsZ6Cu/arcgis/rest/services/AmesburyFrisbeeGolfCourseMap/FeatureServer/0");
    
	//var bostonLy = new //dynamic("http://snowman.cityofboston.gov/ArcGIS/rest/services/maps/Terrain_Base/MapServer");//"http://snowman.cityofboston.gov/ArcGIS/rest/services/maps/Terrain_Base_tiled/MapServer")
	
	
	
	//myMap.addLayer(basket);
	
   
    
    //CrimeFeaturelayer Definition
    
    var layerDefinition = {
			"title": "bosCrime",
			"id": "bosCrime",
			"visibility": true,
			"geometryType": "esriGeometryPoint",
			"fields": [{
			"name": "ID",
			"type": "esriFieldTypeOID",
			"alias": "ID"
			},{
			"name": "incident_type_description",
			"type": "esriFieldTypeString",
			"alias": "Description"
			},
			{
			"name": "reptdistrict",
			"type": "esriFieldTypeString",
			"alias": "District"
			},{
			"name": "fromdate",
			"type": "esriFieldTypeDate",
			"alias": "Date"
			}
			],
			"drawingInfo": {
                             "renderer": {  
                   "type": "simple",
                   "symbol": 
                   {
                    "type": "esriSMS",
                    "style": "esriSMSCircle",
                    "color": [255,0,0,255],
                    "size": 5,
                    "angle": 0,
                    "xoffset": 0,
                    "yoffset": 0,
                    "outline": 
                    {
                     "color": [0,0,0,255],
                     "width": 1
                    }
                   },
                   "label": "",
                   "description": ""
                }
			},
        
       
        
		} 
    
    
    
    
    //end Def
    //Feature Collection
    
    var featureCollection = {
				"layerDefinition": layerDefinition,
				"featureSet": {
					"geometryType": "esriGeometryPoint",
                    "spatialReference":{"wkid":3857},
					"features": []
					}
				};
    
    //End FeatureCollection
    //SpatRefs
    var ingpSpat = new spatRef(4326);
    var outgpSpat = new spatRef(3857);
    //Geometry Service
    var GS = new geomservice("http://jeffb:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    
	
	//on(dom.byId("input"),"click",addData);
	
	//on(dom.byId("input"),"click",addData);
	
	//function addData(){
    
    //Create FeatureSet
        var crimeFeats = new featSet(); 
        
        
        var bosCrimeFeatLyr = new FeatureLayer(featureCollection,{id:'bostonCrime',mode:FeatureLayer.MODE_SNAPSHOT});
        
        var template = new PopupTemplate({
        title: "{incident_type_description}",

        fieldInfos: [
          { fieldName: "incident_type_description", visible: true},
          { fieldName: "reptdistrict", visible: true },
          { fieldName: "fromdate", visible: true },
          { fieldName: "reportingarea",visible:true}
        ]});
        bosCrimeFeatLyr.setInfoTemplate(template);
    
        //Renderer Section ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
        var defsym =  new sms(sms.STYLE_CIRCLE, 10,
        new sls(sls.STYLE_SOLID,
        new Color([255,0,0]), 1),
        new Color([77,77,77,0.25]));
    
    
        var simpAsslt =  new sms(sms.STYLE_CIRCLE, 10,
        new sls(sls.STYLE_SOLID,
        new Color([254,178,76]), 1),
        new Color([240,59,32]));
        //SIMPLE ASSAULT
        var MVA =  new sms(sms.STYLE_CIRCLE, 10,
        new sls(sls.STYLE_SOLID,
        new Color([224,243,219]), 1),
        new Color([67,162,202]));
        //MVAcc
    
    
        var uniV = new UVR(defsym,"incident_type_description");
        uniV.addValue("SIMPLE ASSAULT",simpAsslt);
        uniV.addValue("MVAcc",MVA);
    
        var heatmapRenderer = new heat();
        bosCrimeFeatLyr.setRenderer(heatmapRenderer);//(uniV);//
    
        
        //End renderer Section~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        statArray = [];
    
        //bosCrimeFeatLyr.on("edits-complete",function(com){console.log(com)});
        bosCrimeFeatLyr.on("edits-complete",crimeFreq);
    
		console.log("Clikc!");
		fronUrl = "http://data.cityofboston.gov/resource/7cdf-6fgx.json?$order=fromdate%20DESC";
		var bosCrimes = esriRequest({
                 url: fronUrl,
                 handleAs: "json"
            });
		
		bosCrimes.then(function(res){
			res.forEach(function(crime){
                //Create a new Point
                var pnt = new ePoint(crime["location"]["longitude"],crime["location"]["latitude"]);
                var merGeom = mercUtil.geographicToWebMercator(pnt);
                var crimeGraphic = new graphic();
                //var pnt = new ePoint(crime["x"],crime["y"])//,outgpSpat);
                var attr =          {"incident_type_description":crime["incident_type_description"],"reportingarea":crime["reportingarea"],"reptdistrict":crime["reptdistrict"],"fromdate":crime["fromdate"]}
                
                statArray.push(attr["reptdistrict"]);
                //if (pnt.spatialReference.wkid === 4326){
                    pnt.setSpatialReference(outgpSpat);
                    crimeGraphic.setAttributes(attr);
                    crimeGraphic.setGeometry(merGeom);
                    crimeFeats.features.push(crimeGraphic);
                
                //}
                
            }
                
            )
		   console.log(crimeFeats);
          
           //create the new featurelayer
           
            myMap.addLayer(bosReportLyr);
             myMap.addLayer(bosCrimeFeatLyr);
            
          
            
            
            
           
                bosCrimeFeatLyr.applyEdits(crimeFeats.features,null,null,function(fs){
                    console.log("edits applied")
                    console.log(fs)
                    console.log(myMap)
                });
           
            //
            
            //console.log(bosCrimeFeatLyr.graphics);
            //myMap.setExtent(bosCrimeFeatLyr.fullExtent);
           
		});
		//}
	 
	
   /*  var padres = new FeatureLayer("http://localhost:6080/arcgis/rest/services/Baseball/PetcoHits2013/MapServer/1")

myMap.addLayer(padres);

    //Create the Query Params and Task
    var qParams = new QueryParams();
    qParams.where = "description = 'Home Run'";
    qParams.returnGeometry = true;
 */
    
   /*  var qTask = new QueryTask("http://localhost:6080/arcgis/rest/services/Baseball/PetcoHits2013/MapServer/1");
    
    qTask.execute(qParams,function(res){
        console.log(res);
                  },function(e){
        console.log(e);
    }) */
    
    
    
    
    function crimeFreq(data){
    
          var prjprms = new prjParams();
            prjprms.geometries = [bosCrimeFeatLyr.graphics];
            prjprms.outSR = outgpSpat;
        //GS.project(prjprms,function(w){console.log(w)});
        
      
       
       /* var hotSpotWidget = new hotSpot({
            aggregationPolygonLayers:[bosReportLyr],
            analysisLayer:bosCrimeFeatLyr,
            boundingPolygonLayers:[bosReportLyr],
            map:myMap
        },"widget")*/
        
	var GP = new gp("http://analysis.arcgis.com/arcgis/rest/services/tasks/GPServer/CreateBuffers");
    
    //var gpSpat = new spatRef(102100);
        
    //GP.setProcessSpatialReference(gpSpat);
        
        //http://analysis.arcgis.com/arcgis/rest/services/tasks/GPServer?f=json&token=jYVJ
        
       /* http://analysis.arcgis.com/arcgis/rest/services/tasks/GPServer/FindHotSpots/submitJob?f=json&AnalysisLayer=%7B%22url%22%3A%22http%3A%2F%2Fservices.arcgis.com%2FV6ZHFr6zdgNZuVG0%2Farcgis%2Frest%2Fservices%2FChicagoCrime%2FFeatureServer%2F0%22%7D&context=%7B%22outSR%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%2C%22extent%22%3A%7B%22type%22%3A%22extent%22%2C%22xmin%22%3A-9757160.056270774%2C%22ymin%22%3A5133968.997076335%2C%22xmax%22%3A-9751436.83377777%2C%22ymax%22%3A5135750.93529828%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D%7D&isProcessInfo=true&token=jYVJkGISWhX9f3wN0ALf0W2RthMFNmoKD317aikibONuwX15aPoGw4eMxPpuXnHYZ3GcOM1fCus0yER_Yo-0VoiXjw51hkxQ09uGXedS3fTUN3QcbggzImV5qF27lPmMSBp4yX8TXF8kZdmaz6zqp_IDuP_vX7dQA_5gHI1qKkY.
        
        */
        var gpParams = {
				"inputLayer" : bosCrimeFeatLyr,
                "distances":[500],
                "units":"Feet",
                
			};
        
        
        
        
        
        function gpResults(res){
			console.log(res);
			console.log("gpresult fired");
			var data = GP.getResultData(res.jobId,"bufferLayer",gpResults2);
		}
		function gpResults2(res){
			console.log(res);
			console.log("gpresult2 fired");
			
			/*var feats = res.value.features
			fLayer = new esri.layers.FeatureLayer(featureCollection, {
				id: 'flightpath'
				});
			map.addLayer(fLayer);
			fLayer.applyEdits(feats, null, null);
			//geoP.getResultData(res.jobId,"Result",function(gplayer){
			//	console.log(gplayer.geometryType);
			//})*/
			
		}
        
        
        function gpCallBack(status){
			console.log(status);
		}
	
		function gperr(err){
			console.log(err);
		}
        
        
        
        GP.submitJob(gpParams,gpResults);//,gpCallBack,gperr);
        
        
        
        
    };
    
    
    
    
    
    
    
})