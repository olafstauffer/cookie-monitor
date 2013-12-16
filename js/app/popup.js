myApp.service("cookieEventService", function(){

	this.getCookieLog = function(callback){
		chrome.runtime.sendMessage(null, {'action': 'sendList'}, function(response){
			callback(response);
		})
	};

	this.clearCookieLog = function(callback){
		console.log("clear cookie log service reached");
		chrome.runtime.sendMessage(null, {'action': 'clearList'}, function(response){
			console.log("response="+response);
			callback(response);
		})
	}

});



myApp.controller("PageController", function($scope, cookieEventService){

	$scope.cookieLog = [];

	var boolCellTemplate = '<div class=\"ngCellText cookieTableCell\" ng-class=\"col.colIndex()\">{{row.entity[col.field] == "true" ? "&#x2611;" : "&#x2610;"}}</div>';

	$scope.mySelections = [];
	$scope.cookieTableConfig = { 
		data: 'cookieLog',
		columnDefs: [
			{field: 'ts', displayName: 'Time', cellFilter: "date:'HH:mm:ss.sss'", width: 105},
			{field: 'name', displayName: 'Name', width:100},
			{field: 'domain', displayName: 'Domain', width: 150},
			{field: 'page', displayName: 'Page Guess'},
			{field: 'secure', displayName: 'HTTPS Only', width: 55, cellTemplate: boolCellTemplate}, 
			{field: 'httponly', displayName: 'HTTP Only', width: 50, cellTemplate: boolCellTemplate}, 
			{field: 'hostonly', displayName: 'Host Only', width: 50, cellTemplate: boolCellTemplate}
		],
		sortInfo: {fields: ['ts'], directions: ['desc']},
		showGroupPanel: true,
        jqueryUIDraggable: true,
        enableColumnResize: true,
        showColumnMenu: true,
        showFilter: true,
        selectedItems: $scope.mySelections,
	    multiSelect: true,
	    headerRowHeight: 40
	};

	// fill table when popup is generated
	cookieEventService.getCookieLog(function(cookieLog){
		$scope.cookieLog = cookieLog;
	});

	// add a table row every time a cookie event is found
	chrome.runtime.onMessage.addListener(function(msg, sender, callback){
		if ( msg.action && msg.action === "add" ){
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
    	})
    }

});


