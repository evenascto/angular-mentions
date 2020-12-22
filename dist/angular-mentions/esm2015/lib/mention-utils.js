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
export function insertValue(el, start, end, insertHTML, text, iframe, noRecursion = false) {
    //console.log("insertValue", el.nodeName, start, end, "["+text+"]", el);
    if (isTextElement(el)) {
        let val = getValue(el);
        setValue(el, val.substring(0, start) + text + val.substring(end, val.length));
        setCaretPosition(el, start + text.length, iframe);
    }
    else if (!noRecursion) {
        let selObj = getWindowSelection(iframe);
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
    for (let i in el.children) {
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
    let beforeEl = getDocument(iframe).createElement("span");
    beforeEl.innerText = beforeString;
    let afterEl = getDocument(iframe).createElement("span");
    afterEl.innerText = afterString;
    //Insert the spans + the mention element
    anchorNode.parentNode.insertBefore(afterEl, anchorNode.nextSibling);
    anchorNode.parentNode.insertBefore(text, anchorNode.nextSibling);
    anchorNode.parentNode.insertBefore(beforeEl, anchorNode.nextSibling);
    //Create a range located ater the mention
    let range = getDocument(iframe).createRange();
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
export function setCaretPosition(el, pos, iframe = null) {
    //console.log("setCaretPosition", pos, el, iframe==null);
    if (isInputOrTextAreaElement(el) && el.selectionStart) {
        el.focus();
        el.setSelectionRange(pos, pos);
    }
    else {
        let range = getDocument(iframe).createRange();
        range.setStart(el, pos);
        range.collapse(true);
        let sel = getWindowSelection(iframe);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
export function getCaretPosition(el, iframe = null) {
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
    let markerTextChar = '\ufeff';
    let markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
    let doc = getDocument(ctx ? ctx.iframe : null);
    let sel = getWindowSelection(ctx ? ctx.iframe : null);
    let prevRange = sel.getRangeAt(0);
    // create new range and set postion using prevRange
    let range = doc.createRange();
    range.setStart(sel.anchorNode, prevRange.startOffset);
    range.setEnd(sel.anchorNode, prevRange.startOffset);
    range.collapse(false);
    // Create the marker element containing a single invisible character
    // using DOM methods and insert it at the position in the range
    let markerEl = doc.createElement('span');
    markerEl.id = markerId;
    markerEl.appendChild(doc.createTextNode(markerTextChar));
    range.insertNode(markerEl);
    sel.removeAllRanges();
    sel.addRange(prevRange);
    let coordinates = {
        left: 0,
        top: markerEl.offsetHeight
    };
    localToRelativeCoordinates(ctx, markerEl, coordinates);
    markerEl.parentNode.removeChild(markerEl);
    return coordinates;
}
function localToRelativeCoordinates(ctx, element, coordinates) {
    let obj = element;
    let iframe = ctx ? ctx.iframe : null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi11dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItbWVudGlvbnMvIiwic291cmNlcyI6WyJsaWIvbWVudGlvbi11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3Q0FBd0M7QUFDeEMsRUFBRTtBQUVGLFNBQVMsUUFBUSxDQUFDLEVBQW9CLEVBQUUsS0FBVTtJQUNoRCxzREFBc0Q7SUFDdEQsSUFBSSx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNoQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztLQUNsQjtTQUNJO1FBQ0gsRUFBRSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7S0FDeEI7QUFDSCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxFQUFvQjtJQUMzQyxPQUFPLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQ2xFLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUN6QixFQUFvQixFQUNwQixLQUFhLEVBQ2IsR0FBVyxFQUNYLFVBQW1CLEVBQ25CLElBQVMsRUFDVCxNQUF5QixFQUN6QixjQUF1QixLQUFLO0lBRTVCLHdFQUF3RTtJQUN4RSxJQUFJLGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNyQixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDOUUsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ25E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SUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFDcEQsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRTtZQUMzQyxNQUFNO1NBQ1A7UUFDRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUU7WUFDdEMsV0FBVyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDO1NBQ2xDO1FBQ0QsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLFdBQVcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQztTQUNwQztRQUNELEdBQUcsR0FBZ0IsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUNsQyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sRUFBRTtZQUNsQixHQUFHLEdBQUcsTUFBTSxDQUFDO1lBQ2IsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNmO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRE9NIGVsZW1lbnQgbWFuaXB1bGF0aW9uIGZ1bmN0aW9ucy4uLlxyXG4vL1xyXG5cclxuZnVuY3Rpb24gc2V0VmFsdWUoZWw6IEhUTUxJbnB1dEVsZW1lbnQsIHZhbHVlOiBhbnkpIHtcclxuICAvL2NvbnNvbGUubG9nKFwic2V0VmFsdWVcIiwgZWwubm9kZU5hbWUsIFwiW1wiK3ZhbHVlK1wiXVwiKTtcclxuICBpZiAoaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsKSkge1xyXG4gICAgZWwudmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBlbC50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFZhbHVlKGVsOiBIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgcmV0dXJuIGlzSW5wdXRPclRleHRBcmVhRWxlbWVudChlbCkgPyBlbC52YWx1ZSA6IGVsLnRleHRDb250ZW50O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0VmFsdWUoXHJcbiAgZWw6IEhUTUxJbnB1dEVsZW1lbnQsXHJcbiAgc3RhcnQ6IG51bWJlcixcclxuICBlbmQ6IG51bWJlcixcclxuICBpbnNlcnRIVE1MOiBib29sZWFuLFxyXG4gIHRleHQ6IGFueSxcclxuICBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LFxyXG4gIG5vUmVjdXJzaW9uOiBib29sZWFuID0gZmFsc2VcclxuKSB7XHJcbiAgLy9jb25zb2xlLmxvZyhcImluc2VydFZhbHVlXCIsIGVsLm5vZGVOYW1lLCBzdGFydCwgZW5kLCBcIltcIit0ZXh0K1wiXVwiLCBlbCk7XHJcbiAgaWYgKGlzVGV4dEVsZW1lbnQoZWwpKSB7XHJcbiAgICBsZXQgdmFsID0gZ2V0VmFsdWUoZWwpO1xyXG4gICAgc2V0VmFsdWUoZWwsIHZhbC5zdWJzdHJpbmcoMCwgc3RhcnQpICsgdGV4dCArIHZhbC5zdWJzdHJpbmcoZW5kLCB2YWwubGVuZ3RoKSk7XHJcbiAgICBzZXRDYXJldFBvc2l0aW9uKGVsLCBzdGFydCArIHRleHQubGVuZ3RoLCBpZnJhbWUpO1xyXG4gIH1cclxuICBlbHNlIGlmICghbm9SZWN1cnNpb24pIHtcclxuICAgIGxldCBzZWxPYmo6IFNlbGVjdGlvbiA9IGdldFdpbmRvd1NlbGVjdGlvbihpZnJhbWUpO1xyXG4gICAgaWYgKHNlbE9iaiAmJiBzZWxPYmoucmFuZ2VDb3VudCA+IDApIHtcclxuICAgICAgLy8gdmFyIHNlbFJhbmdlID0gc2VsT2JqLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIC8vIHZhciBwb3NpdGlvbiA9IHNlbFJhbmdlLnN0YXJ0T2Zmc2V0O1xyXG4gICAgICAvLyB2YXIgYW5jaG9yTm9kZSA9IHNlbE9iai5hbmNob3JOb2RlO1xyXG4gICAgICAvLyBpZiAodGV4dC5lbmRzV2l0aCgnICcpKSB7XHJcbiAgICAgIC8vICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoLTEpICsgJ1xceEEwJztcclxuICAgICAgLy8gfVxyXG4gICAgICAvLyBpbnNlcnRWYWx1ZSg8SFRNTElucHV0RWxlbWVudD5hbmNob3JOb2RlLCBwb3NpdGlvbiAtIChlbmQgLSBzdGFydCksIHBvc2l0aW9uLCB0ZXh0LCBpZnJhbWUsIHRydWUpO1xyXG5cclxuICAgICAgaWYgKGluc2VydEhUTUwpIHtcclxuICAgICAgICBpbnNlcnRFbGVtZW50KHNlbE9iaiwgc3RhcnQsIGVuZCwgdGV4dCwgaWZyYW1lKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB2YXIgc2VsUmFuZ2UgPSBzZWxPYmouZ2V0UmFuZ2VBdCgwKTtcclxuICAgICAgICB2YXIgcG9zaXRpb24gPSBzZWxSYW5nZS5zdGFydE9mZnNldDtcclxuICAgICAgICB2YXIgYW5jaG9yTm9kZSA9IHNlbE9iai5hbmNob3JOb2RlO1xyXG4gICAgICAgIC8vIGlmICh0ZXh0LmVuZHNXaXRoKCcgJykpIHtcclxuICAgICAgICAvLyAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxlbmd0aC0xKSArICdcXHhBMCc7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBpbnNlcnRWYWx1ZSg8SFRNTElucHV0RWxlbWVudD5hbmNob3JOb2RlLCBwb3NpdGlvbiAtIChlbmQgLSBzdGFydCksIHBvc2l0aW9uLCBpbnNlcnRIVE1MLCB0ZXh0LCBpZnJhbWUsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlQW5ndWxhckVsZW1lbnRzKGVsKSB7XHJcbiAgaWYgKCEoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgZWwuc2V0QXR0cmlidXRlKFwiX25nY29udGVudC1jMFwiLCAnJyk7XHJcbiAgZm9yIChsZXQgaSBpbiBlbC5jaGlsZHJlbikge1xyXG4gICAgbWFrZUFuZ3VsYXJFbGVtZW50cyhlbC5jaGlsZHJlbltpXSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluc2VydEVsZW1lbnQoXHJcbiAgc2VsT2JqOiBTZWxlY3Rpb24sXHJcbiAgc3RhcnQ6IG51bWJlcixcclxuICBlbmQ6IG51bWJlcixcclxuICB0ZXh0OiBIVE1MRWxlbWVudCxcclxuICBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50XHJcbikge1xyXG4gIGlmICghKHRleHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcclxuICAgIHZhciBlID0gZ2V0RG9jdW1lbnQoaWZyYW1lKS5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIGUuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgIHRleHQgPSBlO1xyXG4gIH1cclxuXHJcbiAgLy9tYWtlIHRoZSBlbGVtZW50IGFuIGFuZ3VsYXIgZWxlbWVudFxyXG4gIG1ha2VBbmd1bGFyRWxlbWVudHModGV4dCk7XHJcblxyXG4gIHZhciBhbmNob3JOb2RlID0gc2VsT2JqLmFuY2hvck5vZGU7XHJcblxyXG4gIC8vR2V0IHRoZSB0ZXh0IHRoYXQgcHJlY2VlZGVkIGFuZCBmb2xsb3dlZCB3aGF0IHdhcyB0eXBlZCBhcyBwYXJ0IG9mIHRoZSBhdXRvY29tcGxldGVcclxuICB2YXIgYmVmb3JlU3RyaW5nID0gYW5jaG9yTm9kZS5ub2RlVmFsdWUuc3Vic3RyKDAsIHN0YXJ0KTtcclxuICB2YXIgYWZ0ZXJTdHJpbmcgPSBhbmNob3JOb2RlLm5vZGVWYWx1ZS5zdWJzdHJpbmcoZW5kKTtcclxuXHJcbiAgIC8vY29uc29sZS5sb2coXCJiZWZvcmVTdHJpbmc6XCIsYmVmb3JlU3RyaW5nKTtcclxuICAgLy9jb25zb2xlLmxvZyhcImFmdGVyU3RyaW5nOlwiLGFmdGVyU3RyaW5nKTtcclxuXHJcbiAvL3JlbW92aW5nIHByZXZpb3VzIHR5cGVkIHNlYXJjaCBzdHJpbmdcclxuIHZhciBwb3NpdGlvbkNoYXIgPSBiZWZvcmVTdHJpbmcubGFzdEluZGV4T2YoJ0AnKTtcclxuXHJcbiAvL2NvbnNvbGUubG9nKFwiIHBvc2l0aW9uQ2hhcjpcIiwgcG9zaXRpb25DaGFyKTtcclxuXHJcbiBpZihwb3NpdGlvbkNoYXIgPCAwKSB7XHJcbiAgYmVmb3JlU3RyaW5nID0gYmVmb3JlU3RyaW5nICsgJ0AnO1xyXG4gIHZhciBwb3NpdGlvbkNoYXIgPSBiZWZvcmVTdHJpbmcubGFzdEluZGV4T2YoJ0AnKTtcclxuICAvL2NvbnNvbGUubG9nKFwiIGJlZm9yZVN0cmluZyAyOlwiLCBiZWZvcmVTdHJpbmcpO1xyXG59XHJcblxyXG5cclxuIGJlZm9yZVN0cmluZyA9IGJlZm9yZVN0cmluZy5zdWJzdHJpbmcoMCwgIHBvc2l0aW9uQ2hhciArIDEpO1xyXG4gLy9jb25zb2xlLmxvZyhcImJlZm9yZVN0cmluZyBmaW5hbDpcIixiZWZvcmVTdHJpbmcpO1xyXG5cclxuICAvL1JlbW92ZSB0aGUgdGV4dFxyXG4gIGFuY2hvck5vZGUubm9kZVZhbHVlID0gXCJcIjtcclxuXHJcbiAgLy9DcmVhdGUgc3BhbnMgZm9yIHRoZSBwcmVjZWVkaW5nIHRleHQgJiBmb2xsb3dpbmcgdGV4dFxyXG4gIGxldCBiZWZvcmVFbCA9IGdldERvY3VtZW50KGlmcmFtZSkuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgYmVmb3JlRWwuaW5uZXJUZXh0ID0gYmVmb3JlU3RyaW5nO1xyXG4gIGxldCBhZnRlckVsID0gZ2V0RG9jdW1lbnQoaWZyYW1lKS5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICBhZnRlckVsLmlubmVyVGV4dCA9IGFmdGVyU3RyaW5nO1xyXG5cclxuICAvL0luc2VydCB0aGUgc3BhbnMgKyB0aGUgbWVudGlvbiBlbGVtZW50XHJcbiAgYW5jaG9yTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShhZnRlckVsLCBhbmNob3JOb2RlLm5leHRTaWJsaW5nKTtcclxuICBhbmNob3JOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRleHQsIGFuY2hvck5vZGUubmV4dFNpYmxpbmcpO1xyXG4gIGFuY2hvck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYmVmb3JlRWwsIGFuY2hvck5vZGUubmV4dFNpYmxpbmcpO1xyXG5cclxuICAvL0NyZWF0ZSBhIHJhbmdlIGxvY2F0ZWQgYXRlciB0aGUgbWVudGlvblxyXG4gIGxldCByYW5nZSA9IGdldERvY3VtZW50KGlmcmFtZSkuY3JlYXRlUmFuZ2UoKTtcclxuICByYW5nZS5zZWxlY3ROb2RlKGFmdGVyRWwpO1xyXG4gIHJhbmdlLnNldFN0YXJ0KGFmdGVyRWwsIDApO1xyXG4gIHJhbmdlLnNldEVuZChhZnRlckVsLCAwKTtcclxuXHJcbiAgLy9Nb3ZlIHRoZSBjdXJzb3IgdG8gdGhhdCBzcG90XHJcbiAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xyXG4gIHNlbE9iai5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICBzZWxPYmouYWRkUmFuZ2UocmFuZ2UpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KGVsOiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBlbCAhPSBudWxsICYmIChlbC5ub2RlTmFtZSA9PSAnSU5QVVQnIHx8IGVsLm5vZGVOYW1lID09ICdURVhUQVJFQScpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVGV4dEVsZW1lbnQoZWw6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGVsICE9IG51bGwgJiYgKGVsLm5vZGVOYW1lID09ICdJTlBVVCcgfHwgZWwubm9kZU5hbWUgPT0gJ1RFWFRBUkVBJyB8fCBlbC5ub2RlTmFtZSA9PSAnI3RleHQnKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDYXJldFBvc2l0aW9uKGVsOiBIVE1MSW5wdXRFbGVtZW50LCBwb3M6IG51bWJlciwgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCA9IG51bGwpIHtcclxuICAvL2NvbnNvbGUubG9nKFwic2V0Q2FyZXRQb3NpdGlvblwiLCBwb3MsIGVsLCBpZnJhbWU9PW51bGwpO1xyXG4gIGlmIChpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQoZWwpICYmIGVsLnNlbGVjdGlvblN0YXJ0KSB7XHJcbiAgICBlbC5mb2N1cygpO1xyXG4gICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGxldCByYW5nZSA9IGdldERvY3VtZW50KGlmcmFtZSkuY3JlYXRlUmFuZ2UoKTtcclxuICAgIHJhbmdlLnNldFN0YXJ0KGVsLCBwb3MpO1xyXG4gICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XHJcbiAgICBsZXQgc2VsID0gZ2V0V2luZG93U2VsZWN0aW9uKGlmcmFtZSk7XHJcbiAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENhcmV0UG9zaXRpb24oZWw6IEhUTUxJbnB1dEVsZW1lbnQsIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgPSBudWxsKSB7XHJcbiAgLy9jb25zb2xlLmxvZyhcImdldENhcmV0UG9zaXRpb25cIiwgZWwpO1xyXG4gIGlmIChpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQoZWwpKSB7XHJcbiAgICB2YXIgdmFsID0gZWwudmFsdWU7XHJcbiAgICByZXR1cm4gdmFsLnNsaWNlKDAsIGVsLnNlbGVjdGlvblN0YXJ0KS5sZW5ndGg7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdmFyIHNlbE9iaiA9IGdldFdpbmRvd1NlbGVjdGlvbihpZnJhbWUpOyAvL3dpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgIGlmIChzZWxPYmoucmFuZ2VDb3VudCA+IDApIHtcclxuICAgICAgdmFyIHNlbFJhbmdlID0gc2VsT2JqLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgIHZhciBwcmVDYXJldFJhbmdlID0gc2VsUmFuZ2UuY2xvbmVSYW5nZSgpO1xyXG4gICAgICBwcmVDYXJldFJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbCk7XHJcbiAgICAgIHByZUNhcmV0UmFuZ2Uuc2V0RW5kKHNlbFJhbmdlLmVuZENvbnRhaW5lciwgc2VsUmFuZ2UuZW5kT2Zmc2V0KTtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gcHJlQ2FyZXRSYW5nZS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gQmFzZWQgb24gbWVudC5pbyBmdW5jdGlvbnMuLi5cclxuLy9cclxuXHJcbmZ1bmN0aW9uIGdldERvY3VtZW50KGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpIHtcclxuICBpZiAoIWlmcmFtZSkge1xyXG4gICAgcmV0dXJuIGRvY3VtZW50O1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRXaW5kb3dTZWxlY3Rpb24oaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCk6IFNlbGVjdGlvbiB7XHJcbiAgaWYgKCFpZnJhbWUpIHtcclxuICAgIHJldHVybiB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBpZnJhbWUuY29udGVudFdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZW50RWRpdGFibGVDYXJldENvb3JkcyhjdHg6IHsgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCwgcGFyZW50PzogRWxlbWVudCB9KSB7XHJcbiAgbGV0IG1hcmtlclRleHRDaGFyID0gJ1xcdWZlZmYnO1xyXG4gIGxldCBtYXJrZXJJZCA9ICdzZWxfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgJ18nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygpLnN1YnN0cigyKTtcclxuICBsZXQgZG9jID0gZ2V0RG9jdW1lbnQoY3R4ID8gY3R4LmlmcmFtZSA6IG51bGwpO1xyXG4gIGxldCBzZWwgPSBnZXRXaW5kb3dTZWxlY3Rpb24oY3R4ID8gY3R4LmlmcmFtZSA6IG51bGwpO1xyXG4gIGxldCBwcmV2UmFuZ2UgPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcclxuXHJcbiAgLy8gY3JlYXRlIG5ldyByYW5nZSBhbmQgc2V0IHBvc3Rpb24gdXNpbmcgcHJldlJhbmdlXHJcbiAgbGV0IHJhbmdlID0gZG9jLmNyZWF0ZVJhbmdlKCk7XHJcbiAgcmFuZ2Uuc2V0U3RhcnQoc2VsLmFuY2hvck5vZGUsIHByZXZSYW5nZS5zdGFydE9mZnNldCk7XHJcbiAgcmFuZ2Uuc2V0RW5kKHNlbC5hbmNob3JOb2RlLCBwcmV2UmFuZ2Uuc3RhcnRPZmZzZXQpO1xyXG4gIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBtYXJrZXIgZWxlbWVudCBjb250YWluaW5nIGEgc2luZ2xlIGludmlzaWJsZSBjaGFyYWN0ZXJcclxuICAvLyB1c2luZyBET00gbWV0aG9kcyBhbmQgaW5zZXJ0IGl0IGF0IHRoZSBwb3NpdGlvbiBpbiB0aGUgcmFuZ2VcclxuICBsZXQgbWFya2VyRWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gIG1hcmtlckVsLmlkID0gbWFya2VySWQ7XHJcbiAgbWFya2VyRWwuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKG1hcmtlclRleHRDaGFyKSk7XHJcbiAgcmFuZ2UuaW5zZXJ0Tm9kZShtYXJrZXJFbCk7XHJcbiAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gIHNlbC5hZGRSYW5nZShwcmV2UmFuZ2UpO1xyXG5cclxuICBsZXQgY29vcmRpbmF0ZXMgPSB7XHJcbiAgICBsZWZ0OiAwLFxyXG4gICAgdG9wOiBtYXJrZXJFbC5vZmZzZXRIZWlnaHRcclxuICB9O1xyXG5cclxuICBsb2NhbFRvUmVsYXRpdmVDb29yZGluYXRlcyhjdHgsIG1hcmtlckVsLCBjb29yZGluYXRlcyk7XHJcblxyXG4gIG1hcmtlckVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobWFya2VyRWwpO1xyXG4gIHJldHVybiBjb29yZGluYXRlcztcclxufVxyXG5cclxuZnVuY3Rpb24gbG9jYWxUb1JlbGF0aXZlQ29vcmRpbmF0ZXMoXHJcbiAgY3R4OiB7IGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQsIHBhcmVudD86IEVsZW1lbnQgfSxcclxuICBlbGVtZW50OiBFbGVtZW50LFxyXG4gIGNvb3JkaW5hdGVzOiB7IHRvcDogbnVtYmVyOyBsZWZ0OiBudW1iZXIgfVxyXG4pIHtcclxuICBsZXQgb2JqID0gPEhUTUxFbGVtZW50PmVsZW1lbnQ7XHJcbiAgbGV0IGlmcmFtZSA9IGN0eCA/IGN0eC5pZnJhbWUgOiBudWxsO1xyXG4gIHdoaWxlIChvYmopIHtcclxuICAgIGlmIChjdHgucGFyZW50ICE9IG51bGwgJiYgY3R4LnBhcmVudCA9PSBvYmopIHtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBjb29yZGluYXRlcy5sZWZ0ICs9IG9iai5vZmZzZXRMZWZ0ICsgb2JqLmNsaWVudExlZnQ7XHJcbiAgICBjb29yZGluYXRlcy50b3AgKz0gb2JqLm9mZnNldFRvcCArIG9iai5jbGllbnRUb3A7XHJcbiAgICBvYmogPSA8SFRNTEVsZW1lbnQ+b2JqLm9mZnNldFBhcmVudDtcclxuICAgIGlmICghb2JqICYmIGlmcmFtZSkge1xyXG4gICAgICBvYmogPSBpZnJhbWU7XHJcbiAgICAgIGlmcmFtZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG9iaiA9IDxIVE1MRWxlbWVudD5lbGVtZW50O1xyXG4gIGlmcmFtZSA9IGN0eCA/IGN0eC5pZnJhbWUgOiBudWxsO1xyXG4gIHdoaWxlIChvYmogIT09IGdldERvY3VtZW50KG51bGwpLmJvZHkgJiYgb2JqICE9IG51bGwpIHtcclxuICAgIGlmIChjdHgucGFyZW50ICE9IG51bGwgJiYgY3R4LnBhcmVudCA9PSBvYmopIHtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpZiAob2JqLnNjcm9sbFRvcCAmJiBvYmouc2Nyb2xsVG9wID4gMCkge1xyXG4gICAgICBjb29yZGluYXRlcy50b3AgLT0gb2JqLnNjcm9sbFRvcDtcclxuICAgIH1cclxuICAgIGlmIChvYmouc2Nyb2xsTGVmdCAmJiBvYmouc2Nyb2xsTGVmdCA+IDApIHtcclxuICAgICAgY29vcmRpbmF0ZXMubGVmdCAtPSBvYmouc2Nyb2xsTGVmdDtcclxuICAgIH1cclxuICAgIG9iaiA9IDxIVE1MRWxlbWVudD5vYmoucGFyZW50Tm9kZTtcclxuICAgIGlmICghb2JqICYmIGlmcmFtZSkge1xyXG4gICAgICBvYmogPSBpZnJhbWU7XHJcbiAgICAgIGlmcmFtZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==