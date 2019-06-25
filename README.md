# ngx-international-phone-number
A simple international telephone number input. Allows you to create a phone number field with country dropdown. 

This is re-re-written version (with enhancements and bug fixes) of [ngx-international-phone-number](https://github.com/nikhiln/ngx-international-phone-number) by [nikhiln](https://github.com/nikhiln), which was a re-written version of [ng4-intl-phone](https://github.com/kondi0/ng4-intl-phone/). So credit should go to [nikhiln](https://github.com/nikhiln) and [kondi0](https://github.com/kondi0).

## Enhancements

I discovered some problems with the ngx-international-phone-number library, prompting this updated version:

1 - The placeholder was not displayed unless you clear out the initial country code.

  - This has been fixed by separating the country dial code from the input.

2 - Non-numeric text could be pasted into the input.

  - This was fixed using a different directive.

3 - Clearing the country dial code or setting the cursor before the country dial code, then changing the country in the dropdown, the cursor would be inserted before the country code again, resulting in a mangled phone like "1234567890+1"

  - This has been fixed by separating the country dial code from the input.

4 - Since the country dial code was part of the input, the maxlength had to be adjusted to include it plus a space. However some country codes are 1 digit while others are not, so this could result in a phone input that couldn't fit all the desired digits or one that allowed too many digits.

  - This has been fixed by separating the country dial code from the input.

5 - There was no support for masking, for instance "111-111-1111".

  - This has been fixed by adding masking in above format

6 - If defaultCountry was set true, existing phone values would have the country changed to that default country. The default country should apply only to new empty inputs.

7 - Added optional input to divide country code and phone number with a space (**countryCodeSpace** defaults to true)

8 - Added optional input to not prepend US phone numbers with country code (**noUSCountryCode** defaults to true)

## Installation

To install this library, run:

```bash
$ npm install ngx-international-phone-number2 --save
```

## Consuming your library

Once you have installed it you can import `InternationalPhoneNumberModule` from `ngx-international-phone-number2` in any application module. E.g.

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number2';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // InternationalPhoneNumberModule module
    InternationalPhoneNumberModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once it is imported, you can use `international-phone-number2`:

```xml
<!-- app.component.html -->
<form name="sample-form" (ngSubmit)="submit()" #f="ngForm">
 <international-phone-number2 [(ngModel)]="model.phone_number" placeholder="Enter phone number" [defaultCountry]="'in'" [required]="true" #phoneNumber="ngModel" name="phone_number" [allowedCountries]="['in', 'ca', 'us']" ></international-phone-number2>

  <div *ngIf="f.submitted && !phoneNumber.valid" class="help-block">Phone number is required and should be valid</div>
  <button type="submit">Submit</button>
</form>
```

### Attributes/Options:
    defaultCountryCode : An ISO 639-1 country code can be provided to set default country selected.
       
    placeholder: A placeholder text which would be displayed in input widget
    
    required: Indicates whether it's required or not
    
    allowDropdown: Indicates whether to allow selecting country from dropdown

    allowedCountries: A list of countries (iso codes) that would get display in country dropdown. E.g. [allowedCountries]="['in', 'ca', 'us']" would only show Canada, India and US. If not provided, all the countries would get displayed.

    pattern: Regex pattern to apply to input. Defaults to a regex that enforces 10 digit numeric input as "111-111-1111"
    
    countryCodeSpace: Boolean to add a space between country code and phone in model (defaults to true)

    noUSCountryCode: Boolean to suppress +1 country code for US numbers in model (defaults to true)

## Troubleshooting:
If you are getting error "Can't resolve 'google-libphonenumber'" while building with aot, try to install google-libphonenumber. Run npm install google-libphonenumber@3.0.9 --save


## Authors
    * Original Author: kondi0, nikhiln
    * Author: esoyke

## License

MIT