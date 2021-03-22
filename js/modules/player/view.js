import {data as dat} from './data.js';

let app,
    data=dat,
    epIndex,
    events={};

events[`click ${data.events.jBack}`]='jBack';
events[`click ${data.events.iBack}`]='iBack';
events[`click ${data.events.iiBack}`]='iiBack';

export let PlayerView=Backbone.View.extend({
 events:events,
 el:data.view.el,
 extTemplate:null,
 timecodes:null,
 pausable:true,
 initialize:function(opts){
  app=opts.app;
  data=app.configure({player:dat}).player;

  let ext=$(data.view.extTemplate);

  epIndex=app.get('epIndex');

  this.extTemplate=ext.length?_.template($(data.view.extTemplate).html()):()=>{};
  this.timecodes=[...data.timecodes[epIndex]];
  this.player=videojs(this.el,{
   controlBar:{
    children:[
     "playToggle",
     "VolumePanel",
     "progressControl",
     "currentTimeDisplay",
     "timeDivider",
     "durationDisplay"
    ]
   },
   plugins:{

   }
  },()=>{
   this.prepare();
  });
  this.listenTo(app.get('aggregator'),'main:toggle',this.setPausable);
  this.listenTo(app.get('aggregator'),'player:play',this.play);
  this.listenTo(app.get('aggregator'),'player:pause',this.pause);
 },
 setPausable:function(f){
  this.pausable=f;
 },
 jBack:function(){
  this.play({time:this.player.currentTime()-data.btnBack});
 },
 iBack:function(){
  let where=this.timecodes.filter(o=>o.repeatable&&o.start<this.player.currentTime()),
  what=where[where.length-1];

  if(where.length)
   this.play({time:what.start,clr:what});
 },
 iiBack:function(){
  let index=0;

  this.play({time:this.timecodes[index].start,clr:this.timecodes[index]});
 },
 prepare:function(){
  let touched={},
      firstTime=true;

  this.setElement(data.view.el);
  this.$el.append(this.extTemplate());

  data.quality[epIndex].unshift({selected:true,label:'auto',src:data.quality[epIndex][data.quality[epIndex].findIndex((o)=>matchMedia(o.width).matches)].src+'?'+Date.now()});
  this.player.controlBar.addChild('QualitySelector');
  this.player.src(data.quality[epIndex]);

  if(app.get('_dev'))
   this.player.muted(true);
  this.player.on('pause',()=>{

  });
  this.player.on('play',()=>{
   if(!app.get('_dev')&&!document.fullscreenElement&&document.documentElement.requestFullscreen)
    document.documentElement.requestFullscreen();
  });
  this.player.on('ended',()=>{
   app.get('aggregator').trigger('player:ended',{cb:()=>location.href=data.redirect[epIndex]});
  });

  this.player.on('touchstart',e=>{
   touched.x=e.touches[0].pageX;
   touched.y=e.touches[0].pageY;
  });
  this.player.on('touchend',e=>{
   if(Math.sqrt((touched.x-e.changedTouches[0].pageX)*(touched.x-e.changedTouches[0].pageX)+(touched.y-e.changedTouches[0].pageY)*(touched.y-e.changedTouches[0].pageY))<data.touchPlayRadius)
   {
    if(e.target.nodeName==='VIDEO')
     this.playPauseByCtrls();
   }
  });

  this.player.on('timeupdate',()=>{
   let curr=this.player.currentTime();

   app.get('aggregator').trigger('player:timeupdate',curr);
   this.timecodes.forEach((o)=>{
    if((o.start<0?curr>this.player.duration()+o.start:curr>o.start)&&!o.invoked)
    {
     app.get('aggregator').trigger('player:interactive',o);
     o.invoked=true;
    }
   });
  });

  this.player.on('loadedmetadata',()=>{
   if(firstTime)
    app.get('aggregator').trigger('player:ready');
   firstTime=false;
  });

  $(document).on('keypress',(e)=>{
   if(e.which===32&&this.pausable)
    this.playPauseByCtrls();
  });
 },
 playPauseByCtrls:function(){
  if(this.player.paused())
  {
   this.player.play();
  }else
  {
   if(!this.player.seeking())
    this.player.pause();
  }
 },
 play:function({time=-1,clr=null,goOn=false}){
  if(~time)
  {
   this.player.currentTime(time);
   this.timecodes.forEach((o)=>{
    if(goOn)
    {
     if(time>o.start)
      o.invoked=true;
    }else
    {
     if(time<o.start&&o.repeatable)
      o.invoked=false;
    }
   });
   if(clr)
    clr.invoked=false;
  }
  if(this.player.paused())
   this.player.play();
 },
 pause:function(){
  if(!this.player.seeking())
   this.player.pause();
 }
});