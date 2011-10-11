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

        var content = [];
        this.layers = {};

        content.push('<form style="margin-top: 20px;">');
        $.each(geocamAware.layerManager.layers,
               function (i, layer) {
                   content.push('<label>'
                                + '<div class="geocamLayerRow">'
                                + '<input'
                                + ' id="geocamAwareLayerCheckbox_' + layer.name + '"'
                                + ' type="checkbox"'
                                + ' name="' + layer.name + '"'
                                + ' value="' + layer.name + '"'
                                + ' style="position:relative; top: -3px; margin-right: 10px;"'
                                + '/>');
                   if (layer.selectable) {
                       content.push('<a href="#"'
                                    + ' id="geocamAwareLayerName_' + layer.name + '"'
                                    + '>' + layer.name + '</a>');
                   } else {
                       content.push(layer.name);
                   }
                   content.push('</div></label>');
               });
        content.push('</form>');
        var text = content.join('');

        $('#' + this.domId).html(text);

        $.each(geocamAware.layerManager.layers,
               function (i, layer) {
                   var checkbox = $('#geocamAwareLayerCheckbox_' + layer.name);

                   if (layer.visibility) {
                       checkbox.attr('checked', 'checked');
                   } else {
                       checkbox.removeAttr('checked');
                   }

                   checkbox.change(function () {
                                       layer.setVisibility(this.checked);
                                   });
                   
                   if (layer.selectable) {
                       $('#geocamAwareLayerName_' + layer.name)
                           .click(function () {
                                      layer.select();
                                      return false;
                                  });
                   }
               });
    }

});

geocamAware.LayerManagerWidget.factory = function (domId) {
    return new geocamAware.LayerManagerWidget(domId);
};
