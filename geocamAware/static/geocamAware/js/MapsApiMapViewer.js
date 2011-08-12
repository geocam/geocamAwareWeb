// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

var NIGHTTIME = 'nightvision';

geocamAware.MapsApiMapViewer = new Class(
{
    Extends: geocamAware.MapViewer,

    /**********************************************************************
     * variables
     **********************************************************************/
    
    isReady: false,
    
    gmap: null,
    
    geocoder:null,
    
    mainListenerInitialized: false,
    
    balloon: null,
    
    boundsAreSet: false,
    
    /**********************************************************************
     * implement MapViewer interface
     **********************************************************************/
    
    initialize: function(domId) {
        
        // Create the standard Google Map
        var myOptions = {
            mapTypeControlOptions: {
                mapTypeIds: [
                    google.maps.MapTypeId.HYBRID,
                    NIGHTTIME
                ]
            }
        };
        
        this.gmap = new google.maps.Map(document.getElementById(domId), myOptions);
        
        // Specify the styling for the nighttime map
        var stylez = [
            {
                featureType:"water",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" },
                    { lightness:"-50" }
                ]
            },
            {
                featureType:"administrative",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" },
                    { lightness:"-100" }
                ]
            },
            {
                featureType:"landscape",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" },
                    { lightness:"-100" }
                ]
            },
            {
                featureType:"poi",
                elementType:"geometry",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" },
                    { lightness:"-100" }
                ]
            },
            {
                featureType:"poi",
                elementType:"labels",
                stylers: [
                    { visibility:"off" },
                ]
            },
            {
                featureType:"road.arterial",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" }
                ]
            },
            {
                featureType:"road.highway",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" }
                ]
            },
            {
                featureType:"road.local",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" }
                ]
            },
            {
                featureType:"transit",
                elementType:"all",
                stylers: [
                    { hue:"#000000" },
                    { saturation:"100" }
                ]
            }
        ];
        
        // Create the actual Styled Map
        var nightVisionMap = new google.maps.StyledMapType(stylez, { name:"Night Vision" });
        this.gmap.mapTypes.set(NIGHTTIME, nightVisionMap);
        
        // Check to see what mode we're in, then assign the proper map type
        if($('body').hasClass('daytime')) {
            this.gmap.setMapTypeId(google.maps.MapTypeId.HYBRID);
        }
        else {
            this.gmap.setMapTypeId(NIGHTTIME);
        }
        
        if (geocamAware.viewportG != "") {
            this.setViewport(geocamAware.viewportG);
            this.boundsAreSet = true;
        }

        if (geocamAware.settings.GEOCAM_AWARE_USE_MARKER_CLUSTERING) {
            this.markerClusterer = new MarkerClusterer(this.gmap, [], { gridSize: 25 });
        }

        geocamAware.bindEvent(geocamAware, this, "highlightFeature");
        geocamAware.bindEvent(geocamAware, this, "unhighlightFeature");
        geocamAware.bindEvent(geocamAware, this, "selectFeature");
        geocamAware.bindEvent(geocamAware, this, "updateFeatures");

        this.geocoder = new google.maps.Geocoder();

        this.isReady = true;
        
        geocamAware.setViewIfReady();
    },

    updateFeatures: function (newFeatures, diff) {
        this.setListeners();

        if (diff.featuresToDelete.length > 0 || diff.featuresToAdd.length > 0) {
            if (geocamAware.settings.GEOCAM_AWARE_USE_MARKER_CLUSTERING) {
                // the MarkerClusterer removeMarker() operation is very slow,
                // so we're better off clearing the markers and then adding them
                // all back
                var self = this;
                this.markerClusterer.clearMarkers();
                var markersToAdd = [];
                $.each(newFeatures,
                       function (i, feature) {
                           self.initializeMarkers(feature);
                           markersToAdd.push(feature.mapObject.normal);
                       });
                this.markerClusterer.addMarkers(markersToAdd);
            } else {
                var self = this;
                $.each(diff.featuresToDelete,
                       function (i, feature) {
                           self.removeFeatureFromMap(feature);
                       });
                
                if (diff.featuresToAdd.length > 0) {
                    $.each(diff.featuresToAdd,
                           function (i, feature) {
                               self.addFeature(feature);
                           });
                }
            }
            
            if (!this.boundsAreSet) {
                this.zoomToFit();
            }
            // used to call geocamAware.setGalleryToVisibleSubsetOf(geocamAware.featuresG)
            // here, but geocamAware.handleMapViewChange() gives the map backend
            // some time to adjust after the zoomToFit() call
            geocamAware.handleMapViewChange();
        }
    },
    
    zoomToFit: function () {
        this.gmap.fitBounds(this.getMarkerBounds());
        this.boundsAreSet = true;
    },
    
    getViewport: function () {
        var c = this.gmap.getCenter();
        return c.lat() + ',' + c.lng() + ',' + this.gmap.getZoom();
    },
    
    setViewport: function (view) {
        var v = view.split(',');
        this.gmap.setCenter(new google.maps.LatLng(v[0], v[1]));
        this.gmap.setZoom(parseInt(v[2]));
    },
    
    getFilteredFeatures: function (features) {
        var bounds = this.gmap.getBounds();
        
        var inViewportFeatures = [];
        var inViewportOrNoPositionFeatures = [];
        var self = this;
        $.each(features,
               function (i, feature) {
                   if (self.getFeatureHasPosition(feature)) {
                       if (self.featureIntersectsBounds(feature, bounds)) {
                           inViewportFeatures.push(feature);                           
                           inViewportOrNoPositionFeatures.push(feature);
                       }
                   } else {
                       inViewportOrNoPositionFeatures.push(feature);
                   }
               });
        return {'inViewport': inViewportFeatures,
                'inViewportOrNoPosition': inViewportOrNoPositionFeatures};
    },
    
    highlightFeature: function(feature) {
        if (feature.mapObject != null && feature.mapObject.current != feature.mapObject.highlight) {
            this.addToMap(feature.mapObject.highlight);
            this.removeFromMap(feature.mapObject.normal);
            feature.mapObject.current = feature.mapObject.highlight;
        }
    },
    
    unhighlightFeature: function(feature) {
        if (feature.mapObject != null && feature.mapObject.current != feature.mapObject.normal) {
            this.addToMap(feature.mapObject.normal);
            this.removeFromMap(feature.mapObject.highlight);
            feature.mapObject.current = feature.mapObject.normal;
        }
    },
    
    goToCurrentLocation: function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(location) {
                    var location_str = location.coords.latitude + ',' + location.coords.longitude + ',20';
                
                    geocamAware.mapG.setViewport(location_str);
                
                    geocamAware.mapG.dropPinForAction(
                        location.coords.latitude, 
                        location.coords.longitude, 
                        null
                    );
                }
            );
        }
    },
    
    goToAddress: function(address) {
        this.geocoder.geocode(
            { 'address':address },
            function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    var location_str = results[0].geometry.location.Na + ',' + results[0].geometry.location.Oa + ',15';
                    
                    geocamAware.mapG.setViewport(location_str);
                    
                    geocamAware.mapG.dropPinForAction(
                        results[0].geometry.location.Na,    // Latitude
                        results[0].geometry.location.Oa,    // Longitude
                        address                             // Label
                    );                       
                }
            }
        );
    },
    
    dropPinForAction: function(lat, lng, label) {
        center = new google.maps.LatLng(lat, lng);
        
        this.geocoder.geocode(
            { 'latLng':center },
            function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    if(results[1]) {
                        
                        marker = new google.maps.Marker({
                            position: center,
                            map: geocamAware.mapG.gmap
                        });
                        
                        if(label == null) {
                            label = results[1].formatted_address;
                        }
                        
                        var infowindow = new google.maps.InfoWindow();
                        infowindow.setContent(label);
                        infowindow.open(geocamAware.mapG.gmap, marker);
                        
                        google.maps.event.addListener(marker, 'click', function() {
                              infowindow.open(geocamAware.mapG.gmap, marker);
                        });
                        
                        // Save the marker to the cookie so that we can get them later
                        geocamAware.mapG.rememberMarker(center.lat(), center.lng(), label);
                    }
                }
            }
        );
    },
    
    dropPin: function() {
        var center = this.gmap.getCenter();
        
        this.geocoder.geocode(
            { 'latLng':center },
            function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    if(results[1]) {
                        var infowindow = new google.maps.InfoWindow();
                        
                        marker = new google.maps.Marker({
                            position: center,
                            map: geocamAware.mapG.gmap
                        });
                        
                        infowindow.setContent(results[1].formatted_address);
                        infowindow.open(geocamAware.mapG.gmap, marker);
                    }
                }
            }
        );
        
    },
    
    rememberMarker: function(lat, lng, label) {
        var markers = get_datum('markers');
        
        if(markers == null) {
            markers = [];
        }
        else {
            markers = JSON.parse(markers);
        }
        
        markers.push({
            label:label,
            lat:lat,
            lng:lng
        });
        
        remember_datum('markers', JSON.stringify(markers));
    },
    
    loadMarkers: function() {
        var markers = get_datum('markers');
        
        if(markers != null) {
            markers = JSON.parse(markers);
            
            for(var i = 0; i < markers.length; i++) {
                m = markers[i];
                
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(m.lat, m.lng),
                    map: geocamAware.mapG.gmap
                });
                                
                var infowindow = new google.maps.InfoWindow();
                infowindow.setContent(m.label);
                
                google.maps.event.addListener(marker, 'click', function() {
                      infowindow.open(geocamAware.mapG.gmap, marker);
                });
            }
        }
    },
    
    setMapType: function(type) {
        geocamAware.mapG.gmap.setMapTypeId(type);
    },
    
    setMapTypeToDaytime: function() {
        geocamAware.mapG.setMapType(google.maps.MapTypeId.HYBRID);
    },
    
    setMapTypeToNighttime: function() {
        geocamAware.mapG.setMapType(NIGHTTIME);
    },
    
    // IMPORTANT NOTE: This will align the map with the current view mode! 
    // It will not toggle willy nilly!
    toggleMapType: function() {
        if($('body').hasClass('daytime')) {
            geocamAware.mapG.setMapTypeToDaytime();
        }
        else {
             geocamAware.mapG.setMapTypeToNighttime();
        }
    },
    
    /**********************************************************************
     * helper functions
     **********************************************************************/
    
    getCenter: function() {
        return this.gmap.getCenter();
    },
    
    removeFeatureFromMap: function (feature) {
        var self = this;
        if (feature.mapObject == null) {
            // nothing to remove
        } else if (feature.type == "Track") {
            for (var i=0; i < feature.mapObject.polylines.length; i++) {
                var polyline = feature.mapObject.polylines[i];
                self.removeFromMap(polyline);
            }
        } else {
            self.removeFromMap(feature.mapObject.normal);
            self.removeFromMap(feature.mapObject.highlight);
        }
    },
    
    featureIntersectsBounds: function (feature, bounds) {
        if (feature.latitude != null) {
            
            // Need to make sure that the bounds are set
            if(typeof(bounds) != "undefined") {
                return bounds.contains(new google.maps.LatLng(feature.latitude, feature.longitude));
            }
            else {
                return false;
            }
            
        } else if (feature.minLat != null) {
            var ibounds = new google.maps.LatLngBounds();
            ibounds.extend(new google.maps.LatLng(feature.minLat, feature.minLon));
            ibounds.extend(new google.maps.LatLng(feature.maxLat, feature.maxLon));
            return ibounds.intersects(bounds);
        } else {
            throw 'huh? got feature with no position';
        }
    },
    
    initializeMarkers: function (feature) {
        var self = this;
        
        var iconUrl = feature.getIconMapUrl();
        feature.mapObject = {normal: self.getMarker(feature, false),
                             highlight: self.getMarker(feature, true)};
        
        var markers = [feature.mapObject.normal, feature.mapObject.highlight];
        $.each
            (markers,
             function (j, marker) {
                 google.maps.event.addListener
                 (marker, 'mouseover',
                  function (uuid) {
                      return function () {
                          geocamAware.setHighlightedFeature(uuid);
                      }
                  }(feature.uuid));
                 google.maps.event.addListener
                 (marker, 'mouseout',
                  function (uuid) {
                      return function () {
                          geocamAware.clearHighlightedFeature();
                      }
                  }(feature.uuid));
                 google.maps.event.addListener
                 (marker, 'click',
                  function (uuid) {
                      return function () {
                          geocamAware.setSelectedFeature(uuid);
                      }
                  }(feature.uuid));
             });
    },

    addMarker: function (feature) {
        this.initializeMarkers(feature);
        this.unhighlightFeature(feature); // add to map in 'normal' state
    },
    
    addTrack: function (feature) {
        var self = this;
        var trackLines = feature.geometry.geometry;
        var path = [];
        feature.mapObject = {polylines: []};
        $.each(trackLines,
               function (i, trackLine) {
                   var path = [];
                   $.each(trackLine,
                          function (j, pt) {
                              path.push(new google.maps.LatLng(pt[1], pt[0]));
                          });
                   var polyline = new google.maps.Polyline({map: self.gmap,
                                                            path: path,
                                                            strokeColor: '#FF0000',
                                                            strokeOpacity: 1.0,
                                                            strokeWidth: 4,
                                                            zIndex: 50});
                   feature.mapObject.polylines.push(polyline);
               });
    },
    
    addFeature: function (feature) {
        if (feature.geometry.type == 'Point') {
            if (feature.latitude == null) {
                return; // skip non-geotagged features
            }
            this.addMarker(feature);
        } else if (feature.type == 'Track') {
            if (feature.minLat == null) {
                return; // skip non-geotagged features
            }
            this.addTrack(feature);
        }
    },
    
    getMarker: function (feature, isHighlighted) {
        var scale;
        var zIndex;
        if (isHighlighted) {
            scale = 1.0;
            zIndex = 10000;
        } else {
            scale = 0.7;
            zIndex = 10;
        }
        var position = new google.maps.LatLng(feature.latitude, feature.longitude);
        var iconUrl = feature.getIconMapRotUrl();
        var iconSize = new google.maps.Size(feature.rotatedIcon.size[0], feature.rotatedIcon.size[1]);
        var origin = new google.maps.Point(0, 0);
        var scaledSize = new google.maps.Size(scale*iconSize.width, scale*iconSize.height);
        var anchor = new google.maps.Point(0.5*scaledSize.width, 0.5*scaledSize.height);
        
        var markerImage = new google.maps.MarkerImage(iconUrl, iconSize, origin, anchor, scaledSize);
        
        return new google.maps.Marker({position: position,
                                       icon: markerImage,
                                       zIndex: zIndex
                                      });
    },
    
    addToMap: function (marker) {
        if (geocamAware.settings.GEOCAM_AWARE_USE_MARKER_CLUSTERING) {
            this.markerClusterer.addMarker(marker);
        } else {
            marker.setMap(this.gmap);
        }
    },
    
    removeFromMap: function (marker) {
        if (geocamAware.settings.GEOCAM_AWARE_USE_MARKER_CLUSTERING) {
            this.markerClusterer.removeMarker(marker);
        } else {
            marker.setMap(null);
        }
    },
    
    getMarkerBounds: function () {
        var bounds = new google.maps.LatLngBounds();
        $.each(geocamAware.featuresG,
               function (i, feature) {
                   if (feature.latitude != null) {
                       bounds.extend(new google.maps.LatLng(feature.latitude, feature.longitude));
                   } else if (feature.minLat != null) {
                       var featureBounds = new google.maps.LatLngBounds
                         (new google.maps.LatLng(feature.minLat, feature.minLon),
                          new google.maps.LatLng(feature.maxLat, feature.maxLon));
                       bounds.union(featureBounds);
                   }
               });
        return bounds;
    },
    
    showBalloonForFeature: function (feature) {
        if (this.balloon != null) {
            this.balloon.close();
        }
        this.balloon = new google.maps.InfoWindow({content: feature.getBalloonHtml()});
        this.balloon.open(this.gmap, feature.mapObject.current);
    },

    selectFeature: function(feature) {
        // this.showBalloonForFeature(feature);
    },
    
    setListeners: function () {
        var self = this;
        if (!this.mainListenerInitialized) {
            google.maps.event.addListener(this.gmap, 'bounds_changed', geocamAware.handleMapViewChange);
            this.mainListenerInitialized = true;
        }
    }
});

geocamAware.MapsApiMapViewer.factory = function (domId) {
    return new geocamAware.MapsApiMapViewer(domId);
}
