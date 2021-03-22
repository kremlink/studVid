import {data as dat} from './data.js';

let app,
    data=dat;

export let BaseIntView=Backbone.View.extend({
 data:null,
 initialize:function(opts){
  app=opts.app;
  this.data=opts.data;

  this.toggle(true);

  $(data.theBtn).on('click',()=>{
   app.get('aggregator').trigger('sound','btn');
  });
 },
 away:function(failed=false,opts={}){
  app.get('aggregator').trigger('interactive:toggle',{show:false,failed:failed,opts:opts});
  this.toggle(false);
 },
 toggle:function(f){
  this.$el.toggleClass(this.data.view.shownCls,f);
 }
});