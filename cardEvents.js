(function() {
    var resizeEvent = new CustomEvent("resize");
    window.resizeEvent = resizeEvent;

    var contentDestroyedEvent = new CustomEvent("contentDestroyed");
    window.contentDestroyedEvent = contentDestroyedEvent;
}());
