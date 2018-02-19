function Ground(x,y)
{
	this.x = x;
	this.y = y;
	this.width = 20000;
	this.height = 10000;
	this.draw = function()
	{
		this.x = bears[active].x - (screenWH*2)/camera.scale;
		graphics.save();
		graphics.scale(camera.scale, camera.scale);
		graphics.translate(this.x-this.width/2-camera.x+screenWH* 1/camera.scale,this.y-this.height/2-camera.y+screenHH* 1/camera.scale);
		graphics.fillStyle = "#666666";
		graphics.fillRect(0,0, this.width, this.height);
		graphics.restore();
	}
}