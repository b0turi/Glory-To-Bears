function Door(x,y, key, index)
{
	this.x = x;
	this.y = y;
	this.key = key;
	this.index = index;

	this.width = 75;
	this.height = 75;

	this.pic = new Image();
	this.pic.src = "../asset/door.png";

	this.draw = function()
	{
		graphics.save();
		graphics.scale(camera.scale, camera.scale);
		graphics.translate(this.x-this.width/2-camera.x+screenWH* 1/camera.scale,this.y-this.height/2-camera.y+screenHH* 1/camera.scale);
		graphics.drawImage(this.pic,0,0, this.width, this.height);
		graphics.restore();
	}

	this.unlock = function()
	{
		blocks.splice(this.index, 1);
		for(var i = this.index;i<blocks.length; i++)
		{
			blocks[i].index--;
		}
		//Particle effects if there's time
	}
}