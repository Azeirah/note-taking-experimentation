// stole this code from.. somewhere? stackoverflow I think
// (not from stackoverflow post, but literally from the stackoverflow page itself its sourcecode! :)
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
