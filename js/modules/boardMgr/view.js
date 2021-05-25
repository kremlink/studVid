import {data as dat} from './data.js';

let app,
    data=dat,
    epIndex,
    lsMgr;

export let BoardMgr=Backbone.View.extend({
 initialize:function(opts){
  app=opts.app;
  data=app.configure({board:dat}).board;

  epIndex=app.get('epIndex');

  lsMgr=opts.lsMgr;

  this.listenTo(app.get('aggregator'),'board:user',this.setUserData);
  this.listenTo(app.get('aggregator'),'board:choose',this.setData);
  this.listenTo(app.get('aggregator'),'board:save',this.sendData);
 },
 sendData:function(){
  let ls=lsMgr.getData();

  fetch(data.url+JSON.stringify({user:ls.user,timer:ls.data[epIndex].timer,episode:epIndex,chosen:ls.data[epIndex].chosen})).then(()=>{});
 },
 setUserData:function(dat){
  let ls=lsMgr.getData();

  ls.user=dat;
  lsMgr.setData(ls);
 },
 setData:function({step,index}){
  let ls=lsMgr.getData();

  if(!ls.data[epIndex].chosen)
   ls.data[epIndex].chosen=[];
  ls.data[epIndex].chosen.push({step:step,index:index});
  lsMgr.setData(ls);
 }
});