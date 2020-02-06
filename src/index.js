var extend = require('xtend')
var angular = require('angular')

module.exports = angular
.module('simple-angular-dialog', [])
.factory('dialog', ngDialog)
.name

ngDialog.$inject = [
'$document',
'$compile',
'$rootScope',
'$controller',
'$timeout',
'$q'
]

function ngDialog ($document, $compile, $rootScope, $controller, $timeout, $q) {
  var defaults = {
    template: null,
    controller: null,
    escapeKey: true,
    hasX: false,
    overlayClose: true,
    locals: {}
  }

  var body = $document.find('body')
  var modal
  var deferred

  return {
    show: show,
    cancel: cancel,
    submit: submit,
    confirm: confirm,
    reason: reason,
    alert: alert
  }

  function submit (data) {
    if (!deferred) return

    if (modal) {
      modal.remove()
    }

    return deferred.resolve(data)
  }

  function cancel () {
    if (!deferred) return

    if (modal) {
      modal.remove()
    }

    return deferred.reject('Canceled')
  }

  function alert (text, title) {
    deferred = $q.defer()
    title = title || 'this can not be undone';

    var alertModal = angular.element(
      '<div class="dialog-container">' +
      '<div class="dialog" id="dialog-alert">' +
      '<div class="dialog-header">' +
      '<h2 translate>' + title + '</h2>' +
      '</div>' +
      '<div class="dialog-body dialog-confirm">' +
      '<div class="dialog-inner" translate>' + text + '</div>' +
      '</div>' +
      '<div class="dialog-footer">' +
      '<a class="button button-style" ng-click="accept()" translate>confirm</a>' +
      '</div>' +
      '</div>' +
      '</div>'
      )

    var scope = $rootScope.$new()

    scope.accept = function () {
      alertModal.remove()
      return deferred.resolve()
    }

    $compile(alertModal)(scope)

    // Attach compiled modal to DOM
    body.append(alertModal)

    $timeout(function () {
      $timeout(function () {
        document.querySelector('#dialog-alert').classList.add('show-dialog')
      }, 200)
      alertModal.addClass('fadeIn')
    }, 0)

    return deferred.promise
  }

  function confirm (text) {
    deferred = $q.defer()

    var confirmModal = angular.element(
      '<div class="dialog-container">' +
      '<div class="dialog" id="confirm">' +
      '<div class="dialog-header">' +
      '<h2 translate>this can not be undone</h2>' +
      '</div>' +
      '<div class="dialog-body dialog-confirm">' +
      '<div class="dialog-inner" translate>' + text + '</div>' +
      '</div>' +
      '<div class="dialog-footer">' +
      '<a class="button button-style" ng-click="decline()" translate>cancel</a>' +
      '<a class="button button-style" ng-click="accept()" translate>confirm</a>' +
      '</div>' +
      '</div>' +
      '</div>'
      )

    var scope = $rootScope.$new()

    scope.decline = function () {
      confirmModal.remove()
      return deferred.reject()
    }

    scope.accept = function () {
      confirmModal.remove()
      return deferred.resolve()
    }

    $compile(confirmModal)(scope)

    // Attach compiled modal to DOM
    body.append(confirmModal)

    $timeout(function () {
      $timeout(function () {
        document.querySelector('#confirm').classList.add('show-dialog')
      }, 200)
      confirmModal.addClass('fadeIn')
    }, 0)

    return deferred.promise
  }

  function show (options) {
    var closeX
    var overlay

    deferred = $q.defer()
    options = extend({}, defaults, options)

    // if hasX is true, we add an X to the right of the dialog
    if (options.hasX === true) {
      closeX = '<button class="dialog-x" ng-click="close()">&#10005;</button>'
    } else {
      closeX = ''
    }

    // if overlayClose is true, we add a ngClick to close the dialog
    // on the backdrop
    if (options.overlayClose === true) {
      overlay = '<div class="dialog-container" ng-click="close()">'
    } else {
      overlay = '<div class="dialog-container">'
    }

    modal = angular.element(overlay + '<div class="dialog" ng-click="$event.stopPropagation()">' + closeX + options.template + '</div></div>')

    var keyDown = function (event) {
      if (event.keyCode === 27) {
        closeFn()
      }
    }

    var closeFn = function () {
      body.unbind('keydown', keyDown)
      modal.remove()
    }

    if (options.escapeKey !== false) {
      body.bind('keydown', keyDown)
    }

    var ctrl
    var locals
    var scope = $rootScope.$new()

    scope.close = function () {
      closeFn()
      return deferred.reject()
    }

    if (options.controller) {
      locals = extend({$scope: scope}, options.locals)
      ctrl = $controller(options.controller, locals)

      // controllerAs?
      if (options.controllerAs) {
        scope[options.controllerAs] = ctrl
      }

      // ngControllerController is not a typo -___-
      modal.contents().data('$ngControllerController', ctrl)
    }

    $compile(modal)(scope)

    // Attach compiled modal to DOM
    body.append(modal)

    $timeout(function () {
      $timeout(function () {
        var dialog = document.querySelector('.dialog')
        if (dialog) {
          dialog.classList.add('show-dialog')
        }
      }, 200)
      modal.addClass('fadeIn')
    }, 0)

    return deferred.promise
  }

  function reason(info) {
    deferred = $q.defer()

    var reasonModal = angular.element(
      '<div class="dialog-container">' +
      '<div class="dialog" id="reason">' +
      '<div class="dialog-header">' +
      '<h2 translate>this can not be undone</h2>' +
      '</div>' +
      '<div class="dialog-body dialog-reason">' +
      '<div class="dialog-inner">' +
      '<div><span translate>add reason</span>:</div>' +
      '<textarea class="reason-text form-control" name="reasonText" id="reasonText" rows="4" maxlength="200" ng-model="reason" autofocus></textarea>' +
      '<div class="alert alert-info results-alert" ng-if="info.length">{{info}}</div>' +
      '</div>' +
      '</div>' +
      '<div class="dialog-footer">' +
      '<a class="button button-style" ng-click="cancel()" translate>cancel</a>' +
      '<a class="button button-style reason-button" ng-click="save()" ng-disabled="reason.length < 2 || reason.length > 200" translate>confirm</a>' +
      '</div>' +
      '</div>' +
      '</div>'
    )

    var scope = $rootScope.$new()

    scope.info = info

    scope.reason = ''

    scope.cancel = function () {
      reasonModal.remove()
      return deferred.reject()
    }

    scope.save = function () {
      if (scope.reason.length > 1 && scope.reason.length <= 200) {
        reasonModal.remove()
        return deferred.resolve(scope.reason)
      }
    }

    $compile(reasonModal)(scope)

    // Attach compiled modal to DOM
    body.append(reasonModal)

    $timeout(function () {
      $timeout(function () {
        document.querySelector('#reason').classList.add('show-dialog')
      }, 200)
      reasonModal.addClass('fadeIn')
    }, 0)

    return deferred.promise
  }
}
