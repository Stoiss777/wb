<?php

class Counter
{
    /**
     * Папка для кеша
     */

    const CACHE_PATH = 'cache';

    /**
     * Максимальная длина слова после которого имя файла в индексе называется
     * не самим словом, а с использованием его хеша
     */

    const WORD_LENGTH_LIMIT = 60;

    /**
     * Глубина вложенности каталогов
     *
     * @var integer
     */

    private $nesting;

    /**
     * Каталог где хранится вся структура каталогов и файлов
     *
     * @var string
     */

    private $index_path;

    /**
     * Ресурс на файл с результатом
     *
     * @var resource
     */

    private $fp;


    /**
     * Конструктор
     *
     * @param int    $filename имя файла куда будет сохранен резлультат
     * @param string $nesting  глубина вложенности каталогов
     */

    public function __construct($filename, $nesting)
    {
        if (!is_writable(self::CACHE_PATH))
            throw new Exception('It is not access to ' . self::CACHE_PATH);

        $this->index_path = self::CACHE_PATH . DIRECTORY_SEPARATOR . 'index';

        $this->fp = fopen($filename, 'w');

        if (!$this->fp)
            throw new Exception('Cannot open to write ' . $filename);

        $this->nesting = $nesting;
    }

    /**
     * Деструктор
     *
     */

    public function __destruct()
    {
        rmdir($this->index_path);
    }

    /**
     * Добавляет новое слово
     *
     * @param string $word
     */

    public function addWord($word)
    {
        $length = mb_strlen($word);

        // файловые системы имеют ограничение на длину имени, если слово
        // очень большое, то в имени файла вместо его имени используем его хеш
        if ($length > self::WORD_LENGTH_LIMIT)
        {
            $file = '0.' . md5($word) . '.idx';
        }
        else
        {
            $file = $word . '.idx';
        }

        $chars = array();
        for ($i=0; ($i<$length && $i<$this->nesting); $i++)
            $chars[] = mb_substr($word, $i, 1);

        $path      = $this->index_path . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $chars);
        $file_path = $path . DIRECTORY_SEPARATOR . $file;

        if (!is_dir($path))
            mkdir($path, 0777, true);

        file_put_contents(
            $file_path,
            $this->getIndexContent($file_path, $word)
        );
    }

    /**
     * Генерирует конечный файл из той структура, которая создавалась в addWord()
     *
     * @return int - количество неповоторяющихся слов
     */

    public function saveResult()
    {
        return $this->saveTree($this->index_path);
    }

    /**
     * Возвращает новое содержимое индексного файла
     *
     * @param string $file_path полный путь к файлу индекса
     * @param string $word      слово, которое хранит этот файл
     * @return string           контент для записи в файл
     */

    protected function getIndexContent($file_path, $word)
    {
        if (is_file($file_path))
        {
            $content = explode(': ', file_get_contents($file_path));

            return $content[0] . ': ' . ++$content[1];
        }

        return $word . ': 1';
    }

    /**
     * Читает дерево индексных файлов и сохраняет все в финальный файл результата
     *
     * @param  string $path каталог для обработки
     * @return int          количество неповоторяющихся слов
     */

    private function saveTree($path)
    {
        $counter = 0;

        if ($dh = opendir($path))
        {
            while (($filename = readdir($dh)) !== false)
            {
                if ($filename == '.' || $filename == '..')
                    continue;

                $file_path = $path . DIRECTORY_SEPARATOR . $filename;

                if (is_dir($file_path))
                {
                    $counter += $this->saveTree($file_path);

                    rmdir($file_path);
                }

                if (is_file($file_path))
                {
                    fwrite(
                        $this->fp,
                        file_get_contents($file_path) . PHP_EOL
                    );

                    unlink($file_path);

                    $counter++;
                }

            }
        }

        return $counter;
    }
}
