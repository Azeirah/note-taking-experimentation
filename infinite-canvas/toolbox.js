function Toolbox(ctx) {
	var toolbox = this;
	var canvas = ctx.canvas;

	ctx.lineJoin = "round";
	ctx.lineCap  = "round";

	var currentBrush = "pencil";
	var brushes = {};

	toolbox.setRadius = function (radius) {
		toolbox.radius = radius;
		ctx.lineWidth = radius;
	};

	toolbox.setColor = function (color) {
		toolbox.color = color;
		ctx.strokeStyle = color;
	};

	toolbox.setBrush = function (whichBrush) {
		if (brushes.hasOwnProperty(whichBrush)) {
			currentBrush = whichBrush;
		} else {
			console.log("that brush,", whichBrush, "does not exist!");
		}
	};

	toolbox.addNewBrush = function (newBrush) {
		brushes[newBrush.name] = newBrush;
	};

	// lets the brush assign all its values to the context
	// sometimes the canvas loses its state (color, lineWidth etc)
	// this can happen on canvas resize to name one
	// this function moves the context back to the right state
	toolbox.commitToCtx = function () {
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.strokeStyle = toolbox.color;
		ctx.lineWidth = toolbox.radius;
	};

	// defaults
	// properties like color and radius actually belong to the brushes themselves.
	toolbox.setRadius(3);
	toolbox.setColor("black");

	canvas.addEventListener("az-drag", function(event) {
	    if (event.which === MOUSE.left) {
	    	brushes[currentBrush].draw(event);
	    }
	});
}
