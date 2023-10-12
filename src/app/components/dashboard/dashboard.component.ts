import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import { DialogComponent } from '../dialog/dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { EditComponent } from '../edit/edit.component';
import {User} from '../../models/User';
import { UserStoreService } from 'src/app/services/user-store.service';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { ConfirmMatDialogComponent } from '../confirm-mat-dialog/confirm-mat-dialog.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public Searchtext:any;
  public decodedstr:string = "";
  public fullname:string = "";
  public userID:number =0;
  displayedColumns: string[] = ['Firstname', 'Lastname', 'email','roles','actions','isActivated','IsActive'];
  dataSource :any;
  public users:any;
  public role:string="";
  public filteredItems:any;

  @ViewChild(MatPaginator) paginator !:MatPaginator;
  constructor(private dialog: MatDialog,private auth:AuthService,private api:ApiService,private router:Router,private userStore:UserStoreService) {

  }


    ngOnInit(){
      this.api.getUsers()
      .subscribe(res=>{
        this.users = res;
        this.dataSource = new MatTableDataSource<User>(this.users);

        this.dataSource.paginator = this.paginator;

        let fullNameFromToken = this.auth.getFullNameFromToken();
        this.decodedstr = fullNameFromToken;
        this.fullname = this.decodedstr[1];
        this.userID = parseInt(this.decodedstr[0]);
        this.role = this.decodedstr[2];
        if(this.role != "Admin"){
          this.displayedColumns = ['Firstname', 'Lastname', 'email','roles','isActivated'];
        }



    })

    }

    applyFilterChanged(event: MatSlideToggleChange) {
      console.log("activefiltertoggeld")
      const isChecked = event.checked;
      if (isChecked) {
        // Apply the filter logic here (e.g., filter out specific items)
        this.filteredItems = this.users.filter((item:any) => item.isActive);
        this.dataSource = new MatTableDataSource<User>(this.filteredItems);
      } else {
        // If the filter is turned off, show all items
        this.filteredItems = this.users;
        this.dataSource = new MatTableDataSource<User>(this.filteredItems);
      }
    }

    openDialog() {
      this.dialog.open(DialogComponent, {
        width:'853px',
        height:'508px',
      });
    }

    openEditDialog(id: number,firstname:string,lastname:string,email:string,password:string,companyname:string): void {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '853px';
      dialogConfig.height = '368px';
      dialogConfig.data = {id: id,firstname: firstname,lastname:lastname,email:email,password:password,companyName:companyname};
      this.dialog.open(EditComponent, dialogConfig);
    }

    openEditUserDialog(id: number): void {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '544px';
      dialogConfig.height = '608px';
      dialogConfig.data = {id: id};
      this.dialog.open(EditDialogComponent, dialogConfig);
    }

    logout(){
      this.auth.signOut();
      this.fullname = "";
    }

    deleteUser(id: number) {
      this.api.deleteUser(id).subscribe(
      response => {
        console.log('User Deleted', response);
        this.router.navigate(['dashboard']);
      },
      error => {
        console.error('Error deleting user', error);
        this.router.navigate(['dashboard']);
      }
    );
    }


    Filterchange(event:Event){
      const filvalue=(event.target as HTMLInputElement).value;
      this.dataSource.filter = filvalue;

    }

    confirmToggle(element: any,id: number): void {
      const dialogRef = this.dialog.open(ConfirmMatDialogComponent, {
        width: '550px',
        height: '250px',
        data:{id: id}
      });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // Toggle isActive when the user confirms
        element.isActive = !element.isActive;
      }
    });

  }


      toggleChanged(event: MatSlideToggleChange,id:number): void {
        const isChecked = event.checked;
        let userObj:any = {
          "id": id,
          "isActive": isChecked
        }
        // Now, isChecked contains the value (true or false) of the slide toggle
          this.api.ToggleActive(id,userObj)
          .subscribe({
            next:(res)=>{
              console.log("Active Toggle Fired")
              window.location.reload();
            },
            error:(err) =>{
              alert(err?.error.message)
            }
          });

        }

        ToggleSidebar(){

        }


}
