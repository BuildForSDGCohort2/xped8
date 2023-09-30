import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormFields } from 'src/app/shared/models/form-fields';
import { HumanResourcesService } from 'src/app/shared/services/hr/human-resources.service';
import { NotificationService } from 'src/app/shared/services/utils/notification.service';

@Component({
  selector: 'app-leave-type-info',
  templateUrl: './leave-type-info.component.html',
  styleUrls: ['./leave-type-info.component.scss']
})
export class LeaveTypeInfoComponent implements OnInit {

  leaveFieldData: FormFields[];
  leaveTypeForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LeaveTypeInfoComponent>,
    private hrService: HumanResourcesService,     
    private notifyService: NotificationService,
    private fb: FormBuilder
  ) {
    this.leaveTypeForm = this.fb.group({})

    this.leaveFieldData = [
      {
        controlName: 'name',
        controlType: 'text',
        controlLabel: 'Name',
        controlWidth: '100%',
        initialValue: this.data.name,
        validators: [Validators.required],
        order: 1
      },
      {
        controlName: 'description',
        controlType: 'textarea',
        controlLabel: 'Description',
        controlWidth: '100%',
        initialValue: null,
        validators: null,
        order: 2
      }
    ]

    this.leaveFieldData.forEach(field => {
      const formControl = this.fb.control(field.initialValue, field.validators)
      this.leaveTypeForm.addControl(field.controlName, formControl)
    })
  }

  ngOnInit(): void {
    
  }

}
