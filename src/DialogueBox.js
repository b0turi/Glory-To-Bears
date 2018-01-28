function DialogueBox(x,y)
{
	this.x = x;
	this.y = y;
	this.lines = [];
	this.portraits = [];

	this.width = screenWH;
	this.height = screenHH/3;
	this.visible = true;
	this.padding = 35;

	this.text = "";
	this.text2 = "";
	this.text3 = "";

	this.bgImg = new Image();
	this.bgImg.src = "../assets/dialogue.png";

	this.animLength = 0;
	this.animCount = 0;
	this.animStarted = false;
	this.animTimer = 5;
	this.animDone = false;

	this.general = images[19];
	this.generalOffset = 295;
	this.generalHeight = 265;
	this.generalCount = 0;
	this.generalLength = 19;
	this.generalAnimTimer = 5;
	this.done = false;

	this.draw = function()
	{
		if(this.visible)
		{
			graphics.drawImage(this.bgImg, this.x, this.y, this.width, this.height);
			graphics.font = "30pt TitleFont";
			graphics.shadowOffsetY = 5;
			graphics.shadowColor = "#151712";
			graphics.fillStyle = "#849254";
			graphics.fillText(this.text, this.x + this.padding, this.y + this.padding + 26);
			graphics.fillText(this.text2, this.x + this.padding, this.y + this.padding + 66);
			graphics.fillText(this.text3, this.x + this.padding, this.y + this.padding + 106);
			graphics.shadowOffsetY = 0;

			graphics.drawImage(this.general, this.generalOffset * this.generalCount, 0, this.generalOffset, this.generalHeight, this.x + this.width - 130, this.y + 40, 90, 90);
			this.generalAnimTimer--;
			if(this.generalAnimTimer == 0){
				this.generalAnimTimer = 5;
				this.generalCount++;
			}
			if(this.generalCount == this.generalLength)
				this.generalCount = 0;
		}
	}

	this.addLine = function(str1, str2, str3,pIndex)
	{
		this.lines.push(str1);
		this.lines.push(str2);
		this.lines.push(str3);
		this.portraits.push(pIndex);
	}
	this.advance = function(){
		if(!this.animDone) {
			this.animCount = this.animLength;
			this.text = this.lines[0];
			this.text2 = this.lines[1];
			this.text3 = this.lines[2];
			this.animDone = true;
		}else{
			this.text = "";
			this.text2 = "";
			this.text3 = "";
			this.lines.shift();
			this.lines.shift();
			this.lines.shift();
			this.animStarted = false;
			if(this.lines.length == 0)
				this.done = true;
		}
	}
	this.update = function()
	{
		if (this.lines.length > 0)
		{
			this.visible = true;
			if(!this.animStarted)
			{
				this.animLength = this.lines[0].length + this.lines[1].length + this.lines[2].length;
				this.animCount = 0;
				this.animStarted = true;
				this.animDone = false;
			} else if (this.animCount <= this.lines[0].length)
			{
				this.text = this.lines[0].substring(0, this.animCount);
				if(this.animCount < this.animLength && this.animTimer == 0)
				{
					this.animTimer = 3;
					this.animCount++;
				}else if (this.animTimer > 0)
					this.animTimer--;
			}else if (this.animCount <= this.lines[0].length + this.lines[1].length)
			{
				this.text2 = this.lines[1].substring(0, this.animCount - this.lines[0].length);
				if(this.animCount < this.animLength && this.animTimer == 0)
				{
					this.animTimer = 3;
					this.animCount++;
				}else if (this.animTimer > 0)
					this.animTimer--;
			}else if (this.animCount <= this.lines[0].length + this.lines[1].length + this.lines[2].length)
			{
				this.text3 = this.lines[2].substring(0, this.animCount - this.lines[0].length - this.lines[1].length);
				if(this.animCount < this.animLength && this.animTimer == 0)
				{
					this.animTimer = 3;
					this.animCount++;
				}else if (this.animTimer > 0)
					this.animTimer--;
			}
			if(this.lines[0] == this.text && this.lines[1] == this.text2 && this.lines[2] == this.text3)
				this.animDone = true;
		}else{
			this.visible = false;
		}
	}
}