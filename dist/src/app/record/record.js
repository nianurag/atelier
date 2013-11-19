(function (ng, app) {
  ng.module(app, [
    'ui.router',
    'titleService',
    'plusOne',
    'sokratik.atelier.services.istari',
    'sokratik.atelier.services.dialogue',
    'sokratik.atelier.services.acoustics',
    'ngSanitize',
    'ngAnimate'
  ]).config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider.state('record', {
        url: '/record/:presentationId',
        resolve: {
          answer: [
            '$stateParams',
            'anduril',
            function ($stateParams, anduril) {
              return anduril.fetchAnswer($stateParams.presentationId);
            }
          ],
          audioNode: [
            'acoustics',
            function (acoustics) {
              return acoustics.getAudioNode();
            }
          ],
          stream: [
            'acoustics',
            '$stateParams',
            function (acoustics, $stateParams) {
              return acoustics.stream($stateParams.presentationId);
            }
          ],
          recordAction: [
            'anduril',
            '$stateParams',
            function (anduril, $stateParams) {
              'use strict';
              return function (resp) {
                anduril.recordAction($stateParams.presentationId, resp);
              };
            }
          ]
        },
        data: { mode: 'record' },
        views: {
          'main': {
            controller: 'RecordCtrl',
            templateUrl: 'record/record.tpl.html'
          }
        }
      });
      $stateProvider.state('record.master', {
        url: '/master',
        views: {
          'workspace': {
            controller: 'RecordMaster',
            templateUrl: 'record/master.tpl.html'
          }
        }
      });
      $stateProvider.state('record.activate', {
        url: '/activate/:page',
        views: {
          'workspace': {
            controller: 'RecordDialogue',
            templateUrl: 'record/active.tpl.html'
          }
        }
      });
    }
  ]).controller('RecordCtrl', [
    '$scope',
    'acoustics',
    'audioNode',
    '$state',
    'anduril',
    '$q',
    'stream',
    'answer',
    function ($scope, acoustics, audioNode, $state, anduril, $q, stream, answer) {
      answer.script = [];
      $scope.record = function () {
        $scope.recording = true;
        acoustics.resume(audioNode, stream);
      };
      $scope.play = function () {
        acoustics.stopRecording(audioNode, stream, answer._id);
        $q.when(anduril.completeRecord(answer._id)).then(function (resp) {
        });
        $state.go('play', {
          presentationId: answer._id,
          scriptIndex: 0
        });
      };
      $scope.pause = function () {
        acoustics.pause(audioNode, stream);
        $scope.recording = false;
      };
      $scope.$on('$stateChangeStart', function () {
        'use strict';
        $scope.recording = false;
      });
      $scope.$on('$stateChangeSuccess', function () {
        'use strict';
        $scope.recording = true;
      });
      $scope.recording = true;
    }
  ]).controller('RecordMaster', [
    '$scope',
    'answer',
    'acoustics',
    'audioNode',
    'stream',
    'dialogue',
    'anduril',
    'recordAction',
    function ($scope, answer, acoustics, audioNode, stream, dialogue, anduril, recordAction) {
      $scope.presentations = _.map(answer.presentationData, function (obj) {
        obj.templateName = obj.templateName || 'master';
        return obj;
      });
      $scope.activate = function (index) {
        var resp = dialogue.changeState({
            subState: '.activate',
            params: { page: index }
          });
        anduril.recordAction(answer._id, resp);
      };
      $scope.presentationId = answer._id;
      acoustics.resume(audioNode, stream);
    }
  ]).controller('RecordDialogue', [
    '$scope',
    'answer',
    'anduril',
    'dialogue',
    '$stateParams',
    'recordAction',
    '$q',
    function ($scope, answer, anduril, dialogue, $stateParams, recordAction, $q) {
      var page = parseInt($stateParams.page, 10);
      $scope.presentation = answer.presentationData[page];
      var fragmentFn = null;
      $scope.addFragment = function (fragment) {
        fragmentFn = fragment;
        function resetFragments() {
          dialogue.resetFragments({ fragments: fragmentFn() }, $q.defer()).then(ng.noop);
        }
        if (_.size(fragment()) > 0) {
          resetFragments();
        } else {
          _.delay(resetFragments, 1000);
        }
      };
      $scope.masterView = function () {
        recordAction(dialogue.changeState({
          subState: '.master',
          params: null
        }));
      };
      var index = 0;
      $scope.next = function () {
        dialogue.makeVisible({
          fragments: fragmentFn(),
          index: index++
        }, $q.defer()).then(recordAction);
      };
      $scope.previous = function () {
        dialogue.hide({
          fragments: fragmentFn(),
          index: --index
        }, $q.defer()).then(recordAction);
      };
      $scope.nextSlide = function () {
        recordAction(dialogue.changeState({
          subState: '.activate',
          params: { page: ++page }
        }));
      };
    }
  ]);
}(angular, 'sokratik.atelier.record'));