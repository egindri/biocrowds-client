import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { BioCrowdsService } from './shared/biocrowds/biocrowds.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';

import { AppComponent } from './app.component';
import { BioCrowdsComponent } from './biocrowds/biocrowds.component';


@NgModule({
  declarations: [
    AppComponent,
    BioCrowdsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [BioCrowdsService, {provide: APP_BASE_HREF,
      useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
      deps: [PlatformLocation]}],
  bootstrap: [AppComponent]
})
export class AppModule { }
