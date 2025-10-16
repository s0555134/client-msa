import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Content } from './components/content/content';
import { Registration } from './components/registration/registration';
import { TrollBuddy } from './components/troll-buddy/troll-buddy';
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
    },
    {
        path: 'troll-buddy',
        component: TrollBuddy,
        canActivate: [authGuard]
    }
];
