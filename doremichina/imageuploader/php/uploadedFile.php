<?php

// includes --------------------------------------------------------------------

require_once('configuration.php');
require_once('../../class/dao.php');
/**
 * @author Alberto Moyano Sánchez, 2010
 * @version 2.3 (2011)
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */
class UploadedFile {

    // functions -----------------------------------------------------------------
    /**
     * Move the given files from the temporary directory to the uploads directory
     * with an unique, descriptive name.
     *
     * @param array $filenames
     * @param string $keywords
     * @return array $uploadFilenames
     *
     * @uses self::moveTempFileDescriptiveName()
     */
    public static function moveTempFilesDescriptiveNames($filenames, $keywords) {

        $userExists = false;
        $uploadFilenames = array();

        $paths = Configuration::getUploadDataArray();
        
        $uid=$_COOKIE['userId'];

        $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
        mysql_select_db(DAO::DATABASE, $conn);

        $sql = "select * from user_images where id='$uid'";
    
        $result = mysql_query($sql, $conn);
        $rowNum = mysql_num_rows($result);
        
        $oldImageFiles = array();
        
        if ($rowNum > 0) {
            $userExists = true;
            $row = mysql_fetch_assoc($result);
            $oldImageFiles[] = $row['image1'];
            $oldImageFiles[] = $row['image2'];
            
        }

        $count = 0;
        foreach($filenames as $filename) {
            if ($filename) {
                $uploadFilenames[] = self::moveTempFileDescriptiveName($paths, $filename, $keywords);
                
                if ($count < count($oldImageFiles)) {
                    self::removeUploadedImage($oldImageFiles[$count]);
                }
                $count++;
            }
        }
        
        if ($userExists) {
            $sql = 'update user_images set ';
            $count = 1;
            $total = count($uploadFilenames);
            foreach($uploadFilenames as $name){
                $sql = $sql . "image" . $count . "='" . $name . "' ";

                if($count<$total) {
                    $sql = $sql . ",";
                }
                ++$count;
            }
            
            $sql = $sql . " where id='$uid'";
        } else {
            $sql = "insert into user_images values ('$uid', ";
            $count = 1;
            $total = count($uploadFilenames);
            foreach($uploadFilenames as $name){
                $sql = $sql . "'$name'";

                if($count<$total) {
                    $sql = $sql . ",";
                }
                ++$count;
            }
            $sql = $sql . ")";
            
        }
        mysql_query($sql, $conn);
         
        mysql_close($conn);
        
        return $uploadFilenames;
    }

    public static function removeUploadedImage($filename) {
        $imageFile = Configuration::getUploadPath("medium", "target") . $filename;
        $thumbFile = Configuration::getUploadPath("thumb", "target") . $filename;

        if(file_exists($imageFile)) {
            unlink($imageFile);
        }
        if(file_exists($thumbFile)) {
            unlink($thumbFile);
        }
    
    }

    // ---------------------------------------------------------------------------
    /**
     * Move a given file from the temporary directory to the uploads directory
     * with an unique, descriptive name.
     *
     * @param array &$paths. The different paths where the files must be uploaded.
     *                       It is passed by reference, so the array is not created
     *                       again. Must have next structure:
     * array(
     *    'pathname1' => array(
     *        'temp' => 'temp/path1',
     *        'target' => 'target/path1',
     *    ),
     *    'pathname2' => array(
     *        'temp' => 'temp/path2',
     *        'target' => 'target/path2',
     *    ),
     * )
     * @param string $tempFilename
     * @param string $keywords
     * @return string $probablyUniqueFilename
     *
     * @uses self::getDescriptiveUniqueFilename()
     */
    public static function moveTempFileDescriptiveName(&$paths, $tempFilename, $keywords) {

        $probablyUniqueFilename = '';

        if ($tempFilename) {

            $tempFilesOk = true;

            foreach ($paths as $path) {
                if ( ! file_exists($path['temp'] . $tempFilename)) {
                    $tempFilesOk = false;
                }
            }

            if ($tempFilesOk) {

                // in order to get a unique name, a target path is given, so
                // that it can be checked the existing filenames. It is
                // supposed that the same filenames will be in the different
                // paths (large, medium, thumb, etc.)
                $probablyUniqueFilename = self::getDescriptiveUniqueFilename(
                        $keywords, $paths[0]['target'], $tempFilename
                );

                foreach ($paths as $path) {
                    
                    if ($probablyUniqueFilename) {

                        if ( ! file_exists($path['target'])) {
                            mkdir($path['target'], 0777, true);
                        }

                        $targetFilePathname = $path['target'] . $probablyUniqueFilename;

                        if (file_exists($targetFilePathname)) {
                            // if the file already exists in the target path, it must be deleted
                            // or there will be an error when moving a file with the same name.
                            // All the names provided should be unique, and no file will be moved
                            // with the same name as another that already is there, but
                            // this check is performed as an extra security mechanism to avoid errors
                            unlink($targetFilePathname);
                        }

                        if ( ! rename($path['temp'] . $tempFilename, $targetFilePathname)) {
                            $probablyUniqueFilename = '';
                        }
                        
                    }
                }
            }
        }

        return $probablyUniqueFilename;
    }

    //----------------------------------------------------------------------------

    /**
     * Update an upload following the next heuristic.
     *
     Cases:
     
     1 - $tempFilename is empty

     1.1 - $dbFilename is empty
   
     There was no uploaded file, and no one has been uploaded. Nothing
     is performed.

     1.2 - $dbFilename is not empty

     There was a previously uploaded file, and it has been removed.
     The file must be deleted, and the database updated.
     
     2 - $tempFilename is not empty

     2.1 - $dbFilename is empty

     There was no uploaded file, and one has been uploaded.
     It must be assigned a descriptive name to the file, the file must
     be moved from the temporary directory to the uploads directory,
     and the database must be updated with the new name.

     2.2 - $dbFilename is not empty

     2.2.1 - $tempFilename == $dbFilename
   
     The uploaded file has not been changed. Nothing is performed.

     2.2.2 - $tempFilename != $dbFilename
   
     There was a previously uploaded file, and it has been replaced
     by a new one.
     The old uploaded file is deleted and a new unique, descriptive
     name must be assigned to the new uploaded file. The name stored
     in the database cannot be reused, because the extensions of the
     database's name and of the new file may differ, and the name
     with other extension may already exist.
     The new updated file is moved from the temporary directory to
     the uploads directory with the new filename.
     The database is updated if the new filename is different from
     the stored one.

     2.2.2.1 - SPECIAL CASE: $tempFilename is not in the temporary directory,
     but in the uploads directory

     This means that the current file was removed and the
     subsequent one has been put a position forward.
     For example, there are two files, in positions 1 and 2. The
     file in position 1 is removed and, as they are sortered,
     the file in position 2 is now placed in position 1.
     The file doesn't need to be moved to the uploads directory
     as it already is there.
     A new unique, descriptive name must be assigned to the new
     uploaded file, in order to not be deleted when the subsequent
     uploaded files are processed.
     The database is updated if the new filename is different
     from the stored one.
     *
     * @param string $tempFilename The temporary filename of a new uploaded file.
     * @param string $dbFilename   The filename of the old uploaded file.
     * @param string $keywords     The keywords to generate a descriptive filename.
     * @return string $newFilename The final filename of the new uploaded file,
     *                which must be inserted in the database
     *
     * @uses self::getDescriptiveUniqueFilename()
     */
    public static function updateUpload($tempFilename, $dbFilename, $keywords) {

        $newFilename = $dbFilename;

        // Cases 1.1 and 2.2.1
        // if the uploaded file has not been changed, nothing is performed
        if ($tempFilename != $dbFilename) {

            $uploadPath = Configuration::getPath('uploadsMedium');
            $tmbUploadPath = Configuration::getPath('uploadsThumb');
            $tempPath = Configuration::getPath('uploadsTempMedium');
            $tmbTempPath = Configuration::getPath('uploadsTempThumb');

            // Case 2.1
            // if the uploaded file has been changed ($tempFilename != $dbFilename),
            // the old file is deleted
            if ($dbFilename) {
                $oldPathname = $uploadPath . $dbFilename;
                if (file_exists($oldPathname)) {
                    unlink($oldPathname);
                }
                $tmbOldPathname = $tmbUploadPath . $dbFilename;
                if (file_exists($tmbOldPathname)) {
                    unlink($tmbOldPathname);
                }
            }

            // Case 1.2
            // if the uploaded file has been changed and there is no temp filename,
            // the file has been deleted
            if ( ! $tempFilename) {
                $newFilename = '';
            }
            else {

                // a new unique, descriptive name must be assigned to the new uploaded
                // file. The name stored in the database cannot be reused, because
                // the extensions of the database's name and of the new file may differ,
                // and the extension cannot just be changed, because that name with the
                // new extension may already exist.
                $newFilename = self::getDescriptiveUniqueFilename(
                        $keywords, $tmbUploadPath, $tempFilename
                );

                $uploadPathname = $uploadPath . $newFilename;
                $tmbUploadPathname = $tmbUploadPath . $newFilename;

                // Case 2.2.2.1
                // if the new uploaded file is not in the temp directory, but in the
                // upload directory, the temp paths must be corrected.
                // In this case it is relevant that the file has a different filename
                // or it may be deleted when it is processed afterwards
                if (file_exists($tmbUploadPath . $tempFilename)) {
                    $tempPath = $uploadPath;
                    $tmbTempPath = $tmbUploadPath;
                }

                $tempPathname = $tempPath . $tempFilename;
                $tmbTempPathname = $tmbTempPath . $tempFilename;

                // if the new uploaded files are not found, an error has been produced
                // while the updating process
                if (( ! file_exists($tempPathname)) || ( ! file_exists($tmbTempPathname))) {
                    $newFilename = null;
                }
                else {

                    if ( ! file_exists($uploadPath)) {
                        mkdir($uploadPath, 0777, true);
                    }
                    if ( ! file_exists($tmbUploadPath)) {
                        mkdir($tmbUploadPath, 0777, true);
                    }

                    if (( ! rename($tempPathname, $uploadPathname))
                            || ( ! rename($tmbTempPathname, $tmbUploadPathname))) {
                        $newFilename = null;
                    }
                }
            }
        }
        return $newFilename;
    }

    // ---------------------------------------------------------------------------
    /**
     * Delete the given uploaded files.
     *
     * @param array $filenames
     * @return $resultOk
     *
     * @uses self::deleteUploadedFile()
     */
    public static function deleteUploadedFiles($filenames) {

        $resultOk = true;

        foreach($filenames as $filename) {
            if ($filename) {
                $resultOk = $resultOk && self::deleteUploadedFile($filename);
            }
        }
        return $resultOk;
    }

    // ---------------------------------------------------------------------------
    /**
     * Delete the given uploaded file.
     *
     * @param string $filename
     * @return $resultOk
     */
    public static function deleteUploadedFile($filename) {

        $resultOk = false;

        $uploadPath = Configuration::getPath('uploadsMedium');
        $tmbUploadPath = Configuration::getPath('uploadsThumb');

        if ( ! $filename) {
            $resultOk = true;
        }
        else {
            if (file_exists($uploadPath . $filename)) {
                if (unlink($uploadPath . $filename)) {
                    if (file_exists($tmbUploadPath . $filename)) {
                        if (unlink($tmbUploadPath . $filename)) {
                            $resultOk = true;
                        }
                    }
                }
            }
        }
        return $resultOk;
    }

    //----------------------------------------------------------------------------
    /**
     * Return a unique filename in a directory with three random keywords from a
     * given keywords list.
     * <br />
     * A filename with three random keywords is generated and the file extension
     * of the temporary filename is appended. Example:
     * <br />
     * keyword1-keyword2-keyword3.png
     * <br />
     * If the generated filename exists, characters from the temporary filename
     * are appended to the generated filename one by one till it is unique. It
     * is supposed that the temporary filename is unique. Example:
     * <br />
     * keyword1-keyword2-keyword3-h9e3.png
     *
     * @param string $keywordsString
     * @param string $targetPath
     * @param string $tempFilename
     * @return string $uniqueFilename
     */
    public static function getDescriptiveUniqueFilename(
            $keywordsString, $targetPath, $tempFilename) {

        if( ! $keywordsString) {
            $uniqueFilename = $tempFilename;
        }
        else {
            $uniqueFilename = $keywordsString . $tempFilename;
        }

        // Note: The funtion file_exists doesn't find files whose name has
        //       special characters, like tildes.
        
        $charactersCount--;
        while ((file_exists($targetPath . $uniqueFilename))
              && (abs($charactersCount) < strlen($tempFilename)))
        {
            $uniqueFilename = $keywordsString . '-' . substr($tempFilename, $charactersCount);
            $charactersCount--;
        }
        
        return $uniqueFilename;
    }

    //----------------------------------------------------------------------------

} // end of class UploadedFile

/*
 * For files that contain only PHP code, the closing tag ("?>") is to be omitted.
 * It is not required by PHP, and omitting it prevents trailing whitespace from
 * being accidentally injected into the output.
 * ?>
*/
