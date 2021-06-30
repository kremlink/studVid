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
 goOn:false,
 currTime:-1,//set when rewind (currentTime changes together with src)
 phase:{step:0,type:'base',index:-1,rewind:false},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({player:dat}).player;

  let ext=$(data.view.extTemplate);

  epIndex=app.get('epIndex');
  lsMgr=opts.lsMgr;

  this.$extra=$(data.view.$extra);
  this.$smooth=$(data.view.$smooth);

  this.extTemplate=ext.length?_.template($(data.view.extTemplate).html()):()=>{};
  this.pData=$.extend(true,[],data.data[epIndex]);
  this.qual=[...data.quality];
  this.player=videojs(this.el,{
   controlBar:{
    children:{
     playToggle:{},
     volumePanel:{inline:false},
     progressControl:{},
     currentTimeDisplay:{},
     timeDivider:{},
     durationDisplay:{}
    }
   },
   plugins:{

   }/*,
   userActions:{
    hotkeys:{
     playPauseKey:...
    }
   }*/
  },()=>{
   this.prepare();
  });
  this.listenTo(app.get('aggregator'),'main:toggle',this.setPausable);
  this.listenTo(app.get('aggregator'),'page:state',this.freeze);

  /*this.player.on('qualitySelected',()=>{

       //!this.firstTime
      });*/
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
  this.changeData({step:index,index:-1,type:'base'});
  this.changeSrc(this.pData[this.phase.step][this.phase.type].src);
  this.setStepsChoose();
  this.setPausable(true);
 },
 changeSrc:function(src,time=-1){
  let ind=this.qual.findIndex((o)=>matchMedia(o.width).matches);

  this.currTime=time;

  for(let i=0;i<this.qual.length;i++)
  {
   this.qual[i].src=_.template(data.srcData.tmpl)({spec:data.srcData.spec[i],src:src});
   if(i===ind)
    this.qual[i].selected=true;
  }
  //if(this.phase.goOn)
   //this.player.src(this.qual);else
   this.smoothify(()=>this.player.src(this.qual));
 },
 smoothify:function(changeSrc){
  let ctx=this.$smooth[0].getContext('2d'),
      cW,
      cH,
      iW=this.$el.find('video')[0].videoWidth,
      iH=this.$el.find('video')[0].videoHeight,
      r;

  ctx.clearRect(0,0,10000,10000);
  this.$smooth.removeAttr('width').removeAttr('height');
  cW=this.$smooth.width();
  cH=this.$smooth.height();
  r=Math.min(cW/iW,cH/iH);
  this.$smooth.attr({width:cW,height:cH});
  ctx.drawImage(this.$el.find('video')[0],0,0,iW,iH,(cW-iW*r)/2,(cH-iH*r)/2,iW*r,iH*r);
  this.$smooth.addClass(data.view.shownCls);
  setTimeout(()=>{
   changeSrc();
  },50);
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

  this.$extra.html(this.extTemplate({choose:choose}));
 },
 setGoOn:function(phase){
  this.phase=phase;
  this.goOn=true;
  app.get('aggregator').trigger('player:goOn');
 },
 prepare:function(){
  let touched={};

  this.setElement(data.view.el);
  this.$el.append(this.$extra).append(this.$smooth);

  this.changeSrc(this.pData[this.phase.step][this.phase.type].src);

  this.player.controlBar.addChild('QualitySelector');

  if(app.get('_dev-player'))
   this.player.muted(true);

  this.player.on('play',()=>{
   if(!app.get('_dev-player')&&!document.fullscreenElement&&document.documentElement.requestFullscreen)
    document.documentElement.requestFullscreen();
   if(!this.pausable)
    this.pause();
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
   if(this.phase.type==='base')
   {
    this.changeData({index:-1});
    app.get('aggregator').trigger('player:interactive');
   }
   if(this.phase.type==='choose')
   {
    app.get('aggregator').trigger('player:interactive');
   }
   /*let timecodes=this.pData[this.phase.step]['base'].timecodes;

   if(this.phase.type==='choose')
   {
    app.get('aggregator').trigger('player:interactive',{});
    timecodes[timecodes.length-1].invoked=true;
   }
   if(this.phase.type==='base')
   {
    timecodes[timecodes.length-1].invoked=false;
    this.play({time:timecodes[timecodes.length-1].start});
   }*/
  });

  this.player.on('loadedmetadata',()=>{
   //console.log(this.currTime,this.firstTime);
   if(this.firstTime)
    app.get('aggregator').trigger('player:ready');
   if(!~this.currTime||this.currTime==='end'||this.goOn)
   {
    this.goOn=false;
    this.$smooth.removeClass(data.view.shownCls);
    if(this.currTime==='end')
     this.currTime=this.player.duration();
    //console.log(this.currTime);
    if(!this.firstTime)
     this.play();
   }
   this.firstTime=false;
  });

  this.player.on('seeked',()=>{
   /*if(~this.currTime)
   {
    this.$smooth.removeClass(data.view.shownCls);
    this.currTime=-1;
   }*/
  });

  $(document).on('keypress',(e)=>{
   if(this.player.controlBar.playToggle.el()!==document.activeElement&&e.which===32&&this.pausable)
    this.playPauseByCtrls();
  });
 },
 playPauseByCtrls:function(){
  if(this.player.paused())
   this.play();else
   this.pause();
 },
 play:function({time=-1}={}){/*if(goOnPhase)debugger;*/
  if(~this.currTime)
   time=this.currTime;
  /*console.log(typeof time,time);
  if(typeof time==='string')
   debugger;*/
  if(this.goOn)
  {
   /*if(this.phase.rewind)
   {
    let timecodes=this.pData[this.phase.step]['base'].timecodes;

    time=timecodes[timecodes.length-1].start;
   }*/
   if(this.phase.rewind)
   {
    this.changeData({rewind:false,type:'base',index:-1});
    time='end';
   }
   if(this.phase.type==='base')
    this.changeSrc(this.pData[this.phase.step][this.phase.type].src,time);else
    this.changeSrc(this.pData[this.phase.step][this.phase.type][this.phase.index].src,time);
  }

  if(!this.goOn)
  {
   if(~time)
    this.player.currentTime(time);
   this.player.play();
   app.get('aggregator').trigger('player:play');
  }
 },
 pause:function(){
  if(!this.player.seeking())
   this.player.pause();
 }
});