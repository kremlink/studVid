import {data as dat} from './data.js';

let app,
    data=dat,
    epIndex;

export let BoardMgr=Backbone.View.extend({
 data:{name:'',what:'',points:0,oldName:''},
 initialize:function(opts){
  app=opts.app;
  data=app.configure({board:dat}).board;

  epIndex=app.get('epIndex');

  this.lsMgr=opts.lsMgr;

  this.listenTo(app.get('aggregator'),'board:name',this.name);
  this.listenTo(app.get('aggregator'),'board:score',this.setData);
 },
 req:function(){
  fetch(data.url+JSON.stringify(this.data)).then(()=>{
   this.data.oldName='';
  });
 },
 name:function(name=''){
  let ls=this.lsMgr.getData(),
   curTime=ls.curTime[epIndex-1];

  this.data.name=name?name:data.defName;
  if(ls.name)
  {
   this.data.oldName=ls.name;
   ls=this.lsMgr.resetData();
   ls.curTime[epIndex-1]=curTime;
  }
  ls.name=this.data.name;
  this.lsMgr.setData(ls);
  this.req();
 },
 setData:function({what,points}){
  let ls=this.lsMgr.getData();

  this.data.what=what;
  this.data.points=points;
  ls.points[what]=points;
  this.lsMgr.setData(ls);
  this.req();
 }
});