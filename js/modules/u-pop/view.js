import {BaseIntView} from '../baseInteractive/view.js';
import {data as dat} from './data.js';

let app,
    data=dat,
    events={},
    epIndex;

events[`click ${data.events.click}`]='click';

export let UPopView=BaseIntView.extend({
 events:events,
 el:data.view.el,
 template:_.template($(data.view.template).html()),
 initialize:function(opts){
  app=opts.app;
  data=app.configure({start:dat}).start;
  epIndex=app.get('epIndex');

  this.data=opts.data;

  BaseIntView.prototype.initialize.apply(this,[{
   app:app,
   data:data
  }]);
 },

 toggle:function(f){
  let pData=this.data.pData,
      phase=this.data.phase,
      what;

  if(f)
  {
   what=pData[phase.step][phase.type];
   this.$el.html(this.template({
    cls:phase.type==='base'?what.timecodes[phase.index].data.conf.cls:what[phase.index].data.conf.cls,
    ep:epIndex,
    step:phase.step,
    choose:phase.type==='base'?pData[phase.step]['choose'].length:0,
    chosen:phase.type==='choose'?phase.index:0,
   }));
  }

  BaseIntView.prototype.toggle.apply(this,arguments);
 },
 click:function(e){
  let corr=false,
      ind=$(e.currentTarget).index();
  /*if(this.opts.phase.type==='base')
   app.get('aggregator').trigger('board:user',{step:this.opts.phase.index,index:$(e.target).index()});else
   app.get('aggregator').trigger('player:src',{});*/

  if(this.data.phase.type==='base')
  {
   if(this.data.pData[this.data.phase.step]['choose'][ind].data.conf.correct)
    corr=true;
  }

  this.away(corr,{index:ind});
  //app.get('aggregator').trigger('board:score',{what:'start-two',points:corr?30:-10});
  //this.away(false,corr?{end:'endGood'}:{});
  //app.get('aggregator').trigger('sound',corr?'plus':'minus');
 }
});