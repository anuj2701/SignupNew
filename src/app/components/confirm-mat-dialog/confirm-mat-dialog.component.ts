import { Binary } from '@angular/compiler';
import { Component,Inject,OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-confirm-mat-dialog',
  templateUrl:'./confirm-mat-dialog.component.html',
  styleUrls: ['./confirm-mat-dialog.component.scss'],
})
export class ConfirmMatDialogComponent implements OnInit{
  dataSource :any;
  user!:User;
  displayedColumns: string[] = ['Firstname', 'Lastname', 'email','roles','actions','isActivated','IsActive'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number},
    public dialogRef: MatDialogRef<ConfirmMatDialogComponent>,
    private api:ApiService) {}

  ngOnInit(){
    this.api.getUserById(this.data.id).subscribe({
      next:(res)=>{
        this.user = res;
        this.dataSource = this.user;
      }
    })

    }


  onNoClick(): void {
    // User clicked "No", so we close the dialog without any action

    this.dialogRef.close(false);
  }

  onYesClick(): void {
    // User clicked "Yes", so we close the dialog and pass true as the result
    this.dialogRef.close(true);

  }

  toggleChanged(event: MatSlideToggleChange): void {
    const isChecked = event.checked;
    let userObj:any = {
      "id": this.data.id,
      "isActive": isChecked
    }
    // Now, isChecked contains the value (true or false) of the slide toggle
      this.api.ToggleActive(this.data.id,userObj)
      .subscribe({
        next:(res)=>{
          console.log("Active Toggle Fired")
          window.location.reload();
        },
        error:(err) =>{
          console.log(err.message)
        }
      });

    }


}
