// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.LayerManagerWidget = new Class(
{
    Extends: geocamAware.Widget,

    domId: null,

    initialize: function (domId) {
        this.domId = domId;

        var content = '<div style="margin: 10px;">This is the Layers widget</div>';
        $('#' + this.domId).html(content);
    }

});

geocamAware.LayerManagerWidget.factory = function (domId) {
    return new geocamAware.LayerManagerWidget(domId);
}
