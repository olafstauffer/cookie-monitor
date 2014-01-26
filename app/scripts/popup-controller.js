'use strict';
/* global Application */

Application.Controllers

	.controller('PopupController', ['$scope', 'cookieEventService', 'cookieExportService', 'configService',
		function($scope, cookieEventService, cookieExportService, configService){

		$scope.cookieLog = [];

		// modified cell template to insert checked/uncheck chars instead of "true"/"false"
		var boolCellTemplate =
			'<div class="ngCellText cookieTableCell visibleCell" ng-class="col.colIndex()">' +
			'{{row.entity[col.field] == "true" ? "&#x2611;" : "&#x2610;"}}</div>';

		// modified row template to call onMouseover with the current row
		var rowTemplate =
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
			'<div ng-class="{sessionCookie: row.getProperty(\'lifespanInDays\') < 1}">' +
			'<div ng-cell></div>' +
			'</div></div>';



	    $scope.currentCookie = [];  // TODO: change workaround to use the same directive
									//       on both: current and selected cookies
									//		 (currentCookie should be an object not an array)
		$scope.selectedCookies = [];

		$scope.cookieTableConfig = {
			data: 'cookieLog',
			columnDefs: [
				{field: 'eventTS', displayName: 'Time', cellFilter: 'date:"HH:mm:ss.sss"', width: 105, cellClass: 'visibleCell'},
				{field: 'name', displayName: 'Name', width:100, cellClass: 'visibleCell'},
				{field: 'domain', displayName: 'Domain', width: 150, cellClass: 'visibleCell'},
				{field: 'page', displayName: 'Page Guess', cellClass: 'visibleCell'},
				{field: 'secure', displayName: 'HTTPS Only', width: 55, cellTemplate: boolCellTemplate, visible: true},
				{field: 'httpOnly', displayName: 'HTTP Only', width: 50, cellTemplate: boolCellTemplate, visible: false},
				{field: 'hostOnly', displayName: 'Host Only', width: 50, cellTemplate: boolCellTemplate, visible: false},
				{field: 'lifespanInDays', displayName: 'Days Left', width: 50, cellClass: 'cookieTableCell visibleCell', visible: true}
			],
			sortInfo: {fields: ['eventTS'], directions: ['desc']},
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
			console.log('received cookie log:');
			console.log(cookieLog);
			$scope.cookieLog = cookieLog;
			$scope.$apply();
		});

		// add a table row every time a cookie event is found 
		/* jshint unused: false */
		chrome.runtime.onMessage.addListener(function(msg, sender, callback){
			// console.log('popup received message:'+JSON.stringify(msg));
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
			cookieExportService.exportCookiesToCsv($scope.selectedCookies, configService.get('csvExportSelectedPrefix'));
	    };

		$scope.exportCookieLog = function(){
			cookieExportService.exportCookiesToCsv($scope.cookieLog, configService.get('csvExportAllPrefix'));
	    };

		$scope.onMouseover = function(row){
			$scope.currentCookie = [ row.entity ];
	    };

		$scope.onMouseleave = function(){
			$scope.currentCookie.shift();
		};

	}]);



