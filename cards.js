var cards = {};

function registerCard(name, card) {
    cards[name] = card;
}

function textEditorCard(note) {
    var textarea = document.createElement("textarea");

    // these features aren't needed, the card provides these functionalities, so the textarea won't have to.
    textarea.style.border          = "none";
    textarea.style.resize          = "none";
    textarea.style.backgroundColor = "transparent";

    function fitToParent() {
        var style = window.getComputedStyle(note.element, null);
        textarea.style.width = style.getPropertyValue("width");
        textarea.style.height = style.getPropertyValue("height");
    }

    function cleanup(event) {
        if (event.target === textarea) {
            note.element.removeEventListener("resize", fitToParent);
            note.element.removeEventListener("contentDestroyed", cleanup);
        }
    }

    var t_text = new window.Transclusion("text", textarea.value);
    var n_text = new window.transNode(t_text);
    note.expose(t_text, n_text);

    textarea.addEventListener("input", function () {
        t_text.set(textarea.value);
    });

    note.element.addEventListener("resize", fitToParent);
    note.element.addEventListener("contentDestroyed", cleanup);

    fitToParent();

    return textarea;
}

function cardSelectionCard(note) {
    var cardOptions = document.createElement("ul");
    var selection;

    cardOptions.style.listStyle = "none";
    cardOptions.style.padding = "0";

    Object.keys(cards).forEach(function (key) {
        var option = document.createElement("li");
        option.innerHTML = key;

        cardOptions.appendChild(option);

        option.addEventListener("click", function () {
            note.setContent(cards[key](note));
        });
    });

    function fitToParent() {
        var style = window.getComputedStyle(note.element, null);
        cardOptions.style.width = style.getPropertyValue("width");
        cardOptions.style.height = style.getPropertyValue("height");
    }

    function cleanup(event) {
        if (event.target === cardOptions) {
            note.element.removeEventListener("resize", fitToParent);
            note.element.removeEventListener("contentDestroyed", cleanup);
        }
    }

    note.element.addEventListener("resize", fitToParent);
    note.element.addEventListener("contentDestroyed", cleanup);

    return cardOptions;
}

function drawingCard(note) {
    var drawing = document.createElement("canvas");
    var ctx = drawing.getContext("2d");

    drawing.addEventListener("az-drag", function (event) {
        if (event.which === MOUSE.left) {
            ctx.beginPath();
            ctx.moveTo(event.previousMousePosition.offsetX, event.previousMousePosition.offsetY);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        }
    });

    function fitToParent() {
        var style = window.getComputedStyle(note.element, null);
        drawing.width = parseInt(style.getPropertyValue("width").split("px")[0]);
        drawing.height = parseInt(style.getPropertyValue("height").split("px")[0]);
    }

    function cleanup(event) {
        if (event.target === drawing) {
            note.element.removeEventListener("resize", fitToParent);
            note.element.removeEventListener("contentDestroyed", cleanup);
        }
    }

    note.element.addEventListener("resize", fitToParent);
    note.element.addEventListener("contentDestroyed", cleanup);

    var t_ctx = new Transclusion("ctx", ctx);
    var n_ctx = transNode(t_ctx);
    note.expose(t_ctx, n_ctx);

    fitToParent();

    return drawing;
}

function displayHtmlCard(note) {
    var container = document.createElement("div");

    function fitToParent() {
        var style = window.getComputedStyle(note.element, null);
        container.style.width = style.getPropertyValue("width");
        container.style.height = style.getPropertyValue("height");
    }

    note.element.addEventListener("resize", fitToParent);

    note.element.addEventListener("az-new-data-available", function (event) {
        event.transVar.onUpdate(function (newValue) {
            container.innerHTML = newValue;
        });
    });

    return container;
}

function drawingControlsCard(note) {
    var container = document.createElement("div");

    function fitToParent() {
        var style = window.getComputedStyle(note.element, null);
        container.style.width = style.getPropertyValue("width");
        container.style.height = style.getPropertyValue("height");
    }

    note.element.addEventListener("resize", fitToParent);

    var colors = ["red", "green", "blue", "yellow", "black"];
    colors.forEach(function (color) {
        var swatch = document.createElement("span");

        swatch.style.backgroundColor = color;
        swatch.style.width           = "22px";
        swatch.style.height          = "22px";
        swatch.style.borderRadius    = "50%";
        swatch.style.display         = "inline-block";

        swatch.addEventListener("click", function () {
            var ctx = note.queryData("ctx");
            if (ctx !== null) {
                ctx.strokeStyle = color;
            }
        });

        container.appendChild(swatch);
    });

    return container;
}

function displayDataCard(note) {
    var container = document.createElement("code");

    function fitToParent() {
        var style = window.getComputedStyle(note.element, null);
        container.style.width = style.getPropertyValue("width");
        container.style.height = style.getPropertyValue("height");
    }

    note.element.addEventListener("resize", fitToParent);

    note.element.addEventListener("az-new-data-available", function (event) {
        event.transVar.onUpdate(function (newValue) {
            container.innerHTML = JSON.stringify(newValue, null, 2);
        });
    });

    return container;
}

registerCard("text", textEditorCard);
registerCard("selection", cardSelectionCard);
registerCard("drawing", drawingCard);
registerCard("displayHtml", displayHtmlCard);
registerCard("drawingControls", drawingControlsCard);
registerCard("json", displayDataCard);
