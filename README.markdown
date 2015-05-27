griffin.editor
==============

A TextArea editor with minimal configuration. v2 is work in progress.

***Written in typescript***

![](screenshot.png)

Current features
----------------

* **Markdown** (easy to add additional formats)
* Preview
* Syntax highlighting
* Boostrap dialogs
* Access keys (browser default or CTRL+key)
* Plug & play

Installation
------------

1. Download the script(s)
2. Configure as shown in the sample folder

Example setup
--------------

Step 1. Add the required HTML

```html
<div id="editor">
	<div class="toolbar">
		<span class="button-h1" accesskey="1" title="Heading 1"><img src="images/h1.png" /></span>
		<span class="button-h2" accesskey="2" title="Heading 2"><img src="images/h2.png" /></span>
		<span class="button-h3" accesskey="3" title="Heading 3"><img src="images/h3.png" /></span>
		<span class="button-bold" accesskey="b" title="Bold text"><img src="images/bold.png" /></span>
		<span class="button-italic" accesskey="i" title="Italic text"><img src="images/italic.png" /></span>
		<span class="divider">&nbsp;</span>
		<span class="button-bullets" accesskey="l" title="Bullet List"><img src="images/bullets.png" /></span>
		<span class="button-numbers" accesskey="n" title="Ordered list"><img src="images/numbers.png" /></span>
		<span class="divider">&nbsp;</span>
		<span class="button-sourcecode" accesskey="k" title="Source code"><img src="images/source_code.png" /></span>
		<span class="button-quote" accesskey="q" title="Qoutation"><img src="images/document_quote.png" /></span>
		<span class="divider">&nbsp;</span>
		<span class="button-link" accesskey="l" title="Insert link"><img src="images/link.png" /></span>
		<span class="button-image" accesskey="p" title="Insert picture/image"><img src="images/picture.png" /></span>
	</div>
	<textarea class="area"># Hello World!</textarea><br />
</div>
```

Step 2. Load the script

```html
<script src="Scripts/GriffinEditor.js"></script>
<script type="text/javascript">
	$(function () {
		//using markedjs, you can easily use your own favorite markdown editor
		var textParser = {
			parse: function (text) {
				return marked(text);
			}
		}
		var editor = new Griffin.Editor('editor', textParser);
		editor.preview();
	});
</script>
```

Step 3. To activate syntax highlighting:

```html
<script src="Scripts/GriffinEditor.js"></script>
<script type="text/javascript">
	$(function () {
		//using markedjs, you can easily use your own favorite markdown editor
		var textParser = {
			parse: function (text) {
				return marked(text);
			}
		}
		
		//using prism.js
		var prismHighlighter = {
			highlight: function (blockElements, inlineElements) {
				blockElements.forEach(function(item) {
					Prism.highlightElement(item);
				});
				
			}
		};
		
		var editor = new Griffin.Editor('editor', textParser);
		editor.syntaxHighlighter = prismHighlighter;
		editor.preview();
	});
</script>
```


