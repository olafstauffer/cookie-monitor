'use strict';

var cookieLog = [];  // TODO restrain size
/* test-code */
cookieLog.push({
	'ts': 1318140426005,
	'domain': 'example.com',
	'path': 'path',
	'name': 'cookie',
	'value': 'value',
	'action': 'action',
	'expiration': 1318226826005,
	'daysleft': 1,
	'hostonly': 'true',
	'secure': 'true',
	'httponly': 'true',
	'page': 'www.example.com'
});
cookieLog.push({
	'ts': 1318140426005,
	'domain': 'example.com',
	'path': 'path',
	'name': 'session',
	'value': 'value',
	'action': 'action',
	'expiration': null,
	'daysleft': 0,
	'hostonly': 'false',
	'secure': 'false',
	'httponly': 'false',
	'page': 'www.example.com'
});
/* end-test-code */


// use badge text to display a cookie counter
// 
chrome.browserAction.setBadgeBackgroundColor( {color: '#ff0000'} );
function updateBadge(){

	var badgeText = '';
	if (cookieLog.length !== 0){
		badgeText = '' + cookieLog.length;
	}
	chrome.browserAction.setBadgeText({	text: badgeText, tabId: null });
}

// TODO: refactor cookie event to own class
function toJSON(cookieEvent){

	var result = {};
	result.ts = new Date(cookieEvent.ts).toISOString();
	if (cookieEvent.expiration && cookieEvent.expiration !== null){
		result.expiration = new Date(cookieEvent.expiration).toISOString();
	}

	['domain', 'path', 'action', 'name', 'value', 'page'].forEach(function(key){
		result[key] = cookieEvent[key];
	});

	result.hostonly = (cookieEvent.hostonly === 'true');
	result.secure = (cookieEvent.secure === 'true');
	result.httponly = (cookieEvent.httponly === 'true');

	return JSON.stringify(result);
}


function sendToElasticSearch(cookie){

	// TODO: check if there is a way to extend the angular app to
	//       the background page without constantly loading to much 
	//       into the browser; 

	if ( localStorage.getItem('elasticsearchEnableExport') !== 'yes' ){
		return;
	}

	var elasticsearchUrl = localStorage.getItem('elasticsearchUrl');
	if (!elasticsearchUrl || elasticsearchUrl === null){
		elasticsearchUrl = 'http://localhost:9200/browserdata/cookie'; // TODO: sync with config-server.js
	}
	console.log('url='+elasticsearchUrl);
	// console.log('data='+toJSON(cookie));

	var client = new XMLHttpRequest();
    client.open('POST', elasticsearchUrl, true);
    client.setRequestHeader('Content-Type', 'text/plain');
    client.send(toJSON(cookie));

}




// helper function to create and broadcast a cookie event
//
// TODO: convert to class

function broadcastCookieEvent(changeInfo, url){

	var currentTS = new Date().getTime();
	var expirationTS = null;
	if (changeInfo.cookie.expirationDate) {
		expirationTS = new Date(changeInfo.cookie.expirationDate * 1000).getTime();
	}

	var cookieEvent = {
		'ts': currentTS,
		'domain': changeInfo.cookie.domain,
		'path': changeInfo.cookie.path,
		'name': changeInfo.cookie.name,
		'value': changeInfo.cookie.value,
		'action': changeInfo.cause,
		'expiration': expirationTS,
		'daysleft': expirationTS ? Math.floor((expirationTS - currentTS)/1000/60/60/24) : 0,
		'hostonly': changeInfo.cookie.hostOnly ? 'true' : 'false',  // grouping in ng-grid does not like booleans
		'secure': changeInfo.cookie.secure ? 'true' : 'false',  // grouping in ng-grid does not like booleans
		'httponly': changeInfo.cookie.httpOnly ? 'true' : 'false',  // grouping in ng-grid does not like booleans
		'page': url
	};
	console.log(cookieEvent);
	cookieLog.push(cookieEvent);

	updateBadge();

	// in case a popup is already open and needs to update its view
	chrome.runtime.sendMessage(null, {'action': 'add', 'event': cookieEvent});

	sendToElasticSearch(cookieEvent);
}


// capture every cookie change event and update the log
//
function onCookieChanged(changeInfo){

	// we are only interested in a single event per update
	// (during an update two events: cause:overwrite/removed:true + 
	// cause:explicit/removed:false are send)
	if ( changeInfo.cause === 'overwrite' && changeInfo.removed === true){
		return;
	}


	// no use to guess the page for expired events
	if ( changeInfo.cause === 'expired' ){
		broadcastCookieEvent(changeInfo, '');
		return;
	}

	// get the url of the current page
	// (note: this is a just a valid guess, because the cookie event cannot
	// be linked to a originating page directly!)
	chrome.tabs.query({currentWindow: true, active: true}, function() {

		chrome.tabs.query(
			{
				active: true,
				currentWindow: true
			},
			function(tabs) {
				var currentUrl = tabs[0].url.split('?').shift().split('#').shift();
				broadcastCookieEvent(changeInfo, currentUrl);
			});

    });

}

// watch for every cookie event
//
chrome.cookies.onChanged.addListener(onCookieChanged);
updateBadge();


// establish communication to application via messages
//
chrome.runtime.onMessage.addListener(function(msg, sender, callback){

	console.log('background.js received message, action='+ msg.action);

	if ( msg.action && msg.action === 'sendList' ){
		callback(cookieLog);
	} else if ( msg.action && msg.action === 'clearList' ){
		// clear the cookie list
		while (cookieLog.length > 0) {
			cookieLog.pop();
		}
		updateBadge();
		callback(cookieLog);
	}
});






