function svg(tag, attrs) {
    var attrs = attrs || {};
    var svgEl = document.createElementNS("http://www.w3.org/2000/svg", tag);

    Object.keys(attrs).forEach(function (key) {
        svgEl.setAttribute(key, attrs[key]);
    });

    return svgEl;
}

var world = {
    panning: {
        x: 0,
        y: 0
    },
    notes: []
};

(function () {
    var svgContainer = svg("svg");

    function fitToWindow() {
        svgContainer.style.width = window.innerWidth + "px";
        svgContainer.style.height = window.innerHeight + "px";
    }

    document.body.appendChild(svgContainer);

    window.addEventListener("resize", fitToWindow);
    fitToWindow();

    window.svgContainer = svgContainer;
}());

function connection() {
    var connection = {};
    var line = svg("line", {stroke: "orangered", "stroke-width": 1});

    connection.from = function (x, y) {
        line.setAttribute("x1", x - world.panning.x);
        line.setAttribute("y1", y - world.panning.y);
    };

    connection.to = function (x, y) {
        line.setAttribute("x2", x - world.panning.x);
        line.setAttribute("y2", y - world.panning.y);
    };

    connection.connect = function (note1, note2) {
        connection.note1 = note1;
        connection.note2 = note2;
        note1.addConnection(connection);
        note2.addConnection(connection);
    };

    connection.destroy = function () {
        line.parentNode.removeChild(line);
        connection = null;
    };

    svgContainer.appendChild(line);

    return connection;
}

function createNote(x, y) {
    var note = {
        connections: [],
        width: 108,
        height: 192,
        x: x,
        y: y
    };

    var container            = document.createElement("div");
    container.className      = "note";
    container.style.position = "absolute";
    container.draggable      = false;

    var noteContentContainer = document.createElement("div");
    noteContentContainer.className = "note-content";
    noteContentContainer.style.height = "calc(100% - 40px)";

    document.body.appendChild(container);
    container.appendChild(noteContentContainer);

    disableContextMenu(container);

    note.move = function () {
        container.style.left = note.x + "px";
        container.style.top  = note.y + "px";
    };

    note.resize = function () {
        container.style.width  = note.width + "px";
        container.style.height = note.height + "px";

        container.dispatchEvent(resizeEvent);
    };

    note.element = container;

    note.setContent = function (content) {
        contentDestroyedEvent.target = content;
        container.dispatchEvent(contentDestroyedEvent);

        noteContentContainer.innerHTML = "";
        noteContentContainer.appendChild(content);
    };

    container.addEventListener("az-drag", function (event) {
        event.preventDefault();

        if (event.which === MOUSE.middle) {
            note.x += event.dx;
            note.y += event.dy;
            note.move();
            event.stopPropagation();
        } else if (event.which === MOUSE.right) {
            note.width += event.dx;
            note.height += event.dy;
            note.resize();
            event.stopPropagation();
        }
    });


    (function () {
        var newDataAvailableEvent = new CustomEvent("az-new-data-available");
        var exposeVars = {};
        var dataArea = document.createElement("div");

        note.element.addEventListener("drop", function (event) {
            event.preventDefault();
            var data = event.dataTransfer.getData("text");
            var t_var = window.queryTransclusionVar(data);
            var t_node = window.transNode(t_var);
            note.expose(t_var, t_node);
        });

        note.element.addEventListener("dragover", function (event) {
            // necessary to allow drop events to happen
            event.preventDefault();
        });

        dataArea.style.height = "40px";

        container.appendChild(dataArea);

        note.expose = function (transcludeVariable, transcludeNode) {
            exposeVars[transcludeVariable.name] = transcludeVariable;
            dataArea.appendChild(transcludeNode);
            newDataAvailableEvent.transVar = transcludeVariable;
            note.element.dispatchEvent(newDataAvailableEvent);
        };

        note.queryData = function (name) {
            return exposeVars[name]? exposeVars[name].value : null;
        };
    }());

    container.addEventListener("dblclick", function (event) {
        event.stopPropagation();
    });

    world.notes.push(note);
    note.setContent(cards["selection"](note));

    note.resize();

    return note;
}

window.addEventListener("dblclick", function (event) {
    var note = createNote(event.clientX - world.panning.x, event.clientY - world.panning.y);
    note.move();
});

var page = document.querySelector("html");
window.addEventListener("az-drag", function (event) {
    if (event.which === MOUSE.middle) {
        world.panning.x += event.dx;
        world.panning.y += event.dy;
        page.style.left = world.panning.x + "px";
        page.style.top  = world.panning.y + "px";
        event.returnValue = false;
    }
});

// prevent scroll by middle mouse drag
window.addEventListener("mousedown", function (event) {
    if (event.which === MOUSE.middle) {
        event.preventDefault();
    }
});
