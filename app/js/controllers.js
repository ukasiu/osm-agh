'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MapViewCtrl', ['$scope', function($scope) {
    $scope.buildings = [];

    var agh_center = L.latLng(50.0661, 19.9149); // take it from osm.org
    var map = L.map('map').setView(agh_center, 15);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: [mapUtils.attr_osm, mapUtils.attr_overpass].join(', ')}).addTo(map);

    // now go to overpass turbo and prepare query

    var handleWay = function(way) {
      //console.log(way.id);
      way.name = way.tags['addr:housename'];
      way.polygon = L.polygon(way.geometry.coordinates,{ color: '#000', weight: 3 }).addTo(map);
      way.polygon.bindPopup(way.name);
      $scope.$apply(
        $scope.buildings.push(way)
      );
    };

    mapUtils.loadAndParseOverpassJSON(map, '[out:json];(way["addr:housename"~"^([ABCDSUZ]|DS)[0-9]+$"]({{bbox}}););(._;>;);out;', null, handleWay, null);

}]);
