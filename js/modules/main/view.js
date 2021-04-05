import {SoundMgr} from '../soundMgr/view.js';
import {BoardMgr} from '../boardMgr/view.js';
import {LsMgr} from '../lsMgr/view.js';

import {StartView} from '../start/view.js';
import {UPopView} from '../u-pop/view.js';

import {TimerView} from '../timer/view.js';

import {data as dat} from './data.js';

let Interactives={
 Start:StartView
};

let app,
    data=dat,
    events={},
    lsMgr;

export let MainView=Backbone.View.extend({
 events:events,
 el:data.view.el,
 timecodeData:null,
 delayedPTimer:null,
 initialize:function(opts){
  app=opts.app;
  data=app.configure({main:dat}).main;

  lsMgr=new LsMgr({app:app});

  this.listenTo(app.get('aggregator'),'interactive:toggle',this.toggle);
  this.listenTo(app.get('aggregator'),'player:interactive',this.step);

  $(window).on('visibilitychange pagehide',()=>app.get('aggregator').trigger('page:state'));

  new SoundMgr({app:app});

  new TimerView({app:app,lsMgr:lsMgr});
  new BoardMgr({app:app,lsMgr:lsMgr});

  /*app.get('aggregator').trigger('board:score',{what:'test',points:5});*/
 },
 getLsMgr:function(){
  return lsMgr;
 },
 toggle:function({show:show,failed:failed,opts:opts}){
  app.get('aggregator').trigger('main:toggle',!show);

  if(show)
  {
   if(~this.timecodeData.delayedPause)
    this.delayedPTimer=setTimeout(()=>app.get('aggregator').trigger('player:pause'),this.timecodeData.delayedPause?this.timecodeData.delayedPause*1000:0);

   /*if(this.timecodeData.delayedPause)
    this.delayedPTimer=setTimeout(()=>app.get('aggregator').trigger('player:pause'),this.timecodeData.delayedPause*1000);else
    app.get('aggregator').trigger('player:pause');*/
  }else
  {
   clearTimeout(this.delayedPTimer);
   //setTimeout(()=>app.get('aggregator').trigger('player:pause'),data.time);else
   app.get('aggregator').trigger('player:play',{time:opts.end?this.timecodeData.data[opts.end]:
     (!('end' in this.timecodeData)?-1:this.timecodeData.end)});
  }

  this.$el.toggleClass(this.timecodeData.noAnim?data.view.noAnimCls:data.view.shownCls,show);
  if(failed)
   app.get('aggregator').trigger('timer:update',this.timecodeData);
 },
 step:function({phase:phase,timecodeData:timecodeData}){
  this.timecodeData=timecodeData;

  if(timecodeData.iniTimer)
  {
   app.get('aggregator').trigger('timer:ini');
   app.get('aggregator').trigger('timer:show');
  }

  if(timecodeData.checkpoint)
  {
   app.get('aggregator').trigger('timer:update',timecodeData);
  }else
  {
   if(timecodeData.data.interactive!=='Start'||timecodeData.data.interactive==='Start'&&!lsMgr.getData().user.name)
   {
    if(typeof timecodeData.data.interactive==='string')
     timecodeData.data.interactive=new Interactives[timecodeData.data.interactive]({app:app,timecodeData:timecodeData});else
     timecodeData.data.interactive.toggle(true);
    this.toggle({show:true});
   }
  }
 }
});