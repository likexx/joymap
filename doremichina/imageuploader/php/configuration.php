<?php

class Configuration {

    private static $pathnames = array(
        'documentRoot' => '../',
        'urlRoot' => '/imageuploader/',
        'removeImage' => 'php/removeImage.php',
    );

    private static $uploadData = array(
//        'large' => array(
//            'temp' => 'uploads/temp/large/',
//            'target' => 'uploads/large/',
//            'dimension' => 1000, // in pixels
//        ),
        'medium' => array(
            'temp' => 'uploads/temp/medium/',
            'target' => 'uploads/medium/',
            'dimension' => 800, // in pixels
        ),
        // "thumb" is compulsory, it is used in uploadImage.php and uploadedFile.php
        'thumb' => array(
            'temp' => 'uploads/temp/thumb/',
            'target' => 'uploads/thumb/',
            'dimension' => 80, // in pixels
        ),
    );

    public static $data = array(
        'fileFieldName' => 'imageToUpload',
        // "image/x-png" and "image/pjpeg" are the png and jpg types for Internet Explorer
        // File types supported by the script: png, jpg, gif.
        'allowedImageTypes' => array(
            'image/png',
            'image/x-png',
            'image/jpg',
            'image/jpeg',
            'image/pjpeg',
            'image/gif',
        ),
        'maxImageSize' => 3000000, // in bytes
        'maxImageDimension' => 2500, // in pixels
    );

    public static $messages = array(

    'unknown' => '
        <p>未知错误，请选择其它图片.</p>',
    'upload' => '
        <p>上传文件出错.</p>
        <p>错误代码: %s</p>',
    'type' => '
        <p>不允许上传该类型图片.</p>
        <p>请选择 PNG, JPG 或者 GIF.</p>',
    'size' => '
        <p>文件太大.</p>
        <p>当前文件大小: %s KB</p>
        <p>最大允许: %s KB</p>',
    'dimension' => '
        <p>图片尺寸过大.</p>
        <p>当前图片尺寸: %s x %s px</p>
        <p>最大允许尺寸: %s x %s px</p>',
    'unknownUploadError' => '
        <p>文件上传过程中遇到错误</p>
        <p>请重新再传.</p>',
    );

    // functions ---------------------------------------------------------------

    public static function getPath($pathKey){
        return self::$pathnames['documentRoot'] . self::$pathnames[$pathKey];
    }

    public static function getUrlPath($pathKey){
        return self::$pathnames['urlRoot'] . self::$pathnames[$pathKey];
    }

    public static function getUploadDataArray(){

        $uploadData = array();

        foreach (self::$uploadData as $pathKey => $path) {
            $uploadData[$pathKey]['temp'] = self::$pathnames['documentRoot'] . $path['temp'];
            $uploadData[$pathKey]['target'] = self::$pathnames['documentRoot'] . $path['target'];
            $uploadData[$pathKey]['dimension'] = $path['dimension'];
        }

        return $uploadData;
    }
    
    public static function getUploadPath($pathKey, $pathType) {
        return self::$pathnames['documentRoot'] . self::$uploadData[$pathKey][$pathType];
    }

    /**
     * @param string $pathKey. Example: large, medium, thumb
     * @param string $pathType. Example: temp, target
     * @return string
     */
    public static function getUploadUrlPath($pathKey, $pathType){
        return self::$pathnames['urlRoot'] . self::$uploadData[$pathKey][$pathType];
    }

} // end of class Configuration

/*
 * For files that contain only PHP code, the closing tag ("?>") is to be omitted.
 * It is not required by PHP, and omitting it prevents trailing whitespace from
 * being accidentally injected into the output.
 * ?>
 */
