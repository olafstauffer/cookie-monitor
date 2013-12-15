// alert("background.js called");

var cookieLog = [];  // TODO restrain size
var cookieCounter = 0;

function onCookieChanged(changeInfo){

	console.log(changeInfo);

	// we are only interested in a single event per update
	// (during an update two events: cause:overwrite/removed:true + 
	// cause:explicit/removed:false are send)
	if ( changeInfo.cause === 'overwrite' && changeInfo.removed === true) return;

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
		'hostonly': changeInfo.cookie.hostOnly,
		'secure': changeInfo.cookie.secure,
		'httponly': changeInfo.cookie.httpOnly
	};
	console.log(cookieEvent);
	cookieLog.push(cookieEvent);

	// in case a popup is already open and needs to update its view
	chrome.runtime.sendMessage(null, {'action': 'add', 'event': cookieEvent}, null);

	cookieCounter += 1;
	updateCounter(cookieCounter);
};

// watch for every cookie event
// TODO make this on demand
chrome.cookies.onChanged.addListener(onCookieChanged);


chrome.runtime.onMessage.addListener(function(msg, sender, respondFunction){
	console.log("incoming message to background.js");
	console.log(msg);
	if ( msg.action && msg.action === "sendList" ){
		respondFunction(cookieLog);
	}
});


//
// use badge text to display a cookie counter
// 

function updateCounter(value){
	var badgeText = "";
	if (value && value >= 0){
		badgeText = "" + value;
	}
	chrome.browserAction.setBadgeText({	text: badgeText, tabId: null });
}
chrome.browserAction.setBadgeBackgroundColor( {color: "#ff0000"} );	
updateCounter(0);

