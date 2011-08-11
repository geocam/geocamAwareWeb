# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import urllib

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from geocamUtil.auth import get_account_widget
from geocamUtil import anyjson as json
from geocamUtil.middleware.SecurityMiddleware import requestIsSecure

from geocamAware import settings

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


def setVars(request):
    for var in ('v', 'q'):
        if var in request.GET:
            request.session[var] = request.GET[var]
    return HttpResponse('ok')


import logging
logger = logging.getLogger(__name__)

def render_aware_view(request, view, additional_vars=None):
    
    q = request.GET.get('q', None)    
    if q == None:
        q = request.session.get('q', '')
    
    data = dict(
        query=q,
        viewport=request.session.get('v', ''),
        account_widget=get_account_widget(request),
        exportSettings=getExportSettings(),
        settings=settings,
    )
    
    if additional_vars != None:
        data = dict(data.items() + additional_vars.items())
        
    return render_to_response(  view,
                                data,
                                context_instance=RequestContext(request))


def map(request):
    
    menu_items = (
        '<div onclick="go_to_current_location();"><a href="javascript:void()">Go to My Location</a></div>',
        '<div onclick="show_address_search_box();"><a href="javascript:void();">Go to Address</a></div>',
        '<div onclick="drop_pin();"><a href="javascript:void();">Drop Pin</a></div>'
    )
    
    menu_items = " ".join(menu_items)
    
    return render_aware_view(request, 'map_view.html', dict(pop_up_menu_items=menu_items))


def list(request):
    """
    '<div onclick="go_to_current_location();"><a href="javascript:void()">Get Images Nearby</a></div>',
    '<div onclick="show_address_search_box();"><a href="javascript:void();">Get Images Near Address</a></div>',
    """
    
    menu_items = (
        '<div onclick="show_query_search_box();"><a href="javascript:void()">Search For Images</a></div>',
    )
    
    menu_items = " ".join(menu_items)
    
    return render_aware_view(request, 'list_view.html', dict(pop_up_menu_items=menu_items))   


def gallery(request):
    """
    '<div onclick="go_to_current_location();"><a href="javascript:void()">Get Images Nearby</a></div>',
    '<div onclick="show_address_search_box();"><a href="javascript:void();">Get Images Near Address</a></div>',
    """
    
    menu_items = (
        '<div onclick="show_query_search_box();"><a href="javascript:void()">Search For Images</a></div>',
    )
    
    menu_items = " ".join(menu_items)
    
    return render_aware_view(request, 'gallery_view.html', dict(pop_up_menu_items=menu_items))


