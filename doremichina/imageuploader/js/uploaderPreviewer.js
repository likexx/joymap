(function($) {

//------------------------------------------------------------------------------
// constructor (must be before the public functions) ---------------------------
//------------------------------------------------------------------------------

jQuery.uploaderPreviewer = new Object({
    formsCount: 2, // number of image forms to handle
    allowedImageTypes: new Array('png', 'jpg', 'jpeg', 'gif'),
    uploadImageAjaxUrl: '/imageuploader/php/uploadImage.php',
    removeImageAjaxUrl: '/imageuploader/php/removeImage.php',
    uploadsThumbDir: '/imageuploader/uploads/thumb/',
    messages: {
        imageLabel: '图片',
        fileTypeError: '不允许上传该类型文件',
        removeButtonCaption: '删除',
        removeButtonTitle: '删除图片'
    }
});

//------------------------------------------------------------------------------
// public functions ------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * Generate the number of image elements specified in $.uploaderPreviewer.formsCount
 *
 * @param options = {} Extends the $.uploaderPreviewer object
 * @return $(forms) jQuery object
 *
 * @uses createImageForm()
 * @uses configureImageForms()
 */
jQuery.uploaderPreviewer.createImageForms = function(options, user) {

    $.extend(this, options);

    var forms = '';

    for(var i=1; i <= this.formsCount; i++) {
        var previewImage = '';
        
        switch (i){
            case 1:
                previewImage = user.image1;
                break;
            case 2:
                previewImage = user.image2;
                break;
            default:
                break;
        }
        
        forms += createImageForm(i, previewImage);
    }    
    return configureImageForms($(forms));
};

//------------------------------------------------------------------------------
/**
 * Upload dynamically an image and display it.
 *
 * @param $fileField File field that has selected an image.
 *
 * @uses $.uploaderPreviewer.factoryIframe()
 * @uses $.uploaderPreviewer.handleResult()
 */
jQuery.uploaderPreviewer.uploadImage = function($fileField) {

    var $parent = $fileField.parents('table:first').parent();

    $parent.removeErrorMessage();
    
    if ( ! checkImageType($fileField)) {
        removeImage($parent.find('button.removeImage'), true);
        $parent.errorMessage({
            message: $.uploaderPreviewer.messages.fileTypeError,
            scrollToParent: true
        });
    }
    else {
        var $previewDiv = $parent.find('div.previewImage');
                                
        $previewDiv
            .removeClass('imageLoaded')
            .addClass('loading')
            .find('img')
            .hide();

        $parent.find('input:hidden.currentUploadedFilename').removeClass('imageLoaded');

        var $iframe = factoryIframe($fileField.attr('id'));
        
        // the load event must be attached in this way, and not inline when creating
        // the iframe, so that it can later be removed with unbind. If not unbound,
        // the load event will execute twice if the iframe was created before, once
        // when the iframe is created again, and another one when it is loaded
        $iframe.load(function() {
            $.uploaderPreviewer.handleResult($iframe, $previewDiv);
        });
        $parent.find('form:first').submit();
    }
    $parent.find('button.removeImage').show();
};

//------------------------------------------------------------------------------
/**
 * Display an image given in an iframe. If the iframe doesn't contain an
 * image, an error message is displayed.
 *
 * @param $iframe Iframe containing the result of the image upload.
 * @param $previewDiv Div where the image is displayed.
 *
 * @uses displayImage()
 */
jQuery.uploaderPreviewer.handleResult = function($iframe, $previewDiv) {

    var $iframeContent = $iframe.contents().find('body');
    // if the upload was cancelled, the preview div is not ".loading"
    if ($previewDiv.is('.loading')) {
        if ($iframeContent.find('.error').length) {
            $previewDiv.parents('table:first').parent().errorMessage({
                message: $iframeContent.find('.error').html(),
                scrollToParent: true
            });
            $previewDiv
                .removeClass('loading imageLoaded')
                .find('img')
                .hide();
        }
        else {
            var imageUrl = $iframeContent.find('.image').text();
            displayImage($previewDiv, imageUrl);
        }
    } else {
    }
    // the load event must be unbound, to not be triggered twice when the iframe
    // is created again
    // the iframe is emptied because the .remove() method removes the element
    // from the DOM, but not from the jQuery object
    $iframe.empty().unbind('load');

    $('body').remove(":contains('" + $iframe.id + "')");
};

//------------------------------------------------------------------------------
/**
 * Display the given images in the image preview divs.
 *
 * @param imageFilenames Array containing the image filenames.
 *
 * @uses displayImage()
 */
jQuery.uploaderPreviewer.populateImages = function(imageFilenames) {

    $('.imageForms table').each(function(index) {
        if (imageFilenames[index]) {
            var $previewDiv = $(this).find('div.previewImage');

            $previewDiv.addClass('loading');

            displayImage($previewDiv, $.uploaderPreviewer.uploadsThumbDir
                        + imageFilenames[index]);
        }
    });
}

//------------------------------------------------------------------------------
/**
 * Indicate if there are images loading.
 *
 * @return boolean
 */
jQuery.uploaderPreviewer.loadingImages = function() {

    return $('div.loading').length;
};

//------------------------------------------------------------------------------
/**
 * Get the hidden input boxes that have the filename of uploaded images.
 *
 * @return jQuery
 */
jQuery.uploaderPreviewer.loadedImages = function() {
    
    return $('input:hidden.imageLoaded');
};

//------------------------------------------------------------------------------
// private functions -----------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * Create an image form.
 *
 * @param index The index of the image form. Some element names are based on it.
 * @return string The html of the image form.
 */
function createImageForm(index, preview) {

    var form = '';

    form += '<div><table cellspacing="0">';
    form += '<tr><td class="label">'
          + '<label for="imageToUpload' + index + '">'
          + $.uploaderPreviewer.messages.imageLabel + ' ' + index + ':</label></td>';
    form += '<td class="removeImageButton">'
          + '<button class="small removeImage" /></td>';
    form += '<td class="imageFormFileField">'
          // BUG: If the "enctype" attribute is assigned with jQuery, IE crashes
          + '<form enctype="multipart/form-data">'
        // The field MAX_FILE_SIZE limits the maximum size of the selected file.
        // If exceded the size, an error will be sent with the file to the php file.
        // However, the size of the file cannot be checked with javascript before
        // sending it, what makes this field useless, as there is other better ways
        // to check the size in php.
        // Therefore, it is not included.
        //  + '<input type="hidden" name="MAX_FILE_SIZE" value="3000000" />'
          + '<input id="imageToUpload' + index + '" type="file" />'
          + '<input type="hidden" name="currentUploadedFilename"'
          + ' class="currentUploadedFilename" /></form>'
          + '</td></tr>';
    form += '<tr><td></td><td></td><td>' +
          '<div class="previewImage"><img ';
    if (preview!=null && preview.length>4) {
        form += 'src="./imageuploader/uploads/thumb/' + preview +'"';
    }
    form +='/></div></td></tr></table></div>';

    return form;
};

//------------------------------------------------------------------------------
/**
 * This factory method avoids that an iframe is created multiple times. <br />
 * When the information is taken from the iframe, it is removed with the
 * .remove() method. This method however removes the element from the DOM,
 * but not from the jQuery object. <br />
 * So, if the iframe is needed again, it is taken the already existing one,
 * instead of creating a new one.
 *
 * @param fileFieldId The id that concatenated with 'iframe' makes the name of
 *        the iframe.
 * @return jQuery
 */
function factoryIframe(fileFieldId) {

    var iframeName = 'iframe' + fileFieldId;
    var $iframe = $('#' + iframeName);
    if ($iframe.length == 0) {
        $iframe = $('<iframe id="' + iframeName + '" name="' + iframeName
                        + '" style="display: none;" />');
    }
    $('body').append($iframe);
    return $iframe;
};

//------------------------------------------------------------------------------
/**
 * Set properties and events of the image forms elements.
 *
 * @param $forms jQuery object with the image forms to configure.
 * @return jQuery
 *
 * @uses $.uploaderPreviewer.uploadImage()
 * @uses $.uploaderPreviewer.removeImage()
 */
function configureImageForms($forms) {

    $('input:file', $forms)
        .attr({
            name: 'imageToUpload',
            size: 33
        })
        .change(function() {
            $.uploaderPreviewer.uploadImage($(this));
        })
        .focus(function() {
            $(this).select();
        });
    $('form', $forms).each(function() {
        var $targetIframeName = 'iframe' + $(this).find('input:file').attr('id');
        $(this).attr({
            // BUG: If the "enctype" attribute is assigned with jQuery, IE crashes
//            enctype: 'multipart/form-data',
            method: 'post',
            action: $.uploaderPreviewer.uploadImageAjaxUrl,
            target: $targetIframeName
        });
    });
    $('button.removeImage', $forms)
        .hide()
        .text($.uploaderPreviewer.messages.removeButtonCaption)
        .attr('title', $.uploaderPreviewer.messages.removeButtonTitle)
        .click(function() {
            removeImage($(this), false);
        });
    $(window).unload(function() {
        $('input:hidden[name="currentUploadedFilename"]').each(function() {
            if ($(this).val()) {
                $.post($.uploaderPreviewer.removeImageAjaxUrl, {
                    currentUploadedFilename: $(this).val()
                });
            }
        });
    });
    return $forms;
};

//------------------------------------------------------------------------------
/**
 * Check the extension of the selected file. The extension is taken from the
 * filename, as javascript has no access to the real file.
 *
 * @param $fileField
 * @return boolean
 */
function checkImageType($fileField) {

    var resultImageTypeOk = false;
    var fileExtension = $fileField.val();

    fileExtension = fileExtension.substr(fileExtension.lastIndexOf(".") + 1);
    fileExtension = fileExtension.toLowerCase();

    // BUG: If the toString() function is not called, IE crashes
    if($.uploaderPreviewer.allowedImageTypes.toString().indexOf(fileExtension) >= 0) {
        resultImageTypeOk = true;
    }
    return resultImageTypeOk;
};
  
//------------------------------------------------------------------------------
/**
 * Display the given image on the given div.
 *
 * @param $previewDiv
 * @param imageUrl
 */
function displayImage($previewDiv, imageUrl) {

    var imageFilename = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);

    $previewDiv
        .removeClass('loading')
        .addClass('imageLoaded')
        .find('img')
        .attr('src', imageUrl)
        .show();
    $previewDiv
        .parents('table:first')
        .find('input:hidden.currentUploadedFilename')
        .val(imageFilename)
        .addClass('imageLoaded');
    $previewDiv
        .parents('table:first')
        .find('button.removeImage')
        .show();
}

//------------------------------------------------------------------------------
/**
 * Remove the image of the image form according with the given remove button
 * from the server and from the preview div.
 *
 * @param $removeImageButton
 * @param errorDisplayed Boolean to determine if the remove image button and
 *        the file field must be hidden.
 */
function removeImage($removeImageButton, errorDisplayed) {

    var $parent = $removeImageButton.parents('table:first').parent();

    $.post($.uploaderPreviewer.removeImageAjaxUrl, {
        currentUploadedFilename: $parent.find('input:hidden.currentUploadedFilename').val()
    });

    $parent.find('input:hidden.currentUploadedFilename').removeClass('imageLoaded');
    $parent.find('div.previewImage')
        .removeClass('loading imageLoaded')
        .find('img')
        .hide();

    $parent.removeErrorMessage();

    if ( ! errorDisplayed) {
        $parent.find('input:file').val('');
        $removeImageButton.hide();
    }
};

//------------------------------------------------------------------------------

})(jQuery);

/**                                                                          **/
/**                     Dynamic image uploader previewer                     **/
/**                                                                          **/
/******************************************************************************/
