function Bear(x, y, i)
{
	this.x = x;
	this.y = y;
	this.index = i;

	this.dir = 1;
	this.clingDir = 1;

	this.width = 75;
	this.height = 150;

	this.grav = 0;
	this.xGrav = 0;
	this.floor = defaultFloor;

	this.onGround = false; 
	this.onBlock = -1;
	this.animTimer = 5;

	this.stacked = false;
	this.stackParent = null;
	this.stackChild = null;
	this.stackCount = 0;

	this.state = "idle";
	this.isHat = false;

	this.currentFrame = 0;
	this.frameLength = 2;

	this.pic = new Image();
	this.pic.src = "../assets/bear.png";

	this.screenWH = screen.width/2;
	this.screenHH = screen.height/2;

	this.draw = function()
	{
		var animOffset = 268;
		
		graphics.save();
		graphics.scale(camera.scale, camera.scale);
		graphics.translate(this.x-this.width/2-camera.x+screenWH* 1/camera.scale,this.y-this.height/2-camera.y+screenHH* 1/camera.scale);
		if(this.dir == -1){
			graphics.translate(this.width,0);
			graphics.scale(-1, 1);
		}
		graphics.translate(this.width/2, this.height/2);
		graphics.rotate(this.rotation);
		graphics.translate(-this.width/2, -this.height/2);
		if(!this.isHat)
		{
			if(this.state == "idle")
				graphics.drawImage(this.pic, 0,0, animOffset, 536, 0, 0, this.width, this.height);
			if (this.state == "walking")
				graphics.drawImage(this.pic, animOffset * this.currentFrame, 0, animOffset, 536, 0, 0, this.width, this.height);
			if(this.state == "crouching")
				graphics.drawImage(this.pic, 0,0, this.width, this.height);
		}else{
			graphics.drawImage(this.pic, 0,0, this.width, this.height);
		}
		graphics.restore();
	}

	this.update = function()
	{
		if(this.state == "walking" && active + blocks.length != this.index)
			this.state = "idle";
		this.animTimer--;
			if(this.animTimer == 0)
			{
				this.animTimer = 5;
				this.currentFrame++;
				if(this.currentFrame == this.frameLength)
					this.currentFrame = 0;
			}	
		if(this.spinning)
			this.rotation+= this.dir * 12 * (Math.PI/180);
			this.y += this.grav;
			if(this.y + this.height/2 < this.floor) 
			{
				this.grav++;
				this.onGround = false;
			}else{
				this.grav = 0;
				this.y = this.floor - this.height/2;
				this.onGround = true;
				this.spinning = false;
				this.rotation = 0;
			}

			this.x += this.xGrav;
			if(this.xGrav != 0)
			{
				if(this.xGrav > 0)
					this.xGrav--;
				if(this.xGrav < 0)
					this.xGrav++;
			}

			if(this.state=="clinging" && this.grav == 0)
				this.state = "idle";
	}

	this.jump = function()
	{
		var gravVal = -20;
		if(this.isHat)
			gravVal /= 5;
		if((this.onGround && this.state != "crouching"))
		{
			if(this.state != "clinging")
			{
				if(this.stackCount == 0)
				{
					this.grav = gravVal;
					this.y--;
				}else{
					findStackTop(this).grav = gravVal;
					findStackTop(this).y--;
					active = findStackTop(this).index - blocks.length;
					findStackTop(this).unstack();
				}
			}else{
				this.grav = -23;
				this.y += this.grav;
				this.xGrav = 23 * this.clingDir;
				this.spinning = true;
			}
		}
	}

	this.move = function(amnt)
	{
		var val = amnt;
		if(this.isHat)
			val /= 3;
		if(this.state == "clinging")
			return;
		if(this.state != "crouching")
		{
			this.x += val;
			moveStack(this, val);
		}else if(this.state == "crouching"){
			this.crouch(val);
		}
	}

	this.crouch = function(leftStick)
	{
		if(this.isHat)
			return;
		if(this.onBlock == -1)
			return;
		var block = blocks[this.onBlock];
		if((block.isLeftCorner() || block.isRightCorner()) && this.stackCount == 0 && !this.stacked)
		{
			this.width = 150;
			this.height = 75;
			this.y = block.y - this.height/2;

			if(leftStick > 0 && block.isRightCorner()){
				this.x = block.x + block.width/2;
				this.dir = -1;
			}
			if(leftStick < 0 && block.isLeftCorner()){
				this.x = block.x - block.width/2;
				this.dir = 1;
			}
			if(leftStick < 0.1 && block.isLeftCorner() && block.isRightCorner() && this.state!="crouching")
			{
				this.x = block.x + this.dir * block.width/2;
				this.dir *= -1;
			}
			this.state = "crouching";
			this.pic.src = "../assets/crouch.png";
		}
	}

	this.uncrouch = function(){
		console.log("uncrouch");
		this.state = "idle";
		this.width = 75;
		this.height = 150;
		this.y -= this.width/2;
		this.x += this.width/2 * (this.dir);
		this.dir *= -1;
		this.pic.src = "../assets/bear.png";
	}

	this.checkCollision = function(obj)
	{
		//Stacking feature

		if(Math.abs(obj.x - this.x) < this.width/2 + obj.width/2 - 15 && this.stackCount == 0 && obj.y + obj.height/2 > this.y-this.height/2 && obj.y < this.y && !obj.stacked && this.state!="crouching" && !(obj.state=="crouching" || obj.state == "clinging"))
		{
			obj.stacked = true;
			obj.xGrav = 0;
			var floorDiff = (obj.floor - (this.y - this.height/2));
			setStackFloor(-floorDiff, obj);
			obj.x = this.x;
			obj.y = this.y - this.height/2 - obj.height/2;
			obj.onGround = true;
			obj.state = "idle";
			obj.grav = 0;
			this.stackChild = obj;
			obj.stackParent = this;
			if(this.stacked)
				active = findStackRoot(this).index - blocks.length;
			else
				active = this.index - blocks.length;

			for(i = 0; i<=obj.stackCount; i++)
				addStackCounts(this);
			return;
		}else if(Math.abs(obj.x-this.x)<this.width/2+obj.width/2&&obj.y+obj.height/2<=this.y - this.height/2&&obj.floor>=this.y - this.height/2&&obj.onBlock!=this.index&&!obj.stacked && this.state == "crouching" && obj.state != "clinging")
		{
			obj.floor = this.y-this.height/2;
			obj.onBlock = this.index;
		}
		
		if(Math.abs(obj.x-this.x)>=this.width/2+obj.width/2&&obj.onBlock==this.index && !obj.stacked)
		{
			var floorDiff = defaultFloor - obj.floor;
			setStackFloor(floorDiff, obj);
			obj.onBlock = -1;
		}

		//Cling when crouching
		if(Math.abs(obj.x - this.x) < this.width/2 + obj.width/2 && this.state == "crouching" && obj.y - obj.height/2 < this.y + this.height/2 && obj.y > this.y && !obj.stacked && obj.state != "clinging" && obj.grav <= 0)
		{
			//Make sure the crouching bear is facing the right direction
			if((this.dir == -1 && obj.x - obj.width/2 >= this.x)||(this.dir == 1 && obj.x + obj.width/2 <= this.x))
			{
				obj.state = "clinging";
				obj.x = this.x + (-this.dir * this.width/4);
				obj.y = this.y + this.height/2 + obj.height/2 - 10;
				obj.grav = 0;
				obj.floor = obj.y + obj.height/2;
				obj.clingDir = this.dir;
			}
		}

		if(obj.x < this.x && obj.x + obj.width/2 > this.x-this.width/2 && Math.abs(obj.y-this.y) < obj.height/2 + this.height/2 - 5 && obj.state != "clinging")
		{
			setStackX(this.x-this.width/2-obj.width/2, obj, true);
			setStackX(this.x-this.width/2-obj.width/2, obj, false);
		}

		if(obj.x > this.x && obj.x - obj.width/2 < this.x+this.width/2 && Math.abs(obj.y-this.y) < obj.height/2 + this.height/2 - 5 && obj.state != "clinging")
		{
			setStackX(this.x+this.width/2+obj.width/2, obj, true);
			setStackX(this.x+this.width/2+obj.width/2, obj, false);
		}
	}

	this.unstack = function()
	{
		this.stacked = false;
		this.floor = defaultFloor;
		this.stackParent.stackChild = null;
		this.onGround = false;
		removeStackCounts(this.stackParent);
		this.stackParent = null;
	}

	this.toHat = function()
	{
		this.isHat = true;
		this.y -= 50;
		this.height = 37;
		this.pic.src = "../assets/hat.png";
	}

	this.toBear = function()
	{
		this.isHat = false;
		this.y -= 50;
		this.height = 150;
		this.pic.src = "../assets/bear.png";
	}
}
function moveStack(root, amnt)
{
	if(amnt < 0)
			root.dir = -1;
		else if (amnt > 0)
			root.dir = 1;

	if(root.stackCount > 0){
		root.stackChild.x += amnt;
		moveStack(root.stackChild, amnt);
	}
}
function addStackCounts(child)
{
	child.stackCount++;
	if(child.stacked)
		addStackCounts(child.stackParent);
}
function removeStackCounts(child)
{
	child.stackCount--;
	if(child.stacked)
		removeStackCounts(child.stackParent);
}
function findStackRoot(child)
{
	if(!child.stacked)
		return child;
	else
		return findStackRoot(child.stackParent);
}
function findStackTop(root)
{
	if(root.stackCount == 0)
		return root;
	else
		return findStackTop(root.stackChild);
}

function setStackX (amnt, obj, updown)
	{
		obj.x = amnt;
		if(obj.stackCount > 0 && updown){
			setStackX(amnt, obj.stackChild, true);
		}
		if(obj.stacked && !updown)
			setStackX(amnt, obj.stackParent, false);
	}

function setStackFloor (amnt, obj)
{
	obj.floor += amnt;
	if(obj.stackCount > 0)
		setStackFloor(amnt, obj.stackChild);
}