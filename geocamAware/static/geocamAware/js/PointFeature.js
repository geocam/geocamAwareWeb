// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.PointFeature = new Class(
{
    Extends: geocamAware.Feature,

    getMaxTime: function () {
        return this.timestamp;
    },

    getKml: function () {
        var iconUrl = geocamAware.getHostUrl() + this.getIconMapUrl();
        return ''
	    + '<Placemark id="' + this.uuid + '">\n'
	    + '  <Style>\n'
	    + '    <IconStyle>\n'
	    + '      <Icon>\n'
	    + '        <href>' + iconUrl + '</href>\n'
	    + '      </Icon>\n'
	    + '      <heading>' + this.yaw + '</heading>\n'
	    + '    </IconStyle>\n'
	    + '  </Style>\n'
	    + '  <Point>\n'
	    + '    <coordinates>' + this.longitude + ',' + this.latitude + '</coordinates>\n'
	    + '  </Point>\n'
	    + '</Placemark>\n';
    },

    getCaptionLatLon: function () {
        var ll = ''
            + '  <tr>\n'
            + '    <td class="captionHeader">lat, lon</td>\n';
        if (geocamAware.nullOrUndefined(this.latitude)) {
            ll += '    <td>(unknown)</td>\n';
        } else {
            ll += '    <td>' + this.latitude.toFixed(6) + ', ' + this.longitude.toFixed(6) + '</td>\n';
        }
        ll += ''
            + '  </tr>\n';
        
        return ll;
    },

    getCaptionAltitude: function () {
        var alt = ''
            + '  <tr>\n'
            + '    <td class="captionHeader">altitude</td>\n';
        if (geocamAware.nullOrUndefined(this.altitude)) {
            alt += '    <td>(unknown)</td>\n';
        } else {
            var ref;
            if (geocamAware.nullOrUndefined(this.altitudeRef)) {
                ref = 'unknown';
            } else {
                ref = this.altitudeRef;
            }
            alt += '    <td>' + this.altitude + ' meters (ref. ' + ref + ')&nbsp;&nbsp;</td>\n';
        }
        alt += '  </tr>\n';
        
        return alt;
    }

});

