myApp.service("cookieEventService", function(){

	this.getCookieLog = function(callback){

		debugger;

		chrome.runtime.sendMessage(null, {'action': 'sendList'}, function(response){
			console.log("sendList responded with:"+response);
			callback(response);
		})
	};

});

myApp.filter('boolToUtfChar', function(){
	return function(input){
		if(input){
			// return "&#x2610;";&#x2713;
			return "☑";
		} else {
			// return "&#x2611;";
			return "☐";
		}
	}
});

myApp.controller("PageController", function($scope, cookieEventService){

	$scope.cookieLog = [];

	$scope.testBool = true;
	$scope.testString = "HUHU";
	$scope.myHTML = 'I am an <code>HTML</code>string with <a href="#">links!</a> and other <em>stuff</em>';

	$scope.mySelections = [];
	$scope.cookieTableConfig = { 
		data: 'cookieLog',
		columnDefs: [
			{field: 'ts', displayName: 'Time', cellFilter: "date:'H:mm:ss.sss'", width: 105},
			{field: 'name', displayName: 'Name', width:100},
			{field: 'domain', displayName: 'Domain'},
			{field: 'path', displayName: 'Path', width: 60},
			{field: 'secure', displayName: 'HTTPS Only', width: 50, cellClass: 'cookieTableCell', cellFilter: 'boolToUtfChar'}, 
			{field: 'httponly', displayName: 'HTTP Only', width: 50, cellClass: 'cookieTableCell', cellFilter: 'boolToUtfChar'}, 
			{field: 'hostonly', displayName: 'Host Only', width: 50, cellClass: 'cookieTableCell', cellFilter: 'boolToUtfChar'}
		],
		showGroupPanel: true,
        jqueryUIDraggable: true,
        enableColumnResize: true,
        showColumnMenu: true,
        showFilter: true,
        selectedItems: $scope.mySelections,
	    multiSelect: true,
	    headerRowHeight: 40
	};

	cookieEventService.getCookieLog(function(cookieLog){
		$scope.cookieLog = cookieLog;

		// $scope.$apply();
	});

	chrome.runtime.onMessage.addListener(function(msg, sender, respondFunction){
		if ( msg.action && msg.action === "add" ){
			$scope.cookieLog.push(msg.event);
			$scope.$apply();
		}
})


});


