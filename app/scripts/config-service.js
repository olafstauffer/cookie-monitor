'use strict';
/* global Application, _ */

Application.Services

	.service('configService', function(){

		var defaults = {
			'csvExportAllPrefix': 'cookies',
			'csvExportSelectedPrefix': 'selected-cookies',
			'csvExportColSep': '\t',
			'csvExportDoAddTimestamp': 'no',
			'elasticsearchUrl': 'http://localhost:9200/browserdata/cookie', // TODO: sync with background.js
			'elasticsearchEnableExport': 'no'
		};

		this.get = function(key){
			return localStorage.getItem(key);
		};

		this.set = function(key, value){
			localStorage.setItem(key, value);
		};

		this.getConfig = function(){
			var config = {};
			_.each(defaults, function(defaultValue, key){

				console.log('key='+key+', defaultValue='+defaultValue);

				var storedValue = localStorage.getItem(key);
				if (storedValue){
					config[key] = storedValue;
				} else {
					config[key] = defaultValue;
				}
			});
			return config;
		};

		this.saveConfig = function(config){
			_.each(defaults, function(defaultValue, key){
				if (config[key] && config[key] !== null){
					localStorage.setItem(key, config[key]);
				}
			});
		};

		this.saveDefaults = function(){
			_.each(defaults, function(value, key){
				localStorage.setItem(key, value);
			});
		};

	});