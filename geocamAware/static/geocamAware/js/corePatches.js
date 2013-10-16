// __BEGIN_LICENSE__
// Copyright (C) 2008-2010 United States Government as represented by
// the Administrator of the National Aeronautics and Space Administration.
// All Rights Reserved.
// __END_LICENSE__

geocamAware.getDirUrl = function(feature) {
    ret = geocamAware.settings.DATA_URL + feature.subtype.toLowerCase() + '/';
    var idStr = feature.localId + 'p';
    for (var i = 0; i < idStr.length; i += 2) {
        if (i > 0) {
            ret += '/';
        }
        ret += idStr.substr(i, 2);
    }
    ret += '/' + feature.version + '/';
    return ret;
};
