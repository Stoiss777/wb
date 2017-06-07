// bootstrap

document.getElementById('frm').onsubmit = function()
{
    let squares_number    = parseInt(document.getElementById('squares_number').value);
    let square_length     = parseInt(document.getElementById('square_length').value);
    let square_min_length = parseInt(document.getElementById('square_min_length').value);
    
    if (!(squares_number >= 1 && square_length >= 2 && square_min_length >= 2))
    {
        alert('Введите правильные числа');

        return false;
    }
    
    if (square_length <= square_min_length)
    {
        alert('Начальный размер должен быть меньше минимального');

        return false;
    }
    
    game = new Game(squares_number, square_length, square_min_length);
    
    return false;
}
