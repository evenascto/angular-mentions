(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('angular-mentions', ['exports', '@angular/core', '@angular/common'], factory) :
    (global = global || self, factory(global['angular-mentions'] = {}, global.ng.core, global.ng.common));
}(this, (function (exports, core, common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    function __exportStar(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

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
    function getValue(el) {
        return isInputOrTextAreaElement(el) ? el.value : el.textContent;
    }
    function insertValue(el, start, end, insertHTML, text, iframe, noRecursion) {
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
    function isInputOrTextAreaElement(el) {
        return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA');
    }
    ;
    function isTextElement(el) {
        return el != null && (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA' || el.nodeName == '#text');
    }
    ;
    function setCaretPosition(el, pos, iframe) {
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
    function getCaretPosition(el, iframe) {
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
    function getContentEditableCaretCoords(ctx) {
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
    function getCaretCoordinates(element, position, options) {
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

    /**
     * Angular Mentions.
     * https://github.com/dmacfarlane/angular-mentions
     *
     * Copyright (c) 2016 Dan MacFarlane
     */
    var MentionListComponent = /** @class */ (function () {
        function MentionListComponent(element) {
            this.element = element;
            this.labelKey = 'label';
            this.itemClick = new core.EventEmitter();
            this.items = [];
            this.activeIndex = 0;
            this.hidden = false;
            this.dropUp = false;
            this.styleOff = false;
            this.coords = { top: 0, left: 0 };
            this.offset = 0;
        }
        MentionListComponent.prototype.ngAfterContentChecked = function () {
            if (!this.itemTemplate) {
                this.itemTemplate = this.defaultItemTemplate;
            }
        };
        // lots of confusion here between relative coordinates and containers
        MentionListComponent.prototype.position = function (nativeParentElement, iframe) {
            if (iframe === void 0) { iframe = null; }
            if (isInputOrTextAreaElement(nativeParentElement)) {
                // parent elements need to have postition:relative for this to work correctly?
                this.coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart, null);
                this.coords.top = nativeParentElement.offsetTop + this.coords.top - nativeParentElement.scrollTop;
                this.coords.left = nativeParentElement.offsetLeft + this.coords.left - nativeParentElement.scrollLeft;
                // getCretCoordinates() for text/input elements needs an additional offset to position the list correctly
                this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
            }
            else if (iframe) {
                var context = { iframe: iframe, parent: iframe.offsetParent };
                this.coords = getContentEditableCaretCoords(context);
            }
            else {
                var doc = document.documentElement;
                var scrollLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
                var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
                // bounding rectangles are relative to view, offsets are relative to container?
                var caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
                var parentRelativeToContainer = nativeParentElement.getBoundingClientRect();
                this.coords.top = caretRelativeToView.top - parentRelativeToContainer.top + nativeParentElement.offsetTop - scrollTop;
                this.coords.left = caretRelativeToView.left - parentRelativeToContainer.left + nativeParentElement.offsetLeft - scrollLeft;
            }
            // set the default/inital position
            this.positionElement();
        };
        Object.defineProperty(MentionListComponent.prototype, "activeItem", {
            get: function () {
                return this.items[this.activeIndex];
            },
            enumerable: true,
            configurable: true
        });
        MentionListComponent.prototype.activateNextItem = function () {
            // adjust scrollable-menu offset if the next item is out of view
            var listEl = this.list.nativeElement;
            var activeEl = listEl.getElementsByClassName('active').item(0);
            if (activeEl) {
                var nextLiEl = activeEl.nextSibling;
                if (nextLiEl && nextLiEl.nodeName == "LI") {
                    var nextLiRect = nextLiEl.getBoundingClientRect();
                    if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
                        listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
                    }
                }
            }
            // select the next item
            this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);
        };
        MentionListComponent.prototype.activatePreviousItem = function () {
            // adjust the scrollable-menu offset if the previous item is out of view
            var listEl = this.list.nativeElement;
            var activeEl = listEl.getElementsByClassName('active').item(0);
            if (activeEl) {
                var prevLiEl = activeEl.previousSibling;
                if (prevLiEl && prevLiEl.nodeName == "LI") {
                    var prevLiRect = prevLiEl.getBoundingClientRect();
                    if (prevLiRect.top < listEl.getBoundingClientRect().top) {
                        listEl.scrollTop = prevLiEl.offsetTop;
                    }
                }
            }
            // select the previous item
            this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
        };
        // reset for a new mention search
        MentionListComponent.prototype.reset = function () {
            this.list.nativeElement.scrollTop = 0;
            this.checkBounds();
        };
        // final positioning is done after the list is shown (and the height and width are known)
        // ensure it's in the page bounds
        MentionListComponent.prototype.checkBounds = function () {
            var left = this.coords.left, top = this.coords.top, dropUp = this.dropUp;
            var bounds = this.list.nativeElement.getBoundingClientRect();
            // if off right of page, align right
            if (bounds.left + bounds.width > window.innerWidth) {
                left -= bounds.left + bounds.width - window.innerWidth + 10;
            }
            // if more than half off the bottom of the page, force dropUp
            // if ((bounds.top+bounds.height/2)>window.innerHeight) {
            //   dropUp = true;
            // }
            // if top is off page, disable dropUp
            if (bounds.top < 0) {
                dropUp = false;
            }
            // set the revised/final position
            this.positionElement(left, top, dropUp);
        };
        MentionListComponent.prototype.positionElement = function (left, top, dropUp) {
            if (left === void 0) { left = this.coords.left; }
            if (top === void 0) { top = this.coords.top; }
            if (dropUp === void 0) { dropUp = this.dropUp; }
            var el = this.element.nativeElement;
            top += dropUp ? 0 : this.offset; // top of list is next line
            el.className = dropUp ? 'dropup' : null;
            el.style.position = "absolute";
            el.style.left = left + 'px';
            el.style.top = top + 'px';
        };
        MentionListComponent.prototype.getBlockCursorDimensions = function (nativeParentElement) {
            var parentStyles = window.getComputedStyle(nativeParentElement);
            return {
                height: parseFloat(parentStyles.lineHeight),
                width: parseFloat(parentStyles.fontSize)
            };
        };
        MentionListComponent.ctorParameters = function () { return [
            { type: core.ElementRef }
        ]; };
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], MentionListComponent.prototype, "labelKey", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", core.TemplateRef)
        ], MentionListComponent.prototype, "itemTemplate", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MentionListComponent.prototype, "itemClick", void 0);
        __decorate([
            core.ViewChild('list', { static: true }),
            __metadata("design:type", core.ElementRef)
        ], MentionListComponent.prototype, "list", void 0);
        __decorate([
            core.ViewChild('defaultItemTemplate', { static: true }),
            __metadata("design:type", core.TemplateRef)
        ], MentionListComponent.prototype, "defaultItemTemplate", void 0);
        MentionListComponent = __decorate([
            core.Component({
                selector: 'mention-list',
                template: "\n    <ng-template #defaultItemTemplate let-item=\"item\">\n      {{item[labelKey]}}\n    </ng-template>\n    <ul #list [hidden]=\"hidden\" class=\"dropdown-menu scrollable-menu\"\n      [class.mention-menu]=\"!styleOff\" [class.mention-dropdown]=\"!styleOff && dropUp\">\n      <li *ngFor=\"let item of items; let i = index\"\n        [class.active]=\"activeIndex==i\" [class.mention-active]=\"!styleOff && activeIndex==i\">\n        <a class=\"dropdown-item\" [class.mention-item]=\"!styleOff\"\n          (mousedown)=\"activeIndex=i;itemClick.emit();$event.preventDefault()\">\n          <ng-template [ngTemplateOutlet]=\"itemTemplate\" [ngTemplateOutletContext]=\"{'item':item}\"></ng-template>\n        </a>\n      </li>\n    </ul>\n    ",
                styles: [".mention-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active>a{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu{display:block;height:auto;max-height:292px;overflow:auto}[hidden]{display:none}.mention-dropdown{bottom:100%;top:auto;margin-bottom:2px}"]
            }),
            __metadata("design:paramtypes", [core.ElementRef])
        ], MentionListComponent);
        return MentionListComponent;
    }());

    var KEY_BACKSPACE = 8;
    var KEY_TAB = 9;
    var KEY_ENTER = 13;
    var KEY_SHIFT = 16;
    var KEY_ESCAPE = 27;
    var KEY_SPACE = 32;
    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_BUFFERED = 229;
    /**
     * Angular Mentions.
     * https://github.com/dmacfarlane/angular-mentions
     *
     * Copyright (c) 2017 Dan MacFarlane
     */
    var MentionDirective = /** @class */ (function () {
        function MentionDirective(_element, _componentResolver, _viewContainerRef) {
            var _this = this;
            this._element = _element;
            this._componentResolver = _componentResolver;
            this._viewContainerRef = _viewContainerRef;
            // the provided configuration object
            this.mentionConfig = { items: [] };
            this.DEFAULT_CONFIG = {
                items: [],
                triggerChar: '@',
                labelKey: 'label',
                maxItems: -1,
                allowSpace: false,
                returnTrigger: false,
                insertHTML: true,
                mentionSelect: function (item, triggerChar) { return _this.activeConfig.triggerChar + item[_this.activeConfig.labelKey]; }
            };
            // event emitted whenever the search term changes
            this.searchTerm = new core.EventEmitter();
            // event emitted when an item is selected
            this.itemSelected = new core.EventEmitter();
            // event emitted whenever the mention list is opened or closed
            this.opened = new core.EventEmitter();
            this.closed = new core.EventEmitter();
            this.triggerChars = {};
        }
        Object.defineProperty(MentionDirective.prototype, "mention", {
            set: function (items) {
                this.mentionItems = items;
            },
            enumerable: true,
            configurable: true
        });
        MentionDirective.prototype.ngOnChanges = function (changes) {
            // console.log('config change', changes);
            if (changes['mention'] || changes['mentionConfig']) {
                this.updateConfig();
            }
        };
        MentionDirective.prototype.updateConfig = function () {
            var _this = this;
            var config = this.mentionConfig;
            this.triggerChars = {};
            // use items from directive if they have been set
            if (this.mentionItems) {
                config.items = this.mentionItems;
            }
            this.addConfig(config);
            // nested configs
            if (config.mentions) {
                config.mentions.forEach(function (config) { return _this.addConfig(config); });
            }
        };
        // add configuration for a trigger char
        MentionDirective.prototype.addConfig = function (config) {
            // defaults
            var defaults = Object.assign({}, this.DEFAULT_CONFIG);
            config = Object.assign(defaults, config);
            // items
            var items = config.items;
            if (items && items.length > 0) {
                // convert strings to objects
                if (typeof items[0] == 'string') {
                    items = items.map(function (label) {
                        var object = {};
                        object[config.labelKey] = label;
                        return object;
                    });
                }
                if (config.labelKey) {
                    // remove items without an labelKey (as it's required to filter the list)
                    items = items.filter(function (e) { return e[config.labelKey]; });
                    if (!config.disableSort) {
                        items.sort(function (a, b) { return a[config.labelKey].localeCompare(b[config.labelKey]); });
                    }
                }
            }
            config.items = items;
            // add the config
            this.triggerChars[config.triggerChar] = config;
            // for async update while menu/search is active
            if (this.activeConfig && this.activeConfig.triggerChar == config.triggerChar) {
                this.activeConfig = config;
                this.updateSearchList();
            }
        };
        MentionDirective.prototype.setIframe = function (iframe) {
            this.iframe = iframe;
        };
        MentionDirective.prototype.stopEvent = function (event) {
            //if (event instanceof KeyboardEvent) { // does not work for iframe
            if (!event.wasClick) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
        };
        MentionDirective.prototype.blurHandler = function (event) {
            this.stopEvent(event);
            this.stopSearch();
        };
        MentionDirective.prototype.inputHandler = function (event, nativeElement) {
            if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
            if (this.lastKeyCode === KEY_BUFFERED && event.data) {
                var keyCode = event.data.charCodeAt(0);
                this.keyHandler({ keyCode: keyCode, inputEvent: true }, nativeElement);
            }
        };
        // @param nativeElement is the alternative text element in an iframe scenario
        MentionDirective.prototype.keyHandler = function (event, nativeElement) {
            if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
            this.lastKeyCode = event.keyCode;
            if (event.isComposing || event.keyCode === KEY_BUFFERED) {
                return;
            }
            var val = getValue(nativeElement);
            var pos = getCaretPosition(nativeElement, this.iframe);
            var charPressed = event.key;
            if (!charPressed) {
                var charCode = event.which || event.keyCode;
                if (!event.shiftKey && (charCode >= 65 && charCode <= 90)) {
                    charPressed = String.fromCharCode(charCode + 32);
                }
                // else if (event.shiftKey && charCode === KEY_2) {
                //   charPressed = this.config.triggerChar;
                // }
                else {
                    // TODO (dmacfarlane) fix this for non-alpha keys
                    // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                    charPressed = String.fromCharCode(event.which || event.keyCode);
                }
            }
            if (event.keyCode == KEY_ENTER && event.wasClick && pos < this.startPos) {
                // put caret back in position prior to contenteditable menu click
                pos = this.startNode.length;
                setCaretPosition(this.startNode, pos, this.iframe);
            }
            //console.log("keyHandler", this.startPos, pos, val, charPressed, event);
            var config = this.triggerChars[charPressed];
            if (config) {
                this.activeConfig = config;
                this.startPos = event.inputEvent ? pos - 1 : pos;
                this.startNode = (this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()).anchorNode;
                this.searching = true;
                this.searchString = null;
                this.showSearchList(nativeElement);
                this.updateSearchList();
                if (config.returnTrigger) {
                    this.searchTerm.emit(config.triggerChar);
                }
            }
            else if (this.startPos >= 0 && this.searching) {
                if (pos <= this.startPos) {
                    this.searchList.hidden = true;
                }
                // ignore shift when pressed alone, but not when used with another key
                else if (event.keyCode !== KEY_SHIFT &&
                    !event.metaKey &&
                    !event.altKey &&
                    !event.ctrlKey &&
                    pos > this.startPos) {
                    if (!this.activeConfig.allowSpace && event.keyCode === KEY_SPACE) {
                        this.startPos = -1;
                    }
                    else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                        pos--;
                        if (pos == this.startPos) {
                            this.stopSearch();
                        }
                    }
                    else if (!this.searchList.hidden) {
                        if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                            this.stopEvent(event);
                            // emit the selected list item
                            this.itemSelected.emit(this.searchList.activeItem);
                            // optional function to format the selected item before inserting the text
                            var text = this.activeConfig.mentionSelect(this.searchList.activeItem, this.activeConfig.triggerChar);
                            // value is inserted without a trailing space for consistency
                            // between element types (div and iframe do not preserve the space)
                            insertValue(nativeElement, this.startPos, pos, this.activeConfig.insertHTML, text, this.iframe);
                            // fire input event so angular bindings are updated
                            if ("createEvent" in document) {
                                var evt = document.createEvent("HTMLEvents");
                                if (this.iframe) {
                                    // a 'change' event is required to trigger tinymce updates
                                    evt.initEvent("change", true, false);
                                }
                                else {
                                    evt.initEvent("input", true, false);
                                }
                                // this seems backwards, but fire the event from this elements nativeElement (not the
                                // one provided that may be in an iframe, as it won't be propogate)
                                this._element.nativeElement.dispatchEvent(evt);
                            }
                            this.startPos = -1;
                            this.stopSearch();
                            return false;
                        }
                        else if (event.keyCode === KEY_ESCAPE) {
                            this.stopEvent(event);
                            this.stopSearch();
                            return false;
                        }
                        else if (event.keyCode === KEY_DOWN) {
                            this.stopEvent(event);
                            this.searchList.activateNextItem();
                            return false;
                        }
                        else if (event.keyCode === KEY_UP) {
                            this.stopEvent(event);
                            this.searchList.activatePreviousItem();
                            return false;
                        }
                    }
                    if (charPressed.length != 1 && event.keyCode != KEY_BACKSPACE) {
                        this.stopEvent(event);
                        return false;
                    }
                    else if (this.searching) {
                        var mention = val.substring(this.startPos + 1, pos);
                        if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                            mention += charPressed;
                        }
                        this.searchString = mention;
                        if (this.activeConfig.returnTrigger) {
                            var triggerChar = (this.searchString || event.keyCode === KEY_BACKSPACE) ? val.substring(this.startPos, this.startPos + 1) : '';
                            this.searchTerm.emit(triggerChar + this.searchString);
                        }
                        else {
                            this.searchTerm.emit(this.searchString);
                        }
                        this.updateSearchList();
                    }
                }
            }
        };
        // exposed for external calls to open the mention list, e.g. by clicking a button
        MentionDirective.prototype.startSearch = function (triggerChar, nativeElement) {
            if (nativeElement === void 0) { nativeElement = this._element.nativeElement; }
            triggerChar = triggerChar || this.mentionConfig.triggerChar || this.DEFAULT_CONFIG.triggerChar;
            var pos = getCaretPosition(nativeElement, this.iframe);
            insertValue(nativeElement, pos, pos, this.activeConfig.insertHTML, triggerChar, this.iframe);
            this.keyHandler({ key: triggerChar, inputEvent: true }, nativeElement);
        };
        MentionDirective.prototype.stopSearch = function () {
            if (this.searchList && !this.searchList.hidden) {
                this.searchList.hidden = true;
                this.closed.emit();
            }
            this.activeConfig = null;
            this.searching = false;
        };
        MentionDirective.prototype.updateSearchList = function () {
            var _this = this;
            var matches = [];
            if (this.activeConfig && this.activeConfig.items) {
                var objects = this.activeConfig.items;
                // disabling the search relies on the async operation to do the filtering
                if (!this.activeConfig.disableSearch && this.searchString && this.activeConfig.labelKey) {
                    var searchStringLowerCase_1 = this.searchString.toLowerCase();
                    objects = objects.filter(function (e) { return e[_this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase_1); });
                }
                matches = objects;
                if (this.activeConfig.maxItems > 0) {
                    matches = matches.slice(0, this.activeConfig.maxItems);
                }
            }
            // update the search list
            if (this.searchList) {
                this.searchList.items = matches;
                this.searchList.hidden = matches.length == 0;
            }
        };
        MentionDirective.prototype.showSearchList = function (nativeElement) {
            var _this = this;
            this.opened.emit();
            if (this.searchList == null) {
                var componentFactory = this._componentResolver.resolveComponentFactory(MentionListComponent);
                var componentRef = this._viewContainerRef.createComponent(componentFactory);
                this.searchList = componentRef.instance;
                this.searchList.itemTemplate = this.mentionListTemplate;
                componentRef.instance['itemClick'].subscribe(function () {
                    nativeElement.focus();
                    var fakeKeydown = { key: 'Enter', keyCode: KEY_ENTER, wasClick: true };
                    _this.keyHandler(fakeKeydown, nativeElement);
                });
            }
            this.searchList.labelKey = this.activeConfig.labelKey;
            this.searchList.dropUp = this.activeConfig.dropUp;
            this.searchList.styleOff = this.mentionConfig.disableStyle;
            this.searchList.activeIndex = 0;
            this.searchList.position(nativeElement, this.iframe);
            window.requestAnimationFrame(function () { return _this.searchList.reset(); });
        };
        MentionDirective.ctorParameters = function () { return [
            { type: core.ElementRef },
            { type: core.ComponentFactoryResolver },
            { type: core.ViewContainerRef }
        ]; };
        __decorate([
            core.Input('mention'),
            __metadata("design:type", Array),
            __metadata("design:paramtypes", [Array])
        ], MentionDirective.prototype, "mention", null);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], MentionDirective.prototype, "mentionConfig", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", core.TemplateRef)
        ], MentionDirective.prototype, "mentionListTemplate", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MentionDirective.prototype, "searchTerm", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MentionDirective.prototype, "itemSelected", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MentionDirective.prototype, "opened", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MentionDirective.prototype, "closed", void 0);
        MentionDirective = __decorate([
            core.Directive({
                selector: '[mention], [mentionConfig]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(input)': 'inputHandler($event)',
                    '(blur)': 'blurHandler($event)',
                    'autocomplete': 'off'
                }
            }),
            __metadata("design:paramtypes", [core.ElementRef,
                core.ComponentFactoryResolver,
                core.ViewContainerRef])
        ], MentionDirective);
        return MentionDirective;
    }());

    var MentionModule = /** @class */ (function () {
        function MentionModule() {
        }
        MentionModule = __decorate([
            core.NgModule({
                declarations: [
                    MentionDirective,
                    MentionListComponent
                ],
                imports: [
                    common.CommonModule
                ],
                exports: [
                    MentionDirective
                ],
                entryComponents: [
                    MentionListComponent
                ]
            })
        ], MentionModule);
        return MentionModule;
    }());

    exports.MentionDirective = MentionDirective;
    exports.MentionModule = MentionModule;
    exports.ɵa = MentionListComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-mentions.umd.js.map
