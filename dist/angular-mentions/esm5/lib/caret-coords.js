/* From: https://github.com/component/textarea-caret-position */
/* jshint browser: true */
// (function () {
// We'll copy the properties below into the mirror div.
// Note that some browsers, such as Firefox, do not concatenate properties
// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
// so we have to list every single property explicitly.
var properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize'
];
var isBrowser = (typeof window !== 'undefined');
var isFirefox = (isBrowser && window['mozInnerScreenX'] != null);
export function getCaretCoordinates(element, position, options) {
    if (!isBrowser) {
        throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
    }
    var debug = options && options.debug || false;
    if (debug) {
        var el = document.querySelector('#input-textarea-caret-position-mirror-div');
        if (el)
            el.parentNode.removeChild(el);
    }
    // The mirror div will replicate the textarea's style
    var div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);
    var style = div.style;
    var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle; // currentStyle for IE < 9
    var isInput = element.nodeName === 'INPUT';
    // Default textarea styles
    style.whiteSpace = 'pre-wrap';
    if (!isInput)
        style.wordWrap = 'break-word'; // only for textarea-s
    // Position off-screen
    style.position = 'absolute'; // required to return coordinates properly
    if (!debug)
        style.visibility = 'hidden'; // not 'display: none' because we want rendering
    // Transfer the element's properties to the div
    properties.forEach(function (prop) {
        if (isInput && prop === 'lineHeight') {
            // Special case for <input>s because text is rendered centered and line height may be != height
            if (computed.boxSizing === "border-box") {
                var height = parseInt(computed.height);
                var outerHeight = parseInt(computed.paddingTop) +
                    parseInt(computed.paddingBottom) +
                    parseInt(computed.borderTopWidth) +
                    parseInt(computed.borderBottomWidth);
                var targetHeight = outerHeight + parseInt(computed.lineHeight);
                if (height > targetHeight) {
                    style.lineHeight = height - outerHeight + "px";
                }
                else if (height === targetHeight) {
                    style.lineHeight = computed.lineHeight;
                }
                else {
                    style.lineHeight = '0';
                }
            }
            else {
                style.lineHeight = computed.height;
            }
        }
        else {
            style[prop] = computed[prop];
        }
    });
    if (isFirefox) {
        // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
        if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
    }
    else {
        style.overflow = 'hidden'; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }
    div.textContent = element.value.substring(0, position);
    // The second special handling for input type="text" vs textarea:
    // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
    if (isInput)
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    var span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // For inputs, just '.' would be enough, but no need to bother.
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);
    var coordinates = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
        height: parseInt(computed['lineHeight'])
    };
    if (debug) {
        span.style.backgroundColor = '#aaa';
    }
    else {
        document.body.removeChild(div);
    }
    return coordinates;
}
// if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
//   module.exports = getCaretCoordinates;
// } else if(isBrowser) {
//   window.getCaretCoordinates = getCaretCoordinates;
// }
// }());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZXQtY29vcmRzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1tZW50aW9ucy8iLCJzb3VyY2VzIjpbImxpYi9jYXJldC1jb29yZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0VBQWdFO0FBQ2hFLDBCQUEwQjtBQUUxQixpQkFBaUI7QUFFZix1REFBdUQ7QUFDdkQsMEVBQTBFO0FBQzFFLDJFQUEyRTtBQUMzRSx1REFBdUQ7QUFDdkQsSUFBSSxVQUFVLEdBQUc7SUFDZixXQUFXO0lBQ1gsV0FBVztJQUNYLE9BQU87SUFDUCxRQUFRO0lBQ1IsV0FBVztJQUNYLFdBQVc7SUFFWCxnQkFBZ0I7SUFDaEIsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixpQkFBaUI7SUFDakIsYUFBYTtJQUViLFlBQVk7SUFDWixjQUFjO0lBQ2QsZUFBZTtJQUNmLGFBQWE7SUFFYix3REFBd0Q7SUFDeEQsV0FBVztJQUNYLGFBQWE7SUFDYixZQUFZO0lBQ1osYUFBYTtJQUNiLFVBQVU7SUFDVixnQkFBZ0I7SUFDaEIsWUFBWTtJQUNaLFlBQVk7SUFFWixXQUFXO0lBQ1gsZUFBZTtJQUNmLFlBQVk7SUFDWixnQkFBZ0I7SUFFaEIsZUFBZTtJQUNmLGFBQWE7SUFFYixTQUFTO0lBQ1QsWUFBWTtDQUViLENBQUM7QUFFRixJQUFJLFNBQVMsR0FBRyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELElBQUksU0FBUyxHQUFHLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBRWpFLE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU87SUFDNUQsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQztLQUNuRztJQUVELElBQUksS0FBSyxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxJ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REFBc0Q7QUFDdEQsSUFBSTtBQUVKLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBGcm9tOiBodHRwczovL2dpdGh1Yi5jb20vY29tcG9uZW50L3RleHRhcmVhLWNhcmV0LXBvc2l0aW9uICovXHJcbi8qIGpzaGludCBicm93c2VyOiB0cnVlICovXHJcblxyXG4vLyAoZnVuY3Rpb24gKCkge1xyXG5cclxuICAvLyBXZSdsbCBjb3B5IHRoZSBwcm9wZXJ0aWVzIGJlbG93IGludG8gdGhlIG1pcnJvciBkaXYuXHJcbiAgLy8gTm90ZSB0aGF0IHNvbWUgYnJvd3NlcnMsIHN1Y2ggYXMgRmlyZWZveCwgZG8gbm90IGNvbmNhdGVuYXRlIHByb3BlcnRpZXNcclxuICAvLyBpbnRvIHRoZWlyIHNob3J0aGFuZCAoZS5nLiBwYWRkaW5nLXRvcCwgcGFkZGluZy1ib3R0b20gZXRjLiAtPiBwYWRkaW5nKSxcclxuICAvLyBzbyB3ZSBoYXZlIHRvIGxpc3QgZXZlcnkgc2luZ2xlIHByb3BlcnR5IGV4cGxpY2l0bHkuXHJcbiAgdmFyIHByb3BlcnRpZXMgPSBbXHJcbiAgICAnZGlyZWN0aW9uJywgIC8vIFJUTCBzdXBwb3J0XHJcbiAgICAnYm94U2l6aW5nJyxcclxuICAgICd3aWR0aCcsICAvLyBvbiBDaHJvbWUgYW5kIElFLCBleGNsdWRlIHRoZSBzY3JvbGxiYXIsIHNvIHRoZSBtaXJyb3IgZGl2IHdyYXBzIGV4YWN0bHkgYXMgdGhlIHRleHRhcmVhIGRvZXNcclxuICAgICdoZWlnaHQnLFxyXG4gICAgJ292ZXJmbG93WCcsXHJcbiAgICAnb3ZlcmZsb3dZJywgIC8vIGNvcHkgdGhlIHNjcm9sbGJhciBmb3IgSUVcclxuXHJcbiAgICAnYm9yZGVyVG9wV2lkdGgnLFxyXG4gICAgJ2JvcmRlclJpZ2h0V2lkdGgnLFxyXG4gICAgJ2JvcmRlckJvdHRvbVdpZHRoJyxcclxuICAgICdib3JkZXJMZWZ0V2lkdGgnLFxyXG4gICAgJ2JvcmRlclN0eWxlJyxcclxuXHJcbiAgICAncGFkZGluZ1RvcCcsXHJcbiAgICAncGFkZGluZ1JpZ2h0JyxcclxuICAgICdwYWRkaW5nQm90dG9tJyxcclxuICAgICdwYWRkaW5nTGVmdCcsXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnRcclxuICAgICdmb250U3R5bGUnLFxyXG4gICAgJ2ZvbnRWYXJpYW50JyxcclxuICAgICdmb250V2VpZ2h0JyxcclxuICAgICdmb250U3RyZXRjaCcsXHJcbiAgICAnZm9udFNpemUnLFxyXG4gICAgJ2ZvbnRTaXplQWRqdXN0JyxcclxuICAgICdsaW5lSGVpZ2h0JyxcclxuICAgICdmb250RmFtaWx5JyxcclxuXHJcbiAgICAndGV4dEFsaWduJyxcclxuICAgICd0ZXh0VHJhbnNmb3JtJyxcclxuICAgICd0ZXh0SW5kZW50JyxcclxuICAgICd0ZXh0RGVjb3JhdGlvbicsICAvLyBtaWdodCBub3QgbWFrZSBhIGRpZmZlcmVuY2UsIGJ1dCBiZXR0ZXIgYmUgc2FmZVxyXG5cclxuICAgICdsZXR0ZXJTcGFjaW5nJyxcclxuICAgICd3b3JkU3BhY2luZycsXHJcblxyXG4gICAgJ3RhYlNpemUnLFxyXG4gICAgJ01velRhYlNpemUnXHJcblxyXG4gIF07XHJcblxyXG4gIHZhciBpc0Jyb3dzZXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpO1xyXG4gIHZhciBpc0ZpcmVmb3ggPSAoaXNCcm93c2VyICYmIHdpbmRvd1snbW96SW5uZXJTY3JlZW5YJ10gIT0gbnVsbCk7XHJcblxyXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRDYXJldENvb3JkaW5hdGVzKGVsZW1lbnQsIHBvc2l0aW9uLCBvcHRpb25zKSB7XHJcbiAgICBpZiAoIWlzQnJvd3Nlcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RleHRhcmVhLWNhcmV0LXBvc2l0aW9uI2dldENhcmV0Q29vcmRpbmF0ZXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGluIGEgYnJvd3NlcicpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBkZWJ1ZyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1ZyB8fCBmYWxzZTtcclxuICAgIGlmIChkZWJ1Zykge1xyXG4gICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5wdXQtdGV4dGFyZWEtY2FyZXQtcG9zaXRpb24tbWlycm9yLWRpdicpO1xyXG4gICAgICBpZiAoZWwpIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZSBtaXJyb3IgZGl2IHdpbGwgcmVwbGljYXRlIHRoZSB0ZXh0YXJlYSdzIHN0eWxlXHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuaWQgPSAnaW5wdXQtdGV4dGFyZWEtY2FyZXQtcG9zaXRpb24tbWlycm9yLWRpdic7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XHJcblxyXG4gICAgdmFyIHN0eWxlID0gZGl2LnN0eWxlO1xyXG4gICAgdmFyIGNvbXB1dGVkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUgPyB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSA6IGVsZW1lbnQuY3VycmVudFN0eWxlOyAgLy8gY3VycmVudFN0eWxlIGZvciBJRSA8IDlcclxuICAgIHZhciBpc0lucHV0ID0gZWxlbWVudC5ub2RlTmFtZSA9PT0gJ0lOUFVUJztcclxuXHJcbiAgICAvLyBEZWZhdWx0IHRleHRhcmVhIHN0eWxlc1xyXG4gICAgc3R5bGUud2hpdGVTcGFjZSA9ICdwcmUtd3JhcCc7XHJcbiAgICBpZiAoIWlzSW5wdXQpXHJcbiAgICAgIHN0eWxlLndvcmRXcmFwID0gJ2JyZWFrLXdvcmQnOyAgLy8gb25seSBmb3IgdGV4dGFyZWEtc1xyXG5cclxuICAgIC8vIFBvc2l0aW9uIG9mZi1zY3JlZW5cclxuICAgIHN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJzsgIC8vIHJlcXVpcmVkIHRvIHJldHVybiBjb29yZGluYXRlcyBwcm9wZXJseVxyXG4gICAgaWYgKCFkZWJ1ZylcclxuICAgICAgc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nOyAgLy8gbm90ICdkaXNwbGF5OiBub25lJyBiZWNhdXNlIHdlIHdhbnQgcmVuZGVyaW5nXHJcblxyXG4gICAgLy8gVHJhbnNmZXIgdGhlIGVsZW1lbnQncyBwcm9wZXJ0aWVzIHRvIHRoZSBkaXZcclxuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xyXG4gICAgICBpZiAoaXNJbnB1dCAmJiBwcm9wID09PSAnbGluZUhlaWdodCcpIHtcclxuICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIDxpbnB1dD5zIGJlY2F1c2UgdGV4dCBpcyByZW5kZXJlZCBjZW50ZXJlZCBhbmQgbGluZSBoZWlnaHQgbWF5IGJlICE9IGhlaWdodFxyXG4gICAgICAgIGlmIChjb21wdXRlZC5ib3hTaXppbmcgPT09IFwiYm9yZGVyLWJveFwiKSB7XHJcbiAgICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWQuaGVpZ2h0KTtcclxuICAgICAgICAgIHZhciBvdXRlckhlaWdodCA9XHJcbiAgICAgICAgICAgIHBhcnNlSW50KGNvbXB1dGVkLnBhZGRpbmdUb3ApICtcclxuICAgICAgICAgICAgcGFyc2VJbnQoY29tcHV0ZWQucGFkZGluZ0JvdHRvbSkgK1xyXG4gICAgICAgICAgICBwYXJzZUludChjb21wdXRlZC5ib3JkZXJUb3BXaWR0aCkgK1xyXG4gICAgICAgICAgICBwYXJzZUludChjb21wdXRlZC5ib3JkZXJCb3R0b21XaWR0aCk7XHJcbiAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gb3V0ZXJIZWlnaHQgKyBwYXJzZUludChjb21wdXRlZC5saW5lSGVpZ2h0KTtcclxuICAgICAgICAgIGlmIChoZWlnaHQgPiB0YXJnZXRIZWlnaHQpIHtcclxuICAgICAgICAgICAgc3R5bGUubGluZUhlaWdodCA9IGhlaWdodCAtIG91dGVySGVpZ2h0ICsgXCJweFwiO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChoZWlnaHQgPT09IHRhcmdldEhlaWdodCkge1xyXG4gICAgICAgICAgICBzdHlsZS5saW5lSGVpZ2h0ID0gY29tcHV0ZWQubGluZUhlaWdodDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0eWxlLmxpbmVIZWlnaHQgPSAnMCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0eWxlLmxpbmVIZWlnaHQgPSBjb21wdXRlZC5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN0eWxlW3Byb3BdID0gY29tcHV0ZWRbcHJvcF07XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChpc0ZpcmVmb3gpIHtcclxuICAgICAgLy8gRmlyZWZveCBsaWVzIGFib3V0IHRoZSBvdmVyZmxvdyBwcm9wZXJ0eSBmb3IgdGV4dGFyZWFzOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD05ODQyNzVcclxuICAgICAgaWYgKGVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gcGFyc2VJbnQoY29tcHV0ZWQuaGVpZ2h0KSlcclxuICAgICAgICBzdHlsZS5vdmVyZmxvd1kgPSAnc2Nyb2xsJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7ICAvLyBmb3IgQ2hyb21lIHRvIG5vdCByZW5kZXIgYSBzY3JvbGxiYXI7IElFIGtlZXBzIG92ZXJmbG93WSA9ICdzY3JvbGwnXHJcbiAgICB9XHJcblxyXG4gICAgZGl2LnRleHRDb250ZW50ID0gZWxlbWVudC52YWx1ZS5zdWJzdHJpbmcoMCwgcG9zaXRpb24pO1xyXG4gICAgLy8gVGhlIHNlY29uZCBzcGVjaWFsIGhhbmRsaW5nIGZvciBpbnB1dCB0eXBlPVwidGV4dFwiIHZzIHRleHRhcmVhOlxyXG4gICAgLy8gc3BhY2VzIG5lZWQgdG8gYmUgcmVwbGFjZWQgd2l0aCBub24tYnJlYWtpbmcgc3BhY2VzIC0gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTM0MDIwMzUvMTI2OTAzN1xyXG4gICAgaWYgKGlzSW5wdXQpXHJcbiAgICAgIGRpdi50ZXh0Q29udGVudCA9IGRpdi50ZXh0Q29udGVudC5yZXBsYWNlKC9cXHMvZywgJ1xcdTAwYTAnKTtcclxuXHJcbiAgICB2YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgIC8vIFdyYXBwaW5nIG11c3QgYmUgcmVwbGljYXRlZCAqZXhhY3RseSosIGluY2x1ZGluZyB3aGVuIGEgbG9uZyB3b3JkIGdldHNcclxuICAgIC8vIG9udG8gdGhlIG5leHQgbGluZSwgd2l0aCB3aGl0ZXNwYWNlIGF0IHRoZSBlbmQgb2YgdGhlIGxpbmUgYmVmb3JlICgjNykuXHJcbiAgICAvLyBUaGUgICpvbmx5KiByZWxpYWJsZSB3YXkgdG8gZG8gdGhhdCBpcyB0byBjb3B5IHRoZSAqZW50aXJlKiByZXN0IG9mIHRoZVxyXG4gICAgLy8gdGV4dGFyZWEncyBjb250ZW50IGludG8gdGhlIDxzcGFuPiBjcmVhdGVkIGF0IHRoZSBjYXJldCBwb3NpdGlvbi5cclxuICAgIC8vIEZvciBpbnB1dHMsIGp1c3QgJy4nIHdvdWxkIGJlIGVub3VnaCwgYnV0IG5vIG5lZWQgdG8gYm90aGVyLlxyXG4gICAgc3Bhbi50ZXh0Q29udGVudCA9IGVsZW1lbnQudmFsdWUuc3Vic3RyaW5nKHBvc2l0aW9uKSB8fCAnLic7ICAvLyB8fCBiZWNhdXNlIGEgY29tcGxldGVseSBlbXB0eSBmYXV4IHNwYW4gZG9lc24ndCByZW5kZXIgYXQgYWxsXHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoc3Bhbik7XHJcblxyXG4gICAgdmFyIGNvb3JkaW5hdGVzID0ge1xyXG4gICAgICB0b3A6IHNwYW4ub2Zmc2V0VG9wICsgcGFyc2VJbnQoY29tcHV0ZWRbJ2JvcmRlclRvcFdpZHRoJ10pLFxyXG4gICAgICBsZWZ0OiBzcGFuLm9mZnNldExlZnQgKyBwYXJzZUludChjb21wdXRlZFsnYm9yZGVyTGVmdFdpZHRoJ10pLFxyXG4gICAgICBoZWlnaHQ6IHBhcnNlSW50KGNvbXB1dGVkWydsaW5lSGVpZ2h0J10pXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChkZWJ1Zykge1xyXG4gICAgICBzcGFuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjYWFhJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbiAgfVxyXG5cclxuICAvLyBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAvLyAgIG1vZHVsZS5leHBvcnRzID0gZ2V0Q2FyZXRDb29yZGluYXRlcztcclxuICAvLyB9IGVsc2UgaWYoaXNCcm93c2VyKSB7XHJcbiAgLy8gICB3aW5kb3cuZ2V0Q2FyZXRDb29yZGluYXRlcyA9IGdldENhcmV0Q29vcmRpbmF0ZXM7XHJcbiAgLy8gfVxyXG5cclxuICAvLyB9KCkpOyJdfQ==