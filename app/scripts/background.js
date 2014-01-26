'use strict';
/* global CookieEvent */

var cookieLog = [];  // TODO restrain size

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


function sendToElasticSearch(cookieEvent){

	// TODO: check if there is a way to extend the angular app to
	//       the background page without constantly loading to much 
	//       into the browser; 

	var elasticsearchUrl = localStorage.getItem('elasticsearchUrl');
	if (!elasticsearchUrl || elasticsearchUrl === null){
		elasticsearchUrl = 'http://localhost:9200/browserdata/cookie'; // TODO: sync with config-server.js
	}
	console.log('url='+elasticsearchUrl);
	// console.log('data='+toJSON(cookie));

	var client = new XMLHttpRequest();
    client.open('POST', elasticsearchUrl, true);
    client.setRequestHeader('Content-Type', 'text/plain');
    client.send(cookieEvent.toElasticSearch());
}




// helper function to create and broadcast a cookie event
//
// TODO: convert to class

function broadcastCookieEvent(cookieEvent){

	console.log('broadcastCookieEvent:');
	console.log(cookieEvent);

	cookieLog.push(cookieEvent);

	updateBadge();

	// in case a popup is already open and needs to update its view
	chrome.runtime.sendMessage(null, {'action': 'add', 'event': cookieEvent});

	// optionally send the event to elastic search
	if ( localStorage.getItem('elasticsearchEnableExport') === 'yes' ){
		sendToElasticSearch(cookieEvent);
	}
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

	var cookieEvent = new CookieEvent(changeInfo.removed, changeInfo.cause, changeInfo.cookie);

	// no use to guess the page for expired events
	if ( changeInfo.cause === 'expired' ){
		broadcastCookieEvent(cookieEvent);
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
				cookieEvent.setPage(currentUrl);
				broadcastCookieEvent(cookieEvent);
			});

    });

}

// watch for every cookie event
//
chrome.cookies.onChanged.addListener(onCookieChanged);
// updateBadge();


// establish communication to application via messages
//
chrome.runtime.onMessage.addListener(function(msg, sender, callback){

	console.log('background.js received message, action='+ msg.action);

	if ( msg.action && msg.action === 'sendList' ){
		callback(cookieLog);
	} else if ( msg.action && msg.action === 'clearList' ){
		// fast way to clear the cookie list
		while (cookieLog.length > 0) {
			cookieLog.pop();
		}
		updateBadge();
		callback(cookieLog);
	}
});


/* test-code */
chrome.runtime.onInstalled.addListener(function(){
	var testEvent1 = new CookieEvent(false, 'action', {
			'domain': 'example.com',
			'path': 'path',
			'name': 'cookie1',
			'value': 'value1',
			'hostOnly': true,
			'secure': true,
			'httpOnly': true
		});
	testEvent1.setEventTS(1318140426005);
	testEvent1.setExpireTS(1318226826005);
	testEvent1.setPage('www.example.com');
	cookieLog.push(testEvent1);

	var testEvent2 = new CookieEvent(false, 'action', {
			'domain': 'example.com',
			'path': 'path',
			'name': 'cookie2',
			'value': 'value2',
			'hostOnly': false,
			'secure': false,
			'httpOnly': false
		});
	testEvent2.setEventTS(1318140426015);
	testEvent2.setPage('www.example.com');
	cookieLog.push(testEvent2);


	updateBadge();
	console.log(cookieLog);
});
/* end-test-code */




