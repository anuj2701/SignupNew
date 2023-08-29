import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit{
  EditUserForm!: FormGroup;
    constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number}, private dialog: MatDialog,private fb:FormBuilder,private router:Router,private api:ApiService){}

    ngOnInit() :void{
      this.EditUserForm = this.fb.group({
        id:[`${this.data.id}`],
        firstname:[''],
        lastname:[''],
        companyName:[''],
        email:[''],
        password:[''],
      });
    }


    editUser(){
      if(this.EditUserForm.valid){

        console.log(this.EditUserForm.value);
        this.api.Edituser(this.data.id,this.EditUserForm.value)
        .subscribe({
          next:(res)=>{
            this.EditUserForm.reset();
            window.location.reload();
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
