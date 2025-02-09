/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LastLogItems } from 'src/app/models/dashboard.model';

@Component({
  selector: 'app-view-log',
  templateUrl: './view-log.component.html'
})
export class ViewLogComponent {

  /**
   * 
   * @param data Comes from the parent component once the dialog is being called.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: LastLogItems) { }
}
