'use strict';

// CookieEvent
// 
// The base data structure for the extension. Here is defined what elements a cookie
// event shoudl consist of and define the possible methods on a cookie event.
//
// Right now the use of ng-grid to display directly from this data structure (ng-grid
// gets a array of cookie event object to display) forces some strange decisions like
// using the strings 'true' and 'false' for boolean values.
//
// TODO: learn more on javascript oop and overloading of operator [] to get rid of ng-grid
//       specifica here.

var CookieEvent = function(hasBeenRemoved, cause, cookie){

	this.init(hasBeenRemoved, cause, cookie);
};

// initialize the cookie event with reasonable values
//
CookieEvent.prototype.init = function(hasBeenRemoved, cause, cookie){

	var currentCookieEvent = this; // TODO: find other way, understand javascript inheritance

	currentCookieEvent.setEventTS();
	currentCookieEvent.expireTS = null;
	currentCookieEvent.lifespanInDays = 0;

	currentCookieEvent.hasBeenRemoved = (hasBeenRemoved === true);
	currentCookieEvent.action = ''+cause;
	currentCookieEvent.page = '';

	if(typeof(cookie) === 'object'){

		if (cookie.expirationDate) {
			currentCookieEvent.setExpireTS( new Date(cookie.expirationDate * 1000).getTime() );
		}

		['domain', 'path', 'name', 'value']
		.forEach(function(key){
			if(cookie[key]){
				currentCookieEvent.set(key, cookie[key]);
			} else {
				currentCookieEvent.set(key, '');
			}
		});

		// grouping in ng-grid does not like booleans
		['hostOnly', 'secure', 'httpOnly']
		.forEach(function(key){
			currentCookieEvent.set(key, cookie[key] ? 'true' : 'false');
		});

	}
};

CookieEvent.prototype.set = function(key, value){
	this[key] = value;
};

CookieEvent.prototype.setPage = function(url){
	this.page = url;
};


CookieEvent.prototype.get = function(key){
	return this[key];
};

CookieEvent.prototype.toElasticSearch = function(){

	var result = {};
	result.eventTS = new Date(this.eventTS).toISOString();
	if (this.expireTS && this.expireTS !== null){
		result.expireTS = new Date(this.expireTS).toISOString();
	}

	['domain', 'path', 'action', 'name', 'value', 'page'].forEach(function(key){
		result[key] = this[key];
	});

	result.hostonly = (this.hostonly === 'true');
	result.secure = (this.secure === 'true');
	result.httponly = (this.httponly === 'true');

	return JSON.stringify(result);
};

// set timestamp of event in microseconds since 1.1.1970
CookieEvent.prototype.setEventTS = function(eventTS){

	if(eventTS && typeof(eventTS) === 'number' && eventTS > 0){
		this.eventTS = eventTS;
	} else {
		this.eventTS = new Date().getTime();
	}

	this.lifespanInDays = 0;
	if (this.expireTS) {
		this.lifespanInDays = Math.floor((this.expireTS - this.eventTS)/1000/60/60/24);
	}
};

// set timestamp of expiration in microseconds since 1.1.1970
CookieEvent.prototype.setExpireTS = function(expireTS){

	if (expireTS && typeof(expireTS) === 'number' && expireTS > 0) {
		this.expireTS = expireTS;
		this.lifespanInDays = Math.floor((this.expireTS - this.eventTS)/1000/60/60/24);
	}
};
