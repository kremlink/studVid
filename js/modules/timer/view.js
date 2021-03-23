import {data as dat} from './data.js';
let app,
    data=dat;

let s2t=function (t){
 return (new Date(t%86400*1000)).toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/,(s,p1,p2,p3)=>{
  return `${parseInt(t/86400)*24+parseInt(p1)}:${p2}:${p3}`;
 });
};

export let TimerView=Backbone.View.extend({
 el:data.view.el,
 done:false,
 timerInt:null,
 timer:null,
 ctr:0,
 endFlag:false,
 initialize:function(opts){
  app=opts.app;
  data=app.configure({timer:dat}).timer;

  let throttle=_.throttle((curr)=>this.saveCurTime(curr),data.throttle,{leading:false})

  this.lsMgr=opts.lsMgr;

  this.$timer=this.$(data.view.txt).text(s2t(this.timer));

  this.listenTo(app.get('aggregator'),'player:ended',this.ended);
  this.listenTo(app.get('aggregator'),'timer:update',this.change);
  this.listenTo(app.get('aggregator'),'timer:ini',this.ini);
  this.listenTo(app.get('aggregator'),'player:timeupdate',throttle);
 },
 ini:function(goOn=false){
  let ls=this.lsMgr.getData();

  if(!ls.data.timer)
   ls.data.timer=0;
  if(!ls.data.savedTime)
   ls.data.savedTime=0;

  this.timer=ls.data.timer;

  if(goOn)
  {
   app.get('aggregator').trigger('timer:show');
  }else
  {
   ls.data.savedTime=0;
   this.lsMgr.setData(ls);
  }

  this.timerInt=setInterval(()=>{
   let t=this.timer+(++this.ctr);

   this.$timer.text(s2t(t));
   this.tick(t);
  },1000);

  this.$timer.text(s2t(this.timer));
 },
 saveCurTime:function(savedTime){
  //ignore calls afted flag is set
  if(!this.endFlag)
  {
   let ls=this.lsMgr.getData();

   ls.data.savedTime=savedTime;
   this.lsMgr.setData(ls);
  }
 },
 tick:function(t){
  let ls=this.lsMgr.getData();

  ls.data.timer=t;
  this.lsMgr.setData(ls);
 }
});