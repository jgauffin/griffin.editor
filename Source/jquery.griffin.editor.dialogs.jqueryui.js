/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 


 jQueryUI dialogs for griffin.editor.
 Created by Jonas Gauffin. http://www.gauffin.org
 
 Usage:
 
 Include the script below the main editor script.
 
 */
(function($) {
    "use strict";
    
	$.griffinEditorExtension.imageDialog = function(options) {
		var body = $('#griffin-editor-image-dialog');
		if (typeof $body === 'undefined') {
			body = $('<div id="griffin-editor-image-dialog" style="display:none">' +
				'<div class="validation"></div>' +
				'<div><label>Enter title</label><br />' +
				'<input type="text" name="title" /></div>' +
				'<div><label>Enter URL</label><br />' +
				'<input type="text" name="url" /></div>' +
			'</div>');
			$('body').append(body);
		}
		var $body = $(body);
		
		var $title = $('input[name="title"]');
		var $url = $('input[name="url"]');
		if (options.title !== null && typeof options.title !== 'undefined') {
			$title.val(options.title);
		}
		
		
		if (options.url !== null && typeof options.url !== 'undefined') {
			$url.val(options.url);
		}
		var valid = true;
		var dialogOptions = {
			autoOpen: true,
			modal: true,
			title: 'Select an image',
			buttons: {
				"OK": function() {
					$('input', $body).removeClass('ui-state-error');
					
					if ($url.val() === '') {
						$url.addClass( "ui-state-error" );
						valid = false;
					}
					if ($title.val() === '') {
						$title.addClass( "ui-state-error" );
						valid = false;
					}
					

					if ( valid ) {
						$( this ).dialog( "close" );
					}
					
					options.success({ url: $url.val(), title: $title.val() });
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			open: function() {
				if ($title.val() === '')  {
					$title.focus();
				}else {
					$url.val('http://');
					$url.focus();
				}
			},
			close: function() {
				//allFields.val( "" ).removeClass( "ui-state-error" );
			}
		};
		
		$body.dialog(dialogOptions);
	};
	
	$.griffinEditorExtension.linkDialog = function(options) {
		var body = $('#griffin-editor-link-dialog');
		if (typeof $body === 'undefined') {
			body = $('<div id="griffin-editor-link-dialog" style="display:none">' +
				'<div class="validation"></div>' +
				'<div><label>Enter title</label><br />' +
				'<input type="text" name="title" /></div>' +
				'<div><label>Enter URL</label><br />' +
				'<input type="text" name="url" /></div>' +
			'</div>');
			$('body').append(body);
		}
		var $body = $(body);
		
		var $title = $('input[name="title"]');
		if (options.title !== null && typeof options.title !== 'undefined') {
			$title.val(options.title);
		}
		
		var $url = $('input[name="url"]');
		if (options.url !== null && typeof options.url !== 'undefined') {
			$url.val(options.url);
		}
        
		var valid = true;
		var dialogOptions = {
			autoOpen: true,
			modal: true,
			title: 'Enter your link',
			buttons: {
				"OK": function() {
					$('input', $body).removeClass('ui-state-error');
					
					if ($url.val() === '') {
						$url.addClass( "ui-state-error" );
						valid = false;
					}
					if ($title.val() === '') {
						$title.addClass( "ui-state-error" );
						valid = false;
					}
					

					if ( valid ) {
						$( this ).dialog( "close" );
					}
					
					options.success({ url: $url.val(), title: $title.val() });
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			open: function() {
				if ($title.val() === '')  {
					$title.focus();
				}else {
					$url.val('http://');
					$url.focus();
				}
			},
			close: function() {
				//allFields.val( "" ).removeClass( "ui-state-error" );
			}
		};
		
		$body.dialog(dialogOptions);
	};
})(jQuery);	