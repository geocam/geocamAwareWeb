// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.GeoCamLensLayer = new Class(
{
    Extends: geocamAware.Layer,

    selectable: true,

    initialize: function (opts) {
        this.parent(opts);
        this.setVisibility(opts.visibility);
    },

    show: function () {
        geocamAware.mapG.showFeatures();
    },

    hide: function () {
        geocamAware.mapG.hideFeatures();
    },

    select: function () {
        geocamAware.setToGallery();
    }

});


geocamAware.layerTypeRegistry['geocamLens'] = function (opts) {
    return new geocamAware.GeoCamLensLayer(opts);
};
