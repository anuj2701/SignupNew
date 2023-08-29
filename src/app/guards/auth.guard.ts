import {  CanActivate, Router} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn:'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth:AuthService,private router:Router){

  }
  canActivate():boolean {
    if(this.auth.isLoggedIn()){
      return true
    }else{
      alert("Please login first")
      this.router.navigate(['login'])
      return false;
    }

  }
};
