import * as tslib_1 from "tslib";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MentionDirective } from './mention.directive';
import { MentionListComponent } from './mention-list.component';
var MentionModule = /** @class */ (function () {
    function MentionModule() {
    }
    MentionModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                MentionDirective,
                MentionListComponent
            ],
            imports: [
                CommonModule
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
export { MentionModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbi5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLW1lbnRpb25zLyIsInNvdXJjZXMiOlsibGliL21lbnRpb24ubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQWlCaEU7SUFBQTtJQUE2QixDQUFDO0lBQWpCLGFBQWE7UUFmekIsUUFBUSxDQUFDO1lBQ1IsWUFBWSxFQUFFO2dCQUNaLGdCQUFnQjtnQkFDaEIsb0JBQW9CO2FBQ3JCO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLFlBQVk7YUFDYjtZQUNELE9BQU8sRUFBRTtnQkFDUCxnQkFBZ0I7YUFDakI7WUFDRCxlQUFlLEVBQUU7Z0JBQ2Ysb0JBQW9CO2FBQ3JCO1NBQ0YsQ0FBQztPQUNXLGFBQWEsQ0FBSTtJQUFELG9CQUFDO0NBQUEsQUFBOUIsSUFBOEI7U0FBakIsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE1lbnRpb25EaXJlY3RpdmUgfSBmcm9tICcuL21lbnRpb24uZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgTWVudGlvbkxpc3RDb21wb25lbnQgfSBmcm9tICcuL21lbnRpb24tbGlzdC5jb21wb25lbnQnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtcclxuICAgIE1lbnRpb25EaXJlY3RpdmUsXHJcbiAgICBNZW50aW9uTGlzdENvbXBvbmVudFxyXG4gIF0sXHJcbiAgaW1wb3J0czogW1xyXG4gICAgQ29tbW9uTW9kdWxlXHJcbiAgXSxcclxuICBleHBvcnRzOiBbXHJcbiAgICBNZW50aW9uRGlyZWN0aXZlXHJcbiAgXSxcclxuICBlbnRyeUNvbXBvbmVudHM6IFtcclxuICAgIE1lbnRpb25MaXN0Q29tcG9uZW50XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWVudGlvbk1vZHVsZSB7IH1cclxuIl19