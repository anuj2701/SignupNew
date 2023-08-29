import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  AddUserForm!: FormGroup;
  constructor(private dialog: MatDialog,private fb:FormBuilder,private auth:AuthService,public router:Router){}

  ngOnInit() :void{
    this.AddUserForm = this.fb.group({
      firstname:[''],
      lastname:[''],
      email:[''],
    });
  }
  AddUser(){
    if(this.AddUserForm.valid){

      console.log(this.AddUserForm.value);
      this.auth.Adduser(this.AddUserForm.value)
      .subscribe({
        next:(res)=>{
          this.AddUserForm.reset();
          window.location.reload();
          alert(res.message);
          // this.AddUserForm.reset();
        },
        error:(err) =>{
          alert(err?.error.message)
        }
      })
    }else{
      console.log("Invalid Form");
      alert("Your form is invalid")
    };

  }
  Cancelbutton()
  {
    window.location.reload();
    this.dialog.closeAll();
    // return this.router.navigate(['dashboard']);

  }
}
