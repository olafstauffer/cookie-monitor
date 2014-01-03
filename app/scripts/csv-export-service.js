'use strict';
/* global Application, _ */

Application.Services

	.service('cookieExportService', function(){

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

