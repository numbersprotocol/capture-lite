import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-what-are-actions',
  templateUrl: './what-are-actions.page.html',
  styleUrls: ['./what-are-actions.page.scss'],
})
export class WhatAreActionsPage {}
