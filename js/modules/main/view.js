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
    epIndex;

export let MainView=Backbone.View.extend({
 events:events,
 el:data.view.el,
 interactives:{},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({main:dat}).main;

  epIndex=app.get('epIndex');

  this.lsMgr=new LsMgr({app:app});

  this.listenTo(app.get('aggregator'),'interactive:toggle',this.toggle);
  this.listenTo(app.get('aggregator'),'player:back',this.hide);
  this.listenTo(app.get('aggregator'),'player:interactive',this.step);

  $(window).on('visibilitychange pagehide',()=>app.get('aggregator').trigger('page:state'));

  new SoundMgr({app:app});

  new TimerView({app:app,lsMgr:this.lsMgr});
  new BoardMgr({app:app,lsMgr:this.lsMgr});

  /*app.get('aggregator').trigger('board:score',{what:'test',points:5});*/
 },
 hide:function(){
  this.$el.removeClass(data.view.shownCls);
  app.get('aggregator').trigger('player:rewind',false);
  for(let x of Object.values(this.interactives))
   x.toggle(false);
 },
 toggle:function({show:show,correct:correct,opts}){
  let d=this.player.getData(),
      int;

  app.get('aggregator').trigger('main:toggle',!show);

  if(show)
  {
   this.player.pause();
  }else
  {
   if(d.phase.type==='base')
   {
    int=d.pData[d.phase.step][d.phase.type].timecodes[d.phase.index].data.interactive;
    if(int==='Start')
    {
     this.player.play();
    }else//choose pop
    {
     this.player.changeData({index:opts.index,type:'choose',correct:correct});
     this.player.changeSrc(d.pData[d.phase.step][d.phase.type][d.phase.index].src);
     this.player.play({time:correct?0:5});//TODO: remove param after
    }
   }else
   {
    if(d.phase.correct)
    {
     if(d.phase.step===d.pData.length-1)
     {
      console.log('redirect to clr page');
     }else
     {
      this.player.changeData({step:d.phase.step+1,index:0,type:'base',correct:false});
      this.player.changeSrc(d.pData[d.phase.step][d.phase.type].src);
      this.player.play();
      this.player.setStepsChoose();
     }
    }else
    {
     this.player.changeData({type:'base',rewind:true});
     this.player.changeSrc(d.pData[d.phase.step][d.phase.type].src);
     this.player.play({time:d.pData[d.phase.step][d.phase.type].rewindTime});
     app.get('aggregator').trigger('player:rewind',true);
    }
   }
  }

  this.$el.toggleClass(data.view.shownCls,show);
 },
 step:function(){
  let d=this.player.getData(),
      tItem,
      int;

  if(d.phase.type==='base')
  {
   tItem=d.pData[d.phase.step][d.phase.type].timecodes[d.phase.index];

   int=tItem.data.interactive;

   let ls=this.lsMgr.getData();

   if(int!=='Start'||int==='Start'&&!ls.user.name)
   {
    if(int==='Start')
     app.get('aggregator').trigger('timer:ini');
    if(!this.interactives[int])
     this.interactives[int]=new Interactives[int]({app:app,data:d});else
     this.interactives[int].toggle(true);
    this.toggle({show:true});
   }

   if(int!=='Start')
   {
    app.get('aggregator').trigger('player:rewind',false);
    this.player.changeData({rewind:false});
   }
  }else
  {
   this.toggle({show:true});

   int=d.pData[d.phase.step][d.phase.type][d.phase.index].data.interactive;
   if(!this.interactives[int])
    this.interactives[int]=new Interactives[int]({app:app,data:d});else
    this.interactives[int].toggle(true);

    if(d.phase.step===d.pData.length-1&&d.phase.correct)
     app.get('aggregator').trigger('board:save');
  }
 }
});