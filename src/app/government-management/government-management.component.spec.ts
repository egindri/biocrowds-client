import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { GovernmentManagementComponent } from './government-management.component';

describe('GovernmentManagementComponent', () => {
	let component: GovernmentManagementComponent;
	let fixture: ComponentFixture<GovernmentManagementComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports : [
				FormsModule,
        		ReactiveFormsModule
      		],
			declarations: [GovernmentManagementComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GovernmentManagementComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
