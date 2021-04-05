import {data as dat} from './data.js';

let app,
    data=dat,
    epIndex;

export let LsMgr=Backbone.View.extend({
 //ini:{name:'',chosen:[],timer:0,savedTime:0},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({ls:dat}).ls;

  epIndex=app.get('epIndex');

  if(!localStorage.getItem(data.name))
  {
   this.resetData(true);
  }else
  {
   let ls=this.getData();

   if(!ls.data[epIndex])
    ls.data[epIndex]={};

   this.setData(ls);
  }

  this.listenTo(app.get('aggregator'),'player:ready',this.loaded);
 },
 loaded:function(){
  let ls=this.getData();

  app.get('aggregator').trigger('ls:current',ls.data[epIndex].savedTime||0);
 },
 resetData:function(resetUser=false){
  if(resetUser)
  {
   localStorage.setItem(data.name,JSON.stringify({
    user:{},
    data:{[epIndex]:{}}
   }));
  }else
  {
   let ls=this.getData();

   ls.data[epIndex]={};
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