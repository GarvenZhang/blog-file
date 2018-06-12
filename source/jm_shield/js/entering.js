/**
 * Created by John Gorven on 2017/2/25.
 */
/**
 * canvasBg
 */
var canvPage = getEl('#transitionPageCanv')
canvPage.setAttribute('width', 200)
canvPage.setAttribute('height', 200)

/**
 * userInfo
 */
var headImg = new Image()

headImg.onload = function () {
  if (canvPage.getContext) {
    var ctx = canvPage.getContext('2d'),
      imgData,
      w = headImg.width, h = headImg.height
    ctx.drawImage(headImg, 0, 0, 150, 200)
    imgData = ctx.getImageData(0, 0, headImg.width, headImg.height)
    var d = imgData.data

    black(imgData)

        // spread
    for (var x = 0, i; x < w; x++) {
      for (var y = 0; y < h; y++) {
        r = (x + y * w) << 2
        n = ((Math.random() * 10) | 0) % 3
        i = (x + n + (y + n) * w) << 2

        d[r] = d[r]
        d[r + 1] = d[i + 1]
        d[r + 2] = d[i + 2]
        d[r + 3] = 255
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }
}

headImg.src = '../doc/file/user02.jpg'
headImg.width = 150
headImg.height = 200
document.body.appendChild(headImg)

function black (a) {
  for (var t = 0; t < a.width; t++) {
    for (var d = 0; d < a.height; d++) {
      var r = 4 * (t + d * a.width),
        h = a.data[r + 0],
        i = a.data[r + 1],
        o = a.data[r + 2]

      if (h + i + o >= 300) {
        fr = 60; fg = 173; fb = 77
      } else fr = fg = fb = 0

      a.data[r + 0] = fr
      a.data[r + 1] = fg
      a.data[r + 2] = fb
      a.data[r + 3] = 255
    }
  }
  return a
}

/*
*
* (function () {
 for(var d=imgData.data, l=d.length,a,r;l-=4;){

 d[l-1]=255-d[l-1];
 d[l-2]=255-d[l-2];
 d[l-3]=255-d[l-3];

 a=(d[l-1]+d[l-2]+d[l-3])/3>>>0;

 if(a>=0&&a<=30||a<=255&&a>=230){
 r=Math.random()*2|0;
 if(r){
 d[l-2]=60;
 d[l-3]=173;
 d[l-4]=77;
 }else{
 d[l-2]=0;
 d[l-3]=0;
 d[l-4]=0;
 }
 }else{
 d[l-2]=a;
 d[l-3]=a<<2;
 d[l-4]=a;
 }

 }
 })();
 */

/* //get main rgb rate info
 mainRGBData=ctx.getImageData(w*0.2,h*0.2,w*0.6,h*0.6);
 for(var B=0,W=0, dM=mainRGBData.data,l=dM.length,aM,mC;l-=4;){
 aM=(dM[l-2]+dM[l-3]+dM[l-4])/3;
 if(aM<100)++B;
 else ++W;
 }
 mC=Math.max(B,W)==B?'<128':'>128';

 //change color :
 // mC area --> deep green(60,203,77) - shadow green(60,163,77) - black(0,0,0) :6:3:1
 // sC area --> black - shadow green - deep green :6:3:1
 imgData=ctx.getImageData(0,0,headImg.width,headImg.height);
 for(var d=imgData.data,l=d.length,a;l-=4;){
 a=(d[l-2]+d[l-3]+d[l-4])/3|0;
 if(mC==='>128')
 switch(rate(6,3,1)){
 case 6:d[l-2]=60;d[l-3]=203;d[l-4]=77;break;
 case 3:d[l-2]=a;d[l-3]=163;d[l-4]=a;break;
 case 1:d[l-2]=d[l-3]=d[l-4]=0;break;
 }
 else
 switch(rate(6,3,1)){
 case 6:d[l-1]=d[l-1]>>1;d[l-2]=d[l-3]=d[l-4]=0;break;
 case 3:d[l-1]=d[l-1]>>1;d[l-2]=77;d[l-3]=193;d[l-4]=60;break;
 case 1:d[l-1]=d[l-1]>>1;d[l-2]=60;d[l-3]=203;d[l-4]=77;break;
 }

 } */

/* (function () {
 var d=imgData.data,h=imgData.height,w=imgData.width;

 //transform to 2D coordinate
 (function () {
 for(var i=0, y=0;y<h;y++){
 TDArr[y]=[];
 for(var  x=0;x<w;x++){
 TDArr[y][x]=[];
 for(var n=4;n--;){
 TDArr[y][x].push(d[i++]);
 }
 }
 }
 })();

 //change color group
 for(var x=0,xR,tXR;x<w;x+=xR ){

 //3:2:1
 tXR=xR=rate(3,2,1);
 while(tXR--)
 for(var y=0,yR,tYR;y<w;y+=yR){

 tYR=yR=rate(6,3,1);
 while(tYR--){
 //console.log(TDArr[x+(xR-tXR)][y+(yR-tYR)]);

 try{
 if(!TDArr[x+(xR-tXR)][y+(yR-tYR)])break;
 }catch (e){
 break;
 }

 var temp=TDArr[x+(xR-tXR)][y+(yR-tYR)];

 var a=temp[0]+temp[1]+temp[2];

 if(!temp[4]){

 //rgb handle
 if(a<40||(a<=255&&a>220)){
 r=Math.random()*2|0;
 if(r){
 temp[0]=60;
 temp[1]=173;
 temp[2]=77;
 }else{
 temp[0]=temp[1]=temp[2]=0;
 }
 }else{
 temp[0]=a;
 temp[1]=173;
 temp[2]=a;
 }

 //mark the item that has been changed
 }else temp[4]=true;

 }
 }
 }

 (function () {

 for( var y=0;y<h;y++){
 for(var x=0;x<w;x++){
 for(var i=0;i<4;i++){
 imgData.data[y*w+x*4+i]=TDArr[y][x][i++];
 }
 }
 }
 console.log(d);
 })();

 function rate(a,b,c) {
 r=Math.random()*10|0;
 switch(true){
 case r<6:return a;
 case r>=6&&r<9:return b;
 default:return c;
 }
 }
 */
