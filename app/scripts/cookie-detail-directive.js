'use strict';
/* global Application */

Application.Directives

	.directive('cookieDetail', function () {
		return {
			templateUrl: 'templates/cookiedetails-template.html',
			restrict: 'A',
			scope: {
				cookies: '=cookies'
			}
		};
	});

