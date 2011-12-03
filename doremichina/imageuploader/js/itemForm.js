
/******************************************************************************/
/**                                                                          **/
/**                               Item form                                  **/
/**                                                                          **/

/**
 * @author Alberto Moyano SÃ¡nchez, 2010
 * @version 2.3 (2011)
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function($) {

//------------------------------------------------------------------------------
// constructor (must be before the public functions) ---------------------------
//------------------------------------------------------------------------------

jQuery.itemForm = {

    insertAjaxUrl: 'imageuploader/php/insert.php',
    updateAjaxUrl: 'imageuploader/php/update.php',
    insertOrUpdateAjaxUrl: '',
    savedUrl: 'saved.php',
    savingDialogMessage: true,
    saveOkDialogMessage: true,
    itemId: '',
    loadingTimeout: 2000, // milliseconds
    checkingIntervalTime: 500, // milliseconds
    progressBarInterval: 5,
    messages: {
        savingTitle: '保存',
        savingMessage: '<p>正在处理文件.</p><div id="progressbar"></div>',
        savedTitle: 'Saved',
        saved: '图片已经保存.',
        errorTitle: 'Error',
        noImagesTitle: '没有图片',
        noImagesMessage: '没有图片.',
        timeoutTitle: '超时',
        timeoutMessage: '保存图片超时.'
    }
};

//------------------------------------------------------------------------------
// public functions ------------------------------------------------------------
//------------------------------------------------------------------------------

jQuery.itemForm.insert = function() {

    $.itemForm.insertOrUpdateAjaxUrl = $.itemForm.insertAjaxUrl;
    save();
};

//------------------------------------------------------------------------------

jQuery.itemForm.update = function(itemId) {

    $.itemForm.insertOrUpdateAjaxUrl = $.itemForm.updateAjaxUrl;
    this.itemId = itemId;
    save();
};

//------------------------------------------------------------------------------

jQuery.itemForm.submitFormIfNotImageLoading = function(loadingTime) {

    if (jQuery.uploaderPreviewer.loadingImages()) {
      if(loadingTime > $.itemForm.loadingTimeout) {
        var settings = {
            title: $.itemForm.messages.timeoutTitle,
            message: $.itemForm.messages.timeoutMessage,
            buttons: { 'OK': function() { $(this).dialog("close"); } }
        };
        $.globalFunctions.openDialog(settings);
      }
      else {
        loadingTime += $.itemForm.checkingIntervalTime;
        var progressBarValue = $("#progressbar").progressbar('value')
                             + $.itemForm.progressBarInterval;
        $("#progressbar").progressbar('value', progressBarValue);
        var recursiveCall = "$.itemForm.submitFormIfNotImageLoading(" + loadingTime + ")";
        setTimeout(recursiveCall, $.itemForm.checkingIntervalTime);
      }
    }
    else {
      submitForm();
    }
};

//------------------------------------------------------------------------------
// private functions -----------------------------------------------------------
//------------------------------------------------------------------------------

function save() {
    if (validateData()) {

        if ($.itemForm.savingDialogMessage) {
        
            showImageLoadingMessage();
        }
        
        $.itemForm.submitFormIfNotImageLoading(0);
    }
    else {
        
        settings = {
            title: $.itemForm.messages.noImagesTitle,
            message: $.itemForm.messages.noImagesMessage,
            buttons: { 'OK': function() { $(this).dialog("close"); } }
        };
        $.globalFunctions.openDialog(settings);
    }
    
};

//------------------------------------------------------------------------------

function validateData() {

    var validationOk = true;

    if (( ! $.uploaderPreviewer.loadedImages().length)
            && ( ! $.uploaderPreviewer.loadingImages()))
    {
        validationOk = false;
    }
    
    return validationOk;
};

//------------------------------------------------------------------------------

function showImageLoadingMessage() {

    var options = {
        title: $.itemForm.messages.savingTitle,
        message: $.itemForm.messages.savingMessage
    };

    $.globalFunctions.openDialog(options);

    $("#progressbar").progressbar({
        value: 0
    });
    
    var progressBarInterval = $.itemForm.checkingIntervalTime * 100 / $.itemForm.loadingTimeout;
    if (progressBarInterval != Number.NaN) {
        $.itemForm.progressBarInterval = Math.floor(progressBarInterval);
    }
};

//------------------------------------------------------------------------------

function submitForm() {
    var parameters = {
        otherField: $('#otherField').val(),
        keywords: $('#keywords').val(),
        imagesCount: $.uploaderPreviewer.loadedImages().length
    };
    
    $.uploaderPreviewer.loadedImages().each(function(index) {
        parameters['image' + (index + 1)] = $(this).val();
    });

    $.post($.itemForm.insertOrUpdateAjaxUrl, parameters, saved);
};

//------------------------------------------------------------------------------

function saved(result) {
    // the result html elements must be enclosed in a parent html element, to
    // be able to read all of them. The wrap function doesn't work in this case,
    // with several separated html elements
    var $result = $('<div>' + result + '</div>');
    var settings;

    if ($result.find('.error').length) {
        settings = {
            title: $.itemForm.messages.errorTitle,
            message: $result.find('.error'),
            buttons: { 'OK': function() { $(this).dialog("close"); } },
            width: 400
        };

        $.globalFunctions.openDialog(settings);
    }
    else {

        if ($.itemForm.saveOkDialogMessage) {

            settings = {
                title: $.itemForm.messages.savedTitle,
                message: $.itemForm.messages.saved,
                buttons: { 'OK': function() {
                    $.globalFunctions.closeDialog();
                } }
            };

            if ($result.find('.warning').length) {
                settings.message += $result.find('.warning');
            }

            $.globalFunctions.openDialog(settings);
        }
    }
};

//------------------------------------------------------------------------------

})(jQuery);

/**                                                                          **/
/**                               Item form                                  **/
/**                                                                          **/
/******************************************************************************/

