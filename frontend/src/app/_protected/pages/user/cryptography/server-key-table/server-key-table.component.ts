
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmationDialogComponent } from 'src/app/_general/components/confirmation-dialog/confirmation-dialog.component';
import { GeneralService } from 'src/app/_general/services/general.service';
import { ServerKeyDetailsComponent } from '../components/server-key-details/server-key-details.component';
import { PublicKey } from '../_models/public-key.model';
import { CryptoService } from '../_services/crypto.service';

// TODO: Rename, it doesn't display servr key, but public keys.
@Component({
  selector: 'app-server-key-table',
  templateUrl: './server-key-table.component.html',
  styleUrls: ['./server-key-table.component.scss']
})
export class ServerKeyTableComponent implements OnInit {

  @Output() invokeViewReceipts: EventEmitter<any> = new EventEmitter<any>();

  displayedColumns: string[] = ['name', 'domain', 'email', 'created', 'enabled', 'actions'];

  public dataSource: any = [];

  pageIndex: number = 0;
  pageSize: number = 5;
  totalItems: number = 0;

  public isLoading: boolean = true;

  constructor(
    private dialog: MatDialog,
    private cryptoService: CryptoService,
    private generalService: GeneralService) { }

  ngOnInit(): void {
    this.getKeys();
    this.getCount();
  }

  /*
   * Returns public keys from backend.
   */
  public getKeys() {
    this.isLoading = true;
    this.cryptoService.publicKeys({
      filter: '',
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize
    }).subscribe({
      next: (keys: PublicKey[]) => {
        this.dataSource = keys || [];
        this.isLoading = false;
      },
      error: (error: any) => this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage')
    });
  }

  public getCount() {
    const filter: string = '';
    this.cryptoService.countPublicKeys({ filter: filter }).subscribe({
      next: (res) => {
        this.totalItems = res.count;
      },

      error: (error: any) => this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage')
    });
  }

  /**
   * Deletes a public cryptography key from your backend.
   *
   * @param key Public key to delete
   */
  public deleteKey(key: PublicKey) {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: `Delete ${key.subject}`,
        description_extra: `You are deleting the public key belonging to <br/><span class="fw-bold">${key.subject} - ${key.email}</span> <br/><br/> Do you want to continue?`,
        action_btn: 'Delete',
        action_btn_color: 'warn',
        bold_description: true
      }
    }).afterClosed().subscribe((result: string) => {
      if (result === 'confirm') {
        this.cryptoService.deletePublicKey(key.id).subscribe({
          next: () => {
            this.generalService.showFeedback('Public key successfully deleted', 'successMessage');
            this.getKeys();
            this.getCount();
          },
          error: (error: any) => this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage')
        });
      }
    })
  }

  /**
   * Changes the enabled state of the specified key.
   *
   * @param key What key to modify
   */
  public enabledChanged(event: any, key: PublicKey) {
    this.cryptoService.setEnabled(key.id, event.checked).subscribe({
      next: () => {
        this.generalService.showFeedback(`Key was successfully ${event.checked ? 'enabled' : 'disabled'}`, 'successMessage')
        this.getKeys();
      },
      error: (error: any) => this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage')
    });
  }

  public viewDetails(key: PublicKey) {
    const keyData: any = { ...key };
    keyData.original_content = key.content;
    this.dialog.open(ServerKeyDetailsComponent, {
      width: '80vw',
      panelClass: ['light'],
      data: {
        key: keyData,
      }
    }).afterClosed().subscribe((res: any) => {
      if (res === true) {
        this.getKeys();
      }
    })
  }

  public viewReceipts(key: PublicKey) {
    const event: any = {
      key: key,
      index: 1
    }
    this.invokeViewReceipts.emit(event);
  }

  /**
   * Invoked when paginator wants to page data table.
   *
   * @param e Page event argument
   */
  public changePage(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getKeys();
  }
}
