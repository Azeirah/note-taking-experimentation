/**
 *
 * A library that introduces a drag event for html elements
 *
 * Here's an example for a painting application:
 *
 * canvas.addEventListener("az-drag", function (event) {
 *   ctx.beginPath();
 *   ctx.moveTo(event.previousMousePosition.clientX, event.previousMousePosition.clientY);
 *   ctx.lineTo(event.clientX, event.clientY);
 *   ctx.stroke();
 * });
 *
 * Attributes of the event:
 *
 * {
 *   // difference in position between this and the last az-drag event
 *   dragEvent.dx,
 *   dragEvent.dy,
 *   // stores the previous clientX/Y, layerX/Y and offsetX/Y
 *   dragEvent.previousMousePosition,
 *   // positional information, like mousemove's positional information
 *   dragEvent.clientX,
 *   dragEvent.clientY,
 *   dragEvent.layerX,
 *   dragEvent.layerY,
 *   dragEvent.offsetX,
 *   dragEvent.offsetY,
 *   // the mouse button pressed on mousedown
 *   dragEvent.which,
 *   // shift, alt and ctrl will be true if they were held down during mousedown
 *   // (THEY WILL NOT CHANGE IF YOU RELEASE THEM DURING MOUSEMOVE)
 *   dragEvent.shiftKey,
 *   dragEvent.altKey,
 *   dragEvent.ctrlKey,
 *   dragEvent.preventDefault,
 *   // alias for event.target, event.target itself was a little different for some reason
 *   dragEvent.pointing
 * }
 *
 *
 */

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
