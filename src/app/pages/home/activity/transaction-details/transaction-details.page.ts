import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, tap } from 'rxjs/operators';
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.page.html',
  styleUrls: ['./transaction-details.page.scss'],
})
export class TransactionDetailsPage {
  details$ = this.route.paramMap.pipe(
    map(() => history.state),
    tap(whatever => console.log(whatever))
  );

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}
}
