import { ElementRef, EventEmitter, TemplateRef, AfterContentChecked } from '@angular/core';
/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
export declare class MentionListComponent implements AfterContentChecked {
    private element;
    labelKey: string;
    itemTemplate: TemplateRef<any>;
    itemClick: EventEmitter<{}>;
    list: ElementRef;
    defaultItemTemplate: TemplateRef<any>;
    items: any[];
    activeIndex: number;
    hidden: boolean;
    dropUp: boolean;
    styleOff: boolean;
    private coords;
    private offset;
    constructor(element: ElementRef);
    ngAfterContentChecked(): void;
    position(nativeParentElement: HTMLInputElement, iframe?: HTMLIFrameElement): void;
    readonly activeItem: any;
    activateNextItem(): void;
    activatePreviousItem(): void;
    reset(): void;
    private checkBounds;
    private positionElement;
    private getBlockCursorDimensions;
}
