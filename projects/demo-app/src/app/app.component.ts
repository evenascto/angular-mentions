import { Component } from '@angular/core';
import { Editor } from 'primeng/editor';
//import {  Quill } from 'quill'
import * as Quill from 'quill';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { COMMON_NAMES } from './common-names';

/**
 * Demo app showing usage of the mentions directive.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  //items: string[] = COMMON_NAMES;
  public Editor = ClassicEditor;
  text: string;
  items: any = [
    {
      id: 108,
      name: "Pedro Almeida",
      img: "444"
    },
    {
      id: 299,
      name: "Jose da Silva",
      img: "445"
    }
  ];

  ngOnInit() {
    var Block  = Quill.import('blots/block');
    //Block.tagName = 'DIV';
    Block.tagName = 'TS';
    Quill.register(Block, true);
  }
  /**
   * Note: There is no way to add a trailing space after this span.
   * There will be useability consequences.
   */
  public insertSpanElement(item) {
    let el = document.createElement("span");
    el.contentEditable = "false";
    el.className = "mention";
    el.innerText = `${item.name}`;
    return el;
  }

  /**
   * Note the trailig &nbsp;.
   * It helps with useability.
   */
  public insertSpanText(item) {
    return `<span mentionElementId="${item.id}"
    class="mention-selected" style="color:red;"
      contenteditable="false"
      >${item.name}</span>&nbsp;`;
  }

  test = this.getPath();
  private getPath() {
    // the path provides direct access to the tests for e2e testing
    switch (window.location.pathname) {
      case '/config'   : return 'config';
      case '/events'   : return 'events';
      case '/async'    : return 'async';
      case '/options'  : return 'options';
      case '/templates': return 'templates';
      case '/pos'      : return 'pos';
      default          : return null;
    }
  }
}

