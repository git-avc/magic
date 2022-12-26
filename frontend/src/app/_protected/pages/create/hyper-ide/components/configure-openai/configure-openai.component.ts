
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Response } from 'src/app/models/response.model';
import { GeneralService } from 'src/app/_general/services/general.service';
import { OpenAIService } from 'src/app/_general/services/openai.service';

/**
 * OpenAI configuration modal dialog.
 */
@Component({
  selector: 'app-configure-openai',
  templateUrl: './configure-openai.component.html',
  styleUrls: ['./configure-openai.component.scss']
})
export class ConfigureOpenaiComponent implements OnInit {

  openApiKey: string = '';
  startTraining: boolean = true;
  type: string = 'password';
  models: string[] = [];
  selectedModel: string = '';

  constructor(
    private dialogRef: MatDialogRef<ConfigureOpenaiComponent>,
    private openAiService: OpenAIService,
    private generalService: GeneralService) { }

  ngOnInit() {
    this.generalService.showLoading();
    this.openAiService.key().subscribe({
      next: (result: Response) => {
        this.openApiKey = result.result || '';
        this.openAiService.base_models().subscribe({
          next: (models: string[]) => {
            this.generalService.hideLoading();
            this.models = models;
            this.selectedModel = this.models[0];
          },
          error: (error: any) => {
            this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage');
            this.generalService.hideLoading();
          }
        });
      },
      error: (error: any) => {
        this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage');
        this.generalService.hideLoading();
      }
    });
  }

  save() {
    this.generalService.showLoading();
    this.openAiService.configure(this.openApiKey, this.selectedModel).subscribe({
      next: () => {
        this.generalService.hideLoading();
        this.dialogRef.close({
          configured: true,
          start_training: this.startTraining,
        });
      },
      error: (error: any) => {
        this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage');
        this.generalService.hideLoading();
      }
    });
  }

  close() {
    this.dialogRef.close({
      configured: false,
      start_training: false,
    });
  }
}
