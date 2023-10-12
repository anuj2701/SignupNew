import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
    EditUserForm!: FormGroup;
    constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number,firstname: string,lastname:string,email:string,password:string,companyname:string}, private dialog: MatDialog,private fb:FormBuilder,private router:Router,private api:ApiService){}

    ngOnInit() :void{
      this.EditUserForm = this.fb.group({
        id:[`${this.data.id}`],
        firstname:[''],
        lastname:[''],
        companyName:[`${this.data.companyname}`],
        email:[''],
        password:[`${this.data.password}`]
      });
    }


    editUser(){
      if(this.EditUserForm.valid){

        console.log(this.EditUserForm.value);
        this.api.Edituser(this.EditUserForm.value)
        .subscribe({
          next:(res)=>{
            this.EditUserForm.reset();
            this.router.navigate(['dashboard']);
            alert(res)
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
      this.dialog.closeAll();
      // return this.router.navigate(['dashboard']);

    }
  }

