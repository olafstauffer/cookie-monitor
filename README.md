## Cookie Monitor

Cookie Monitor collects and displays cookie events happening in the browser. 

Features:
 * Tabular display of event time, name, ... as they come in
 * Badge displaying an event counter
 * Sort events
 * Group events
 * Export events to csv file
 * Export events to Elasticsearch
 * Preferences page to setup csv export and elasticsearch target

### Screenshots

#### Main Display

![Main Display](./screenshots/screenshot-main.png "Main Display")

Tableview 

#### Selecting Events
![Selected Events](./screenshots/screenshot-selected.png "Selected Events")

### 
![Drill Down](./screenshots/screenshot-drill-down.png "Drill Down")
![Options](./screenshots/screenshot-options.png "Options")


### Motivation

I found a lot of tools around the cookie itself (e.g. display, modify or block it), but at the time i wrote this there was none that displayed how cookies are used on websites. Cookie Monitor displays exactly those cookie event.

For example try to navigate to one of the current video streaming sites (e.g. netflix.com or watchever.de) and have a look at the counter badge ... 

Or try to find the site that tries to reach the immortal users by using expire dates on the cookies which are way beyond the life expectancy of a human being.  :-)

Those findings lead to the idea to hook this up to some tools specialized in analysing events like [elasticsearch](http://www.elasticsearch.org). With this you can answer questions like the above or get infos on the sites to visited and how those site use cookies. You can even display those in nice dashboards like [kibana](http://www.elasticsearch.org/overview/kibana/).



Cookie Monitor is both a playground to experiment with browser extensions (opera/chrome style), the javascript toolchain (grunt, ...) and a tool that I actually use to examine the usage of cookie events on different pages. 

The state of the project is still experimental but it works.


### Usage

Chrome nowadays prevents any extension from running that is not installed via the official chrome store. The only way to use this extension now is to use the developer mode (see e.g. [this article](http://techdows.com/2013/12/chrome-disable-developer-mode-extensions.html)). You need to use "load unpacked extension" and navigate to the app folder.



### Internals

Cookie Monitor is build around the _onChanged_ event of the [chrome cookies api](http://developer.chrome.com/extensions/cookies.html).

This event does not provide a reference to the page that caused the event to happen. Cookie Monitor guesses the page by looking at the active browser tab when the event occures. If you need reliable information about the page source you can only use a single browser tab.




## Testing

Right now only e2e test using protractor (webdriver) are being executed.
To test the extensions popup page we first have to find the url for this
(e.g. chrome-extension://kpdpnnannoiaapakjkkiggimlcggagjb/popup.html ).
The tricky part is the extension id - as this changes everytime run the 
test. 

Therefore on startup this id is scraped from the internal extension
overview url (chrome://extensions resp. chrome:/extensions-frame).

Then the popup url is constructed and the tests are performed with
protractor.

Unfortunatelly there are two problems:
1. protractor cannot sync to the internal page
   A call to "browser.driver.get(popupUrl)" works, but a call to "browser.get(popupUrl)" does not. Therefore the tests can only see the inital page, not
   the angular app page.
2. webdriver does not emit a "onCookieChanged" event
   webdriver can add cookies or call a page that sets cookie, but the event
   os never fired - unfortunatelly this extension depends on it.

Maybe I'm not using protractor/webdriver correctly or maybe there are bugs in
those tools, but right now thats the situation.



This means right now (automatic) testing is extremely limited. Only the
existance of some vital element of the popup is tested. And there is dev code 
to add some test cookies to the model to make (manual) testing easier.
(This dev code is automatically removed from the distributed version)

### Run Tests

    1. Prepare Webdriver: 
        ./node_modules/protractor/bin/webdriver-manager update

    2. Start the Selenium server:
        ./node_modules/protractor/bin/webdriver-manager start

    3. Run Test:
        grunt test



## Credits 

### AngularJS

### NG-Grid

### Icons

* Cookie Icon (Alessandro Rei - http://www.kde-look.org/usermanager/search.php?username=mentalrey)

* BeOS Pulse Icon (Symbolpaket:BeOSDesigner:Matthew McClintockLizenz:Freeware, http://findicons.com/icon/258317/beos_pulse?id=428315)

* Oscilloscope Icon (Symbolpaket:ReflectionDesigner:webdesignerdepot.comLizenz:Freeware, http://findicons.com/icon/440685/oscilloscope?id=449683)

* Monitor Icon (http://www.iconattitude.com/icons/ico/6664/utilities-system-monitor.html)


## Versions

 * 0.5 Refactored cookie event functionality into CookieEvent class 
 * 0.4 Add upload to Elasticsearch
 * 0.3 Add options.html
 * 0.2 Add csv export