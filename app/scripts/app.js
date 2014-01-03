'use strict';

var Application = Application || {};

Application.Services = angular.module('application.services', []);
Application.Controllers = angular.module('application.controllers', []);
Application.Directives = angular.module('application.directives', []);

angular.module('CookieMonitorApp', [ 'ngGrid', 'application.services', 'application.controllers', 'application.directives' ]);

