/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 


 Markdown integration for griffin.editor.
 Created by Jonas Gauffin. http://www.gauffin.org
 
 Usage:
 
 Include the script below the main editor script.
 
 */

(function($) {
    "use strict";
    
	$.griffinEditorExtension.textHandler = {
		invokeAction: function($editor, actionName, selection, context) {
	//			console.log(griffinEditor);

			context.editor = $editor;
			var method = 'action' + actionName.capitalize();
			if (this[method]) {
				var args = [];
				args[0] = selection;
				args[1] = context;
				return this[method].apply(this, args);
			} else {
                if (typeof alert !== 'undefined') {
                    alert('Missing ' + method + ' in the active textHandler (griffinEditorExtension)');
                }
			}
			
			return this;
		},
		
		preview: function($editor, $preview, contents) {
			if (contents === null || typeof contents === 'undefined') {
                if (typeof alert !== 'undefined') {
                    alert('Empty contents');
                }
				return this;
			}
			$preview.html($.markdown(contents));
		},
		
		// private func
		removeWrapping: function(selection, wrapperString) {
			var wrapperLength = wrapperString.length;
			var $editor = $(selection.parent);
			var pos = selection.get();
			
			// expand double click
			if (pos.start !== 0 && $editor.val().substr(pos.start - wrapperLength, wrapperLength) === wrapperString) {
				selection.select(pos.start - wrapperLength, pos.end + wrapperLength);
				pos = selection.get();
			}
			
			// remove 
			if (selection.text().substr(0, wrapperLength) === wrapperString) {
				var text = selection.text().substr(wrapperLength, selection.text().length - (wrapperLength*2));
				selection.replace(text);
				selection.select(pos.start, pos.end - (wrapperLength*2));
				return true;
			}
		
			return false;
		},	
		
		
		actionBold: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			if (this.removeWrapping(selection, '**')) {
				return this;
			}
			
			selection.replace("**" + selection.text() + "**");
			
			if (isSelected) {
				selection.select(pos.start, pos.end + 4);
			} else {
				selection.select(pos.start + 2, pos.start + 2);
			}
			
			return this;
		},
		
		actionItalic: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			if (this.removeWrapping(selection, '_')) {
				return this;
			}
						
			selection.replace("_" + selection.text() + "_");
			
			if (isSelected) {
				selection.select(pos.start, pos.end + 2);
			} else {
				selection.select(pos.start + 1, pos.start + 1);
			}
			
			return this;
		},

		actionH1: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("# " + selection.text());
			
			if (isSelected) {
				selection.select(pos.end + 2, pos.end + 2);
			}
            
			return this;
		},
		
		actionH2: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("## " + selection.text());
			
			if (isSelected) {
				selection.select(pos.end + 3, pos.end + 3);
			}
		},

		actionH3: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("### " + selection.text());
			selection.select(pos.end + 4, pos.end + 4);

			return this;
		},
		
		actionBullets: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("* " + selection.text());
			selection.select(pos.end + 2, pos.end + 2);
		
			return this;
		},

		actionNumbers: function(selection) {
			var isSelected = selection.isSelected();
			var pos = selection.get();

			selection.replace("1. " + selection.text());
			selection.select(pos.end + 3, pos.end + 3);

			return this;
		},
		
		actionSourcecode: function(selection) {
			var pos = selection.get();
			if (!selection.isSelected()) {
				selection.replace('> ');
				selection.select(pos.start + 2, pos.start + 2);
				return this;
			}
			
			if (selection.text().indexOf('\n') === -1) {
				selection.replace('`' + selection.text() + '`');
				selection.select(pos.end + 2, pos.end + 2);
				return this;
			}
			
			var text = '    ' + selection.text().replace(/\n/g, '\n    ');
			if (text.substr(text.length-3, 1) === ' ' && text.substr(text.length-1, 1) === ' ') {
				text = text.substr(0, text.length - 4);
			}
			selection.replace(text);
			selection.select(pos.start + text.length, pos.start + text.length);
			
			return this;
		},
		
		actionQuote: function(selection) {
			var pos = selection.get();
			if (!selection.isSelected()) {
				selection.replace('> ');
				selection.select(pos.start + 2, pos.start + 2);
				return this;
			}
			
			
			var text = '> ' + selection.text().replace(/\n/g, '\n> ');
			if (text.substr(text.length-3, 1) === ' ') {
				text = text.substr(0, text.length - 4);
			}
			selection.replace(text);
			selection.select(pos.start + text.length, pos.start + text.length);

			return this;
		},
		
		//context: { url: 'urlToImage' }
		actionImage: function(selection, context) {
			var pos = selection.get();
			var text = selection.text();
			
            selection.store();
			var options = {
				success: function(result) {
					var newText = '![' + result.title + '](' + result.url + ')';
                    selection.load();
					selection.replace(newText);
					selection.select(pos.start + newText.length, pos.start + newText.length);
					context.editor.preview();
				}
			};
			
			if (!selection.isSelected()) {
                options.url = '';
                options.title = '';
			} else if (text.substr(-4, 4) === '.png' || text.substr(-4, 4) === '.gif' || text.substr(-4, 4) === '.jpg') {
				options.url = text;
			} else {
				options.title = text;
			}
			
			$.griffinEditorExtension.imageDialog(options);
			return this;
		},
		
		//context: { url: 'url' }
		actionLink: function(selection, context) {
			//[Google] [1]
			//[1]: http://google.com/        "Google"
			var pos = selection.get();
			var text = selection.text();
			selection.store();
			var options = {
				success: function(result) {
                    selection.load();
					var newText = '[' + result.title + '](' + result.url + '/)';
					selection.replace(newText);
					selection.select(pos.start + newText.length, pos.start + newText.length);
					context.editor.preview();
				}
			};			
			if (selection.isSelected()) {
                if (text.substr(0,4) === 'http' || text.substr(0,3) === 'www') {
                    options.url = text;
                } else {
                    options.title = text;
                }
			} 
			
			$.griffinEditorExtension.linkDialog(options);
			return this;
		}

		
	};
	
//	$.griffinEditorExtension.textHandler = $.griffinEditorExtension.textHandlers.markdown;

})(jQuery);	
