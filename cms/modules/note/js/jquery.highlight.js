(function ($) {

	$.fn.highlight = function(options) { 
		var settings = $.extend($.highlighter.settings, options);
		
		// Listen for mouse up event, capture text, and highlight it
	    $(settings.eventTarget).bind(settings.eventListen, function(e) {
	        var selectionRange = getSelected();
            if (!selectionRange) return;

            var parentNode  = $(selectionRange.startContainer).parents(settings.parentNode)[0];
            var properties  = {
                selection:      selectionRange.toString(),
                start_node:     selectionRange.startContainer.nodeValue,
                start_offset:   selectionRange.startOffset,
                end_node:       selectionRange.endContainer.nodeValue,
                end_offset:     selectionRange.endOffset,
                parent_offset:  parentNode.innerText.indexOf(selectionRange.startContainer.nodeValue),
                paragraph_id:   $(parentNode).data('paragraph_id')
            }

            $.highlighter.highlight(parentNode, properties);

            settings.onSelection(this, e, properties);
	    });
	    
	    // Get selected text and return the selection range object
	    var getSelected = function() {
	        if (window.getSelection) { // W3C compliant browser.  aka, not IE
	            var selection = window.getSelection();
	        } else { // IE
	            var selection = document.selection && document.selection.createRange();
	        }

	        var range = document.createRange();
            if (selection.anchorNode != undefined && selection.focusNode != undefined) {
	            range.setStart(selection.anchorNode, selection.anchorOffset);
	            range.setEnd(selection.focusNode, selection.focusOffset);
            }

            if (selection.toString() == '') {
                settings.onEmptySelection();
                $('.highlight-temp').each(function() {
                    $(this).replaceWith($(this).html());
                });
                $(range.startContainer).parents(settings.parentNode).each(function() {
                    $(this).html($(this).html());
                });

                return false;
            }
	        
	        return range;
	    }
    }
	
    $.highlighter = {};

	$.highlighter.highlightNode = function(obj, properties, processNode) {
    	processNode = (processNode) ? processNode : false;

        // Clean DOM so it represents its original state
        $(obj).html($(obj).html());

        if (properties.start_node == properties.end_node) {
            var node = document.createTextNode(properties.start_node);

            $(obj).contents().each(function() {
                var newElement;
                if (node.nodeValue == this.nodeValue) { // Text
                    newElement = $.highlighter.processTxtNode(this, properties.start_offset, properties.end_offset);
                } else if (node.textContent == this.textContent) { // HTML
                    newElement = $.highlighter.processHtmlNode(this, properties.start_offset, properties.end_offset);
                }

                if (newElement) {
                    $(newElement).attr('data-onid', properties.onid);
                    $(newElement).addClass('note-' + properties.onid);
                }
            });

        } else {

            $(obj).contents().each(function(idx, node) {
                if ($(node).text().trim() == '') return; // empty node

                var isStartNode     = properties.start_node.indexOf($(node).text());
                var isEndNode       = properties.end_node.indexOf($(node).text());
                var start_offset    = 0;
                var end_offset      = $(node).text().length;
                var newElement;

                // Find the start node
                if (isStartNode == 0) {
                    start_offset = properties.start_offset;
                    processNode = true;
                }

                if (processNode === false) return;

                // Find the end node
                if (isEndNode == 0) {
                    end_offset = properties.end_offset;
                    var foundEnd = true;
                }

                if (this.nodeType == 1 && processNode === true) { // HTML
                    newElement = $.highlighter.processHtmlNode(node, start_offset, end_offset);
                } else if (this.nodeType == 3 && processNode === true) { // Text
                    newElement = $.highlighter.processTxtNode(node, start_offset, end_offset);
                }

                if (newElement) {
                    $(newElement).attr('data-onid', properties.onid);
                    $(newElement).addClass('note-' + properties.onid);
                }

                if (foundEnd === true) processNode = false; // We found the end so stop processing
            });
        }

        $(obj).html($(obj).html()); // reset the dom 

        return processNode; 
    }
	
    $.highlighter.highlight = function(parentNode, properties) {
        var highlighting = $.highlighter.highlightNode(parentNode, properties);
        var i = 0; // prevent infinate loops

        while (highlighting === true && i < 5) { // if true we have selected cross paragraph and need to keep highlighting
            parentNode = $(parentNode).next($.highlighter.settings.parentNode)[0];
            highlighting = $.highlighter.highlightNode(parentNode, properties, true);
            i++;
        }
    }
	// Process a text node with a wrapper
    $.highlighter.processTxtNode = function(textNode, start_offset, end_offset) {
    	var preText     = document.createTextNode(textNode.nodeValue.substring(0, start_offset));
        var wrapper     = $.highlighter.wrapTxt(document.createTextNode(textNode.nodeValue.substring(start_offset, end_offset)));
        var postText    = document.createTextNode(textNode.nodeValue.substring(end_offset, textNode.length));
        var newText     = document.createDocumentFragment();
        newText.appendChild(preText);
        newText.appendChild(wrapper);
        newText.appendChild(postText);
        textNode.parentNode.replaceChild(newText, textNode);

        return wrapper;
    }

    // Process html node with a wrapper
    $.highlighter.processHtmlNode = function(htmlNode, start_offset, end_offset) {
        if (htmlNode.nodeValue == '') return;
        var preHtml         = document.createTextNode(htmlNode.innerText.substring(0, start_offset));
    	var wrapHtmlTxt     = $.highlighter.wrapHtml(htmlNode.innerText.substring(start_offset, end_offset));
        var postHtml        = document.createTextNode(htmlNode.innerText.substring(end_offset, htmlNode.innerHTML.length)); 
        if (htmlNode.hasChildNodes()) {
            while (htmlNode.childNodes.length > 0) {
                htmlNode.removeChild(htmlNode.firstChild);
            }
        }

        htmlNode.appendChild(preHtml);
        htmlNode.appendChild(wrapHtmlTxt);
        htmlNode.appendChild(postHtml);

        return wrapHtmlTxt;
    }

    // Wrap text
    $.highlighter.wrapTxt = function(txt) {
        var wrapper = document.createElement($.highlighter.settings.wrapperElement);
        wrapper.className = $.highlighter.settings.wrapperClass;
        wrapper.appendChild(txt);
        return wrapper;
    }

    // Wrap html
    $.highlighter.wrapHtml = function(html) {
        var wrapper = document.createElement($.highlighter.settings.wrapperElement);
        wrapper.className = $.highlighter.settings.wrapperClass;
        wrapper.innerHTML = html;
        return wrapper;
    }

    $.highlighter.settings = {
        wrapperElement: 'span',
        wrapperClass: 'highlight-temp',
        eventListen: 'mouseup',
        eventTarget: '#osci_viewer',
        parentNode: 'p',
        onSelection: function() {},
        onEmptySelection: function() { return false; }
    };
})(jQuery);
