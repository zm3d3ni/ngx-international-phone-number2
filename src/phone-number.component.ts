import {
    Component,
    ElementRef,
    forwardRef,
    HostListener,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    Validator,
    ValidationErrors,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import * as glibphone from 'google-libphonenumber';
import { Country } from './country.model';
import { CountryService } from './country.service';

const PLUS = '+';

const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhoneNumberComponent),
    multi: true
};

const VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => PhoneNumberComponent),
    multi: true
};

@Component({
    selector: 'international-phone-number2',
    templateUrl: './phone-number.component.html',
    styleUrls: ['./phone-number.component.scss', './assets/css/flags.min.css'],
    host: {
        '(document:click)': 'hideDropdown($event)'
    },
    providers: [COUNTER_CONTROL_ACCESSOR, VALIDATOR]
})
export class PhoneNumberComponent
    implements OnInit, ControlValueAccessor, Validator {
    // input
    @Input() placeholder = 'Enter phone number'; // default
    @Input() maxlength = 15; // default

    @Input() defaultCountry: string;
    @Input() required: boolean;
    @Input() allowDropdown = true;
    @Input() type = 'text';

    @Input() allowedCountries: Country[];

    // customizable text masking, defaults as "111-111-1111"
    // TODO - I am unable to pass this Input in as an array
    // @Input() masking = [/[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    masking = [/[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

    // regex pattern to apply to input, defaults as 3 digits followed by 3 digits, followed by 4 digits
    @Input() pattern = "^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$";
    
    // optionally format output model with a space between country code and phone number
    @Input() countryCodeSpace: boolean = true;
    
    // optionally suppress the +1 for US phones
    @Input() noUSCountryCode: boolean = true;

    @Output() onCountryCodeChanged: EventEmitter<any> = new EventEmitter();

    // ELEMENT REF
    phoneComponent: ElementRef;

    // CONTROL VALUE ACCESSOR FUNCTIONS
    onTouch: Function;
    onModelChange: Function;

    countries: Country[];
    selectedCountry: Country;
    countryFilter: string;
    showDropdown = false;
    phoneNumber = '';
    phoneNumberOnly = ''; //separating the phone from the country dial code

    value = '';

    // the country's dial code displayed as read-only
    dialCode;

    @ViewChild('phoneNumberInput') phoneNumberInput: ElementRef;

    /**
     * Util function to check if given text starts with plus sign
     * @param text
     */
    private static startsWithPlus(text: string): boolean {
        return text.startsWith(PLUS);
    }

    /**
     * Reduced the prefixes
     * @param foundPrefixes
     */
    private static reducePrefixes(foundPrefixes: Country[]) {
        const reducedPrefixes = foundPrefixes.reduce((first: Country, second: Country) =>
            first.dialCode.length > second.dialCode.length ? first : second
        );
        return reducedPrefixes;
    }

    constructor(
        private countryService: CountryService,
        phoneComponent: ElementRef
    ) {
        this.phoneComponent = phoneComponent;
    }

    ngOnInit(): void {
        if (this.allowedCountries && this.allowedCountries.length) {
            this.countries = this.countryService.getCountriesByISO(this.allowedCountries);
        } else {
            this.countries = this.countryService.getCountries();
        }
        this.orderCountriesByName();
    }

    /**
     * Opens the country selection dropdown
     */
    displayDropDown() {
        if (this.allowDropdown) {
            this.showDropdown = !this.showDropdown;
            this.countryFilter = '';
        }
    }

    /**
     * Hides the country selection dropdown
     * @param event
     */
    hideDropdown(event: Event) {
        if (!this.phoneComponent.nativeElement.contains(event.target)) {
            this.showDropdown = false;
        }
    }

    /**
     * Sets the selected country code to given country
     * @param event
     * @param countryCode
     */
    updateSelectedCountry(event: Event, countryCode: string) {
        event.preventDefault();
        this.updatePhoneInput(countryCode);
        this.onCountryCodeChanged.emit(countryCode);
        this.updateValue();
        // focus on phone number input field
        setTimeout(() => this.phoneNumberInput.nativeElement.focus());
    }

    /**
     * Updates the phone number
     * @param event
     */
    updatePhoneNumber(event: Event) {
        if (PhoneNumberComponent.startsWithPlus((''+event))) {
            this.findPrefix((''+event).split(PLUS)[1]);
        } else {
            // this.selectedCountry = null; // why were they setting this to null?
        }

        this.updateValue();
    }

    /**
     * shows the dropdown with keyboard event
     * @param event
     */
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.showDropdown) {
            this.countryFilter = `${this.countryFilter}${event.key}`;
        }
    }

    /**
     * @param prefix
     */
    private findPrefix(prefix: string) {
        let foundPrefixes: Country[] = this.countries.filter((country: Country) =>
            prefix.startsWith(country.dialCode)
        );
        if (foundPrefixes && foundPrefixes.length) {
            this.selectedCountry = PhoneNumberComponent.reducePrefixes(foundPrefixes);
        } else {
            this.selectedCountry = null;
        }
        this.dialCode = this.selectedCountry.dialCode;
    }

    /**
     * Sort countries by name
     */
    private orderCountriesByName() {
        this.countries = this.countries.sort(function (a, b) {
            return a['name'] > b['name'] ? 1 : b['name'] > a['name'] ? -1 : 0;
        });
    }

    /**
     *
     * @param fn
     */
    registerOnTouched(fn: Function) {
        this.onTouch = fn;
    }

    /**
     *
     * @param fn
     */
    registerOnChange(fn: Function) {
        this.onModelChange = fn;
    }

    /**
     *
     * @param value
     */
    writeValue(value: string) {
        this.value = value || '';
        this.phoneNumber = this.value;

        if (PhoneNumberComponent.startsWithPlus(this.value)) {
            this.findPrefix(this.value.split(PLUS)[1]);
            if (this.selectedCountry) {
                this.updatePhoneInput(this.selectedCountry.countryCode);
            }
        }

        if (this.defaultCountry) {
            this.updatePhoneInput(this.defaultCountry);
        }
        this.getPhoneOnly();
    }

    // strips country dial code from phone for display
    getPhoneOnly(){
        this.phoneNumberOnly = this.phoneNumber.substring(this.phoneNumber.length-10, this.phoneNumber.length);
    }

    /**
     * Validation
     * @param c
     */
    validate(c: FormControl): ValidationErrors | null {
        let value = c.value;
        // let selectedDialCode = this.getSelectedCountryDialCode();
        let validationError: ValidationErrors = {
            phoneEmptyError: {
                valid: false
            }
        };

        if (this.required && !value) {
            // if (value && selectedDialCode)
            //     value = value.replace(/\s/g, '').replace(selectedDialCode, '');

            // if (!value) return validationError;
            return validationError;
        }

        if (value) {
            // validating number using the google's lib phone
            const phoneUtil = glibphone.PhoneNumberUtil.getInstance();
            try {
                let phoneNumber = phoneUtil.parse(value);
                let isValidNumber = phoneUtil.isValidNumber(phoneNumber);
                return isValidNumber ? null : validationError;
            } catch (ex) {
                return validationError;
            }
        }
        return null;
    }

    /**
     * Updates the value and trigger changes
     * Updates model to '+' + dialCode + phone. US phones are not prefixed.
     */
    private updateValue() {
        let temp;
        
        if(this.selectedCountry.countryCode != 'us' || this.noUSCountryCode)
            if(this.countryCodeSpace)
                temp = '+'+this.dialCode+' '+this.phoneNumberOnly;
            else
                temp = '+'+this.dialCode+this.phoneNumberOnly;
        else {   
            temp = this.phoneNumberOnly;    
        }
        temp = temp.replace(/-/g, '');
        this.onModelChange(temp);
        this.onTouch();
    }

    /**
     * Updates the country dial code
     * @param countryCode
     */
    private updatePhoneInput(countryCode: string) {
        this.showDropdown = false;

        this.selectedCountry = this.countries.find(
            (country: Country) => country.countryCode === countryCode
        );
        if (this.selectedCountry) {
            if(this.selectedCountry.countryCode != 'us' || !this.noUSCountryCode)
                this.dialCode = this.selectedCountry.dialCode;
            else
                this.dialCode = null; 
        }
    }

    /**
     * Returns the selected country's dialcode
     */
    public getSelectedCountryDialCode(): string {
        if (this.selectedCountry) { return PLUS + this.selectedCountry.dialCode; };
        return null;
    }
}
