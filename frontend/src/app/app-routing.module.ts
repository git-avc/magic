
/*
 * Copyright (c) Aista Ltd, 2021 - 2022 info@aista.com, all rights reserved.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessGuard } from './access.guard';
import { CoreComponent } from './_layout/core/core.component';

const routes: Routes = [
  {
    path: '',
    component: CoreComponent,
    canActivate: [AccessGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./_protected/pages/dashboard/_module/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'configurations',
        loadChildren: () => import('./_protected/pages/configuration/_module/config.module').then(m => m.ConfigModule)
      },
      {
        path: 'user-roles-management',
        loadChildren: () => import('./_protected/pages/user-roles/_module/users-roles.module').then(m => m.UsersRolesModule)
      },
    ]
  },
  {
    path: 'authentication',
    loadChildren: () => import('./public/authentication/_module/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'not-found',
    loadChildren: () => import('./public/not-found/lazy-loading/notfound.module').then(m => m.NotfoundModule),
  },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
