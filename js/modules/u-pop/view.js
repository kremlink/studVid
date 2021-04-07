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

  this.opts=opts;

  BaseIntView.prototype.initialize.apply(this,[{
   app:app,
   data:data
  }]);
 },

 toggle:function(f){
  if(f)
  {
   this.$el.html(this.template({
    cls:this.opts.pData[this.opts.phase.type].timecodes[this.opts.phase.index].data.conf.cls,
    ep:epIndex,
    step:this.opts.phase.step,
    choose:this.opts.phase.type==='base'?this.opts.pData['choose'].length:0,
    chosen:this.opts.phase.type==='choose'?this.opts.phase.index:0,
   }));
  }

  BaseIntView.prototype.toggle.apply(this,arguments);
 },
 click:function(e){
  if(this.opts.phase.type==='base')
   app.get('aggregator').trigger('board:user',{step:this.opts.phase.index,index:$(e.target).index()});else
   app.get('aggregator').trigger('player:src',{});
  this.away(this.correct,{});
  //app.get('aggregator').trigger('board:score',{what:'start-two',points:corr?30:-10});
  //this.away(false,corr?{end:'endGood'}:{});
  //app.get('aggregator').trigger('sound',corr?'plus':'minus');
 }
});