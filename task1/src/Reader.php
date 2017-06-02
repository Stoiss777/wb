<?php

class Reader
{
    /**
     * Размер буфера чтения файла по умолчинию
     */

    const DEFAULT_BUFFER_SIZE = 10240;

    /**
     * Указатель на обрабатываемый файл
     *
     * @var resource
     */

    private $fp = null;

    /**
     * Буффер слов прочитанных на текущем отрезке файла
     *
     * @var array
     */

    private $buffer = array();

    /**
     * Признак конца файла
     *
     * @var boolean
     */

    private $eof = false;

    /**
     * Необработанный кусок конца строки при предыдущем чтении из файла
     *
     * @var string
     */

    private $last_piece = '';

    /**
     * Количество прочитанных байт
     *
     * @var int
     */

    private $bytes_readed = 0;


    /**
     * Конструктор
     *
     * @param string $filename
     */

    public function __construct($filename)
    {
        $this->fp = fopen($filename, 'r');

        if (!$this->fp)
            throw new Exception('Cannot read ' . $filename);
    }

    /**
     * Возвращает очередное слово из файла
     *
     * @return string
     */

    public function getWord()
    {
        if ($this->buffer)
        {
            $word = array_shift($this->buffer);

            return ($word == '') ? $this->getWord() : $word;
        }

        if ($this->eof)
            return false;

        $this->readData();

        return $this->getWord();
    }

    /**
     * Сколько байтов прочитали на данный момент
     *
     * @return int
     */

    public function getBytesReaded()
    {
        return $this->bytes_readed;
    }

    /**
     * Читает порцию данных из текстового utf-8 файла
     *
     * @param int $buffer_size
     */

    private function readData($buffer_size = self::DEFAULT_BUFFER_SIZE)
    {
        $data = fread($this->fp, $buffer_size);

        $this->eof = (strlen($data) != $buffer_size);

        if ($data == '')
            return;

        // если порезали многобайтный utf-8 символ,
        // то обрабатываемую строку сдвигаем влево,
        // а порезанный символ сохраняем для следующего чтения
        for ($i=strlen($data) - 1; $i>=0; $i--)
        {
            if (ord($data{$i}) <= 0x7F) break;
        }

        if (!$i)
            throw new Exception('This file is not a correct text file');

        $text = mb_strtolower($this->last_piece . substr($data, 0, $i + 1));

        // нужно учесть что апостраф могут использовать вместо кавычек
        preg_match_all(
            '/(?:[a-zA-Zа-яА-ЯёЁ]|(?<=[a-zA-Zа-яА-ЯёЁ])\'(?=[a-zA-Zа-яА-ЯёЁ]))+/u',
            $text,
            $result
        );

        $this->buffer = $result[0];

        // последнее слово тоже переносим до следующего чтения, т.к. оно наверняка
        // было порезано где-то посередине
        $this->last_piece = array_pop($this->buffer) . substr($data, $i + 1);

        if (!$this->buffer)
            throw new Exception('This file is not a correct text file');

        $this->bytes_readed += $buffer_size;
    }
}
