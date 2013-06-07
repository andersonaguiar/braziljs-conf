/*global $, require, google, browser: true */
$(function () {

    'use strict';

    var PUBLIC = {},
        PRIVATE = {};

    PRIVATE.configRequirePaths = function () {

        require.config({
            paths: {
                "facebook" : "http://connect.facebook.net/pt_BR/all.js#xfbml=1",
                "twitter" : 'http://platform.twitter.com/widgets',
                "g+" : 'http://apis.google.com/js/plusone',
                "sequence" : 'jquery.sequence-min',
                "async" : 'async-plugin'
            }
        });

    };

    PUBLIC.init = function () {

        PRIVATE.configRequirePaths();

        PUBLIC.appendEvents();

        //Loads the right speakers background
        PUBLIC.loadBackground();

        //Function responsible for expand the content in schedule section
        PUBLIC.applyScheduleEvents();

        //All about the menu
        PUBLIC.applyMenuBehaviours();

        //Load the speakers modal behaviours
        PUBLIC.applyModalBehaviours();

        //Load Google Maps API
        PUBLIC.loadMaps();

        //Just load the facebook, gplus and twitter API´s
        PUBLIC.loadSocialAPPS();

    };

    PUBLIC.appendEvents = function () {

        var modalContainer = $('#modal'),
            keynotesContainer = $('.keynote-container:first'); //This is a tip.... read carefully :)

        keynotesContainer.hover(
            function () {

                modalContainer.addClass('on');

            },
            function () {

                modalContainer.removeClass('on');

            }
        );

    };

    PUBLIC.loadBackground = function () {

        var background = {},
            userInformation = {},
            shadowsContainer = $('#speakers').find('.shadows:first');

        background = {

            init : function () {

                var hasLocalStorage = background.verifyLocalStorage();

                if (hasLocalStorage) {

                    background.loadHeroes();

                } else {

                    shadowsContainer.addClass('theather-version');

                }

            },

            verifyLocalStorage : function () {

                //This function is the same used in Modernizr.
                try {

                    return 'localStorage' in window && window['localStorage'] !== null;

                } catch (e) {

                    return false;

                }

            },

            loadHeroes : function () {

                userInformation.movieVersion = localStorage.getItem('BRJS-movieVersion');

                if (userInformation.movieVersion) {

                    if (userInformation.movieVersion === 'directors-cut') {

                        userInformation.movieVersion = 'theater-version';

                    } else {

                        userInformation.movieVersion = 'directors-cut';

                    }

                } else {

                    localStorage.setItem('BRJS-movieVersion', 'directors-cut');
                    userInformation.movieVersion = 'directors-cut';

                }

                //Puts the current version in the shadows container
                shadowsContainer.addClass(userInformation.movieVersion);
                localStorage.setItem('BRJS-movieVersion', userInformation.movieVersion);

            }

        };

        return background.init();

    };

    PUBLIC.applyMenuBehaviours = function () {

        var menu = {},
            menuContainer = $('#menu'),
            menuItens = menuContainer.find('ul:first'),
            hooks = $('html, body');

        menu = {

            init : function () {

                menu.bindWindowEvents();

            },

            bindWindowEvents : function () {

                //Binds the expanded menu in mobile or tablet devices
                menuContainer.find('.menu-switch:first').on('click', function () {

                    menuItens.toggleClass('opened');

                });

                //Bind Links Scroll Animation
                menuItens.on('click', 'a', function (evt) {

                    evt.preventDefault();

                    menu.goToSelectedAnchor($(this).attr('href'));

                });

            },

            goToSelectedAnchor : function (anchor) {

                menuItens.toggleClass('opened');

                hooks.animate({

                    scrollTop: $(anchor).offset().top - 70

                }, 1000);

            }

        };

        return menu.init();

    };

    PUBLIC.applyScheduleEvents = function () {

        var scheduleContainer = $('#schedule'),
            tablesContainer = scheduleContainer.find('table');

        tablesContainer.each(function () {

            $(this).find('.expand').click(function () {

                $(this).toggleClass('active');

            });

        });

    };

    PUBLIC.applyModalBehaviours = function () {

        require(['sequence'], function () {

            var modal = {},
                activeLayer = false,
                modalContainer = $('#modal'),
                overlayContainer = $('#heroes-overlay'),
                closeButton = overlayContainer.find('.close:first');

            modal = {

                init : function () {

                    //Bind events to our heroes anchors
                    modal.loadSequence();

                },

                loadSequence : function () {

                    var options = {
                        autoPlay : false,
                        nextButton : overlayContainer.find('.next:first'),
                        prevButton : overlayContainer.find('.previous:first'),
                        transitionThreshold : 200,
                        preloader : true,
                        reverseAnimationsWhenNavigatingBackwards : false,
                        preventDelayWhenReversingAnimations : true
                    };

                    window.sequence = overlayContainer.sequence(options).data("sequence");

                    modal.bindEvents();

                },

                bindEvents : function () {

                    var heroesContainer = $('#heroes').find('.heroes-list:first');

                    heroesContainer.find('li').on('click', 'a', function (evt) {

                        var speakerIndex = $(this).attr('data-layer');

                        evt.preventDefault();

                        modal.openModal(speakerIndex);

                    });

                    closeButton.on('click', function () {

                        if (activeLayer) {

                            modal.closeModal();

                        }

                    });

                    $(document).keyup(function (evt) {

                        if (evt.keyCode === 27 && activeLayer) {

                            modal.closeModal();

                        }

                    });

                },

                openModal : function (index) {

                    modalContainer.addClass('on');

                    overlayContainer.removeClass('visuallyhidden');

                    window.sequence.goTo(index, 1);

                    activeLayer = true;

                    //Binds an event to close the modal if the user clicks outside it's content
                    modal.bindBodyBehaviours();

                },

                closeModal : function () {

                    if (activeLayer) {

                        //Closes the modal
                        modalContainer.removeClass('on');

                        //Hides the overlay
                        overlayContainer.addClass('visuallyhidden');

                        //Removes the event attached to the body
                        $('body').off('click.modalEvents');

                    }

                },

                bindBodyBehaviours : function () {

                    $('body').on('click.modalEvents', function (evt) {

                        if ($(evt.target).is(modalContainer)) {

                            modal.closeModal();

                        }

                    });

                }

            };

            return modal.init();

        });

    };

    PUBLIC.loadMaps = function () {

        require(['async!http://maps.google.com/maps/api/js?sensor=false'], function () {

            var mapsContainer = document.getElementById("map"),
                mapInstance,
                coordenates,
                marker,
                maps = {},
                options = {};

            maps = {

                configureMap : function () {

                    coordenates = new google.maps.LatLng(-30.022226, -51.16244);

                    options = {
                        zoom : 18,
                        center : coordenates,
                        scrollwheel : false,
                        mapTypeId : google.maps.MapTypeId.SATELLITE,
                        streetViewControl : true
                    };

                    maps.createInstance();

                },

                createInstance : function () {

                    mapInstance = new google.maps.Map(mapsContainer, options);

                    maps.createMarker();

                },

                createMarker : function () {

                    marker = new google.maps.Marker({
                        position : coordenates,
                        map : mapInstance,
                        title : 'Teatro Bourbon Country'
                    });

                    maps.createWindow();

                },

                createWindow : function () {

                    var infoWindow = new google.maps.InfoWindow({
                        content : "<strong>BrazilJS Conf 2013: </strong><br/>Saiba <a target='_blank' href='https://maps.google.com.br/maps?f=q&source=s_q&hl=pt-BR&geocode=&q=Teatro do Bourbon Country, Avenida Túlio de Rose, 80 - Passo da Areia, Porto Alegre - RS, 91340-110&aq=&sll=-30.022226, -51.16244&sspn=0.003954,0.004823&t=h&ie=UTF8&hq=&hnear=Teatro do Bourbon Country, Avenida Túlio de Rose, 80 - Passo da Areia, Porto Alegre - RS, 91340-1100&view=satellite'>como chegar</a> aqui!",
                        maxWidth : 400
                    });

                    infoWindow.open(mapInstance, marker);

                }

            };

            return maps.configureMap();

        });

    };

    PUBLIC.loadSocialAPPS = function () {

        require(['facebook', 'twitter', 'g+']);

    };

    return PUBLIC.init();

});