// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.Layer = new Class(
{
    name: null,

    type: null,

    visibility: false,

    // set to true if this layer has a sidebar widget
    selectable: false,

    initialize: function(opts) {
        this.name = opts.name;
        this.type = opts.type;
    },

    show: function() {
        // show the layer -- override in subclass
    },

    hide: function() {
        // hide the layer -- override in subclass
    },

    select: function() {
        // switch sidebar to the widget for this layer -- override in subclass
    },

    setVisibility: function(newVisibility) {
        if (this.visibility != newVisibility) {
            if (newVisibility) {
                this.show();
            } else {
                this.hide();
            }
            this.visibility = newVisibility;
        }
    }

});

geocamAware.layerTypeRegistry = {};
