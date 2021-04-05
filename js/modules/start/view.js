import {BaseIntView} from '../baseInteractive/view.js';
import {data as dat} from './data.js';

let app,
    data=dat,
    events={};

events[`click ${data.events.click}`]='click';

export let StartView=BaseIntView.extend({
 events:events,
 el:data.view.el,
 initialize:function(opts){
  app=opts.app;
  data=app.configure({start:dat}).start;

  this.opts=opts;
  //this.setElement(data.view.el);

  BaseIntView.prototype.initialize.apply(this,[{
   app:app,
   data:data//,
   //pData:opts.pData
  }]);
 },

 toggle:function(f){
  if(f)
  {
   this.$brdName=this.$(data.view.$brdName);
   setTimeout(()=>this.$brdName.focus(),200);
  }

  BaseIntView.prototype.toggle.apply(this,arguments);
 },
 click:function(){
  app.get('aggregator').trigger('board:user',{name:this.$brdName.val().trim()});
  this.away();
  //app.get('aggregator').trigger('board:score',{what:'start-two',points:corr?30:-10});
  //this.away(false,corr?{end:'endGood'}:{});
  //app.get('aggregator').trigger('sound',corr?'plus':'minus');
 }
});