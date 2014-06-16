// 
// Credits for this go to https://github.com/simon04/POImap
// 
var mapUtils = {};

mapUtils.attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors';
mapUtils.attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>';

L.LatLngBounds.prototype.toOverpassBBoxString = function (){
  var a = this._southWest,
      b = this._northEast;
  return [a.lat, a.lng, b.lat, b.lng].join(",");
};

mapUtils.loadAndParseOverpassJSON = function (map, query, callbackNode, callbackWay, callbackRelation) {
  var query = query.replace(/{{bbox}}/g, map.getBounds().toOverpassBBoxString());
  xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 ) {
      if(xmlhttp.status == 200){
        console.log(xmlhttp.responseText);
        mapUtils.parseOverpassJSON(JSON.parse(xmlhttp.responseText), callbackNode, callbackWay, callbackRelation);
      }
    }
  };
  xmlhttp.open("GET","http://www.overpass-api.de/api/interpreter?data=" + encodeURIComponent(query),true);
  xmlhttp.send();
};

mapUtils.parseOverpassJSON = function (overpassJSON, callbackNode, callbackWay, callbackRelation) {
  var nodes = {}, ways = {};
  for (var i = 0; i < overpassJSON.elements.length; i++) {
    var p = overpassJSON.elements[i];
    switch (p.type) {
      case 'node':
        p.coordinates = [p.lat, p.lon];
        p.geometry = {type: 'Point', coordinates: p.coordinates};
        nodes[p.id] = p;
        // p has type=node, id, lat, lon, tags={k:v}, coordinates=[lon,lat], geometry
        if (typeof callbackNode === 'function') callbackNode(p);
        break;
      case 'way':
        p.coordinates = p.nodes.map(function (id) {
          return nodes[id].coordinates;
        });
        p.geometry = {type: 'LineString', coordinates: p.coordinates};
        ways[p.id] = p;
        // p has type=way, id, tags={k:v}, nodes=[id], coordinates=[[lon,lat]], geometry
        if (typeof callbackWay === 'function') callbackWay(p);
        break;
      case 'relation':
        if (!p.members) {
          console.log('Empty relation', p);
          break;
        }
        p.members.map(function (mem) {
          mem.obj = (mem.type == 'way' ? ways : nodes)[mem.ref];
        });
        // p has type=relaton, id, tags={k:v}, members=[{role, obj}]
        if (typeof callbackRelation === 'function') callbackRelation(p);
        break;
    }
  }
};