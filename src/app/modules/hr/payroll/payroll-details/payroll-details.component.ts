import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, Location } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from 'src/app/shared/models/table-columns';
import { NotificationService } from 'src/app/shared/services/utils/notification.service';
import { HumanResourcesService } from 'src/app/shared/services/hr/human-resources.service';
import { PayrollPeriodDetailsComponent } from '../payroll-period-details/payroll-period-details.component';
import { PayrollCalculatorComponent } from '../payroll-calculator/payroll-calculator.component';

@Component({
  selector: 'app-payroll-details',
  templateUrl: './payroll-details.component.html',
  styleUrls: ['./payroll-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PayrollDetailsComponent implements OnInit {

  tableColumns: TableColumn[];
  tableData: any[] = [];
  columnsCount: number = 3;

  payrollPeriods: any[] = [];
  payrollCreditList: any[] = [];
  payrollDebitList:any[] = [];
  employees: any[] = [];

  periodInView: any;
  payrollPeriodName: string;

  displayedColumns: any[];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private hrService: HumanResourcesService,     
    private notifyService: NotificationService,
  ) {
    this.getPageData();
  }

  ngOnInit(): void {
    this.openPayrollModal();
  }

  goBack() {
    this.location.back();
  }

  getPageData = async () => {
    this.payrollPeriods = await this.hrService.getPayrollPeriods().toPromise();
    console.log(this.payrollPeriods);
    this.periodInView = this.payrollPeriods['data'][0];
    this.payrollPeriodName = this.periodInView.payrollPeriodName;
    this.tableData = this.payrollPeriods['data'][0]['payrollPeriodData'];
    this.payrollCreditList = await this.hrService.getPayrollCredits().toPromise();
    this.payrollDebitList = await this.hrService.getPayrollDebits().toPromise();
    this.employees = await this.hrService.getEmployees().toPromise();
    this.generateTableColumns();

    console.log(this.tableData);

    this.tableColumns.sort((a,b) => (a.order - b.order));
    this.displayedColumns = this.tableColumns.map(column => column.label);
    if(this.tableData) {
      this.dataSource = new MatTableDataSource(this.tableData);
    }
    else {
      this.generateTableData();
    }
    // console.log(this.payrollCreditList);
    // console.log(this.payrollDebitList);
    // console.log(this.employees);
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

  generateTableColumns() {
    this.tableColumns = [
      {
        key: "select",
        label: "Select",
        order: 1,
        columnWidth: "3%",
        cellStyle: "width: 100%",
        sortable: false
      },
      {
        key: "image",
        label: "Image",
        order: 2,
        columnWidth: "5%",
        cellStyle: "width: 100%",
        sortable: false
      },
      {
        key: "name",
        label: "Name",
        order: 3,
        columnWidth: "12%",
        cellStyle: "width: 100%",
        sortable: true
      },
    ];

    if(this.payrollCreditList) {
      this.payrollCreditList['data'].map( item => {
        this.columnsCount = this.columnsCount + 1;
        let columnObject = {
          key: this.toCamelCase(item.name),
          label: item.name,
          order: this.columnsCount,
          // columnWidth: 'auto',
          columnWidth: String((100-45)/(this.payrollCreditList['data'].length + this.payrollDebitList['data'].length)) + '%',
          cellStyle: "green",
          sortable: false
        }
        this.tableColumns.push(columnObject);
      })
    }
    
    if(this.payrollDebitList) {
      this.payrollDebitList['data'].map( item => {
        this.columnsCount = this.columnsCount + 1;
        let columnObject = {
          key: this.toCamelCase(item.name),
          label: item.name,
          order: this.columnsCount,
          // columnWidth: 'auto',
          columnWidth: String((100-45)/(this.payrollCreditList['data'].length + this.payrollDebitList['data'].length)) + '%',
          cellStyle: "red",
          sortable: false
        }
        this.tableColumns.push(columnObject);
      });

      let otherColumns = ['Net Pay', 'Status', 'Actions'];
      otherColumns.map(item => {
        this.columnsCount = this.columnsCount + 1;
        let columnObject = {
          key: this.toCamelCase(item),
          label: item,
          order: this.columnsCount,
          columnWidth: item == 'Status' ? '10%' : '8%',
          cellStyle: "width: 100%",
          sortable: false
        }
        this.tableColumns.push(columnObject);
      })
    }
    console.log(this.tableColumns);
  }

  generateTableData() {
    this.employees['data'].map(item => {
      let dataEntry= {};
      dataEntry['name'] = item.fullName;
      dataEntry['companyRole'] = item.companyRole;
      dataEntry['department'] = item.department;
      dataEntry['designationName'] = item.designationName;
      dataEntry['email'] = item.email;
      dataEntry['employmentType'] = item.employmentType;
      dataEntry['image'] = item.profilePic;
      dataEntry['status'] = 'Pending';

      this.tableColumns.map(columnName => {
        if(!(columnName.key == 'select' || columnName.key == 'image' || columnName.key == 'name' || columnName.key == 'status' || columnName.key == 'actions')) {
          dataEntry[columnName.key] = '-';
        }
      })

      this.tableData.push(dataEntry);
    });
    this.dataSource = new MatTableDataSource(this.tableData);
    // console.log(this.tableData);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }


  /*************** PAYROLL PERIOD RELATED ACTIONS ***************/

  //Open payroll period modal
  openPayrollModal() {
    this.dialog.open(PayrollPeriodDetailsComponent, {
      width: '30%',
      height: 'auto',
      data: {
        // name: details.name,
        // id: details._id,
        isExisting: false,
        disableClose: true,
        // modalInfo: details
      },
    }).afterClosed().subscribe(() => {
      this.getPageData();
    });
  }

  //Edit a Payroll Period
  openEditModal() {
    this.dialog.open(PayrollPeriodDetailsComponent, {
      width: '32%',
      height: 'auto',
      data: {
        name: this.periodInView.payrollPeriodName,
        id: this.periodInView._id,
        isExisting: true,
        modalInfo: this.periodInView
      },
    }).afterClosed().subscribe(() => {
      this.getPageData();
    });;
  }

  //Delete a Payroll Period
  deletePayrollPeriod() {
    this.notifyService.confirmAction({
      title: 'Delete ' + this.periodInView.payrollPeriodName + ' Period',
      message: 'Are you sure you want to remove this payroll period?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.hrService.deletePayrollPeriod(this.periodInView._id).subscribe({
          next: res => {
            // console.log(res);
            if(res.status == 200) {
              this.notifyService.showInfo('The period has been deleted successfully');
            }
            this.getPageData();
          },
          error: err => {
            console.log(err)
            this.notifyService.showError(err.error.error);
          } 
        })
      }
    });
  }

  //Set the data of the period in view on change of the dropdown option
  setPayrollData(periodData) {
    this.periodInView = periodData.payrollPeriodData;
    this.payrollPeriodName = periodData.payrollPeriodName;
    this.dataSource = new MatTableDataSource(periodData.payrollPeriodData);
    console.log(periodData);
  }

  //Open payroll calculator modal
  openPayrollCalculator(details) {
    this.dialog.open(PayrollCalculatorComponent, {
      width: '30%',
      height: 'auto',
      data: {
        isExisting: false,
        payrollCredits: this.payrollCreditList['data'],
        payrollDebits: this.payrollDebitList['data'],
        modalInfo: details
      },
    }).afterClosed().subscribe(() => {
      this.getPageData();
    });
  }

}
