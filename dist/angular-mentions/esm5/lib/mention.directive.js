import * as tslib_1 from "tslib";
import { ComponentFactoryResolver, Directive, ElementRef, TemplateRef, ViewContainerRef } from "@angular/core";
import { EventEmitter, Input, Output } from "@angular/core";
import { getCaretPosition, getValue, insertValue, setCaretPosition } from './mention-utils';
import { MentionListComponent } from './mention-list.component';
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
    MentionDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ComponentFactoryResolver },
        { type: ViewContainerRef }
    ]; };
    tslib_1.__decorate([
        Input('mention'),
        tslib_1.__metadata("design:type", Array),
        tslib_1.__metadata("design:paramtypes", [Array])
    ], MentionDirective.prototype, "mention", null);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], MentionDirective.prototype, "mentionConfig", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", TemplateRef)
    ], MentionDirective.prototype, "mentionListTemplate", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], MentionDirective.prototype, "searchTerm", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], MentionDirective.prototype, "itemSelected", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], MentionDirective.prototype, "opened", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], MentionDirective.prototype, "closed", void 0);
    MentionDirective = tslib_1.__decorate([
        Directive({
            selector: '[mention], [mentionConfig]',
            host: {
                '(keydown)': 'keyHandler($event)',
                '(input)': 'inputHandler($event)',
                '(blur)': 'blurHandler($event)',
                'autocomplete': 'off'
            }
        }),
        tslib_1.__metadata("design:paramtypes", [ElementRef,
            ComponentFactoryResolver,
            ViewContainerRef])
    ], MentionDirective);
    return MentionDirective;
}());
export { MentionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLW1lbnRpb25zLyIsInNvdXJjZXMiOlsibGliL21lbnRpb24uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDL0csT0FBTyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQWEsTUFBTSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRzVGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRWhFLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN4QixJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixJQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7QUFFekI7Ozs7O0dBS0c7QUFVSDtJQWdERSwwQkFDVSxRQUFvQixFQUNwQixrQkFBNEMsRUFDNUMsaUJBQW1DO1FBSDdDLGlCQUlLO1FBSEssYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUNwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTBCO1FBQzVDLHNCQUFpQixH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SUFBRCx1QkFBQztDQUFBLEFBMVVELElBMFVDO1NBMVVZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uQ2hhbmdlcywgT3V0cHV0LCBTaW1wbGVDaGFuZ2VzIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgZ2V0Q2FyZXRQb3NpdGlvbiwgZ2V0VmFsdWUsIGluc2VydFZhbHVlLCBzZXRDYXJldFBvc2l0aW9uIH0gZnJvbSAnLi9tZW50aW9uLXV0aWxzJztcclxuXHJcbmltcG9ydCB7IE1lbnRpb25Db25maWcgfSBmcm9tIFwiLi9tZW50aW9uLWNvbmZpZ1wiO1xyXG5pbXBvcnQgeyBNZW50aW9uTGlzdENvbXBvbmVudCB9IGZyb20gJy4vbWVudGlvbi1saXN0LmNvbXBvbmVudCc7XHJcblxyXG5jb25zdCBLRVlfQkFDS1NQQUNFID0gODtcclxuY29uc3QgS0VZX1RBQiA9IDk7XHJcbmNvbnN0IEtFWV9FTlRFUiA9IDEzO1xyXG5jb25zdCBLRVlfU0hJRlQgPSAxNjtcclxuY29uc3QgS0VZX0VTQ0FQRSA9IDI3O1xyXG5jb25zdCBLRVlfU1BBQ0UgPSAzMjtcclxuY29uc3QgS0VZX0xFRlQgPSAzNztcclxuY29uc3QgS0VZX1VQID0gMzg7XHJcbmNvbnN0IEtFWV9SSUdIVCA9IDM5O1xyXG5jb25zdCBLRVlfRE9XTiA9IDQwO1xyXG5jb25zdCBLRVlfQlVGRkVSRUQgPSAyMjk7XHJcblxyXG4vKipcclxuICogQW5ndWxhciBNZW50aW9ucy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL2RtYWNmYXJsYW5lL2FuZ3VsYXItbWVudGlvbnNcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IERhbiBNYWNGYXJsYW5lXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1ttZW50aW9uXSwgW21lbnRpb25Db25maWddJyxcclxuICBob3N0OiB7XHJcbiAgICAnKGtleWRvd24pJzogJ2tleUhhbmRsZXIoJGV2ZW50KScsXHJcbiAgICAnKGlucHV0KSc6ICdpbnB1dEhhbmRsZXIoJGV2ZW50KScsXHJcbiAgICAnKGJsdXIpJzogJ2JsdXJIYW5kbGVyKCRldmVudCknLFxyXG4gICAgJ2F1dG9jb21wbGV0ZSc6ICdvZmYnXHJcbiAgfVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWVudGlvbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XHJcblxyXG4gIC8vIHN0b3JlcyB0aGUgaXRlbXMgcGFzc2VkIHRvIHRoZSBtZW50aW9ucyBkaXJlY3RpdmUgYW5kIHVzZWQgdG8gcG9wdWxhdGUgdGhlIHJvb3QgaXRlbXMgaW4gbWVudGlvbkNvbmZpZ1xyXG4gIHByaXZhdGUgbWVudGlvbkl0ZW1zOiBhbnlbXTtcclxuXHJcbiAgQElucHV0KCdtZW50aW9uJykgc2V0IG1lbnRpb24oaXRlbXM6IGFueVtdKSB7XHJcbiAgICB0aGlzLm1lbnRpb25JdGVtcyA9IGl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gdGhlIHByb3ZpZGVkIGNvbmZpZ3VyYXRpb24gb2JqZWN0XHJcbiAgQElucHV0KCkgbWVudGlvbkNvbmZpZzogTWVudGlvbkNvbmZpZyA9IHsgaXRlbXM6IFtdIH07XHJcblxyXG4gIHByaXZhdGUgYWN0aXZlQ29uZmlnOiBNZW50aW9uQ29uZmlnO1xyXG5cclxuICBwcml2YXRlIERFRkFVTFRfQ09ORklHOiBNZW50aW9uQ29uZmlnID0ge1xyXG4gICAgaXRlbXM6IFtdLFxyXG4gICAgdHJpZ2dlckNoYXI6ICdAJyxcclxuICAgIGxhYmVsS2V5OiAnbGFiZWwnLFxyXG4gICAgbWF4SXRlbXM6IC0xLFxyXG4gICAgYWxsb3dTcGFjZTogZmFsc2UsXHJcbiAgICByZXR1cm5UcmlnZ2VyOiBmYWxzZSxcclxuICAgIGluc2VydEhUTUw6IHRydWUsXHJcbiAgICBtZW50aW9uU2VsZWN0OiAoaXRlbTogYW55LCB0cmlnZ2VyQ2hhcj86c3RyaW5nKSA9PiB0aGlzLmFjdGl2ZUNvbmZpZy50cmlnZ2VyQ2hhciArIGl0ZW1bdGhpcy5hY3RpdmVDb25maWcubGFiZWxLZXldXHJcbiAgfVxyXG5cclxuICAvLyB0ZW1wbGF0ZSB0byB1c2UgZm9yIHJlbmRlcmluZyBsaXN0IGl0ZW1zXHJcbiAgQElucHV0KCkgbWVudGlvbkxpc3RUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgLy8gZXZlbnQgZW1pdHRlZCB3aGVuZXZlciB0aGUgc2VhcmNoIHRlcm0gY2hhbmdlc1xyXG4gIEBPdXRwdXQoKSBzZWFyY2hUZXJtID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XHJcblxyXG4gIC8vIGV2ZW50IGVtaXR0ZWQgd2hlbiBhbiBpdGVtIGlzIHNlbGVjdGVkXHJcbiAgQE91dHB1dCgpIGl0ZW1TZWxlY3RlZCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICAvLyBldmVudCBlbWl0dGVkIHdoZW5ldmVyIHRoZSBtZW50aW9uIGxpc3QgaXMgb3BlbmVkIG9yIGNsb3NlZFxyXG4gIEBPdXRwdXQoKSBvcGVuZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQE91dHB1dCgpIGNsb3NlZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgcHJpdmF0ZSB0cmlnZ2VyQ2hhcnM6IHsgW2tleTogc3RyaW5nXTogTWVudGlvbkNvbmZpZyB9ID0ge307XHJcblxyXG4gIHByaXZhdGUgc2VhcmNoU3RyaW5nOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBzdGFydFBvczogbnVtYmVyO1xyXG4gIHByaXZhdGUgc3RhcnROb2RlO1xyXG4gIHByaXZhdGUgc2VhcmNoTGlzdDogTWVudGlvbkxpc3RDb21wb25lbnQ7XHJcbiAgcHJpdmF0ZSBzZWFyY2hpbmc6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBpZnJhbWU6IGFueTsgLy8gb3B0aW9uYWxcclxuICBwcml2YXRlIGxhc3RLZXlDb2RlOiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZixcclxuICAgIHByaXZhdGUgX2NvbXBvbmVudFJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXHJcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmXHJcbiAgKSB7IH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgLy8gY29uc29sZS5sb2coJ2NvbmZpZyBjaGFuZ2UnLCBjaGFuZ2VzKTtcclxuICAgIGlmIChjaGFuZ2VzWydtZW50aW9uJ10gfHwgY2hhbmdlc1snbWVudGlvbkNvbmZpZyddKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlQ29uZmlnKCkge1xyXG4gICAgbGV0IGNvbmZpZyA9IHRoaXMubWVudGlvbkNvbmZpZztcclxuICAgIHRoaXMudHJpZ2dlckNoYXJzID0ge307XHJcbiAgICAvLyB1c2UgaXRlbXMgZnJvbSBkaXJlY3RpdmUgaWYgdGhleSBoYXZlIGJlZW4gc2V0XHJcbiAgICBpZiAodGhpcy5tZW50aW9uSXRlbXMpIHtcclxuICAgICAgY29uZmlnLml0ZW1zID0gdGhpcy5tZW50aW9uSXRlbXM7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFkZENvbmZpZyhjb25maWcpO1xyXG4gICAgLy8gbmVzdGVkIGNvbmZpZ3NcclxuICAgIGlmIChjb25maWcubWVudGlvbnMpIHtcclxuICAgICAgY29uZmlnLm1lbnRpb25zLmZvckVhY2goY29uZmlnID0+IHRoaXMuYWRkQ29uZmlnKGNvbmZpZykpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gYWRkIGNvbmZpZ3VyYXRpb24gZm9yIGEgdHJpZ2dlciBjaGFyXHJcbiAgcHJpdmF0ZSBhZGRDb25maWcoY29uZmlnOiBNZW50aW9uQ29uZmlnKSB7XHJcbiAgICAvLyBkZWZhdWx0c1xyXG4gICAgbGV0IGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5ERUZBVUxUX0NPTkZJRyk7XHJcbiAgICBjb25maWcgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBjb25maWcpO1xyXG4gICAgLy8gaXRlbXNcclxuICAgIGxldCBpdGVtcyA9IGNvbmZpZy5pdGVtcztcclxuICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIC8vIGNvbnZlcnQgc3RyaW5ncyB0byBvYmplY3RzXHJcbiAgICAgIGlmICh0eXBlb2YgaXRlbXNbMF0gPT0gJ3N0cmluZycpIHtcclxuICAgICAgICBpdGVtcyA9IGl0ZW1zLm1hcCgobGFiZWwpID0+IHtcclxuICAgICAgICAgIGxldCBvYmplY3QgPSB7fTtcclxuICAgICAgICAgIG9iamVjdFtjb25maWcubGFiZWxLZXldID0gbGFiZWw7XHJcbiAgICAgICAgICByZXR1cm4gb2JqZWN0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjb25maWcubGFiZWxLZXkpIHtcclxuICAgICAgICAvLyByZW1vdmUgaXRlbXMgd2l0aG91dCBhbiBsYWJlbEtleSAoYXMgaXQncyByZXF1aXJlZCB0byBmaWx0ZXIgdGhlIGxpc3QpXHJcbiAgICAgICAgaXRlbXMgPSBpdGVtcy5maWx0ZXIoZSA9PiBlW2NvbmZpZy5sYWJlbEtleV0pO1xyXG4gICAgICAgIGlmICghY29uZmlnLmRpc2FibGVTb3J0KSB7XHJcbiAgICAgICAgICBpdGVtcy5zb3J0KChhLCBiKSA9PiBhW2NvbmZpZy5sYWJlbEtleV0ubG9jYWxlQ29tcGFyZShiW2NvbmZpZy5sYWJlbEtleV0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbmZpZy5pdGVtcyA9IGl0ZW1zO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgY29uZmlnXHJcbiAgICB0aGlzLnRyaWdnZXJDaGFyc1tjb25maWcudHJpZ2dlckNoYXJdID0gY29uZmlnO1xyXG5cclxuICAgIC8vIGZvciBhc3luYyB1cGRhdGUgd2hpbGUgbWVudS9zZWFyY2ggaXMgYWN0aXZlXHJcbiAgICBpZiAodGhpcy5hY3RpdmVDb25maWcgJiYgdGhpcy5hY3RpdmVDb25maWcudHJpZ2dlckNoYXIgPT0gY29uZmlnLnRyaWdnZXJDaGFyKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlQ29uZmlnID0gY29uZmlnO1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlYXJjaExpc3QoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldElmcmFtZShpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50KSB7XHJcbiAgICB0aGlzLmlmcmFtZSA9IGlmcmFtZTtcclxuICB9XHJcblxyXG4gIHN0b3BFdmVudChldmVudDogYW55KSB7XHJcbiAgICAvL2lmIChldmVudCBpbnN0YW5jZW9mIEtleWJvYXJkRXZlbnQpIHsgLy8gZG9lcyBub3Qgd29yayBmb3IgaWZyYW1lXHJcbiAgICBpZiAoIWV2ZW50Lndhc0NsaWNrKSB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGJsdXJIYW5kbGVyKGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMuc3RvcEV2ZW50KGV2ZW50KTtcclxuICAgIHRoaXMuc3RvcFNlYXJjaCgpO1xyXG4gIH1cclxuXHJcbiAgaW5wdXRIYW5kbGVyKGV2ZW50OiBhbnksIG5hdGl2ZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgIGlmICh0aGlzLmxhc3RLZXlDb2RlID09PSBLRVlfQlVGRkVSRUQgJiYgZXZlbnQuZGF0YSkge1xyXG4gICAgICBsZXQga2V5Q29kZSA9IGV2ZW50LmRhdGEuY2hhckNvZGVBdCgwKTtcclxuICAgICAgdGhpcy5rZXlIYW5kbGVyKHsga2V5Q29kZSwgaW5wdXRFdmVudDogdHJ1ZSB9LCBuYXRpdmVFbGVtZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwYXJhbSBuYXRpdmVFbGVtZW50IGlzIHRoZSBhbHRlcm5hdGl2ZSB0ZXh0IGVsZW1lbnQgaW4gYW4gaWZyYW1lIHNjZW5hcmlvXHJcbiAga2V5SGFuZGxlcihldmVudDogYW55LCBuYXRpdmVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50ID0gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50KSB7XHJcbiAgICB0aGlzLmxhc3RLZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcclxuXHJcbiAgICBpZiAoZXZlbnQuaXNDb21wb3NpbmcgfHwgZXZlbnQua2V5Q29kZSA9PT0gS0VZX0JVRkZFUkVEKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdmFsOiBzdHJpbmcgPSBnZXRWYWx1ZShuYXRpdmVFbGVtZW50KTtcclxuICAgIGxldCBwb3MgPSBnZXRDYXJldFBvc2l0aW9uKG5hdGl2ZUVsZW1lbnQsIHRoaXMuaWZyYW1lKTtcclxuICAgIGxldCBjaGFyUHJlc3NlZCA9IGV2ZW50LmtleTtcclxuICAgIGlmICghY2hhclByZXNzZWQpIHtcclxuICAgICAgbGV0IGNoYXJDb2RlID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuICAgICAgaWYgKCFldmVudC5zaGlmdEtleSAmJiAoY2hhckNvZGUgPj0gNjUgJiYgY2hhckNvZGUgPD0gOTApKSB7XHJcbiAgICAgICAgY2hhclByZXNzZWQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlICsgMzIpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGVsc2UgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIGNoYXJDb2RlID09PSBLRVlfMikge1xyXG4gICAgICAvLyAgIGNoYXJQcmVzc2VkID0gdGhpcy5jb25maWcudHJpZ2dlckNoYXI7XHJcbiAgICAgIC8vIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gVE9ETyAoZG1hY2ZhcmxhbmUpIGZpeCB0aGlzIGZvciBub24tYWxwaGEga2V5c1xyXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjIyMDE5Ni9ob3ctdG8tZGVjb2RlLWNoYXJhY3Rlci1wcmVzc2VkLWZyb20tanF1ZXJ5cy1rZXlkb3ducy1ldmVudC1oYW5kbGVyP2xxPTFcclxuICAgICAgICBjaGFyUHJlc3NlZCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChldmVudC5rZXlDb2RlID09IEtFWV9FTlRFUiAmJiBldmVudC53YXNDbGljayAmJiBwb3MgPCB0aGlzLnN0YXJ0UG9zKSB7XHJcbiAgICAgIC8vIHB1dCBjYXJldCBiYWNrIGluIHBvc2l0aW9uIHByaW9yIHRvIGNvbnRlbnRlZGl0YWJsZSBtZW51IGNsaWNrXHJcbiAgICAgIHBvcyA9IHRoaXMuc3RhcnROb2RlLmxlbmd0aDtcclxuICAgICAgc2V0Q2FyZXRQb3NpdGlvbih0aGlzLnN0YXJ0Tm9kZSwgcG9zLCB0aGlzLmlmcmFtZSk7XHJcbiAgICB9XHJcbiAgICAvL2NvbnNvbGUubG9nKFwia2V5SGFuZGxlclwiLCB0aGlzLnN0YXJ0UG9zLCBwb3MsIHZhbCwgY2hhclByZXNzZWQsIGV2ZW50KTtcclxuXHJcbiAgICBsZXQgY29uZmlnID0gdGhpcy50cmlnZ2VyQ2hhcnNbY2hhclByZXNzZWRdO1xyXG4gICAgaWYgKGNvbmZpZykge1xyXG4gICAgICB0aGlzLmFjdGl2ZUNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgdGhpcy5zdGFydFBvcyA9IGV2ZW50LmlucHV0RXZlbnQgPyBwb3MgLSAxIDogcG9zO1xyXG4gICAgICB0aGlzLnN0YXJ0Tm9kZSA9ICh0aGlzLmlmcmFtZSA/IHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cuZ2V0U2VsZWN0aW9uKCkgOiB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkpLmFuY2hvck5vZGU7XHJcbiAgICAgIHRoaXMuc2VhcmNoaW5nID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zZWFyY2hTdHJpbmcgPSBudWxsO1xyXG4gICAgICB0aGlzLnNob3dTZWFyY2hMaXN0KG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICB0aGlzLnVwZGF0ZVNlYXJjaExpc3QoKTtcclxuXHJcbiAgICAgIGlmIChjb25maWcucmV0dXJuVHJpZ2dlcikge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoVGVybS5lbWl0KGNvbmZpZy50cmlnZ2VyQ2hhcik7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLnN0YXJ0UG9zID49IDAgJiYgdGhpcy5zZWFyY2hpbmcpIHtcclxuICAgICAgaWYgKHBvcyA8PSB0aGlzLnN0YXJ0UG9zKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hMaXN0LmhpZGRlbiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gaWdub3JlIHNoaWZ0IHdoZW4gcHJlc3NlZCBhbG9uZSwgYnV0IG5vdCB3aGVuIHVzZWQgd2l0aCBhbm90aGVyIGtleVxyXG4gICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlICE9PSBLRVlfU0hJRlQgJiZcclxuICAgICAgICAhZXZlbnQubWV0YUtleSAmJlxyXG4gICAgICAgICFldmVudC5hbHRLZXkgJiZcclxuICAgICAgICAhZXZlbnQuY3RybEtleSAmJlxyXG4gICAgICAgIHBvcyA+IHRoaXMuc3RhcnRQb3NcclxuICAgICAgKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZUNvbmZpZy5hbGxvd1NwYWNlICYmIGV2ZW50LmtleUNvZGUgPT09IEtFWV9TUEFDRSkge1xyXG4gICAgICAgICAgdGhpcy5zdGFydFBvcyA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBLRVlfQkFDS1NQQUNFICYmIHBvcyA+IDApIHtcclxuICAgICAgICAgIHBvcy0tO1xyXG4gICAgICAgICAgaWYgKHBvcyA9PSB0aGlzLnN0YXJ0UG9zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcFNlYXJjaCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghdGhpcy5zZWFyY2hMaXN0LmhpZGRlbikge1xyXG4gICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9UQUIgfHwgZXZlbnQua2V5Q29kZSA9PT0gS0VZX0VOVEVSKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgLy8gZW1pdCB0aGUgc2VsZWN0ZWQgbGlzdCBpdGVtXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbVNlbGVjdGVkLmVtaXQodGhpcy5zZWFyY2hMaXN0LmFjdGl2ZUl0ZW0pO1xyXG4gICAgICAgICAgICAvLyBvcHRpb25hbCBmdW5jdGlvbiB0byBmb3JtYXQgdGhlIHNlbGVjdGVkIGl0ZW0gYmVmb3JlIGluc2VydGluZyB0aGUgdGV4dFxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5hY3RpdmVDb25maWcubWVudGlvblNlbGVjdCh0aGlzLnNlYXJjaExpc3QuYWN0aXZlSXRlbSwgdGhpcy5hY3RpdmVDb25maWcudHJpZ2dlckNoYXIpO1xyXG4gICAgICAgICAgICAvLyB2YWx1ZSBpcyBpbnNlcnRlZCB3aXRob3V0IGEgdHJhaWxpbmcgc3BhY2UgZm9yIGNvbnNpc3RlbmN5XHJcbiAgICAgICAgICAgIC8vIGJldHdlZW4gZWxlbWVudCB0eXBlcyAoZGl2IGFuZCBpZnJhbWUgZG8gbm90IHByZXNlcnZlIHRoZSBzcGFjZSlcclxuICAgICAgICAgICAgaW5zZXJ0VmFsdWUobmF0aXZlRWxlbWVudCwgdGhpcy5zdGFydFBvcywgcG9zLCB0aGlzLmFjdGl2ZUNvbmZpZy5pbnNlcnRIVE1MLCB0ZXh0LCB0aGlzLmlmcmFtZSk7XHJcbiAgICAgICAgICAgIC8vIGZpcmUgaW5wdXQgZXZlbnQgc28gYW5ndWxhciBiaW5kaW5ncyBhcmUgdXBkYXRlZFxyXG4gICAgICAgICAgICBpZiAoXCJjcmVhdGVFdmVudFwiIGluIGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgbGV0IGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcclxuICAgICAgICAgICAgICBpZiAodGhpcy5pZnJhbWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGEgJ2NoYW5nZScgZXZlbnQgaXMgcmVxdWlyZWQgdG8gdHJpZ2dlciB0aW55bWNlIHVwZGF0ZXNcclxuICAgICAgICAgICAgICAgIGV2dC5pbml0RXZlbnQoXCJjaGFuZ2VcIiwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGV2dC5pbml0RXZlbnQoXCJpbnB1dFwiLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIHRoaXMgc2VlbXMgYmFja3dhcmRzLCBidXQgZmlyZSB0aGUgZXZlbnQgZnJvbSB0aGlzIGVsZW1lbnRzIG5hdGl2ZUVsZW1lbnQgKG5vdCB0aGVcclxuICAgICAgICAgICAgICAvLyBvbmUgcHJvdmlkZWQgdGhhdCBtYXkgYmUgaW4gYW4gaWZyYW1lLCBhcyBpdCB3b24ndCBiZSBwcm9wb2dhdGUpXHJcbiAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0UG9zID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcFNlYXJjaCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBLRVlfRVNDQVBFKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wU2VhcmNoKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9ET1dOKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hMaXN0LmFjdGl2YXRlTmV4dEl0ZW0oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX1VQKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hMaXN0LmFjdGl2YXRlUHJldmlvdXNJdGVtKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjaGFyUHJlc3NlZC5sZW5ndGghPTEgJiYgZXZlbnQua2V5Q29kZSE9S0VZX0JBQ0tTUEFDRSkge1xyXG4gICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnNlYXJjaGluZykge1xyXG4gICAgICAgICAgbGV0IG1lbnRpb24gPSB2YWwuc3Vic3RyaW5nKHRoaXMuc3RhcnRQb3MgKyAxLCBwb3MpO1xyXG4gICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgIT09IEtFWV9CQUNLU1BBQ0UgJiYgIWV2ZW50LmlucHV0RXZlbnQpIHtcclxuICAgICAgICAgICAgbWVudGlvbiArPSBjaGFyUHJlc3NlZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuc2VhcmNoU3RyaW5nID0gbWVudGlvbjtcclxuICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUNvbmZpZy5yZXR1cm5UcmlnZ2VyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyaWdnZXJDaGFyID0gKHRoaXMuc2VhcmNoU3RyaW5nIHx8IGV2ZW50LmtleUNvZGUgPT09IEtFWV9CQUNLU1BBQ0UpID8gdmFsLnN1YnN0cmluZyh0aGlzLnN0YXJ0UG9zLCB0aGlzLnN0YXJ0UG9zICsgMSkgOiAnJztcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmVtaXQodHJpZ2dlckNoYXIgKyB0aGlzLnNlYXJjaFN0cmluZyk7XHJcbiAgICAgICAgICB9IFxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoVGVybS5lbWl0KHRoaXMuc2VhcmNoU3RyaW5nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMudXBkYXRlU2VhcmNoTGlzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gZXhwb3NlZCBmb3IgZXh0ZXJuYWwgY2FsbHMgdG8gb3BlbiB0aGUgbWVudGlvbiBsaXN0LCBlLmcuIGJ5IGNsaWNraW5nIGEgYnV0dG9uXHJcbiAgcHVibGljIHN0YXJ0U2VhcmNoKHRyaWdnZXJDaGFyPzogc3RyaW5nLCBuYXRpdmVFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50ID0gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50KSB7XHJcbiAgICB0cmlnZ2VyQ2hhciA9IHRyaWdnZXJDaGFyIHx8IHRoaXMubWVudGlvbkNvbmZpZy50cmlnZ2VyQ2hhciB8fCB0aGlzLkRFRkFVTFRfQ09ORklHLnRyaWdnZXJDaGFyO1xyXG4gICAgY29uc3QgcG9zID0gZ2V0Q2FyZXRQb3NpdGlvbihuYXRpdmVFbGVtZW50LCB0aGlzLmlmcmFtZSk7XHJcbiAgICBpbnNlcnRWYWx1ZShuYXRpdmVFbGVtZW50LCBwb3MsIHBvcywgdGhpcy5hY3RpdmVDb25maWcuaW5zZXJ0SFRNTCwgdHJpZ2dlckNoYXIsIHRoaXMuaWZyYW1lKTtcclxuICAgIHRoaXMua2V5SGFuZGxlcih7IGtleTogdHJpZ2dlckNoYXIsIGlucHV0RXZlbnQ6IHRydWUgfSwgbmF0aXZlRWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICBzdG9wU2VhcmNoKCkge1xyXG4gICAgaWYgKHRoaXMuc2VhcmNoTGlzdCAmJiAhdGhpcy5zZWFyY2hMaXN0LmhpZGRlbikge1xyXG4gICAgICB0aGlzLnNlYXJjaExpc3QuaGlkZGVuID0gdHJ1ZTtcclxuICAgICAgdGhpcy5jbG9zZWQuZW1pdCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVDb25maWcgPSBudWxsO1xyXG4gICAgdGhpcy5zZWFyY2hpbmcgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVNlYXJjaExpc3QoKSB7XHJcbiAgICBsZXQgbWF0Y2hlczogYW55W10gPSBbXTtcclxuICAgIGlmICh0aGlzLmFjdGl2ZUNvbmZpZyAmJiB0aGlzLmFjdGl2ZUNvbmZpZy5pdGVtcykge1xyXG4gICAgICBsZXQgb2JqZWN0cyA9IHRoaXMuYWN0aXZlQ29uZmlnLml0ZW1zO1xyXG4gICAgICAvLyBkaXNhYmxpbmcgdGhlIHNlYXJjaCByZWxpZXMgb24gdGhlIGFzeW5jIG9wZXJhdGlvbiB0byBkbyB0aGUgZmlsdGVyaW5nXHJcbiAgICAgIGlmICghdGhpcy5hY3RpdmVDb25maWcuZGlzYWJsZVNlYXJjaCAmJiB0aGlzLnNlYXJjaFN0cmluZyAmJiB0aGlzLmFjdGl2ZUNvbmZpZy5sYWJlbEtleSkge1xyXG4gICAgICAgIGxldCBzZWFyY2hTdHJpbmdMb3dlckNhc2UgPSB0aGlzLnNlYXJjaFN0cmluZy50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIG9iamVjdHMgPSBvYmplY3RzLmZpbHRlcihlID0+IGVbdGhpcy5hY3RpdmVDb25maWcubGFiZWxLZXldLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmdMb3dlckNhc2UpKTtcclxuICAgICAgfVxyXG4gICAgICBtYXRjaGVzID0gb2JqZWN0cztcclxuICAgICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnLm1heEl0ZW1zID4gMCkge1xyXG4gICAgICAgIG1hdGNoZXMgPSBtYXRjaGVzLnNsaWNlKDAsIHRoaXMuYWN0aXZlQ29uZmlnLm1heEl0ZW1zKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gdXBkYXRlIHRoZSBzZWFyY2ggbGlzdFxyXG4gICAgaWYgKHRoaXMuc2VhcmNoTGlzdCkge1xyXG4gICAgICB0aGlzLnNlYXJjaExpc3QuaXRlbXMgPSBtYXRjaGVzO1xyXG4gICAgICB0aGlzLnNlYXJjaExpc3QuaGlkZGVuID0gbWF0Y2hlcy5sZW5ndGggPT0gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNob3dTZWFyY2hMaXN0KG5hdGl2ZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgIHRoaXMub3BlbmVkLmVtaXQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5zZWFyY2hMaXN0ID09IG51bGwpIHtcclxuICAgICAgbGV0IGNvbXBvbmVudEZhY3RvcnkgPSB0aGlzLl9jb21wb25lbnRSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShNZW50aW9uTGlzdENvbXBvbmVudCk7XHJcbiAgICAgIGxldCBjb21wb25lbnRSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRGYWN0b3J5KTtcclxuICAgICAgdGhpcy5zZWFyY2hMaXN0ID0gY29tcG9uZW50UmVmLmluc3RhbmNlO1xyXG4gICAgICB0aGlzLnNlYXJjaExpc3QuaXRlbVRlbXBsYXRlID0gdGhpcy5tZW50aW9uTGlzdFRlbXBsYXRlO1xyXG4gICAgICBjb21wb25lbnRSZWYuaW5zdGFuY2VbJ2l0ZW1DbGljayddLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgbmF0aXZlRWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgIGxldCBmYWtlS2V5ZG93biA9IHsga2V5OiAnRW50ZXInLCBrZXlDb2RlOiBLRVlfRU5URVIsIHdhc0NsaWNrOiB0cnVlIH07XHJcbiAgICAgICAgdGhpcy5rZXlIYW5kbGVyKGZha2VLZXlkb3duLCBuYXRpdmVFbGVtZW50KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNlYXJjaExpc3QubGFiZWxLZXkgPSB0aGlzLmFjdGl2ZUNvbmZpZy5sYWJlbEtleTtcclxuICAgIHRoaXMuc2VhcmNoTGlzdC5kcm9wVXAgPSB0aGlzLmFjdGl2ZUNvbmZpZy5kcm9wVXA7XHJcbiAgICB0aGlzLnNlYXJjaExpc3Quc3R5bGVPZmYgPSB0aGlzLm1lbnRpb25Db25maWcuZGlzYWJsZVN0eWxlO1xyXG4gICAgdGhpcy5zZWFyY2hMaXN0LmFjdGl2ZUluZGV4ID0gMDtcclxuICAgIHRoaXMuc2VhcmNoTGlzdC5wb3NpdGlvbihuYXRpdmVFbGVtZW50LCB0aGlzLmlmcmFtZSk7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuc2VhcmNoTGlzdC5yZXNldCgpKTtcclxuICB9XHJcbn1cclxuIl19