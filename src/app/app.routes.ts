import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Content } from './components/content/content';
import { Registration } from './components/registration/registration';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: Content,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        component: Login
    }
    ,
    {
        path: 'registration',
        component: Registration
    }
];
