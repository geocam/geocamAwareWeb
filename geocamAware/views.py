# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from geocamUtil import anyjson as json
from geocamUtil.auth import getAccountWidget

from geocamAware import settings

EXPORT_SETTINGS = ['SCRIPT_NAME',
                   'STATIC_URL',
                   'DATA_URL',
                   'GEOCAM_AWARE_GALLERY_THUMB_SIZE',
                   'GEOCAM_AWARE_DESC_THUMB_SIZE',
                   'GEOCAM_AWARE_GALLERY_PAGE_COLS',
                   'GEOCAM_AWARE_GALLERY_PAGE_ROWS',
                   'GEOCAM_AWARE_MAP_BACKEND',
                   'GEOCAM_AWARE_USE_MARKER_CLUSTERING',
                   'GEOCAM_AWARE_USE_TRACKING',
                   'GEOCAM_AWARE_USE_LAYER_MANAGER',
                   'GEOCAM_AWARE_DEFAULT_MAP_BOUNDS',
                   'GEOCAM_AWARE_LAYERS']
JS_MODULES = []

if settings.GEOCAM_AWARE_MAP_BACKEND == 'earth':
    JS_MODULES += [("external/js/geo-pack.js", True),
                   ("external/js/extensions-pack.js", False),
                   ]
elif settings.GEOCAM_AWARE_MAP_BACKEND == 'maps':
    if settings.GEOCAM_AWARE_USE_MARKER_CLUSTERING:
        JS_MODULES += [("external/js/markerclusterer.js", True),
                       ]

JS_MODULES += [
    ("external/js/jquery.min.js", True),
    ("external/js/mootools-classonly.js", True),
    ("external/js/jquery.form.js", True),
    ("external/js/timeUtils.js", True),
    ("geocamAware/js/geocamAware.js", True),
    ("geocamAware/js/Widget.js", True),
    ("geocamAware/js/WidgetManager.js", True),
    ("geocamAware/js/MapViewer.js", True),
    ("geocamAware/js/StubMapViewer.js", True),
    ("geocamAware/js/MapsApiMapViewer.js", True),
    ("geocamAware/js/EarthApiMapViewer.js", True),
    ("geocamAware/js/GalleryWidget.js", True),
    ("geocamAware/js/SidebarSwitcher.js", True),
    ("geocamAware/js/FeatureDetailWidget.js", True),
    ("geocamAware/js/FeatureEditWidget.js", True),
    ("geocamAware/js/Layer.js", True),
    ("geocamAware/js/KmlLayer.js", True),
    ("geocamAware/js/GeoCamLensLayer.js", True),
    ("geocamAware/js/LayerManager.js", True),
    ("geocamAware/js/LayerManagerWidget.js", True),
    ("geocamAware/js/ajaxForm.js", True),
    ("geocamAware/js/Feature.js", True),
    ("geocamAware/js/PointFeature.js", True),
    ("geocamAware/js/ExtentFeature.js", True),
    ("geocamAware/js/Track.js", True),
    ("geocamAware/js/Image.js", True),
]


def getExportSettings():
    exportDict = dict(((f, getattr(settings, f))
                       for f in EXPORT_SETTINGS))
    return json.dumps(exportDict, indent=4, sort_keys=True)


def loadScript(url):
    return '<script src="%s" type="text/javascript"></script>' % url


def getLoadJavascriptHtml():
    if settings.MINIFY_JAVASCRIPT:
        return loadScript(settings.STATIC_URL + 'geocamAware/js/geocamAwareMin.js')
    else:
        return '\n'.join([loadScript(settings.STATIC_URL + path)
                          for path, _doMinify in JS_MODULES])


def main(request):
    return render_to_response('main.html',
                              dict(query=request.session.get('q', ''),
                                   viewport=request.session.get('v', ''),
                                   accountWidget=getAccountWidget(request),
                                   exportSettings=getExportSettings(),
                                   settings=settings,
                                   loadJsModules=getLoadJavascriptHtml(),
                                   navigation_tab=settings.GEOCAM_AWARE_NAVIGATION_TAB),
                              context_instance=RequestContext(request))


def setVars(request):
    for var in ('v', 'q'):
        if var in request.GET:
            request.session[var] = request.GET[var]
    return HttpResponse('ok')
