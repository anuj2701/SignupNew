import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private fullName$ = new BehaviorSubject<string>("");
  private userid$ = new BehaviorSubject<string>("");
  constructor() { }

  public getUserIDFromStore(){
    return this.userid$.asObservable();
  }

  public setUserIDFromStore(userId:string){
    return this.userid$.next(userId);
  }

  public getFullNameFromStore(){
    return this.fullName$.asObservable();
  }

  public setFullNameFromStore(fullname:string){
    return this.fullName$.next(fullname);
  }
}
