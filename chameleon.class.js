(function(window){    
	"use strict";
	var Chameleon = function(json){

		var defaults = {
			image: 'some_image.jpg',
			scan_size: 0.0005,
			callback: function(){}
		};

		if(typeof json === 'undefined'){
			json = {};
		}

		for(var key in defaults){
			if(defaults.hasOwnProperty(key)){
				json[key] = typeof json[key] === 'undefined' ? defaults[key] : json[key];
			}
		}

		for(var key in json){
			if(json.hasOwnProperty(key)){
				if(defaults.hasOwnProperty(key) && typeof json[key] !== typeof defaults[key]){
					throw new Error(key+' should be '+ (typeof defaults[key]) + ', verify your data.');
				}
				this[key] =  json[key];
			}
		}

		this.set_color();
	};

	Chameleon.prototype.set_color = function() {
		this.img = new Image();
		this.img._t = this;
		this.img.src = this.image;
		
		this.img.onload = function(){
			var t = this._t;
			var data = t.init_canvas(this);
			var raw = t.get_raw_rgb(data);
			var populars = t.get_popular_rgb(raw);
			var rgb = t.get_main_rgb(populars);
			var hex = t.rgb_to_hex(rgb);

			t.color = hex;
			t.callback(t);
		}
	};

	Chameleon.prototype.init_canvas = function(image) {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext && this.canvas.getContext('2d');

		var	data, width, height, length, count = 0;

		if (!this.context) {
			throw new Error("There's a problem creating the canvas");
			return false;
		}

		var height = this.canvas.height = image.naturalHeight || image.offsetHeight || image.height;
		var width = this.canvas.width = image.naturalWidth || image.offsetWidth || image.width;

		this.context.drawImage(image, 0, 0);
		try {
			data = this.context.getImageData(0, 0, width, height);
		} catch(e) {
			console.log(e.message);
			throw new Error("There's a problem reading the image");
			return false;
		}

		return data;
	};

	Chameleon.prototype.get_color = function() {
		return this.color;
	};

	Chameleon.prototype.get_popular_rgb = function(matches) {
		var maximum = 0;
		var popular;
		var key;

		//Finds the most used rgb
		for(var hex in matches){
			if(matches.hasOwnProperty(hex)){
				if(matches[hex].length > maximum) {
					maximum = matches[hex].length;
					popular = matches[hex];
					key = hex;
				}
			}
		}

		return popular;
	};

	Chameleon.prototype.get_main_rgb = function(populars) {
		var main_rgb = {r:0, g:0, b: 0};

		var count = 0;
		for(var i = 0, len = populars.length; i < len; i++){
			var pop = populars[i];
			var rgb = this.hex_to_rgb(pop);

			for(var k in rgb){
				if(rgb.hasOwnProperty(k) && main_rgb.hasOwnProperty(k)){
					main_rgb[k] += rgb[k];
				}
			}
			count++;			
		}

		// ~~ used to floor values
		for(var k in main_rgb){
			if(main_rgb.hasOwnProperty(k)){
				main_rgb[k] = ~~(main_rgb[k] / count);
			}
		}

		this.rgb = main_rgb;
		return main_rgb;
	};

	Chameleon.prototype.get_raw_rgb = function(data) {
		length = data.data.length;

		var blockSize = length * this.scan_size;
		blockSize = Math.floor(blockSize);


		var hexes = {};
		var rgb_blocks = []
		var aux = 0;
		i = -4
		while ( (i += blockSize * 4) < length ) {
			rgb_blocks.push({
				r:data.data[ i ],
				g:data.data[ i + 1 ],
				b:data.data[ i + 2 ]
			});
			aux++;
		}

		var matches = {};
		for(var i = 0, len = rgb_blocks.length; i < len; i++){
			var rgb = rgb_blocks[i];
			var hex = this.rgb_to_hex(rgb);
			//If the color is not black or white
			if(rgb.r > 10 && rgb.r < 245 && rgb.g > 10 && rgb.g < 245 && rgb.b > 10 && rgb.b < 245){
				matches[hex] = [];
				for(var j = 0, len2 = rgb_blocks.length; j < len2; j++){
					var rgb_aux = rgb_blocks[j];
					if( i !== j){
						var red = Math.abs(rgb.r - rgb_aux.r);
						var green = Math.abs(rgb.g - rgb_aux.g);
						var blue = Math.abs(rgb.b - rgb_aux.b);

						//If the colors are similar
						if(red <= 10 && green <= 10 && blue <= 10){
							var hex_aux = this.rgb_to_hex(rgb_aux);
							matches[hex].push(hex_aux);
						}
					}
				}
			}
		}

		return matches;
	};

	Chameleon.prototype.rgb_to_hex = function(rgb) {
		return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
	};

	Chameleon.prototype.hex_to_rgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	};


	window.Chameleon = function(json){
		return new Chameleon(json);
	}

})(window);