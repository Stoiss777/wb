// Square object

function Square(board, fps)
{
    this.div     = null;
    this.x       = 0;
    this.y       = 0;
    this.xf      = 0;
    this.yf      = 0;
    this.length  = 0;
    this.angle   = -1;
    this.speed   = 0;
    
    this.clash_side = 0;
    
    this.step_x = 0;
    this.step_y = 0;
    
    this.moved = false;
    
    function createSquare(length)
    {
        div = board.document.createElement('div');
        
        div.style.position        = 'absolute';
        div.style.backgroundColor = 'black';
        div.style.width           = length + 'px';
        div.style.height          = length + 'px';
		
		return div;
    }
    
    function moveTo(div, x, y)
    {
        div.style.left = x + 'px';
        div.style.top  = y + 'px';
    }
    
    this.show = function(x, y, length)
    {
        this.div = createSquare(length);
        
        moveTo(this.div, x, y);

		board.document.body.appendChild(this.div);

        this.length = length;
        this.x      = x;
        this.xf     = x;
        this.y      = y;
        this.yf     = y;
    }
    
    this.hide = function()
    {
		board.document.body.removeChild(this.div);
        
        this.div = null;
    }
    
    this.move = function(angle, speed)
    {
        this.angle   = angle;
        this.speed   = speed;
        
        this.xf = this.x;
        this.yf = this.y;
        
        this.step_x = Math.cos(angle * (Math.PI / 180)) * this.speed / fps;
        this.step_y = Math.sin(angle * (Math.PI / 180)) * this.speed / fps;
    }
    
    this.run = function(board_width, board_height)
    {
        this.moved = false;
        
        this.xf += this.step_x;
        this.yf -= this.step_y;

        if (this.xf + this.length >= board_width)
            this.xf = board_width - this.length - 1;

        if (this.yf + this.length >= board_height)
            this.yf = board_height - this.length - 1;
        
        let x = Math.round(this.xf);
        let y = Math.round(this.yf);
        
        if (this.x != x || this.y != y)
        {
            this.moved = true;
            
            this.x = x;
            this.y = y;
            
            moveTo(this.div, x, y, board_width);
        }
    }
}