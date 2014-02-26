/* global angular */

(function () {
    'use strict';

    function isBlank(str) {
        if (str === null || str === undefined) {
            str = '';
        }
        return (/^\s*$/).test(str);
    }

    function flashAlertDirective(flash, $timeout) {
        return {
            scope: true,
            link: function ($scope, element, attr) {
                var showTimeoutHandle, hideTimeoutHandle, subscribeHandle;
                var delay = Number(attr.duration || 5000);

                $scope.flash = {};

                $scope.hide = function () {
                    if (!isBlank(attr.activeClass)) {
                        element.removeClass(attr.activeClass);
                    }
                    if (!isBlank(attr.deactiveClass)) {
                        element.addClass(attr.deactiveClass);
                    }

                    if (delay > 0) {
                        hideTimeoutHandle = $timeout(clearFlash, delay);
                    }
                };

                $scope.$on('$destroy', function () {
                    flash.clean();
                    flash.unsubscribe(subscribeHandle);
                });

                function removeAlertClasses() {
                    var classnames = [].concat(flash.classnames.error, flash.classnames.warn, flash.classnames.info, flash.classnames.success);
                    angular.forEach(classnames, function (clazz) {
                        element.removeClass(clazz);
                    });
                }

                function clearFlash() {
                    $scope.flash = {};
                    removeAlertClasses();
                }

                function show(message, type) {
                    if (showTimeoutHandle) {
                        $timeout.cancel(showTimeoutHandle);
                    }
                    if (hideTimeoutHandle) {
                        $timeout.cancel(hideTimeoutHandle);
                    }

                    $scope.flash.type = type;
                    $scope.flash.message = message;
                    removeAlertClasses();
                    angular.forEach(flash.classnames[type], function (clazz) {
                        element.addClass(clazz);
                    });

                    if (!isBlank(attr.activeClass)) {
                        element.addClass(attr.activeClass);
                    }
                    if (!isBlank(attr.deactiveClass)) {
                        element.removeClass(attr.deactiveClass);
                    }

                    if (!message) {
                        $scope.hide();
                        return;
                    }

                    if (delay > 0) {
                        showTimeoutHandle = $timeout($scope.hide, delay);
                    }
                }

                subscribeHandle = flash.subscribe(show, attr.flashAlert, attr.id);

                /**
                 * Fixes timing issues: display the last flash message sent before this directive subscribed.
                 */

                if (attr.flashAlert && flash[attr.flashAlert]) {
                    show(flash[attr.flashAlert], attr.flashAlert);
                }

                if (!attr.flashAlert && flash.message) {
                    show(flash.message, flash.type);
                }

            }
        };
    }

    angular.module('angular-flash.flash-alert-directive', ['angular-flash.service'])
        .directive('flashAlert', ['flash', '$timeout', flashAlertDirective]);

}());
