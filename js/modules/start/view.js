import {BaseIntView} from '../baseInteractive/view.js';
import {data as dat} from './data.js';

let get5RandomString=()=>{
 const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 let result='';

 for(let i=0;i<5;i++)
  result+=randomChars.charAt(Math.floor(Math.random()*randomChars.length));
 return result;
}

let app,
    data=dat,
    events={};

events[`click ${data.events.click}`]='click';

export let StartView=BaseIntView.extend({
 events:function(){
  return _.extend({},BaseIntView.prototype.events,events);
 },
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

  this.$(data.view.$date).text((new Date()).toLocaleDateString('en-GB'));
  this.$(data.view.$rand).text(get5RandomString()+'-'+get5RandomString());
 },
 toggle:function(f){
  if(f)
   setTimeout(()=>this.$inp.eq(0).focus(),200);

  BaseIntView.prototype.toggle.apply(this,arguments);
 },
 click:function(){
  if(app.get('lib.utils.form.validate')({check:this.$inp,data:data.view.vData,error:(obj)=>obj.addClass(data.view.errCls)}))
  {
   app.get('aggregator').trigger('board:user',Object.fromEntries(this.$inp.serializeArray().map(({name,value})=>[name,value])));
   this.away();
  }
 }
});