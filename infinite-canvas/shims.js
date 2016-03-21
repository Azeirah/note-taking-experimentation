// Stole this code from stackoverflow
// Not from a stackoverflow post, but literally from stackoverflow's source code
String.prototype.format = function() {
    "use strict";
    var e = this.toString();
    if (!arguments.length) {
        return e;
    }
    var t = typeof arguments[0],
        n = "string" == t || "number" == t ? Array.prototype.slice.call(arguments) : arguments[0];

    for (var i in n) {
        e = e.replace(new RegExp("\\{" + i + "\\}", "gi"), n[i]);
    }

    return e;
}
