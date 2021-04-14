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

  BaseIntView.prototype.initialize.apply(this,[{
   app:app,
   data:data
  }]);

  this.$inp=this.$(data.view.$inp).on('focus',function(){
   $(this).removeClass(data.view.errCls);
  });
 },
 toggle:function(f){
  if(f)
   setTimeout(()=>this.$inp.eq(0).focus(),200);

  BaseIntView.prototype.toggle.apply(this,arguments);
 },
 click:function(){
  if(app.get('lib.utils.form.validate')({check:this.$inp,error:(obj)=>obj.addClass(data.view.errCls)}))
  {
   app.get('aggregator').trigger('board:user',Object.fromEntries(this.$inp.serializeArray().map(({name,value})=>[name,value])));
   this.away();
  }else
  {
   console.log('err');
  }
  //app.get('aggregator').trigger('board:score',{what:'start-two',points:corr?30:-10});
  //this.away(false,corr?{end:'endGood'}:{});
  //app.get('aggregator').trigger('sound',corr?'plus':'minus');
 }
});