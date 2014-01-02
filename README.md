
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
those tools, but right thats the situation.



This means right now (automatic) testing is extremely limited. Only the
existance of some vital element of the popup is tested. And there is dev code 
to add some test cookies to the model to make (manual) testing easier.
(This dev code is automatically removed from the distributed version)




## Credits 

### AngularJS

### NG-Grid

### Cookie Icon
Alessandro Rei - http://www.kde-look.org/usermanager/search.php?username=mentalrey

### BeOS Pulse Icon

Symbolpaket:BeOSDesigner:Matthew McClintockLizenz:Freeware
http://findicons.com/icon/258317/beos_pulse?id=428315

### Oscilloscope Icon
Symbolpaket:ReflectionDesigner:webdesignerdepot.comLizenz:Freeware (Link erforderlich)
http://findicons.com/icon/440685/oscilloscope?id=449683

### Monitor Icon
Set: Applications
Author:
Open Icon Library
License:
Free for personnal use
http://www.iconattitude.com/icons/ico/6664/utilities-system-monitor.html


