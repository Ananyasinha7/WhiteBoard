
//select canvas tag
let canvas=document.querySelector("#board");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

//tool selection logic
let toolsarr=document.querySelectorAll(".tool");
let currenttool='pen';
for(let i=0;i<toolsarr.length;i++){
    toolsarr[i].addEventListener("click",function(){
        const toolname=toolsarr[i].id;
        if(toolname=="pen"){
            currenttool='pen';
            tool.strokeStyle="black";
            tool.lineWidth=pensize;
        }
        else if(toolname=="eraser"){
            currenttool='eraser';
            tool.strokeStyle="white";
            tool.lineWidth=erasersize;

        }
        else if(toolname=="sticky"){
            currenttool='sticky';
            createsticky();
        }
        else if(toolname=="image"){
            currenttool="image";
            uploadfile();
        }
        else if(toolname=="download"){
            currenttool="download";
            downloadfile();
        }
        else if(toolname=="redo"){
            currenttool='redo';
            redofn();
        }
        else if(toolname=="undo"){
           currenttool='undo';
           undofn();
        }

    })
}


//draw something on canvas
let tool=canvas.getContext("2d");
let toolBar=document.querySelector(".toolbar");
let undostack=[];
let redostack=[];
let isdrawing=false;
let currentstroke=[];


//Pen
canvas.addEventListener("mousedown",function(e){
    //console.log("mouse down");
    let stx=e.clientX;
    let sty=e.clientY;
    tool.beginPath();
    let toolbarheight=getYDelta(); 
    tool.moveTo(stx,(sty-toolbarheight));
    isdrawing=true;
    currentstroke=[];
    let pointdesc={
        x:stx,
        y:sty-toolbarheight,
        desc:"md",
        color:tool.strokeStyle,
        lineWidth:tool.lineWidth,
    }
    currentstroke.push(pointdesc);

})
canvas.addEventListener("mousemove",function(e){
    let enx=e.clientX;
    let eny=e.clientY;
    if(isdrawing==false){
        return;
    }
    let toolbarheight=getYDelta();
    tool.lineTo(enx,eny-toolbarheight);
    tool.stroke();
    let pointdesc={
        x:enx,
        y:eny-toolbarheight,
        desc:"mm"
    }
    currentstroke.push(pointdesc);
})
canvas.addEventListener("mouseup",function(e){
    isdrawing=false;
    if(currentstroke.length>0){
        undostack.push(currentstroke);
        currentstroke=[];
        redostack=[];
    }
})
//helper function
function getYDelta(){
    let heightoftoolbar=toolBar.getBoundingClientRect().height;
return heightoftoolbar;
}

function outershell(){
//element create
let stickydiv=document.createElement("div");
let navdiv=document.createElement("div");
let closediv=document.createElement("div");
let minimizediv=document.createElement("div");

//class styling
stickydiv.setAttribute("class","sticky");
navdiv.setAttribute("class","nav");

closediv.innerText="X";
minimizediv.innerText="min";

//html structure
stickydiv.appendChild(navdiv);
navdiv.appendChild(minimizediv);
navdiv.appendChild(closediv);

//add to the page
document.body.appendChild(stickydiv);
let isminimized=false;
closediv.addEventListener("click",function(){
    stickydiv.remove();
})
minimizediv.addEventListener("click",function(){
    textarea.style.display=isminimized==true? "block":"none";
    isminimized=!isminimized;
})

isstickydown=false;
//navbar -> mousedown, mouse mousemove, mouseup
navdiv.addEventListener("mousedown",function(e){
 initialx=e.clientX;
 initialy=e.clientY;
 console.log("mousedown",initialx,initialy);
isstickydown=true;

})
navdiv.addEventListener("mousemove",function(e){
if(isstickydown==true){
    
    //final point
    let finalx=e.clientX;
    let finaly=e.clientY;
    console.log("mousemove",finalx,finaly);
    //distance
    let dx=finalx-initialx;
    let dy=finaly-initialy;
    //move sticky
    //og top left
    let {top,left}=stickydiv.getBoundingClientRect()
    //stickydiv.style.top=10+'px';
    stickydiv.style.top=top+dy+'px';
    stickydiv.style.left=left+dx+'px';
    initialx=finalx;
    initialy=finaly;
}
})

navdiv.addEventListener("mouseup",function(){
isstickydown=false;
})
return stickydiv;
}

function createsticky(){
    let stickydiv=outershell();
    let textarea=document.createElement("textarea");
    textarea.setAttribute("class","text-area");
    stickydiv.appendChild(textarea);

}
let inputfile=document.querySelector(".input-tag")
function uploadfile(){
    inputfile.click();
    console.log("upload file clicked")
    inputfile.addEventListener("change",function(){
       let data = inputfile.files[0];
       let img=document.createElement("img");
       let url=URL.createObjectURL(data);
       img.src=url;
       img.setAttribute("class","upload-img");
       let stickydiv=outershell();
       stickydiv.appendChild(img);


    })
}

function downloadfile(){
    //anchor button
    //href=canvas->url
    //anchor click()
    //anchor remove
    let a=document.createElement("a");
    //set filename to it's download attribute
    a.download="file.jpg";
    let url=canvas.toDataURL("image/jpeg;base64");
    a.href=url;
    a.click();
    a.remove();
}

function redraw(){
    tool.clearRect(0,0,canvas.width,canvas.height);
    undostack.forEach((stroke)=>{
        tool.beginPath();
        stroke.forEach((point,index)=>{
            if (point.desc === "md") {
                tool.strokeStyle = point.color;
                tool.lineWidth = point.lineWidth; 
                tool.moveTo(point.x, point.y);
            } else if (point.desc === "mm") {
                tool.lineTo(point.x, point.y);
                tool.stroke();
            }
        });
    });
}


function undofn(){
    
    if(undostack.length>0){
        redostack.push(undostack.pop());
       redraw();
        
    }

}

function redofn(){
    if(redostack.length>0){
        undostack.push(redostack.pop());
       redraw();
    }
}

const crossbutton=document.querySelector(".close");
crossbutton.addEventListener("click",()=>{
    canvas.classList.toggle("hidden");
    toolBar.classList.toggle("hidden");
});

 pensizeslide = document.querySelector("#pen-size-slider");
 erasersizeslide=document.querySelector("#eraser-size-slider");
let pensize=5;
let erasersize=10;

pensizeslide.addEventListener("input",(e)=>{
    pensize=e.target.value;
    if(currenttool === 'pen') {
        tool.lineWidth = pensize;
    }
});

erasersizeslide.addEventListener("input",(e)=>{
    erasersize = e.target.value;
    if (currenttool === 'eraser') {
        tool.lineWidth = eraserSize; 
    }
})

