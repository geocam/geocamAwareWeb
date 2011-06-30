# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import urllib

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from geocamUtil.auth import getAccountWidget
from geocamUtil import anyjson as json
from geocamUtil.middleware.SecurityMiddleware import requestIsSecure

from geocamAware import settings

selectedApp = settings.GEOCAM_AWARE_APP_NAME

def getExportSettings():
    exportedVars = ['SCRIPT_NAME',
                    'MEDIA_URL',
                    'DATA_URL',
                    'GEOCAM_CORE_GALLERY_THUMB_SIZE',
                    'GEOCAM_CORE_DESC_THUMB_SIZE',
                    'GEOCAM_AWARE_GALLERY_PAGE_COLS',
                    'GEOCAM_AWARE_GALLERY_PAGE_ROWS',
                    'GEOCAM_AWARE_MAP_BACKEND',
                    'GEOCAM_AWARE_USE_MARKER_CLUSTERING',
                    'GEOCAM_AWARE_USE_TRACKING']
    exportDict = dict(((f, getattr(settings, f))
                       for f in exportedVars))
    return json.dumps(exportDict)

def main(request):
    accountWidget = getAccountWidget(request)
    return render_to_response('main1.html',
                                dict(
                                    query=request.session.get('q', ''),
                                    viewport=request.session.get('v', ''),
                                    accountWidget=accountWidget,
                                    exportSettings=getExportSettings(),
                                    selectedApp=settings.GEOCAM_AWARE_APP_NAME,
                                    ),
                                context_instance=RequestContext(request)
                            )
                              
def setVars(request):
    for var in ('v', 'q'):
        if var in request.GET:
            request.session[var] = request.GET[var]
    return HttpResponse('ok')