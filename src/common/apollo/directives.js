/* This file defines all the directives used to control the audio, there are two types of audio main track and
 background
 */
(function (ng, app) {
    'use strict';
    var _sokratikAudioTrack = ["apollo",'$state',
        function (apollo,$state) {
            return {
                "restrict": "A",
                "transclude": false,
                "template": "",
                compile: function (tElement) {
                    apollo.addMainAudio(ng.element(tElement)[0]);
                    tElement[0].addEventListener('ended', function () {
                        apollo.stopBGAudio();
                    });
                }

            };
        }];
    var _sokratikBackgroundAudioTrack = ["apollo",
        function (apollo) {
            return {
                "restrict": "A",
                "transclude": false,
                "template": "",
                compile: function (tElement) {
                    apollo.addBGAudio(ng.element(tElement)[0]);

                }


            };
        }];
    ng.module(app, ['sokratik.atelier.apollo.services', 'ui.router'])
        .directive("sokratikAudioTrack", _sokratikAudioTrack)
        .directive("sokratikBackgroundAudioTrack", _sokratikBackgroundAudioTrack);
})(angular, "sokratik.atelier.apollo.directives");