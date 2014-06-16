'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MapViewCtrl', ['$scope', function($scope) {
    var agh_center = L.latLng(50.0661, 19.9149); // take it from osm.org
    var map = L.map('map').setView(agh_center, 15);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: [mapUtils.attr_osm, mapUtils.attr_overpass].join(', ')}).addTo(map);

}]);
