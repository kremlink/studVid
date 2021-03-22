import {data as dat} from './data.js';

let app,
    data=dat,
    epIndex;

export let LsMgr=Backbone.View.extend({
 //ini:{name:'',points:{ini:0},time:[-1,-1,-1,-1],pCurTime:[0,0,0,0],curTime:[0,0,0,0]},
 //ini:{name:'',chosen:[],timer:0,savedTime:0},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({ls:dat}).ls;

  epIndex=app.get('epIndex');

  if(!localStorage.getItem(data.name))
   localStorage.setItem(data.name,JSON.stringify({[epIndex]:{}}));

  this.listenTo(app.get('aggregator'),'player:ready',this.loaded);
 },
 loaded:function(){
  let ls=this.getData();

  app.get('aggregator').trigger('ls:current',ls[epIndex].savedTime);
 },
 resetData:function(){
  //return $.extend(true,{},this.ini);
 },
 getData:function(){
  return JSON.parse(localStorage.getItem(data.name))
 },
 setData:function(ls){
  localStorage.setItem(data.name,JSON.stringify(ls));
 }
});