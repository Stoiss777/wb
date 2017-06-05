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
            + ',menubar=no,scrollbars=no'
            + ',width=' + window.screen.availWidth
            + ',height=' + window.screen.availHeight
    );
    
    /**
     * Останавливает игру
     * 
     */
    
    var stop = function()
    {
        clearInterval(jobInterval);
        squares = [];

        if (startInterval)
            clearInterval(startInterval);
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

        if (square.x + square.length >= board.document.body.clientWidth - 1)
            return RIGHT;

        if (square.y + square.length >= board.document.body.clientHeight - 1)
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
        if ((x < 0) || (x + length > board.document.body.clientWidth - 1))
            return false;

        if ((y < 0) || (y + length >= board.document.body.clientHeight - 1))
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
     * @param int board_width   ширина игрового поля
     * @param int board_height  высота игрового поля
     */
    
    var start = function(board_width, board_height)
    {
        let board_top    = 0;
        let board_left   = 0;
        let board_bottom = board_height - square_length - 1;
        let board_right  = board_width - square_length - 1;

        for (let i = 0; i < squares_number; i++)
        {
            let angle = getRandomAngle();
            let speed = getRandomSpeed();

            let x = 0;
            let y = 0;

            for (let j = 0; j < 100; j++)
            {
                x = Math.round(Math.random() * (board_right - board_left) + board_left);
                y = Math.round(Math.random() * (board_bottom - board_top) + board_top);
                
                // - 20 свобоное место вокруг квадрата
                if (checkSpace(x - 20, y - 20, square_length + 40))
                {
                    let square = new Square(board);
                    square.show(x, y, square_length);
                    square.move(angle, speed);
                    squares.push(square);

                    break;
                }
            }
        }
        
        if (squares.length != squares_number)
        {
            stop();
            board.close();
            alert('Не хватает места на игровом поле');
        }
    };


    /**
     * Chrome может несолько раз изменить размер окна при открытии
     * если окно больше максимально возможного размера, поэтому
     * такой трюк здесь
     * 
     * @type int
     */

    var startCounter = 0;

    var startInterval = setInterval(
        function()
        {
            let board_width  = 0;
            let board_height = 0;
            
            if (startCounter++ >= 15)
            {
                board_width  = board.document.body.clientWidth 
                    ? board.document.body.clientWidth 
                    : window.screen.availWidth
                ;

                board_height = board.document.body.clientHeight 
                    ? board.document.body.clientHeight 
                    : window.screen.availHeight
                ;
            }
                
            if (board.document.body.clientHeight && board.document.body.clientHeight < window.screen.availHeight)
            {
                board_width  = board.document.body.clientWidth;
                board_height = board.document.body.clientHeight;
            }
    
    
            if (board_width && board_height) 
            {
                clearInterval(startInterval);
                start(board_width, board_height);
            }
        },
        100
    );
    
    
    /**
     * Общет движений и столкновений
     * 
     */

    jobInterval = setInterval(
        function()
        {
            if (!board)
                return;
            
            let clash = 1;
  
            while (clash)
            {
                clash = 0;
                
                clash_proccess:
                {
                    for (let i = 0; i < squares.length; i++)
                    {
                        for (let j = 0; j < squares.length; j++)
                        {
                            if (i == j)
                                continue;
                            
                            clash = intersection(squares[i], squares[j].x, squares[j].y, squares[j].length);
                            
                            if (clash)
                            {
                                let sqrs = [];

                                let length1 = Math.floor(squares[i].length / 2);
                                let length2 = Math.floor(squares[j].length / 2);
                                
                                if (clash == TOP)
                                {
                                    let middle = squares[i].y;
                                    
                                    sqrs.push(
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (260 - 190) + 190),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      squares[i].x - 1,
                                            y:      middle + 1
                                        },
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (350 - 280) + 280),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      (squares[i].x + squares[i].length - 1) - length1,
                                            y:      middle + 1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (170 - 100) + 100),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      squares[j].x - 1,
                                            y:      middle - length2 - 1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (80 - 10) + 10),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      (squares[j].x + squares[j].length - 1) - length2,
                                            y:      middle - length2 - 1
                                        }
                                    );
                                }
                                else if (clash == BOTTOM)
                                {
                                    let middle = squares[j].y;
                                    
                                    sqrs.push(
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (170 - 100) + 100),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      squares[i].x - 1,
                                            y:      middle - length1 - 1
                                        },
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (80 - 10) + 10),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      (squares[i].x + squares[i].length - 1) - length1,
                                            y:      middle - length1 - 1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (260 - 190) + 190),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      squares[j].x - 1,
                                            y:      middle + 1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (350 - 280) + 280),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      (squares[j].x + squares[j].length - 1) - length2,
                                            y:      middle + 1
                                        }
                                    );
                                }
                                else if (clash == RIGHT)
                                {
                                    let middle = squares[j].x;
                                    
                                    sqrs.push(
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (170 - 100) + 100),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      middle - length1 - 1,
                                            y:      squares[i].y - 1
                                        },
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (260 - 190) + 190),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      middle - length1 - 1,
                                            y:      (squares[i].y + squares[i].length - 1) - length1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (80 - 10) + 10),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      middle + 1,
                                            y:      squares[j].y - 1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (350 - 280) + 280),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      middle + 1,
                                            y:      (squares[j].y + squares[j].length - 1) - length2
                                        }
                                    );
                                }
                                else if (clash == LEFT)
                                {
                                    let middle = squares[i].x;
                                    
                                    sqrs.push(
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (80 - 10) + 10),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      middle + 1,
                                            y:      squares[i].y - 1
                                        },
                                        {
                                            length: length1,
                                            angle:  Math.round(Math.random() * (350 - 280) + 280),
                                            speed:  Math.floor(squares[i].speed * 1.5),
                                            x:      middle + 1,
                                            y:      (squares[i].y + squares[i].length - 1) - length1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (170 - 100) + 100),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      middle - length2 - 1,
                                            y:      squares[j].y - 1
                                        },
                                        {
                                            length: length2,
                                            angle:  Math.round(Math.random() * (260 - 190) + 190),
                                            speed:  Math.floor(squares[j].speed * 1.5),
                                            x:      middle - length2 - 1,
                                            y:      (squares[j].y + squares[j].length - 1) - length2
                                        }
                                    );
                                }

                                squares[i].hide();
                                squares[j].hide();

                                squares.splice(i, 1);
                                squares.splice((j > i) ? j - 1: j, 1);

                                for (let i = 0; i < sqrs.length; i++)
                                {
                                    if (sqrs[i].length >= square_min_length)
                                    {
                                        let sqr = new Square(board);
                                        sqr.show(sqrs[i].x, sqrs[i].y, sqrs[i].length);
                                        sqr.move(sqrs[i].angle, sqrs[i].speed);
                                        squares.push(sqr);
                                    }
                                }

                                break clash_proccess;
                            }
                        }
                    }
                }
            }
            
            for (var i = 0; i < squares.length; i++)
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
                
                squares[i].run(FPS);
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
                let square = new Square(board);
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
        'unload',
        function()
        {
            clearInterval(jobInterval);
            squares = [];
            
            if (startInterval)
                clearInterval(startInterval);
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
        }
    );
    
}