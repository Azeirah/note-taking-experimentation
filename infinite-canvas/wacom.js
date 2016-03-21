var wacom = {
    isLoaded: false,
    plugin: undefined,
    getPressure: function () {
        if (wacom.isLoaded) {
            return wacom.plugin.penAPI.pressure;
        } else {
            return -1;
        }
    }
};

(function() {
    function getWacomPlugin() {
        return document.getElementById("wtPlugin");
    }

    function isPluginLoaded() {
        var retVersion = "";
        var pluginVersion = getWacomPlugin().version;

        if (pluginVersion != undefined) {
            retVersion = pluginVersion;
        }

        return retVersion;
    }

    window.addEventListener("load", onload);

    function onload() {
        var loadVersion = isPluginLoaded();
        if (loadVersion) {
            console.log("wacom plugin succesfully loaded");
            wacom.plugin = getWacomPlugin();
            wacom.isLoaded = true;
        } else {
            console.log("Couldn't load wacom plugin!");
        }
    }   
}());