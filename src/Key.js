function Key(x,y,doors, ind)
{
	this.x = x;
	this.y = y;
	this.doors = doors;
	this.doors.shift();
	this.index = ind;

	this.pic = new Image();
	this.pic.src = "../assets/key.png";

	this.width = 50;
	this.height = 50;

	this.draw = function()
	{
		graphics.save();
		graphics.scale(camera.scale, camera.scale);
		graphics.translate(this.x-this.width/2-camera.x+screenWH* 1/camera.scale,this.y-this.height/2-camera.y+screenHH* 1/camera.scale);
		graphics.shadowBlur = 10;
		graphics.shadowColor = "black";
		graphics.drawImage(this.pic,0,0, this.width, this.height);
		graphics.shadowBlur = 0;
		graphics.restore();
	}

	this.update = function()
	{
		for(i = 0;i<bears.length; i++)
			this.checkCollision(bears[i]);
	}

	this.checkCollision = function(obj)
	{
		if(Math.abs(obj.x-this.x) < obj.width/2 && Math.abs(obj.y-this.y) < obj.height/2)
			this.collect();
	}

	this.collect = function()
	{
		var allDoors = getDoors();
		for(i = 0;i<this.doors.length;i++)
		{
			var a = allDoors[this.doors[i]];
			a.unlock();
		}

		keys.splice(this.index, 1);
	}
}
function getDoors(){
	var theDoors = [];
	for(i = 0;i<blocks.length;i++)
	{
		if(blocks[i].isDoor)
			theDoors.push(blocks[i]);
	}
	return theDoors;
}