import {SoundMgr} from '../soundMgr/view.js';
import {BoardMgr} from '../boardMgr/view.js';
import {LsMgr} from '../lsMgr/view.js';

import {StartView} from '../start/view.js';
import {UPopView} from '../u-pop/view.js';

import {TimerView} from '../timer/view.js';

import {data as dat} from './data.js';

let Interactives={
 Start:StartView,
 UPop:UPopView
};

let app,
    data=dat,
    events={},
    lsMgr;

export let MainView=Backbone.View.extend({
 events:events,
 el:data.view.el,
 pData:null,
 phase:null,
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
   app.get('aggregator').trigger('player:pause');
  }else
  {
   app.get('aggregator').trigger('player:play',{time:opts.end?this.pData[this.phase.type].timecodes[this.phase.index].data[opts.end]:
     (!('end' in this.pData[this.phase.type].timecodes[this.phase.index])?-1:this.pData[this.phase.type].timecodes.end)});
  }

  this.$el.toggleClass(this.pData[this.phase.type].timecodes[this.phase.index].noAnim?data.view.noAnimCls:data.view.shownCls,show);
 },
 step:function({goOn:goOn,phase:phase,pData:pData}){
  this.pData=pData;
  this.phase=phase;

  if(phase.type==='base'&&pData[phase.type].timecodes[phase.index].iniTimer)
  {
   if(!goOn)
    app.get('aggregator').trigger('timer:ini');
   app.get('aggregator').trigger('timer:show');
  }

  //app.get('aggregator').trigger('timer:update',timecodeData);//TODO:event to set save checkpoints
  if(phase.type==='base')
  {
   if(pData[phase.type].timecodes[phase.index].data.interactive!=='Start'||pData[phase.type].timecodes[phase.index].data.interactive==='Start'&&!lsMgr.getData().user.name)
   {
    if(typeof pData[phase.type].timecodes[phase.index].data.interactive==='string')
     pData[phase.type].timecodes[phase.index].data.interactive=new Interactives[pData[phase.type].timecodes[phase.index].data.interactive]
     ({app:app,pData:pData,phase:phase});else
     pData[phase.type].timecodes[phase.index].data.interactive.toggle(true);
    this.toggle({show:true});
   }
  }
 }
});