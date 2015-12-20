(function() {
    // custom event logic starting here
    var dragEvent = new CustomEvent("az-drag", {
        bubbles: true
    });

    var dragStartEvent = new CustomEvent("az-dragStart", {
        bubbles: true
    });

    window.addEventListener("mousedown", function (mousedownEvent) {
        var mousePosition = {
            clientX: mousedownEvent.clientX,
            clientY: mousedownEvent.clientY,
            layerX : mousedownEvent.layerX,
            layerY : mousedownEvent.layerY,
            offsetX: mousedownEvent.offsetX,
            offsetY: mousedownEvent.offsetY
        };

        (function () {
            var target   = mousedownEvent.target;
            var whichKey = mousedownEvent.which;
            var fired    = false;

            function moveHandler(event) {
                var newMousePosition     = {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    layerX : event.layerX,
                    layerY : event.layerY,
                    offsetX: event.offsetX,
                    offsetY: event.offsetY
                };

                dragEvent.dx                    = newMousePosition.clientX - mousePosition.clientX;
                dragEvent.dy                    = newMousePosition.clientY - mousePosition.clientY;
                dragEvent.previousMousePosition = mousePosition;
                dragEvent.clientX               = event.clientX;
                dragEvent.clientY               = event.clientY;
                dragEvent.layerX                = event.layerX;
                dragEvent.layerY                = event.layerY;
                dragEvent.offsetX               = event.offsetX;
                dragEvent.offsetY               = event.offsetY;
                dragEvent.which                 = whichKey;
                dragEvent.shiftKey              = event.shiftKey;
                dragEvent.altKey                = event.altKey;
                dragEvent.ctrlKey               = event.ctrlKey;
                dragEvent.preventDefault        = event.preventDefault;
                dragEvent.pointing              = event.target;

                target.dispatchEvent(dragEvent);
                if (!fired) {
                    fired = true;
                    target.dispatchEvent(dragStartEvent);
                }

                mousePosition = newMousePosition;
            }

            function releaseHandler() {
                window.removeEventListener("mousemove", moveHandler);
                window.removeEventListener("mouseup", releaseHandler);
            }

            window.addEventListener("mousemove", moveHandler);
            window.addEventListener("mouseup", releaseHandler);
        }());
    });
}());

var MOUSE = {
    left: 1,
    middle: 2,
    right: 3,
};
