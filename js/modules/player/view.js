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
 pData:null,
 qual:null,
 pausable:true,
 goOn:false,
 phase:{index:0,type:'base'},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({player:dat}).player;

  let ext=$(data.view.extTemplate);

  epIndex=app.get('epIndex');

  this.extTemplate=ext.length?_.template($(data.view.extTemplate).html()):()=>{};
  this.pData=[...data.data[epIndex]];
  this.qual=[...data.quality];
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
  this.listenTo(app.get('aggregator'),'page:state',this.freeze);

  //this.player.on('qualitySelected',()=>this.play({}));//TODO:needed?
 },
 freeze:function(){
  if(document.visibilityState==='hidden')
   this.pause();
 },
 setPausable:function(f){
  this.pausable=f;
 },/*
 jBack:function(){
  this.play({time:this.player.currentTime()-data.btnBack});
 },
 iBack:function(){
  let where=this.pData.filter(o=>o.repeatable&&o.start<this.player.currentTime()),
  what=where[where.length-1];

  if(where.length)
   this.play({time:what.start,clr:what});
 },
 iiBack:function(){
  let index=0;

  this.play({time:this.pData[index].start,clr:this.pData[index]});
 },*/
 changeSrc:function(src){
  let ind=this.qual.findIndex((o)=>matchMedia(o.width).matches);

  for(let i=0;i<this.qual.length;i++)
  {
   this.qual[i].src=src[i];
   if(i===ind)
    this.qual[i].selected=true;
  }

  this.player.src(this.qual);
 },
 prepare:function(){
  let touched={},
      firstTime=true;

  this.setElement(data.view.el);
  this.$el.append(this.extTemplate());

  this.changeSrc(this.pData[this.phase.index][this.phase.type].src);
  this.player.controlBar.addChild('QualitySelector');

  if(app.get('_dev'))
   this.player.muted(true);
  this.player.on('pause',()=>{

  });
  this.player.on('play',()=>{
   if(!app.get('_dev')&&!document.fullscreenElement&&document.documentElement.requestFullscreen)
    document.documentElement.requestFullscreen();
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
   if(this.phase.type==='base')
   {
    this.pData[this.phase.index][this.phase.type].timecodes.forEach((o)=>{
     if((o.start<0?curr>this.player.duration()+o.start:curr>o.start)&&!o.invoked)
     {
      app.get('aggregator').trigger('player:interactive',{goOn:this.goOn,phase:this.phase,timecodeData:o});
      o.invoked=true;
     }
    });
   }
  });

  this.player.on('ended',()=>{
   app.get('aggregator').trigger('player:interactive',{phase:this.phase});
   //app.get('aggregator').trigger('player:ended',{phase:this.phase});
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
  if(goOn)
   this.goOn=true;
  if(~time)
  {
   this.player.currentTime(time);
   /*this.pData.forEach((o)=>{
    if(goOn)
    {
     if(time>o.start)
      o.invoked=true;
    }else
    {
     if(time<o.start&&o.repeatable)
      o.invoked=false;
    }
   });*/
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