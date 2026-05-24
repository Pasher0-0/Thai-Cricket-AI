import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
// (ดึง Component หน้าแอป AI ที่เราเคยเขียนไว้เข้ามา)
import { CricketPredictorComponent } from './components/cricket-predictor/cricket-predictor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // เข้าเว็บมาตอนแรกให้เจอหน้า Home
  { path: 'predict', component: CricketPredictorComponent }, // เข้า /predict ถึงจะเจอหน้า AI
  { path: '**', redirectTo: '' } // ถ้าพิมพ์ URL มั่ว ให้เด้งกลับมาหน้า Home
];