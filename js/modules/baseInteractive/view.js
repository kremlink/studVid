import {data as dat} from './data.js';

let app,
    events={},
    data=dat;

events[`click.base ${data.events.click}`]='btnClick';
events[`mouseenter.base ${data.events.click}`]='btnHover';

export let BaseIntView=Backbone.View.extend({
 events:events,
 dat:null,
 initialize:function(opts){
  app=opts.app;
  this.dat=opts.data;

  this.toggle(true);
 },
 btnClick:function(){
  app.get('aggregator').trigger('sound','btn');
 },
 btnHover:function(){
  app.get('aggregator').trigger('sound','btn-h');
 },
 away:function(correct=false,opts){
  app.get('aggregator').trigger('interactive:toggle',{show:false,correct:correct,opts:opts});
  this.toggle(false);
 },
 toggle:function(f){
  this.$el.toggleClass(this.dat.view.shownCls,f);
  //app.get('aggregator').trigger(f?'sound':'unsound','bg')
 }
});