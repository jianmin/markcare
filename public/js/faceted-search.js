/*
 * @(#)faceted-search.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/29
 */

app.controller('FacetedSearchController', [
  '$injector', 
  '$scope', 
  '$http', 
  '$filter', 
  '$location',
  'AppConfig',
  'PageCache', 
  'Registry',
  'BlueButtonService',  
function($injector, $scope, $http, $filter, $location, AppConfig, PageCache, Registry, BlueButtonService) {
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.registry = Registry;
  $scope.persons = [];

  var highchart = null;

  $scope.performSearch = function() {
    if (highchart) {
      $(container).highcharts().destroy();
      highchart = null;
    }

    $scope.persons = [];

    if (!$scope.facet_model) {
      return;
    }

    MarkCare.Util.showPageLoader();

    var facet = $scope.facet_model.id;
    var params = 'facet=' + facet;

    BlueButtonService.performFacetedSearch(params).then(function(response) {
      MarkCare.Util.hidePageLoader();

      if (response.data.success) {
        var title = 'Faceted Search by ' + $scope.facet_model.name;
        var facetValues = response.data.results[0].facets[facet].facetValues;
        var data = [];

        facetValues.forEach(function(facetValue) {
          data.push({
            name: facetValue.name,
            y: facetValue.count
          });
        });

        $scope.createHighcharts('#container', title, data);
      } else {
        MessageCenter.showMessage(response.data.message);
      }
    });
  };

  $scope.createHighcharts = function(container, title, data) {
    highchart = $(container).highcharts({
      chart: {
        type: 'column'
      },
      title: {
        text: title
      },
      subtitle: {
        text: 'Click the columns to view details.'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: ''
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        //headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b>'
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                $scope.drilldown(this.name);
              }
            }
          },
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y}'
          }
        }
      },
      series: [{
        name: 'Persons',
        colorByPoint: true,
        data: data
      }]
    });
  };

  $scope.drilldown = function(value) {
    MarkCare.Util.showPageLoader();

    var facet = $scope.facet_model.id;
    var params = 'facet=' + facet + '&value=' + value;

    BlueButtonService.getPersons(params).then(function(response) {
      console.log(response);
      MarkCare.Util.hidePageLoader();

      if (response.data.success) {
        $scope.persons = response.data.persons;
      } else {
        $scope.persons = [];
        MessageCenter.showMessage(response.data.message);
      }
    });
  };

  $scope.createHighcharts();
}]);

/* end of faceted-search.js */
