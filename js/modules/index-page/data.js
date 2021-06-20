export const data={
 preload:{},
 waitBtn:1500,
 events:{
  'start':'.start-pop .start',
  'clr':'.clr',
  'goOn':'.continue'
 },
 view:{
  el:'#wrap',
  loadedCls:'loaded',
  tooSmallCls:'too-small',
  startCls:'start',
  //fsCls:'fs',
  timerCls:'timer',
  pauseCls:'paused',
  nopeCls:'nope',
  goOnCls:'goOn'
 },
 minViewport:'(min-width:600px)',
 mobViewport:'(max-width:1023px)'
};