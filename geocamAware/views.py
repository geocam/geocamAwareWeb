# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import urllib

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from geocamUtil import anyjson as json
from geocamUtil.middleware.SecurityMiddleware import requestIsSecure

from geocamAware import settings

EXPORT_SETTINGS = ['SCRIPT_NAME',
                   'MEDIA_URL',
                   'DATA_URL',
                   'GEOCAM_CORE_GALLERY_THUMB_SIZE',
                   'GEOCAM_CORE_DESC_THUMB_SIZE',
                   'GEOCAM_AWARE_GALLERY_PAGE_COLS',
                   'GEOCAM_AWARE_GALLERY_PAGE_ROWS',
                   'GEOCAM_AWARE_MAP_BACKEND',
                   'GEOCAM_AWARE_USE_MARKER_CLUSTERING',
                   'GEOCAM_AWARE_USE_TRACKING']
JS_MODULES = []

if settings.GEOCAM_AWARE_MAP_BACKEND == 'earth':
    JS_MODULES += [("external/js/geo-pack.js", True),
                   ("external/js/extensions-pack.js", False),
                   ]
elif settings.GEOCAM_AWARE_MAP_BACKEND == 'maps':
    if settings.GEOCAM_AWARE_USE_MARKER_CLUSTERING:
        JS_MODULES += [("external/js/markerclusterer_compiled.js", False),
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
    return json.dumps(exportDict)

def loadScript(url):
    return '<script src="%s" type="text/javascript"></script>' % url

def main(request):
    if request.user.is_authenticated():
        accountWidget = ('<b>%(username)s</b> <a href="%(SCRIPT_NAME)saccounts/logout/">logout</a>'
                         % dict(username=request.user.username,
                                SCRIPT_NAME=settings.SCRIPT_NAME))
    else:
        path = request.get_full_path()
        if not requestIsSecure(request):
            path += '?protocol=http' # redirect back to http after login
        accountWidget = ('<b>guest</b> <a href="%(SCRIPT_NAME)saccounts/login/?next=%(path)s">login</a>'
                         % dict(SCRIPT_NAME=settings.SCRIPT_NAME,
                                path=urllib.quote(path)))

    if settings.GEOCAM_AWARE_DEBUG_JAVASCRIPT:
        loadJsModules = ''.join([loadScript(settings.MEDIA_URL + path)
                                 for path in JS_MODULES])
    else:
        loadJsModules = loadScript(settings.MEDIA_URL + 'geocamAware/js/geocamAwareMin.js')
        
    return render_to_response('main.html',
                              dict(query=request.session.get('q', ''),
                                   viewport=request.session.get('v', ''),
                                   accountWidget=accountWidget,
                                   exportSettings=getExportSettings(),
                                   settings=settings,
                                   loadJsModules=loadJsModules,
                                   navigation_tab=settings.GEOCAM_AWARE_NAVIGATION_TAB),
                              context_instance=RequestContext(request))

def setVars(request):
    for var in ('v', 'q'):
        if var in request.GET:
            request.session[var] = request.GET[var]
    return HttpResponse('ok')
