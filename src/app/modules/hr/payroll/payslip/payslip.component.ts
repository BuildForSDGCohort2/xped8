import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/shared/services/utils/authentication.service';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PayslipComponent implements OnInit {

  userDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PayslipComponent>,
    private datePipe: DatePipe,
    private authService: AuthenticationService, 
  ) { }

  ngOnInit(): void {
    this.userDetails = this.authService.loggedInUser.data;
    console.log(this.userDetails);
    console.log(this.dialogData);
  }

  //Convert string to camel case
  toCamelCase(str:string){
    return str.split(' ').map(function(word,index){
      // If it is the first word make sure to lowercase all the chars.
      if(index == 0){
        return word.toLowerCase();
      }
      // If it is not the first word only upper case the first char and lowercase the rest.
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }

  strToDate(dateVal: string) {
    let newFormat = new Date(dateVal);
    return this.datePipe.transform(newFormat, 'd MMMM, y')    
  }

}
