import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { GovernmentManagementService } from './shared/government-management/government-management.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GovernmentManagementComponent } from './government-management/government-management.component';


@NgModule({
  declarations: [
    AppComponent,
    GovernmentManagementComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [GovernmentManagementService],
  bootstrap: [AppComponent, GovernmentManagementComponent]
})
export class AppModule { }
