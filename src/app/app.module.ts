import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { TranslocoRootModule } from './transloco/transloco-root.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    SharedModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslocoRootModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({ extras: { lazyRender: true } }),
    FormlyMaterialModule,
    BrowserAnimationsModule
  ],
  providers: [{
    provide: RouteReuseStrategy, useClass: IonicRouteStrategy
  }, {
    provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
