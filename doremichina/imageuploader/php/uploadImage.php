<?php

/**
 * @author Alberto Moyano Sánchez, 2010
 * @version 2.3 (2011)
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

// includes --------------------------------------------------------------------

require_once('configuration.php');

// functions -------------------------------------------------------------------
/**
 * Create an image from a given image path. <br />
 * The functions imagecreatefromXXX raise a fatal error when trying to create
 * an image bigger than 3100 px. I didn't get errors when trying to create an
 * image because of the size. The maximum I could test was an 3,6 MB image,
 * images larger than 3,6 MB where bigger than 3100 px and there was an error
 * because of the dimension.
 *
 * @param string $imagePath
 * @param string $imageType
 * @return image
 *
 * @uses imagecreatefrompng()
 * @uses imagecreatefromgif()
 * @uses imagecreatefromjpeg()
 */
function createImageFactory($imagePath, $imageType) {

    $image = null;

    if(($imageType == 'image/png') || ($imageType == 'image/x-png')) {
        $image = imagecreatefrompng($imagePath);
    }
    else if($imageType == 'image/gif') {
        $image = imagecreatefromgif($imagePath);
    }
    else {
        $image = imagecreatefromjpeg($imagePath);
    }

    return $image;
}

//-----------------------------------------------------------------------------
/**
 * Get an unique filename for an image type in a given path.
 *
 * @param string $path
 * @param string $imageType
 * @return string $imageName
 */
function getUniquePathname($path, $imageType) {

    $imageName = null;
    $imagePathName = null;
    $extension = '';

    if(($imageType == 'image/png') || ($imageType == 'image/x-png')) {
        $extension = '.png';
    }
    else if($imageType == 'image/gif') {
        $extension = '.gif';
    }
    else {
        $extension = '.jpg';
    }
    
    $i = 0;
    do {
        // uniqid() with no parameters returns a 13 characters long string
        $imageName = uniqid() . $extension;
        $imagePathName = $path . $imageName;
        $i++;
    } while((file_exists($imagePathName)) && ($i < 100));

    if(file_exists($imagePathName)) {
        $imageName = '';
    }

    return $imageName;
}

//-----------------------------------------------------------------------------
/**
 * @param image $image
 * @param string $imagePath
 * @param string $imageType
 * @return boolean $resultSave
 */
function saveImage($image, $imagePath, $imageType) {
    $resultSave = false;
    if(($imageType == 'image/png') || ($imageType == 'image/x-png')) {
        $resultSave = imagepng($image, $imagePath);
    }
    else if($imageType == 'image/gif') {
        // if the gif is animated, the function imagegif doesn't keep the
        // animation. The animation is lost in the process creating, resampling
        // and saving the image
        $resultSave = imagegif($image, $imagePath);
    }
    else {
        $resultSave = imagejpeg($image, $imagePath, 80);
    }
    return $resultSave;
}

//-----------------------------------------------------------------------------
/**
 * @param int $width
 * @param int $height
 * @param string $imageType
 * @return image
 */
function createNewImage($width, $height, $imageType) {

    $image = imagecreatetruecolor($width, $height);

    // set the transparency if the image is png or gif
    if(($imageType == 'image/png') || ($imageType == 'image/x-png')
            || ($imageType == 'image/gif'))
    {
        imagealphablending($image, false);
        imagesavealpha($image, true);
        $transparent = imagecolorallocatealpha($image, 255, 255, 255, 127);
        imagefilledrectangle($image, 0, 0, $width, $height, $transparent);
    }

    return $image;
}

//-----------------------------------------------------------------------------
/**
 * Resize an uploaded image and copy it from the upload temporary directory
 * into another directory.
 *
 * @param string $sourceImagePathname
 * @param string $targetImagePath
 * @param string $imageType
 * @param int $maximumDimension
 * @return boolean $resultSave
 *
 * @uses getimagesize()
 * @uses copy()
 * @uses createImageFactory()
 * @uses createNewImage()
 * @uses imagecopyresampled()
 * @uses saveImage()
 */
function uploadResizedImage(
        $sourceImagePathname, $targetImagePath, $imageType, $maximumDimension)
{
    $resultSave = false;

    list($width, $height) = getimagesize($sourceImagePathname);
    
    if(($maximumDimension >= $width) && ($maximumDimension >= $height)) {
        // with the process of creating, resampling and saving the image, the
        // animation of an animated gif is lost. In order to keep the possible
        // animation, if the image is smaller than the maximum size, it is
        // uploaded without any processing
        $resultSave = copy($sourceImagePathname, $targetImagePath);
    }
    else {
        // the function createImageFactory raises a fatal error because dimension
        // and size reasons. See notes on the function createImageFactory()
        $sourceImage = @createImageFactory($sourceImagePathname, $imageType);
        if($width > $height) {
            $newWidth = round($maximumDimension);
            $newHeight = round($height * ($newWidth / $width));
        }
        else {
            $newHeight = round($maximumDimension);
            $newWidth = round($width * ($newHeight / $height));
        }
        $targetImage = createNewImage($newWidth, $newHeight, $imageType);
        // the function imagecopyresampled is much better than the function
        // imagecopyresized, which distorts the image when resizing
        $resultResize = imagecopyresampled($targetImage, $sourceImage,
                0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        if($resultResize) {
            $resultSave = saveImage($targetImage, $targetImagePath, $imageType);
        }
    }

    return $resultSave;
}

//------------------------------------------------------------------------------
/**
 * Return an error message wrapped within a "error" class div.
 *
 * @param string $messageKey = 'unknown'
 * @return string
 *
 * @uses getMessage()
 */
function errorMessage($messageKey = 'unknown') {

    return '<div class="error">' . Configuration::$messages[$messageKey] . '</div>';

}

//------------------------------------------------------------------------------
/**
 * Return an image pathname wrapped within an "image" class div.
 *
 * @param string $imagePathname
 * @return string
 */
function imagePathname($imagePathname) {

    return '<div class="image">' . $imagePathname . '</div>';

}

// main script -----------------------------------------------------------------

// remove the old image if there is any
require_once(Configuration::getPath('removeImage'));

//$fileFieldName = Configuration::$data['fileFieldName'];
$fileFieldName = 'imageToUpload';

// it must be checked first if there is an error with the file (e.g.
// larger than the maximum size allowed by the hidden field MAX_FILE_SIZE
// in HTML) than if type of the file is an allowed type, because if there 
// is an error, the type and the size of the file are not be available
// Some of the errors codes (there are more):
// UPLOAD_ERR_OK -> Value: 0. There is no error, the file uploaded with success.
// UPLOAD_ERR_INI_SIZE -> Value: 1. The uploaded file exceeds the 
//                        upload_max_filesize directive in php.ini.
// UPLOAD_ERR_FORM_SIZE -> Value: 2. The uploaded file exceeds the MAX_FILE_SIZE
//                         directive that was specified in the HTML form.

$result = errorMessage();

if ($_FILES[$fileFieldName]['error'] > 0) {

    $result = sprintf(errorMessage('upload'), $_FILES['imageToUpload']['error']);
}
else if( ! in_array($_FILES[$fileFieldName]['type'], Configuration::$data['allowedImageTypes'])) {

    $result = errorMessage('type');
}
// the function createImageFactory, called by uploadResizedImage raises 
// a fatal error because dimension and size reasons. See notes on the
// function createImageFactory()
else if($_FILES[$fileFieldName]['size'] > Configuration::$data['maxImageSize']) {

    $result = sprintf(
            errorMessage('size'),
            round($_FILES[$fileFieldName]['size'] / 1000),
            round(Configuration::$data['maxImageSize'] / 1000)
    );
}
// the function createImageFactory, called by uploadResizedImage raises 
// a fatal error because dimension and size reasons. See notes on the
// function createImageFactory()
else {

    $uploadedFileTempName = $_FILES[$fileFieldName]['tmp_name'];
    list($width, $height) = getimagesize($uploadedFileTempName);
    $maxDimension = Configuration::$data['maxImageDimension'];

    if(($width > $maxDimension) || ($height > $maxDimension)) {
        $result = sprintf(errorMessage('dimension'), $width, $height, $maxDimension, $maxDimension);
    }
    // everything is right with the uploaded image
    else {

        $paths = Configuration::getUploadDataArray();

        $imageType = $_FILES[$fileFieldName]['type'];
        // a unique pathname is generated for the one path (thumb) and used
        // for every path, as all of them must be synchronized and have the
        // same files
        $imageName = getUniquePathname($paths['thumb']['temp'], $imageType);

        if( ! $imageName) {
            $result = sprintf(errorMessage('unknownUploadError'), $_FILES[$fileFieldName]['name']);
        }
        else {

            $result = '';

            foreach ($paths as $path) {

                if ( ! file_exists($path['temp'])) {
                    mkdir($path['temp'], 0777, true);
                }

                if ( ! uploadResizedImage(
                        $uploadedFileTempName,
                        $path['temp'] . $imageName,
                        $imageType,
                        $path['dimension']
                ))
                {
                    $result = sprintf(
                            errorMessage('unknownUploadError'), $_FILES[$fileFieldName]['name']
                    );
                }
            }

            // if $result has no error, everything went ok and the image url
            // is returned, to be displayed
            if ( ! $result) {
                
                $imageUrl = Configuration::getUploadUrlPath('thumb', 'temp') . $imageName;
                // write the image tag
                $result = imagePathname($imageUrl);
            }
        }
    }
}

// delay for testing purpose
//sleep(5);

echo $result;

/*
 * For files that contain only PHP code, the closing tag ("?>") is to be omitted.
 * It is not required by PHP, and omitting it prevents trailing whitespace from
 * being accidentally injected into the output.
 * ?>
*/
