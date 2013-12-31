'use strict';
/* global describe, it, beforeEach, expect, xdescribe, browser, by, element */

var helpers = require('../helpers.js');

// TODO: switch to mocha once protractor supports it
describe('', function () {

	var popupUrl = null;

	it('(beforeAll replacement)', function () {
		helpers.getPopupUrl().then(function(url){
			popupUrl = url;
		});
	});

	describe('the extension page "chrome://extensions-frame"', function () {
		
		it('should give a reference to the popup page', function () {
			expect(popupUrl).not.toBe(null);
		});
	});

	describe('the popup', function () {

		beforeEach(function () {
			browser.driver.get(popupUrl);
		});

		it('should be accessable via popupUrl', function() {
			browser.driver.getTitle().then(function(title){
				expect(title).toEqual('Cookie Monitor');
			});
		});

		it('should contain one body element', function () {
			expect(browser.isElementPresent(by.css('body'))).toBe(true);
			browser.findElements(by.css('body')).then(function(list){
				expect(list.length).toEqual(1);
			});
		});

		it('should contain a cookieTable', function () {
			expect(browser.isElementPresent(by.css('.cookieTable'))).toBe(true);
		});

		// it('test', function () {	
		// 	// browser.findElement(by.css('body')).getText().then(function(text){		
		// 	element(by.css('body')).getText().then(function(text){
		// 		expect(text).toEqual("test");
		// 	})
		// });


	});

	xdescribe('the display of the current cookie', function () {

		beforeEach(function () {
			browser.driver.get(popupUrl);
		});

		it('should be disabled on startup', function () {
			expect(element(by.css('.currentCookie')).isDisplayed()).toBe(true);
		});
		// TODO hover and repeat with inverted expectations
	});

});


xdescribe('angularjs homepage', function() {
	it('should greet the named user', function() {
		browser.get('http://www.angularjs.org');

		element(by.model('yourName')).sendKeys('Julie');
		var greeting = element(by.binding('yourName'));

		// expect(greeting.getText()).toEqual('Hello Julie!');
		expect(greeting.getText()).to.eventually.equal('Hello Julie!');
	});

});
