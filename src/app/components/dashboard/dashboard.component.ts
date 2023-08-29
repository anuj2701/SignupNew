import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public fullname:string = "";
  public userID:number =0;
  displayedColumns: string[] = ['Firstname', 'Lastname', 'email','actions'];
  dataSource :any;
  public users:any = [];

  @ViewChild(MatPaginator) paginator !:MatPaginator;
  constructor(private dialog: MatDialog,private auth:AuthService,private api:ApiService,private router:Router,private userStore:UserStoreService) {this.ngOnInit()}

    ngOnInit(){
      this.api.getUsers()
      .subscribe(res=>{
        this.users = res;
        this.dataSource = new MatTableDataSource<User>(this.users);
        this.dataSource.paginator = this.paginator;
    })
      this.userStore.getFullNameFromStore()
      .subscribe(val => {
        let fullNameFromToken = this.auth.getFullNameFromToken();
        this.fullname = val || fullNameFromToken;
        this.userID = parseInt(this.fullname[0]);
      })


    }
    openDialog() {
      this.dialog.open(DialogComponent, {
        width:'853px',
        height:'368px',
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
}
