import {Metrika} from '../metrika.js';
import {MainView} from '../main/view.js';
import {PlayerView} from '../player/view.js';

import {data as dat} from './data.js';
let app,
    data=dat,
    epIndex;

let events={};
events[`click ${data.events.start}`]='start';
events[`click ${data.events.goOn}`]='goOn';

export let Index=Backbone.View.extend({
 events:events,
 el:data.view.el,
 savedTime:0,
 main:null,
 initialize:function(opts){
  app=opts.app;
  data=app.configure({index:dat}).index;
  //might be needed someday
  app.set({dest:'objects.isMobile',object:matchMedia(data.mobViewport).matches});

  let mob=!matchMedia(data.minViewport).matches;

  epIndex=app.get('epIndex');

  new Metrika({app:app});
  this.main=new MainView({app:app});

  this.$el.toggleClass(data.view.tooSmallCls,mob);
  $(window).on('resize',_.debounce(()=>{
   mob=!matchMedia(data.minViewport).matches;
   this.$el.toggleClass(data.view.tooSmallCls,mob);
   //app.get('aggregator').trigger(mob?'player:pause':'player:play');//TODO: check if paused
  },200));
  document.addEventListener('contextmenu',e=>e.preventDefault());
  this.listenTo(app.get('aggregator'),'player:ready',this.loaded);
  //this.listenTo(app.get('aggregator'),'player:fs',this.fs);
  this.listenTo(app.get('aggregator'),'timer:show',this.timer);
  this.listenTo(app.get('aggregator'),'player:interactive',this.pause);
  this.listenTo(app.get('aggregator'),'player:play',this.play);
  this.listenTo(app.get('aggregator'),'ls:current',this.showGoOnBtn);

  this.prepare();
 },
 prepare:function(){//inconsistent loadeddata event with multiple videos
  let imgs,
      wait=[];

  for(let [x,y] of Object.entries(data.preload[epIndex]))
  {
   imgs=[];
   if(y.imgs){
    imgs=y.imgs.map(t=>x+t);
   }
   if(y.j)
   {
    for(let i=1;i<=y.j.length;i++)
     for(let j=1;j<=y.j[i-1];j++)
      for(let k=0;k<y.tmpl.length;k++)
       imgs.push(x+y.tmpl[k].replace('[i]',i).replace('[j]',j));
   }
   wait.push(app.get('lib.utils.imgsReady')({src:imgs}));
  }

  $.when(wait).then(()=>{
   new PlayerView({app:app});
  });
 },
 showGoOnBtn:function(savedTime){
  this.savedTime=savedTime;
  if(savedTime>0)
   this.$el.addClass(data.view.goOnCls);
 },
 goOn:function(){
  this.$el.addClass(data.view.startCls);
  app.get('aggregator').trigger('player:play',{time:this.savedTime,goOn:true});
  app.get('aggregator').trigger('timer:ini',true);
 },
 loaded:function(){
  this.$el.addClass(data.view.loadedCls);
 },
 timer:function(){
  this.$el.addClass(data.view.timerCls);
 },
 start:function(){
  this.$el.addClass(data.view.startCls);
  app.get('aggregator').trigger('player:play',{});
 },
 /*fs:function(f){
  this.$el.toggleClass(data.view.fsCls,f);
 },*/
 pause:function(timecodeData){
  if(!timecodeData.checkpoint)
   this.$el.addClass(data.view.pauseCls);
 },
 play:function(){
  this.$el.removeClass(data.view.pauseCls);
 }
});