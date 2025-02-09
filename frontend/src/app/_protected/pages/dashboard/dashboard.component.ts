
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/_general/services/general.service';
import { BackendService } from '../../../_general/services/backend.service';
import { DiagnosticsService } from '../../../_general/services/diagnostics.service';
import moment from 'moment';
import { LogTypes, SystemReport } from './_models/dashboard.model';
import { ConfigureThemeDialog } from 'src/app/_protected/pages/dashboard/components/configure-theme/configure-theme-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

/**
 * Primary dashboard component, displaying dashboard information, such as
 * charts, statistics, general information, etc.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  systemReport: any = null;
  systemReportDisplayable: any;
  logTypesChart: LogTypes[];

  // default is set for all charts to be displayed
  chartsList: any = [];

  /**
   * for preparing chart data + name and description dynamically
   */
  chartData: any = [];

  public userIsRoot: boolean = undefined;

  private _isRetrievingSystemReport = false;

  public isLoading: boolean = true;

  public showInfoPanel: string = sessionStorage.getItem('infoPanel') || 'show';

  public userAsUsername: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private generalService: GeneralService,
    private dialog: MatDialog,
    private router: Router,
    private backendService: BackendService,
    private diagnosticsService: DiagnosticsService) { }

  ngOnInit() {
    if (!this.backendService.active.setupDone) {
      this.router.navigate(['/setup']);
      return;
    }
    this.waitForData();
    this.showInitDialog();
  }

  private waitForData() {
    if (this.backendService.active?.token?.in_role('root')) {
      this.getSystemReport();
      this.userIsRoot = (this.backendService.active?.token?.in_role('root'));
    } else {
      this.userAsUsername = this.backendService.active.username;
      this.isLoading = false;
    }
    this.cdr.detectChanges();
  }

  /*
   * Retrieving the system's report
   */
  private getSystemReport() {
    this.cdr.markForCheck();

    // Avoiding race conditions.
    if (this._isRetrievingSystemReport) {
      return;
    }
    this._isRetrievingSystemReport = true;

    // Retrieving system report from backend.
    this.diagnosticsService.getSystemReport().subscribe({
      next: (report: SystemReport[]) => {
        // emptying arrays to prevent displaying wrong information while switching between backends,
        // if not, when system information is not available, the arrays are still filled with the previous system's information data.
        this.chartsList = [];
        this.chartData = {};
        this.systemReportDisplayable = null;

        // Allowing us to retrieve system report again.
        this._isRetrievingSystemReport = false;

        // Ensuring backend actually returned something.
        if (!report) {
          return;
        }

        // Binding model
        this.systemReport = report || [];

        // To display system reports in the html file.
        this.systemReportDisplayable = this.systemReport;
        this.logTypesChart = report['log_types'] || [];

        // Preparing data with variable key
        if (report["timeshifts"]) {
          Object.keys(report['timeshifts']).forEach((el: any) => {

            // Preparing chart list for setting user preferences
            this.chartsList.push({ name: report['timeshifts'][el].name, value: el, status: true });
            this.chartData[el] = { label: report['timeshifts'][el].items.map(x => { return moment(x.when).format("D. MMM") }), data: report['timeshifts'][el].items.map(x => { return x.count }), name: report['timeshifts'][el].name, description: report['timeshifts'][el].description };

          })
        }
        this.cdr.detectChanges();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.generalService.showFeedback(error?.error?.message ?? error, 'errorMessage');
        this._isRetrievingSystemReport = false;
      }
    });
  }

  private showInitDialog() {
    const configured = localStorage.getItem('configured');
    if (configured) {
      return;
    }
    const dialog = this.dialog.open(ConfigureThemeDialog, {
      width: '550px',
    });
    dialog.afterClosed().subscribe(() => {
      localStorage.setItem('configured', 'true');
    });
  }

  hidePanel() {
    this.showInfoPanel = 'hide';
    this.cdr.detectChanges();
    sessionStorage.setItem('infoPanel', this.showInfoPanel);
  }

  /**
   * Just an empty function, needed to keep the chartData itteration unsorted by the keyvalue pipe.
   */
  unsorted() { }
}
