<?php

// includes --------------------------------------------------------------------

require_once('configuration.php');

// main script -----------------------------------------------------------------

$oldImageToDeleteName = $_POST['currentUploadedFilename'];

if ($oldImageToDeleteName) {

    $paths = Configuration::getUploadDataArray();

    foreach ($paths as $path) {

        $oldImageToDelete = $path['temp'] . $oldImageToDeleteName;

        if(file_exists($oldImageToDelete)) {
            unlink($oldImageToDelete);
        }
    }
}

/*
 * For files that contain only PHP code, the closing tag ("?>") is to be omitted.
 * It is not required by PHP, and omitting it prevents trailing whitespace from
 * being accidentally injected into the output.
 * ?>
*/
