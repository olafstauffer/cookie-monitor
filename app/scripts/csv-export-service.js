'use strict';
/* global Application, _ */

Application.Services

	.service('cookieExportService', function(configService){

		this.exportCookiesToCsv = function(cookieList, filePrefix){

			var columnSeperator = configService.get('csvExportColSep');

			// compose the filename
			//
			var timestampSuffix = '';
			if ( configService.get('csvExportDoAddTimestamp') === 'yes' ){
				// poor mans date formatter ... and without timezone correction
				// TODO: find a better way
				timestampSuffix = '_' + new Date().toISOString().slice(0, 19).replace(new RegExp('-', 'g'), '').replace(new RegExp(':', 'g'), '') + '.csv';
			}
			var filename = filePrefix + timestampSuffix + '.csv';


			// generate the data
			//
			var csvContent = '';

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

			// simulate a click to automatically download the data
			//
			var a = window.document.createElement('a');
			var blob = new Blob([csvContent], {
				type: 'text/csv;charset=utf-8'
			});
			a.href = window.URL.createObjectURL(blob);
			a.download = filename;
			a.style.display = 'none';
			window.document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(a.href);
		};
	
	});

