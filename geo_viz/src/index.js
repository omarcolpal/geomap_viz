const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');
const d3 = require('d3')
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";

var countries = local.countryCodes

const data = local.data2


export const LOCAL = false;

// write viz code here
const drawViz = (dataIn) => {

  var fields = dataIn.fields.dimID.map(f=>{
    if (f.type == "YEAR_MONTH_DAY"){
      // return Date.parse(f.name)
      return f.name
    }
    else{
      return f.name
    }

    })
  // fields.append("test")
  var alldata = dataIn.tables.DEFAULT.map((row,ind)=>{
    var obj = {}
    obj[' '] = ""

    // obj.test = 5
    row.dimID.forEach((col,ind)=>{
      obj[fields[ind]] = col

    })

  return obj

  })
//   console.log("ALL DATA TABLE",alldata);
//
// console.log("DATA",dataIn);
alldata = alldata.map(r=>{
  var obj = {}
  obj.Plant = r.plant
  obj.Name = r.PlantDesc
  obj.NumOfCases = r.NumOfCases
  obj.Perc_Color = r.Frozen_TotalStockReceiptsQty / r.Production_Conf
  var p = r.PercRevenueContributedByPlant
  if (p != null){p = p.toFixed(2)}
  obj.Perc_Size = p
  var refobj = data.find(e=>{
    return (r.PlantDesc.toLowerCase()).includes(e["City"].toLowerCase().split(",")[0])
  })
  // debugger
  obj.Country = refobj.Country
  obj.City = refobj.City
  obj.Latitude = refobj.Latitude
  obj.Longitude  =refobj.Longitude
  return obj
})

var covid = alldata.map(i=> {
  return {"cases": i.NumOfCases, "country": i.Country}
})



// d3.select("body").append("div").html('<div id="bubbles" style="position: relative; width: 600px; height: 500px;"></div>')
// Create map instance
// d3.select("body").remove()
d3.select("body").html('<div id="chartdiv" style="position: relative; padding-bottom:50px;  width: 800px; height: 500px" ></div>')



// Create a container
var container = am4core.create("chartdiv", am4core.Container);
container.width = am4core.percent(100);
container.height = am4core.percent(100);
container.layout = "vertical";



var chart = container.createChild(am4maps.MapChart)
// var chart = am4core.create("chartdiv", am4maps.MapChart);
// chart.responsive.enabled = true

// Create map instance
// var chart = am4core.create("chartdiv", am4maps.MapChart);

// Set map definition
chart.geodata = am4geodata_worldLow;

// Set projection
chart.projection = new am4maps.projections.Miller();

// Create map polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

// Make map load polygon (like country names) data from GeoJSON
polygonSeries.useGeodata = true;

// Configure series
var polygonTemplate = polygonSeries.mapPolygons.template;

// polygonTemplate.tooltipText = "{name}";
polygonTemplate.fill = am4core.color("gray");
// polygonTemplate.propertyFields.fill = "fill"
polygonTemplate.opacity = .7
// polygonTemplate.fillOpacity = .7
// Create hover state and set alternative fill color
// var hs = polygonTemplate.states.create("hover");
// hs.properties.fill = am4core.color("#367B25");
polygonTemplate.properties.tooltipText = "{name} \n Covid Cases: {cases}";
// polygonTemplate.properties.fillOpacity = "{opacity}"

// Remove Antarctica
polygonSeries.exclude = ["AQ"];

var covidArr = []
covid.forEach(i=>{
  if (!covidArr.includes(i.country)){
    covidArr.push(i.country)
  }
})
covid = covidArr.map(c=>{
  var obj = covid.find(i=>{return i.country == c})
  obj.id = countries.find(co =>{return co.Name.toLowerCase() == c.toLowerCase()}).Code

  if (obj.cases > 8){obj.fill = am4core.color("#072f5f")}
  else if (obj.cases > 5){obj.fill = am4core.color("#1061a0")}
  else if (obj.cases > 1){obj.fill = am4core.color("#3795d3")}
  else if (obj.cases == 1){obj.fill = am4core.color("#04a9f4")}

  return obj
})


// Add some data
polygonSeries.data = covid

// [{
//   "id": "US",
//   "name": "United States",
//   "value": 100,
//   "fill": am4core.color("#F05C5C")
// }, {
//   "id": "FR",
//   "name": "France",
//   "value": 50,
//   "fill": am4core.color("#5C5CFF")
// }];

// Bind "fill" property to "fill" key in data
polygonTemplate.propertyFields.fill = "fill";



// Create image series
var imageSeries = chart.series.push(new am4maps.MapImageSeries());


// Create a circle image in image series template so it gets replicated to all new images
var imageSeriesTemplate = imageSeries.mapImages.template;

var circle = imageSeriesTemplate.createChild(am4core.Circle);
circle.radius = 10;
circle.fill = "black";
circle.opacity = .9;
circle.stroke = am4core.color("white");
circle.strokeWidth = .9;
circle.nonScaling = true;
circle.tooltipText = "{City}, {Country}  \n {Perc_Size}%";

// let nyc = imageSeries.mapImages.create();
// nyc.latitude = 40.712776;
// nyc.longitude = -74.005973;
// nyc.title = "TEST"
// nyc.radius = 50

// Set property fields
imageSeriesTemplate.propertyFields.latitude = "Latitude";
imageSeriesTemplate.propertyFields.longitude = "Longitude";
circle.propertyFields.radius = "SizeScale"
circle.propertyFields.fill = "Color"
// imageSeriesTemplate.propertyFields.value = "radius";

// var imageSeries2 = chart.series.push(new am4maps.MapImageSeries());
// var imageSeriesTemplate2 = imageSeries2.mapImages.template;
// var pin = imageSeriesTemplate.createChild(am4plugins_bullets.PinBullet);

// Set what to display on rollover tooltip
// pin.tooltipText = "{City}";
// imageSeries.tooltip.pointerOrientation = "right";

// Configuring pin appearance
// pin.background.fill = chart.colors.getIndex(0);
// pin.background.fill = am4core.color("black")
// pin.background.fillOpacity = 0.3;
// pin.background.pointerAngle = 120;
// pin.background.pointerBaseWidth = 3;
// pin.opacity = 0
// // pin.label.text = "{City}";
// pin.nonScaling = true;
// pin.background.radius = 5
// pin.propertyFields.opacity = 1
// imageSeriesTemplate2.propertyFields.latitude = "latitude";
// imageSeriesTemplate2.propertyFields.longitude = "longitude";
// pin.background.fill = "Color"
// Add data for the three cities

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}
function perc2color(perc) {
  perc = perc*100
  if (perc>100){perc = 100}
  if (perc<0){perc = 0}
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	// return '#' + ('000000' + h.toString(16)).slice(-6);
  if (perc<85){return '#f44335'}
  else if (perc>=85 && perc <95){return '#ffb300'}
  else {return '#43a047'}
}

alldata = alldata.map(o =>{

  o["SizeScale"] = scaleBetween(o.Perc_Size, 5,28,.07,16)
  o["Color"] = perc2color(o.Perc_Color)
  // if (o.Latitude > 40){o.Covid = 1}
  return o
})
console.log("ALMOST READY",dataIn)

imageSeries.data = alldata

// imageSeries2.data = [{"Country": "USA"},{"Country: FRANCE"},{}]
// imageSeries2.data = [{
//   "latitude": 48.856614,
//   "longitude": 2.352222,
//   "title": "Paris",
//   "value": 10,
//   "Covid": 1
// }, {
//   "latitude": 40.712775,
//   "longitude": -74.005973,
//   "title": "New York",
//   "value": 30,
//   "Covid": 1
// }, {
//   "latitude": 49.282729,
//   "longitude": -123.120738,
//   "title": "Vancouver",
//   "value": 100,
//   "Covid": 1
// }];


}
  // console.log(lis);
// })
// console.log(chb);

// renders locally
if (LOCAL) {
  // drawViz(local.message);
  drawViz(local.mes2)
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
