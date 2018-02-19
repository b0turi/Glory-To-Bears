function Switch(x,y,final, doors, ind)
{
	this.x = x;
	this.y = y;
	this.doors = doors;
	this.doors.shift();
	this.doors.shift();
	this.index = ind;
	this.stepping = false;

	this.final = final;

	this.pic = new Image();
	this.pic.src = "../assets/switch.png";

	this.width = 50;
	this.height = 50;
	this.offset = 50;

	this.y += 12.5;

	this.draw = function()
	{
		graphics.save();
		graphics.scale(camera.scale, camera.scale);
		graphics.translate(this.x-this.width/2-camera.x+screenWH* 1/camera.scale,this.y-this.height/2-camera.y+screenHH* 1/camera.scale);
		graphics.shadowBlur = 10;
		graphics.shadowColor = "black";
		if(this.stepping){
			graphics.drawImage(this.pic,this.offset,0, this.width, this.height, 0, 0, this.width, this.height);
		}
		else{
			graphics.drawImage(this.pic,0,0, this.width, this.height, 0, 0, this.width, this.height);
		}
		graphics.shadowBlur = 0;
		graphics.restore();
	}

	this.update = function()
	{
		for(var q = 0;q<bears.length; q++){
			this.checkCollision(bears[q]);
		}
	}
	this.standingIndex = -1;
	this.checkCollision = function(obj)
	{
		if(Math.abs(obj.x-this.x) < obj.width/2 + this.width/2 && Math.abs(obj.y-this.y) < obj.height/2 + this.height/2)
		{
			this.standingIndex = obj.index;
			this.stepping = true;
			this.collect();
		}else if(obj.index == this.standingIndex && (Math.abs(obj.x-this.x) > this.width/2 || Math.abs(obj.y-this.y) > this.height/2)){
			this.stepping = false;
			this.standingIndex = -1;
			this.stepOff();
		}
	}

	this.stepOff = function()
	{
		if(!this.final)
		{
			for(var t = 0;t<this.doors.length;t++)
			{
				var a = getDoors()[this.doors[t]];
				a.hidden = false;
			}
		}
	}

	this.collect = function()
	{
		for(var q = 0;q<this.doors.length;q++)
		{
			var a = getDoors()[this.doors[q]];
			if(this.final){
				a.unlock();
				switches.splice(this.index, 1);
			}
			else{
				a.hidden = true;
			}
		}
	}
}