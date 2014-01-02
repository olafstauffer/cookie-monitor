'use strict';

var cookieLog = [];  // TODO restrain size
var cookieCounter = 0;

/* test-code */
cookieLog.push({
	'ts': 1318140426005,
	'domain': 'example.com',
	'path': 'path',
	'name': 'name',
	'value': 'value',
	'action': 'action',
	'expiration': 1318226826005,
	'daysleft': 1,
	'hostonly': 'true',
	'secure': 'true',
	'httponly': 'true',
	'page': 'www.example.com'
});
/* end-test-code */

// use badge text to display a cookie counter
// 
function updateCounter(value){
	var badgeText = '';
	if (value && value >= 0){
		badgeText = '' + value;
	}
	console.log('set badge text='+badgeText);
	chrome.browserAction.setBadgeText({	text: badgeText, tabId: null });
	
	chrome.browserAction.getBadgeText({}, function(text){
		console.log('badge text='+text);
	});
}
chrome.browserAction.setBadgeBackgroundColor( {color: '#ff0000'} );
updateCounter(0);


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

	// in case a popup is already open and needs to update its view
	chrome.runtime.sendMessage(null, {'action': 'add', 'event': cookieEvent});

	cookieCounter += 1;
	updateCounter(cookieCounter);
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
chrome.cookies.onChanged.addListener(onCookieChanged);




// establish communication to popup.js via messages
//
chrome.runtime.onMessage.addListener(function(msg, sender, callback){

	console.log('received message:'+msg.action);
	console.log(msg);

	if ( msg.action && msg.action === 'sendList' ){
		console.log('cookieLog.length='+cookieLog.length);
		callback(cookieLog);
	} else if ( msg.action && msg.action === 'clearList' ){
		while (cookieLog.length > 0) {
			cookieLog.pop();
		}
		updateCounter(0);
		callback(cookieLog);
	}
});











