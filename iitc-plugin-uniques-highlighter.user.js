// ==UserScript==
// @author         JoKer96
// @name           IITC Plugin: Uniques-Highlighter
// @category       Highlighter
// @version        0.1
// @description    Highlights Portals for various reasons.
// @namespace      https://www.joker96.de/ingress-iitc/
// @match          https://intel.ingress.com/*
// @match          https://intel-x.ingress.com/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=ingress.com
// @grant          none
// ==/UserScript==

/*
    TOFIX:
     - Selecting a Portal removes the infill and it wont come Back, after unselecting it.
     - If the plugin called "Freestyler" is running as well, this Plugin wolt work.

    TODO:
     - Add Layer for easy toggleability
*/

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function') window.plugin = function() {};

    // Usual plugin variables
    var PLUGIN_NAME = "Uniques-Highlighter";
    var PLUGIN_PREFIX = "[Uniques-Highlighter] ";
    var PLUGIN_DEBUG = true;
    var changelog = [
        {
            version: "0.2",
            changes: ['Addet option to toggle each type of unique as a highligter to choose from.','Fixed the issue, that color disappeared after selecting a portal.'],
        },{
            version: "0.1",
            changes: ['First release'],
        },
    ];

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
    var invertCaptured = false;
    var invertScout = false;
    var invertVisit = false;

    var colorCaptured = "#000";
    var colorScout = "#000";
    var colorVisit = "#000";

    var styleCaptured = MARKER_TYPE.INFILL;
    var styleScout = MARKER_TYPE.INFILL;
    var styleVisit = MARKER_TYPE.INFILL;

    // Creating own namespace for plugin
    window.plugin.uniquesHighlighter = function() {};

    // Filtering portals to highlight by captured
    function highlightUniqueCaptures(data) {
        var portal = data.portal;
        var history = portal.options.data.history;

        // Filtering portals without history
        if(history == undefined) {
            return;
        }

        if(history.captured == true) {
            highlightPortal(portal, HISTORY_TYPE.CAPTURE);
        }
    }

    // Filtering portals to highlight by scout controlls
    function highlightUniqueScout(data) {
        var portal = data.portal;
        var history = portal.options.data.history;

        // Filtering portals without history
        if(history == undefined) {
            return;
        }

        if(history.scoutControlled == true) {
            highlightPortal(portal, HISTORY_TYPE.SCOUT);
        }
    }

    // Filtering portals to highlight by visits
    function highlightUniqueVisits(data) {
        var portal = data.portal;
        var history = portal.options.data.history;

        // Filtering portals without history
        if(history == undefined) {
            return;
        }

        if(history.visited == true) {
            highlightPortal(portal, HISTORY_TYPE.VISIT);
        }
    }

    // Highlight portal, given in the arguments
    function highlightPortal(portal, type) {
        var params = {fillColor: 'rgb(0,0,0)', fillOpacity: 1.0};
        portal.setStyle(params);



/*  THIS NOTE IS FOR LATER AND TO BE REMOVED
    Dashed circle drawn on iitc for link length:
    var d = portalDetail.get(p.options.guid);
    if (d) {
        var range = getPortalRange(d);
        portalRangeIndicator = (
            range.range > 0
            ? L.geodesicCircle(coord, range.range, {
                fill: false,
                color: #FF0000,
                weight: 5,
                interactive: false })
            : L.circle(coord, range.range, { fill: false, stroke: false, interactive: false })
            ).addTo(map);
        }

        portalAccessIndicator = L.circle(coord, HACK_RANGE,
            { fill: false, color: ACCESS_INDICATOR_COLOR, weight: 2, interactive: false }
        ).addTo(map);
    }
*/
    }

    // Debug messages, easy to toggle
    function debug(message) {
        if(PLUGIN_DEBUG) {
            console.debug(PLUGIN_PREFIX + message);
        }
    }

    // Setup plugin, adding hooks and running initial things
    var setup = function() {
        // Adding Highlight selector
        window.addPortalHighlighter('Unique Captures', highlightUniqueCaptures);
        window.addPortalHighlighter('Unique Scout-Controlled', highlightUniqueScout);
        window.addPortalHighlighter('Unique Visits', highlightUniqueVisits);

        // Adding configuration menu
        $('#toolbox').append('<a onclick="' + self.namespace + 'menu(); return false;" href="#">' + PLUGIN_NAME + '</a>');

        // Say something nice
        debug("Plugin loadet");
    }

    //add the script info data to the function as a property
    setup.info = plugin_info;
    if (typeof changelog !== 'undefined') setup.info.changelog = changelog;
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
