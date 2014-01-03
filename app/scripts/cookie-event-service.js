'use strict';
/* global Application */

Application.Services

	.service('cookieEventService', function(){

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

