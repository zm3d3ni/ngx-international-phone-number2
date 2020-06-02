import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PhoneNumberComponent } from './phone-number.component';
import { PhoneMaskCursorProcessorDirective } from '../phone.directive';
import { TextMaskModule } from 'angular2-text-mask';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountryPipe } from 'src/country.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CountryPipe,
    PhoneNumberComponent,
    PhoneMaskCursorProcessorDirective,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule
  ],
  exports: [
    PhoneNumberComponent,
    PhoneMaskCursorProcessorDirective    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
