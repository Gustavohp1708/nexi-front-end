import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ChatComponent } from './pages/chat/chat.component';
import { UserComponent } from './pages/user/user.component';
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "",
        component: LoginComponent
    },
    {
        path: "signup",
        component: SignupComponent
    },
    {
        path: "chat",
        component: ChatComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "user",
        component: UserComponent,
        canActivate: [AuthGuard]        
    },
    {
        path: "**",
        redirectTo: ""
    }
];
