'use strict';

/* global cookieMonitorApp, _ */
cookieMonitorApp.service('cookieEventService', function(){

	this.getCookieLog = function(callback){
		chrome.runtime.sendMessage(null, {'action': 'sendList'}, function(response){
			callback(response);
		});
	};

	this.clearCookieLog = function(callback){
		chrome.runtime.sendMessage(null, {'action': 'clearList'}, function(response){
			callback(response);
		});
	};

});

cookieMonitorApp.service('cookieExportService', function(){

	this.exportCookiesToCsv = function(cookieList, filePrefix){

		var csvContent = 'data:text/csv;charset=utf-8,';

		var columnNames = ['ts', 'expiration', 'name', 'domain', 'path', 'page', 'secure', 'httponly', 'hostonly', 'value'];
		csvContent += columnNames.join(',').toUpperCase() + '\n'; // TODO: make tab sep config

		var sortedCookieList = _.sortBy(cookieList, function(cookie){
			return cookie.ts;
		});

		sortedCookieList.forEach(function(cookie, index){

			var data = [];
			columnNames.forEach(function(key){
				if(cookie[key] && (key === 'ts' || key === 'expiration')){
					data.push(new Date(cookie[key]).toISOString() );
				} else {
					data.push(cookie[key]);
				}
			});

			var line = data.join(',');
			csvContent += index < cookieList.length ? line+ '\n' : line; // TODO: LF/CRLF
		});
		var encodedUri = encodeURI(csvContent);

		chrome.runtime.getBackgroundPage(function(window){

			// TODO: method is deprecated, learn new one

			var link = window.document.createElement('a');
			link.setAttribute('href', encodedUri);
			link.setAttribute('download', filePrefix+'.csv');
			link.click();
		});
	};
	
});

cookieMonitorApp.directive('cookieDetail', function () {
	return {
		templateUrl: 'cookiedetail-partial.html',
		restrict: 'A',
		scope: {
			cookies: '=cookies'
		}
	};
});




cookieMonitorApp.controller('PageController', function($scope, cookieEventService, cookieExportService){

	$scope.cookieLog = [];

	// modified cell template to insert checked/uncheck chars instead of "true"/"false"
	var boolCellTemplate =
		'<div class=\"ngCellText cookieTableCell\" ng-class=\"col.colIndex()\">' +
		'{{row.entity[col.field] == "true" ? "&#x2611;" : "&#x2610;"}}</div>';

	// modified row template to call onMouseover with the current row
	var rowTemplate = '<div ng-class="{sessionCookie: row.getProperty(\'daysleft\') < 1}">'+
		'<div ' +
		' ng-mouseover="onMouseover(row)" ng-mouseleave="onMouseleave()" ' +
		' ng-style="{ cursor: row.cursor }" '+
		' ng-repeat="col in renderedColumns" ' +
		' ng-class="col.colIndex()"' +
		' class="ngCell"' +
		'>' +
		'<div ' +
		' class="ngVerticalBar" ' +
		' ng-style="{height: rowHeight}" ' +
		' ng-class="{ ngVerticalBarVisible: !$last }"' +
		'>' +
		'&nbsp;'+
		'</div>' +
		'<div ng-cell></div>' +
		'</div>' +'</div>';

		// ' ng-class=\"{ \'sessionCookie\': row.getProperty(\'daysleft\') < 1}\" >' +
    $scope.currentCookie = [];  // TODO: change workaround to use the same directive
								//       on both: current and selected cookies
	$scope.selectedCookies = [];

	$scope.cookieTableConfig = {
		data: 'cookieLog',
		columnDefs: [
			{field: 'ts', displayName: 'Time', cellFilter: 'date:"HH:mm:ss.sss"', width: 105},
			{field: 'name', displayName: 'Name', width:100},
			{field: 'domain', displayName: 'Domain', width: 150},
			{field: 'page', displayName: 'Page Guess'},
			{field: 'secure', displayName: 'HTTPS Only', width: 55, cellTemplate: boolCellTemplate},
			{field: 'httponly', displayName: 'HTTP Only', width: 50, cellTemplate: boolCellTemplate},
			{field: 'hostonly', displayName: 'Host Only', width: 50, cellTemplate: boolCellTemplate},
			{field: 'daysleft', displayName: 'Days Left', width: 50, visible: false}
		],
		sortInfo: {fields: ['ts'], directions: ['desc']},
		showGroupPanel: true,
        jqueryUIDraggable: true,
        enableColumnResize: true,
        showColumnMenu: true,
        showFilter: true,
        selectedItems: $scope.selectedCookies,
	    multiSelect: true,
	    headerRowHeight: 40,
	    rowTemplate: rowTemplate
	};

	// fill table when popup is generated
	cookieEventService.getCookieLog(function(cookieLog){
		$scope.cookieLog = cookieLog;
		$scope.$apply();
	});

	// add a table row every time a cookie event is found 
	/* jshint unused: false */
	chrome.runtime.onMessage.addListener(function(msg, sender, callback){
		console.log('popup received message:'+JSON.stringify(msg));
		if ( msg.action && msg.action === 'add' ){
			$scope.cookieLog.push(msg.event);
			$scope.$apply();
		}
	});


	$scope.clearSelection = function(){
        angular.forEach($scope.cookieLog, function(data, index){
			$scope.cookieTableConfig.selectItem(index, false);
        });
    };

    $scope.clearCookieLog = function(){
		$scope.clearSelection();
		cookieEventService.clearCookieLog(function(cookieLog){
			$scope.cookieLog = cookieLog;
			$scope.$apply();
		});
    };

	$scope.exportSelected = function(){
		cookieExportService.exportCookiesToCsv($scope.selectedCookies, 'selected-cookies');
    };

	$scope.exportCookieLog = function(){
		cookieExportService.exportCookiesToCsv($scope.cookieLog, 'cookies');
    };

	$scope.onMouseover = function(row){
		// console.log(row.entity);
		$scope.currentCookie = [ row.entity ];
    };

	$scope.onMouseleave = function(){
		$scope.currentCookie.shift();
	};

});


