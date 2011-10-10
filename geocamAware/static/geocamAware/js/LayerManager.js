// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.LayerManager = new Class(
{
    initialize: function () {
        this.layers = [];
        this.layerLookup = {};
        var that = this;

        $.each(geocamAware.settings.GEOCAM_AWARE_LAYERS,
               function (i, layerOpts) {
                   var factory = geocamAware.layerTypeRegistry[layerOpts.type];
                   var layer = factory(layerOpts);
                   that.layers.push(layer);
                   that.layerLookup[layerOpts.name] = layer;
               });
    }
});
