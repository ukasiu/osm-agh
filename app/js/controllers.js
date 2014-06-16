'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MapViewCtrl', ['$scope', function($scope) {
    $scope.buildings = [];

    var agh_center = L.latLng(50.0661, 19.9149);
    var map = L.map('map').setView(agh_center, 15);
    var osm_layer = new L.tileLayer(mapUtils.osm_layer_addr, {attribution: [mapUtils.attr_osm, mapUtils.attr_overpass].join(', ')});
    var mapbox_layer = new L.tileLayer(mapUtils.mapbox_layer_addr, {
        attribution: [mapUtils.attr_mapbox, mapUtils.attr_overpass].join(', ')
    });

    mapbox_layer.addTo(map);

    var handleWay = function(way) {
      way.name = way.tags['addr:housename'];
      way.polygon = L.polygon(way.geometry.coordinates,{ color: '#000', weight: 3 }).addTo(map);
      way.polygon.bindPopup(way.name);
      $scope.$apply(
        $scope.buildings.push(way)
      );
    };

    mapUtils.loadAndParseOverpassJSON(map, '[out:json];(way["addr:housename"~"^([ABCDSUZ]|DS)[0-9]+$"]({{bbox}}););(._;>;);out;', null, handleWay, null);
}]);
