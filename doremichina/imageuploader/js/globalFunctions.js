
/******************************************************************************/
/**                                                                          **/
/**                         jQuery object functions                          **/
/**                                                                          **/

(function($) {

//------------------------------------------------------------------------------
/**
 * Write an error message within a jQuery 'ui-state-error' class div.
 *
 * @param options = { <br />
 *          message: string - default: 'Error', <br />
 *          scrollToParent: boolean - default: false <br />
 *        }
 */
jQuery.fn.errorMessage = function(options) {

    var settings = {
        message: 'Error',
        scrollToParent: false
    };

    $.extend(settings, options);

    // check if the message was not previously inserted, to avoid inserting
    // it twice
    if ( ! this.find('.errorMessage').length) {
        var errorDiv =
            '<div class="errorMessage"></div>';
        this.prepend(errorDiv);
    }

    this.find('.errorMessage')
        .show()
        .html(settings.message);

    if (settings.scrollToParent) {
        this.scrollWindowAnimated();
        // better focus() than select() because it is valid for both text
        // and checkbox inputs
        this.find('input, textarea').focus();
    }
    return this;
};

//------------------------------------------------------------------------------
/**
 * Remove the 'ui-state-error' class div from the calling element.
 */
jQuery.fn.removeErrorMessage = function() {
    return this
        .find('.errorMessage')
        .hide();
};

//------------------------------------------------------------------------------
/**
 * Scroll the window to the calling element at once, with no effect.
 */
jQuery.fn.scrollWindow = function() {
    $('html, body').attr({scrollTop: this.offset().top - 30});
    return this;
};

//------------------------------------------------------------------------------
/**
 * Scroll the window to the calling element with moving effect.
 */
jQuery.fn.scrollWindowAnimated = function() {
    $('html, body').animate({scrollTop: this.offset().top - 30}, 2000);
    return this;
};

//------------------------------------------------------------------------------

})(jQuery);

/**                                                                          **/
/**                         jQuery object functions                          **/
/**                                                                          **/
/******************************************************************************/

/******************************************************************************/
/**                                                                          **/
/**                            Global functions                              **/
/**                                                                          **/

(function($) {

jQuery.globalFunctions = {

    //--------------------------------------------------------------------------
    /**
     * Open a dialog box with the given parameters.
     * <br />
     * It is checked if the dialog box was already created in order to reuse it
     * and to not create another one again.
     * 
     * @param options = { <br />
     *      dialogBoxId: string - default: 'dialog', <br />
     *      scrollToTop: boolean - default: true, <br />
     *      modal: boolean - default: true, <br />
     *      width: string|int - default: '300px', <br />
     *      height: string|int - default: 'auto', <br />
     *      minWidth: string - default: 'auto', <br />
     *      // BUG: If minHeight is 'auto', IE crashes
     *      // minHeight: string - default: 'auto', <br />
     *      buttons: object - default: {}, <br />
     *      title: string - default: '', <br />
     *      message: string - default: '', <br />
     *      close: function - no default. The event "dialogclose" is unbound
     *             if no event "closed" is passed. <br />
     * }
     * @return jQuery $dialog
     */
    openDialog: function(options) {

        var settings = {
            dialogBoxId: 'dialog',
            scrollToTop: true,
            modal: true,
            width: '300px',
            height: 'auto',
            minWidth: 'auto',
            // BUG: If minHeight is 'auto', IE crashes
//            minHeight: 'auto',
            minHeight: 100,
            buttons: {},
            title: '',
            message: ''
        };
        $.extend(settings, options);

        if (settings.scrollToTop) {
            $('body').scrollWindow();
        }

        var $dialog = $('#' + settings.dialogBoxId);

        if ( ! $dialog.length) {
            $dialog = $('<div id="' + settings.dialogBoxId + '"></div>');
        }
        
        $dialog
            .html(settings.message)
            .dialog(settings);
            
        if ( ! settings.close) {
            $dialog.unbind( 'dialogclose');
        }

        return $dialog;
    },

    //--------------------------------------------------------------------------
    /**
     * Close the dialog box opened with openDialog().
     */
    closeDialog: function(dialogBox) {

        if ( ! dialogBox) {
            dialogBox = $('#dialog');
        }
        
        $(dialogBox).dialog('close');
    }

    //--------------------------------------------------------------------------
    
}; // end of jQuery.globalFunctions

})(jQuery);

/**                                                                          **/
/**                            Global functions                              **/
/**                                                                          **/
/******************************************************************************/
