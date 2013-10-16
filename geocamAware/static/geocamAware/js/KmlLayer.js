// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.KmlLayer = new Class(
{
    Extends: geocamAware.Layer,

    initialize: function(opts) {
        this.parent(opts);
        this.url = geocamAware.qualifyUrl(geocamAware.settings.SCRIPT_NAME + opts.url);
        geocamAware.mapG.initKml(this.name, this.url);
        this.setVisibility(opts.visibility);
    },

    show: function() {
        geocamAware.mapG.showKml(this.name);
    },

    hide: function() {
        geocamAware.mapG.hideKml(this.name);
    }

});

geocamAware.layerTypeRegistry['kml'] = function(opts) {
    return new geocamAware.KmlLayer(opts);
};
