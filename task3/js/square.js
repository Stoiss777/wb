// Square object

function Square(board)
{
    this.div     = null;
    this.x       = 0;
    this.y       = 0;
    this.xf      = 0;
    this.yf      = 0;
    this.length  = 0;
    this.angle   = -1;
    this.radians = 0;
    this.speed   = 0;

    function createSquare(length)
    {
        let div = document.createElement('div');
        
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
        this.radians = angle * (Math.PI / 180);
        this.speed   = speed;
        
        this.xf = this.x;
        this.yf = this.y;
    }
    
    this.run = function(fps)
    {
        if (!this.div)
            return;
        
        this.xf += Math.cos(this.radians) * this.speed / fps;
        this.yf -= Math.sin(this.radians) * this.speed / fps;
        
        if (this.xf + this.length >= board.document.body.clientWidth)
            this.xf = board.document.body.clientWidth - this.length - 1;

        if (this.yf + this.length >= board.document.body.clientHeight)
            this.yf = board.document.body.clientHeight - this.length - 1;
        
        let x = Math.round(this.xf);
        let y = Math.round(this.yf);
        
        if (this.x != x || this.y != y)
        {
            this.x = x;
            this.y = y;
            
            moveTo(this.div, x, y);
        }
    }
}