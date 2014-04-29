/* Author:

*/
var imagePaths = ["boot", "cornice_right", "pot2", "window_both",
			   "broken", "line_left", "pot", "window_left",
			   "clock", "line_right", "roof", "window_none",
			   "clothes_line", "sash_left", "window_right",
               "controls", "poster", "sash_right", "items",
			   "cornice_left", "pot1", "score", "star",
			   "sill", "numbers/0", "numbers/1",
			   "numbers/2", "numbers/3", "numbers/4",
			   "numbers/5", "numbers/6", "numbers/7", "numbers/8",
			   "numbers/9", "bg"];

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

//Boolean for left cursor or right cursor pressed
var left, right;

var c;
var images = new Array();
var loaded = 0;

//Objects to be drawn
var sprites = new Array();
var ll, rl;
var pot, boot;
var background;
var scoreLabel;

//Collision blocks
var blocks = new Array();
var items = new Array();

//Game state
var speed = 6;
var started = false;
var ended = false;

//Score
var score = 0;

function Sprite(name, x, y) {
	this.x = x;
	this.y = y;
	this.name = name;
	this.getImageObj = function() {
		return images[this.name];
	}
	return this;
}

function Rect(x, y, w, h, name) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.name = name;
	this.intersects = function(rect) {
	  var tw = this.w;
	  var th = this.h;
	  var rw = rect.w;
	  var rh = rect.h;
	  if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
	    return false;
	  }
	  var tx = this.x;
	  var ty = this.y;
	  var rx = rect.x;
	  var ry = rect.y;
	  rw += rx;
	  rh += ry;
	  tw += tx;
	  th += ty;
	  // overflow || intersect
	  return ((rw < rx || rw > tx) &&
		(rh < ry || rh > ty) &&
		(tw < tx || tw > rx) &&
		(th < ty || th > ry));
	};
	return this;
}

function render() {
	requestAnimFrame(render);
	
	//update score
	if(started) {
		score++;
	}	
	
	//move pot/boot
	if(!ended) {
		var move = 0;
		if(left) {
			move = -6;
		} else if(right) {
			move = 6;
		}
		
		pot.x+=move;
		boot != null ? boot.x += move : boot = null;
		
		if(pot.x<335) {
			pot.x = 335;
			boot.x = 280;
		}
		if(pot.x>800) {
			pot.x = 800;
			boot != null ? boot.x = 745 : boot = null;
		}
	}
	
	//check for collisions
	for(var i=0; i<blocks.length; i++) {
	  if(blocks[i].intersects(new Rect(pot.x, pot.y + 47, 42, 58))) {
	  	pot.name = "broken";
	  	document.getElementById('bg_music').pause();
	  	document.getElementById('bg_music').currentTime = 0;
	  	started = false;
	  	if(!ended) {
	  		document.getElementById('break').play();
	  	}
	  	ended = true;
	  }
	}
	
	//check for collisions with bonus items
	for(var i=0; i<items.length; i++) {
	  if(items[i].intersects(new Rect(pot.x, pot.y + 47, 42, 58))) {
	  	if(items[i].name == "star") {
	  	  score += 5000;
	  	} else if(items[i].name == "clock") {
	  	  speed = Math.max(speed - 3, 4);
	  	}
	  	items.splice(i, 1);
	  	i--;
	  }
	}
	  
	//move other sprites up and remove not rendered ones
	if(started) {
		for(var i=0; i<sprites.length; i++) {
			sprites[i].y-=speed;
			if(sprites[i].y + sprites[i].getImageObj().height < 0) {
				sprites.splice(i, 1);
				i--;
			}
		}
		
		boot != null ? boot.y -= speed : boot = null;
		ll.y > -2000 ? ll.y -= speed : ll.y = -10;
		rl.y > -2000 ? rl.y -= speed : rl.y = -10;
		
		for(var i=0; i<blocks.length; i++) {
			blocks[i].y-=speed;
			if(blocks[i].y + blocks[i].h < 0) {
				blocks.splice(i, 1);
				i--;
			}
		} 
		
		for(var i=0; i<items.length; i++) {
			items[i].y-=speed;
			if(items[i].y + items[i].h < 0) {
				items.splice(i, 1);
				i--;
			}
		} 

		if(pot.y > 100) {
			pot.y--;
		}
	}
	
	var ctx = c.getContext("2d");
	
	//clear canvas
	clear();
	
	//draw background
	ctx.drawImage(background.getImageObj(), background.x, background.y);
	
	//draw lines
	ctx.drawImage(ll.getImageObj(), ll.x, ll.y, ll.getImageObj().width, Math.max(400, window.innerHeight-5-ll.y));
	ctx.drawImage(rl.getImageObj(), rl.x, rl.y, rl.getImageObj().width, Math.max(400, window.innerHeight-5-ll.y));
	
	//draw sprites
	ctx.save();
	ctx.globalAlpha = 0.8;
	for(var i=0; i<sprites.length; i++) {
		ctx.drawImage(sprites[i].getImageObj(), sprites[i].x, sprites[i].y);
	}
	
	//draw bonus items
	for(var i=0; i<items.length; i++) {
		ctx.drawImage(images[items[i].name], items[i].x, items[i].y);
	}
	
	//draw boot if it's till there
	if(boot != null) {
		ctx.drawImage(boot.getImageObj(), boot.x, boot.y);
	}
	
	//draw pot
	ctx.drawImage(pot.getImageObj(), pot.x, pot.y);
	
	//draw score
	ctx.drawImage(scoreLabel.getImageObj(), scoreLabel.x, scoreLabel.y);
	var scoreStr = score.toString();
	var offsetX = 1080 - scoreStr.length * 26;
	for(var i=0; i<scoreStr.length; i++) {
		ctx.drawImage(images["numbers/" + scoreStr.charAt(i)], offsetX, 100);
		offsetX += 26;
	}
	
	ctx.restore();
}

function swap() {
	if(ended || !started) {
		return;
	}
	pot.name = pot.name == "pot1" ? "pot2" : "pot1";
	window.setTimeout(swap, 250);
}

function spawnItem() {
	if(ended || !started) {
		return;
	}
	var x = random(330, 800);
	var y = window.innerHeight + 1;
	var name = Math.random() > 0.5 ? "clock" : "star";
	items.push(new Rect(x+2, y+2, 30, 30, name));
	window.setTimeout(spawnItem, 15000);
}

function spawn() {
	if(ended || !started) {
		return;
	}
	var rand = random(1, 8);
	switch(rand) {
		case 1:
			var x = random(340, 680);
			var y = window.innerHeight + 1;
			sprites.push(new Sprite("window_both", x, y));
			sprites.push(new Sprite("sill", x-20, y + 132));	
			blocks.push(new Rect(x+17, y + 147, 110, 25));
			break;
		case 2:
			var x = random(335, 650);
			var y = window.innerHeight + 21;
			sprites.push(new Sprite("window_left", x, y));
			sprites.push(new Sprite("sash_right", x + 140, y - 20));
			blocks.push(new Rect(x+160, y - 3, 28, 100));	
			break;
		case 3:
			var x = random(385, 680);
			var y = window.innerHeight + 21;
			sprites.push(new Sprite("window_right", x, y));
			sprites.push(new Sprite("sash_left", x - 48, y - 20));
			blocks.push(new Rect(x - 32, y - 3, 28, 100));	
			break;
		case 4:
			var x = 305;
			var y = window.innerHeight + 1;
			sprites.push(new Sprite("window_both", x + 60, y));
			sprites.push(new Sprite("cornice_left", x, y + 140));
			blocks.push(new Rect(x, y + 154, 242, 20));
			break;
		case 5:
			var x = 635;
			var y = window.innerHeight + 1;
			sprites.push(new Sprite("window_both", x + 40, y));
			sprites.push(new Sprite("cornice_right", x, y + 140));
			blocks.push(new Rect(x + 10, y + 152, 242, 20));
			break;
		case 6:
			var x = 330;
			var y = window.innerHeight + 1;
			sprites.push(new Sprite("clothes_line", x, y));
			break;
		case 7:
			var x = random(335, 725);
			var y = window.innerHeight + 1;
			sprites.push(new Sprite("poster", x, y));
			break;
	}
	window.setTimeout(spawn, 4500/speed);
}

function speedUp() {
	if(ended || !started) {
		return;
	}
	speed += 2;
	window.setTimeout(speedUp, 10000);
}

function clear() {
	var ctx = c.getContext("2d");
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.fillRect(0, 0, c.width, c.height);
}

function random(min, max) {
  return Math.floor(Math.random() * (max-min)) + min;
}

function reset() {
	started = false;
	ended = false;
	speed = 6;
	score = 0;
	
	sprites = new Array();
	blocks = new Array();
	
	sprites.push(new Sprite("roof", 300, 380));
	sprites.push(new Sprite("controls", 450, 110));
	sprites.push(new Sprite("items", 450, 220));
	ll = new Sprite("line_left", 305, 405);
	rl = new Sprite("line_right", 848, 405);
	
	boot = new Sprite("boot", 310, 290);
	pot = new Sprite("pot", 365, 290);
	scoreLabel = new Sprite("score", 950, 20);
	
	document.getElementById('bg_music').pause();
	if(document.getElementById('bg_music').currentTime > 0) {
		document.getElementById('bg_music').currentTime = 0;
	}
}

function init() {
	c = document.getElementById("c");
	c.height = window.innerHeight-5;
	clear();
	
	background = new Sprite("bg", 0, 0);
	
	reset();
	
	for(var i = 0; i<imagePaths.length; i++) {
		var image = new Image();
		image.onload = function() {
			loaded++;

			var ctx = c.getContext("2d");
			ctx.beginPath();
			ctx.fillStyle = "#ffffff";
			ctx.rect(1155/2 - 800/2, window.innerHeight-5 - 100/2, 800, 100);
			ctx.fill();
			var text = "Loaded " + loaded + "/" + imagePaths.length + " images";
			var metrics = ctx.measureText(text);
			ctx.fillText(text, 1155/2 - metrics.width/2, window.innerHeight-5 - 100/2 + 10);
			
			if(loaded == imagePaths.length) {
	            requestAnimFrame(render);
			}
		}
		image.src = 'img/' + imagePaths[i] + '.png';
		images[imagePaths[i]] = image;
	}
}

function keyListener(e) {
    if (e.keyCode == 37) { 
		left = e.type == "keydown" ? true : false;
    } else if (e.keyCode == 39) { 
		right = e.type == "keydown" ? true : false;
    } else if (e.keyCode == 32) {
    	if(!started) {
    		pot.name = "pot1";
	    	boot.x += 15;
	    	boot.y += 15;
	    	console.log(document.getElementById('bg_music'));
			document.getElementById('bg_music').play();	
	    	window.setTimeout(function() {
	    		boot.x -= 15;
	    		boot.y -= 15;	
	    	}, 200);
    		window.setTimeout(swap, 200);
    		window.setTimeout(spawn, 500);
    		window.setTimeout(spawnItem, 15000);
    		window.setTimeout(speedUp, 10000);
    	}
    	started = true;
    } else if (e.keyCode == 82) {
    	reset();
    }
}

$(document).ready(init);
$(document).keydown(keyListener);
$(document).keyup(keyListener);
