import { ComponentFactoryResolver, Directive, ElementRef, TemplateRef, ViewContainerRef } from "@angular/core";
import { EventEmitter, Input, Output } from "@angular/core";
import { getCaretPosition, getValue, insertValue, setCaretPosition } from './mention-utils';
import { MentionListComponent } from './mention-list.component';
import * as i0 from "@angular/core";
const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_BUFFERED = 229;
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
export class MentionDirective {
    constructor(_element, _componentResolver, _viewContainerRef) {
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
            mentionSelect: (item, triggerChar) => this.activeConfig.triggerChar + item[this.activeConfig.labelKey]
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
    set mention(items) {
        this.mentionItems = items;
    }
    ngOnChanges(changes) {
        // console.log('config change', changes);
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
    }
    updateConfig() {
        let config = this.mentionConfig;
        this.triggerChars = {};
        // use items from directive if they have been set
        if (this.mentionItems) {
            config.items = this.mentionItems;
        }
        this.addConfig(config);
        // nested configs
        if (config.mentions) {
            config.mentions.forEach(config => this.addConfig(config));
        }
    }
    // add configuration for a trigger char
    addConfig(config) {
        // defaults
        let defaults = Object.assign({}, this.DEFAULT_CONFIG);
        config = Object.assign(defaults, config);
        // items
        let items = config.items;
        if (items && items.length > 0) {
            // convert strings to objects
            if (typeof items[0] == 'string') {
                items = items.map((label) => {
                    let object = {};
                    object[config.labelKey] = label;
                    return object;
                });
            }
            if (config.labelKey) {
                // remove items without an labelKey (as it's required to filter the list)
                items = items.filter(e => e[config.labelKey]);
                if (!config.disableSort) {
                    items.sort((a, b) => a[config.labelKey].localeCompare(b[config.labelKey]));
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
    }
    setIframe(iframe) {
        this.iframe = iframe;
    }
    stopEvent(event) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
    blurHandler(event) {
        this.stopEvent(event);
        this.stopSearch();
    }
    inputHandler(event, nativeElement = this._element.nativeElement) {
        if (this.lastKeyCode === KEY_BUFFERED && event.data) {
            let keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode, inputEvent: true }, nativeElement);
        }
    }
    // @param nativeElement is the alternative text element in an iframe scenario
    keyHandler(event, nativeElement = this._element.nativeElement) {
        this.lastKeyCode = event.keyCode;
        if (event.isComposing || event.keyCode === KEY_BUFFERED) {
            return;
        }
        let val = getValue(nativeElement);
        let pos = getCaretPosition(nativeElement, this.iframe);
        let charPressed = event.key;
        if (!charPressed) {
            let charCode = event.which || event.keyCode;
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
        let config = this.triggerChars[charPressed];
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
                        const text = this.activeConfig.mentionSelect(this.searchList.activeItem, this.activeConfig.triggerChar);
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        insertValue(nativeElement, this.startPos, pos, this.activeConfig.insertHTML, text, this.iframe);
                        // fire input event so angular bindings are updated
                        if ("createEvent" in document) {
                            let evt = document.createEvent("HTMLEvents");
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
                    let mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    if (this.activeConfig.returnTrigger) {
                        const triggerChar = (this.searchString || event.keyCode === KEY_BACKSPACE) ? val.substring(this.startPos, this.startPos + 1) : '';
                        this.searchTerm.emit(triggerChar + this.searchString);
                    }
                    else {
                        this.searchTerm.emit(this.searchString);
                    }
                    this.updateSearchList();
                }
            }
        }
    }
    // exposed for external calls to open the mention list, e.g. by clicking a button
    startSearch(triggerChar, nativeElement = this._element.nativeElement) {
        triggerChar = triggerChar || this.mentionConfig.triggerChar || this.DEFAULT_CONFIG.triggerChar;
        const pos = getCaretPosition(nativeElement, this.iframe);
        insertValue(nativeElement, pos, pos, this.activeConfig.insertHTML, triggerChar, this.iframe);
        this.keyHandler({ key: triggerChar, inputEvent: true }, nativeElement);
    }
    stopSearch() {
        if (this.searchList && !this.searchList.hidden) {
            this.searchList.hidden = true;
            this.closed.emit();
        }
        this.activeConfig = null;
        this.searching = false;
    }
    updateSearchList() {
        let matches = [];
        if (this.activeConfig && this.activeConfig.items) {
            let objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.activeConfig.disableSearch && this.searchString && this.activeConfig.labelKey) {
                let searchStringLowerCase = this.searchString.toLowerCase();
                objects = objects.filter(e => e[this.activeConfig.labelKey].toLowerCase().startsWith(searchStringLowerCase));
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
    }
    showSearchList(nativeElement) {
        this.opened.emit();
        if (this.searchList == null) {
            let componentFactory = this._componentResolver.resolveComponentFactory(MentionListComponent);
            let componentRef = this._viewContainerRef.createComponent(componentFactory);
            this.searchList = componentRef.instance;
            this.searchList.itemTemplate = this.mentionListTemplate;
            componentRef.instance['itemClick'].subscribe(() => {
                nativeElement.focus();
                let fakeKeydown = { key: 'Enter', keyCode: KEY_ENTER, wasClick: true };
                this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        this.searchList.labelKey = this.activeConfig.labelKey;
        this.searchList.dropUp = this.activeConfig.dropUp;
        this.searchList.styleOff = this.mentionConfig.disableStyle;
        this.searchList.activeIndex = 0;
        this.searchList.position(nativeElement, this.iframe);
        window.requestAnimationFrame(() => this.searchList.reset());
    }
}
MentionDirective.ɵfac = function MentionDirective_Factory(t) { return new (t || MentionDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ComponentFactoryResolver), i0.ɵɵdirectiveInject(i0.ViewContainerRef)); };
MentionDirective.ɵdir = i0.ɵɵdefineDirective({ type: MentionDirective, selectors: [["", "mention", ""], ["", "mentionConfig", ""]], hostAttrs: ["autocomplete", "off"], hostBindings: function MentionDirective_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵlistener("keydown", function MentionDirective_keydown_HostBindingHandler($event) { return ctx.keyHandler($event); })("input", function MentionDirective_input_HostBindingHandler($event) { return ctx.inputHandler($event); })("blur", function MentionDirective_blur_HostBindingHandler($event) { return ctx.blurHandler($event); });
    } }, inputs: { mention: "mention", mentionConfig: "mentionConfig", mentionListTemplate: "mentionListTemplate" }, outputs: { searchTerm: "searchTerm", itemSelected: "itemSelected", opened: "opened", closed: "closed" }, features: [i0.ɵɵNgOnChangesFeature] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLW1lbnRpb25zLyIsInNvdXJjZXMiOlsibGliL21lbnRpb24uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRyxPQUFPLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBYSxNQUFNLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHNUYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7O0FBRWhFLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN4QixNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDbEIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUM7QUFFekI7Ozs7O0dBS0c7QUFVSCxNQUFNLE9BQU8sZ0JBQWdCO0lBZ0QzQixZQUNVLFFBQW9CLEVBQ3BCLGtCQUE0QyxFQUM1QyxpQkFBbUM7UUFGbkMsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUNwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTBCO1FBQzVDLHNC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UUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzlELENBQUM7O2dGQXpVVSxnQkFBZ0I7cURBQWhCLGdCQUFnQjt1R0FBaEIsc0JBQWtCLGtGQUFsQix3QkFBb0IsZ0ZBQXBCLHVCQUFtQjs7a0RBQW5CLGdCQUFnQjtjQVQ1QixTQUFTO2VBQUM7Z0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsSUFBSSxFQUFFO29CQUNKLFdBQVcsRUFBRSxvQkFBb0I7b0JBQ2pDLFNBQVMsRUFBRSxzQkFBc0I7b0JBQ2pDLFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLGNBQWMsRUFBRSxLQUFLO2lCQUN0QjthQUNGOztrQkFNRSxLQUFLO21CQUFDLFNBQVM7O2tCQUtmLEtBQUs7O2tCQWdCTCxLQUFLOztrQkFHTCxNQUFNOztrQkFHTixNQUFNOztrQkFHTixNQUFNOztrQkFDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25DaGFuZ2VzLCBPdXRwdXQsIFNpbXBsZUNoYW5nZXMgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBnZXRDYXJldFBvc2l0aW9uLCBnZXRWYWx1ZSwgaW5zZXJ0VmFsdWUsIHNldENhcmV0UG9zaXRpb24gfSBmcm9tICcuL21lbnRpb24tdXRpbHMnO1xyXG5cclxuaW1wb3J0IHsgTWVudGlvbkNvbmZpZyB9IGZyb20gXCIuL21lbnRpb24tY29uZmlnXCI7XHJcbmltcG9ydCB7IE1lbnRpb25MaXN0Q29tcG9uZW50IH0gZnJvbSAnLi9tZW50aW9uLWxpc3QuY29tcG9uZW50JztcclxuXHJcbmNvbnN0IEtFWV9CQUNLU1BBQ0UgPSA4O1xyXG5jb25zdCBLRVlfVEFCID0gOTtcclxuY29uc3QgS0VZX0VOVEVSID0gMTM7XHJcbmNvbnN0IEtFWV9TSElGVCA9IDE2O1xyXG5jb25zdCBLRVlfRVNDQVBFID0gMjc7XHJcbmNvbnN0IEtFWV9TUEFDRSA9IDMyO1xyXG5jb25zdCBLRVlfTEVGVCA9IDM3O1xyXG5jb25zdCBLRVlfVVAgPSAzODtcclxuY29uc3QgS0VZX1JJR0hUID0gMzk7XHJcbmNvbnN0IEtFWV9ET1dOID0gNDA7XHJcbmNvbnN0IEtFWV9CVUZGRVJFRCA9IDIyOTtcclxuXHJcbi8qKlxyXG4gKiBBbmd1bGFyIE1lbnRpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZG1hY2ZhcmxhbmUvYW5ndWxhci1tZW50aW9uc1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgRGFuIE1hY0ZhcmxhbmVcclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW21lbnRpb25dLCBbbWVudGlvbkNvbmZpZ10nLFxyXG4gIGhvc3Q6IHtcclxuICAgICcoa2V5ZG93biknOiAna2V5SGFuZGxlcigkZXZlbnQpJyxcclxuICAgICcoaW5wdXQpJzogJ2lucHV0SGFuZGxlcigkZXZlbnQpJyxcclxuICAgICcoYmx1ciknOiAnYmx1ckhhbmRsZXIoJGV2ZW50KScsXHJcbiAgICAnYXV0b2NvbXBsZXRlJzogJ29mZidcclxuICB9XHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNZW50aW9uRGlyZWN0aXZlIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcclxuXHJcbiAgLy8gc3RvcmVzIHRoZSBpdGVtcyBwYXNzZWQgdG8gdGhlIG1lbnRpb25zIGRpcmVjdGl2ZSBhbmQgdXNlZCB0byBwb3B1bGF0ZSB0aGUgcm9vdCBpdGVtcyBpbiBtZW50aW9uQ29uZmlnXHJcbiAgcHJpdmF0ZSBtZW50aW9uSXRlbXM6IGFueVtdO1xyXG5cclxuICBASW5wdXQoJ21lbnRpb24nKSBzZXQgbWVudGlvbihpdGVtczogYW55W10pIHtcclxuICAgIHRoaXMubWVudGlvbkl0ZW1zID0gaXRlbXM7XHJcbiAgfVxyXG5cclxuICAvLyB0aGUgcHJvdmlkZWQgY29uZmlndXJhdGlvbiBvYmplY3RcclxuICBASW5wdXQoKSBtZW50aW9uQ29uZmlnOiBNZW50aW9uQ29uZmlnID0geyBpdGVtczogW10gfTtcclxuXHJcbiAgcHJpdmF0ZSBhY3RpdmVDb25maWc6IE1lbnRpb25Db25maWc7XHJcblxyXG4gIHByaXZhdGUgREVGQVVMVF9DT05GSUc6IE1lbnRpb25Db25maWcgPSB7XHJcbiAgICBpdGVtczogW10sXHJcbiAgICB0cmlnZ2VyQ2hhcjogJ0AnLFxyXG4gICAgbGFiZWxLZXk6ICdsYWJlbCcsXHJcbiAgICBtYXhJdGVtczogLTEsXHJcbiAgICBhbGxvd1NwYWNlOiBmYWxzZSxcclxuICAgIHJldHVyblRyaWdnZXI6IGZhbHNlLFxyXG4gICAgaW5zZXJ0SFRNTDogdHJ1ZSxcclxuICAgIG1lbnRpb25TZWxlY3Q6IChpdGVtOiBhbnksIHRyaWdnZXJDaGFyPzpzdHJpbmcpID0+IHRoaXMuYWN0aXZlQ29uZmlnLnRyaWdnZXJDaGFyICsgaXRlbVt0aGlzLmFjdGl2ZUNvbmZpZy5sYWJlbEtleV1cclxuICB9XHJcblxyXG4gIC8vIHRlbXBsYXRlIHRvIHVzZSBmb3IgcmVuZGVyaW5nIGxpc3QgaXRlbXNcclxuICBASW5wdXQoKSBtZW50aW9uTGlzdFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAvLyBldmVudCBlbWl0dGVkIHdoZW5ldmVyIHRoZSBzZWFyY2ggdGVybSBjaGFuZ2VzXHJcbiAgQE91dHB1dCgpIHNlYXJjaFRlcm0gPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcclxuXHJcbiAgLy8gZXZlbnQgZW1pdHRlZCB3aGVuIGFuIGl0ZW0gaXMgc2VsZWN0ZWRcclxuICBAT3V0cHV0KCkgaXRlbVNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gIC8vIGV2ZW50IGVtaXR0ZWQgd2hlbmV2ZXIgdGhlIG1lbnRpb24gbGlzdCBpcyBvcGVuZWQgb3IgY2xvc2VkXHJcbiAgQE91dHB1dCgpIG9wZW5lZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAT3V0cHV0KCkgY2xvc2VkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBwcml2YXRlIHRyaWdnZXJDaGFyczogeyBba2V5OiBzdHJpbmddOiBNZW50aW9uQ29uZmlnIH0gPSB7fTtcclxuXHJcbiAgcHJpdmF0ZSBzZWFyY2hTdHJpbmc6IHN0cmluZztcclxuICBwcml2YXRlIHN0YXJ0UG9zOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBzdGFydE5vZGU7XHJcbiAgcHJpdmF0ZSBzZWFyY2hMaXN0OiBNZW50aW9uTGlzdENvbXBvbmVudDtcclxuICBwcml2YXRlIHNlYXJjaGluZzogYm9vbGVhbjtcclxuICBwcml2YXRlIGlmcmFtZTogYW55OyAvLyBvcHRpb25hbFxyXG4gIHByaXZhdGUgbGFzdEtleUNvZGU6IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIF9lbGVtZW50OiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSBfY29tcG9uZW50UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcclxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWZcclxuICApIHsgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZygnY29uZmlnIGNoYW5nZScsIGNoYW5nZXMpO1xyXG4gICAgaWYgKGNoYW5nZXNbJ21lbnRpb24nXSB8fCBjaGFuZ2VzWydtZW50aW9uQ29uZmlnJ10pIHtcclxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVDb25maWcoKSB7XHJcbiAgICBsZXQgY29uZmlnID0gdGhpcy5tZW50aW9uQ29uZmlnO1xyXG4gICAgdGhpcy50cmlnZ2VyQ2hhcnMgPSB7fTtcclxuICAgIC8vIHVzZSBpdGVtcyBmcm9tIGRpcmVjdGl2ZSBpZiB0aGV5IGhhdmUgYmVlbiBzZXRcclxuICAgIGlmICh0aGlzLm1lbnRpb25JdGVtcykge1xyXG4gICAgICBjb25maWcuaXRlbXMgPSB0aGlzLm1lbnRpb25JdGVtcztcclxuICAgIH1cclxuICAgIHRoaXMuYWRkQ29uZmlnKGNvbmZpZyk7XHJcbiAgICAvLyBuZXN0ZWQgY29uZmlnc1xyXG4gICAgaWYgKGNvbmZpZy5tZW50aW9ucykge1xyXG4gICAgICBjb25maWcubWVudGlvbnMuZm9yRWFjaChjb25maWcgPT4gdGhpcy5hZGRDb25maWcoY29uZmlnKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBhZGQgY29uZmlndXJhdGlvbiBmb3IgYSB0cmlnZ2VyIGNoYXJcclxuICBwcml2YXRlIGFkZENvbmZpZyhjb25maWc6IE1lbnRpb25Db25maWcpIHtcclxuICAgIC8vIGRlZmF1bHRzXHJcbiAgICBsZXQgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLkRFRkFVTFRfQ09ORklHKTtcclxuICAgIGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIGNvbmZpZyk7XHJcbiAgICAvLyBpdGVtc1xyXG4gICAgbGV0IGl0ZW1zID0gY29uZmlnLml0ZW1zO1xyXG4gICAgaWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgLy8gY29udmVydCBzdHJpbmdzIHRvIG9iamVjdHNcclxuICAgICAgaWYgKHR5cGVvZiBpdGVtc1swXSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGl0ZW1zID0gaXRlbXMubWFwKChsYWJlbCkgPT4ge1xyXG4gICAgICAgICAgbGV0IG9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgb2JqZWN0W2NvbmZpZy5sYWJlbEtleV0gPSBsYWJlbDtcclxuICAgICAgICAgIHJldHVybiBvYmplY3Q7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbmZpZy5sYWJlbEtleSkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBpdGVtcyB3aXRob3V0IGFuIGxhYmVsS2V5IChhcyBpdCdzIHJlcXVpcmVkIHRvIGZpbHRlciB0aGUgbGlzdClcclxuICAgICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcihlID0+IGVbY29uZmlnLmxhYmVsS2V5XSk7XHJcbiAgICAgICAgaWYgKCFjb25maWcuZGlzYWJsZVNvcnQpIHtcclxuICAgICAgICAgIGl0ZW1zLnNvcnQoKGEsIGIpID0+IGFbY29uZmlnLmxhYmVsS2V5XS5sb2NhbGVDb21wYXJlKGJbY29uZmlnLmxhYmVsS2V5XSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uZmlnLml0ZW1zID0gaXRlbXM7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBjb25maWdcclxuICAgIHRoaXMudHJpZ2dlckNoYXJzW2NvbmZpZy50cmlnZ2VyQ2hhcl0gPSBjb25maWc7XHJcblxyXG4gICAgLy8gZm9yIGFzeW5jIHVwZGF0ZSB3aGlsZSBtZW51L3NlYXJjaCBpcyBhY3RpdmVcclxuICAgIGlmICh0aGlzLmFjdGl2ZUNvbmZpZyAmJiB0aGlzLmFjdGl2ZUNvbmZpZy50cmlnZ2VyQ2hhciA9PSBjb25maWcudHJpZ2dlckNoYXIpIHtcclxuICAgICAgdGhpcy5hY3RpdmVDb25maWcgPSBjb25maWc7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VhcmNoTGlzdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0SWZyYW1lKGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQpIHtcclxuICAgIHRoaXMuaWZyYW1lID0gaWZyYW1lO1xyXG4gIH1cclxuXHJcbiAgc3RvcEV2ZW50KGV2ZW50OiBhbnkpIHtcclxuICAgIC8vaWYgKGV2ZW50IGluc3RhbmNlb2YgS2V5Ym9hcmRFdmVudCkgeyAvLyBkb2VzIG5vdCB3b3JrIGZvciBpZnJhbWVcclxuICAgIGlmICghZXZlbnQud2FzQ2xpY2spIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYmx1ckhhbmRsZXIoZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgdGhpcy5zdG9wU2VhcmNoKCk7XHJcbiAgfVxyXG5cclxuICBpbnB1dEhhbmRsZXIoZXZlbnQ6IGFueSwgbmF0aXZlRWxlbWVudDogSFRNTElucHV0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudCkge1xyXG4gICAgaWYgKHRoaXMubGFzdEtleUNvZGUgPT09IEtFWV9CVUZGRVJFRCAmJiBldmVudC5kYXRhKSB7XHJcbiAgICAgIGxldCBrZXlDb2RlID0gZXZlbnQuZGF0YS5jaGFyQ29kZUF0KDApO1xyXG4gICAgICB0aGlzLmtleUhhbmRsZXIoeyBrZXlDb2RlLCBpbnB1dEV2ZW50OiB0cnVlIH0sIG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHBhcmFtIG5hdGl2ZUVsZW1lbnQgaXMgdGhlIGFsdGVybmF0aXZlIHRleHQgZWxlbWVudCBpbiBhbiBpZnJhbWUgc2NlbmFyaW9cclxuICBrZXlIYW5kbGVyKGV2ZW50OiBhbnksIG5hdGl2ZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgIHRoaXMubGFzdEtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xyXG5cclxuICAgIGlmIChldmVudC5pc0NvbXBvc2luZyB8fCBldmVudC5rZXlDb2RlID09PSBLRVlfQlVGRkVSRUQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB2YWw6IHN0cmluZyA9IGdldFZhbHVlKG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgbGV0IHBvcyA9IGdldENhcmV0UG9zaXRpb24obmF0aXZlRWxlbWVudCwgdGhpcy5pZnJhbWUpO1xyXG4gICAgbGV0IGNoYXJQcmVzc2VkID0gZXZlbnQua2V5O1xyXG4gICAgaWYgKCFjaGFyUHJlc3NlZCkge1xyXG4gICAgICBsZXQgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG4gICAgICBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIChjaGFyQ29kZSA+PSA2NSAmJiBjaGFyQ29kZSA8PSA5MCkpIHtcclxuICAgICAgICBjaGFyUHJlc3NlZCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUgKyAzMik7XHJcbiAgICAgIH1cclxuICAgICAgLy8gZWxzZSBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgY2hhckNvZGUgPT09IEtFWV8yKSB7XHJcbiAgICAgIC8vICAgY2hhclByZXNzZWQgPSB0aGlzLmNvbmZpZy50cmlnZ2VyQ2hhcjtcclxuICAgICAgLy8gfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBUT0RPIChkbWFjZmFybGFuZSkgZml4IHRoaXMgZm9yIG5vbi1hbHBoYSBrZXlzXHJcbiAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMjIwMTk2L2hvdy10by1kZWNvZGUtY2hhcmFjdGVyLXByZXNzZWQtZnJvbS1qcXVlcnlzLWtleWRvd25zLWV2ZW50LWhhbmRsZXI/bHE9MVxyXG4gICAgICAgIGNoYXJQcmVzc2VkID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT0gS0VZX0VOVEVSICYmIGV2ZW50Lndhc0NsaWNrICYmIHBvcyA8IHRoaXMuc3RhcnRQb3MpIHtcclxuICAgICAgLy8gcHV0IGNhcmV0IGJhY2sgaW4gcG9zaXRpb24gcHJpb3IgdG8gY29udGVudGVkaXRhYmxlIG1lbnUgY2xpY2tcclxuICAgICAgcG9zID0gdGhpcy5zdGFydE5vZGUubGVuZ3RoO1xyXG4gICAgICBzZXRDYXJldFBvc2l0aW9uKHRoaXMuc3RhcnROb2RlLCBwb3MsIHRoaXMuaWZyYW1lKTtcclxuICAgIH1cclxuICAgIC8vY29uc29sZS5sb2coXCJrZXlIYW5kbGVyXCIsIHRoaXMuc3RhcnRQb3MsIHBvcywgdmFsLCBjaGFyUHJlc3NlZCwgZXZlbnQpO1xyXG5cclxuICAgIGxldCBjb25maWcgPSB0aGlzLnRyaWdnZXJDaGFyc1tjaGFyUHJlc3NlZF07XHJcbiAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlQ29uZmlnID0gY29uZmlnO1xyXG4gICAgICB0aGlzLnN0YXJ0UG9zID0gZXZlbnQuaW5wdXRFdmVudCA/IHBvcyAtIDEgOiBwb3M7XHJcbiAgICAgIHRoaXMuc3RhcnROb2RlID0gKHRoaXMuaWZyYW1lID8gdGhpcy5pZnJhbWUuY29udGVudFdpbmRvdy5nZXRTZWxlY3Rpb24oKSA6IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSkuYW5jaG9yTm9kZTtcclxuICAgICAgdGhpcy5zZWFyY2hpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNlYXJjaFN0cmluZyA9IG51bGw7XHJcbiAgICAgIHRoaXMuc2hvd1NlYXJjaExpc3QobmF0aXZlRWxlbWVudCk7XHJcbiAgICAgIHRoaXMudXBkYXRlU2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgaWYgKGNvbmZpZy5yZXR1cm5UcmlnZ2VyKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmVtaXQoY29uZmlnLnRyaWdnZXJDaGFyKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuc3RhcnRQb3MgPj0gMCAmJiB0aGlzLnNlYXJjaGluZykge1xyXG4gICAgICBpZiAocG9zIDw9IHRoaXMuc3RhcnRQb3MpIHtcclxuICAgICAgICB0aGlzLnNlYXJjaExpc3QuaGlkZGVuID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICAvLyBpZ25vcmUgc2hpZnQgd2hlbiBwcmVzc2VkIGFsb25lLCBidXQgbm90IHdoZW4gdXNlZCB3aXRoIGFub3RoZXIga2V5XHJcbiAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgIT09IEtFWV9TSElGVCAmJlxyXG4gICAgICAgICFldmVudC5tZXRhS2V5ICYmXHJcbiAgICAgICAgIWV2ZW50LmFsdEtleSAmJlxyXG4gICAgICAgICFldmVudC5jdHJsS2V5ICYmXHJcbiAgICAgICAgcG9zID4gdGhpcy5zdGFydFBvc1xyXG4gICAgICApIHtcclxuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlQ29uZmlnLmFsbG93U3BhY2UgJiYgZXZlbnQua2V5Q29kZSA9PT0gS0VZX1NQQUNFKSB7XHJcbiAgICAgICAgICB0aGlzLnN0YXJ0UG9zID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9CQUNLU1BBQ0UgJiYgcG9zID4gMCkge1xyXG4gICAgICAgICAgcG9zLS07XHJcbiAgICAgICAgICBpZiAocG9zID09IHRoaXMuc3RhcnRQb3MpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wU2VhcmNoKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLnNlYXJjaExpc3QuaGlkZGVuKSB7XHJcbiAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX1RBQiB8fCBldmVudC5rZXlDb2RlID09PSBLRVlfRU5URVIpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICAvLyBlbWl0IHRoZSBzZWxlY3RlZCBsaXN0IGl0ZW1cclxuICAgICAgICAgICAgdGhpcy5pdGVtU2VsZWN0ZWQuZW1pdCh0aGlzLnNlYXJjaExpc3QuYWN0aXZlSXRlbSk7XHJcbiAgICAgICAgICAgIC8vIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgc2VsZWN0ZWQgaXRlbSBiZWZvcmUgaW5zZXJ0aW5nIHRoZSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmFjdGl2ZUNvbmZpZy5tZW50aW9uU2VsZWN0KHRoaXMuc2VhcmNoTGlzdC5hY3RpdmVJdGVtLCB0aGlzLmFjdGl2ZUNvbmZpZy50cmlnZ2VyQ2hhcik7XHJcbiAgICAgICAgICAgIC8vIHZhbHVlIGlzIGluc2VydGVkIHdpdGhvdXQgYSB0cmFpbGluZyBzcGFjZSBmb3IgY29uc2lzdGVuY3lcclxuICAgICAgICAgICAgLy8gYmV0d2VlbiBlbGVtZW50IHR5cGVzIChkaXYgYW5kIGlmcmFtZSBkbyBub3QgcHJlc2VydmUgdGhlIHNwYWNlKVxyXG4gICAgICAgICAgICBpbnNlcnRWYWx1ZShuYXRpdmVFbGVtZW50LCB0aGlzLnN0YXJ0UG9zLCBwb3MsIHRoaXMuYWN0aXZlQ29uZmlnLmluc2VydEhUTUwsIHRleHQsIHRoaXMuaWZyYW1lKTtcclxuICAgICAgICAgICAgLy8gZmlyZSBpbnB1dCBldmVudCBzbyBhbmd1bGFyIGJpbmRpbmdzIGFyZSB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmIChcImNyZWF0ZUV2ZW50XCIgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJIVE1MRXZlbnRzXCIpO1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYSAnY2hhbmdlJyBldmVudCBpcyByZXF1aXJlZCB0byB0cmlnZ2VyIHRpbnltY2UgdXBkYXRlc1xyXG4gICAgICAgICAgICAgICAgZXZ0LmluaXRFdmVudChcImNoYW5nZVwiLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZ0LmluaXRFdmVudChcImlucHV0XCIsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gdGhpcyBzZWVtcyBiYWNrd2FyZHMsIGJ1dCBmaXJlIHRoZSBldmVudCBmcm9tIHRoaXMgZWxlbWVudHMgbmF0aXZlRWxlbWVudCAobm90IHRoZVxyXG4gICAgICAgICAgICAgIC8vIG9uZSBwcm92aWRlZCB0aGF0IG1heSBiZSBpbiBhbiBpZnJhbWUsIGFzIGl0IHdvbid0IGJlIHByb3BvZ2F0ZSlcclxuICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRQb3MgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wU2VhcmNoKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtFWV9FU0NBUEUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BTZWFyY2goKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gS0VZX0RPV04pIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaExpc3QuYWN0aXZhdGVOZXh0SXRlbSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSBLRVlfVVApIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaExpc3QuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNoYXJQcmVzc2VkLmxlbmd0aCE9MSAmJiBldmVudC5rZXlDb2RlIT1LRVlfQkFDS1NQQUNFKSB7XHJcbiAgICAgICAgICB0aGlzLnN0b3BFdmVudChldmVudCk7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc2VhcmNoaW5nKSB7XHJcbiAgICAgICAgICBsZXQgbWVudGlvbiA9IHZhbC5zdWJzdHJpbmcodGhpcy5zdGFydFBvcyArIDEsIHBvcyk7XHJcbiAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gS0VZX0JBQ0tTUEFDRSAmJiAhZXZlbnQuaW5wdXRFdmVudCkge1xyXG4gICAgICAgICAgICBtZW50aW9uICs9IGNoYXJQcmVzc2VkO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWFyY2hTdHJpbmcgPSBtZW50aW9uO1xyXG4gICAgICAgICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnLnJldHVyblRyaWdnZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgdHJpZ2dlckNoYXIgPSAodGhpcy5zZWFyY2hTdHJpbmcgfHwgZXZlbnQua2V5Q29kZSA9PT0gS0VZX0JBQ0tTUEFDRSkgPyB2YWwuc3Vic3RyaW5nKHRoaXMuc3RhcnRQb3MsIHRoaXMuc3RhcnRQb3MgKyAxKSA6ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRlcm0uZW1pdCh0cmlnZ2VyQ2hhciArIHRoaXMuc2VhcmNoU3RyaW5nKTtcclxuICAgICAgICAgIH0gXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXJtLmVtaXQodGhpcy5zZWFyY2hTdHJpbmcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy51cGRhdGVTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBleHBvc2VkIGZvciBleHRlcm5hbCBjYWxscyB0byBvcGVuIHRoZSBtZW50aW9uIGxpc3QsIGUuZy4gYnkgY2xpY2tpbmcgYSBidXR0b25cclxuICBwdWJsaWMgc3RhcnRTZWFyY2godHJpZ2dlckNoYXI/OiBzdHJpbmcsIG5hdGl2ZUVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgIHRyaWdnZXJDaGFyID0gdHJpZ2dlckNoYXIgfHwgdGhpcy5tZW50aW9uQ29uZmlnLnRyaWdnZXJDaGFyIHx8IHRoaXMuREVGQVVMVF9DT05GSUcudHJpZ2dlckNoYXI7XHJcbiAgICBjb25zdCBwb3MgPSBnZXRDYXJldFBvc2l0aW9uKG5hdGl2ZUVsZW1lbnQsIHRoaXMuaWZyYW1lKTtcclxuICAgIGluc2VydFZhbHVlKG5hdGl2ZUVsZW1lbnQsIHBvcywgcG9zLCB0aGlzLmFjdGl2ZUNvbmZpZy5pbnNlcnRIVE1MLCB0cmlnZ2VyQ2hhciwgdGhpcy5pZnJhbWUpO1xyXG4gICAgdGhpcy5rZXlIYW5kbGVyKHsga2V5OiB0cmlnZ2VyQ2hhciwgaW5wdXRFdmVudDogdHJ1ZSB9LCBuYXRpdmVFbGVtZW50KTtcclxuICB9XHJcblxyXG4gIHN0b3BTZWFyY2goKSB7XHJcbiAgICBpZiAodGhpcy5zZWFyY2hMaXN0ICYmICF0aGlzLnNlYXJjaExpc3QuaGlkZGVuKSB7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdC5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICB0aGlzLmNsb3NlZC5lbWl0KCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZUNvbmZpZyA9IG51bGw7XHJcbiAgICB0aGlzLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlU2VhcmNoTGlzdCgpIHtcclxuICAgIGxldCBtYXRjaGVzOiBhbnlbXSA9IFtdO1xyXG4gICAgaWYgKHRoaXMuYWN0aXZlQ29uZmlnICYmIHRoaXMuYWN0aXZlQ29uZmlnLml0ZW1zKSB7XHJcbiAgICAgIGxldCBvYmplY3RzID0gdGhpcy5hY3RpdmVDb25maWcuaXRlbXM7XHJcbiAgICAgIC8vIGRpc2FibGluZyB0aGUgc2VhcmNoIHJlbGllcyBvbiB0aGUgYXN5bmMgb3BlcmF0aW9uIHRvIGRvIHRoZSBmaWx0ZXJpbmdcclxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZUNvbmZpZy5kaXNhYmxlU2VhcmNoICYmIHRoaXMuc2VhcmNoU3RyaW5nICYmIHRoaXMuYWN0aXZlQ29uZmlnLmxhYmVsS2V5KSB7XHJcbiAgICAgICAgbGV0IHNlYXJjaFN0cmluZ0xvd2VyQ2FzZSA9IHRoaXMuc2VhcmNoU3RyaW5nLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgb2JqZWN0cyA9IG9iamVjdHMuZmlsdGVyKGUgPT4gZVt0aGlzLmFjdGl2ZUNvbmZpZy5sYWJlbEtleV0udG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKHNlYXJjaFN0cmluZ0xvd2VyQ2FzZSkpO1xyXG4gICAgICB9XHJcbiAgICAgIG1hdGNoZXMgPSBvYmplY3RzO1xyXG4gICAgICBpZiAodGhpcy5hY3RpdmVDb25maWcubWF4SXRlbXMgPiAwKSB7XHJcbiAgICAgICAgbWF0Y2hlcyA9IG1hdGNoZXMuc2xpY2UoMCwgdGhpcy5hY3RpdmVDb25maWcubWF4SXRlbXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyB1cGRhdGUgdGhlIHNlYXJjaCBsaXN0XHJcbiAgICBpZiAodGhpcy5zZWFyY2hMaXN0KSB7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdC5pdGVtcyA9IG1hdGNoZXM7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdC5oaWRkZW4gPSBtYXRjaGVzLmxlbmd0aCA9PSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2hvd1NlYXJjaExpc3QobmF0aXZlRWxlbWVudDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgdGhpcy5vcGVuZWQuZW1pdCgpO1xyXG5cclxuICAgIGlmICh0aGlzLnNlYXJjaExpc3QgPT0gbnVsbCkge1xyXG4gICAgICBsZXQgY29tcG9uZW50RmFjdG9yeSA9IHRoaXMuX2NvbXBvbmVudFJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KE1lbnRpb25MaXN0Q29tcG9uZW50KTtcclxuICAgICAgbGV0IGNvbXBvbmVudFJlZiA9IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3RvcnkpO1xyXG4gICAgICB0aGlzLnNlYXJjaExpc3QgPSBjb21wb25lbnRSZWYuaW5zdGFuY2U7XHJcbiAgICAgIHRoaXMuc2VhcmNoTGlzdC5pdGVtVGVtcGxhdGUgPSB0aGlzLm1lbnRpb25MaXN0VGVtcGxhdGU7XHJcbiAgICAgIGNvbXBvbmVudFJlZi5pbnN0YW5jZVsnaXRlbUNsaWNrJ10uc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICBuYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgbGV0IGZha2VLZXlkb3duID0geyBrZXk6ICdFbnRlcicsIGtleUNvZGU6IEtFWV9FTlRFUiwgd2FzQ2xpY2s6IHRydWUgfTtcclxuICAgICAgICB0aGlzLmtleUhhbmRsZXIoZmFrZUtleWRvd24sIG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHRoaXMuc2VhcmNoTGlzdC5sYWJlbEtleSA9IHRoaXMuYWN0aXZlQ29uZmlnLmxhYmVsS2V5O1xyXG4gICAgdGhpcy5zZWFyY2hMaXN0LmRyb3BVcCA9IHRoaXMuYWN0aXZlQ29uZmlnLmRyb3BVcDtcclxuICAgIHRoaXMuc2VhcmNoTGlzdC5zdHlsZU9mZiA9IHRoaXMubWVudGlvbkNvbmZpZy5kaXNhYmxlU3R5bGU7XHJcbiAgICB0aGlzLnNlYXJjaExpc3QuYWN0aXZlSW5kZXggPSAwO1xyXG4gICAgdGhpcy5zZWFyY2hMaXN0LnBvc2l0aW9uKG5hdGl2ZUVsZW1lbnQsIHRoaXMuaWZyYW1lKTtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5zZWFyY2hMaXN0LnJlc2V0KCkpO1xyXG4gIH1cclxufVxyXG4iXX0=