import os

application = defines.get('app', 'out/SpotPlot-darwin-arm64/SpotPlot.app')
appname = os.path.basename(application)

files = [application]
symlinks = {'Applications': '/Applications'}
icon_locations = {
    appname: (130, 150),
    'Applications': (380, 150),
}

background = 'builtin-arrow'
show_status_bar = False
show_tab_view = False
show_toolbar = False
show_pathbar = False
show_sidebar = False
sidebar_width = 180
window_rect = ((200, 200), (540, 380))
default_view = 'icon-view'
show_icon_preview = False
icon_size = 100.0
text_size = 12.0

license = {
    'default-language': 'en_US',
    'licenses': {
        'en_US': 'LICENSE.rtf',
    },
    # No 'buttons' entry: dmgbuild's built-in English set is Apple's standard wording
    # (Agree / Disagree / Print / Save and the "press Agree to install" message).
    # If you ever customize it, it must be a 6-item tuple, not a dict.
}