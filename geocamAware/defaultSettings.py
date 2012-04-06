# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

GEOCAM_AWARE_APP_NAME = 'geocamAware'

GEOCAM_AWARE_GALLERY_PAGE_COLS = 3
GEOCAM_AWARE_GALLERY_PAGE_ROWS = 3

# GEOCAM_AWARE_MAP_BACKEND possible values: 'earth', 'maps', 'none'.
GEOCAM_AWARE_MAP_BACKEND = 'maps'

# enable/disable clustering of markers (if supported by the current GEOCAM_AWARE_MAP_BACKEND)
GEOCAM_AWARE_USE_MARKER_CLUSTERING = False

# enable/disable tracks display from geocamTrack (bit of a hack, this should be user controlled)
GEOCAM_AWARE_USE_TRACKING = False

# minifying and combining javascript files improves page load times
# but you may want to turn it off for debugging
MINIFY_JAVASCRIPT = True

# this can be used to specify a string in your template to indicate a navigation tab.  It is not required.
GEOCAM_AWARE_NAVIGATION_TAB = 'mytabname'

# you can turn on the experimental layer manager feature
GEOCAM_AWARE_USE_LAYER_MANAGER = False

# map lat/lon bounds to use when there are no features
GEOCAM_AWARE_DEFAULT_MAP_BOUNDS = {
    "west": -130,
    "south": 22,
    "east": -59,
    "north": 52,
}

GEOCAM_AWARE_LAYERS = [
    {
        "name": "Photos",
        "type": "geocamLens",
        "visibility": True
    },
    {
        "name": "Tracks",
        "type": "kml",
        "visibility": True,
        "url": "geocamTrack/tracks.kml"
    },
    {
        "name": "Messages",
        "type": "kml",
        "visibility": True,
        "url": "geocamTalk/messages.kml"
    },
    {
        "name": "Notes",
        "type": "kml",
        "visibility": True,
        "url": "geocamMemo/messages.kml"
    },
]

# for multiple thumbnails in sidebar gallery
GEOCAM_AWARE_GALLERY_THUMB_SIZE = [160, 120]
# for single thumbnail in sidebar gallery
GEOCAM_AWARE_DESC_THUMB_SIZE = [480, 360]
