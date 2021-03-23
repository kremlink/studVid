import {data as dat} from './data.js';

let app,
    data=dat;

export let LsMgr=Backbone.View.extend({
 //ini:{name:'',chosen:[],timer:0,savedTime:0},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({ls:dat}).ls;

  if(!localStorage.getItem(data.name))
   this.resetData();

  this.listenTo(app.get('aggregator'),'player:ready',this.loaded);
 },
 loaded:function(){
  let ls=this.getData();

  app.get('aggregator').trigger('ls:current',ls.data.savedTime);
 },
 resetData:function(resetUser=false){
  if(!localStorage.getItem(data.name)||resetUser)
  {
   localStorage.setItem(data.name,JSON.stringify({
    user:{},
    data:{}
   }));
  }else
  {
   let ls=this.getData();

   ls.data={};
   this.setData(ls);
  }
 },
 getData:function(){
  return JSON.parse(localStorage.getItem(data.name));
 },
 setData:function(ls){
  localStorage.setItem(data.name,JSON.stringify(ls));
 }
});