function ex () {
    // creates an html document for browsing an infinity-note page
    // 1. do some note-taking with the program
    // 2. call this function, copy its output
    // 3. place the output in html file
    // 4. open html file
    // 5. you can only browse the notes you took, not editing
    //
    // The exported page misses canvas (and textarea value attrs) stuff unfortunately, that state is not
    // stored in the dom >_>
    var content = document.documentElement.outerHTML;

    content += [
        "<script>",
        '    // custom event logic starting here',
        '    var dragEvent = new CustomEvent("az-drag", {',
        '        bubbles: true',
        '    });',
        '',
        '    var dragStartEvent = new CustomEvent("az-dragStart", {',
        '        bubbles: true',
        '    });',
        '',
        '    window.addEventListener("mousedown", function (mousedownEvent) {',
        '        var mousePosition = {',
        '            clientX: mousedownEvent.clientX,',
        '            clientY: mousedownEvent.clientY,',
        '            layerX : mousedownEvent.layerX,',
        '            layerY : mousedownEvent.layerY,',
        '            offsetX: mousedownEvent.offsetX,',
        '            offsetY: mousedownEvent.offsetY',
        '        };',
        '',
        '        (function () {',
        '            var target   = mousedownEvent.target;',
        '            var whichKey = mousedownEvent.which;',
        '            var fired    = false;',
        '',
        '            function moveHandler(event) {',
        '                var newMousePosition     = {',
        '                    clientX: event.clientX,',
        '                    clientY: event.clientY,',
        '                    layerX : event.layerX,',
        '                    layerY : event.layerY,',
        '                    offsetX: event.offsetX,',
        '                    offsetY: event.offsetY',
        '                };',
        '',
        '                dragEvent.dx                    = newMousePosition.clientX - mousePosition.clientX;',
        '                dragEvent.dy                    = newMousePosition.clientY - mousePosition.clientY;',
        '                dragEvent.previousMousePosition = mousePosition;',
        '                dragEvent.clientX               = event.clientX;',
        '                dragEvent.clientY               = event.clientY;',
        '                dragEvent.layerX                = event.layerX;',
        '                dragEvent.layerY                = event.layerY;',
        '                dragEvent.offsetX               = event.offsetX;',
        '                dragEvent.offsetY               = event.offsetY;',
        '                dragEvent.which                 = whichKey;',
        '                dragEvent.shiftKey              = event.shiftKey;',
        '                dragEvent.altKey                = event.altKey;',
        '                dragEvent.ctrlKey               = event.ctrlKey;',
        '                dragEvent.preventDefault        = event.preventDefault;',
        '                dragEvent.pointing              = event.target;',
        '',
        '                target.dispatchEvent(dragEvent);',
        '                if (!fired) {',
        '                    fired = true;',
        '                    target.dispatchEvent(dragStartEvent);',
        '                }',
        '',
        '                mousePosition = newMousePosition;',
        '            }',
        '',
        '            function releaseHandler() {',
        '                window.removeEventListener("mousemove", moveHandler);',
        '                window.removeEventListener("mouseup", releaseHandler);',
        '            }',
        '',
        '            window.addEventListener("mousemove", moveHandler);',
        '            window.addEventListener("mouseup", releaseHandler);',
        '        }());',
        '    });',
        '',
        'var world = {',
            'panning: {',
                'x: parseInt(document.querySelector("html").style.left.split("px")[0]),',
                'y: parseInt(document.querySelector("html").style.top.split("px")[0])',
            '},',
            'notes: []',
        '};',
        'window.addEventListener("az-drag", function (event) {',
        '    if (event.which === 2) {',
        '        world.panning.x += event.dx;',
        '        world.panning.y += event.dy;',
        '        document.querySelector("html").style.left = world.panning.x + "px";',
        '        document.querySelector("html").style.top  = world.panning.y + "px";',
        '        event.returnValue = false;',
        '    }',
        '});',
        'window.addEventListener("mousedown", function (event) {',
            'if (event.which === 2) {',
                'event.preventDefault();',
            '}',
        '});',
        "</script>"
    ].join("\n");

    content = content.replace('<link rel="stylesheet" type="text/css" href="style.css">', [
        "<style>",
            "@font-face {",
              "font-family: 'varela-round';",
              "src: url('http://files.martijnbrekelmans.com/cdn/VarelaRound-Regular.otf');",
            "}",

            "body {",
                "background-color: rgb(233, 234, 237);",
            "}",

            ".note {",
                "transition: border-color 1.4s cubic-bezier(1, .01, 1, .64);",
                "border-radius: 3px;",
                "background-color: transparent;",
                "padding: 4px;",
            "}",

            ".note > .note-content > * {",
                "margin: 0;",
            "}",

            "html:hover .note {",
                "transition: border-color .2s ease;",
            "}",

            "html:hover .transcludeVariable {",
                "transition: opacity .2s ease;",
                "opacity: 0;",
            "}",

            "html {",
                "position: absolute;",
                "overflow: hidden;",
            "}",

            ".menu {",
                "border-bottom: 1px solid #888;",
                "border-left: 1px solid #888;",
                "border-right: 1px solid #888;",
                "border-radius: 3px;",
                "padding: 4px;",
            "}",

            ".transcludeVariable {",
                "display: none;",
            "}",

            ".transcludeVariable:hover {",
                "cursor: pointer;",
            "}",
        "</style>"
    ].join("\n"));

    return content;
}