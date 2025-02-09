
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonErrorMessages } from 'src/app/_general/classes/common-error-messages';
import { CommonRegEx } from 'src/app/_general/classes/common-regex';
import { GeneralService } from 'src/app/_general/services/general.service';
import { CodemirrorActionsService } from '../../../../create/hyper-ide/services/codemirror-actions.service';
import { TaskService } from '../../_services/task.service';

/**
 * Helper component allowing you to manage and schedule tasks in the system.
 */
@Component({
  selector: 'app-manage-task',
  templateUrl: './manage-task.component.html'
})
export class ManageTaskComponent implements OnInit {

  public task: Task = {
    id: '',
    description: '',
    hyperlambda: 'log.info:Hello world from task'
  };

  public hlModel: HlModel;

  public hlReady: boolean = false;

  public CommonRegEx = CommonRegEx;
  public CommonErrorMessages = CommonErrorMessages;

  constructor(
    private taskService: TaskService,
    private generalService: GeneralService,
    private dialogRef: MatDialogRef<ManageTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task,
    private codemirrorActionsService: CodemirrorActionsService) { }

  ngOnInit() {
    if (this.data) {
      this.task = this.data;
    }
    const res = this.codemirrorActionsService.getActions(null, 'hl');
    res.autofocus = false;
    this.hlModel = {
      hyperlambda: this.task.hyperlambda,
      options: res,
    }
    setTimeout(() => {
      this.hlReady = true;
    }, 500);
  }

  /**
   * Invoked when user clicks the create button to create a new role.
   */
  public create() {
    if (!this.validateName()) {
      this.generalService.showFeedback('Name is not valid', 'errorMessage')
      return;
    }

    if (this.data) {
      this.taskService.update(
        this.data.id,
        this.hlModel.hyperlambda,
        this.task.description).subscribe({
          next: () => {
            this.generalService.showFeedback('Task successfully edited', 'successMessage')
            this.dialogRef.close(true);
          },
          error: (error: any) => this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage', 'Ok', 4000)
        });
    } else {
      this.taskService.create(this.task.id, this.hlModel.hyperlambda, this.task.description).subscribe({
        next: () => {
          this.generalService.showFeedback('New task is created successfully', 'successMessage')
          this.dialogRef.close(true);
        },
        error: (error: any) => this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage', 'Ok', 4000)
      });
    }

  }

  private validateName() {
    return this.CommonRegEx.appNames.test(this.task.id);
  }
}

interface Task {
  id: string,
  description: string,
  hyperlambda: string,
  schedules?: any
}

interface HlModel {
  hyperlambda: string,
  options: any
}
