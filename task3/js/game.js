// Game object

/**
 * Класс управлюящий игрой
 * 
 * @param int squares_number      начальное количество квадратов
 * @param int square_length       начальный размер стороны (в пикселях)
 * @param int square_min_length   минимальный размер стороны (в пикселях)
 */

function Game(squares_number, square_length, square_min_length)
{
    /**
     * Константы стороны
     * 
     * @type Number
     */

    const TOP = 1, RIGHT = 2, BOTTOM = 3, LEFT = 4;
    
    /**
     * Количество обработок в секунду
     * (чем медленее компьютер и больше квадратов - тем больше может тормозить :)
     * 
     * @type Number
     */
    
    const FPS = 25;
    
    /**
     * Ссылка на интервал обработки кадров
     * 
     * @type object
     */
    
    var jobInterval = null;
    
    /**
     * Массив текущих объектов с квадратами
     * 
     * @type Array
     */
    
    var squares = [];

    /**
     * Окно с игрой
     * 
     * @type Window
     */

    var board = window.open(
        '', 
        '_blank', 
        'directories=no,titlebar=no,toolbar=no,location=no,status=no'
            + ',menubar=no,scrollbars=no,resizable=yes,left=0,top=0'
            + ',width=' + window.screen.availWidth
            + ',height=' + window.screen.availHeight
    );
    
    /**
     * Ширина окна с игрой
     * 
     */
    
    var board_width = 0;

    /**
     * Высота окна с игрой
     * 
     */
    
    var board_height = 0;
    
    /**
     * Останавливает игру
     * 
     */
    
    var stop = function()
    {
        clearInterval(jobInterval);
        board = null;
        squares = [];
    };
    
    /**
     * Есть ли пересечения двух квадратов
     * 
     * @param object square  существующий объект квардрата
     * @param int x          точка x предполагаемого квадрата
     * @param int y          точка y предполагаемого квадрата
     * @param int length     длина стороны предполагаемого квадрата
     * @returns int          номер стороны совпадения
     */

    var intersection = function(square, x, y, length)
    {
        let r1 = x + length - 1;
        let b1 = y + length - 1;
        let r2 = square.x + square.length - 1;
        let b2 = square.y + square.length - 1;
        
        if ((x < r2) && (r1 > square.x) && (b1 > square.y) && (y < b2))
        {
            let ws = (square.x <= x) 
                ? x - square.x + length
                : square.x - x + square.length
            ;
            
            let hs = (square.y <= y)
                ? y - square.y + length
                : square.y - y + square.length
            ;
            
            if (ws < hs)
            {
                return (square.y <= y) ? BOTTOM : TOP;
            }
            else
            {
                return (square.x <= x) ? RIGHT : LEFT;
            }
        }

        return 0;
    };
    
    /**
     * Произвольный угол
     * 
     * @returns int
     */
    
    var getRandomAngle = function()
    {
        return Math.round(Math.random() * 360);
    };

    /**
     * Произвольная скорость
     * 
     * @returns int
     */
    
    var getRandomSpeed = function()
    {
        return Math.round(Math.random() * (100 - 30) + 30);
    };
    
    /**
     * Проверяет попадание кварата на границы экрана
     * 
     * @param   object square  тестируемый квадрат
     * @returns int            сторона совпадения
     */
    
    var checkBorders = function(square)
    {
        if (square.y <= 0)
            return TOP;

        if (square.x + square.length >= board_width - 1)
            return RIGHT;

        if (square.y + square.length >= board_height - 1)
            return BOTTOM;
        
        if (square.x <= 0)
            return LEFT;
        
        return 0;
    };

    /**
     * Проверяет можно ли нарисовать квадрат по заданным координатам
     * 
     * @param int x
     * @param int y
     * @param int length
     * @returns bool
     */

    var checkSpace = function(x, y, length)
    {
        if ((x < 0) || (x + length > board_width - 1))
            return false;

        if ((y < 0) || (y + length >= board_height - 1))
            return false;

        for (let i = 0; i < squares.length; i++)
        {
            if (intersection(squares[i], x, y, length))
                return false;
        }
        
        return true;
    };
    
    /**
     * Начинает игру
     * 
     */
    
    var start = function()
    {
        let board_top    = 0;
        let board_left   = 0;
        let board_bottom = board.document.body.offsetHeight - square_length - 1;
        let board_right  = board.document.body.offsetWidth - square_length - 1;

        for (let i = 0; i < squares_number; i++)
        {
            let angle = getRandomAngle();
            let speed = getRandomSpeed();

            let x = 0;
            let y = 0;

            for (let j = 0; j < 50; j++)
            {
                x = Math.round(Math.random() * (board_right - board_left) + board_left);
                y = Math.round(Math.random() * (board_bottom - board_top) + board_top);
                
                // - 20 свобоное место вокруг квадрата
                if (checkSpace(x - 20, y - 20, square_length + 40))
                {
                    let square = new Square(board, FPS);
                    square.show(x, y, square_length);
                    square.move(angle, speed);
                    squares.push(square);

                    break;
                }
            }
        }
        
        if (squares.length != squares_number)
        {
            alert('Не хватает места на игровом поле');
            board.close();
        }
    };
    
    /**
     * Разбивает квадрат на два
     * 
     * @param int idx  индекс элемента в squares
     */
    
    var clash = function(idx)
    {
        let length = Math.floor(squares[idx].length / 2);
        let speed  = Math.floor(squares[idx].speed * 1.2)
        let sqrs   = [];

        if (squares[idx].clash_side == TOP)
        {
            sqrs.push(
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (260 - 190) + 190),
                    x:      squares[idx].x - 1,
                    y:      squares[idx].y + 1
                },
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (350 - 280) + 280),
                    x:      (squares[idx].x + squares[idx].length - 1) - length,
                    y:      squares[idx].y + 1
                }
            );
        }
        else if (squares[idx].clash_side == BOTTOM)
        {
            sqrs.push(
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (170 - 100) + 100),
                    x:      squares[idx].x - 1,
                    y:      squares[idx].y + length - 1
                },
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (80 - 10) + 10),
                    x:      (squares[idx].x + squares[idx].length - 1) - length,
                    y:      squares[idx].y + length - 1
                }
            );
        }
        else if (squares[idx].clash_side == RIGHT)
        {
            sqrs.push(
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (170 - 100) + 100),
                    x:      squares[idx].x + length - 1,
                    y:      squares[idx].y - 1
                },
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (260 - 190) + 190),
                    x:      squares[idx].x + length - 1,
                    y:      (squares[idx].y + squares[idx].length - 1) - length
                }
            );
        }
        else if (squares[idx].clash_side == LEFT)
        {
            sqrs.push(
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (80 - 10) + 10),
                    x:      squares[idx].x + 1,
                    y:      squares[idx].y - 1
                },
                {
                    length: length,
                    speed:  speed,
                    angle:  Math.round(Math.random() * (350 - 280) + 280),
                    x:      squares[idx].x + 1,
                    y:      (squares[idx].y + squares[idx].length - 1) - length
                }
            );
        }

        squares[idx].hide();

        squares.splice(idx, 1);

        if (length >= square_min_length)
        {
            for (let i = 0; i < sqrs.length; i++)
            {
                let sqr = new Square(board, FPS);
                sqr.show(sqrs[i].x, sqrs[i].y, sqrs[i].length);
                sqr.move(sqrs[i].angle, sqrs[i].speed);
                squares.push(sqr);
            }
        }

    };


	/**
	 * Запускаем игру
	 *
	 */
	
    if (board.document.body.clientHeight)
    {
        board_width  = board.document.body.clientWidth;
        board_height = board.document.body.clientHeight;
        
        start();
    }

    /**
     * Общет движений и столкновений
     * 
     */

    jobInterval = setInterval(
        function()
        {
            if (!board)
                return;
            
            let clashes = [];

            for (var i = 0; i < squares.length; i++)
            {
                if (squares[i].moved && !squares[i].clash_side)
                {

                    let border_clash = checkBorders(squares[i]);

                    if (border_clash == TOP)
                        squares[i].move(Math.round(Math.random() * (350 - 190) + 190), squares[i].speed);

                    if (border_clash == RIGHT)
                        squares[i].move(Math.round(Math.random() * (260 - 80) + 80), squares[i].speed);

                    if (border_clash == BOTTOM)
                        squares[i].move(Math.round(Math.random() * (170 - 10) + 10), squares[i].speed);

                    if (border_clash == LEFT)
                        squares[i].move((Math.round(Math.random() * (260 - 100) + 100) + 180) % 360, squares[i].speed);

                    for (let j = i + 1; j < squares.length; j++)
                    {
                        let clash_side = intersection(squares[i], squares[j].x, squares[j].y, squares[j].length);

                        if (clash_side)
                        {
                            squares[i].clash_side = clash_side;
                            squares[j].clash_side = (clash_side + 2 > 4) ? clash_side - 2 : clash_side + 2;

                            clashes.push(i, j);

                            break;
                        }
                    }
                }


                if (!squares[i].clash_side)
                    squares[i].run(board_width, board_height);
            }

            if (clashes.length)
            {
                clashes = clashes.sort(
                    function(a, b) 
                    {
                        return a - b;
                    }
                );

                for (let i = clashes.length - 1; i >= 0; i--)
                    clash(clashes[i]);
            }
                
        },
        1000 / FPS
    );
    
    
    /**
     * Добавление квадрата при клике мышкой
     * 
     */
    
    board.document.addEventListener(
        'click',
        function(e)
        {
            let length = square_length;
            let x      = e.clientX - Math.round(length / 2);
            let y      = e.clientY - Math.round(length / 2);
            let angle  = getRandomAngle();
            let speed  = getRandomSpeed();
        
            // - 20 свобоное место вокруг квадрата
            if (checkSpace(x - 20, y - 20, length + 40))
            {
                let square = new Square(board, FPS);
                square.show(x, y, length);
                square.move(angle, speed);
                squares.push(square);
            }
        }
    );

    /**
     * При закрытии окна игры все сбрасываем
     * 
     */
    
    board.addEventListener(
        'beforeunload',
        function()
        {
            stop();
        }
    );

    /**
     * При изменени размера окна, все что не влезло в новый размер удаляется
     * 
     */
    
    board.addEventListener(
        'resize',
        function()
        {
            if (board_width && board_height)
            {
                let list = [];

                for (let i = 0; i < squares.length; i++)
                {
                    if (checkBorders(squares[i]))
                    {
                        squares[i].hide();
                        list.push(i);
                    }
                }

                for (let i = list.length - 1; i >= 0; i--)
                    squares.splice(list[i], 1);
                
                board_width  = board.document.body.clientWidth;
                board_height = board.document.body.clientHeight;
            }
            else 
			{
                board_width  = board.document.body.clientWidth;
                board_height = board.document.body.clientHeight;
                
                start();
            }
        }
    );
    
}