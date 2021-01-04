import * as tslib_1 from "tslib";
import { Component, ElementRef, Output, EventEmitter, ViewChild, Input, TemplateRef, AfterContentChecked } from '@angular/core';
import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';
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
        this.itemClick = new EventEmitter();
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
        { type: ElementRef }
    ]; };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], MentionListComponent.prototype, "labelKey", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", TemplateRef)
    ], MentionListComponent.prototype, "itemTemplate", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], MentionListComponent.prototype, "itemClick", void 0);
    tslib_1.__decorate([
        ViewChild('list', { static: true }),
        tslib_1.__metadata("design:type", ElementRef)
    ], MentionListComponent.prototype, "list", void 0);
    tslib_1.__decorate([
        ViewChild('defaultItemTemplate', { static: true }),
        tslib_1.__metadata("design:type", TemplateRef)
    ], MentionListComponent.prototype, "defaultItemTemplate", void 0);
    MentionListComponent = tslib_1.__decorate([
        Component({
            selector: 'mention-list',
            template: "\n    <ng-template #defaultItemTemplate let-item=\"item\">\n      {{item[labelKey]}}\n    </ng-template>\n    <ul #list [hidden]=\"hidden\" class=\"dropdown-menu scrollable-menu\"\n      [class.mention-menu]=\"!styleOff\" [class.mention-dropdown]=\"!styleOff && dropUp\">\n      <li *ngFor=\"let item of items; let i = index\"\n        [class.active]=\"activeIndex==i\" [class.mention-active]=\"!styleOff && activeIndex==i\">\n        <a class=\"dropdown-item\" [class.mention-item]=\"!styleOff\"\n          (mousedown)=\"activeIndex=i;itemClick.emit();$event.preventDefault()\">\n          <ng-template [ngTemplateOutlet]=\"itemTemplate\" [ngTemplateOutletContext]=\"{'item':item}\"></ng-template>\n        </a>\n      </li>\n    </ul>\n    ",
            styles: [".mention-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active>a{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu{display:block;height:auto;max-height:292px;overflow:auto}[hidden]{display:none}.mention-dropdown{bottom:100%;top:auto;margin-bottom:2px}"]
        }),
        tslib_1.__metadata("design:paramtypes", [ElementRef])
    ], MentionListComponent);
    return MentionListComponent;
}());
export { MentionListComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi1saXN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItbWVudGlvbnMvIiwic291cmNlcyI6WyJsaWIvbWVudGlvbi1saXN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFDaEcsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLHdCQUF3QixFQUFFLDZCQUE2QixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDMUYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFckQ7Ozs7O0dBS0c7QUFvQkg7SUFhRSw4QkFBb0IsT0FBbUI7UUFBbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQVo5QixhQUFRLEdBQVcsT0FBTyxDQUFDO1FBRTFCLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBR3pDLFVBQUssR0FBRyxFQUFFLENBQUM7UUFDWCxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBQ3hCLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUNsQixXQUFNLEdBQThCLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFDLENBQUM7UUFDcEQsV0FBTSxHQUFXLENBQUMsQ0FBQztJQUNlLENBQUM7SUFFM0Msb0RBQXFCLEdBQXJCO1FBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLHVDQUFRLEdBQVIsVUFBUyxtQkFBcUMsRUFBRSxNQUFnQztR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RSxJQUFJLEVBQUUsQ0FBQzswQ0FBc0IsV0FBVztxRUFBTTtJQUwvRSxvQkFBb0I7UUFuQmhDLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxjQUFjO1lBRXhCLFFBQVEsRUFBRSx3dUJBY1A7O1NBQ0osQ0FBQztpREFjNkIsVUFBVTtPQWI1QixvQkFBb0IsQ0FrSWhDO0lBQUQsMkJBQUM7Q0FBQSxBQWxJRCxJQWtJQztTQWxJWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENvbXBvbmVudCwgRWxlbWVudFJlZiwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdDaGlsZCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBBZnRlckNvbnRlbnRDaGVja2VkXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQsIGdldENvbnRlbnRFZGl0YWJsZUNhcmV0Q29vcmRzIH0gZnJvbSAnLi9tZW50aW9uLXV0aWxzJztcclxuaW1wb3J0IHsgZ2V0Q2FyZXRDb29yZGluYXRlcyB9IGZyb20gJy4vY2FyZXQtY29vcmRzJztcclxuXHJcbi8qKlxyXG4gKiBBbmd1bGFyIE1lbnRpb25zLlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZG1hY2ZhcmxhbmUvYW5ndWxhci1tZW50aW9uc1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgRGFuIE1hY0ZhcmxhbmVcclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbWVudGlvbi1saXN0JyxcclxuICBzdHlsZVVybHM6IFsnLi9tZW50aW9uLWxpc3QuY29tcG9uZW50LnNjc3MnXSxcclxuICB0ZW1wbGF0ZTogYFxyXG4gICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0SXRlbVRlbXBsYXRlIGxldC1pdGVtPVwiaXRlbVwiPlxyXG4gICAgICB7e2l0ZW1bbGFiZWxLZXldfX1cclxuICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICA8dWwgI2xpc3QgW2hpZGRlbl09XCJoaWRkZW5cIiBjbGFzcz1cImRyb3Bkb3duLW1lbnUgc2Nyb2xsYWJsZS1tZW51XCJcclxuICAgICAgW2NsYXNzLm1lbnRpb24tbWVudV09XCIhc3R5bGVPZmZcIiBbY2xhc3MubWVudGlvbi1kcm9wZG93bl09XCIhc3R5bGVPZmYgJiYgZHJvcFVwXCI+XHJcbiAgICAgIDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgbGV0IGkgPSBpbmRleFwiXHJcbiAgICAgICAgW2NsYXNzLmFjdGl2ZV09XCJhY3RpdmVJbmRleD09aVwiIFtjbGFzcy5tZW50aW9uLWFjdGl2ZV09XCIhc3R5bGVPZmYgJiYgYWN0aXZlSW5kZXg9PWlcIj5cclxuICAgICAgICA8YSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIiBbY2xhc3MubWVudGlvbi1pdGVtXT1cIiFzdHlsZU9mZlwiXHJcbiAgICAgICAgICAobW91c2Vkb3duKT1cImFjdGl2ZUluZGV4PWk7aXRlbUNsaWNrLmVtaXQoKTskZXZlbnQucHJldmVudERlZmF1bHQoKVwiPlxyXG4gICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIml0ZW1UZW1wbGF0ZVwiIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7J2l0ZW0nOml0ZW19XCI+PC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICA8L2E+XHJcbiAgICAgIDwvbGk+XHJcbiAgICA8L3VsPlxyXG4gICAgYFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWVudGlvbkxpc3RDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRDaGVja2VkIHtcclxuICBASW5wdXQoKSBsYWJlbEtleTogc3RyaW5nID0gJ2xhYmVsJztcclxuICBASW5wdXQoKSBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcbiAgQE91dHB1dCgpIGl0ZW1DbGljayA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBAVmlld0NoaWxkKCdsaXN0JywgeyBzdGF0aWM6IHRydWUgfSkgbGlzdDogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdkZWZhdWx0SXRlbVRlbXBsYXRlJywgeyBzdGF0aWM6IHRydWUgfSkgZGVmYXVsdEl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuICBpdGVtcyA9IFtdO1xyXG4gIGFjdGl2ZUluZGV4OiBudW1iZXIgPSAwO1xyXG4gIGhpZGRlbjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIGRyb3BVcDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHN0eWxlT2ZmOiBib29sZWFuID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBjb29yZHM6IHt0b3A6bnVtYmVyLCBsZWZ0Om51bWJlcn0gPSB7dG9wOjAsIGxlZnQ6MH07XHJcbiAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlciA9IDA7XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50UmVmKSB7fVxyXG5cclxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXRlbVRlbXBsYXRlKSB7XHJcbiAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gdGhpcy5kZWZhdWx0SXRlbVRlbXBsYXRlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gbG90cyBvZiBjb25mdXNpb24gaGVyZSBiZXR3ZWVuIHJlbGF0aXZlIGNvb3JkaW5hdGVzIGFuZCBjb250YWluZXJzXHJcbiAgcG9zaXRpb24obmF0aXZlUGFyZW50RWxlbWVudDogSFRNTElucHV0RWxlbWVudCwgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCA9IG51bGwpIHtcclxuICAgIGlmIChpc0lucHV0T3JUZXh0QXJlYUVsZW1lbnQobmF0aXZlUGFyZW50RWxlbWVudCkpIHtcclxuICAgICAgLy8gcGFyZW50IGVsZW1lbnRzIG5lZWQgdG8gaGF2ZSBwb3N0aXRpb246cmVsYXRpdmUgZm9yIHRoaXMgdG8gd29yayBjb3JyZWN0bHk/XHJcbiAgICAgIHRoaXMuY29vcmRzID0gZ2V0Q2FyZXRDb29yZGluYXRlcyhuYXRpdmVQYXJlbnRFbGVtZW50LCBuYXRpdmVQYXJlbnRFbGVtZW50LnNlbGVjdGlvblN0YXJ0LCBudWxsKTtcclxuICAgICAgdGhpcy5jb29yZHMudG9wID0gbmF0aXZlUGFyZW50RWxlbWVudC5vZmZzZXRUb3AgKyB0aGlzLmNvb3Jkcy50b3AgLSBuYXRpdmVQYXJlbnRFbGVtZW50LnNjcm9sbFRvcDtcclxuICAgICAgdGhpcy5jb29yZHMubGVmdCA9IG5hdGl2ZVBhcmVudEVsZW1lbnQub2Zmc2V0TGVmdCArIHRoaXMuY29vcmRzLmxlZnQgLSBuYXRpdmVQYXJlbnRFbGVtZW50LnNjcm9sbExlZnQ7XHJcbiAgICAgIC8vIGdldENyZXRDb29yZGluYXRlcygpIGZvciB0ZXh0L2lucHV0IGVsZW1lbnRzIG5lZWRzIGFuIGFkZGl0aW9uYWwgb2Zmc2V0IHRvIHBvc2l0aW9uIHRoZSBsaXN0IGNvcnJlY3RseVxyXG4gICAgICB0aGlzLm9mZnNldCA9IHRoaXMuZ2V0QmxvY2tDdXJzb3JEaW1lbnNpb25zKG5hdGl2ZVBhcmVudEVsZW1lbnQpLmhlaWdodDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlmcmFtZSkge1xyXG4gICAgICBsZXQgY29udGV4dDogeyBpZnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50LCBwYXJlbnQ6IEVsZW1lbnQgfSA9IHsgaWZyYW1lOiBpZnJhbWUsIHBhcmVudDogaWZyYW1lLm9mZnNldFBhcmVudCB9O1xyXG4gICAgICB0aGlzLmNvb3JkcyA9IGdldENvbnRlbnRFZGl0YWJsZUNhcmV0Q29vcmRzKGNvbnRleHQpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGxldCBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgIGxldCBzY3JvbGxMZWZ0ID0gKHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2Muc2Nyb2xsTGVmdCkgLSAoZG9jLmNsaWVudExlZnQgfHwgMCk7XHJcbiAgICAgIGxldCBzY3JvbGxUb3AgPSAod2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvYy5zY3JvbGxUb3ApIC0gKGRvYy5jbGllbnRUb3AgfHwgMCk7XHJcbiAgICAgIC8vIGJvdW5kaW5nIHJlY3RhbmdsZXMgYXJlIHJlbGF0aXZlIHRvIHZpZXcsIG9mZnNldHMgYXJlIHJlbGF0aXZlIHRvIGNvbnRhaW5lcj9cclxuICAgICAgbGV0IGNhcmV0UmVsYXRpdmVUb1ZpZXcgPSBnZXRDb250ZW50RWRpdGFibGVDYXJldENvb3Jkcyh7IGlmcmFtZTogaWZyYW1lIH0pO1xyXG4gICAgICBsZXQgcGFyZW50UmVsYXRpdmVUb0NvbnRhaW5lcjogQ2xpZW50UmVjdCA9IG5hdGl2ZVBhcmVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgIHRoaXMuY29vcmRzLnRvcCA9IGNhcmV0UmVsYXRpdmVUb1ZpZXcudG9wIC0gcGFyZW50UmVsYXRpdmVUb0NvbnRhaW5lci50b3AgKyBuYXRpdmVQYXJlbnRFbGVtZW50Lm9mZnNldFRvcCAtIHNjcm9sbFRvcDtcclxuICAgICAgdGhpcy5jb29yZHMubGVmdCA9IGNhcmV0UmVsYXRpdmVUb1ZpZXcubGVmdCAtIHBhcmVudFJlbGF0aXZlVG9Db250YWluZXIubGVmdCArIG5hdGl2ZVBhcmVudEVsZW1lbnQub2Zmc2V0TGVmdCAtIHNjcm9sbExlZnQ7XHJcbiAgICB9XHJcbiAgICAvLyBzZXQgdGhlIGRlZmF1bHQvaW5pdGFsIHBvc2l0aW9uXHJcbiAgICB0aGlzLnBvc2l0aW9uRWxlbWVudCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGFjdGl2ZUl0ZW0oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pdGVtc1t0aGlzLmFjdGl2ZUluZGV4XTtcclxuICB9XHJcblxyXG4gIGFjdGl2YXRlTmV4dEl0ZW0oKSB7XHJcbiAgICAvLyBhZGp1c3Qgc2Nyb2xsYWJsZS1tZW51IG9mZnNldCBpZiB0aGUgbmV4dCBpdGVtIGlzIG91dCBvZiB2aWV3XHJcbiAgICBsZXQgbGlzdEVsOiBIVE1MRWxlbWVudCA9IHRoaXMubGlzdC5uYXRpdmVFbGVtZW50O1xyXG4gICAgbGV0IGFjdGl2ZUVsID0gbGlzdEVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLml0ZW0oMCk7XHJcbiAgICBpZiAoYWN0aXZlRWwpIHtcclxuICAgICAgbGV0IG5leHRMaUVsOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD4gYWN0aXZlRWwubmV4dFNpYmxpbmc7XHJcbiAgICAgIGlmIChuZXh0TGlFbCAmJiBuZXh0TGlFbC5ub2RlTmFtZSA9PSBcIkxJXCIpIHtcclxuICAgICAgICBsZXQgbmV4dExpUmVjdDogQ2xpZW50UmVjdCA9IG5leHRMaUVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGlmIChuZXh0TGlSZWN0LmJvdHRvbSA+IGxpc3RFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20pIHtcclxuICAgICAgICAgIGxpc3RFbC5zY3JvbGxUb3AgPSBuZXh0TGlFbC5vZmZzZXRUb3AgKyBuZXh0TGlSZWN0LmhlaWdodCAtIGxpc3RFbC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBzZWxlY3QgdGhlIG5leHQgaXRlbVxyXG4gICAgdGhpcy5hY3RpdmVJbmRleCA9IE1hdGgubWF4KE1hdGgubWluKHRoaXMuYWN0aXZlSW5kZXggKyAxLCB0aGlzLml0ZW1zLmxlbmd0aCAtIDEpLCAwKTtcclxuICB9XHJcblxyXG4gIGFjdGl2YXRlUHJldmlvdXNJdGVtKCkge1xyXG4gICAgLy8gYWRqdXN0IHRoZSBzY3JvbGxhYmxlLW1lbnUgb2Zmc2V0IGlmIHRoZSBwcmV2aW91cyBpdGVtIGlzIG91dCBvZiB2aWV3XHJcbiAgICBsZXQgbGlzdEVsOiBIVE1MRWxlbWVudCA9IHRoaXMubGlzdC5uYXRpdmVFbGVtZW50O1xyXG4gICAgbGV0IGFjdGl2ZUVsID0gbGlzdEVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2FjdGl2ZScpLml0ZW0oMCk7XHJcbiAgICBpZiAoYWN0aXZlRWwpIHtcclxuICAgICAgbGV0IHByZXZMaUVsOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD4gYWN0aXZlRWwucHJldmlvdXNTaWJsaW5nO1xyXG4gICAgICBpZiAocHJldkxpRWwgJiYgcHJldkxpRWwubm9kZU5hbWUgPT0gXCJMSVwiKSB7XHJcbiAgICAgICAgbGV0IHByZXZMaVJlY3Q6IENsaWVudFJlY3QgPSBwcmV2TGlFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBpZiAocHJldkxpUmVjdC50b3AgPCBsaXN0RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wKSB7XHJcbiAgICAgICAgICBsaXN0RWwuc2Nyb2xsVG9wID0gcHJldkxpRWwub2Zmc2V0VG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gc2VsZWN0IHRoZSBwcmV2aW91cyBpdGVtXHJcbiAgICB0aGlzLmFjdGl2ZUluZGV4ID0gTWF0aC5tYXgoTWF0aC5taW4odGhpcy5hY3RpdmVJbmRleCAtIDEsIHRoaXMuaXRlbXMubGVuZ3RoIC0gMSksIDApO1xyXG4gIH1cclxuXHJcbiAgLy8gcmVzZXQgZm9yIGEgbmV3IG1lbnRpb24gc2VhcmNoXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmxpc3QubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xyXG4gICAgdGhpcy5jaGVja0JvdW5kcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gZmluYWwgcG9zaXRpb25pbmcgaXMgZG9uZSBhZnRlciB0aGUgbGlzdCBpcyBzaG93biAoYW5kIHRoZSBoZWlnaHQgYW5kIHdpZHRoIGFyZSBrbm93bilcclxuICAvLyBlbnN1cmUgaXQncyBpbiB0aGUgcGFnZSBib3VuZHNcclxuICBwcml2YXRlIGNoZWNrQm91bmRzKCkge1xyXG4gICAgbGV0IGxlZnQgPSB0aGlzLmNvb3Jkcy5sZWZ0LCB0b3AgPSB0aGlzLmNvb3Jkcy50b3AsIGRyb3BVcCA9IHRoaXMuZHJvcFVwO1xyXG4gICAgY29uc3QgYm91bmRzOiBDbGllbnRSZWN0ID0gdGhpcy5saXN0Lm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAvLyBpZiBvZmYgcmlnaHQgb2YgcGFnZSwgYWxpZ24gcmlnaHRcclxuICAgIGlmIChib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XHJcbiAgICAgIGxlZnQgLT0gYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGggLSB3aW5kb3cuaW5uZXJXaWR0aCArIDEwO1xyXG4gICAgfVxyXG4gICAgLy8gaWYgbW9yZSB0aGFuIGhhbGYgb2ZmIHRoZSBib3R0b20gb2YgdGhlIHBhZ2UsIGZvcmNlIGRyb3BVcFxyXG4gICAgLy8gaWYgKChib3VuZHMudG9wK2JvdW5kcy5oZWlnaHQvMik+d2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAvLyAgIGRyb3BVcCA9IHRydWU7XHJcbiAgICAvLyB9XHJcbiAgICAvLyBpZiB0b3AgaXMgb2ZmIHBhZ2UsIGRpc2FibGUgZHJvcFVwXHJcbiAgICBpZiAoYm91bmRzLnRvcDwwKSB7XHJcbiAgICAgIGRyb3BVcCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgLy8gc2V0IHRoZSByZXZpc2VkL2ZpbmFsIHBvc2l0aW9uXHJcbiAgICB0aGlzLnBvc2l0aW9uRWxlbWVudChsZWZ0LCB0b3AsIGRyb3BVcCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBvc2l0aW9uRWxlbWVudChsZWZ0Om51bWJlcj10aGlzLmNvb3Jkcy5sZWZ0LCB0b3A6bnVtYmVyPXRoaXMuY29vcmRzLnRvcCwgZHJvcFVwOmJvb2xlYW49dGhpcy5kcm9wVXApIHtcclxuICAgIGNvbnN0IGVsOiBIVE1MRWxlbWVudCA9IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50O1xyXG4gICAgdG9wICs9IGRyb3BVcCA/IDAgOiB0aGlzLm9mZnNldDsgLy8gdG9wIG9mIGxpc3QgaXMgbmV4dCBsaW5lXHJcbiAgICBlbC5jbGFzc05hbWUgPSBkcm9wVXAgPyAnZHJvcHVwJyA6IG51bGw7XHJcbiAgICBlbC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcclxuICAgIGVsLnN0eWxlLmxlZnQgPSBsZWZ0ICsgJ3B4JztcclxuICAgIGVsLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEJsb2NrQ3Vyc29yRGltZW5zaW9ucyhuYXRpdmVQYXJlbnRFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICBjb25zdCBwYXJlbnRTdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShuYXRpdmVQYXJlbnRFbGVtZW50KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGhlaWdodDogcGFyc2VGbG9hdChwYXJlbnRTdHlsZXMubGluZUhlaWdodCksXHJcbiAgICAgIHdpZHRoOiBwYXJzZUZsb2F0KHBhcmVudFN0eWxlcy5mb250U2l6ZSlcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==