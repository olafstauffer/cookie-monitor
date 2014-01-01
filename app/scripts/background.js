'use strict';

var cookieLog = [];  // TODO restrain size
var cookieCounter = 0;

/* test-code */
cookieLog.push({
	'ts': 12345,
	'domain': 'example.com',
	'path': 'path',
	'name': 'name',
	'value': 'value',
	'action': 'action',
	'expiration': 12345,
	'hostonly': true,
	'secure': true,
	'httponly': true,
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
	chrome.browserAction.setBadgeText({	text: badgeText, tabId: null });
}
chrome.browserAction.setBadgeBackgroundColor( {color: '#ff0000'} );
updateCounter(0);

// capture every cookie change event and update the log
//
function onCookieChanged(changeInfo){

	// we are only interested in a single event per update
	// (during an update two events: cause:overwrite/removed:true + 
	// cause:explicit/removed:false are send)
	if ( changeInfo.cause === 'overwrite' && changeInfo.removed === true){
		return;
	}


	// get the url of the current page
	// (note: this is a just a valid guess, because the cookie event cannot
	// be linked to a originating page directly!)
	chrome.tabs.query({currentWindow: true, active: true}, function(tab) {

		chrome.tabs.getSelected(tab.windowId, function(tab2) {
			var currentUrl = tab2.url.split('?').shift().split('#').shift();

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
				'hostonly': changeInfo.cookie.hostOnly ? 'true' : 'false',  // grouping in ng-grid does not like booleans
				'secure': changeInfo.cookie.secure ? 'true' : 'false',  // grouping in ng-grid does not like booleans
				'httponly': changeInfo.cookie.httpOnly ? 'true' : 'false',  // grouping in ng-grid does not like booleans
				'page': currentUrl
			};
			console.log(cookieEvent);
			cookieLog.push(cookieEvent);

			// in case a popup is already open and needs to update its view
			chrome.runtime.sendMessage(null, {'action': 'add', 'event': cookieEvent}, null);

			cookieCounter += 1;
			updateCounter(cookieCounter);
		});

    });

}
chrome.cookies.onChanged.addListener(onCookieChanged);




// establish communication to popup.js via messages
//
chrome.runtime.onMessage.addListener(function(msg, sender, callback){
	console.log(msg);
	if ( msg.action && msg.action === 'sendList' ){
		callback(cookieLog);
	} else if ( msg.action && msg.action === 'clearList' ){
		while (cookieLog.length > 0) {
			cookieLog.pop();
		}
		updateCounter(0);
		callback(cookieLog);
	}
});











