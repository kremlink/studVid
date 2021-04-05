import {data as dat} from './data.js';
let app,
    data=dat,
    epIndex,
    lsMgr;

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

  lsMgr=opts.lsMgr;

  epIndex=app.get('epIndex');

  this.$timer=this.$(data.view.txt).text(s2t(this.timer));

  this.listenTo(app.get('aggregator'),'player:ended',this.ended);
  this.listenTo(app.get('aggregator'),'timer:update',this.change);
  this.listenTo(app.get('aggregator'),'timer:ini',this.ini);
  this.listenTo(app.get('aggregator'),'player:timeupdate',throttle);
  this.listenTo(app.get('aggregator'),'page:state',this.freeze);
 },
 freeze:function(){
  if(document.visibilityState==='hidden')
  {
   clearInterval(this.timerInt);
  }else
  {
   if(this.timerInt)
    this.start();
  }
 },
 ini:function(goOn=false){
  let ls=lsMgr.getData();

  if(!ls.data[epIndex].timer)
   ls.data[epIndex].timer=0;
  if(!ls.data[epIndex].savedTime)
   ls.data[epIndex].savedTime=0;

  this.timer=ls.data[epIndex].timer;

  if(goOn)
  {
   app.get('aggregator').trigger('timer:show');
  }else
  {
   ls.data[epIndex].savedTime=0;
   lsMgr.setData(ls);
  }

  this.start();

  this.$timer.text(s2t(this.timer));
 },
 start:function(){
  this.timerInt=setInterval(()=>{
   let t=this.timer+(++this.ctr);

   this.$timer.text(s2t(t));
   this.tick(t);
  },1000);
 },
 saveCurTime:function(savedTime){
  //ignore calls afted flag is set
  if(!this.endFlag)
  {
   let ls=lsMgr.getData();

   ls.data[epIndex].savedTime=savedTime;
   lsMgr.setData(ls);
  }
 },
 tick:function(t){
  let ls=lsMgr.getData();

  ls.data[epIndex].timer=t;
  lsMgr.setData(ls);
 }
});