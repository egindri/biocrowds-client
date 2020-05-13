import { Component, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { __core_private_testing_placeholder__ } from '@angular/core/testing';
import { GovernmentManagementService } from '../shared/government-management/government-management.service';

@Component({
    selector: 'app-government-management',
    templateUrl: './government-management.component.html',
    styleUrls: ['./government-management.component.css']
})
export class GovernmentManagementComponent {

    @ViewChild('flag')
    flag: any;

    state: any = {};

    image: string;

    states: any = [];

    cityList: any = [];

    citiesForm: FormGroup;



    constructor(private governmentManagementService: GovernmentManagementService, private formBuilder: FormBuilder) {
        this.refresh();
    }

    get cities(): FormArray {
        return this.citiesForm.get('cities') as FormArray;
    }

    refresh(): void {

        this.state = {};

        if (this.flag) {
            this.flag.nativeElement.value = null;
        }

        this.citiesForm = this.formBuilder.group({cities: this.formBuilder.array([this.newCity()])});

        this.governmentManagementService.loadStates()
                                        .subscribe(res => {
                                                        this.states = res;
                                                        this.cities.controls[0].get('stateId').setValue(this.obtainDefault());
                                                    },
                                                    err => {
                                                        alert(err.error);
                                                    });

        this.governmentManagementService.loadCities()
                                        .subscribe(res => {
                                                        this.cityList = res;
                                                    },
                                                    err => {
                                                        alert(err.error);
                                                    });
    }

    onFileChanged(event: any) {
        const fileReader = new FileReader();
        fileReader.onload = this.handleReaderLoaded.bind(this);
        fileReader.readAsDataURL(event.target.files[0]);
    }

    handleReaderLoaded(event: any) {
        const reader = event.target;
        this.state.flag = reader.result;
        this.image = this.state.flag;
    }

    obtainFlag(index: number): any {
        for (const state of this.states) {
            if (this.cities.controls[index].value.stateId == state.stateId) {
                return state.flag;
            }
        }
    }

    obtainDefault(): number {
        for (const state of this.states) {
            if (state.name === 'Santa Catarina') {
                return state.stateId;
            }
        }
    }

    newCity(): FormGroup {
        return this.formBuilder.group({name: this.formBuilder.control(null),
                                       stateId: this.obtainDefault(),
                                       population: this.formBuilder.control(null)});
    }

    addCity(): void {
        this.cities.controls.push(this.newCity());
    }

    removeNewCity(index: number): void {
        this.cities.removeAt(index);
    }

    saveState(): void {
        this.governmentManagementService.saveState(this.state)
                                        .subscribe(
                                                res => {
                                                alert(res.message);
                                                this.refresh();
                                                },
                                                err => alert(err.error.message));
    }

    saveCities(): void {
        this.governmentManagementService.saveCities({cities: this.cities.controls.map(c => c.value)})
                                        .subscribe(
                                                res => {
                                                    alert(res.message);
                                                    this.refresh();
                                                },
                                                err => alert(err.error.message));
    }

    removeCity(id: number): void {
        this.governmentManagementService.removeCity(id)
                                        .subscribe(
                                                res => {
                                                    alert(res.message);
                                                    this.refresh();
                                                },
                                                err => alert(err.error.message));
    }
}
