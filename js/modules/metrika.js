import {app} from '../bf/base.js';
let data;

export let Metrika=Backbone.View.extend({
 initialize:function(opts){
  data=opts.app.configure({metrika:{name:null}}).metrika;

  this.listenTo(app.get('aggregator'),'metrika',this.goal);
 },
 goal:function(targ){
  if(ym)
   ym(data.name,'reachGoal',targ);else
   console.log('metrika is undefined');
 }
});