// ==UserScript==
// @author         JoKer96
// @name           IITC Plugin: Uniques-Highlighter
// @category       Highlighter
// @version        0.3
// @description    Highlights Portals for various reasons.
// @namespace      https://www.joker96.de/ingress-iitc/
// @match          https://intel.ingress.com/*
// @match          https://intel-x.ingress.com/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=ingress.com
// @grant          none
// ==/UserScript==

/*
    TODO:
     - Add configuration presets, ig "JK-Style" and "Default Intel", maybe a 3rd or so...
*/

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function') window.plugin = function() {};

    // Creating own namespace for plugin
    window.plugin.uniquesHighlighter = function() {};

    // Setting up self variables
    let self = window.plugin.uniquesHighlighter;
    self.id = 'uniquesHighlighter';
    self.title = "Uniques-Highlighter";
    self.prefix = "[Uniques-Highlighter] ";
    self.author = "JoKer96";
    self.version = "0.3";
    self.changelog = [
        {
            version: "0.3.1",
            changes:['Fixed an issue causing the configuration not showing on iOS devices.','Fixed another issue causing the changelog not showing up.'],
        },{
            version: "0.3",
            changes: ['Addet configuration menu to set the displayed results to be inverted, as well as storing the configured settings localy.','Also addet some menus to read some information about the plugin.'],
        },{
            version: "0.2",
            changes: ['Addet option to toggle each type of unique as a highligter to choose from.','Fixed the issue, that color disappeared after selecting a portal.'],
        },{
            version: "0.1",
            changes: ['First release'],
        },
    ];
    self.namespace = 'window.plugin.' + self.id + '.';
    self.pluginname = 'plugin-' + self.id;

    // Highlighter Names
    self.highlighter = {};
    self.highlighter.capture = "Unique Captures";
    self.highlighter.scout = "Unique Scout-Controlled";
    self.highlighter.visit = "Unique Visits";

    // Localstorage for settings
    self.localstoragesettings = self.pluginname + '-settings';

    // enable/disable debugging
    self.debug = true;

    // Functional plugin variables
    const HISTORY_TYPE = {
	    CAPTURE: "capture",
	    SCOUT: "scout",
	    VISIT: "visit",
    }
    const MARKER_TYPE = {
	    INFILL: "infill",
	    RING: "ring",
    }

    // Configuration variables
    self.settings = {};

    self.settings.color = {};
    self.settings.color.captured = "#000000";
    self.settings.color.scout = "#000000";
    self.settings.color.visit = "#000000";

    self.settings.invert = {};
    self.settings.invert.captured = false;
    self.settings.invert.scout = false;
    self.settings.invert.visit = false;

    self.settings.style = {};
    self.settings.style.captured = MARKER_TYPE.INFILL;
    self.settings.style.scout = MARKER_TYPE.INFILL;
    self.settings.style.visit = MARKER_TYPE.INFILL;

    self.restoresettings = function() {
        if (typeof localStorage[self.localstoragesettings] != 'string' || localStorage[self.localstoragesettings] == '') return;
        try {
            var settings = JSON.parse(localStorage[self.localstoragesettings]);
            if (typeof settings === 'object' && settings instanceof Object && !(settings instanceof Array)) { // expect an object
                for (const i in self.settings) {
                    if (i in settings && typeof settings[i] === typeof self.settings[i]) { // only accept settings from default template of same type
                        if (typeof self.settings[i] === 'object' && self.settings[i] instanceof Object && !(self.settings[i] instanceof Array)) { // 1 sublevel is supported
                            for (const a in self.settings[i]) {
                                if (a in settings[i] && typeof settings[i][a] === typeof self.settings[i][a]) {
                                    self.settings[i][a] = settings[i][a];
                                }
                            }
                        } else {
                            self.settings[i] = settings[i];
                        }
                    }
                }
            }
        } catch(e) {
            return false;
        }
    };

    self.storesettings = function() {
        localStorage[self.localstoragesettings] = JSON.stringify(self.settings);
    };

    // Filtering portals to highlight by captured
    self.highlightUniqueCaptures = function(data) {
        var portal = data.portal;
        var history = portal.options.data.history;

        // Filtering portals without history
        if(history == undefined) {
            return;
        }

        if(history.captured == true && self.settings.invert.captured == false) {
            self.highlightPortal(portal, HISTORY_TYPE.CAPTURE);
        } else if(history.captured == false && self.settings.invert.captured == true) {
            self.highlightPortal(portal, HISTORY_TYPE.CAPTURE);
        }
    }

    // Filtering portals to highlight by scout controlls
    self.highlightUniqueScout= function(data) {
        var portal = data.portal;
        var history = portal.options.data.history;

        // Filtering portals without history
        if(history == undefined) {
            return;
        }

        if(history.scoutControlled == true && self.settings.invert.scout == false) {
            self.highlightPortal(portal, HISTORY_TYPE.SCOUT);
        } else if(history.scoutControlled == false && self.settings.invert.scout == true) {
            self.highlightPortal(portal, HISTORY_TYPE.SCOUT);
        }
    }

    // Filtering portals to highlight by visits
    self.highlightUniqueVisits = function(data) {
        var portal = data.portal;
        var history = portal.options.data.history;

        // Filtering portals without history
        if(history == undefined) {
            return;
        }

        if(history.visited == true && self.settings.invert.visit == false) {
            self.highlightPortal(portal, HISTORY_TYPE.VISIT);
        } else if(history.visited == false && self.settings.invert.visit == true) {
            self.highlightPortal(portal, HISTORY_TYPE.VISIT);
        }
    }

    // Highlight portal, given in the arguments
    self.highlightPortal = function(portal, type) {
        var color;
        switch (type) {
            case HISTORY_TYPE.CAPTURE:
                color = self.settings.color.captured;
                break;
            case HISTORY_TYPE.SCOUT:
                color = self.settings.color.scout;
                break;
            case HISTORY_TYPE.VISIT:
                color = self.settings.color.visit;
                break;
        }

        var style;
        switch (type) {
            case HISTORY_TYPE.CAPTURE:
                style = self.settings.style.captured;
                break;
            case HISTORY_TYPE.SCOUT:
                style = self.settings.style.scout;
                break;
            case HISTORY_TYPE.VISIT:
                style = self.settings.style.visit;
                break;
        }

        var params;
        if(style == MARKER_TYPE.INFILL) {
            params = {fillColor: 'rgb(0,0,0)', fillOpacity: 1.0};
            portal.setStyle(params);
        } else {
            self.debug("Marker-Type is something different that 'INFILL'. This is not suppose to happen");
            return;
        }
    }

    self.toggleInvert = function(type) {
        var historyType;

        switch (type) {
            case "capture":
                historyType = HISTORY_TYPE.CAPTURE;
                break;
            case "scout":
                historyType = HISTORY_TYPE.SCOUT;
                break;
            case "visit":
                historyType = HISTORY_TYPE.VISIT;
                break;
        }

        switch (historyType) {
            case HISTORY_TYPE.CAPTURE:
                if(self.settings.invert.captured) {
                    self.settings.invert.captured = false;
                } else {
                    self.settings.invert.captured = true;
                }
                if(window._current_highlighter == self.highlighter.capture) {
                    window.changePortalHighlights(self.highlighter.capture);
                }
                break;
            case HISTORY_TYPE.SCOUT:
                if(self.settings.invert.scout) {
                    self.settings.invert.scout = false;
                } else {
                    self.settings.invert.scout = true;
                }
                if(window._current_highlighter == self.highlighter.scout) {
                    window.changePortalHighlights(self.highlighter.scout);
                }
                break;
            case HISTORY_TYPE.VISIT:
                if(self.settings.invert.visit) {
                    self.settings.invert.visit = false;
                } else {
                    self.settings.invert.visit = true;
                }
                if(window._current_highlighter == self.highlighter.visit) {
                    window.changePortalHighlights(self.highlighter.visit);
                }
                break;
        }
        self.storesettings();
    }

    self.displayMenu = function() {
        var capturedChecked = "";
        var scoutChecked = "";
        var visitChecked = "";

        if(self.settings.invert.captured) {
            capturedChecked = " checked";
        }
        if(self.settings.invert.scout) {
            scoutChecked = " checked";
        }
        if(self.settings.invert.visit) {
            visitChecked = " checked";
        }

        var html = '<div>' +
                   '<b>Settings</b><br /><br />';
        html +=
                   '<input type="checkbox" onclick="' + self.namespace + 'toggleInvert(\'capture\');" id="invertCaptures"' + capturedChecked + '>' +
                   '<label for="invertCaptures" style="user-select: none">Invert Unique Captures</label><br />';
        html +=
                   '<input type="checkbox" onclick="' + self.namespace + 'toggleInvert(\'scout\');" id="invertScouts"' + scoutChecked + '>' +
                   '<label for="invertScouts" style="user-select: none">Invert Unique Scout Controlled</label><br />';
        html +=
                   '<input type="checkbox" onclick="' + self.namespace + 'toggleInvert(\'visit\');" id="invertVisits"' + visitChecked + '>' +
                   '<label for="invertVisits" style="user-select: none">Invert Unique Visits</label><br />';
        html +=
                   '<br /><span style="font-style: italic; font-size: smaller">' + self.title + ' v' + self.version + ' by ' + self.author + '</span>' +
                   '</div>';

        if (window.useAndroidPanes()) {
            window.show('map'); // hide sidepane
        }

        window.dialog({
            html: html,
            id: self.title + '-dialog',
            dialogClass: 'ui-dialog-' + self.pluginname,
            title: self.title,
            width: 'auto',
        }).dialog('option', 'buttons', {
            'About': function() { self.displayAbout(); },
            'Changelog': function() { self.displayChangelog(); },
            'Close': function() { $(this).dialog('close'); },
        });
    }

    self.displayAbout = function() {
        let html = '<div>' +
            'Thank you for choosing my uniques plugin.<br />' +
            '<br />' +
            'You can visualize your uniques with <b>3 highlighters</b>:<br />' +
            '- Captured<br />' +
            '- Scout Controlled<br />' +
            '- Visited<br />' +
            '<br />' +
            'Select one of the 3 types of unique in the highlighter menu.<br />' +
            'You can <b>invert your uniques</b>.<br />' +
            '<br />' +
            '<span style="font-style: italic; font-size: smaller">' + self.title + ' version ' + self.version + ' by ' + self.author + '</span>' +
            '</div>';

        window.dialog({
            html: html,
            id: self.title + '-dialog',
            dialogClass: 'ui-dialog-' + self.pluginname,
            title: self.title + ' - About',
            width: 'auto',
        }).dialog('option', 'buttons', {
            '< Main menu': function() { self.displayMenu(); },
            'Changelog': function() { self.displayChangelog(); },
            'Close': function() { $(this).dialog('close'); },
        });
    };

    self.displayChangelog = function() {
        let html = '<div>';
        html += '<ul style="list-style: none; padding: 0px;">';
        for (var i = 0; i < self.changelog.length; i++){
            var version = self.changelog[i].version;
            var changes = self.changelog[i].changes;
            html += '<li>' +
                    '<ul style="list-style: none; padding: 0px;">' +
                    '<li>Version: ' + version + '</li>' +
                    '<li>' +
                    '<ul>';
            for(var j = 0; j < changes.length; j++) {
                var entry = changes[j];
                html += '<li>' + entry + '</li>';
            }
            html += '</ul>' +
                    '</li>' +
                    '</ul>' +
                    '</li>' +
                    '<br />';
        }
        html += '</ul>' +
                '<br /><span style="font-style: italic; font-size: smaller">' + self.title + ' v' + self.version + ' by ' + self.author + '</span>' +
                '</div>';
        window.dialog({
            html: html,
            id: self.title + '-dialog',
            dialogClass: 'ui-dialog-' + self.pluginname,
            title: self.title + ' - Changelog',
            width: 'auto',
        }).dialog('option', 'buttons', {
            '< Main menu': function() { self.displayMenu(); },
            'About': function() { self.displayAbout(); },
            'Close': function() { $(this).dialog('close'); },
        });
    }

    // Debug messages, easy to toggle
    self.debug = function(message) {
        if(self.debug) {
            console.debug(self.prefix + message);
        }
    }

    // Setup plugin, adding hooks and running initial things
    var setup = function() {
        self.restoresettings();

        // Adding Highlight selector
        window.addPortalHighlighter(self.highlighter.capture, self.highlightUniqueCaptures);
        window.addPortalHighlighter(self.highlighter.scout, self.highlightUniqueScout);
        window.addPortalHighlighter(self.highlighter.visit, self.highlightUniqueVisits);

        // Adding configuration menu
        $('#toolbox').append('<a onclick="' + self.namespace + 'displayMenu(); return false;" href="#">' + self.title + '</a>');

        $('head').append('<style>' +
                         '.' + self.pluginname + ' a.dialogbutton { display:block; color:#ffce00; border:1px solid #ffce00; padding:3px 0; margin:10px auto; width:80%; min-width: 232px; text-align:center; background:rgba(8,48,78,.9); }' +
                         '</style>');

        // Say something nice
        self.debug("Plugin loadet");
    }

    //add the script info data to the function as a property
    setup.info = plugin_info;
    if (typeof changelog !== 'undefined') setup.info.changelog = self.PLUGIN_CHANGELOG;
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end





// ========================= Inject code into site context =========================
var info = {};
// GM_info is defined by the assorted monkey-themed browser extensions
// and holds information parsed from the script header.
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}
// Create a script element to hold our content script
var script = document.createElement('script');
// Create a text node and our IIFE inside of it
var textContent = document.createTextNode('('+ wrapper +')('+ JSON.stringify(info) +')');
// Add some content to the script element
script.appendChild(textContent);
// Finally, inject it... wherever.
(document.body || document.head || document.documentElement).appendChild(script);
// =============================================================================
