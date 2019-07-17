import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as firebase from 'firebase';
import { convertArray } from '../../app/envrionment';

declare var require: any

/**
 * Generated class for the RtcPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rtc',
  templateUrl: 'rtc.html',
})
export class RtcPage {

  unicID: any;
  yourId: any;
  otherId: any;
  yourMessage: any;

  peer: any;
  targetpeer: any;

  ref: any;

  ans: any = false;
  off: any = false;
  sendOk: any = false;
  receivedM: any = false;
  receivedMessage: any;

  answers = [];
  offers = [];
  answerIDs = [];
  offerIDs = [];

  items: any;
  mySessionID : any;

  static alertCTRL : AlertController;
  justReload: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RtcPage');
  }

  doRefresh(event?) {
    console.log('Begin async operation');
    if(this.off == true){
      this.receivedMessage = JSON.parse(localStorage.getItem('peermessage'));
      this.sendOk = true;
      this.off = false;
      this.ans = false;
      this.justReload = true;
    }
    if(this.ans == true){
      this.dataDown('answer');
      this.justReload = true;
    }
    if(this.justReload == true){
      console.log('justReload');
      this.receivedM = true;
      this.receivedMessage = JSON.parse(localStorage.getItem('peermessage'));
    }
    event.complete();
  }

  dataDown(type: string){
    if(type == 'offer'){
      this.ref = firebase.database().ref('peers/test/offer/');
    }else{
      this.ref = firebase.database().ref('peers/test/answer/');
    }
    this.ref
    .once('value')
    .then(res => {
      this.items = convertArray(res);
      this.items = this.items.reverse();
    }).catch(err => {
      console.log('websocket or internet error');
    });
  }

  generateOffer(){
    var Peer = require('connect-peer-module');
    this.peer = new Peer({ init: true });

    this.peer.on('signal', function(data){
      this.targetpeer = JSON.stringify(data);

      var myId = idGenerator();
      console.log('id: ', myId);
      console.log(JSON.stringify(data));
      var myType = "offer";
      var jsonFile = {
        id: myId, type: myType, data: this.targetpeer
      };
     
      this.mySessionID = myId;

      this.ref = firebase.database().ref('peers/test/offer/');
      let newItem = this.ref.push();
      newItem.set(jsonFile);
    })    

    this.peer.on('data', function(data){
      console.log('Received message: ', JSON.parse(data));
      localStorage.setItem('peermessage', data);
    })  

    function idGenerator(){
      var number = Math.random();
      var id = number.toString(36).substr(2, 9);
      console.log("id: " + id);
      return id;
    }
    this.ans = true; 
  }

  goAnswer(){
    this.dataDown('offer');
    this.off = true;
  }

  public generateAnswer(index: number){
    var myOffer = this.items[index].data;
    var Peer = require('connect-peer-module');

    this.peer = new Peer({ init: false });
    this.peer.signal(JSON.parse(myOffer));

    this.peer.on('signal', function(data){
      console.log(JSON.stringify(data));
      this.targetpeer = JSON.stringify(data);

      var myId = idGenerator();
      var myType = "answer";
      var jsonFile = {
        id: myId, type: myType, data: this.targetpeer
      };
     
      this.ref = firebase.database().ref('peers/test/answer');
      let newItem = this.ref.push();
      newItem.set(jsonFile);
    })    

    this.receivedM = true;
    this.peer.on('data', function(data){
      console.log('Received message: ', JSON.parse(data));
      localStorage.setItem('peermessage', data);
    })  

    function idGenerator(){
      var number = Math.random();
      var id = number.toString(36).substr(2, 9);
      console.log("id: " + id);
      return id;
    }
  }

  connectStart(index: number){
    var myOffer = this.items[index].data;
    this.peer.signal(JSON.parse(myOffer)); 
    this.peer.on('data', function(data){
      console.log('Received message: ', JSON.parse(data));
    }) 
    this.sendOk = true;
    this.off = false;
    this.ans = false;
  }

  sendMessage(){
    this.peer.send(JSON.stringify(this.yourMessage));
  }


  //End connection 
  endConn(){
    this.peer.sessionFinish();
  }

  public createAlert(data: string){
    const alert = this.alertCtrl.create({
      title: 'Your Message',
      subTitle: 'Please check your internet connection, and restart this application!',
      buttons: [
        {
          text: 'Ok',
          role: 'Ok',
          handler: () => {
          }
        }
      ]
    });
    alert.present(); 
  }

}
