'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MapViewCtrl', ['$scope', function($scope) {
    $scope.buildings = [];

    var agh_center = L.latLng(50.0661, 19.9149); // take it from osm.org
    var map = L.map('map').setView(agh_center, 15);
    var osm_layer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: [mapUtils.attr_osm, mapUtils.attr_overpass].join(', ')});
    var mapbox_layer = new L.tileLayer('https://{s}.tiles.mapbox.com/v3/ukasiu.ihb1if8o/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    });

    map.getControl = function() {
      var layers = new L.Control.Layers({
        "OSM": osm_layer,
        "MapBox": mapbox_layer
      });
      return function() {
        return layers;
      };
    }();

    map.addControl(map.getControl());
    osm_layer.addTo(map);
    // now go to overpass turbo and prepare query

    var handleWay = function(way) {
      if(!way.tags || !way.tags['addr:housename']) return;
      way.name = way.tags['addr:housename'];
      var matches = /([A-Z]{1,2})(\d+)/.exec(way.name);
      way.letter = matches[1];
      way.number = parseInt(matches[2]);

      way.polygon = L.polygon(way.geometry.coordinates,{ color: '#000', weight: 3 }).addTo(map);
      way.polygon.bindPopup(preparePopupText(way));
      $scope.$apply(
        $scope.buildings.push(way)
      );
      way.showOnMap = function() {
        way.polygon.openPopup();
        map.panTo(way.polygon.getBounds().getCenter());
        if(map.getZoom() < 17) map.setZoom(17);
      }
      way.polygon.on('popupclose', function() {
        way.polygon.setStyle({ color: 'black' });
      });
      way.polygon.on('popupopen', function() {
        way.polygon.setStyle({ color: 'red' });
      });
    };

    var handleRelation = function(relation) {
      relation.members.forEach(function (way) {
        if(way.role == 'inner') return;
        way.obj.tags = relation.tags;
        handleWay(way.obj);
      });
    };

    mapUtils.loadAndParseOverpassJSON(map, '[out:json];(way["addr:housename"~"^([ABCDSUZ]|DS)[0-9]+$"]({{bbox}});relation["addr:housename"~"^([ABCDSUZ]|DS)[0-9]+$"]({{bbox}}););(._;>;);out;', null, handleWay, handleRelation);

    var preparePopupText = function(building) {
      if(!building.tags) return building.name;
      return "<h2>" + building.name + "</h2>\n" +
        (building.tags.name && building.tags.name !== building.name ? "<h3>" + building.tags.name + "</h3>" : ""); 
    };

}]);
