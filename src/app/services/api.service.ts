import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = "https://localhost:7190/api/User/";
  private baseUrl2:string = "https://localhost:7190/api/User";
  private token = localStorage.getItem('token');

  constructor(private http:HttpClient) { }

  getUsers(){
    return this.http.get<any>(`${this.baseUrl}?usertoken=${this.token}`);
  }
  getUserById(id:number){
    return this.http.get<any>(`${this.baseUrl.trim()}${id}`);
  }
  deleteUser(userId: number){
    const url = `${this.baseUrl2.trim()}?id=${userId}`;
    return this.http.delete(url);
  }

  Edituser(userObj:any){
    return this.http.put(`${this.baseUrl.trim()}`,userObj);
  }

  ToggleActive(id:number,userObj:any){
    return this.http.put(`${this.baseUrl.trim()}${id}`,userObj);
  }
}
