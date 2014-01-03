'use strict';
/* global describe, it, beforeEach, expect, browser, by, element */

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

		it('should be accessable via popupUrl ...', function() {
			browser.driver.getTitle().then(function(title){
				expect(title).toEqual('Cookie Monitor');
			});
		});

		describe('should contain', function () {

			it('a body ...', function () {
				expect(browser.isElementPresent(by.css('body'))).toBe(true);
				// browser.findElements(by.css('body')).then(function(list){
				// 	expect(list.length).toEqual(1);
				// });
			});

			it('a PopupController ...', function () {
				expect(browser.isElementPresent(by.css(
					'div[ng-controller="PopupController"]'))).toBe(true);
			});
			
			it('a currentCookie element ...', function () {
				expect(browser.isElementPresent(by.css(
					'div[ng-controller="PopupController"] #currentCookie'))).toBe(true);
			});

			it('a selectedCookies element ...', function () {
				expect(browser.isElementPresent(by.css(
					'div[ng-controller="PopupController"] #selectedCookies'))).toBe(true);
			});

			it('a cookieTable element ...', function () {
				expect(browser.isElementPresent(by.css(
					'div[ng-controller="PopupController"] #cookieTable'))).toBe(true);
			});

			it('a "clearSelection" button ...', function () {
				expect(browser.isElementPresent(by.css(
					'div[ng-controller="PopupController"] button[ng-click="clearSelection()"]'))).toBe(true);
			});

			it('a "clearCookieLog" button ...', function () {
				expect(browser.isElementPresent(by.css(
					'div[ng-controller="PopupController"] button[ng-click="clearCookieLog()"]'))).toBe(true);
			});

		});


		describe('should have a cookieTable which', function () {

			// in dev we prepopulate the array with some elements 
			var refRows = parseInt(browser.params.initialNrOfRows, 10);
			
			it('should have the correct number of rows after initializing ...', function () {

				var rows = element.all(by.repeater('row in renderedRows'));
				rows.then(function(arr){
					expect(arr.length).toEqual(refRows);
				});
			});

		});
	});


});
