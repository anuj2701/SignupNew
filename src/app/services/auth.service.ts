import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http"
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl:string = "https://localhost:7190/api/User/";

  private userPayload:any;

  constructor(private http : HttpClient,private router:Router,private userStore:UserStoreService) {

  }


  signUp(userObj:any){

    return this.http.post<any>(`${this.baseUrl.trim()}register`,userObj)
  }


  Adduser(userObj:any){

    return this.http.post<any>(`${this.baseUrl.trim()}adduser`,userObj)
  }

  login(loginObj:any){
    return this.http.post<any>(`${this.baseUrl.trim()}authenticate`,loginObj)
  }
  getUsers(usertoken:string){
    return this.http.get<any>(`${this.baseUrl}?usertoken=${usertoken}`);
  }

  storeToken(tokenValue:string){
    localStorage.setItem('token',tokenValue)
  }
  getToken(){
    return localStorage.getItem('token')
  }
  signOut(){
    this.userPayload = "";
    localStorage.clear();
    this.router.navigate(['login'])
  }
  isLoggedIn():boolean{
    return !!localStorage.getItem('token')
  }

  decodedToken(){
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    console.log(jwtHelper.decodeToken(token))
    return jwtHelper.decodeToken(token)
  }

  getFullNameFromToken(){
    this.userPayload = this.decodedToken();
    if(this.userPayload)
    return this.userPayload.unique_name;
  }

  getUserIdFromToken(){
    if(this.userPayload){
      return this.userPayload.userId;
    }
  }


  getRoleFromToken(){
    if(this.userPayload){
      return this.userPayload.Role;
    }
  }

}
