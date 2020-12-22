import { ComponentFactoryResolver, Directive, ElementRef, TemplateRef, ViewContainerRef } from "@angular/core";
import { EventEmitter, Input, Output } from "@angular/core";
import { getCaretPosition, getValue, insertValue, setCaretPosition } from './mention-utils';
import { MentionListComponent } from './mention-list.component';
import * as i0 from "@angular/core";
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
        this.searchTerm = new EventEmitter();
        // event emitted when an item is selected
        this.itemSelected = new EventEmitter();
        // event emitted whenever the mention list is opened or closed
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
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
    MentionDirective.ɵfac = function MentionDirective_Factory(t) { return new (t || MentionDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ComponentFactoryResolver), i0.ɵɵdirectiveInject(i0.ViewContainerRef)); };
    MentionDirective.ɵdir = i0.ɵɵdefineDirective({ type: MentionDirective, selectors: [["", "mention", ""], ["", "mentionConfig", ""]], hostAttrs: ["autocomplete", "off"], hostBindings: function MentionDirective_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown", function MentionDirective_keydown_HostBindingHandler($event) { return ctx.keyHandler($event); })("input", function MentionDirective_input_HostBindingHandler($event) { return ctx.inputHandler($event); })("blur", function MentionDirective_blur_HostBindingHandler($event) { return ctx.blurHandler($event); });
        } }, inputs: { mention: "mention", mentionConfig: "mentionConfig", mentionListTemplate: "mentionListTemplate" }, outputs: { searchTerm: "searchTerm", itemSelected: "itemSelected", opened: "opened", closed: "closed" }, features: [i0.ɵɵNgOnChangesFeature] });
    return MentionDirective;
}());
export { MentionDirective };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MentionDirective, [{
        type: Directive,
        args: [{
                selector: '[mention], [mentionConfig]',
                host: {
                    '(keydown)': 'keyHandler($event)',
                    '(input)': 'inputHandler($event)',
                    '(blur)': 'blurHandler($event)',
                    'autocomplete': 'off'
                }
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.ComponentFactoryResolver }, { type: i0.ViewContainerRef }]; }, { mention: [{
            type: Input,
            args: ['mention']
        }], mentionConfig: [{
            type: Input
        }], mentionListTemplate: [{
            type: Input
        }], searchTerm: [{
            type: Output
        }], itemSelected: [{
            type: Output
        }], opened: [{
            type: Output
        }], closed: [{
            type: Output
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLW1lbnRpb25zLyIsInNvdXJjZXMiOlsibGliL21lbnRpb24uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRyxPQUFPLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBYSxNQUFNLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHNUYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7O0FBRWhFLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN4QixJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7QUFFekI7Ozs7O0dBS0c7QUFDSDtJQXlERSwwQkFDVSxRQUFvQixFQUNwQixrQkFBNEMsRUFDNUMsaUJBQW1DO1FBSDdDLGlCQUlLO1FBSEssYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUNwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTBCO1FBQzVDLHNCQUFpQixH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QUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO1FBQ3RELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ2xELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDO1FBQzNELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO0lBQzlELENBQUM7b0ZBelVVLGdCQUFnQjt5REFBaEIsZ0JBQWdCOzJHQUFoQixzQkFBa0Isa0ZBQWxCLHdCQUFvQixnRkFBcEIsdUJBQW1COzsyQkFsQ2hDO0NBNFdDLEFBblZELElBbVZDO1NBMVVZLGdCQUFnQjtrREFBaEIsZ0JBQWdCO2NBVDVCLFNBQVM7ZUFBQztnQkFDVCxRQUFRLEVBQUUsNEJBQTRCO2dCQUN0QyxJQUFJLEVBQUU7b0JBQ0osV0FBVyxFQUFFLG9CQUFvQjtvQkFDakMsU0FBUyxFQUFFLHNCQUFzQjtvQkFDakMsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsY0FBYyxFQUFFLEtBQUs7aUJBQ3RCO2FBQ0Y7O2tCQU1FLEtBQUs7bUJBQUMsU0FBUzs7a0JBS2YsS0FBSzs7a0JBZ0JMLEtBQUs7O2tCQUdMLE1BQU07O2tCQUdOLE1BQU07O2tCQUdOLE1BQU07O2tCQUNOLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkNoYW5nZXMsIE91dHB1dCwgU2ltcGxlQ2hhbmdlcyB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IGdldENhcmV0UG9zaXRpb24sIGdldFZhbHVlLCBpbnNlcnRWYWx1ZSwgc2V0Q2FyZXRQb3NpdGlvbiB9IGZyb20gJy4vbWVudGlvbi11dGlscyc7XHJcblxyXG5pbXBvcnQgeyBNZW50aW9uQ29uZmlnIH0gZnJvbSBcIi4vbWVudGlvbi1jb25maWdcIjtcclxuaW1wb3J0IHsgTWVudGlvbkxpc3RDb21wb25lbnQgfSBmcm9tICcuL21lbnRpb24tbGlzdC5jb21wb25lbnQnO1xyXG5cclxuY29uc3QgS0VZX0JBQ0tTUEFDRSA9IDg7XHJcbmNvbnN0IEtFWV9UQUIgPSA5O1xyXG5jb25zdCBLRVlfRU5URVIgPSAxMztcclxuY29uc3QgS0VZX1NISUZUID0gMTY7XHJcbmNvbnN0IEtFWV9FU0NBUEUgPSAyNztcclxuY29uc3QgS0VZX1NQQUNFID0gMzI7XHJcbmNvbnN0IEtFWV9MRUZUID0gMzc7XHJcbmNvbnN0IEtFWV9VUCA9IDM4O1xyXG5jb25zdCBLRVlfUklHSFQgPSAzOTtcclxuY29uc3QgS0VZX0RPV04gPSA0MDtcclxuY29uc3QgS0VZX0JVRkZFUkVEID0gMjI5O1xyXG5cclxuLyoqXHJcbiAqIEFuZ3VsYXIgTWVudGlvbnMuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kbWFjZmFybGFuZS9hbmd1bGFyLW1lbnRpb25zXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBEYW4gTWFjRmFybGFuZVxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbWVudGlvbl0sIFttZW50aW9uQ29uZmlnXScsXHJcbiAgaG9zdDoge1xyXG4gICAgJyhrZXlkb3duKSc6ICdrZXlIYW5kbGVyKCRldmVudCknLFxyXG4gICAgJyhpbnB1dCknOiAnaW5wdXRIYW5kbGVyKCRldmVudCknLFxyXG4gICAgJyhibHVyKSc6ICdibHVySGFuZGxlcigkZXZlbnQpJyxcclxuICAgICdhdXRvY29tcGxldGUnOiAnb2ZmJ1xyXG4gIH1cclxufSlcclxuZXhwb3J0IGNsYXNzIE1lbnRpb25EaXJlY3RpdmUgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xyXG5cclxuICAvLyBzdG9yZXMgdGhlIGl0ZW1zIHBhc3NlZCB0byB0aGUgbWVudGlvbnMgZGlyZWN0aXZlIGFuZCB1c2VkIHRvIHBvcHVsYXRlIHRoZSByb290IGl0ZW1zIGluIG1lbnRpb25Db25maWdcclxuICBwcml2YXRlIG1lbnRpb25JdGVtczogYW55W107XHJcblxyXG4gIEBJbnB1dCgnbWVudGlvbicpIHNldCBtZW50aW9uKGl0ZW1zOiBhbnlbXSkge1xyXG4gICAgdGhpcy5tZW50aW9uSXRlbXMgPSBpdGVtcztcclxuICB9XHJcblxyXG4gIC8vIHRoZSBwcm92aWRlZCBjb25maWd1cmF0aW9uIG9iamVjdFxyXG4gIEBJbnB1dCgpIG1lbnRpb25Db25maWc6IE1lbnRpb25Db25maWcgPSB7IGl0ZW1zOiBbXSB9O1xyXG5cclxuICBwcml2YXRlIGFjdGl2ZUNvbmZpZzogTWVudGlvbkNvbmZpZztcclxuXHJcbiAgcHJpdmF0ZSBERUZBVUxUX0NPTkZJRzogTWVudGlvbkNvbmZpZyA9IHtcclxuICAgIGl0ZW1zOiBbXSxcclxuICAgIHRyaWdnZXJDaGFyOiAnQCcsXHJcbiAgICBsYWJlbEtleTogJ2xhYmVsJyxcclxuICAgIG1heEl0ZW1zOiAtMSxcclxuICAgIGFsbG93U3BhY2U6IGZhbHNlLFxyXG4gICAgcmV0dXJuVHJpZ2dlcjogZmFsc2UsXHJcbiAgICBpbnNlcnRIVE1MOiB0cnVlLFxyXG4gICAgbWVudGlvblNlbGVjdDogKGl0ZW06IGFueSwgdHJpZ2dlckNoYXI/OnN0cmluZykgPT4gdGhpcy5hY3RpdmVDb25maWcudHJpZ2dlckNoYXIgKyBpdGVtW3RoaXMuYWN0aXZlQ29uZmlnLmxhYmVsS2V5XVxyXG4gIH1cclxuXHJcbiAgLy8gdGVtcGxhdGUgdG8gdXNlIGZvciByZW5kZXJpbmcgbGlzdCBpdGVtc1xyXG4gIEBJbnB1dCgpIG1lbnRpb25MaXN0VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gIC8vIGV2ZW50IGVtaXR0ZWQgd2hlbmV2ZXIgdGhlIHNlYXJjaCB0ZXJtIGNoYW5nZXNcclxuICBAT3V0cHV0KCkgc2VhcmNoVGVybSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xyXG5cclxuICAvLyBldmVudCBlbWl0dGVkIHdoZW4gYW4gaXRlbSBpcyBzZWxlY3RlZFxyXG4gIEBPdXRwdXQoKSBpdGVtU2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgLy8gZXZlbnQgZW1pdHRlZCB3aGVuZXZlciB0aGUgbWVudGlvbiBsaXN0IGlzIG9wZW5lZCBvciBjbG9zZWRcclxuICBAT3V0cHV0KCkgb3BlbmVkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gIEBPdXRwdXQoKSBjbG9zZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gIHByaXZhdGUgdHJpZ2dlckNoYXJzOiB7IFtrZXk6IHN0cmluZ106IE1lbnRpb25Db25maWcgfSA9IHt9O1xyXG5cclxuICBwcml2YXRlIHNlYXJjaFN0cmluZzogc3RyaW5nO1xyXG4gIHByaXZhdGUgc3RhcnRQb3M6IG51bWJlcjtcclxuICBwcml2YXRlIHN0YXJ0Tm9kZTtcclxuICBwcml2YXRlIHNlYXJjaExpc3Q6IE1lbnRpb25MaXN0Q29tcG9uZW50O1xyXG4gIHByaXZhdGUgc2VhcmNoaW5nOiBib29sZWFuO1xyXG4gIHByaXZhdGUgaWZyYW1lOiBhbnk7IC8vIG9wdGlvbmFsXHJcbiAgcHJpdmF0ZSBsYXN0S2V5Q29kZTogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIF9jb21wb25lbnRSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxyXG4gICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZlxyXG4gICkgeyB9XHJcblxyXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKCdjb25maWcgY2hhbmdlJywgY2hhbmdlcyk7XHJcbiAgICBpZiAoY2hhbmdlc1snbWVudGlvbiddIHx8IGNoYW5nZXNbJ21lbnRpb25Db25maWcnXSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZUNvbmZpZygpIHtcclxuICAgIGxldCBjb25maWcgPSB0aGlzLm1lbnRpb25Db25maWc7XHJcbiAgICB0aGlzLnRyaWdnZXJDaGFycyA9IHt9O1xyXG4gICAgLy8gdXNlIGl0ZW1zIGZyb20gZGlyZWN0aXZlIGlmIHRoZXkgaGF2ZSBiZWVuIHNldFxyXG4gICAgaWYgKHRoaXMubWVudGlvbkl0ZW1zKSB7XHJcbiAgICAgIGNvbmZpZy5pdGVtcyA9IHRoaXMubWVudGlvbkl0ZW1zO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hZGRDb25maWcoY29uZmlnKTtcclxuICAgIC8vIG5lc3RlZCBjb25maWdzXHJcbiAgICBpZiAoY29uZmlnLm1lbnRpb25zKSB7XHJcbiAgICAgIGNvbmZpZy5tZW50aW9ucy5mb3JFYWNoKGNvbmZpZyA9PiB0aGlzLmFkZENvbmZpZyhjb25maWcpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGFkZCBjb25maWd1cmF0aW9uIGZvciBhIHRyaWdnZXIgY2hhclxyXG4gIHByaXZhdGUgYWRkQ29uZmlnKGNvbmZpZzogTWVudGlvbkNvbmZpZykge1xyXG4gICAgLy8gZGVmYXVsdHNcclxuICAgIGxldCBkZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuREVGQVVMVF9DT05GSUcpO1xyXG4gICAgY29uZmlnID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgY29uZmlnKTtcclxuICAgIC8vIGl0ZW1zXHJcbiAgICBsZXQgaXRlbXMgPSBjb25maWcuaXRlbXM7XHJcbiAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAvLyBjb252ZXJ0IHN0cmluZ3MgdG8gb2JqZWN0c1xyXG4gICAgICBpZiAodHlwZW9mIGl0ZW1zWzBdID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgaXRlbXMgPSBpdGVtcy5tYXAoKGxhYmVsKSA9PiB7XHJcbiAgICAgICAgICBsZXQgb2JqZWN0ID0ge307XHJcbiAgICAgICAgICBvYmplY3RbY29uZmlnLmxhYmVsS2V5XSA9IGxhYmVsO1xyXG4gICAgICAgICAgcmV0dXJuIG9iamVjdDtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29uZmlnLmxhYmVsS2V5KSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIGl0ZW1zIHdpdGhvdXQgYW4gbGFiZWxLZXkgKGFzIGl0J3MgcmVxdWlyZWQgdG8gZmlsdGVyIHRoZSBsaXN0KVxyXG4gICAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKGUgPT4gZVtjb25maWcubGFiZWxLZXldKTtcclxuICAgICAgICBpZiAoIWNvbmZpZy5kaXNhYmxlU29ydCkge1xyXG4gICAgICAgICAgaXRlbXMuc29ydCgoYSwgYikgPT4gYVtjb25maWcubGFiZWxLZXldLmxvY2FsZUNvbXBhcmUoYltjb25maWcubGFiZWxLZXldKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25maWcuaXRlbXMgPSBpdGVtcztcclxuXHJcbiAgICAvLyBhZGQgdGhlIGNvbmZpZ1xyXG4gICAgdGhpcy50cmlnZ2VyQ2hhcnNbY29uZmlnLnRyaWdnZXJDaGFyXSA9IGNvbmZpZztcclxuXHJcbiAgICAvLyBmb3IgYXN5bmMgdXBkYXRlIHdoaWxlIG1lbnUvc2VhcmNoIGlzIGFjdGl2ZVxyXG4gICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnICYmIHRoaXMuYWN0aXZlQ29uZmlnLnRyaWdnZXJDaGFyID09IGNvbmZpZy50cmlnZ2VyQ2hhcikge1xyXG4gICAgICB0aGlzLmFjdGl2ZUNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgdGhpcy51cGRhdGVTZWFyY2hMaXN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRJZnJhbWUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCkge1xyXG4gICAgdGhpcy5pZnJhbWUgPSBpZnJhbWU7XHJcbiAgfVxyXG5cclxuICBzdG9wRXZlbnQoZXZlbnQ6IGFueSkge1xyXG4gICAgLy9pZiAoZXZlbnQgaW5zdGFuY2VvZiBLZXlib2FyZEV2ZW50KSB7IC8vIGRvZXMgbm90IHdvcmsgZm9yIGlmcmFtZVxyXG4gICAgaWYgKCFldmVudC53YXNDbGljaykge1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBibHVySGFuZGxlcihldmVudDogYW55KSB7XHJcbiAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICB0aGlzLnN0b3BTZWFyY2goKTtcclxuICB9XHJcblxyXG4gIGlucHV0SGFuZGxlcihldmVudDogYW55LCBuYXRpdmVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50ID0gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50KSB7XHJcbiAgICBpZiAodGhpcy5sYXN0S2V5Q29kZSA9PT0gS0VZX0JVRkZFUkVEICYmIGV2ZW50LmRhdGEpIHtcclxuICAgICAgbGV0IGtleUNvZGUgPSBldmVudC5kYXRhLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgIHRoaXMua2V5SGFuZGxlcih7IGtleUNvZGUsIGlucHV0RXZlbnQ6IHRydWUgfSwgbmF0aXZlRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcGFyYW0gbmF0aXZlRWxlbWVudCBpcyB0aGUgYWx0ZXJuYXRpdmUgdGV4dCBlbGVtZW50IGluIGFuIGlmcmFtZSBzY2VuYXJpb1xyXG4gIGtleUhhbmRsZXIoZXZlbnQ6IGFueSwgbmF0aXZlRWxlbWVudDogSFRNTElucHV0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCkge1xyXG4gICAgdGhpcy5sYXN0S2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XHJcblxyXG4gICAgaWYgKGV2ZW50LmlzQ29tcG9zaW5nIHx8IGV2ZW50LmtleUNvZGUgPT09IEtFWV9CVUZGRVJFRCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHZhbDogc3RyaW5nID0gZ2V0VmFsdWUobmF0aXZlRWxlbWVudCk7XHJcbiAgICBsZXQgcG9zID0gZ2V0Q2FyZXRQb3NpdGlvbihuYXRpdmVFbGVtZW50LCB0aGlzLmlmcmFtZSk7XHJcbiAgICBsZXQgY2hhclByZXNzZWQgPSBldmVudC5rZXk7XHJcbiAgICBpZiAoIWNoYXJQcmVzc2VkKSB7XHJcbiAgICAgIGxldCBjaGFyQ29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcbiAgICAgIGlmICghZXZlbnQuc2hpZnRLZXkgJiYgKGNoYXJDb2RlID49IDY1ICYmIGNoYXJDb2RlIDw9IDkwKSkge1xyXG4gICAgICAgIGNoYXJQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSArIDMyKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBlbHNlIGlmIChldmVudC5zaGlmdEtleSAmJiBjaGFyQ29kZSA9PT0gS0VZXzIpIHtcclxuICAgICAgLy8gICBjaGFyUHJlc3NlZCA9IHRoaXMuY29uZmlnLnRyaWdnZXJDaGFyO1xyXG4gICAgICAvLyB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIFRPRE8gKGRtYWNmYXJsYW5lKSBmaXggdGhpcyBmb3Igbm9uLWFscGhhIGtleXNcclxuICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIyMjAxOTYvaG93LXRvLWRlY29kZS1jaGFyYWN0ZXItcHJlc3NlZC1mcm9tLWpxdWVyeXMta2V5ZG93bnMtZXZlbnQtaGFuZGxlcj9scT0xXHJcbiAgICAgICAgY2hhclByZXNzZWQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSBLRVlfRU5URVIgJiYgZXZlbnQud2FzQ2xpY2sgJiYgcG9zIDwgdGhpcy5zdGFydFBvcykge1xyXG4gICAgICAvLyBwdXQgY2FyZXQgYmFjayBpbiBwb3NpdGlvbiBwcmlvciB0byBjb250ZW50ZWRpdGFibGUgbWVudSBjbGlja1xyXG4gICAgICBwb3MgPSB0aGlzLnN0YXJ0Tm9kZS5sZW5ndGg7XHJcbiAgICAgIHNldENhcmV0UG9zaXRpb24odGhpcy5zdGFydE5vZGUsIHBvcywgdGhpcy5pZnJhbWUpO1xyXG4gICAgfVxyXG4gICAgLy9jb25zb2xlLmxvZyhcImtleUhhbmRsZXJcIiwgdGhpcy5zdGFydFBvcywgcG9zLCB2YWwsIGNoYXJQcmVzc2VkLCBldmVudCk7XHJcblxyXG4gICAgbGV0IGNvbmZpZyA9IHRoaXMudHJpZ2dlckNoYXJzW2NoYXJQcmVzc2VkXTtcclxuICAgIGlmIChjb25maWcpIHtcclxuICAgICAgdGhpcy5hY3RpdmVDb25maWcgPSBjb25maWc7XHJcbiAgICAgIHRoaXMuc3RhcnRQb3MgPSBldmVudC5pbnB1dEV2ZW50ID8gcG9zIC0gMSA6IHBvcztcclxuICAgICAgdGhpcy5zdGFydE5vZGUgPSAodGhpcy5pZnJhbWUgPyB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LmdldFNlbGVjdGlvbigpIDogd2luZG93LmdldFNlbGVjdGlvbigpKS5hbmNob3JOb2RlO1xyXG4gICAgICB0aGlzLnNlYXJjaGluZyA9IHRydWU7XHJcbiAgICAgIHRoaXMuc2VhcmNoU3RyaW5nID0gbnVsbDtcclxuICAgICAgdGhpcy5zaG93U2VhcmNoTGlzdChuYXRpdmVFbGVtZW50KTtcclxuICAgICAgdGhpcy51cGRhdGVTZWFyY2hMaXN0KCk7XHJcblxyXG4gICAgICBpZiAoY29uZmlnLnJldHVyblRyaWdnZXIpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaFRlcm0uZW1pdChjb25maWcudHJpZ2dlckNoYXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGhpcy5zdGFydFBvcyA+PSAwICYmIHRoaXMuc2VhcmNoaW5nKSB7XHJcbiAgICAgIGlmIChwb3MgPD0gdGhpcy5zdGFydFBvcykge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoTGlzdC5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGlnbm9yZSBzaGlmdCB3aGVuIHByZXNzZWQgYWxvbmUsIGJ1dCBub3Qgd2hlbiB1c2VkIHdpdGggYW5vdGhlciBrZXlcclxuICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSAhPT0gS0VZX1NISUZUICYmXHJcbiAgICAgICAgIWV2ZW50Lm1ldGFLZXkgJiZcclxuICAgICAgICAhZXZlbnQuYWx0S2V5ICYmXHJcbiAgICAgICAgIWV2ZW50LmN0cmxLZXkgJiZcclxuICAgICAgICBwb3MgPiB0aGlzLnN0YXJ0UG9zXHJcbiAgICAgICkge1xyXG4gICAgICAgIGlmICghdGhpcy5hY3RpdmVDb25maWcuYWxsb3dTcGFjZSAmJiBldmVudC5rZXlDb2RlID09PSBLRVlfU1BBQ0UpIHtcclxuICAgICAgICAgIHRoaXMuc3RhcnRQb3MgPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX0JBQ0tTUEFDRSAmJiBwb3MgPiAwKSB7XHJcbiAgICAgICAgICBwb3MtLTtcclxuICAgICAgICAgIGlmIChwb3MgPT0gdGhpcy5zdGFydFBvcykge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BTZWFyY2goKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIXRoaXMuc2VhcmNoTGlzdC5oaWRkZW4pIHtcclxuICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBLRVlfVEFCIHx8IGV2ZW50LmtleUNvZGUgPT09IEtFWV9FTlRFUikge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIC8vIGVtaXQgdGhlIHNlbGVjdGVkIGxpc3QgaXRlbVxyXG4gICAgICAgICAgICB0aGlzLml0ZW1TZWxlY3RlZC5lbWl0KHRoaXMuc2VhcmNoTGlzdC5hY3RpdmVJdGVtKTtcclxuICAgICAgICAgICAgLy8gb3B0aW9uYWwgZnVuY3Rpb24gdG8gZm9ybWF0IHRoZSBzZWxlY3RlZCBpdGVtIGJlZm9yZSBpbnNlcnRpbmcgdGhlIHRleHRcclxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuYWN0aXZlQ29uZmlnLm1lbnRpb25TZWxlY3QodGhpcy5zZWFyY2hMaXN0LmFjdGl2ZUl0ZW0sIHRoaXMuYWN0aXZlQ29uZmlnLnRyaWdnZXJDaGFyKTtcclxuICAgICAgICAgICAgLy8gdmFsdWUgaXMgaW5zZXJ0ZWQgd2l0aG91dCBhIHRyYWlsaW5nIHNwYWNlIGZvciBjb25zaXN0ZW5jeVxyXG4gICAgICAgICAgICAvLyBiZXR3ZWVuIGVsZW1lbnQgdHlwZXMgKGRpdiBhbmQgaWZyYW1lIGRvIG5vdCBwcmVzZXJ2ZSB0aGUgc3BhY2UpXHJcbiAgICAgICAgICAgIGluc2VydFZhbHVlKG5hdGl2ZUVsZW1lbnQsIHRoaXMuc3RhcnRQb3MsIHBvcywgdGhpcy5hY3RpdmVDb25maWcuaW5zZXJ0SFRNTCwgdGV4dCwgdGhpcy5pZnJhbWUpO1xyXG4gICAgICAgICAgICAvLyBmaXJlIGlucHV0IGV2ZW50IHNvIGFuZ3VsYXIgYmluZGluZ3MgYXJlIHVwZGF0ZWRcclxuICAgICAgICAgICAgaWYgKFwiY3JlYXRlRXZlbnRcIiBpbiBkb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgIGxldCBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkhUTUxFdmVudHNcIik7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaWZyYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhICdjaGFuZ2UnIGV2ZW50IGlzIHJlcXVpcmVkIHRvIHRyaWdnZXIgdGlueW1jZSB1cGRhdGVzXHJcbiAgICAgICAgICAgICAgICBldnQuaW5pdEV2ZW50KFwiY2hhbmdlXCIsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldnQuaW5pdEV2ZW50KFwiaW5wdXRcIiwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyB0aGlzIHNlZW1zIGJhY2t3YXJkcywgYnV0IGZpcmUgdGhlIGV2ZW50IGZyb20gdGhpcyBlbGVtZW50cyBuYXRpdmVFbGVtZW50IChub3QgdGhlXHJcbiAgICAgICAgICAgICAgLy8gb25lIHByb3ZpZGVkIHRoYXQgbWF5IGJlIGluIGFuIGlmcmFtZSwgYXMgaXQgd29uJ3QgYmUgcHJvcG9nYXRlKVxyXG4gICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zdGFydFBvcyA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BTZWFyY2goKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX0VTQ0FQRSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcFNlYXJjaCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBLRVlfRE9XTikge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoTGlzdC5hY3RpdmF0ZU5leHRJdGVtKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9VUCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoTGlzdC5hY3RpdmF0ZVByZXZpb3VzSXRlbSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2hhclByZXNzZWQubGVuZ3RoIT0xICYmIGV2ZW50LmtleUNvZGUhPUtFWV9CQUNLU1BBQ0UpIHtcclxuICAgICAgICAgIHRoaXMuc3RvcEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5zZWFyY2hpbmcpIHtcclxuICAgICAgICAgIGxldCBtZW50aW9uID0gdmFsLnN1YnN0cmluZyh0aGlzLnN0YXJ0UG9zICsgMSwgcG9zKTtcclxuICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlICE9PSBLRVlfQkFDS1NQQUNFICYmICFldmVudC5pbnB1dEV2ZW50KSB7XHJcbiAgICAgICAgICAgIG1lbnRpb24gKz0gY2hhclByZXNzZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnNlYXJjaFN0cmluZyA9IG1lbnRpb247XHJcbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmVDb25maWcucmV0dXJuVHJpZ2dlcikge1xyXG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VyQ2hhciA9ICh0aGlzLnNlYXJjaFN0cmluZyB8fCBldmVudC5rZXlDb2RlID09PSBLRVlfQkFDS1NQQUNFKSA/IHZhbC5zdWJzdHJpbmcodGhpcy5zdGFydFBvcywgdGhpcy5zdGFydFBvcyArIDEpIDogJyc7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoVGVybS5lbWl0KHRyaWdnZXJDaGFyICsgdGhpcy5zZWFyY2hTdHJpbmcpO1xyXG4gICAgICAgICAgfSBcclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRlcm0uZW1pdCh0aGlzLnNlYXJjaFN0cmluZyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNlYXJjaExpc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGV4cG9zZWQgZm9yIGV4dGVybmFsIGNhbGxzIHRvIG9wZW4gdGhlIG1lbnRpb24gbGlzdCwgZS5nLiBieSBjbGlja2luZyBhIGJ1dHRvblxyXG4gIHB1YmxpYyBzdGFydFNlYXJjaCh0cmlnZ2VyQ2hhcj86IHN0cmluZywgbmF0aXZlRWxlbWVudDogSFRNTElucHV0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCkge1xyXG4gICAgdHJpZ2dlckNoYXIgPSB0cmlnZ2VyQ2hhciB8fCB0aGlzLm1lbnRpb25Db25maWcudHJpZ2dlckNoYXIgfHwgdGhpcy5ERUZBVUxUX0NPTkZJRy50cmlnZ2VyQ2hhcjtcclxuICAgIGNvbnN0IHBvcyA9IGdldENhcmV0UG9zaXRpb24obmF0aXZlRWxlbWVudCwgdGhpcy5pZnJhbWUpO1xyXG4gICAgaW5zZXJ0VmFsdWUobmF0aXZlRWxlbWVudCwgcG9zLCBwb3MsIHRoaXMuYWN0aXZlQ29uZmlnLmluc2VydEhUTUwsIHRyaWdnZXJDaGFyLCB0aGlzLmlmcmFtZSk7XHJcbiAgICB0aGlzLmtleUhhbmRsZXIoeyBrZXk6IHRyaWdnZXJDaGFyLCBpbnB1dEV2ZW50OiB0cnVlIH0sIG5hdGl2ZUVsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgc3RvcFNlYXJjaCgpIHtcclxuICAgIGlmICh0aGlzLnNlYXJjaExpc3QgJiYgIXRoaXMuc2VhcmNoTGlzdC5oaWRkZW4pIHtcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0LmhpZGRlbiA9IHRydWU7XHJcbiAgICAgIHRoaXMuY2xvc2VkLmVtaXQoKTtcclxuICAgIH1cclxuICAgIHRoaXMuYWN0aXZlQ29uZmlnID0gbnVsbDtcclxuICAgIHRoaXMuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVTZWFyY2hMaXN0KCkge1xyXG4gICAgbGV0IG1hdGNoZXM6IGFueVtdID0gW107XHJcbiAgICBpZiAodGhpcy5hY3RpdmVDb25maWcgJiYgdGhpcy5hY3RpdmVDb25maWcuaXRlbXMpIHtcclxuICAgICAgbGV0IG9iamVjdHMgPSB0aGlzLmFjdGl2ZUNvbmZpZy5pdGVtcztcclxuICAgICAgLy8gZGlzYWJsaW5nIHRoZSBzZWFyY2ggcmVsaWVzIG9uIHRoZSBhc3luYyBvcGVyYXRpb24gdG8gZG8gdGhlIGZpbHRlcmluZ1xyXG4gICAgICBpZiAoIXRoaXMuYWN0aXZlQ29uZmlnLmRpc2FibGVTZWFyY2ggJiYgdGhpcy5zZWFyY2hTdHJpbmcgJiYgdGhpcy5hY3RpdmVDb25maWcubGFiZWxLZXkpIHtcclxuICAgICAgICBsZXQgc2VhcmNoU3RyaW5nTG93ZXJDYXNlID0gdGhpcy5zZWFyY2hTdHJpbmcudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBvYmplY3RzID0gb2JqZWN0cy5maWx0ZXIoZSA9PiBlW3RoaXMuYWN0aXZlQ29uZmlnLmxhYmVsS2V5XS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nTG93ZXJDYXNlKSk7XHJcbiAgICAgIH1cclxuICAgICAgbWF0Y2hlcyA9IG9iamVjdHM7XHJcbiAgICAgIGlmICh0aGlzLmFjdGl2ZUNvbmZpZy5tYXhJdGVtcyA+IDApIHtcclxuICAgICAgICBtYXRjaGVzID0gbWF0Y2hlcy5zbGljZSgwLCB0aGlzLmFjdGl2ZUNvbmZpZy5tYXhJdGVtcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHVwZGF0ZSB0aGUgc2VhcmNoIGxpc3RcclxuICAgIGlmICh0aGlzLnNlYXJjaExpc3QpIHtcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0Lml0ZW1zID0gbWF0Y2hlcztcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0LmhpZGRlbiA9IG1hdGNoZXMubGVuZ3RoID09IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzaG93U2VhcmNoTGlzdChuYXRpdmVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICB0aGlzLm9wZW5lZC5lbWl0KCk7XHJcblxyXG4gICAgaWYgKHRoaXMuc2VhcmNoTGlzdCA9PSBudWxsKSB7XHJcbiAgICAgIGxldCBjb21wb25lbnRGYWN0b3J5ID0gdGhpcy5fY29tcG9uZW50UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoTWVudGlvbkxpc3RDb21wb25lbnQpO1xyXG4gICAgICBsZXQgY29tcG9uZW50UmVmID0gdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeSk7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdCA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZTtcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0Lml0ZW1UZW1wbGF0ZSA9IHRoaXMubWVudGlvbkxpc3RUZW1wbGF0ZTtcclxuICAgICAgY29tcG9uZW50UmVmLmluc3RhbmNlWydpdGVtQ2xpY2snXS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIG5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICBsZXQgZmFrZUtleWRvd24gPSB7IGtleTogJ0VudGVyJywga2V5Q29kZTogS0VZX0VOVEVSLCB3YXNDbGljazogdHJ1ZSB9O1xyXG4gICAgICAgIHRoaXMua2V5SGFuZGxlcihmYWtlS2V5ZG93biwgbmF0aXZlRWxlbWVudCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zZWFyY2hMaXN0LmxhYmVsS2V5ID0gdGhpcy5hY3RpdmVDb25maWcubGFiZWxLZXk7XHJcbiAgICB0aGlzLnNlYXJjaExpc3QuZHJvcFVwID0gdGhpcy5hY3RpdmVDb25maWcuZHJvcFVwO1xyXG4gICAgdGhpcy5zZWFyY2hMaXN0LnN0eWxlT2ZmID0gdGhpcy5tZW50aW9uQ29uZmlnLmRpc2FibGVTdHlsZTtcclxuICAgIHRoaXMuc2VhcmNoTGlzdC5hY3RpdmVJbmRleCA9IDA7XHJcbiAgICB0aGlzLnNlYXJjaExpc3QucG9zaXRpb24obmF0aXZlRWxlbWVudCwgdGhpcy5pZnJhbWUpO1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLnNlYXJjaExpc3QucmVzZXQoKSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==