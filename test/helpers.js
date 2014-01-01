'use strict';
/* global browser, by, protractor */

var fs=require('fs');

module.exports.getPopupUrl = function(){

	// The popup.html of the extension can be accessed directly via
	// an internal chrome url, e.g.
	//
	// chrome-extension://kpdpnnannoiaapakjkkiggimlcggagjb/popup.html
	// The path contains the extension-id, that is generated while loading the
	// extension. Therefore while dynmically loading the extension during an
	// automated test we cannot know upfront what this id will be.
	// 
	// This function tries to find the corresponding html elements in the
	// extensions page to find the current extension-id and compose the current
	// popup url.
	//
	// We have to use the webdriver functions directly because protractor methods
	// only work on a page with an angular app - which chrome://extensions is not.
	//
	// Workflow:
	// 1. Go to the the frame that contains the list of extensions (src='chrome://extensions-frame').
	// 2. Find the element with the id 'extension-settings-list'.
	// 3. Iterate over every child element with class 'extension-details'.
	// 4. Find the child element who has a child of class 'extension-title' and 
	//    check if this title is the name of the extension under test.
	// 5. If the correct tile was found get the id, the value of the child of the
	//    extension-detail that has the class 'extension-id'.
	//
	// Now we can compose the url for the popup, e.g.
	// chrome-extension://kpdpnnannoiaapakjkkiggimlcggagjb/popup.html

	// TODO: refactor, after understanding promises

	var extensionId = null;
	browser.driver.get('chrome://extensions-frame/');
	browser.driver
		.findElements(by.css('#extension-settings-list .extension-details'))
		.then(function(details){

			// find the detail with the correct title
			details.forEach(function(detailElement){
				detailElement.findElement(by.css('.extension-title')).getInnerHtml()
				.then(function(title){
					// console.log('title='+title);
					if(title === 'Cookie Monitor'){ //TODO convert to variable
						detailElement.findElement(by.css('.extension-id')).getInnerHtml()
						.then(function(id){
							// console.log('found id='+id);
							extensionId = id.trim();
						});
					}
				});
			});
		});


	// return a promise for the url
	//
	var result = protractor.promise.defer();

	browser.driver.wait(function(){
		return (extensionId !== null);
	}).then(function(){
		result.fulfill('chrome-extension://'+extensionId+'/popup.html');
	});

	return result.promise;
};
