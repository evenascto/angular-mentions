// DOM element manipulation functions...
//
function setValue(el, value) {
    //console.log("setValue", el.nodeName, "["+value+"]");
    if (isInputOrTextAreaElement(el)) {
        el.value = value;
    }
    else {
        el.textContent = value;
    }
}
export function getValue(el) {
    return isInputOrTextAreaElement(el) ? el.value : el.textContent;
}
export function insertValue(el, start, end, insertHTML, text, iframe, noRecursion) {
    if (noRecursion === void 0) { noRecursion = false; }
    //console.log("insertValue", el.nodeName, start, end, "["+text+"]", el);
    if (isTextElement(el)) {
        var val = getValue(el);
        setValue(el, val.substring(0, start) + text + val.substring(end, val.length));
        setCaretPosition(el, start + text.length, iframe);
    }
    else if (!noRecursion) {
        var selObj = getWindowSelection(iframe);
        if (selObj && selObj.rangeCount > 0) {
            // var selRange = selObj.getRangeAt(0);
            // var position = selRange.startOffset;
            // var anchorNode = selObj.anchorNode;
            // if (text.endsWith(' ')) {
            //   text = text.substring(0, text.length-1) + '\xA0';
            // }
            // insertValue(<HTMLInputElement>anchorNode, position - (end - start), position, text, iframe, true);
            if (insertHTML) {
                insertElement(selObj, start, end, text, iframe);
            }
            else {
                var selRange = selObj.getRangeAt(0);
                var position = selRange.startOffset;
                var anchorNode = selObj.anchorNode;
                // if (text.endsWith(' ')) {
                //   text = text.substring(0, text.length-1) + '\xA0';
                // }
                insertValue(anchorNode, position - (end - start), position, insertHTML, text, iframe, true);
            }
        }
    }
}
function makeAngularElements(el) {
    if (!(el instanceof HTMLElement)) {
        return;
    }
    el.setAttribute("_ngcontent-c0", '');
    for (var i in el.children) {
        makeAngularElements(el.children[i]);
    }
}
function insertElement(selObj, start, end, text, iframe) {
    if (!(text instanceof HTMLElement)) {
        var e = getDocument(iframe).createElement("span");
        e.innerHTML = text;
        text = e;
    }
    //make the element an angular element
    makeAngularElements(text);
    var anchorNode = selObj.anchorNode;
    //Get the text that preceeded and followed what was typed as part of the autocomplete
    var beforeString = anchorNode.nodeValue.substr(0, start);
    var afterString = anchorNode.nodeValue.substring(end);
    //console.log("beforeString:",beforeString);
    //console.log("afterString:",afterString);
    //removing previous typed search string
    var positionChar = beforeString.lastIndexOf('@');
    //console.log(" positionChar:", positionChar);
    if (positionChar < 0) {
        beforeString = beforeString + '@';
        var positionChar = beforeString.lastIndexOf('@');
        //console.log(" beforeString 2:", beforeString);
    }
    beforeString = beforeString.substring(0, positionChar + 1);
    //console.log("beforeString final:",beforeString);
    //Remove the text
    anchorNode.nodeValue = "";
    //Create spans for the preceeding text & following text
    var beforeEl = getDocument(iframe).createElement("span");
    beforeEl.innerText = beforeString;
    var afterEl = getDocument(iframe).createElement("span");
    afterEl.innerText = afterString;
    //Insert the spans + the mention element
    anchorNode.parentNode.insertBefore(afterEl, anchorNode.nextSibling);
    anchorNode.parentNode.insertBefore(text, anchorNode.nextSibling);
    anchorNode.parentNode.insertBefore(beforeEl, anchorNode.nextSibling);
    //Create a range located ater the mention
    var range = getDocument(iframe).createRange();
    range.selectNode(afterEl);
    range.setStart(afterEl, 0);
    range.setEnd(afterEl, 0);
    //Move the cursor to that spot
    range.collapse(false);
    selObj.removeAllRanges();
    selObj.addRange(range);
}
export function isInputOrTextAreaElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA');
}
;
export function isTextElement(el) {
    return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA' || el.nodeName == '#text');
}
;
export function setCaretPosition(el, pos, iframe) {
    if (iframe === void 0) { iframe = null; }
    //console.log("setCaretPosition", pos, el, iframe==null);
    if (isInputOrTextAreaElement(el) && el.selectionStart) {
        el.focus();
        el.setSelectionRange(pos, pos);
    }
    else {
        var range = getDocument(iframe).createRange();
        range.setStart(el, pos);
        range.collapse(true);
        var sel = getWindowSelection(iframe);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
export function getCaretPosition(el, iframe) {
    if (iframe === void 0) { iframe = null; }
    //console.log("getCaretPosition", el);
    if (isInputOrTextAreaElement(el)) {
        var val = el.value;
        return val.slice(0, el.selectionStart).length;
    }
    else {
        var selObj = getWindowSelection(iframe); //window.getSelection();
        if (selObj.rangeCount > 0) {
            var selRange = selObj.getRangeAt(0);
            var preCaretRange = selRange.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(selRange.endContainer, selRange.endOffset);
            var position = preCaretRange.toString().length;
            return position;
        }
    }
}
// Based on ment.io functions...
//
function getDocument(iframe) {
    if (!iframe) {
        return document;
    }
    else {
        return iframe.contentWindow.document;
    }
}
function getWindowSelection(iframe) {
    if (!iframe) {
        return window.getSelection();
    }
    else {
        return iframe.contentWindow.getSelection();
    }
}
export function getContentEditableCaretCoords(ctx) {
    var markerTextChar = '\ufeff';
    var markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
    var doc = getDocument(ctx ? ctx.iframe : null);
    var sel = getWindowSelection(ctx ? ctx.iframe : null);
    var prevRange = sel.getRangeAt(0);
    // create new range and set postion using prevRange
    var range = doc.createRange();
    range.setStart(sel.anchorNode, prevRange.startOffset);
    range.setEnd(sel.anchorNode, prevRange.startOffset);
    range.collapse(false);
    // Create the marker element containing a single invisible character
    // using DOM methods and insert it at the position in the range
    var markerEl = doc.createElement('span');
    markerEl.id = markerId;
    markerEl.appendChild(doc.createTextNode(markerTextChar));
    range.insertNode(markerEl);
    sel.removeAllRanges();
    sel.addRange(prevRange);
    var coordinates = {
        left: 0,
        top: markerEl.offsetHeight
    };
    localToRelativeCoordinates(ctx, markerEl, coordinates);
    markerEl.parentNode.removeChild(markerEl);
    return coordinates;
}
function localToRelativeCoordinates(ctx, element, coordinates) {
    var obj = element;
    var iframe = ctx ? ctx.iframe : null;
    while (obj) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        coordinates.left += obj.offsetLeft + obj.clientLeft;
        coordinates.top += obj.offsetTop + obj.clientTop;
        obj = obj.offsetParent;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
    obj = element;
    iframe = ctx ? ctx.iframe : null;
    while (obj !== getDocument(null).body && obj != null) {
        if (ctx.parent != null && ctx.parent == obj) {
            break;
        }
        if (obj.scrollTop && obj.scrollTop > 0) {
            coordinates.top -= obj.scrollTop;
        }
        if (obj.scrollLeft && obj.scrollLeft > 0) {
            coordinates.left -= obj.scrollLeft;
        }
        obj = obj.parentNode;
        if (!obj && iframe) {
            obj = iframe;
            iframe = null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi11dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItbWVudGlvbnMvIiwic291cmNlcyI6WyJsaWIvbWVudGlvbi11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3Q0FBd0M7QUFDeEMsRUFBRTtBQUVGLFNBQVMsUUFBUSxDQUFDLEVBQW9CLEVBQUUsS0FBVTtJQUNoRCxzREFBc0Q7SUFDdEQsSUFBSSx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNoQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztLQUNsQjtTQUNJO1FBQ0gsRUFBRSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7S0FDeEI7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxFQUFvQjtJQUMzQyxPQUFPLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQ2xFLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUN6QixFQUFvQixFQUNwQixLQUFhLEVBQ2IsR0FBVyxFQUNYLFVBQW1CLEVBQ25CLElBQVMsRUFDVCxNQUF5QixFQUN6QixXQUE0QjtJQUE1Qiw0QkFBQSxFQUFBLG1CQUE0QjtJQUU1Qix3RUFBd0U7SUFDeEUsSUFBSSxhQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDckIsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxN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QUFJLENBQUM7SUFDakMsT0FBTyxHQUFHLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1FBQ3BELElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUU7WUFDM0MsTUFBTTtTQUNQO1FBQ0QsSUFBSSxHQUFHLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFO1lBQ3RDLFdBQVcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQztTQUNsQztRQUNELElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRTtZQUN4QyxXQUFXLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUM7U0FDcEM7UUFDRCxHQUFHLEdBQWdCLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLEVBQUU7WUFDbEIsR0FBRyxHQUFHLE1BQU0sQ0FBQztZQUNiLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDZjtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIERPTSBlbGVtZW50IG1hbmlwdWxhdGlvbiBmdW5jdGlvbnMuLi5cclxuLy9cclxuXHJcbmZ1bmN0aW9uIHNldFZhbHVlKGVsOiBIVE1MSW5wdXRFbGVtZW50LCB2YWx1ZTogYW55KSB7XHJcbiAgLy9jb25zb2xlLmxvZyhcInNldFZhbHVlXCIsIGVsLm5vZGVOYW1lLCBcIltcIit2YWx1ZStcIl1cIik7XHJcbiAgaWYgKGlzSW5wdXRPclRleHRBcmVhRWxlbWVudChlbCkpIHtcclxuICAgIGVsLnZhbHVlID0gdmFsdWU7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgZWwudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRWYWx1ZShlbDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gIHJldHVybiBpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQoZWwpID8gZWwudmFsdWUgOiBlbC50ZXh0Q29udGVudDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc2VydFZhbHVlKFxyXG4gIGVsOiBIVE1MSW5wdXRFbGVtZW50LFxyXG4gIHN0YXJ0OiBudW1iZXIsXHJcbiAgZW5kOiBudW1iZXIsXHJcbiAgaW5zZXJ0SFRNTDogYm9vbGVhbixcclxuICB0ZXh0OiBhbnksXHJcbiAgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCxcclxuICBub1JlY3Vyc2lvbjogYm9vbGVhbiA9IGZhbHNlXHJcbikge1xyXG4gIC8vY29uc29sZS5sb2coXCJpbnNlcnRWYWx1ZVwiLCBlbC5ub2RlTmFtZSwgc3RhcnQsIGVuZCwgXCJbXCIrdGV4dCtcIl1cIiwgZWwpO1xyXG4gIGlmIChpc1RleHRFbGVtZW50KGVsKSkge1xyXG4gICAgbGV0IHZhbCA9IGdldFZhbHVlKGVsKTtcclxuICAgIHNldFZhbHVlKGVsLCB2YWwuc3Vic3RyaW5nKDAsIHN0YXJ0KSArIHRleHQgKyB2YWwuc3Vic3RyaW5nKGVuZCwgdmFsLmxlbmd0aCkpO1xyXG4gICAgc2V0Q2FyZXRQb3NpdGlvbihlbCwgc3RhcnQgKyB0ZXh0Lmxlbmd0aCwgaWZyYW1lKTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIW5vUmVjdXJzaW9uKSB7XHJcbiAgICBsZXQgc2VsT2JqOiBTZWxlY3Rpb24gPSBnZXRXaW5kb3dTZWxlY3Rpb24oaWZyYW1lKTtcclxuICAgIGlmIChzZWxPYmogJiYgc2VsT2JqLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgIC8vIHZhciBzZWxSYW5nZSA9IHNlbE9iai5nZXRSYW5nZUF0KDApO1xyXG4gICAgICAvLyB2YXIgcG9zaXRpb24gPSBzZWxSYW5nZS5zdGFydE9mZnNldDtcclxuICAgICAgLy8gdmFyIGFuY2hvck5vZGUgPSBzZWxPYmouYW5jaG9yTm9kZTtcclxuICAgICAgLy8gaWYgKHRleHQuZW5kc1dpdGgoJyAnKSkge1xyXG4gICAgICAvLyAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxlbmd0aC0xKSArICdcXHhBMCc7XHJcbiAgICAgIC8vIH1cclxuICAgICAgLy8gaW5zZXJ0VmFsdWUoPEhUTUxJbnB1dEVsZW1lbnQ+YW5jaG9yTm9kZSwgcG9zaXRpb24gLSAoZW5kIC0gc3RhcnQpLCBwb3NpdGlvbiwgdGV4dCwgaWZyYW1lLCB0cnVlKTtcclxuXHJcbiAgICAgIGlmIChpbnNlcnRIVE1MKSB7XHJcbiAgICAgICAgaW5zZXJ0RWxlbWVudChzZWxPYmosIHN0YXJ0LCBlbmQsIHRleHQsIGlmcmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdmFyIHNlbFJhbmdlID0gc2VsT2JqLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gc2VsUmFuZ2Uuc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgdmFyIGFuY2hvck5vZGUgPSBzZWxPYmouYW5jaG9yTm9kZTtcclxuICAgICAgICAvLyBpZiAodGV4dC5lbmRzV2l0aCgnICcpKSB7XHJcbiAgICAgICAgLy8gICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGgtMSkgKyAnXFx4QTAnO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgaW5zZXJ0VmFsdWUoPEhUTUxJbnB1dEVsZW1lbnQ+YW5jaG9yTm9kZSwgcG9zaXRpb24gLSAoZW5kIC0gc3RhcnQpLCBwb3NpdGlvbiwgaW5zZXJ0SFRNTCwgdGV4dCwgaWZyYW1lLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gbWFrZUFuZ3VsYXJFbGVtZW50cyhlbCkge1xyXG4gIGlmICghKGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIGVsLnNldEF0dHJpYnV0ZShcIl9uZ2NvbnRlbnQtYzBcIiwgJycpO1xyXG4gIGZvciAobGV0IGkgaW4gZWwuY2hpbGRyZW4pIHtcclxuICAgIG1ha2VBbmd1bGFyRWxlbWVudHMoZWwuY2hpbGRyZW5baV0pXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbnNlcnRFbGVtZW50KFxyXG4gIHNlbE9iajogU2VsZWN0aW9uLFxyXG4gIHN0YXJ0OiBudW1iZXIsXHJcbiAgZW5kOiBudW1iZXIsXHJcbiAgdGV4dDogSFRNTEVsZW1lbnQsXHJcbiAgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudFxyXG4pIHtcclxuICBpZiAoISh0ZXh0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICB2YXIgZSA9IGdldERvY3VtZW50KGlmcmFtZSkuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICBlLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICB0ZXh0ID0gZTtcclxuICB9XHJcblxyXG4gIC8vbWFrZSB0aGUgZWxlbWVudCBhbiBhbmd1bGFyIGVsZW1lbnRcclxuICBtYWtlQW5ndWxhckVsZW1lbnRzKHRleHQpO1xyXG5cclxuICB2YXIgYW5jaG9yTm9kZSA9IHNlbE9iai5hbmNob3JOb2RlO1xyXG5cclxuICAvL0dldCB0aGUgdGV4dCB0aGF0IHByZWNlZWRlZCBhbmQgZm9sbG93ZWQgd2hhdCB3YXMgdHlwZWQgYXMgcGFydCBvZiB0aGUgYXV0b2NvbXBsZXRlXHJcbiAgdmFyIGJlZm9yZVN0cmluZyA9IGFuY2hvck5vZGUubm9kZVZhbHVlLnN1YnN0cigwLCBzdGFydCk7XHJcbiAgdmFyIGFmdGVyU3RyaW5nID0gYW5jaG9yTm9kZS5ub2RlVmFsdWUuc3Vic3RyaW5nKGVuZCk7XHJcblxyXG4gICAvL2NvbnNvbGUubG9nKFwiYmVmb3JlU3RyaW5nOlwiLGJlZm9yZVN0cmluZyk7XHJcbiAgIC8vY29uc29sZS5sb2coXCJhZnRlclN0cmluZzpcIixhZnRlclN0cmluZyk7XHJcblxyXG4gLy9yZW1vdmluZyBwcmV2aW91cyB0eXBlZCBzZWFyY2ggc3RyaW5nXHJcbiB2YXIgcG9zaXRpb25DaGFyID0gYmVmb3JlU3RyaW5nLmxhc3RJbmRleE9mKCdAJyk7XHJcblxyXG4gLy9jb25zb2xlLmxvZyhcIiBwb3NpdGlvbkNoYXI6XCIsIHBvc2l0aW9uQ2hhcik7XHJcblxyXG4gaWYocG9zaXRpb25DaGFyIDwgMCkge1xyXG4gIGJlZm9yZVN0cmluZyA9IGJlZm9yZVN0cmluZyArICdAJztcclxuICB2YXIgcG9zaXRpb25DaGFyID0gYmVmb3JlU3RyaW5nLmxhc3RJbmRleE9mKCdAJyk7XHJcbiAgLy9jb25zb2xlLmxvZyhcIiBiZWZvcmVTdHJpbmcgMjpcIiwgYmVmb3JlU3RyaW5nKTtcclxufVxyXG5cclxuXHJcbiBiZWZvcmVTdHJpbmcgPSBiZWZvcmVTdHJpbmcuc3Vic3RyaW5nKDAsICBwb3NpdGlvbkNoYXIgKyAxKTtcclxuIC8vY29uc29sZS5sb2coXCJiZWZvcmVTdHJpbmcgZmluYWw6XCIsYmVmb3JlU3RyaW5nKTtcclxuXHJcbiAgLy9SZW1vdmUgdGhlIHRleHRcclxuICBhbmNob3JOb2RlLm5vZGVWYWx1ZSA9IFwiXCI7XHJcblxyXG4gIC8vQ3JlYXRlIHNwYW5zIGZvciB0aGUgcHJlY2VlZGluZyB0ZXh0ICYgZm9sbG93aW5nIHRleHRcclxuICBsZXQgYmVmb3JlRWwgPSBnZXREb2N1bWVudChpZnJhbWUpLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gIGJlZm9yZUVsLmlubmVyVGV4dCA9IGJlZm9yZVN0cmluZztcclxuICBsZXQgYWZ0ZXJFbCA9IGdldERvY3VtZW50KGlmcmFtZSkuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgYWZ0ZXJFbC5pbm5lclRleHQgPSBhZnRlclN0cmluZztcclxuXHJcbiAgLy9JbnNlcnQgdGhlIHNwYW5zICsgdGhlIG1lbnRpb24gZWxlbWVudFxyXG4gIGFuY2hvck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYWZ0ZXJFbCwgYW5jaG9yTm9kZS5uZXh0U2libGluZyk7XHJcbiAgYW5jaG9yTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0ZXh0LCBhbmNob3JOb2RlLm5leHRTaWJsaW5nKTtcclxuICBhbmNob3JOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGJlZm9yZUVsLCBhbmNob3JOb2RlLm5leHRTaWJsaW5nKTtcclxuXHJcbiAgLy9DcmVhdGUgYSByYW5nZSBsb2NhdGVkIGF0ZXIgdGhlIG1lbnRpb25cclxuICBsZXQgcmFuZ2UgPSBnZXREb2N1bWVudChpZnJhbWUpLmNyZWF0ZVJhbmdlKCk7XHJcbiAgcmFuZ2Uuc2VsZWN0Tm9kZShhZnRlckVsKTtcclxuICByYW5nZS5zZXRTdGFydChhZnRlckVsLCAwKTtcclxuICByYW5nZS5zZXRFbmQoYWZ0ZXJFbCwgMCk7XHJcblxyXG4gIC8vTW92ZSB0aGUgY3Vyc29yIHRvIHRoYXQgc3BvdFxyXG4gIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcclxuICBzZWxPYmoucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgc2VsT2JqLmFkZFJhbmdlKHJhbmdlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5wdXRPclRleHRBcmVhRWxlbWVudChlbDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICByZXR1cm4gZWwgIT0gbnVsbCAmJiAoZWwubm9kZU5hbWUgPT0gJ0lOUFVUJyB8fCBlbC5ub2RlTmFtZSA9PSAnVEVYVEFSRUEnKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1RleHRFbGVtZW50KGVsOiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBlbCAhPSBudWxsICYmIChlbC5ub2RlTmFtZSA9PSAnSU5QVVQnIHx8IGVsLm5vZGVOYW1lID09ICdURVhUQVJFQScgfHwgZWwubm9kZU5hbWUgPT0gJyN0ZXh0Jyk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FyZXRQb3NpdGlvbihlbDogSFRNTElucHV0RWxlbWVudCwgcG9zOiBudW1iZXIsIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgPSBudWxsKSB7XHJcbiAgLy9jb25zb2xlLmxvZyhcInNldENhcmV0UG9zaXRpb25cIiwgcG9zLCBlbCwgaWZyYW1lPT1udWxsKTtcclxuICBpZiAoaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsKSAmJiBlbC5zZWxlY3Rpb25TdGFydCkge1xyXG4gICAgZWwuZm9jdXMoKTtcclxuICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBsZXQgcmFuZ2UgPSBnZXREb2N1bWVudChpZnJhbWUpLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZXRTdGFydChlbCwgcG9zKTtcclxuICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xyXG4gICAgbGV0IHNlbCA9IGdldFdpbmRvd1NlbGVjdGlvbihpZnJhbWUpO1xyXG4gICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXJldFBvc2l0aW9uKGVsOiBIVE1MSW5wdXRFbGVtZW50LCBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50ID0gbnVsbCkge1xyXG4gIC8vY29uc29sZS5sb2coXCJnZXRDYXJldFBvc2l0aW9uXCIsIGVsKTtcclxuICBpZiAoaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsKSkge1xyXG4gICAgdmFyIHZhbCA9IGVsLnZhbHVlO1xyXG4gICAgcmV0dXJuIHZhbC5zbGljZSgwLCBlbC5zZWxlY3Rpb25TdGFydCkubGVuZ3RoO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHZhciBzZWxPYmogPSBnZXRXaW5kb3dTZWxlY3Rpb24oaWZyYW1lKTsgLy93aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICBpZiAoc2VsT2JqLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgIHZhciBzZWxSYW5nZSA9IHNlbE9iai5nZXRSYW5nZUF0KDApO1xyXG4gICAgICB2YXIgcHJlQ2FyZXRSYW5nZSA9IHNlbFJhbmdlLmNsb25lUmFuZ2UoKTtcclxuICAgICAgcHJlQ2FyZXRSYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWwpO1xyXG4gICAgICBwcmVDYXJldFJhbmdlLnNldEVuZChzZWxSYW5nZS5lbmRDb250YWluZXIsIHNlbFJhbmdlLmVuZE9mZnNldCk7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IHByZUNhcmV0UmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEJhc2VkIG9uIG1lbnQuaW8gZnVuY3Rpb25zLi4uXHJcbi8vXHJcblxyXG5mdW5jdGlvbiBnZXREb2N1bWVudChpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KSB7XHJcbiAgaWYgKCFpZnJhbWUpIHtcclxuICAgIHJldHVybiBkb2N1bWVudDtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0V2luZG93U2VsZWN0aW9uKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpOiBTZWxlY3Rpb24ge1xyXG4gIGlmICghaWZyYW1lKSB7XHJcbiAgICByZXR1cm4gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGVudEVkaXRhYmxlQ2FyZXRDb29yZHMoY3R4OiB7IGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQsIHBhcmVudD86IEVsZW1lbnQgfSkge1xyXG4gIGxldCBtYXJrZXJUZXh0Q2hhciA9ICdcXHVmZWZmJztcclxuICBsZXQgbWFya2VySWQgPSAnc2VsXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArICdfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5zdWJzdHIoMik7XHJcbiAgbGV0IGRvYyA9IGdldERvY3VtZW50KGN0eCA/IGN0eC5pZnJhbWUgOiBudWxsKTtcclxuICBsZXQgc2VsID0gZ2V0V2luZG93U2VsZWN0aW9uKGN0eCA/IGN0eC5pZnJhbWUgOiBudWxsKTtcclxuICBsZXQgcHJldlJhbmdlID0gc2VsLmdldFJhbmdlQXQoMCk7XHJcblxyXG4gIC8vIGNyZWF0ZSBuZXcgcmFuZ2UgYW5kIHNldCBwb3N0aW9uIHVzaW5nIHByZXZSYW5nZVxyXG4gIGxldCByYW5nZSA9IGRvYy5jcmVhdGVSYW5nZSgpO1xyXG4gIHJhbmdlLnNldFN0YXJ0KHNlbC5hbmNob3JOb2RlLCBwcmV2UmFuZ2Uuc3RhcnRPZmZzZXQpO1xyXG4gIHJhbmdlLnNldEVuZChzZWwuYW5jaG9yTm9kZSwgcHJldlJhbmdlLnN0YXJ0T2Zmc2V0KTtcclxuICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgbWFya2VyIGVsZW1lbnQgY29udGFpbmluZyBhIHNpbmdsZSBpbnZpc2libGUgY2hhcmFjdGVyXHJcbiAgLy8gdXNpbmcgRE9NIG1ldGhvZHMgYW5kIGluc2VydCBpdCBhdCB0aGUgcG9zaXRpb24gaW4gdGhlIHJhbmdlXHJcbiAgbGV0IG1hcmtlckVsID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICBtYXJrZXJFbC5pZCA9IG1hcmtlcklkO1xyXG4gIG1hcmtlckVsLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShtYXJrZXJUZXh0Q2hhcikpO1xyXG4gIHJhbmdlLmluc2VydE5vZGUobWFya2VyRWwpO1xyXG4gIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICBzZWwuYWRkUmFuZ2UocHJldlJhbmdlKTtcclxuXHJcbiAgbGV0IGNvb3JkaW5hdGVzID0ge1xyXG4gICAgbGVmdDogMCxcclxuICAgIHRvcDogbWFya2VyRWwub2Zmc2V0SGVpZ2h0XHJcbiAgfTtcclxuXHJcbiAgbG9jYWxUb1JlbGF0aXZlQ29vcmRpbmF0ZXMoY3R4LCBtYXJrZXJFbCwgY29vcmRpbmF0ZXMpO1xyXG5cclxuICBtYXJrZXJFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1hcmtlckVsKTtcclxuICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvY2FsVG9SZWxhdGl2ZUNvb3JkaW5hdGVzKFxyXG4gIGN0eDogeyBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LCBwYXJlbnQ/OiBFbGVtZW50IH0sXHJcbiAgZWxlbWVudDogRWxlbWVudCxcclxuICBjb29yZGluYXRlczogeyB0b3A6IG51bWJlcjsgbGVmdDogbnVtYmVyIH1cclxuKSB7XHJcbiAgbGV0IG9iaiA9IDxIVE1MRWxlbWVudD5lbGVtZW50O1xyXG4gIGxldCBpZnJhbWUgPSBjdHggPyBjdHguaWZyYW1lIDogbnVsbDtcclxuICB3aGlsZSAob2JqKSB7XHJcbiAgICBpZiAoY3R4LnBhcmVudCAhPSBudWxsICYmIGN0eC5wYXJlbnQgPT0gb2JqKSB7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgY29vcmRpbmF0ZXMubGVmdCArPSBvYmoub2Zmc2V0TGVmdCArIG9iai5jbGllbnRMZWZ0O1xyXG4gICAgY29vcmRpbmF0ZXMudG9wICs9IG9iai5vZmZzZXRUb3AgKyBvYmouY2xpZW50VG9wO1xyXG4gICAgb2JqID0gPEhUTUxFbGVtZW50Pm9iai5vZmZzZXRQYXJlbnQ7XHJcbiAgICBpZiAoIW9iaiAmJiBpZnJhbWUpIHtcclxuICAgICAgb2JqID0gaWZyYW1lO1xyXG4gICAgICBpZnJhbWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuICBvYmogPSA8SFRNTEVsZW1lbnQ+ZWxlbWVudDtcclxuICBpZnJhbWUgPSBjdHggPyBjdHguaWZyYW1lIDogbnVsbDtcclxuICB3aGlsZSAob2JqICE9PSBnZXREb2N1bWVudChudWxsKS5ib2R5ICYmIG9iaiAhPSBudWxsKSB7XHJcbiAgICBpZiAoY3R4LnBhcmVudCAhPSBudWxsICYmIGN0eC5wYXJlbnQgPT0gb2JqKSB7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaWYgKG9iai5zY3JvbGxUb3AgJiYgb2JqLnNjcm9sbFRvcCA+IDApIHtcclxuICAgICAgY29vcmRpbmF0ZXMudG9wIC09IG9iai5zY3JvbGxUb3A7XHJcbiAgICB9XHJcbiAgICBpZiAob2JqLnNjcm9sbExlZnQgJiYgb2JqLnNjcm9sbExlZnQgPiAwKSB7XHJcbiAgICAgIGNvb3JkaW5hdGVzLmxlZnQgLT0gb2JqLnNjcm9sbExlZnQ7XHJcbiAgICB9XHJcbiAgICBvYmogPSA8SFRNTEVsZW1lbnQ+b2JqLnBhcmVudE5vZGU7XHJcbiAgICBpZiAoIW9iaiAmJiBpZnJhbWUpIHtcclxuICAgICAgb2JqID0gaWZyYW1lO1xyXG4gICAgICBpZnJhbWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=