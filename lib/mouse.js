var mouse = {
    x: 0,
    y: 0,
    left: false,
    middle: false,
    right: false
};

(function () {
    window.addEventListener("mousemove", function (event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener("mousedown", function (event) {
        if (event.which === 1) {
            mouse.left = true;
        } else if (event.which === 2) {
            mouse.middle = true;
        } else if (event.which === 3) {
            mouse.right = true;
        }
    });

    window.addEventListener("mouseup", function (event) {
        if (event.which === 1) {
            mouse.left = false;
        } else if (event.which === 2) {
            mouse.middle = false;
        } else if (event.which === 3) {
            mouse.right = false;
        }
    });
}());