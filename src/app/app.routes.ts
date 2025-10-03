import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Content } from './components/content/content';

export const routes: Routes = [
    {
        path: '',
        component: Content
    },
    {
        path: 'login',
        component: Login
    }
];
