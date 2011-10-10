// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.SidebarSwitcher = new Class(
{
    Extends: geocamAware.WidgetManager,

    initialize: function (domId) {
        this.domId = domId;

        $('#' + this.domId).html(this.getHtml());

        geocamAware.bindEvent(geocamAware, this, "selectFeature");
        geocamAware.bindEvent(geocamAware, this, "unselectFeature");
        geocamAware.bindEvent(geocamAware, this, "notifyLoading");
        geocamAware.bindEvent(geocamAware, this, "updateFeatures");
        geocamAware.bindEvent(geocamAware, this, "setToFeatureDetail");
        geocamAware.bindEvent(geocamAware, this, "setToFeatureEdit");
        geocamAware.bindEvent(geocamAware, this, "setToGallery");

        if (geocamAware.settings.GEOCAM_AWARE_USE_LAYER_MANAGER) {
            var that = this;
            $('#' + this.domId + '_layersButton')
                .click(function () {
                           that.setToLayers();
                           return false;
                       });
            this.setToLayers();
        } else {
            this.setToGallery();
        }
    },

    getHtml: function () {
        var html = [];
        if (geocamAware.settings.GEOCAM_AWARE_USE_LAYER_MANAGER) {
            html.push('<div style="margin-top: 5px; margin-left: 5px; margin-bottom: 5px;"><a href="#" id="'
                      + this.domId
                      + '_layersButton">Layers</a></div>');
        }
        html.push('<div id="' + this.domId + '_content">Loading...</div>');
        return html.join('');
    },

    handleViewSelect: function (node) {
        var selected = $(node).val();
        var methodName = 'setTo' + selected;
        this[methodName]();
        return false;
    },

    selectFeature: function (feature) {
        this.setToFeatureDetail(feature);
    },
    
    unselectFeature: function (feature) {
        this.setToGallery();
    },

    notifyLoading: function () {
        this.setToGallery();
    },

    updateFeatures: function (newFeatures, diff) {
        // todo: if in detail view and selected feature is no longer
        // present, switch to gallery view
    },
    
    /**********************************************************************
     * state and helper functions
     **********************************************************************/

    domId: null,

    getDefaultFeature: function () {
        return geocamAware.featuresByUuidG[geocamAware.selectedFeatureUuid];
    },

    setToGallery: function () {
        this.setWidgetForDomId(this.domId + '_content',
                               geocamAware.GalleryWidget.factory);
    },

    setToLayers: function () {
        this.setWidgetForDomId(this.domId + '_content',
                               geocamAware.LayerManagerWidget.factory);
    },

    setToFeatureDetail: function (feature) {
        if (feature == undefined) {
            feature = this.getDefaultFeature();
        }
        this.setWidgetForDomId(this.domId + '_content',
                               geocamAware.FeatureDetailWidget.factory,
                               [feature.uuid]);
    },

    setToFeatureEdit: function (feature) {
        if (feature == undefined) {
            feature = this.getDefaultFeature();
        }
        this.setWidgetForDomId(this.domId + '_content',
                               geocamAware.FeatureEditWidget.factory,
                               [feature.uuid]);
    }

});

geocamAware.SidebarSwitcher.factory = function (domId) {
    return new geocamAware.SidebarSwitcher(domId);
};
