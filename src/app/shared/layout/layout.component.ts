import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/utils/authentication.service';
import { NotificationService } from '../services/utils/notification.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private readonly TOKEN_NAME = 'user_auth';
  authDetails: any;
  userDetails: any;

  constructor(private router: Router, private auth: AuthenticationService, private notify: NotificationService) { }

  ngOnInit(): void {
    this.userDetails = this.auth.loggedInUser;
  }

  ngAfterViewInit() {
    if(this.userDetails.data.firstTimeLogin) {
      let urlsplit = this.router.url?.split("/dashboard/");

      if(urlsplit.length > 1) {
        console.log(urlsplit);
        console.log(JSON.parse(atob(urlsplit[1].split('.')[1])))
        this.authDetails = JSON.parse(atob(urlsplit[1].split('.')[1]))
        let info = {
          token: urlsplit[1]
        }
        this.auth.verifyEmail(info).subscribe({
          next: res => {
            console.log(res);
            if(res.status == 200) {
              this.notify.showSuccess("Your email has been verified");
              let authInfo = {
                email: this.authDetails.email,
                password: this.authDetails.password
              }
              this.auth.login(authInfo).subscribe({
                next: res => {
                  console.log(res);
                  if(res.status == 200) {
                    if(res.data.isSuperAdmin) this.router.navigate(['app/settings']);
                    else this.router.navigate(['set-password']);
                  }
                },
                error: err => {
                  console.log(err)
                  this.notify.showError("err.message");
                }          
              })
            }
          },
          error: err => {
            console.log(err)
            //this.notify.showError("res.message");
          }          
        })
      }
      //console.log(userParam);
    } 
  }

  get token() {
    return localStorage.getItem(this.TOKEN_NAME);
  }

}
