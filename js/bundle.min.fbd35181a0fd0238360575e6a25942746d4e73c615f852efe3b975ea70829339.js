var $=document.querySelector.bind(document),$$=document.querySelectorAll.bind(document)
function setVisibility(e,visible,useAttr=true){if(visible){e.style.visibility="visible"
if(useAttr){e.removeAttribute("hidden")}}else{e.style.visibility="hidden"
if(useAttr){e.setAttribute("hidden",true)}}
e.classList.add(visible?'show':'hide')
e.classList.remove(visible?'hide':'show')}
function onLogoClick(){};'use strict';class Termynal{constructor(container='#termynal',options={}){this.container=(typeof container==='string')?document.querySelector(container):container;this.pfx=`data-${options.prefix||'ty'}`;this.startDelay=options.startdelay||<no value>;this.typeDelay=options.typedelay||<no value>;this.lineDelay=options.linedelay||<no value>;this.progressLength=options.progresslength||<no value>;this.progressChar=options.progresschar||'<no value>';this.progressPercent=options.progressPercent||100;this.showPercent=("showpercent"in options&&options.showpercent)||(!"showpercent"in options&&<no value>);this.onExitCommand=options.onExitCommand;this.cursor=options.cursor||'▋';if(!options.noInit)this.init()}
init(){this.lines=[...this.container.querySelectorAll(`[${this.pfx}]`)].concat(this.lineData);const containerStyle=getComputedStyle(this.container);this.container.style.width=containerStyle.width!=='0px'?containerStyle.width:undefined;this.container.style.minHeight=containerStyle.height!=='0px'?containerStyle.height:undefined;this.container.setAttribute('data-termynal','');this.container.innerHTML='';this.start();}
async start(){await this._wait(this.startDelay);for(let line of this.lines){if(typeof line==='undefined'){break}
const type=line.getAttribute(this.pfx);const delay=line.getAttribute(`${this.pfx}-delay`)||this.lineDelay;if(type=='input'){line.setAttribute(`${this.pfx}-cursor`,this.cursor);await this.type(line);await this._wait(delay);if(line.textContent==='exit'&&typeof this.onExitCommand!=='undefined'){this.onExitCommand()}}
else if(type=='progress'){await this.progress(line);await this._wait(delay);}
else{this.container.appendChild(line);await this._wait(delay);}
line.removeAttribute(`${this.pfx}-cursor`);}}
async type(line){const chars=[...line.textContent];const delay=line.getAttribute(`${this.pfx}-typeDelay`)||this.typeDelay;line.textContent='';this.container.appendChild(line);for(let char of chars){await this._wait(delay);line.textContent+=char;}}
async progress(line){const progressLength=line.getAttribute(`${this.pfx}-progressLength`)||this.progressLength;const progressChar=line.getAttribute(`${this.pfx}-progressChar`)||this.progressChar;const chars=progressChar.repeat(progressLength);const progressPercent=line.getAttribute(`${this.pfx}-progressPercent`)||this.progressPercent;line.textContent='';this.container.appendChild(line);for(let i=1;i<chars.length+1;i++){await this._wait(this.typeDelay);const percent=Math.round(i/chars.length*100);line.textContent=`${chars.slice(0,i)}`;if(this.showPercent){line.textContent+=` ${percent}%`}
if(percent>progressPercent){break;}}}
_wait(time){return new Promise(resolve=>setTimeout(resolve,time));}};function handleNavBar(isMainPage){menuActive=false
var nav=$('nav')
function setFixedNav(isFixed){if(isFixed){nav.classList.add('nav-fixed')
nav.classList.add('nav-shadow')
$$('nav > .logo, nav > .nav-toggle').forEach(function(el){setVisibility(el,true,false)})}else{nav.classList.remove('nav-fixed')
nav.classList.remove('nav-shadow')
$$('nav > .logo, nav > .nav-toggle').forEach(function(el){setVisibility(el,false,false)})}}
if(isMainPage){document.addEventListener('DOMContentLoaded',function(){const ITEMS=[...$$(".nav-item")]
const SECTIONS=[...$$("main > section")].reverse()
const THRESHOLD=340
var oldIdx=-1
window.addEventListener("scroll",()=>{var scrollPosition=window.scrollY||window.pageYOffset||document.documentElement.scrollTop,windowHeight=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight,navHeight=nav.clientHeight
if(scrollPosition>windowHeight-navHeight){setFixedNav(true)}else{setFixedNav(false)}
const idx=SECTIONS.length-1-SECTIONS.findIndex((sec)=>scrollPosition>sec.offsetTop-THRESHOLD)
if(idx!=oldIdx){ITEMS.forEach((itm)=>itm.classList.remove("nav-item-active"))
ITEMS[idx].classList.add("nav-item-active")
oldIdx=idx}});},false);}else{setFixedNav(true)}
function toggle(){if(menuActive){$('#open').classList.remove('icon-active')
menuActive=false}else{$('#open').classList.add('icon-active')
menuActive=true}}
$('.nav-icon').addEventListener('click',function(){toggle()
$$('.nav-full, main').forEach(function(el){el.classList.toggle('active')})})
$$('.nav-full a').forEach(function(links){links.addEventListener('click',function(){toggle()
$$('.nav-full, main').forEach(function(el){el.classList.toggle('active')})})})
$('.logo').addEventListener('click',function(){toggle()
if($('.nav-full').classList.contains('active')){$$('.nav-full, main').forEach(function(el){el.classList.toggle('active')})}})
$('body').addEventListener('click',function(){if($('.nav-full').classList.contains('active')){$('html').style.overflowY='hidden'}else{$('html').style.overflowY='scroll'}})
function fullMobileViewport(){var element=this,viewportHeight=window.innerHeight,heightChangeTolerance=100
$(window).resize(function(){if(Math.abs(viewportHeight-window.innerHeight)>heightChangeTolerance){viewportHeight=window.innerHeight
update()}})
function update(){element.style.height=(viewportHeight+'px')}
update()}
$$('header').forEach(function(){fullMobileViewport})};(function(){var realmsg=$('textarea[name=message2]')
var honeypotmsg=$('textarea[name=message]')
if(realmsg===null){return;}
setVisibility(realmsg,true)
setVisibility(honeypotmsg,false)
honeypotmsg.removeAttribute("required")
$('#form-contact').addEventListener('submit',function(e){e.preventDefault()
var name=$('input[name=name]').value,email=$('input[name=email]').value,subject=$('input[name=_subject]').value,matter=$('select[name=matter]').value,message=realmsg.value,honeypot=honeypotmsg.value
var request=new XMLHttpRequest(),data={name:name,_replyto:email,email:email,_subject:subject,_matter:matter,message:message,}
if(honeypot!==""){data._anti_spam_honeypot=honeypot}
var sending=$('#form-sending'),submit=$('#form-submit'),thanks=$('#form-thankyou'),error=$('#form-error')
setVisibility(submit,false)
setVisibility(sending,true)
request.open('POST','https://usebasin.com/f/{YOUR-12-CHAR-FORM-KEY-HERE}',true)
request.setRequestHeader('Content-Type','application/json')
request.setRequestHeader('Accept','application/json')
request.onreadystatechange=function(){if(request.readyState===XMLHttpRequest.DONE){if(request.status===200){$('#form-contact').reset()
function thankYouFadeIn(){setVisibility(sending,false)
setVisibility(thanks,true)
setTimeout(thankYouFadeOut,6000)};function thankYouFadeOut(){setVisibility(thanks,false)
setVisibility(submit,true)};thankYouFadeIn()}else{$('#form-contact').reset()
setVisibility(error,true)}}}
request.send(JSON.stringify(data))})})()