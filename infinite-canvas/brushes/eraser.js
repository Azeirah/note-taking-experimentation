function EraserBrush(ctx) {
	this.draw = function (event) {
		ctx.beginPath();
		ctx.moveTo(event.previousMousePosition.offsetX, event.previousMousePosition.offsetY);
		ctx.lineTo(event.offsetX, event.offsetY);
		ctx.stroke();
		ctx.closePath();
	};

	this.name = "eraser";
}

toolbox.addNewBrush(new EraserBrush(ctx));
