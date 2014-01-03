'use strict';
/* global Application */

Application.Controllers

	.controller('OptionsController', function($scope, configService){

		$scope.config = configService.getConfig();
		console.log($scope);

		$scope.readConfig = function(){
			$scope.config = configService.getConfig();
		};

		$scope.saveConfig = function(){
			configService.saveConfig($scope.config);
		};

		$scope.resetConfig = function(){
			configService.saveDefaults();
			$scope.config = configService.getConfig();
		};

	});
