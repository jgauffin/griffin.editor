/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 
 
 Created by Jonas Gauffin. http://www.gauffin.org
 
 Usage:
 
 $('editor').griffinEditor();
 
 */

String.prototype.capitalize = function(){
   return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

(function($) {
	/** Global extension points for griffinEditor */
	$.griffinEditorExtension = { 
		/** Used to handle everything that is written in the text area */
		textHandler: null, 
		
		/** Used by a text handler when the user want's to insert an image 
		 * @param options { title: someTitleNullOrUndefined, url: someUrlNullOrUndeinfed, success: function(options){} }
		 * successFunction options = { title: X, url: Y }
		 */
		
		imageDialog: function(options) { 
			if (options.title == null || typeof options.title === 'undefined') {
				title = window.prompt('Enter image title: ', ''); 
				if (!options.title)return;
			}
			if (options.url == null || typeof options.url === 'undefined') {
				options.url = window.prompt('Enter image url: ', ''); 
				if (!options.url)return;
			}
			
			options.success({ url: options.url, title: options.title});
		},

		/** Used by a text handler when the user want's to insert a link 
		 * @param options { title: someTitleNullOrUndefined, url: someUrlNullOrUndeinfed, success: function(options){} }
		 * successFunction options = { title: X, url: Y }
		 */
		linkDialog: function(options) { 
			if (options.title == null || typeof options.title === 'undefined') {
				options.title = window.prompt('Enter link title: ', ''); 
				if (!options.title)return;
			}
			if (options.url == null || typeof options.url === 'undefined') {
				options.url = window.prompt('Enter link url: ', ''); 
				if (!options.url)return;
			}
			if (options.url.substr(0,4) === 'wwww')
				options.url = 'http://' + options.url;
				
			options.success({ url: options.url, title: options.title});
		} 
	};

    //globals
    $.griffinEditor = {
        texts: {
            title: 'Please wait, loading..'
        },
        translations: []
    };
		
    
    var methods = {
        init: function(options) {
            var settings = $.extend({
				textHandler: $.griffinEditorExtension.textHandler,
				autoSize: true
            }, options);

            return this.each(function() {
                var $this = $(this);
				var self = this;
                var data = $this.data('griffin-editor');
                
				
				this.trimSpaceInSelection = function () {
					var selectedText = data.selection.text();
					var pos = data.selection.get();
					if (selectedText.substr(selectedText.length - 1, 1) === ' ') {
						data.selection.select(pos.start, pos.end - 1);
					}
				};
				
				this.getActionNameFromClass = function(classString) {
					var classNames = classString.split(/\s+/);
					for (var i = 0; i < classNames.length; i++) {
						if (classNames[i].substr(0, 7) === 'button-') {
							return classNames[i].substr(7);
						}
					}
					
					return null;
				}
				
				this.assignAccessKeys = function() {
					$('span[accesskey]', data.toolbar).each(function() {
						var button = this;
						if (jQuery.hotkeys) {
							$(data.editor).bind('keydown', 'ctrl+' + $(this).attr('accesskey'), function(e) {
								e.preventDefault();
								
								var actionName = self.getActionNameFromClass(button.className);
								var args = [];
								args[0] = actionName;
								methods.invokeAction.apply(self, args); 
								self.preview();
								return this;
							});
						
							$(this).attr('title', $(this).attr('title') + ' [CTRL+' + $(this).attr('accesskey').toUpperCase() + ']');
						} 
					});
				}
				
				this.preview = function() {
					if ($('#myeditor-preview').length === 0)
						return this;
					data.options.textHandler.preview(self, $('#myeditor-preview'), data.editor.val());
					
					// no code highlighter.
					if (typeof hljs === 'undefined')
						return this;
						
					var timer = $(this).data('editor-timer');
					if (typeof timer !== 'undefined') {
						clearTimeout(timer);
					}
					timer = setTimeout(function() {
						
						hljs.tabReplace = '    ';
						var text = $("#myeditor-preview code").html();
						if (text == null) {
							return;
						}
						var result = hljs.highlightAuto(text);
						$("#myeditor-preview code").html(result.value);
					}, 1000);
					$(this).data('editor-timer', timer);					
				};
				
				this.autoSize = function () {
					if (!data.options.autoSize)
						return this;
						
					var twin = $(this).data('twin-area');

					if (typeof twin === 'undefined') {
						twin = $('<textarea style="position:absolute; top: -10000px"></textarea>');
						var div = $('<div  style="display:none"></div>');
						twin.appendTo('body');
						//div.appendTo('body');
						$(this).data('twin-area', twin);
						$(this).data('originalSize', { 
							width: this.clientWidth, 
							height: this.clientHeight, position: 
							$(this).css('position'), 
							top: $(this).css('top'), 
							left: $(this).css('left')
						});
					}
					twin.css('height', this.clientHeight);
					twin.css('width', this.clientWidth);
					twin.html($(this).val() + 'some\r\nmore\r\n');
					if (twin[0].clientHeight < twin[0].scrollHeight) {
						var style = { 
							height: (this.clientHeight + 100) + 'px', 
							width: this.clientWidth, 
							position: 'absolute', 
							top: $(this).offset().top, 
							left: $(this).offset().left,
							zindex: 99
						};
						$(this).css(style);
						$(this).data('expandedSize', style);
					}
				}
                
                if (typeof data !== 'undefined') {
					return this;
				}

							
				$('.toolbar span[class^="button"]', this).click(function(e) {
					e.preventDefault();
					
					var actionName = self.getActionNameFromClass(this.className);
					var args = [];
					args[0] = actionName;
					methods.invokeAction.apply(self, args); 
					self.preview();
					return this;
				});
				
				$('.area', this).bind('paste', function(e) {
					setTimeout(function() {
						self.preview();
					}, 100);
				});
				
				$('.area', this).keydown(function() {
					self.preview();
					self.autoSize();
				});
				
				$('.area', this).blur(function() {
					if (data.options.autoSize) {
						var originalSize = $(this).data('originalSize');
						if (typeof originalSize !== 'undefined') {
							$(this).css(originalSize);
						}
					}
				});
				$('.area', this).focus(function() {
					if (data.options.autoSize) {
						var expandedSize = $(this).data('expandedSize');
						if (typeof expandedSize !== 'undefined') {
							$(this).css(expandedSize);
						}
					}
				});
				
				data = { };
				data.toolbar = $('.toolbar', $this);
				data.editor = $('.area', $this);
				data.selection = new textSelector(data.editor[0]);
				data.options = settings;

				$(this).data('griffin-editor', data);
				this.assignAccessKeys();
				this.preview();
            });
        },
        destroy: function( ) {

            return this.each(function() {

                var $this = $(this),
                    data = $this.data('overlay');

                // Namespacing FTW
                $(window).unbind('.elementOverlay');
                data.overlay.remove();
                $this.removeData('overlay');

            });
        },
        
		/** Invoke a toolbar action */
		invokeAction: function(actionName) {
			var $this = $(this),
                data = $this.data('griffin-editor');
				
			this.trimSpaceInSelection();
			
			var context = {};
			data.options.textHandler.invokeAction(this, actionName, data.selection, context);
		},
		
		/** Refresh the preview window (if any) */
		preview: function() {
			var $this = $(this),
                data = $this.data('griffin-editor');
				
			this.preview();
		}
    };

    $.fn.griffinEditor = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.griffinEditor');
        }

    };

})(jQuery);	