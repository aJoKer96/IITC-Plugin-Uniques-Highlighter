// ==UserScript==
// @author         JoKer96
// @name           IITC Plugin: Uniques-Highlighter
// @category       Highlighter
// @version        0.1
// @description    Highlights Portals that you have to visit/capture/scoutcontrol.
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

    var prefix = "[Uniques-Highlighter] ";
    var changelog = [
        {
            version: "0.1",
            changes: ['First release'],
        },
    ];

    // Creating own namespace for plugin
    window.plugin.uniquesHighlighter = function() {};

    window.plugin.uniquesHighlighter.portalLoaded = function(portalData) {
        // filter out placeholder portals
        if (!('title' in portalData.portal.options.data)) {
            return true;
        }
        var guid = portalData.portal.options.guid
        var options = portalData.portal.options.data;

        //console.log(JSON.stringify(options));
        //console.log(guid);
        var history = options.history;

        if(!history["captured"]) {
            var params = {fillColor: 'rgb(0,0,0)', fillOpacity: 1.0};
            portalData.portal.setStyle(params);
        }
    }


    var setup = function() {
        window.addHook('portalAdded', window.plugin.uniquesHighlighter.portalLoaded);

        console.debug(prefix + "Plugin loadet");
    }

    setup.info = plugin_info; //add the script info data to the function as a property
    if (typeof changelog !== 'undefined') setup.info.changelog = changelog;
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end


// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = {version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
