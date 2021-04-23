import {data as dat} from './data.js';

let app,
    data=dat;

export let SoundMgr=Backbone.View.extend({
 sounds:{},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({sound:dat}).sound;

  this.template=_.template(data.template);

  let body=$('body');

  this.listenTo(app.get('aggregator'),'sound',this.play);
  this.listenTo(app.get('aggregator'),'unsound',this.pause);

  for(let [x,y] of Object.entries(data.src))
   body.append(this.sounds[x]=$(this.template(y))[0]);
 },
 play:function(name){
  this.sounds[name].currentTime=0;
  if(!app.get('_dev-sound'))
   this.sounds[name]['play']();
 },
 pause:function(name){
  this.sounds[name]['pause']();
 }
});