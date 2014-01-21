(function(window){
	"use strict";

	var color = document.getElementById('color_text');
	new Chameleon({
		image: '9304242573_5264176c0b_b.jpg',
		callback: function(e){
			var text = document.createTextNode(e.color);
			color.appendChild(text);

			fillColor(e)
		}
	});

	function fillColor(e){
		var ctx = document.getElementById('color_canvas').getContext("2d");

		ctx.fillStyle = e.color;
		ctx.fillRect(0, 0, 100, 100);
		ctx.fill();
		console.log('e', e);
	}

})(window);