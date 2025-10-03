import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { firebaseConfig } from '../firebase.config';
import { initializeApp } from 'firebase/app';


initializeApp(firebaseConfig);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
