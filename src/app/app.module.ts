import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { BioCrowdsService } from './shared/biocrowds/biocrowds.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  providers: [BioCrowdsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
