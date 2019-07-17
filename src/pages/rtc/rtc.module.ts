import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RtcPage } from './rtc';

@NgModule({
  declarations: [
    RtcPage,
  ],
  imports: [
    IonicPageModule.forChild(RtcPage),
  ],
})
export class RtcPageModule {}
