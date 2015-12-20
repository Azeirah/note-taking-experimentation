(function () {
    var transclusions = Object.create(null);

    function TransVar(name, value) {
        this.name = name;
        this.value = value;
        this.callbacks = [];

        transclusions[name] = this;
    }

    TransVar.prototype.onUpdate = function (callback) {
        this.callbacks.push(callback);
    };

    TransVar.prototype.set = function (value) {
        this.value = value;
        this.callbacks.forEach(function (callback) {
            callback(value);
        });
    };

    TransVar.prototype.get = function () {
        return this.value;
    };

    function transNode(transVar) {
        var node = document.createElement("span");

        node.className = "transcludeVariable";
        node.draggable = true;

        // node.addEventListener("mouseenter", function() {
        //     transclusions[name].instances.forEach(function(clone) {
        //         clone.hovering(true);
        //     });
        //     // don't highlight self
        //     trans.hovering(false);
        //     transclusions[name].hovering = true;
        // });

        // node.addEventListener("mouseleave", function() {
        //     transclusions[name].instances.forEach(function(clone) {
        //         clone.hovering(false);
        //     });

        //     transclusions[name].hovering = false;
        // });

        node.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("text/plain", transVar.name);
        });

        node.innerHTML = transVar.name;

        return node;
    }

    window.Transclusion = TransVar;
    window.transNode = transNode;
    window.queryTransclusionVar = function (name) {
        return transclusions[name];
    };
}());
