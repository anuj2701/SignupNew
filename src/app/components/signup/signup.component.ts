import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signUpForm!: FormGroup;
  constructor(private fb:FormBuilder,private auth:AuthService,private router:Router){}

  ngOnInit() :void{
    this.signUpForm = this.fb.group({
      firstname:['',Validators.required],
      lastname:['',Validators.required],
      companyname:['',Validators.required],
      email:['',Validators.required,Validators.email],
      password:['',Validators.required],
      confirmpassword:['',Validators.required],
      industry:[]
    },{
      validators: this.passwordMatchValidator
    });
  }
  passwordMatchValidator(signUpForm:FormGroup) {
    const password = signUpForm.get('password')?.value;
    const confirmPassword = signUpForm.get('confirmpassword')?.value;

    return password === confirmPassword ? null : { mismatch: true};
  }

  onSignup(){
    if(this.signUpForm.valid){

      console.log(this.signUpForm.value);
      this.auth.signUp(this.signUpForm.value)
      .subscribe({
        next:(res)=>{
          alert(res.message);
          this.signUpForm.reset();
          this.router.navigate(['login']);
        },
        error:(err) =>{
          // if(err.status === 404){
          //   alert("User not Found")
          // }
          alert(err?.error.message.toString())
        }
      })
    }else{
      console.log("Invalid Form");
      alert("Your form is invalid")
    };

  }
  showAlert(message: string) {
    alert(message);
  }
}
