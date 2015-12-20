function disableContextMenu(element) {
    element.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        return false;
    });
}