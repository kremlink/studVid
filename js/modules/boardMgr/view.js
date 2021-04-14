import {data as dat} from './data.js';

let app,
    data=dat,
    lsMgr;

export let BoardMgr=Backbone.View.extend({
 initialize:function(opts){
  app=opts.app;
  data=app.configure({board:dat}).board;

  lsMgr=opts.lsMgr;

  this.listenTo(app.get('aggregator'),'board:user',this.setUserData);
  this.listenTo(app.get('aggregator'),'board:score',this.setData);
 },
 saveAndClr:function(){
  fetch(data.url+JSON.stringify($.extend({episode:app.get('epIndex')},lsMgr.getData()))).then(()=>{
   lsMgr.resetData(data.resetUser);
  });
 },
 setUserData:function(dat){
  let ls=lsMgr.getData();

  ls.user=dat;
  lsMgr.setData(ls);
 },
 setData:function({name,val}){
  let ls=lsMgr.getData();

  //...
  //...
  lsMgr.setData(ls);
 }
});