//this file contains services which will be used to communicate across various apps of atelier
//the breed of istari will guide individual apps to achieve their task.
(function (ng, app) {
    ng.module(app, ["ngResource"], ["$provide", function ($provide) {
        $provide.provider("anduril", andurilForger);

    }]);

    var andurilForger = function () {
        var injectors = {};
        //given a question fetches the images for the answer
        var _fetchImages = function (questionId) {
            var deferred = injectors.$q.defer();
            injectors.$http.get("/related-images/" + questionId, {cache: true})
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function () {
                    injectors.$log.info("call failed getting images");
                    deferred.resolve([]);
                });
            return deferred.promise;
        };

        var _recordScript = function (answer, tuple) {
            answer.script.push(tuple);
        };

        var _insertScript = function (answer, script) {
            answer.script = script;
            return answer;
        };
        var _postScript = function (answer) {
            //noinspection JSUnresolvedFunction
            return answer.$update();
        };
        this.$get = ["$http", "$log", "$q", "$resource", function ($http, $log, $q, $resource) {
            injectors.$http = $http;
            injectors.$log = $log;
            injectors.$q = $q;
            injectors.$resource = $resource;
            //declaring the resource
            var Answer = $resource('/answer/:answerId', {
                answerId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });

            return {
                put: function (answer, page, presentationMap) {
                    //noinspection JSUnresolvedVariable
                    var templateFragment = answer.presentationData;
                    templateFragment[page] = presentationMap;
                    return answer;
                },
                insert: function (answer, page, presentationMap) {
                    "use strict";
                    var templateFragment = answer.presentationData;
                    templateFragment.splice(page, 0, presentationMap);
                    return answer;

                },
                changeTemplate: function (answer, page, templateName) {
                    "use strict";
                    var templateFragment = answer.presentationData;
                    console.log("[Old:" + templateFragment[page].templateName + "] [New" + templateName + "]");
                    templateFragment[page].templateName = templateName;
                },
                remove: function (answer, page) {
                    "use strict";
                    var templateFragment = answer.presentationData;
                    templateFragment.splice(page, 1);
                    return answer;
                },
                post: function (answer) {
                    //noinspection JSUnresolvedFunction
                    return answer.$update(function (resp) {
                        "use strict";
                        console.log("I have updated" + ng.toJson(resp));
                    });
                },
                fetchImages: _fetchImages,
                fetchAnswer: function (answerId) {

                    var deferred = $q.defer();
                    Answer.get({answerId: answerId}, function (answer) {
                        deferred.resolve(answer);
                    });
                    return deferred.promise;

                },
                recordAction: _recordScript,
                completeRecord: _postScript,
                insertScript: _insertScript
            };
        }
        ]
        ;
    };
})(angular, "sokratik.atelier.services.istari");