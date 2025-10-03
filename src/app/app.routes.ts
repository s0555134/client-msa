import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Content } from './components/content/content';
import { Registration } from './components/registration/registration';

export const routes: Routes = [
    {
        path: '',
        component: Content
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
