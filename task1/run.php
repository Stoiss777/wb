<?php

require_once 'src/Reader.php';
require_once 'src/Counter.php';

if (!isset($argv[1]) && !isset($argv[2]))
    die('Syntax: php run.php source.txt out.txt' . PHP_EOL);

$nesting = isset($argv[3]) ? intval($argv[3]) : 1;
$reader  = new Reader($argv[1]);
$counter = new Counter($argv[2], $nesting);

$time  = time();
$items = 0;

while (($word = $reader->getWord()) !== false)
{
    $counter->addWord($word);

    if (++$items % 10000 == 0)
    {
        printf(
            '    %d items (%d bytes) have processed in %d seconds.' . PHP_EOL,
            $items,
            $reader->getBytesReaded(),
            time() - $time
        );
    }
}

printf(
    'The index has built with %d items in %d seconds (%d bytes/sec).' . PHP_EOL, 
    $items, 
    time() - $time,
    (int) $reader->getBytesReaded() / (time() - $time)
);

$time  = time();
$words = $counter->saveResult();

printf('The file has written with %d words in %d seconds.' . PHP_EOL, $words, time() - $time);

