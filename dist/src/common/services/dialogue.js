(function (ng, app) {
  var dialogueService = function () {
    var _changeSingleDialogue = function (presentationDialogues, index, classToAdd, classToRemove) {
      _.each(presentationDialogues, function (presentationDialog) {
        presentationDialog.css = _.without(presentationDialog.css, classToAdd);
      });
      presentationDialogues[index].css = _.chain(presentationDialogues[index].css).union([classToAdd]).without(classToRemove).value();
      return presentationDialogues;
    };
    var _changeAllDialogues = function (presentationDialogues, classToAdd, classToRemove) {
      return _.map(presentationDialogues, function (presentationDialog) {
        presentationDialog.css = _.chain(presentationDialog.css).without(classToRemove).union([classToAdd]).value();
      });
    };
    var _changeFragmentClass = function (fragment, classToAdd, classToRemove) {
      fragment.css = _.chain(fragment.css).without(classToRemove).union(classToAdd).value();
      return fragment;
    };
    this.$get = function () {
      return {
        resetFragments: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _.delay(function () {
            _changeAllDialogues(context.fragments, 'fragment', 'visible');
            deferred.resolve({
              'fnName': 'resetFragments',
              'args': [],
              actionInitiated: actionInitiated
            });
          });
          return deferred.promise;
        },
        makeVisible: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _.delay(function () {
            _changeFragmentClass(context.fragments[context.index], 'visible', '');
            deferred.resolve({
              'fnName': 'makeVisible',
              'args': [{ index: context.index }],
              actionInitiated: actionInitiated
            });
          });
          return deferred.promise;
        },
        hide: function (context, deferred) {
          var actionInitiated = new Date().getTime();
          _.delay(function () {
            _changeFragmentClass(context.fragments[context.index], 'fragment', 'visible');
            deferred.resolve({
              'fnName': 'makeVisible',
              'args': [{ index: context.index }],
              actionInitiated: actionInitiated
            });
          });
          return deferred.promise;
        }
      };
    };
  };
  ng.module(app, [], [
    '$provide',
    function ($provide) {
      $provide.provider('dialogue', dialogueService);
    }
  ]);
}(angular, 'sokratik.atelier.services.dialogue'));