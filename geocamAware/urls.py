# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

from django.conf.urls.defaults import patterns

from geocamAware import views

urlpatterns = patterns(
    '',

    # main
    (r'^setVars(?:\?[^/]*)?$', views.setVars, {'readOnly': True}, "geocamAware_setVars"),
    (r'^$', views.main, {'readOnly': True}, "geocamAware_main"),
    (r'^$', views.main, {'readOnly': True}, "home"),  # alternate name

    )
