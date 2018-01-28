function Pedestrian(x, y, distance)
{
	this.x = x;
	this.y = y;
	this.xInit = x;
	this.dir = 1;
	this.distance = distance;
	this.pic = images[20];

	this.width = 75;
	this.height = 150;
	this.y -= this.height/4;

	this.animOffset = 246;
	this.animHeight = 497;
	this.animCount = 0;
	this.animLength = 2;
	this.animTimer = 5;


	this.draw = function()
	{
		this.animTimer--;
		if(this.animTimer == 0)
		{
			this.animTimer = 5;
			this.animCount++;
			if(this.animCount ==this.animLength)
				this.animCount = 0;
		}
		graphics.save();
		graphics.scale(camera.scale, camera.scale);
		graphics.translate(this.x-this.width/2-camera.x+screenWH* 1/camera.scale,this.y-this.height/2-camera.y+screenHH* 1/camera.scale);
		if(this.dir == -1){
			graphics.translate(this.width,0);
			graphics.scale(-1, 1);
		}
		graphics.shadowBlur = 10;
		graphics.shadowColor = "black";
		graphics.drawImage(this.pic,this.animOffset * this.animCount,0, this.animOffset, this.animHeight, 0,0,this.width, this.height);
		graphics.shadowBlur = 0;
		graphics.restore();
	}
	this.update = function()
	{
		if(this.dir == 1)
		{
			if(this.x < this.xInit + this.distance)
				this.x += 5;
			else
				this.dir = -1;
		}else{
			if(this.x > this.xInit)
				this.x -= 5;
			else
				this.dir = 1;
		}
	}
}