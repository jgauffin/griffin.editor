// jQuery.Markdown v0.1  -  A text-to-HTML conversion tool for web writers
//
// Copyright (c) 2005 John Gruber  
// <http://daringfireball.net/projects/markdown/>
//
// Copyright (c) 2005 Michel Fortin - PHP Port  
// <http://www.michelf.com/projects/php-markdown/>
//
// Copyright (c) 2005 Sam Angove - this JavaScript port
// <http://rephrase.net/box/js-markdown/>
//
// Copyright (c) 2010 Ben Sekulowicz-Barclay - Adding to jQuery
// <https://github.com/beseku/jquery.markdown/>
//
// Most of this was ported directly from the Perl version, with
// the PHP used as a reference. All credit goes to John and Michel and Sam.
// 
// 0.2: Added markdown function for formatting text wthout HTML elements.
// 0.1: Incorporated Markdown-1.01b2.js. Initial release.

(function($){
	$.markdown = function(makeMeHtmlPlease) {
		md_empty_element_suffix = " />";
		md_tab_width = 4;
		md_tab_width = 4;
		md_html_blocks = new Array();
		md_urls = new Array();
		md_titles = new Array();
		md_list_level = 0;
		md_nested_brackets_depth = 6;
		md_nested_brackets = str_repeat('[^\\[\\]]+|\\[', md_nested_brackets_depth) + str_repeat('\\]*', md_nested_brackets_depth);

		function Markdown(text) {
			text = "\n\n" + text;
			text = text.replace("\r\n", "\n");
			text = text.replace("\r", "\n");
			text += "\n\n";
			text = Detab(text);
			text = text.replace('/^[ \t]+$/m', '');
			text = HashHTMLBlocks(text);
			text = StripLinkDefinitions(text);
			text = RunBlockGamut(text);
			text = UnescapeSpecialChars(text);
			text = text.replace(/^\n\n/, "");
			return text + "\n";
		}

		function fakemd5(chars) {
			if (!chars) {
				chars = "qvxptrghj";
			}
			r = "";
			for (i = 0; i < 32; i++) {
				rand = Math.floor(Math.random() * chars.length);
				r += chars.charAt(rand);
			}
			return r;
		}

		function str_repeat(str, count) {
			out = "";
			for (i = 0; i < count; i++) {
				out += str;
			}
			return out;
		}

		function Detab(text) {
			text = text.replace(/(.*?)\t/g, function(match, substr) {
				return substr += str_repeat(" ", (md_tab_width - substr.length % md_tab_width));
			});
			return text;
		}

		function UnescapeSpecialChars(text) {
			text = text.replace(/7f8137798425a7fed2b8c5703b70d078/gm, "\\");
			text = text.replace(/833344d5e1432da82ef02e1301477ce8/gm, "`");
			text = text.replace(/3389dae361af79b04c9c8e7057f60cc6/gm, "*");
			text = text.replace(/b14a7b8059d9c055954c92674ce60032/gm, "_");
			text = text.replace(/f95b70fdc3088560732a5ac135644506/gm, "{");
			text = text.replace(/cbb184dd8e05c9709e5dcaedaa0495cf/gm, "}");
			text = text.replace(/815417267f76f6f460a4a61f9db75fdb/gm, "[");
			text = text.replace(/0fbd1776e1ad22c59a7080d35c7fd4db/gm, "]");
			text = text.replace(/84c40473414caf2ed4a7b1283e48bbf4/gm, "(");
			text = text.replace(/9371d7a2e3ae86a00aab4771e39d255d/gm, ")");
			text = text.replace(/01abfc750a0c942167651c40d088531d/gm, "#");
			text = text.replace(/5058f1af8388633f609cadb75a75dc9d/gm, ".");
			text = text.replace(/9033e0e305f247c0c3c80d0c7848c8b3/gm, "!");
			text = text.replace(/853ae90f0351324bd73ea615e6487517/gm, ":");
			return text;
		}

		function Houdini(trick) {
			trick = trick.replace(/\\/mg, "7f8137798425a7fed2b8c5703b70d078");
			trick = trick.replace(/\`/mg, "833344d5e1432da82ef02e1301477ce8");
			trick = trick.replace(/\*/mg, "3389dae361af79b04c9c8e7057f60cc6");
			trick = trick.replace(/\_/mg, "b14a7b8059d9c055954c92674ce60032");
			trick = trick.replace(/\{/mg, "f95b70fdc3088560732a5ac135644506");
			trick = trick.replace(/\}/mg, "cbb184dd8e05c9709e5dcaedaa0495cf");
			trick = trick.replace(/\[/mg, "815417267f76f6f460a4a61f9db75fdb");
			trick = trick.replace(/\]/mg, "0fbd1776e1ad22c59a7080d35c7fd4db");
			trick = trick.replace(/\(/mg, "84c40473414caf2ed4a7b1283e48bbf4");
			trick = trick.replace(/\)/mg, "9371d7a2e3ae86a00aab4771e39d255d");
			trick = trick.replace(/\#/mg, "01abfc750a0c942167651c40d088531d");
			trick = trick.replace(/\./mg, "5058f1af8388633f609cadb75a75dc9d");
			trick = trick.replace(/\!/mg, "9033e0e305f247c0c3c80d0c7848c8b3");
			trick = trick.replace(/\:/mg, "853ae90f0351324bd73ea615e6487517");
			return trick;
		}

		function antiEm(toto) {
			toto = toto.replace(/\*/mg, "3389dae361af79b04c9c8e7057f60cc6");
			toto = toto.replace(/\_/mg, "b14a7b8059d9c055954c92674ce60032");
			return toto;
		}

		function EncodeBackslashEscapes(trick) {
			trick = trick.replace(/\\\\/mg, "7f8137798425a7fed2b8c5703b70d078");
			trick = trick.replace(/\\\`/mg, "833344d5e1432da82ef02e1301477ce8");
			trick = trick.replace(/\\\*/mg, "3389dae361af79b04c9c8e7057f60cc6");
			trick = trick.replace(/\\\_/mg, "b14a7b8059d9c055954c92674ce60032");
			trick = trick.replace(/\\\{/mg, "f95b70fdc3088560732a5ac135644506");
			trick = trick.replace(/\\\}/mg, "cbb184dd8e05c9709e5dcaedaa0495cf");
			trick = trick.replace(/\\\[/mg, "815417267f76f6f460a4a61f9db75fdb");
			trick = trick.replace(/\\\]/mg, "0fbd1776e1ad22c59a7080d35c7fd4db");
			trick = trick.replace(/\\\(/mg, "84c40473414caf2ed4a7b1283e48bbf4");
			trick = trick.replace(/\\\)/mg, "9371d7a2e3ae86a00aab4771e39d255d");
			trick = trick.replace(/\\\#/mg, "01abfc750a0c942167651c40d088531d");
			trick = trick.replace(/\\\./mg, "5058f1af8388633f609cadb75a75dc9d");
			trick = trick.replace(/\\\!/mg, "9033e0e305f247c0c3c80d0c7848c8b3");
			trick = trick.replace(/\\\:/mg, "853ae90f0351324bd73ea615e6487517");
			return trick;
		}

		function UnslashQuotes(text) {
			return text.replace("\\\"", "\"");
		}

		function DoItalicsAndBold(text) {
			text = text.replace(/(__)([^_]+)(__)/g, "<strong>$2</strong>");
			text = text.replace(/(\*\*)([^\*]+)(\*\*)/g, "<strong>$2</strong>");
			text = text.replace(/(_)([^_]+)(_{1})/g, "<em>$2</em>");
			text = text.replace(/(\*)([^\*]+)(\*{1})/g, "<em>$2</em>");
			return text;
		}

		function DoAnchors(text) {
			r = "(\\[(" + md_nested_brackets + ")\\][ ]?(?:\\n[ ]*)?\\[([\\S\\s]*?)\\])";
			i = new RegExp(r, "g");
			text = text.replace(i, function(match, str1, str2, str3, str4, str5, str6, str7, str8, str9) {
				whole_match = str1;
				link_text = str2;
				link_id = str3.toLowerCase();
				if (link_id == "") {
					link_id = link_text.toLowerCase();
				}
				if (md_urls[link_id]) {
					url = md_urls[link_id];
					url = antiEm(url);
					result = '<a href="' + url + '"';
					if (md_titles[link_id]) {
						title = md_titles[link_id];
						title = antiEm(title);
						result += " title=\"" + title + "\"";
					}
					result += ">" + link_text + "</a>";
				} else {
					result = whole_match;
				}
				return result;
			});
			r = "(\\[(" + md_nested_brackets + ")\\][ \\t]*\\(<?(\\S*)>?[ \\t]*((['\"])(.*?)\\5)?\\))";
			i = new RegExp(r, "g");
			text = text.replace(i, function(match, str1, str2, str3, str4, str5, str6) {
				whole_match = str1;
				link_text = str2;
				url = str3;
				title = str6;
				url = antiEm(url);
				result = '<a href="' + url + '"';
				if (title) {
					title = title.replace("\"", "&quot;");
					url = antiEm(url);
					result += " title=\"" + title + "\"";
				}
				result += ">" + link_text + "</a>";
				return result;
			});
			return text;
		}

		function DoImages(text) {
			text = text.replace(/(!\[([\s\S]*?)\][ ]?(?:\n[ ]*)?\[([\s\S]*?)\])/gm, function(match, str1, str2, str3) {
				whole_match = str1;
				alt_text = str2;
				link_id = str3.toLowerCase();
				if (link_id == "") {
					link_id = alt_text.toLowerCase();
				}
				alt_text = alt_text.replace("\"", "&quot;");
				if (md_urls[link_id]) {
					url = md_urls[link_id];
					url = antiEm(url);
					result = "<img src=" + url + " alt=\"" + alt_text + "\"";
					if (md_titles[link_id]) {
						title = md_titles[link_id];
						title = antiEm(title);
						result += " title=\"" + title + "\"";
					}
					result += md_empty_element_suffix;
				} else {
					result = whole_match;
				}
				return result;
			});
			text = text.replace(/(!\[([\s\S]*?)\]\([ \t]*<?(\S+?)>?[ \t]*(([\'\"])([\s\S]*?)\5[ \t]*)?\))/g, function(match, str1, str2, str3, str4, str5, str6) {
				whole_match = str1;
				alt_text = str2;
				url = str3;
				title = '';
				if (str6) {
					title = str6;
				}
				alt_text = alt_text.replace("\"", "&quot;");
				title = title.replace("\"", "&quot;");
				url = antiEm(url);
				result = "<img src=" + url + " alt=\"" + alt_text + "\"";
				if (title) {
					title = antiEm(title);
					result += " title=\"" + title + "\"";
				}
				result += md_empty_element_suffix;
				return result;
			});
			return text;
		}

		function DoCodeSpans(text) {
			r = /(`+)(.+?)\1(?!`)/g;
			text = text.replace(r, function(match, str1, str2) {
				str2 = str2.replace(/^[ \t]*/g, "");
				str2 = str2.replace(/[ \t]*$/g, "");
				str2 = EncodeCode(str2);
				return "<code>" + str2 + "</code>";
			});
			return text;
		}

		function EncodeCode(c) {
			c = c.replace(/\&/gm, '&amp;');
			c = c.replace(/\</gm, '&lt;');
			c = c.replace(/\>/gm, '&gt;');
			c = Houdini(c);
			return c;
		}

		function RunSpanGamut(text) {
			text = DoCodeSpans(text);
			text = text.replace(/[ ]{2,}$\n/gm, "<br" + md_empty_element_suffix + "\n");
			text = EscapeSpecialChars(text);
			text = DoImages(text);
			text = DoAnchors(text);
			text = DoAutoLinks(text);
			text = EncodeAmpsAndAngles(text);
			text = DoItalicsAndBold(text);
			return text;
		}

		function DoHeaders(text) {
			r = "^(.+)[ \\t]*\\n=+[ \\t]*\\n+";
			i = new RegExp(r, "gm");
			text = text.replace(i, function(match, str1) {
				return "<h1>" + RunSpanGamut(str1) + "</h1>\n\n";
			});
			r = "^(.+)[ \\t]*\\n-+[ \\t]*\\n+";
			i = new RegExp(r, "gm");
			text = text.replace(i, function(match, str1) {
				return "<h2>" + RunSpanGamut(str1) + "</h2>\n\n";
			});
			r = "^(\#{1,6})[ \\t]*(.+?)[ \\t]*\#*\\n+";
			reg = new RegExp(r, "gm");
			text = text.replace(reg, function(match, str1, str2) {
				h_level = str1.length;
				return "<h" + h_level + ">" + RunSpanGamut(str2) + "</h" + h_level + ">\n\n";
			});
			return text;
		}

		function Outdent(text) {
			r = "^(\\\\t|[ ]{1," + md_tab_width + "})";
			i = new RegExp(r, "gm");
			return text.replace(i, "");
		}

		function rtrim($s) {
			return $s.replace(/\s*$/, "");
		}

		function ProcessListItems(list_str, marker_any) {
			md_list_level++;
			eflag = "someunlikelystringrahrahrah";
			list_str = list_str.replace(/([\s\S]*)\n{2,}/gm, "$1" + eflag);
			r = "(\\n)?(^[ \\t]*)(" + marker_any + ")[ \\t]+((?:[\\s\\S]+?)(\\n{1,2}))(?=\\n*(" + eflag + "|\\2(" + marker_any + ")[ \\t]+))";
			reg = new RegExp(r, "gm");
			list_str = list_str.replace(reg, function(match, str1, str2, str3, str4) {
				var item = str4;
				leading_line = str1;
				leading_space = str2;
				if (leading_line || (item.match(/\n{2,}/gm))) {
					item = RunBlockGamut(item);
				} else {
					item = DoLists(Outdent(item));
					item = item.replace(/\n*$/, "");
					item = RunSpanGamut(item);
				}
				return "<li>" + item + "</li>\n";
			});
			md_list_level--;
			list_str = list_str.replace(eflag, "");
			return list_str;
		}

		function DoLists(text) {
			less_than_tab = md_tab_width - 1;
			marker_ul = '[*+-]';
			marker_ol = '\\d+[.]';
			marker_any = '(?:[*+-]|\\d+[.])';
			whole_list = '(([ ]{0,' + less_than_tab + '}((?:[*+-]|\\d+[.]))[ \\t]+)(?:[\\s\\S]+?)(\$|\\n{2,}(?=\\S)(?![ \\t]*(?:[*+-]|\\d+[.])[ \\t]+)))';
			flag = "ridiculousendlistflag";
			text = text + flag;
			if (md_list_level) {
				r = '^(([ ]{0,3}((?:[*+-]|\\d+[.]))[ \\t]+)(?:[\\s\\S]+?)(' + flag + '|\\n{2,}(?=\\S)(?![ \\t]*(?:[*+-]|\\d+[.])[ \\t]+)))';
				i = new RegExp(r, "gm");
				text = text.replace(i, function(match, str1, str2, str3) {
					list = str1;
					i = new RegExp(marker_ul, "gm");
					if (str3.match(i)) {
						list_type = "ul";
					} else {
						list_type = "ol";
					}
					list = list.replace(/\n{2,}/g, '\n\n\n');
					result = ProcessListItems(list, marker_any);
					result = "<" + list_type + ">\n" + result + "</" + list_type + ">\n";
					return result;
				});
			} else {
				r = '(?:\\n\\n|\\A\\n?)(([ ]{0,3}((?:[*+-]|\\d+[.]))[ \\t]+)(?:[\\s\\S]+?)(' + flag + '|\\n{2,}(?=\\S)(?![ \\t]*(?:[*+-]|\\d+[.])[ \\t]+)))';
				i = new RegExp(r, "gm");
				text = text.replace(i, function(match, str1, str2, str3) {
					list = str1;
					i = new RegExp(marker_ul, "gm");
					if (str3.match(i)) {
						list_type = "ul";
					} else {
						list_type = "ol";
					}
					list = list.replace(/\n{2,}/g, '\n\n\n');
					result = ProcessListItems(list, marker_any);
					result = "\n<" + list_type + ">\n" + result + "</" + list_type + ">\n";
					return result;
				});
			}
			text = text.replace(flag, "");
			return text;
		}

		function DoCodeBlocks(text) {
			r = "(?:\\n\\n|\\A)((?:(?:[ ]{" + md_tab_width + "}|\\t).*\\n+)+)((?=^[ ]{0," + md_tab_width + "}\\S)|\$)";
			i = new RegExp(r, "gm");
			text = text.replace(i, function(match, str1) {
				codeblock = str1;
				codeblock = EncodeCode(Outdent(codeblock));
				codeblock = Detab(codeblock);
				codeblock = codeblock.replace(/\A\n+/gm, "");
				codeblock = codeblock.replace(/\s+$/g, "");
				result = "\n\n<pre><code>" + codeblock + "\n</code></pre>\n\n";
				return result;
			});
			return text;
		}

		function DoBlockQuotes(text) {
			text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm, function(match, str1) {
				bq = str1;
				bq = bq.replace(/^[ \t]*>[ \t]?/gm, "");
				bq = bq.replace(/^[ \t]+$/gm, "");
				bq = RunBlockGamut(bq);
				bq = bq.replace(/\n+$/, "");
				bq = bq.replace(/^/gm, "  ");
				bq = bq.replace(/(\s*<pre>[\s\S]+?<\/pre>)/g, function(match, str1) {
					pre = str1;
					pre = pre.replace(/^  /mg, "");
					return pre;
				});
				return "<blockquote>\n" + bq + "\n</blockquote>\n\n";
			});
			return text;
		}

		function dechex($char) {
			$char = $char.toString(16);
			return $char;
		}

		function EncodeEmailAddress($addr) {
			$matches = $addr.match(/([^\:])/g);
			$r = Math.round(Math.random() * 100);
			$newaddr = "";
			for (var $match in $matches) {
				$newaddr += rencode($matches[$match]);
			}
			$m = "";
			for ($i = 0; $i < 6; $i++) {
				$m += rencode("mailto".charAt($i));
			}
			$addr = '<a href="' + $m + ':' + $newaddr + '">' + $newaddr + '</a>';
			return $addr;
		}

		function rencode($char) {
			$r = Math.round(Math.random() * 100);
			if ($r > 90 && $char != "@") {
				return $char;
			} else if ($r < 45) {
				return "&#x" + $char.charCodeAt(0).toString(16) + ";";
			} else {
				return "&#" + $char.charCodeAt(0) + ";";
			}
		}

		function DoAutoLinks(text) {
			text = text.replace(/<((https?|ftp):[^'">\s]+)>/gi, function(match, str1) {
				str1 = antiEm(str1);
				return '<a href="' + str1 + '">' + str1 + '</a>';
			});
			text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gmi, function(match, str1) {
				return EncodeEmailAddress(UnescapeSpecialChars(str1));
			});
			return text;
		}

		function FormParagraphs(text) {
			text = text.replace(/\A\n+/mg, "");
			text = text.replace(/\n+\z/mg, "");
			grafs = text.split(/\n{2,}/mg);
			for (var i in grafs) {
				if (!md_html_blocks[grafs[i]]) {
					if (grafs[i] && (grafs[i].match(/\S+/gm)) && !grafs[i].match(/^[<](?!((https?|ftp):[^'">\s]+)>|(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>)/mi)) {
						grafs[i] = RunSpanGamut(grafs[i]);
						grafs[i] = "<p>" + grafs[i];
						grafs[i] += "</p>";
					}
				}
			}
			for (var j in grafs) {
				if (md_html_blocks[grafs[j]]) {
					grafs[j] = md_html_blocks[grafs[j]];
				}
			}
			return grafs.join("\n\n");
		}

		function RunBlockGamut(text) {
			text = DoHeaders(text);
			text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, "\n<hr" + md_empty_element_suffix + "\n");
			text = text.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, "\n<hr" + md_empty_element_suffix + "\n");
			text = text.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, "\n<hr" + md_empty_element_suffix + "\n");
			text = DoLists(text);
			text = DoCodeBlocks(text);
			text = DoBlockQuotes(text);
			text = HashHTMLBlocks(text);
			text = FormParagraphs(text);
			return text;
		}

		function RunBlockQuoteGamut(text) {
			text = DoHeaders(text);
			text = text.replace(/^( ?\* ?){3,}$/m, "\n<hr" + md_empty_element_suffix + "\n");
			text = text.replace(/^( ?- ?){3,}$/m, "\n<hr" + md_empty_element_suffix + "\n");
			text = text.replace(/^( ?_ ?){3,}$/m, "\n<hr" + md_empty_element_suffix + "\n");
			text = DoLists(text);
			text = DoCodeBlocks(text);
			text = DoAutoLinks(text);
			text = HashHTMLBlocks(text);
			text = FormParagraphs(text);
			return text;
		}

		function HashHTMLBlocks(text) {
			less_than_tab = md_tab_width - 1;
			block_tags_a = 'p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del';
			block_tags_b = 'p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math';
			r = "(^<(" + block_tags_a + ")\\b(.*\\n)*?<\\/\\2>[ \\t]*(?=(\\n+|\\Z)))";
			reg = new RegExp(r, "gm");
			text = text.replace(reg, function(match, str1, str2) {
				key = fakemd5();
				while (md_html_blocks[key]) {
					key = fakemd5();
				}
				md_html_blocks[key] = str1;
				return "\n\n" + key + "\n\n";
			});
			r = "(^<(" + block_tags_b + ")\\b(.*\\n)*?.*<\\/\\2>[ \\t]*(?=(\\n+|\\Z)))";
			reg = new RegExp(r, "gm");
			text = text.replace(reg, function(match, str1, str2) {
				key = fakemd5();
				while (md_html_blocks[key]) {
					key = fakemd5();
				}
				md_html_blocks[key] = str1;
				return "\n\n" + key + "\n\n";
			});
			r = "(?:(\\n\\n)|\\A\\n?)([ ]{0," + less_than_tab + "}<(hr)\\b([^<>])*?\\/?>[ \\t]*(?=\\n{2,}|\\Z))";
			reg = new RegExp(r, "gm");
			text = text.replace(reg, function(match, str1, str2) {
				key = fakemd5();
				while (md_html_blocks[key]) {
					key = fakemd5();
				}
				md_html_blocks[key] = str2;
				return "\n\n" + key + "\n\n";
			});
			r = "(?:(\\n\\n)|\\A\\n?)([ ]{0," + less_than_tab + "}(?:<!(--[\\s\\S]*?--\\s*)+>)[ \\t]*(?=\\n{2,}|\\Z))";
			reg = new RegExp(r, "gm");
			text = text.replace(reg, function(match, str1, str2) {
				key = fakemd5();
				while (md_html_blocks[key]) {
					key = fakemd5();
				}
				md_html_blocks[key] = str2;
				return "\n\n" + key + "\n\n";
			});
			return text;
		}

		function StripLinkDefinitions(text) {
			r = "^[ ]{0," + less_than_tab + "}\\[(.+)\\]:[ \\t]*\\n?[ \\t]*<?(\\S+)>?[ \\t]*\\n?[ \\t]*(?:[\"(](.+?)[\")][ \\t]*)?(?:\\n+|\\Z)";
			reg = new RegExp(r, "gm");
			text = text.replace(reg, function(match, str1, str2, str3) {
				link_id = str1.toLowerCase();
				md_urls[link_id] = EncodeAmpsAndAngles(str2);
				if (str3) {
					md_titles[link_id] = str3;
				}
				return "";
			});
			return text;
		}

		function htmlentities(text) {
			$re = /(%([a-zA-Z0-9]{1,4}))/g;
			$escaped = escape(text);
			$entitized = $escaped.replace($re, "&#x$2;");
			return $entitized;
		}

		function EncodeAmpsAndAngles(text) {
			text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");
			text = text.replace(/<(?![a-z\/?\$!])/gi, "&lt;");
			return text;
		}

		function EscapeSpecialChars(text) {
			tokens = TokenizeHTML(text);
			text = '';
			for (var i in tokens) {
				if (tokens[i].type == "tag") {
					t = tokens[i].value;
					t = antiEm(t);
					text += t;
				} else {
					t = tokens[i].value;
					t = EncodeBackslashEscapes(t);
					text += t;
				}
			}
			return text;
		}

		function TokenizeHTML(string) {
			function token(type, value) {
				this.type = type;
				this.value = value;
			}
			tokens = new Array();
			r = /(?:<!(--[\s\S]*?--\s*)+>)|(?:<\?[\s\S]*?\?>)|(?:<[a-z\/!$](?:[^<>]|(?:<[a-z\/!$](?:[^<>]|(?:<[a-z\/!$](?:[^<>]|(?:<[a-z\/!$](?:[^<>]|(?:<[a-z\/!$](?:[^<>]|(?:<[a-z\/!$](?:[^<>])*>))*>))*>))*>))*>))*>)/i;
			while (r.test(string)) {
				txt = RegExp.leftContext;
				tag = RegExp.lastMatch;
				tokens.push(new token("text", txt));
				tokens.push(new token("tag", tag));
				string = string.replace(txt, "");
				string = string.replace(tag, "");
			}
			if (string != "") {
				tokens.push(new token("text", string));
			}
			return tokens;
		}
		
		return Markdown(makeMeHtmlPlease);
	};
	
	$.fn.markdown = function() {
		return this.each(function(i, e) {
			var $e = $(e);
			$e.html($.markdown($e.text()));
		});
	};
})(jQuery);