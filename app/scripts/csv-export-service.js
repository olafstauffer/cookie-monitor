'use strict';
/* global Application, _ */

Application.Services

	.service('cookieExportService', function(configService){

		this.exportCookiesToCsv = function(cookieList, filePrefix){

			var csvContent = 'data:text/csv;charset=utf-8,';
			var columnSeperator = configService.get("csvExportColSep");

			var timestampSuffix = '';
			if ( configService.get("csvExportDoAddTimestamp") === 'yes' ){
				// poor mans date formatter ... and without timezone correction
				// TODO: find a better way
				timestampSuffix = '_' + new Date().toISOString().slice(0, 19).replace(new RegExp('-', 'g'), '').replace(new RegExp(':', 'g'), '') + '.csv';
			};
			var filename = filePrefix + timestampSuffix + '.csv';

			var columnNames = ['ts', 'expiration', 'name', 'domain', 'path', 'page', 'secure', 'httponly', 'hostonly', 'value'];
			csvContent += columnNames.join(columnSeperator).toUpperCase() + '\n'; 

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

				var line = data.join(columnSeperator);
				csvContent += index < cookieList.length ? line+ '\n' : line; // TODO: LF/CRLF
			});
			var encodedUri = encodeURI(csvContent);

			chrome.runtime.getBackgroundPage(function(window){

				// TODO: method is deprecated, learn new one

				var link = window.document.createElement('a');
				link.setAttribute('href', encodedUri);
				link.setAttribute('download', filename);
				link.click();
			});
		};
	
	});

