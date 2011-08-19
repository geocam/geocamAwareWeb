# __BEGIN_LICENSE__
# Copyright (C) 2008-2010 United States Government as represented by
# the Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
# __END_LICENSE__

import logging
import os
from glob import glob
import tempfile

from django.core.management.base import NoArgsCommand

from geocamUtil.Builder import Builder
from geocamUtil.icons import svg, rotate
from geocamUtil.Installer import Installer
from geocamUtil.minifyJs import minifyJs

from geocamAware import settings
from geocamAware.views import JS_MODULES

class Command(NoArgsCommand):
    help = 'Prep geocamAware app'
    
    def handle_noargs(self, **options):
        up = os.path.dirname
        appDir = up(up(up(os.path.abspath(__file__))))
        builder = Builder()

        # minify javascript files into geocamAwareMin.js
        srcDir = '%s/static/' % appDir
        srcPairs = [(srcDir + suffix, doMinify)
                    for suffix, doMinify in JS_MODULES]
        minifyJs(builder,
                 '%s/build/media/geocamAware/js/geocamAwareMin.js' % appDir,
                 srcPairs)
        
        # link static stuff into build/media
        inst = Installer(builder)
        inst.installRecurseGlob('%s/static/*' % appDir,
                                '%s/build/media' % appDir)

