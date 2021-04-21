import {data as dat} from './data.js';

let app,
    data=dat,
    epIndex,
    events={},
    lsMgr;

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
 firstTime:true,
 phase:{step:0,type:'base',index:0,correct:false,rewind:false},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({player:dat}).player;

  let ext=$(data.view.extTemplate);

  epIndex=app.get('epIndex');
  lsMgr=opts.lsMgr;

  this.$btns=$(data.view.$btns);

  this.extTemplate=ext.length?_.template($(data.view.extTemplate).html()):()=>{};
  this.pData=$.extend(true,[],data.data[epIndex]);
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
  this.listenTo(app.get('aggregator'),'page:state',this.freeze);

  this.player.on('qualitySelected',()=>!this.firstTime?this.play({}):'');
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
 },*/
 iiBack:function(e){
  let index=$(e.currentTarget).index();

  for(let i=index;i<this.pData.length;i++)
  {
   this.pData[i]['base'].timecodes.forEach((o)=>{
    o.invoked=false;
   });
  }
  app.get('aggregator').trigger('player:back');
  this.changeData({step:index,index:0,type:'base'});
  this.changeSrc(this.pData[this.phase.step][this.phase.type].src);
  this.player.play();
 },
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
 getData:function(){
  return {
   phase:this.phase,
   pData:this.pData
  };
 },
 changeData:function(opts){
  for(let [x,y] of Object.entries(opts))
   this.phase[x]=y;
 },
 setStepsChoose:function(){
  let choose=(()=>{
       let arr=[];

       for (let i=0;i<this.pData.length;i++)
        arr[i]=this.phase.step>=i;

       return arr;
      })();

  this.$btns.html(this.extTemplate({choose:choose}));
 },
 prepare:function(){
  let touched={};

  this.setElement(data.view.el);
  this.$el.append(this.$btns);

  this.changeSrc(this.pData[this.phase.step][this.phase.type].src);

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
   if(Math.sqrt((touched.x-e.changedTouches[0].pageX)*(touched.x-e.changedTouches[0].pageX)+
       (touched.y-e.changedTouches[0].pageY)*(touched.y-e.changedTouches[0].pageY))<data.touchPlayRadius)
   {
    if(e.target.nodeName==='VIDEO')
     this.playPauseByCtrls();
   }
  });

  this.player.on('timeupdate',()=>{
   let curr=this.player.currentTime();

   if(this.phase.type==='base')
   {
    this.pData[this.phase.step][this.phase.type].timecodes.forEach((o,i)=>{
     if((o.start<0?curr>this.player.duration()+o.start:curr>o.start)&&!o.invoked)
     {
      this.changeData({index:i});

      app.get('aggregator').trigger('player:interactive');
      o.invoked=true;
     }
    });
   }

   app.get('aggregator').trigger('player:timeupdate',{currTime:curr,phase:this.phase});
  });

  this.player.on('ended',()=>{
   let timecodes=this.pData[this.phase.step]['base'].timecodes;

   if(this.phase.type==='choose')
   {
    app.get('aggregator').trigger('player:interactive',{});
    timecodes[timecodes.length-1].invoked=true;
   }
   if(this.phase.type==='base')
   {
    timecodes[timecodes.length-1].invoked=false;
    this.play({time:timecodes[timecodes.length-1].start});
   }
  });

  this.player.on('loadedmetadata',()=>{
   if(this.firstTime)
    app.get('aggregator').trigger('player:ready');
   this.firstTime=false;
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
 play:function({time=-1,phase=null}={}){
  if(phase)
  {
   this.phase=phase;
   if(this.phase.type==='base')
    this.changeSrc(this.pData[this.phase.step][this.phase.type].src);else
    this.changeSrc(this.pData[this.phase.step][this.phase.type][this.phase.index].src);

   if(this.phase.rewind)
   {
    let timecodes=this.pData[this.phase.step]['base'].timecodes;

    time=timecodes[timecodes.length-1].start;
   }
  }

  if(~time)
   this.player.currentTime(time);
  if(this.player.paused())
  {
   this.player.play();
   app.get('aggregator').trigger('player:play');
  }
 },
 pause:function(){
  if(!this.player.seeking())
   this.player.pause();
 }
});