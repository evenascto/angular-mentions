import { Component, ElementRef, Output, EventEmitter, ViewChild, Input, TemplateRef } from '@angular/core';
import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
var _c0 = ["list"];
var _c1 = ["defaultItemTemplate"];
function MentionListComponent_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    var item_r4 = ctx.item;
    var ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", item_r4[ctx_r1.labelKey], " ");
} }
function MentionListComponent_li_4_ng_template_2_Template(rf, ctx) { }
var _c2 = function (a0) { return { "item": a0 }; };
function MentionListComponent_li_4_Template(rf, ctx) { if (rf & 1) {
    var _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵelementStart(1, "a", 4);
    i0.ɵɵlistener("mousedown", function MentionListComponent_li_4_Template_a_mousedown_1_listener($event) { i0.ɵɵrestoreView(_r9); var i_r6 = ctx.index; var ctx_r8 = i0.ɵɵnextContext(); ctx_r8.activeIndex = i_r6; ctx_r8.itemClick.emit(); return $event.preventDefault(); });
    i0.ɵɵtemplate(2, MentionListComponent_li_4_ng_template_2_Template, 0, 0, "ng-template", 5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    var item_r5 = ctx.$implicit;
    var i_r6 = ctx.index;
    var ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r3.activeIndex == i_r6)("mention-active", !ctx_r3.styleOff && ctx_r3.activeIndex == i_r6);
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("mention-item", !ctx_r3.styleOff);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngTemplateOutlet", ctx_r3.itemTemplate)("ngTemplateOutletContext", i0.ɵɵpureFunction1(8, _c2, item_r5));
} }
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
    MentionListComponent.ɵfac = function MentionListComponent_Factory(t) { return new (t || MentionListComponent)(i0.ɵɵdirectiveInject(i0.ElementRef)); };
    MentionListComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MentionListComponent, selectors: [["mention-list"]], viewQuery: function MentionListComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵstaticViewQuery(_c0, true);
            i0.ɵɵstaticViewQuery(_c1, true);
        } if (rf & 2) {
            var _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.list = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.defaultItemTemplate = _t.first);
        } }, inputs: { labelKey: "labelKey", itemTemplate: "itemTemplate" }, outputs: { itemClick: "itemClick" }, decls: 5, vars: 6, consts: [["defaultItemTemplate", ""], [1, "dropdown-menu", "scrollable-menu", 3, "hidden"], ["list", ""], [3, "active", "mention-active", 4, "ngFor", "ngForOf"], [1, "dropdown-item", 3, "mousedown"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"]], template: function MentionListComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵtemplate(0, MentionListComponent_ng_template_0_Template, 1, 1, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementStart(2, "ul", 1, 2);
            i0.ɵɵtemplate(4, MentionListComponent_li_4_Template, 3, 10, "li", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("mention-menu", !ctx.styleOff)("mention-dropdown", !ctx.styleOff && ctx.dropUp);
            i0.ɵɵproperty("hidden", ctx.hidden);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngForOf", ctx.items);
        } }, directives: [i1.NgForOf, i1.NgTemplateOutlet], styles: [".mention-menu[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:11em;padding:.5em 0;margin:.125em 0 0;font-size:1em;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25em}.mention-item[_ngcontent-%COMP%]{display:block;padding:.2em 1.5em;line-height:1.5em;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.mention-active[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}.scrollable-menu[_ngcontent-%COMP%]{display:block;height:auto;max-height:292px;overflow:auto}[hidden][_ngcontent-%COMP%]{display:none}.mention-dropdown[_ngcontent-%COMP%]{bottom:100%;top:auto;margin-bottom:2px}"] });
    return MentionListComponent;
}());
export { MentionListComponent };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MentionListComponent, [{
        type: Component,
        args: [{
                selector: 'mention-list',
                styleUrls: ['./mention-list.component.scss'],
                template: "\n    <ng-template #defaultItemTemplate let-item=\"item\">\n      {{item[labelKey]}}\n    </ng-template>\n    <ul #list [hidden]=\"hidden\" class=\"dropdown-menu scrollable-menu\"\n      [class.mention-menu]=\"!styleOff\" [class.mention-dropdown]=\"!styleOff && dropUp\">\n      <li *ngFor=\"let item of items; let i = index\"\n        [class.active]=\"activeIndex==i\" [class.mention-active]=\"!styleOff && activeIndex==i\">\n        <a class=\"dropdown-item\" [class.mention-item]=\"!styleOff\"\n          (mousedown)=\"activeIndex=i;itemClick.emit();$event.preventDefault()\">\n          <ng-template [ngTemplateOutlet]=\"itemTemplate\" [ngTemplateOutletContext]=\"{'item':item}\"></ng-template>\n        </a>\n      </li>\n    </ul>\n    "
            }]
    }], function () { return [{ type: i0.ElementRef }]; }, { labelKey: [{
            type: Input
        }], itemTemplate: [{
            type: Input
        }], itemClick: [{
            type: Output
        }], list: [{
            type: ViewChild,
            args: ['list', { static: true }]
        }], defaultItemTemplate: [{
            type: ViewChild,
            args: ['defaultItemTemplate', { static: true }]
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi1saXN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItbWVudGlvbnMvIiwic291cmNlcyI6WyJsaWIvbWVudGlvbi1saXN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUMzRSxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7O0lBYS9DLFlBQ0Y7Ozs7SUFERSx5REFDRjs7Ozs7O0lBR0UsMEJBRUU7SUFBQSw0QkFFRTtJQURBLGlOQUEyQix1QkFBZ0IsU0FBQyx1QkFBdUIsSUFBQztJQUNwRSwwRkFBeUY7SUFDM0YsaUJBQUk7SUFDTixpQkFBSzs7Ozs7SUFMSCxvREFBK0Isa0VBQUE7SUFDTixlQUFnQztJQUFoQyxnREFBZ0M7SUFFMUMsZUFBaUM7SUFBakMsc0RBQWlDLGdFQUFBOztBQW5CeEQ7Ozs7O0dBS0c7QUFDSDtJQWdDRSw4QkFBb0IsT0FBbUI7UUFBbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQVo5QixhQUFRLEdBQVcsT0FBTyxDQUFDO1FBRTFCLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBR3pDLFVBQUssR0FBRyxFQUFFLENBQUM7UUFDWCxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBQ3hCLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFDeEIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUNsQixXQUFNLEdBQThCLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFDLENBQUM7UUFDcEQsV0FBTSxH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LHNIQUNFO1lBRUYsZ0NBRUU7WUFBQSxvRUFFRTtZQUtKLGlCQUFLOztZQVJILGVBQWdDO1lBQWhDLDZDQUFnQyxpREFBQTtZQUR4QixtQ0FBaUI7WUFFckIsZUFBeUM7WUFBekMsbUNBQXlDOzsrQkF0Qm5EO0NBa0tDLEFBckpELElBcUpDO1NBbElZLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBbkJoQyxTQUFTO2VBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLFNBQVMsRUFBRSxDQUFDLCtCQUErQixDQUFDO2dCQUM1QyxRQUFRLEVBQUUsd3VCQWNQO2FBQ0o7O2tCQUVFLEtBQUs7O2tCQUNMLEtBQUs7O2tCQUNMLE1BQU07O2tCQUNOLFNBQVM7bUJBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTs7a0JBQ2xDLFNBQVM7bUJBQUMscUJBQXFCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBWaWV3Q2hpbGQsIElucHV0LCBUZW1wbGF0ZVJlZiwgQWZ0ZXJDb250ZW50Q2hlY2tlZFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50LCBnZXRDb250ZW50RWRpdGFibGVDYXJldENvb3JkcyB9IGZyb20gJy4vbWVudGlvbi11dGlscyc7XHJcbmltcG9ydCB7IGdldENhcmV0Q29vcmRpbmF0ZXMgfSBmcm9tICcuL2NhcmV0LWNvb3Jkcyc7XHJcblxyXG4vKipcclxuICogQW5ndWxhciBNZW50aW9ucy5cclxuICogaHR0cHM6Ly9naXRodWIuY29tL2RtYWNmYXJsYW5lL2FuZ3VsYXItbWVudGlvbnNcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE2IERhbiBNYWNGYXJsYW5lXHJcbiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ21lbnRpb24tbGlzdCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbWVudGlvbi1saXN0LmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgdGVtcGxhdGU6IGBcclxuICAgIDxuZy10ZW1wbGF0ZSAjZGVmYXVsdEl0ZW1UZW1wbGF0ZSBsZXQtaXRlbT1cIml0ZW1cIj5cclxuICAgICAge3tpdGVtW2xhYmVsS2V5XX19XHJcbiAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgPHVsICNsaXN0IFtoaWRkZW5dPVwiaGlkZGVuXCIgY2xhc3M9XCJkcm9wZG93bi1tZW51IHNjcm9sbGFibGUtbWVudVwiXHJcbiAgICAgIFtjbGFzcy5tZW50aW9uLW1lbnVdPVwiIXN0eWxlT2ZmXCIgW2NsYXNzLm1lbnRpb24tZHJvcGRvd25dPVwiIXN0eWxlT2ZmICYmIGRyb3BVcFwiPlxyXG4gICAgICA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXM7IGxldCBpID0gaW5kZXhcIlxyXG4gICAgICAgIFtjbGFzcy5hY3RpdmVdPVwiYWN0aXZlSW5kZXg9PWlcIiBbY2xhc3MubWVudGlvbi1hY3RpdmVdPVwiIXN0eWxlT2ZmICYmIGFjdGl2ZUluZGV4PT1pXCI+XHJcbiAgICAgICAgPGEgY2xhc3M9XCJkcm9wZG93bi1pdGVtXCIgW2NsYXNzLm1lbnRpb24taXRlbV09XCIhc3R5bGVPZmZcIlxyXG4gICAgICAgICAgKG1vdXNlZG93bik9XCJhY3RpdmVJbmRleD1pO2l0ZW1DbGljay5lbWl0KCk7JGV2ZW50LnByZXZlbnREZWZhdWx0KClcIj5cclxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJpdGVtVGVtcGxhdGVcIiBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwieydpdGVtJzppdGVtfVwiPjwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgPC9hPlxyXG4gICAgICA8L2xpPlxyXG4gICAgPC91bD5cclxuICAgIGBcclxufSlcclxuZXhwb3J0IGNsYXNzIE1lbnRpb25MaXN0Q29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50Q2hlY2tlZCB7XHJcbiAgQElucHV0KCkgbGFiZWxLZXk6IHN0cmluZyA9ICdsYWJlbCc7XHJcbiAgQElucHV0KCkgaXRlbVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG4gIEBPdXRwdXQoKSBpdGVtQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQFZpZXdDaGlsZCgnbGlzdCcsIHsgc3RhdGljOiB0cnVlIH0pIGxpc3Q6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgnZGVmYXVsdEl0ZW1UZW1wbGF0ZScsIHsgc3RhdGljOiB0cnVlIH0pIGRlZmF1bHRJdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcbiAgaXRlbXMgPSBbXTtcclxuICBhY3RpdmVJbmRleDogbnVtYmVyID0gMDtcclxuICBoaWRkZW46IGJvb2xlYW4gPSBmYWxzZTtcclxuICBkcm9wVXA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBzdHlsZU9mZjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgY29vcmRzOiB7dG9wOm51bWJlciwgbGVmdDpudW1iZXJ9ID0ge3RvcDowLCBsZWZ0OjB9O1xyXG4gIHByaXZhdGUgb2Zmc2V0OiBudW1iZXIgPSAwO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogRWxlbWVudFJlZikge31cclxuXHJcbiAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCkge1xyXG4gICAgaWYgKCF0aGlzLml0ZW1UZW1wbGF0ZSkge1xyXG4gICAgICB0aGlzLml0ZW1UZW1wbGF0ZSA9IHRoaXMuZGVmYXVsdEl0ZW1UZW1wbGF0ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGxvdHMgb2YgY29uZnVzaW9uIGhlcmUgYmV0d2VlbiByZWxhdGl2ZSBjb29yZGluYXRlcyBhbmQgY29udGFpbmVyc1xyXG4gIHBvc2l0aW9uKG5hdGl2ZVBhcmVudEVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQsIGlmcmFtZTogSFRNTElGcmFtZUVsZW1lbnQgPSBudWxsKSB7XHJcbiAgICBpZiAoaXNJbnB1dE9yVGV4dEFyZWFFbGVtZW50KG5hdGl2ZVBhcmVudEVsZW1lbnQpKSB7XHJcbiAgICAgIC8vIHBhcmVudCBlbGVtZW50cyBuZWVkIHRvIGhhdmUgcG9zdGl0aW9uOnJlbGF0aXZlIGZvciB0aGlzIHRvIHdvcmsgY29ycmVjdGx5P1xyXG4gICAgICB0aGlzLmNvb3JkcyA9IGdldENhcmV0Q29vcmRpbmF0ZXMobmF0aXZlUGFyZW50RWxlbWVudCwgbmF0aXZlUGFyZW50RWxlbWVudC5zZWxlY3Rpb25TdGFydCwgbnVsbCk7XHJcbiAgICAgIHRoaXMuY29vcmRzLnRvcCA9IG5hdGl2ZVBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgdGhpcy5jb29yZHMudG9wIC0gbmF0aXZlUGFyZW50RWxlbWVudC5zY3JvbGxUb3A7XHJcbiAgICAgIHRoaXMuY29vcmRzLmxlZnQgPSBuYXRpdmVQYXJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmNvb3Jkcy5sZWZ0IC0gbmF0aXZlUGFyZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xyXG4gICAgICAvLyBnZXRDcmV0Q29vcmRpbmF0ZXMoKSBmb3IgdGV4dC9pbnB1dCBlbGVtZW50cyBuZWVkcyBhbiBhZGRpdGlvbmFsIG9mZnNldCB0byBwb3NpdGlvbiB0aGUgbGlzdCBjb3JyZWN0bHlcclxuICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLmdldEJsb2NrQ3Vyc29yRGltZW5zaW9ucyhuYXRpdmVQYXJlbnRFbGVtZW50KS5oZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpZnJhbWUpIHtcclxuICAgICAgbGV0IGNvbnRleHQ6IHsgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCwgcGFyZW50OiBFbGVtZW50IH0gPSB7IGlmcmFtZTogaWZyYW1lLCBwYXJlbnQ6IGlmcmFtZS5vZmZzZXRQYXJlbnQgfTtcclxuICAgICAgdGhpcy5jb29yZHMgPSBnZXRDb250ZW50RWRpdGFibGVDYXJldENvb3Jkcyhjb250ZXh0KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBsZXQgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICBsZXQgc2Nyb2xsTGVmdCA9ICh3aW5kb3cucGFnZVhPZmZzZXQgfHwgZG9jLnNjcm9sbExlZnQpIC0gKGRvYy5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICBsZXQgc2Nyb2xsVG9wID0gKHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2Muc2Nyb2xsVG9wKSAtIChkb2MuY2xpZW50VG9wIHx8IDApO1xyXG4gICAgICAvLyBib3VuZGluZyByZWN0YW5nbGVzIGFyZSByZWxhdGl2ZSB0byB2aWV3LCBvZmZzZXRzIGFyZSByZWxhdGl2ZSB0byBjb250YWluZXI/XHJcbiAgICAgIGxldCBjYXJldFJlbGF0aXZlVG9WaWV3ID0gZ2V0Q29udGVudEVkaXRhYmxlQ2FyZXRDb29yZHMoeyBpZnJhbWU6IGlmcmFtZSB9KTtcclxuICAgICAgbGV0IHBhcmVudFJlbGF0aXZlVG9Db250YWluZXI6IENsaWVudFJlY3QgPSBuYXRpdmVQYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICB0aGlzLmNvb3Jkcy50b3AgPSBjYXJldFJlbGF0aXZlVG9WaWV3LnRvcCAtIHBhcmVudFJlbGF0aXZlVG9Db250YWluZXIudG9wICsgbmF0aXZlUGFyZW50RWxlbWVudC5vZmZzZXRUb3AgLSBzY3JvbGxUb3A7XHJcbiAgICAgIHRoaXMuY29vcmRzLmxlZnQgPSBjYXJldFJlbGF0aXZlVG9WaWV3LmxlZnQgLSBwYXJlbnRSZWxhdGl2ZVRvQ29udGFpbmVyLmxlZnQgKyBuYXRpdmVQYXJlbnRFbGVtZW50Lm9mZnNldExlZnQgLSBzY3JvbGxMZWZ0O1xyXG4gICAgfVxyXG4gICAgLy8gc2V0IHRoZSBkZWZhdWx0L2luaXRhbCBwb3NpdGlvblxyXG4gICAgdGhpcy5wb3NpdGlvbkVsZW1lbnQoKTtcclxuICB9XHJcblxyXG4gIGdldCBhY3RpdmVJdGVtKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXRlbXNbdGhpcy5hY3RpdmVJbmRleF07XHJcbiAgfVxyXG5cclxuICBhY3RpdmF0ZU5leHRJdGVtKCkge1xyXG4gICAgLy8gYWRqdXN0IHNjcm9sbGFibGUtbWVudSBvZmZzZXQgaWYgdGhlIG5leHQgaXRlbSBpcyBvdXQgb2Ygdmlld1xyXG4gICAgbGV0IGxpc3RFbDogSFRNTEVsZW1lbnQgPSB0aGlzLmxpc3QubmF0aXZlRWxlbWVudDtcclxuICAgIGxldCBhY3RpdmVFbCA9IGxpc3RFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKS5pdGVtKDApO1xyXG4gICAgaWYgKGFjdGl2ZUVsKSB7XHJcbiAgICAgIGxldCBuZXh0TGlFbDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+IGFjdGl2ZUVsLm5leHRTaWJsaW5nO1xyXG4gICAgICBpZiAobmV4dExpRWwgJiYgbmV4dExpRWwubm9kZU5hbWUgPT0gXCJMSVwiKSB7XHJcbiAgICAgICAgbGV0IG5leHRMaVJlY3Q6IENsaWVudFJlY3QgPSBuZXh0TGlFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBpZiAobmV4dExpUmVjdC5ib3R0b20gPiBsaXN0RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tKSB7XHJcbiAgICAgICAgICBsaXN0RWwuc2Nyb2xsVG9wID0gbmV4dExpRWwub2Zmc2V0VG9wICsgbmV4dExpUmVjdC5oZWlnaHQgLSBsaXN0RWwuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gc2VsZWN0IHRoZSBuZXh0IGl0ZW1cclxuICAgIHRoaXMuYWN0aXZlSW5kZXggPSBNYXRoLm1heChNYXRoLm1pbih0aGlzLmFjdGl2ZUluZGV4ICsgMSwgdGhpcy5pdGVtcy5sZW5ndGggLSAxKSwgMCk7XHJcbiAgfVxyXG5cclxuICBhY3RpdmF0ZVByZXZpb3VzSXRlbSgpIHtcclxuICAgIC8vIGFkanVzdCB0aGUgc2Nyb2xsYWJsZS1tZW51IG9mZnNldCBpZiB0aGUgcHJldmlvdXMgaXRlbSBpcyBvdXQgb2Ygdmlld1xyXG4gICAgbGV0IGxpc3RFbDogSFRNTEVsZW1lbnQgPSB0aGlzLmxpc3QubmF0aXZlRWxlbWVudDtcclxuICAgIGxldCBhY3RpdmVFbCA9IGxpc3RFbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhY3RpdmUnKS5pdGVtKDApO1xyXG4gICAgaWYgKGFjdGl2ZUVsKSB7XHJcbiAgICAgIGxldCBwcmV2TGlFbDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+IGFjdGl2ZUVsLnByZXZpb3VzU2libGluZztcclxuICAgICAgaWYgKHByZXZMaUVsICYmIHByZXZMaUVsLm5vZGVOYW1lID09IFwiTElcIikge1xyXG4gICAgICAgIGxldCBwcmV2TGlSZWN0OiBDbGllbnRSZWN0ID0gcHJldkxpRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgaWYgKHByZXZMaVJlY3QudG9wIDwgbGlzdEVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCkge1xyXG4gICAgICAgICAgbGlzdEVsLnNjcm9sbFRvcCA9IHByZXZMaUVsLm9mZnNldFRvcDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHNlbGVjdCB0aGUgcHJldmlvdXMgaXRlbVxyXG4gICAgdGhpcy5hY3RpdmVJbmRleCA9IE1hdGgubWF4KE1hdGgubWluKHRoaXMuYWN0aXZlSW5kZXggLSAxLCB0aGlzLml0ZW1zLmxlbmd0aCAtIDEpLCAwKTtcclxuICB9XHJcblxyXG4gIC8vIHJlc2V0IGZvciBhIG5ldyBtZW50aW9uIHNlYXJjaFxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5saXN0Lm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID0gMDtcclxuICAgIHRoaXMuY2hlY2tCb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8vIGZpbmFsIHBvc2l0aW9uaW5nIGlzIGRvbmUgYWZ0ZXIgdGhlIGxpc3QgaXMgc2hvd24gKGFuZCB0aGUgaGVpZ2h0IGFuZCB3aWR0aCBhcmUga25vd24pXHJcbiAgLy8gZW5zdXJlIGl0J3MgaW4gdGhlIHBhZ2UgYm91bmRzXHJcbiAgcHJpdmF0ZSBjaGVja0JvdW5kcygpIHtcclxuICAgIGxldCBsZWZ0ID0gdGhpcy5jb29yZHMubGVmdCwgdG9wID0gdGhpcy5jb29yZHMudG9wLCBkcm9wVXAgPSB0aGlzLmRyb3BVcDtcclxuICAgIGNvbnN0IGJvdW5kczogQ2xpZW50UmVjdCA9IHRoaXMubGlzdC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgLy8gaWYgb2ZmIHJpZ2h0IG9mIHBhZ2UsIGFsaWduIHJpZ2h0XHJcbiAgICBpZiAoYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICBsZWZ0IC09IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoIC0gd2luZG93LmlubmVyV2lkdGggKyAxMDtcclxuICAgIH1cclxuICAgIC8vIGlmIG1vcmUgdGhhbiBoYWxmIG9mZiB0aGUgYm90dG9tIG9mIHRoZSBwYWdlLCBmb3JjZSBkcm9wVXBcclxuICAgIC8vIGlmICgoYm91bmRzLnRvcCtib3VuZHMuaGVpZ2h0LzIpPndpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgLy8gICBkcm9wVXAgPSB0cnVlO1xyXG4gICAgLy8gfVxyXG4gICAgLy8gaWYgdG9wIGlzIG9mZiBwYWdlLCBkaXNhYmxlIGRyb3BVcFxyXG4gICAgaWYgKGJvdW5kcy50b3A8MCkge1xyXG4gICAgICBkcm9wVXAgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIHNldCB0aGUgcmV2aXNlZC9maW5hbCBwb3NpdGlvblxyXG4gICAgdGhpcy5wb3NpdGlvbkVsZW1lbnQobGVmdCwgdG9wLCBkcm9wVXApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwb3NpdGlvbkVsZW1lbnQobGVmdDpudW1iZXI9dGhpcy5jb29yZHMubGVmdCwgdG9wOm51bWJlcj10aGlzLmNvb3Jkcy50b3AsIGRyb3BVcDpib29sZWFuPXRoaXMuZHJvcFVwKSB7XHJcbiAgICBjb25zdCBlbDogSFRNTEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcclxuICAgIHRvcCArPSBkcm9wVXAgPyAwIDogdGhpcy5vZmZzZXQ7IC8vIHRvcCBvZiBsaXN0IGlzIG5leHQgbGluZVxyXG4gICAgZWwuY2xhc3NOYW1lID0gZHJvcFVwID8gJ2Ryb3B1cCcgOiBudWxsO1xyXG4gICAgZWwuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XHJcbiAgICBlbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XHJcbiAgICBlbC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRCbG9ja0N1cnNvckRpbWVuc2lvbnMobmF0aXZlUGFyZW50RWxlbWVudDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgY29uc3QgcGFyZW50U3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobmF0aXZlUGFyZW50RWxlbWVudCk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBoZWlnaHQ6IHBhcnNlRmxvYXQocGFyZW50U3R5bGVzLmxpbmVIZWlnaHQpLFxyXG4gICAgICB3aWR0aDogcGFyc2VGbG9hdChwYXJlbnRTdHlsZXMuZm9udFNpemUpXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=