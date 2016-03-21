function PencilBrush(ctx) {
	this.draw = function (event) {
		if (wacom.isLoaded) {
			// this value is arbitrary and has nothing to do with
			// the brush's radius.
			// if a user interface feature is ever implemented to 
			// adapt brush radius, it won't work with wacom, only with mouse.
		    ctx.lineWidth = wacom.getPressure() * 12;   
		}

		ctx.beginPath();
		ctx.moveTo(event.previousMousePosition.offsetX, event.previousMousePosition.offsetY);
		ctx.lineTo(event.offsetX, event.offsetY);
		ctx.stroke();
		ctx.closePath();
	};

	this.name = "pencil";
}

toolbox.addNewBrush(new PencilBrush(ctx));
