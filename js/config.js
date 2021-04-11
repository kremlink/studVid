export let config={
 metrika:{name:64365469},
 ls:{
  name:'ls-vid'
 },
 'index':{
  preload:{
   '1':{
    /*'images/':{imgs:['question-photo.png','map-bg2.png']},
    'images/packing/':{j:[12,8,5],tmpl:['packing-[i]-[j].png','packing-[i]-[j]-p.png']}*/
   }
  }
 },
 'timer':{
  //url:'timer.php?time='
 },
 board:{//rename and redo
  url:'php.php?board='
 },
 sound:{
  template:'<audio src="../sounds/<%= src %>.mp3" preload="auto"></audio>'
 },
 /*redirect:{//needed?
   '1':'end.php'
  },*/
 'player':{
  //btnBack:30,
  quality:[
   {
    width:'(min-width:1281px)',
    label:'720P'
   },
   {
    width:'(max-width:1280px)',
    label:'360P'
   }
  ],
  data:{
   '1':[//noAutoClose:true|repeatable:true|delayedPause:-1|noVidAutoPlay:true|checkpoint:true|iniTimer:true
    {
     base:{
      src:['../oceans.mp4','../oceans1.mp4'],
      timecodes:[{start:1,invoked:false,iniTimer:true,data:{interactive:'Start'}},
       {start:2,invoked:false,data:{interactive:'UPop',conf:{cls:'choose'}}}],
      rewindTime:40
     },
     choose:[
      {src:['../oceans.mp4','../oceans1.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}},
      {src:['../oceans.mp4','../oceans1.mp4'],data:{interactive:'UPop',conf:{correct:true,cls:'info'}}}
     ]
    },
    {
     base:{
      src:['../night.mp4','../night.mp4'],
      timecodes:[{start:3,invoked:false,data:{interactive:'UPop',conf:{cls:'choose'}}}],
      rewindTime:5
     },
     choose:[
      {src:['../oceans.mp4','../oceans1.mp4'],data:{interactive:'UPop',conf:{correct:true,cls:'info'}}},
      {src:['../oceans.mp4','../oceans1.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}}
     ]
    }
   ]
  }
 },
 interactives:{

 }
};