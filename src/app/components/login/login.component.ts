import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  constructor(private fb:FormBuilder,private auth:AuthService,private router:Router){}

  ngOnInit() :void{
    this.loginForm = this.fb.group({
      email:['',Validators.required],
      password:['',Validators.required]
    });
  }

  onLogin(){
    if(this.loginForm.valid){
      console.log(this.loginForm.value);
      this.auth.login(this.loginForm.value)
      .subscribe({
        next:(res)=>{
          alert(res.message);
          this.loginForm.reset();
          this.auth.storeToken(res.token);
          this.router.navigate(['dashboard']);
        },
        error:(err) =>{
          // if(err.status === 404){
          //   alert("User not Found")
          // }
          alert(err?.error.message)
        }
      })

    }
    else{
      console.log("Form is not valid");
      alert("Your form is invalid")
    }
  }
}
