import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { BioCrowdsComponent } from './biocrowds.component';

describe('BioCrowdsComponent', () => {
	let component: BioCrowdsComponent;
	let fixture: ComponentFixture<BioCrowdsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports : [
				FormsModule,
        		ReactiveFormsModule
      		],
			declarations: [BioCrowdsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BioCrowdsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
