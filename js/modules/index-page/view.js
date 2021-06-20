import {Metrika} from '../metrika.js';
import {MainView} from '../main/view.js';
import {PlayerView} from '../player/view.js';

import {data as dat} from './data.js';
let app,
    data=dat,
    epIndex,
    lsMgr;

let events={};
events[`click ${data.events.start}`]='start';
events[`click ${data.events.goOn}`]='goOn';
events[`click ${data.events.clr}`]='clr';

export let Index=Backbone.View.extend({
 events:events,
 el:data.view.el,
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

  lsMgr=this.main.lsMgr;

  if(lsMgr.getData().data[epIndex].savedTime)
   this.$el.addClass(data.view.goOnCls);

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
  this.listenTo(app.get('aggregator'),'player:rewind',this.disable);

  this.prepare();
 },
 prepare:function(){//inconsistent loadeddata event with multiple videos
  let imgs,
      wait=[];

  if(data.preload[epIndex])
  {
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
  }

  $.when(wait).then(()=>{
   this.main.player=new PlayerView({app:app,lsMgr:lsMgr});
  });
 },
 goOn:function(){
  let ls=lsMgr.getData();

  this.$el.addClass(data.view.startCls);
  this.main.player.setGoOn(ls.data[epIndex].phase);
  this.main.player.play({time:ls.data[epIndex].savedTime});
  this.main.player.setStepsChoose();
 },
 clr:function(){
  lsMgr.resetData(true);
  this.$el.removeClass(data.view.goOnCls);
 },
 loaded:function(){
  this.$el.addClass(data.view.loadedCls);
 },
 disable:function(f){
  this.$el.toggleClass(data.view.nopeCls,f);
 },
 timer:function(){
  this.$el.addClass(data.view.timerCls);
 },
 start:function(){
  this.$el.addClass(data.view.startCls);
  lsMgr.resetData();
  this.main.player.setStepsChoose();
  this.main.player.play();
  app.get('aggregator').trigger('sound','btn');
 },
 pause:function(){
  let d=this.main.player.getData(),
      int;

  if(d.phase.type==='base')
  {
   int=~d.phase.index?
       d.pData[d.phase.step][d.phase.type].timecodes[d.phase.index].data.interactive:
       d.pData[d.phase.step][d.phase.type].end.data.interactive;
   if(int!=='Start'||int==='Start'&&!lsMgr.getData().user)
    this.$el.addClass(data.view.pauseCls);
  }else
  {
   this.$el.addClass(data.view.pauseCls);
  }
 },
 play:function(){
  this.$el.removeClass(data.view.pauseCls);
 }
});