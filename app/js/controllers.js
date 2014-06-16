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

    mapUtils.loadAndParseOverpassJSON(map, '[out:json];(way["addr:housename"~"^([ABCDSUZ]|DS)[0-9]+$"]({{bbox}}););(._;>;);out;', null, handleWay, null);

    // and routing

    L.Routing.control({
          waypoints: [
              L.latLng(50.0661, 19.9149),
              L.latLng(50.06836, 19.90104)
          ]
      }).addTo(map);

}]);
