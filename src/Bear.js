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

	this.mainPic = images[8];
	this.sitPic = images[9];
	this.crouchPic = images[10];
	this.clingPic = images[11];
	this.spinPic = images[12];
	this.hatPic = images[13];

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
		graphics.shadowBlur = 10;
		graphics.shadowColor = "black";
		if(!this.isHat)
		{

			if(this.state == "idle" && !this.stacked)
				graphics.drawImage(this.mainPic, 0,0, animOffset, 536, 0, 0, this.width, this.height);
			else if(this.stacked)
				graphics.drawImage(this.sitPic, 0, 0, this.width, this.height);
			else if (this.state == "walking")
				graphics.drawImage(this.mainPic, animOffset * this.currentFrame, 0, animOffset, 536, 0, 0, this.width, this.height);
			else if(this.state == "crouching")
				graphics.drawImage(this.crouchPic, 0,0, this.width, this.height);
			else if(this.state == "clinging" && this.onGround)
				graphics.drawImage(this.clingPic, 0,0, this.width, this.height);
			else if(this.state == "clinging" && !this.onGround)
				graphics.drawImage(this.spinPic, 0,0, this.width, this.height/1.5);
			else if(this.state =="idle" && !this.onGround && this.rotation != 0)
				graphics.drawImage(this.spinPic, 0,0, this.width, this.height/1.5);
		}else{
			graphics.drawImage(this.hatPic, 0,0, this.width, this.height);
		}
		graphics.shadowBlur = 0;
		graphics.restore();

		if(this.stackCount > 0)
			this.stackChild.draw();
	}

	this.update = function()
	{
		if(this.state == "walking" && active + initBlockTotal != this.index)
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
			this.rotation+= 4 * (Math.PI/180);
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
					findStackTop(this).grav = gravVal - 3;
					findStackTop(this).y--;
					findStackTop(this).onBlock = -1;
					active = findStackTop(this).index - initBlockTotal;
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

			if(block.isRightCorner() && !block.isLeftCorner()){
				this.x = block.x + block.width/2;
				this.dir = -1;
			}
			if(block.isLeftCorner()&& !block.isRightCorner()){
				this.x = block.x - block.width/2;
				this.dir = 1;
			}
			if(block.isLeftCorner() && block.isRightCorner())
			{
				if(leftStick>0)
				{
					this.x = block.x + block.width/2;
					this.dir = -1;
				}
				else{

					this.x = block.x - block.width/2;
					this.dir = 1;
				}
			}
			this.state = "crouching";
		}
	}

	this.uncrouch = function(){
		for(i = 0;i<bears.length;i++)
		{
			if(bears[i].onBlock == this.index)
				return;
		}
		this.state = "idle";
		this.width = 75;
		this.height = 150;
		this.y -= this.width/2;
		this.x += this.width/2 * (this.dir);
		this.dir *= -1;
	}
	this.checkCollision = function(obj)
	{
		//Stacking feature

		if(Math.abs(obj.x - this.x) < this.width/2 + obj.width/2 - 15 && this.stackCount == 0 && obj.y + obj.height/2 > this.y && obj.y < this.y + this.height/2 && !obj.stacked && this.state!="crouching" && !obj.isHat && !(obj.state=="crouching" || obj.state == "clinging"))
		{
			obj.stacked = true;
			obj.xGrav = 0;
			var floorDiff = (obj.floor - (this.y));
			setStackFloor(-floorDiff, obj);
			obj.x = this.x;
			obj.y = this.y - this.height/2;
			obj.onGround = true;
			obj.onBlock = this.index;
			obj.state = "idle";
			obj.grav = 0;
			this.stackChild = obj;
			obj.stackParent = this;
			obj.dir = this.dir;
			if(this.stacked)
				active = findStackRoot(this).index - initBlockTotal;
			else
				active = this.index - initBlockTotal;

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
		if(this.state != "crouching")
		{
			if(obj.x < this.x && obj.x + obj.width/2 > this.x-this.width/2 && Math.abs(obj.y-(this.y+this.height/4)) < obj.height/2 - 5 && obj.state != "clinging")
			{
				setStackX(this.x-this.width/2-obj.width/2, obj, true);
				setStackX(this.x-this.width/2-obj.width/2, obj, false);
			}

			if(obj.x > this.x && obj.x - obj.width/2 < this.x+this.width/2 && Math.abs(obj.y-(this.y+this.height/4)) < obj.height/2  - 5 && obj.state != "clinging")
			{
				setStackX(this.x+this.width/2+obj.width/2, obj, true);
				setStackX(this.x+this.width/2+obj.width/2, obj, false);
			}
		}else{
			if(obj.x < this.x && obj.x + obj.width/2 > this.x-this.width/2 && Math.abs(obj.y-(this.y-this.height/4)) < obj.height/2 - 5 && obj.state != "clinging")
			{
				setStackX(this.x-this.width/2-obj.width/2, obj, true);
				setStackX(this.x-this.width/2-obj.width/2, obj, false);
			}

			if(obj.x > this.x && obj.x - obj.width/2 < this.x+this.width/2 && Math.abs(obj.y-(this.y-this.height/4)) < obj.height/2  - 5 && obj.state != "clinging")
			{
				setStackX(this.x+this.width/2+obj.width/2, obj, true);
				setStackX(this.x+this.width/2+obj.width/2, obj, false);
			}
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
	}

	this.toBear = function()
	{
		this.isHat = false;
		this.y -= 50;
		this.height = 150;
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
function pushStackY(amnt, obj)
{
	obj.y = amnt;
	if(obj.stacked)
		pushStackY(amnt + this.height/2);
	else
		obj.grav = 0;
}
function setStackFloor (amnt, obj)
{
	obj.floor += amnt;
	if(obj.stackCount > 0)
		setStackFloor(amnt, obj.stackChild);
}