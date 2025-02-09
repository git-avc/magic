
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

// Angular and system imports.
import {
  AfterViewInit,
  Component,
  Input,
  ViewChild,
} from '@angular/core';

// Application specific imports.
import { GeneralService } from 'src/app/_general/services/general.service';
import { Subscription } from 'rxjs';
import { VocabularyService } from 'src/app/_general/services/vocabulary.service';

/**
 * Model class for CodeMirror instance's Hyperlambda.
 */
export class Model {

  /**
   * Two way databound model for editor.
   */
  hyperlambda: string;

  /**
   * Options for editor.
   */
  options: any;

  /**
   * Actual CodeMirror instance, useful for determining selected text, etc.
   */
  editor?: any;
}

/**
 * CodeMirror Hyperlambda component for making it easy to edit Hyperlambda files with
 * syntax highlightning and auto complete.
 */
@Component({
  selector: 'app-codemirror-hyperlambda',
  templateUrl: './codemirror-hyperlambda.component.html'
})
export class HyperlambdaComponent implements AfterViewInit {

  // Actual CodeMirror instance, needed to retrieve selected text.
  @ViewChild('codeeditor') private _editor: { codeMirror: any; };

  /**
   * Model for component containing Hyperlambda that is displayed.
   */
  @Input() public model: Model;

  /**
   * If true, vocabulary has been loaded from server.
   */
  public vocabularyLoaded = false;

  /**
   * Creates an instance of your component.
   *
   * @param vocabularyService Evaluator service used to retrieve auto complete keywords (vocabulary)
   */
  constructor(
    private vocabularyService: VocabularyService,
    private generalService: GeneralService) {
  }

  /**
   * Implementation of AfterViewInit
   */
  public ngAfterViewInit() {

    // Retrieving server's vocabulary.
    if (window['_vocabulary']) {
      this.vocabularyLoaded = true;
      // Vocabulary already loaded, initializing editor immediately.
      this.init();

    } else {

      // Loading vocabulary from server before initializing editor.
      this.vocabularyService.vocabulary().subscribe({
        next: (vocabulary: string[]) => {
          this.vocabularyLoaded = true;
          // Publishing vocabulary such that autocomplete component can reach it.
          window['_vocabulary'] = vocabulary;
          this.init();

        },
        error: (error: any) => this.generalService.showFeedback(error.error.message??error, 'errorMessage')
      })
    }
  }

  /*
   * Private helper methods.
   */

  /*
   * Initializes editor.
   */
  private init() {
    (async () => {
      while (!(this._editor && this._editor.codeMirror && this.vocabularyLoaded && this.model.options))
        await new Promise(resolve => setTimeout(resolve, 100));

      if (this._editor && this._editor.codeMirror && this.vocabularyLoaded === true && this.model.options) {

        this.model.editor = this._editor.codeMirror;

        this.model.editor.doc.markClean();
        this.model.editor.doc.clearHistory(); // To avoid having initial loading of file becoming an "undo operation".
      }
    })();
  }
}
