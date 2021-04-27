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
  template:'<audio src="../sounds/<%= src %>.mp3" preload="auto" <%= loop?"loop":"" %>></audio>'
 },
 /*redirect:{//needed?
   '1':'end.php'
  },*/
 'player':{
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
   '1':[//[noAutoClose:true|repeatable:true|delayedPause:-1|noVidAutoPlay:true|]checkpoint:true|iniTimer:true
    {
     base:{
      src:['../videos/base1.mp4','../videos/base1.mp4'],
      timecodes:[{start:4,invoked:false,data:{interactive:'Start'}},
       {start:20,invoked:false,data:{interactive:'UPop',conf:{cls:'choose'}}}],
      rewindTime:22
     },
     choose:[
      {src:['../videos/win1.mp4','../videos/win1.mp4'],data:{interactive:'UPop',conf:{correct:true,cls:'info'}}},
      {src:['../videos/fail1.mp4','../videos/fail1.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}}
     ]
    },
    {
     base:{
      src:['../videos/base2.mp4','../videos/base2.mp4'],
      timecodes:[{start:12,invoked:false,data:{interactive:'UPop',conf:{cls:'choose'}}}],
      rewindTime:14
     },
     choose:[
      {src:['../videos/fail2-1.mp4','../videos/fail2-1.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}},
      {src:['../videos/win2.mp4','../videos/win2.mp4'],data:{interactive:'UPop',conf:{correct:true,cls:'info'}}},
      {src:['../videos/fail2-2.mp4','../videos/fail2-2.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}}
     ]
    },
    {
     base:{
      src:['../videos/base3.mp4','../videos/base3.mp4'],
      timecodes:[{start:5,invoked:false,data:{interactive:'UPop',conf:{cls:'choose'}}}],
      rewindTime:7
     },
     choose:[
      {src:['../videos/fail3.mp4','../videos/fail3.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}},
      {src:['../videos/win3.mp4','../videos/win3.mp4'],data:{interactive:'UPop',conf:{correct:true,cls:'info'}}}
     ]
    }/*,
    {
     base:{
      src:['../oceans.mp4','../oceans.mp4'],
      timecodes:[{start:3,invoked:false,data:{interactive:'UPop',conf:{cls:'choose'}}}],
      rewindTime:4
     },
     choose:[
      {src:['../night.mp4','../night1.mp4'],data:{interactive:'UPop',conf:{correct:true,cls:'info'}}},
      {src:['../oceans.mp4','../oceans1.mp4'],data:{interactive:'UPop',conf:{correct:false,cls:'info'}}}
     ]
    }*/
   ]
  }
 },
 interactives:{

 }
};