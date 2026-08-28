import{V as Jt,C as Bn,S as In,O as Un,W as Xn,a as ve,B as Ct,b as me,D as je,c as kt,A as ct,P as Lt,N as Yn,d as jn,L as Kt,e as Wn,M as $e,f as Zn}from"./three-DsYxzsj3.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const n of l)if(n.type==="childList")for(const d of n.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function o(l){const n={};return l.integrity&&(n.integrity=l.integrity),l.referrerPolicy&&(n.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?n.credentials="include":l.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(l){if(l.ep)return;l.ep=!0;const n=o(l);fetch(l.href,n)}})();const Hn=`
uniform vec3 uHeatCold;
uniform vec3 uHeatWarm;
uniform vec3 uHeatHot;
uniform float uHeatDistance;
uniform float uPointSizeTrail;
uniform float uPixelRatio;
uniform float uPointScale;
uniform float uTornadoActive;
uniform float uTornadoFadeStart;
uniform float uTornadoFadeEnd;

attribute vec3 homePosition;
attribute vec3 livePosition;
attribute float funnelT;

varying vec3 vColor;
varying float vSpeed;
varying float vTornadoFade;

void main() {
    float movement = length(position - homePosition);
    float heat = smoothstep(0.05, uHeatDistance, movement);
    vec3 heatMap = (heat < 0.5)
        ? mix(uHeatCold, uHeatWarm, heat * 2.0)
        : mix(uHeatWarm, uHeatHot, (heat - 0.5) * 2.0);

    vSpeed = clamp(length(livePosition - position) / uHeatDistance, 0.0, 1.0);
    vColor = heatMap;
    float funnelFade = clamp(
        (funnelT - uTornadoFadeStart) / max(uTornadoFadeEnd - uTornadoFadeStart, 1e-4),
        0.0, 1.0);
    vTornadoFade = mix(1.0, 0.14 + 0.86 * funnelFade, uTornadoActive);

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPointSizeTrail * uPixelRatio * uPointScale * (0.5 + 1.4 * vSpeed);
}
`,Gn=`
uniform float uTrailStrength;
varying vec3 vColor;
varying float vSpeed;
varying float vTornadoFade;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float alpha = (1.0 - smoothstep(0.0, 1.0, r)) * vSpeed * vSpeed * uTrailStrength;
    alpha *= vTornadoFade;
    gl_FragColor = vec4(vColor, alpha);
}
`,On=`
attribute float aLife;
varying float vLife;

void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + 3.0 * aLife);
}
`,_n=`
varying float vLife;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float a = (1.0 - r) * vLife;
    vec3 c = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.95, 0.7), vLife);
    gl_FragColor = vec4(c, a);
}
`;let qe=null,bt=null;function Jn(){return!qe&&(window.AudioContext||window.webkitAudioContext)&&(qe=new(window.AudioContext||window.webkitAudioContext)),qe&&qe.state==="suspended"&&qe.resume(),qe}function Ae(e){if(bt)return bt;const a=e.sampleRate*2,o=e.createBuffer(1,a,e.sampleRate),i=o.getChannelData(0);for(let l=0;l<a;l++)i[l]=Math.random()*2-1;return bt=o,o}function Kn(e,a){const o=Jn();if(!o)return;const i=typeof e=="object"&&e!==null?e:{soundDuration:e||a},l=i.motionStyle!=null?i.motionStyle:typeof state<"u"&&state&&state.motionStyle!=null?state.motionStyle:0,n=o.currentTime,d=o.createGain();d.gain.setValueAtTime(1e-4,n),d.gain.linearRampToValueAtTime(.6,n+.02),d.connect(o.destination);const p=i.soundDuration||a||1.5,x=i.soundPitch||140,X=i.soundType||"sine";if(l===1){const P=o.createBufferSource();P.buffer=Ae(o),P.loop=!0;const B=o.createBiquadFilter();B.type="bandpass",B.frequency.setValueAtTime(60,n),B.frequency.linearRampToValueAtTime(180,n+3.5),B.frequency.exponentialRampToValueAtTime(580,n+6),B.frequency.linearRampToValueAtTime(320,n+8),B.frequency.linearRampToValueAtTime(220,n+11.5),B.frequency.exponentialRampToValueAtTime(45,n+15),B.Q.value=2.8;const E=o.createGain();E.gain.setValueAtTime(1e-4,n),E.gain.exponentialRampToValueAtTime(.18,n+3),E.gain.linearRampToValueAtTime(.38,n+6),E.gain.linearRampToValueAtTime(.24,n+11.5),E.gain.exponentialRampToValueAtTime(1e-4,n+15),P.connect(B),B.connect(E),E.connect(d),P.start(n),P.stop(n+15+.1),setTimeout(()=>{try{P.disconnect(),B.disconnect(),E.disconnect(),d.disconnect()}catch{}},(15+.2)*1e3);return}if(l===2){const P=i&&i.pattern||{},B=P.blowDir!=null?P.blowDir:1,E=typeof o.createStereoPanner=="function"?o.createStereoPanner():null;if(E){const I=B>0?1:-1;E.pan.setValueAtTime(-.4*I,n),E.pan.linearRampToValueAtTime(.65*I,n+6),E.pan.linearRampToValueAtTime(0,n+10.5),E.connect(d)}const Y=E||d,W=o.createBufferSource();W.buffer=Ae(o),W.loop=!0;const C=o.createBiquadFilter();C.type="bandpass",C.frequency.setValueAtTime(160,n),C.frequency.linearRampToValueAtTime(260,n+2.5),C.frequency.exponentialRampToValueAtTime(740,n+5.5),C.frequency.linearRampToValueAtTime(320,n+9.8),C.frequency.exponentialRampToValueAtTime(60,n+12),C.Q.value=1.3;const V=o.createGain();V.gain.setValueAtTime(1e-4,n),V.gain.exponentialRampToValueAtTime(.12,n+1.2),V.gain.linearRampToValueAtTime(.15,n+2.5),V.gain.linearRampToValueAtTime(.38,n+5.5),V.gain.linearRampToValueAtTime(.1,n+9.8),V.gain.exponentialRampToValueAtTime(1e-4,n+12);const L=o.createOscillator();L.type="sine",L.frequency.setValueAtTime(8.5,n),L.frequency.linearRampToValueAtTime(14,n+5.5),L.frequency.linearRampToValueAtTime(4,n+12);const y=o.createGain();y.gain.setValueAtTime(.04,n),y.gain.linearRampToValueAtTime(.1,n+5.5),y.gain.linearRampToValueAtTime(0,n+9.8),L.connect(y),y.connect(V.gain),W.connect(C),C.connect(V),V.connect(Y),W.start(n),W.stop(n+12+.1),L.start(n),L.stop(n+12+.1);const w=o.createOscillator();w.type="sine",w.frequency.setValueAtTime(587.33,n+9.8),w.frequency.exponentialRampToValueAtTime(440,n+12);const j=o.createGain();j.gain.setValueAtTime(1e-4,n+9.8),j.gain.exponentialRampToValueAtTime(.06,n+10.3),j.gain.exponentialRampToValueAtTime(1e-4,n+12),w.connect(j),j.connect(Y),w.start(n+9.8),w.stop(n+12+.1),setTimeout(()=>{try{W.disconnect(),C.disconnect(),V.disconnect(),L.disconnect(),y.disconnect(),w.disconnect(),j.disconnect(),E&&E.disconnect(),d.disconnect()}catch{}},(12+.2)*1e3);return}if(l===3){const P=typeof o.createStereoPanner=="function"?o.createStereoPanner():null;P&&(P.pan.setValueAtTime(-.75,n),P.pan.linearRampToValueAtTime(.75,n+7.5),P.connect(d));const B=P||d,E=o.createOscillator();E.type="sine",E.frequency.setValueAtTime(32,n),E.frequency.linearRampToValueAtTime(48,n+2.5),E.frequency.linearRampToValueAtTime(58,n+4.2),E.frequency.linearRampToValueAtTime(36,n+5.8),E.frequency.exponentialRampToValueAtTime(20,n+7.5);const Y=o.createGain();Y.gain.setValueAtTime(1e-4,n),Y.gain.exponentialRampToValueAtTime(.24,n+2),Y.gain.linearRampToValueAtTime(.48,n+4.2),Y.gain.linearRampToValueAtTime(.18,n+5.8),Y.gain.exponentialRampToValueAtTime(1e-4,n+7.5),E.connect(Y),Y.connect(B),E.start(n),E.stop(n+7.5+.1);const W=o.createBufferSource();W.buffer=Ae(o),W.loop=!0;const C=o.createBiquadFilter();C.type="lowpass",C.frequency.setValueAtTime(140,n),C.frequency.exponentialRampToValueAtTime(420,n+2.2),C.frequency.exponentialRampToValueAtTime(1250,n+4.2),C.frequency.linearRampToValueAtTime(550,n+5.6),C.frequency.exponentialRampToValueAtTime(75,n+7.5),C.Q.value=1.1;const V=o.createGain();V.gain.setValueAtTime(1e-4,n),V.gain.exponentialRampToValueAtTime(.18,n+1.8),V.gain.linearRampToValueAtTime(.52,n+4.2),V.gain.linearRampToValueAtTime(.22,n+5.6),V.gain.exponentialRampToValueAtTime(1e-4,n+7.5),W.connect(C),C.connect(V),V.connect(B),W.start(n),W.stop(n+7.5+.1);const L=o.createBufferSource();L.buffer=Ae(o),L.loop=!0;const y=o.createBiquadFilter();y.type="bandpass",y.frequency.setValueAtTime(1400,n),y.frequency.exponentialRampToValueAtTime(2400,n+3.8),y.frequency.exponentialRampToValueAtTime(3200,n+4.6),y.frequency.linearRampToValueAtTime(1800,n+6),y.frequency.exponentialRampToValueAtTime(600,n+7.5),y.Q.value=1.4;const w=o.createGain();w.gain.setValueAtTime(1e-4,n),w.gain.exponentialRampToValueAtTime(.04,n+2.5),w.gain.linearRampToValueAtTime(.38,n+4.4),w.gain.linearRampToValueAtTime(.26,n+5.4),w.gain.exponentialRampToValueAtTime(1e-4,n+7.5),L.connect(y),y.connect(w),w.connect(B),L.start(n),L.stop(n+7.5+.1);const j=o.createBufferSource();j.buffer=Ae(o),j.loop=!0;const I=o.createBiquadFilter();I.type="bandpass",I.frequency.setValueAtTime(700,n+4.5),I.frequency.exponentialRampToValueAtTime(280,n+6.2),I.frequency.exponentialRampToValueAtTime(90,n+7.5),I.Q.value=1.8;const f=o.createGain();f.gain.setValueAtTime(1e-4,n),f.gain.setValueAtTime(1e-4,n+4.5),f.gain.linearRampToValueAtTime(.18,n+5.5),f.gain.exponentialRampToValueAtTime(1e-4,n+7.5),j.connect(I),I.connect(f),f.connect(B),j.start(n+4.5),j.stop(n+7.5+.1),setTimeout(()=>{try{E.disconnect(),Y.disconnect(),W.disconnect(),C.disconnect(),V.disconnect(),L.disconnect(),y.disconnect(),w.disconnect(),j.disconnect(),I.disconnect(),f.disconnect(),P&&P.disconnect(),d.disconnect()}catch{}},(7.5+.2)*1e3);return}if(l===4){const P=o.createOscillator();P.type="sine",P.frequency.setValueAtTime(55,n),P.frequency.exponentialRampToValueAtTime(36,n+1.2),P.frequency.exponentialRampToValueAtTime(68,n+2.8),P.frequency.linearRampToValueAtTime(62,n+10.5),P.frequency.exponentialRampToValueAtTime(28,n+16);const B=o.createGain();B.gain.setValueAtTime(1e-4,n),B.gain.exponentialRampToValueAtTime(.32,n+2.8),B.gain.linearRampToValueAtTime(.24,n+10.5),B.gain.exponentialRampToValueAtTime(1e-4,n+16);const E=o.createOscillator();E.type="sine",E.frequency.value=3.2;const Y=o.createGain();Y.gain.setValueAtTime(.06,n+2.8),Y.gain.linearRampToValueAtTime(0,n+10.5),E.connect(Y),Y.connect(B.gain),P.connect(B),B.connect(d),P.start(n),P.stop(n+16+.1),E.start(n),E.stop(n+16+.1);const W=o.createBufferSource();W.buffer=Ae(o),W.loop=!0;const C=o.createBiquadFilter();C.type="bandpass",C.frequency.setValueAtTime(110,n),C.frequency.exponentialRampToValueAtTime(680,n+2.8),C.frequency.linearRampToValueAtTime(840,n+6.5),C.frequency.linearRampToValueAtTime(520,n+10.5),C.frequency.exponentialRampToValueAtTime(90,n+16),C.Q.value=2.2;const V=o.createGain();V.gain.setValueAtTime(1e-4,n),V.gain.exponentialRampToValueAtTime(.28,n+2.8),V.gain.linearRampToValueAtTime(.22,n+10.5),V.gain.exponentialRampToValueAtTime(1e-4,n+16);const L=o.createOscillator();L.type="sine",L.frequency.value=.75;const y=o.createGain();y.gain.setValueAtTime(.05,n+2.8),y.gain.linearRampToValueAtTime(0,n+10.5),L.connect(y),y.connect(V.gain),W.connect(C),C.connect(V),V.connect(d),W.start(n),W.stop(n+16+.1),L.start(n),L.stop(n+16+.1);const w=n+2.8,j=o.createOscillator();j.type="sine",j.frequency.setValueAtTime(115,w),j.frequency.exponentialRampToValueAtTime(38,w+.45);const I=o.createGain();I.gain.setValueAtTime(1e-4,w),I.gain.exponentialRampToValueAtTime(.32,w+.03),I.gain.exponentialRampToValueAtTime(1e-4,w+.55),j.connect(I),I.connect(d),j.start(w),j.stop(w+.6);const f=n+13.5,k=o.createOscillator();k.type="triangle",k.frequency.setValueAtTime(659.25,f),k.frequency.exponentialRampToValueAtTime(493.88,f+1.2);const Z=o.createGain();Z.gain.setValueAtTime(1e-4,f),Z.gain.exponentialRampToValueAtTime(.12,f+.06),Z.gain.exponentialRampToValueAtTime(1e-4,n+16),k.connect(Z),Z.connect(d),k.start(f),k.stop(n+16+.1),setTimeout(()=>{try{P.disconnect(),B.disconnect(),E.disconnect(),Y.disconnect(),W.disconnect(),C.disconnect(),V.disconnect(),L.disconnect(),y.disconnect(),j.disconnect(),I.disconnect(),k.disconnect(),Z.disconnect(),d.disconnect()}catch{}},(16+.2)*1e3);return}if(l===5){const P=i&&i.pattern||{},B=P.mModeIndex!=null?P.mModeIndex:Math.floor(Math.random()*5),E=P.mLaunchDir!=null&&P.mLaunchDir<0?-1:1,Y=typeof o.createStereoPanner=="function"?o.createStereoPanner():null;Y&&(Y.pan.setValueAtTime(0,n),Y.pan.linearRampToValueAtTime(-.6*E,n+3),Y.pan.linearRampToValueAtTime(.65*E,n+7.5),Y.pan.linearRampToValueAtTime(-.45*E,n+10.5),Y.pan.linearRampToValueAtTime(0,n+13),Y.connect(d));const W=Y||d,C=o.createBufferSource();C.buffer=Ae(o),C.loop=!0;const V=o.createBiquadFilter();V.type="bandpass",V.frequency.setValueAtTime(180,n),V.frequency.linearRampToValueAtTime(680,n+3.5),V.frequency.linearRampToValueAtTime(540,n+7.5),V.frequency.linearRampToValueAtTime(720,n+9.5),V.frequency.linearRampToValueAtTime(160,n+12),V.frequency.exponentialRampToValueAtTime(60,n+14),V.Q.value=1.4;const L=o.createGain();L.gain.setValueAtTime(1e-4,n),L.gain.exponentialRampToValueAtTime(.18,n+3),L.gain.linearRampToValueAtTime(.16,n+7.5),L.gain.linearRampToValueAtTime(.2,n+9.5),L.gain.linearRampToValueAtTime(.08,n+12),L.gain.exponentialRampToValueAtTime(1e-4,n+14),C.connect(V),V.connect(L),L.connect(W),C.start(n),C.stop(n+14+.1);const y=[[329.63,415.3,493.88],[293.66,369.99,440],[220,277.18,329.63],[369.99,440,554.37],[261.63,329.63,392]],w=y[B%y.length],j=[],I=[];w.forEach((Z,G)=>{const v=o.createOscillator();v.type="sine",v.frequency.setValueAtTime(Z,n),v.frequency.linearRampToValueAtTime(Z*1.05,n+7.5),v.frequency.linearRampToValueAtTime(Z*.95,n+11.5),v.frequency.exponentialRampToValueAtTime(Z*.5,n+14);const T=o.createGain();T.gain.setValueAtTime(1e-4,n),T.gain.linearRampToValueAtTime(.045,n+2.5+G*.3),T.gain.linearRampToValueAtTime(.065,n+7.5),T.gain.linearRampToValueAtTime(.035,n+11.5),T.gain.exponentialRampToValueAtTime(1e-4,n+14),v.connect(T),T.connect(W),v.start(n),v.stop(n+14+.1),j.push(v),I.push(T)});const f=o.createOscillator();f.type="triangle",f.frequency.setValueAtTime(w[0]*3,n+11.5),f.frequency.exponentialRampToValueAtTime(w[0],n+14);const k=o.createGain();k.gain.setValueAtTime(1e-4,n+11.5),k.gain.exponentialRampToValueAtTime(.04,n+11.9),k.gain.exponentialRampToValueAtTime(1e-4,n+14),f.connect(k),k.connect(W),f.start(n+11.5),f.stop(n+14+.1),setTimeout(()=>{try{C.disconnect(),V.disconnect(),L.disconnect(),j.forEach(Z=>Z.disconnect()),I.forEach(Z=>Z.disconnect()),f.disconnect(),k.disconnect(),Y&&Y.disconnect(),d.disconnect()}catch{}},(14+.2)*1e3);return}const M=Math.max(1.8,p),g=o.createBufferSource();g.buffer=Ae(o);const c=o.createBiquadFilter();c.type="bandpass",c.frequency.setValueAtTime(1200,n),c.frequency.exponentialRampToValueAtTime(180,n+.25),c.Q.value=1.2;const A=o.createGain();A.gain.setValueAtTime(.75,n),A.gain.exponentialRampToValueAtTime(.001,n+.35),g.connect(c),c.connect(A),A.connect(d),g.start(n),g.stop(n+.4);const S=o.createBufferSource();S.buffer=Ae(o),S.loop=!0;const b=o.createBiquadFilter();b.type="lowpass",b.frequency.setValueAtTime(450,n),b.frequency.exponentialRampToValueAtTime(65,n+M);const F=o.createGain();F.gain.setValueAtTime(.65,n),F.gain.exponentialRampToValueAtTime(1e-4,n+M),S.connect(b),b.connect(F),F.connect(d),S.start(n),S.stop(n+M+.05);const D=o.createOscillator();D.type=X||"sine",D.frequency.setValueAtTime(Math.max(x,120),n),D.frequency.exponentialRampToValueAtTime(26,n+Math.min(1.2,M));const q=o.createGain();q.gain.setValueAtTime(.7,n),q.gain.exponentialRampToValueAtTime(.001,n+M),D.connect(q),q.connect(d),D.start(n),D.stop(n+M+.05),setTimeout(()=>{try{g.disconnect(),c.disconnect(),A.disconnect(),S.disconnect(),b.disconnect(),F.disconnect(),D.disconnect(),q.disconnect(),d.disconnect()}catch{}},(M+.1)*1e3)}function it(e,a){a.funnelBottom,a.funnelHeight;const o=a.funnelWaistT!=null?a.funnelWaistT:a.funnelWaistU||.42,i=a.funnelTailRadius!=null?a.funnelTailRadius:.8,l=a.funnelWaistRadius!=null?a.funnelWaistRadius:3.5,n=a.funnelCrownRadius!=null?a.funnelCrownRadius:22,d=a.funnelCrownExp||1.4;if(e<=o){const p=e/Math.max(.01,o);return i+(l-i)*(p*p)}else{const p=(e-o)/Math.max(.01,1-o);return l+(n-l)*Math.pow(p,d)}}const Nt=.06081006264583979;function pn(e,a,o,i,l,n,d,p,x,X,M){const g=it(l,X),c=Math.atan2(d,n),A=Math.sqrt(a*a+i*i),S=3.5,b=X.vortexDuration||4.5,F=X.equilibriumDuration||3.5,D=3.5,q=14+.55*A,z=X.funnelBottom||-22,P=X.funnelHeight||46,B=.12*Math.sin(3*c-4.2*x+2.5*l),E=.08*Math.cos(5*c+6*x-3.8*l),Y=.06*Math.sin(x*7.5+e*.03),W=1+B+E+Y,C=(4+15/(A+4.5))*p,V=((X.spinSpeed||5.2)*2.8+4.5*(1-l))*p;if(x<S){const L=x/S,y=L*L*L*(L*(L*6-15)+10),w=(1-y)*A+y*q,j=c+C*(.6*x+.2*(x*x/S)),I=Math.cos(j)*w,f=(1-y)*o+y*(z+.022*w*w+3*(l-.5)),k=Math.sin(j)*w;return M?(M.x=I,M.y=f,M.z=k,M):{x:I,y:f,z:k}}else if(x<S+b){const L=x-S,y=L/b,w=y*y*(3-2*y),j=c+C*(.8*S),I=L+.6*b/Math.PI*(1-Math.cos(Math.PI*L/b)),f=j+V*1.25*I,k=(1-w)*q+w*(g*W),Z=2.8*Math.sin(1.8*x+2.2*l)*l*w,G=2.4*Math.cos(1.5*x+1.8*l)*l*w,v=Z+Math.cos(f)*k,T=(1-w)*(z+.022*q*q)+w*(z+P*l)+5.5*Math.sin(y*Math.PI)*l,H=G+Math.sin(f)*k;return M?(M.x=v,M.y=T,M.z=H,M):{x:v,y:T,z:H}}else if(x<S+b+F){const L=x-(S+b),y=L/F,w=1+.75*Math.sin(Math.PI*y)+.35*y,j=c+C*(.8*S),I=b+1.2*b/Math.PI,f=j+V*1.25*I,k=L-.2/2.4*(Math.cos(2.4*L)-1),Z=f+V*1.1*k,G=g*W*w,v=2.8*Math.sin(1.8*(S+b)+2.2*l)*l*(1-.4*y),T=2.4*Math.cos(1.5*(S+b)+1.8*l)*l*(1-.4*y),H=v+Math.cos(Z)*G,te=z+P*l+(1-y)*2*l,ne=T+Math.sin(Z)*G;return M?(M.x=H,M.y=te,M.z=ne,M):{x:H,y:te,z:ne}}else{const L=x-(S+b+F),y=Math.min(1,L/D),w=c+C*(.8*S),j=b+1.2*b/Math.PI,I=w+V*1.25*j,f=F-.2/2.4*(Math.cos(2.4*F)-1),k=I+V*1.1*f,Z=.85*L-.275*(L*L/D),G=k+V*1.1*Z,v=g*W*(1-y)+q*y,T=(z+P*l)*(1-y)+(z+.022*q*q+3*(l-.5))*y,H=Math.cos(G)*v,te=T,ne=Math.sin(G)*v,J=.35*y+.65*Math.pow(y,2.2),_=(1-J)*H+J*a,u=(1-J)*te+J*o,U=(1-J)*ne+J*i;return M?(M.x=_,M.y=u,M.z=U,M):{x:_,y:u,z:U}}}function mn(e,a,o,i,l,n,d,p){const x=d||{},X=x.blowDir!=null?x.blowDir:1,M=x.intensity!=null?x.intensity:1,g=x.turbAmp!=null?x.turbAmp:.85+.45*M,c=x.billowFreq!=null?x.billowFreq:.22;x.windTilt!=null&&x.windTilt;const A=2.5,S=4.5,b=2.8,F=2.2,D=e*37.119%100/100,q=e*61.19%100/100,z=e*83.11%100/100,P=e*53.17%100/100,B=n*l;let E=Math.min(1,n/.6);E=E*E*(3-2*E);const Y=Math.pow(Math.max(0,(o+12)/24),1.3),W=2.2*Math.sin(2.8*B-.12*a+D*1.5)+.8*Math.sin(5.5*B+q*3.14159),C=Y*W*X*M*E,V=Math.abs(Math.sin(8.5*B+P*6.28))*.45*Y*M*E,L=Math.sin(1.8*B+D*6.28)*1.5*Y*M*E;let y=a+C,w=o+V,j=i+L;if(n>A){const Z=n-A,v=(X>0?a+45:45-a)*.008+q*.35+z*.15,T=Math.max(0,Z-v);let H=Math.min(1,T/1.2);H=H*H*(3-2*H);const te=S+b,ne=Math.min(1,T/te),J=ne*(2-ne),_=Math.sin(Math.min(Math.PI,ne*Math.PI));if(H>0){const u=D,O=(3.2+z*1.8)*B+q*6.28;let K=0,ee=0,Q=0;if(u<.45){const ae=.7+.6*z+.3*Math.sin(.15*a+D*6.28),N=(30+10*q)*M*ae;K=X*(N*J);const $=(4+4.5*q)*Math.sin(c*(a+X*K*.35)-2.8*B+D*6.28),oe=(1.5+1.2*P)*Math.sin(.35*a-4.2*B+z*6.28),re=(6+8*z)*_;ee=Math.max(0,re+($+oe)*_*g);const ce=(4+4.5*P)*Math.cos(c*(a+X*K*.3)-2.4*B+q*6.28),ie=1.6*Math.sin(6.5*B+D*6.28);Q=(ce+ie)*_*g}else if(u<.82){const ae=.8+.4*P,N=(22+7*z)*M*ae,$=Math.sin(O)*(2+1*D)*(1-ne*.6);K=X*(N*J+$);const oe=Math.abs(Math.cos(O))*(4.5+3*P)*_,re=Math.abs(Math.sin(3*B+q*6.28))*1.5*_*g;ee=oe+re,Q=Math.sin(O*.75+D*6.28)*(3.5+2*q)*_*g}else{const ae=(18+5*q)*M;K=X*(ae*J),ee=Math.abs(Math.sin(O*1.5))*(1.8+1*z)*(1-ne*.6),Q=Math.sin(O*.5)*(2+.8*P)*(1-ne*.6)}y=y+K*H,w=w+ee*H,j=j+Q*H}}w=Math.max(o,w);let I=y,f=w,k=j;if(n>=A+S+b){const Z=n-(A+S+b),G=q*.2;let v=Math.max(0,Math.min(1,(Z-G)/(F-G)));const T=v*v*v*(v*(v*6-15)+10);I=y+(a-y)*T,f=w+(o-w)*T,k=j+(i-j)*T}return f=Math.max(o,f),p?(p.x=I,p.y=f,p.z=k,p):{x:I,y:f,z:k}}function dn(e,a,o,i,l,n,d,p,x,X,M,g){const c=x!=null&&x>0?x:3,A=(1-Nt)*.82+.18,S=(2.8*Nt*.82+.18)/Math.max(.1,p),b=A+S*c*.78;let F;if(M<p){const P=M/p;F=((1-Math.exp(-2.8*P))*.82+.18*P)*d}else if(M<p+c){const P=M-p,B=P/Math.max(.01,c);F=(A+S*P*(1-.22*B))*d}else{const P=Math.min(1,Math.max(0,(M-(p+c))/Math.max(.1,X))),B=Math.max(0,1-Math.pow(P,2.4));F=b*B*d}const D=e+i*F,q=a+l*F,z=o+n*F;return g?(g.x=D,g.y=q,g.z=z,g):{x:D,y:q,z}}function fn(e,a,o,i,l,n,d,p){const X=Math.min(1,Math.max(0,n/7.5)),M=-48+96*X,g=a+.25*o-M,c=9.2,A=Math.exp(-(g*g)/(2*c*c)),S=Math.sin(Math.PI*X),b=A*(.35+.65*S),F=Math.PI*g/(2*c),D=Math.cos(F),q=Math.sin(F),z=16,P=.5+.5*Math.tanh(o/8),B=z*(D-.3*Math.sin(2*F)),E=5*P*Math.max(0,D),Y=-3.5*P*Math.max(0,q),W=b*(B+E),C=b*(z*.14*q+Y),V=-b*(z*.06)*q,L=a+V,y=o+C,w=i+W;return p?(p.x=L,p.y=y,p.z=w,p):{x:L,y,z:w}}function hn(e,a,o,i,l,n,d,p){const c=e*37.119%100/100,A=e*61.19%100/100,S=e*83.11%100/100,b=e*53.17%100/100,F=n*l,D=d&&d.knotScale>0?d.knotScale:14.5,q=D,z=D*.35,B=e%3*2.094395,E=c*6.283185,Y=A*6.283185+B,W=.75*l,C=3.2*l,V=E+W*F,L=Y+C*F,y=Math.sin(Math.min(Math.PI,Math.max(0,(n-2.8)/7.7)*Math.PI)),w=Math.pow(Math.abs(Math.sin(3.5*F+S*6.28318)),3),j=(3.5+4.5*b)*w*y,I=2.2*Math.cos(2.8*F+c*6.28318)*y,f=q+(z*(.85+.3*Math.sqrt(S))+j)*Math.cos(L),k=f*Math.cos(V),Z=f*Math.sin(V),G=(z*(.85+.3*Math.sqrt(S))+j)*Math.sin(L)+I,v=.28*Math.sin(.45*F),T=.22*Math.cos(.35*F),H=Math.cos(v),te=Math.sin(v),ne=Math.cos(T),J=Math.sin(T),_=k*ne-Z*J,u=(k*J+Z*ne)*H-G*te,U=(k*J+Z*ne)*te+G*H;let O,K,ee;if(n<2.8){const ie=n/2.8,se=ie*ie*ie*(ie*(ie*6-15)+10),ue=1-.22*Math.sin(Math.min(Math.PI,ie*2.5*Math.PI)),ye=a*ue,Re=o*ue,Be=i*ue,ke=1.5*l*Math.sin(Math.PI*se),Le=Math.cos(ke),we=Math.sin(ke),Ke=ye*Le-Be*we,Ne=ye*we+Be*Le;O=Ke+(_-Ke)*se,K=Re+(u-Re)*se,ee=Ne+(U-Ne)*se}else if(n<2.8+7.7)O=_,K=u,ee=U;else if(n<2.8+7.7+3){const ie=(n-10.5)/3,se=ie*ie*(3-2*ie),pe=_*(1-.35*se),ue=u*(1-.35*se),ye=U*(1-.7*se);O=pe,K=ue,ee=ye}else{const ie=n-13.5,se=A*.25;let pe=Math.max(0,Math.min(1,(ie-se)/(2.5-se)));const ue=pe*pe*pe*(pe*(pe*6-15)+10);O=_*(1-.35)*(1-ue)+a*ue,K=u*(1-.35)*(1-ue)+o*ue,ee=U*(1-.7)*(1-ue)+i*ue}const Q=Math.max(0,Math.min(1,(n-2.8)/(7.7+3))),N=6.283185307179586*(Q*Q*Q*(Q*(Q*6-15)+10)),$=Math.cos(N),oe=Math.sin(N),re=$*O+oe*ee,ce=-oe*O+$*ee;return p?(p.x=re,p.y=K,p.z=ce,p):{x:re,y:K,z:ce}}function gn(e,a,o,i,l,n,d,p){const c=d||{},A=c.mSweepX!=null?c.mSweepX:28,S=c.mSweepY!=null?c.mSweepY:7,b=c.mSweepZ!=null?c.mSweepZ:16,F=c.mFreqX!=null?c.mFreqX:.52,D=c.mFreqY!=null?c.mFreqY:.95,q=c.mFreqZ!=null?c.mFreqZ:.46,z=c.mPhX!=null?c.mPhX:0,P=c.mPhY!=null?c.mPhY:1.2,B=c.mPhZ!=null?c.mPhZ:2.4,E=c.mLaunchDir!=null?c.mLaunchDir:1,Y=c.mTurnDir!=null?c.mTurnDir:1,W=c.mBreathAmp!=null?c.mBreathAmp:1,C=c.mJinkAmp!=null?c.mJinkAmp:1,V=c.mPodAngle!=null?c.mPodAngle:0,L=c.mMergeTime!=null?c.mMergeTime:6.8,y=e*37.119%100/100,w=e*61.19%100/100,j=e*83.11%100/100,I=e*53.17%100/100,k=(E>0?a+45:45-a)*.01+w*.35,Z=n-k;if(Z<=0)return p?(p.x=a,p.y=o,p.z=i,p):{x:a,y:o,z:i};let G=Math.min(1,Z/1);G=G*G*(3-2*G);const v=Math.sin(Math.min(1,Z/1)*Math.PI)*1.8,T=n*l,H=A*Math.sin(F*T+z),te=S*Math.sin(D*T+P)+2.5*Math.cos(.35*T),ne=b*Math.cos(q*T+B),J=A*F*Math.cos(F*T+z),_=S*D*Math.cos(D*T+P)-.88*Math.sin(.35*T),u=-b*q*Math.sin(q*T+B),U=Math.sqrt(J*J+_*_+u*u)||1,O=J/U,K=_/U,ee=u/U,Q=(.5*T+z*.5)*Y,ae=.3*T+P*.5,N=Math.cos(Q)*(1-K*K*.5),$=Math.sin(ae)*.7,oe=-Math.sin(Q),re=Math.sqrt(N*N+$*$+oe*oe)||1,ce=N/re,ie=$/re,se=oe/re,pe=ie*ee-se*K,ue=se*O-ce*ee,ye=ce*K-ie*O,Re=e%2===0?1:-1,Be=(n-L)/1.6,ke=Math.exp(-Be*Be),Le=(7.5+3*W)*(1-ke),we=.85*T*Y+V,Ke=(ce*Math.cos(we)+pe*Math.sin(we))*(Re*Le),Ne=(ie*Math.cos(we)+ue*Math.sin(we))*(Re*Le),Pn=(se*Math.cos(we)+ye*Math.sin(we))*(Re*Le),Ht=(.9+2*Math.min(1,U/14)*W)*(1-.3*ke),En=(1+.5*ke)/Math.sqrt(Math.max(.4,Ht)),gt=Math.cbrt(y)*(4.8+2.4*I)*En,Rn=w*6.283185,vt=(j-.5)*2,Gt=Math.sqrt(Math.max(0,1-vt*vt)),Fn=(2.2+1.2*y)*Y*T+w*6.28+.12*a,Ot=Rn+Fn,Cn=1+.25*Math.sin(1.8*T+j*3.14),kn=1+.25*Math.cos(2.2*T+y*3.14),xt=gt*Gt*Math.cos(Ot)*Ht,yt=gt*Gt*Math.sin(Ot)*Cn,Tt=gt*vt*kn,Mt=Math.sin(.18*(a+H)-2.2*T+Re*1.5)*(1.6*C),Ln=Math.sin(2.4*T+y*6.28+a*.08)*(1.2*C),qn=Math.cos(2.8*T+w*6.28+o*.08)*(.9*C),zn=Math.sin(2.1*T+j*6.28+i*.08)*(1.2*C);let wt=H+Ke+O*xt+ce*yt+pe*(Tt+Mt)+Ln,At=te+Ne+K*xt+ie*yt+ue*(Tt+Mt)+qn+v,Dt=ne+Pn+ee*xt+se*yt+ye*(Tt+Mt)+zn,Ie=wt,Ue=At,Xe=Dt;if(n>=12){const Vn=n-12,_t=w*.35;let Ye=Math.max(0,Math.min(1,(Vn-_t)/(2-_t)));const St=Ye*Ye*Ye*(Ye*(Ye*6-15)+10);Ie=wt+(a-wt)*St,Ue=At+(o-At)*St,Xe=Dt+(i-Dt)*St}return G<1&&(Ie=a+(Ie-a)*G,Ue=o+(Ue-o)*G,Xe=i+(Xe-i)*G),p?(p.x=Ie,p.y=Ue,p.z=Xe,p):{x:Ie,y:Ue,z:Xe}}const mt=8,Nn=40,$n=2.2,Qn=.9;function Ut(e){const a=9+2.5*e,o=Math.min(Nn,12+7*e);return{speed:a,maxRadius:o,lifetime:o/a,decay:2.2-.3*e,width:2+.75*e}}function ea(){return new Float32Array(mt*4)}function ta(e,a,o,i,l){const n=a*4;e[n]=o,e[n+1]=i,e[n+2]=0,e[n+3]=l}function na(e,a){for(let o=0;o<e.length;o+=4){if(e[o+3]<=0)continue;e[o+2]+=a;const i=Ut(e[o+3]),l=e[o+2]*i.speed;(e[o+2]>i.lifetime||l>i.maxRadius)&&(e[o+3]=0)}}function qt(e){for(let a=3;a<e.length;a+=4)if(e[a]>0)return!0;return!1}function aa(e,a,o,i,l){let n=0,d=0,p=0;for(let x=0;x<i.length;x+=4){const X=i[x+3];if(X<=0)continue;const M=i[x+2],g=Ut(X),c=e-i[x],A=a-i[x+1],S=Math.sqrt(c*c+A*A);if(S<1e-4)continue;const b=M*g.speed,F=1-Math.abs(S-b)/g.width;if(F<=0)continue;const D=Math.sin(Math.PI*F)*Math.exp(-g.decay*M)*X,q=D*$n/S;n+=c*q,d+=A*q,p+=D*Qn}return l.x=n,l.y=d,l.z=p,l}const $t=75,m={initialZ:35,cameraAngleDeg:$t,zoomMin:10,zoomMax:200,fitMargin:56,zoomSpeed:.8,zoomLerp:.08,rotationStep:.03,rotationAutoReturnLerp:.02,autoReturnGracePeriodMs:300,canvasWidth:800,canvasHeight:150,fontSize:44,pixelStep:2,pixelThreshold:120,targetWorldWidth:80,emojiOptions:["😀","😂","😍","🥰","😎","🤔","😭","😡","😱","🥳","👍","👎","👏","🙏","👌","💪","❤️","🔥","✨","🎉"],emojiRasterSize:320,emojiPixelStep:2,emojiFontSize:280,emojiDensityOverride:1,emojiJitterXY:.03,emojiJitterZ:.5,emojiDepthCue:.06,emojiPointSize:1.6,emojiMotionMix:.35,emojiDepthRange:6,imageRasterSize:320,imagePixelStep:2,imageAlphaThreshold:16,imageJitterXY:.03,imageJitterZ:.5,imageDepthCue:.06,imagePointSize:1.2,imageDepthRange:5,density:8,jitterXY:.08,jitterZ:2.5,explosionSpeedMin:.4,explosionSpeedRange:.8,heatDistance:2/3*35*Math.tan($t*Math.PI/360),afterglowDuration:.2,mouseInfluence:6,rippleMoveSpeed:60,rippleEmitIntervalMs:90,rippleMoveAmpMin:.35,rippleMoveAmpMax:1.6,rippleMoveAmpDiv:300,rippleTapGraceMs:150,rippleChargeMs:1e3,rippleTapAmp:.8,rippleChargeAmp:4,chargeCancelPx:8,cursorChargeScale:3.4,springK:.12,springDamping:.82,tapCount:3,tapWindowMs:800,inputDebounceMs:150,pointSize:.5,pointSizeAttenuationScale:120,clearColor:131589,maxPixelRatio:2,themes:{ember:{hot:[1,.95,.75],warm:[1,.45,.05],cold:[.92,.18,.05]},arctic:{hot:[.92,.98,1],warm:[.18,.75,1],cold:[.05,.35,.88]},toxic:{hot:[.92,1,.4],warm:[.35,.95,.15],cold:[.06,.58,.22]},neon:{hot:[1,.92,.98],warm:[1,.08,.55],cold:[.35,.05,.88]},sakura:{hot:[1,.95,.96],warm:[1,.45,.65],cold:[.85,.18,.42]}},presets:{KINETIC:{description:"A 3D surf wave rolls through your message — luminous crest, deep blue troughs.",expansionDuration:3.75,contractionDuration:3.75,explosionMaxDistMultiplier:22,motionStyle:3,trailStrength:.7,emberBudget:0,soundPitch:45,soundDuration:7.5,soundType:"sine"},TORNADO:{description:"A four-phase vortex funnel — particles accrete, spiral upward, then dissolve.",expansionDuration:3.5,vortexDuration:4.5,equilibriumDuration:3.5,contractionDuration:3.5,explosionMaxDistMultiplier:26,motionStyle:1,spinSpeed:4.8,funnelHeight:46,funnelBottom:-22,funnelCrownRadius:22,funnelWaistRadius:4.5,funnelTailRadius:1.8,funnelWaistT:.38,funnelCrownT:.82,funnelFadeStart:.03,funnelFadeEnd:.3,trailStrength:.75,emberBudget:90,soundPitch:75,soundDuration:15,soundType:"sawtooth"},BREEZE:{description:"A gentle whisper breeze flexes and rustles the intact letters, then augments into a multi-tier leaf storm before floating softly home.",expansionDuration:2.5,contractionDuration:2.2,explosionMaxDistMultiplier:28,motionStyle:2,trailStrength:.6,emberBudget:0,soundPitch:95,soundDuration:12,soundType:"sine"},EXPLODE:{description:"A volumetric blast — particles burst outward, hang in the air, then rush home.",expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:36,motionStyle:0,trailStrength:.3,emberBudget:140,soundPitch:110,soundDuration:6.2,soundType:"sine"},TORUS:{description:"Magnetic fields ignite your message into a high-energy tokamak fusion plasma ring with helical currents and solar flares, cooling into crystalline letterforms.",expansionDuration:8,contractionDuration:4,explosionMaxDistMultiplier:30,motionStyle:4,trailStrength:.8,emberBudget:50,soundPitch:40,soundDuration:16,soundType:"sine"},MURMURATION:{description:"Your message takes flight in braided aurora currents — 3 interwoven silk ribbons spiral in 3D, ripple in wave curtains, and converge home.",expansionDuration:2.5,contractionDuration:2.5,explosionMaxDistMultiplier:30,motionStyle:5,trailStrength:.7,emberBudget:60,soundPitch:70,soundDuration:14,soundType:"sine"},DEFAULT:{expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:15,motionStyle:-1,spokes:12,spokeJitter:.03,spinSpeed:0,funnelHeight:0,funnelBottom:0,funnelCrownRadius:0,funnelWaistRadius:0,funnelTailRadius:0,funnelWaistT:0,funnelCrownT:0,funnelFadeStart:0,funnelFadeEnd:0,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"}}};let De=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{De=e.matches});let de=null;const oa=384;let rt=0,ge=null,Xt={w:80,h:80};const ia=`
uniform vec3 uMouse;
uniform float uMouseInfluence;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uPointScale;
uniform float uDepthCue;
uniform vec3 uColorHot;
uniform vec3 uColorWarm;
uniform vec3 uColorCold;
uniform float uExplosionActive;
uniform float uTornadoActive;
uniform float uTornadoFadeStart;
uniform float uTornadoFadeEnd;
uniform float uHeatDistance;
uniform vec3 uHeatCold;
uniform vec3 uHeatWarm;
uniform vec3 uHeatHot;
uniform float uAudioMid;
uniform float uAudioHigh;
uniform float uAudioEnvelope;
uniform float uEmojiMode;
uniform float uEmojiMotionMix;

// GPU Kinematics Uniforms
uniform float uGpuPhysics;
uniform int uMotionStyle;
uniform float uExplosionElapsed;
uniform float uExpDuration;
uniform float uDriftDuration;
uniform float uContractionDuration;
uniform float uMaxDist;
uniform float uSpinSpeed;
uniform float uFunnelBottom;
uniform float uFunnelHeight;
uniform float uFunnelCrownRadius;
uniform float uFunnelWaistRadius;
uniform float uFunnelTailRadius;
uniform float uFunnelWaistT;
uniform float uFunnelCrownExp;
uniform float uBreezeBlowDir;
uniform float uBreezeIntensity;
uniform float uBreezeSwirl;
// Murmuration randomized flight plan (per-blast, written by triggerExplosion)
uniform float uMSweepX;
uniform float uMSweepY;
uniform float uMSweepZ;
uniform float uMFreqX;
uniform float uMFreqY;
uniform float uMFreqZ;
uniform float uMPhX;
uniform float uMPhY;
uniform float uMPhZ;
uniform float uMLaunchDir;
uniform float uMTurnT;
uniform float uMTurnDir;
uniform float uMSplitT;
uniform float uMSplitAng;
uniform float uMDodge1T;
uniform float uMDodge2T;
uniform float uMDodge3T;
uniform float uMDodgeRad;
uniform float uMDodgeStr;
uniform float uMBoilAmp;
uniform float uMBoilFreq;
uniform float uMChurnMult;
uniform float uMFlutterMult;
uniform float uMJinkAmp;
uniform float uMJinkFreq;
uniform float uMJinkPh;
uniform float uMBreathAmp;
uniform float uMScoutAmp;
uniform float uMMergeTime;
uniform float uMPodAngle;
// Torus knot auto-calibration (world units, from the camera frustum)
uniform float uKnotScale;
// Hover ripples: vec4 slots (x, y, age, amp) in local space, amp <= 0 = inactive.
// Ages advance on the CPU each frame; the shader only flashes light on wavefronts
// (displacement runs through the spring integrator on the CPU/worker side).
uniform vec4 uRipples[8];
// Pre-explosion tap indicator: vec4 (x, y, age, tapCount) in local space,
// tapCount 0 = inactive. Pure glow marker, no displacement.
uniform vec4 uTapRing;

attribute vec3 homePosition;
attribute vec4 sourceColor;
attribute float sampleSize;
attribute float funnelT;
attribute vec2 aSourceUV;
attribute vec3 aRandomDir;
attribute float aRandomSpeed;
attribute float aIndex;
attribute vec3 aSeed;
attribute float aCustomDir;

varying vec3 vColor;
varying float vCoverage;
varying float vTornadoFade;
varying vec2 vSourceUV;

float calcTornadoRadius(float u, float waistU, float rTail, float rWaist, float rCrown, float crownExp) {
    if (u <= waistU) {
        float t = u / max(0.01, waistU);
        return rTail + (rWaist - rTail) * (t * t);
    } else {
        float t = (u - waistU) / max(0.01, 1.0 - waistU);
        return rWaist + (rCrown - rWaist) * pow(t, crownExp);
    }
}

vec3 evalTornadoGPU(float i, vec3 home, float u, vec3 seed, float cd, float elapsed, float spinSpeed, float fBottom, float fHeight, float rCrown, float rWaist, float rTail, float waistU, float crownExp) {
    float radiusFunnel = calcTornadoRadius(u, waistU, rTail, rWaist, rCrown, crownExp);
    float baseAngle = atan(seed.z, seed.x);
    float r0 = length(home.xz);

    float t1 = 3.5;
    float t2 = 4.5;
    float t3 = 3.5;
    float t4 = 3.5;

    float discRadius = 14.0 + 0.55 * r0;
    float ripple1 = 0.12 * sin(3.0 * baseAngle - 4.2 * elapsed + 2.5 * u);
    float ripple2 = 0.08 * cos(5.0 * baseAngle + 6.0 * elapsed - 3.8 * u);
    float ripple3 = 0.06 * sin(elapsed * 7.5 + i * 0.03);
    float sheathRipple = 1.0 + ripple1 + ripple2 + ripple3;

    float diffSpin = (4.0 + 15.0 / (r0 + 4.5)) * cd;
    float vortexSpin = (spinSpeed * 2.8 + 4.5 * (1.0 - u)) * cd;

    if (elapsed < t1) {
        float p1 = elapsed / t1;
        float e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);
        float rDisc = (1.0 - e1) * r0 + e1 * discRadius;
        float angle1 = baseAngle + diffSpin * (0.6 * elapsed + 0.2 * (elapsed * elapsed / t1));
        float rx = cos(angle1) * rDisc;
        float ry = (1.0 - e1) * home.y + e1 * (fBottom + 0.022 * rDisc * rDisc + 3.0 * (u - 0.5));
        float rz = sin(angle1) * rDisc;
        return vec3(rx, ry, rz);
    } else if (elapsed < t1 + t2) {
        float tau = elapsed - t1;
        float p2 = tau / t2;
        float eLift = p2 * p2 * (3.0 - 2.0 * p2);
        float angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        float integral2 = tau + (0.6 * t2 / 3.14159265) * (1.0 - cos(3.14159265 * tau / t2));
        float angle2 = angleAtEnd1 + vortexSpin * 1.25 * integral2;
        float currentR = (1.0 - eLift) * discRadius + eLift * (radiusFunnel * sheathRipple);
        float axisX = 2.8 * sin(1.8 * elapsed + 2.2 * u) * u * eLift;
        float axisZ = 2.4 * cos(1.5 * elapsed + 1.8 * u) * u * eLift;
        float rx = axisX + cos(angle2) * currentR;
        float ry = (1.0 - eLift) * (fBottom + 0.022 * discRadius * discRadius) + eLift * (fBottom + fHeight * u) + 5.5 * sin(p2 * 3.14159265) * u;
        float rz = axisZ + sin(angle2) * currentR;
        return vec3(rx, ry, rz);
    } else if (elapsed < t1 + t2 + t3) {
        float tau3 = elapsed - (t1 + t2);
        float p3 = tau3 / t3;
        float bloom = 1.0 + 0.75 * sin(3.14159265 * p3) + 0.35 * p3;
        float angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        float integral2End = t2 + (1.2 * t2 / 3.14159265);
        float angleAtEnd2 = angleAtEnd1 + vortexSpin * 1.25 * integral2End;
        float integral3 = tau3 - (0.2 / 2.4) * (cos(2.4 * tau3) - 1.0);
        float angle3 = angleAtEnd2 + vortexSpin * 1.1 * integral3;
        float currentR3 = (radiusFunnel * sheathRipple) * bloom;
        float axisX3 = 2.8 * sin(1.8 * (t1 + t2) + 2.2 * u) * u * (1.0 - 0.4 * p3);
        float axisZ3 = 2.4 * cos(1.5 * (t1 + t2) + 1.8 * u) * u * (1.0 - 0.4 * p3);
        float rx = axisX3 + cos(angle3) * currentR3;
        float ry = fBottom + fHeight * u + (1.0 - p3) * 2.0 * u;
        float rz = axisZ3 + sin(angle3) * currentR3;
        return vec3(rx, ry, rz);
    } else {
        float tau4 = elapsed - (t1 + t2 + t3);
        float p4 = min(1.0, tau4 / t4);
        float angleAtEnd1 = baseAngle + diffSpin * (0.8 * t1);
        float integral2End = t2 + (1.2 * t2 / 3.14159265);
        float angleAtEnd2 = angleAtEnd1 + vortexSpin * 1.25 * integral2End;
        float integral3End = t3 - (0.2 / 2.4) * (cos(2.4 * t3) - 1.0);
        float angleAtEnd3 = angleAtEnd2 + vortexSpin * 1.1 * integral3End;
        float integral4 = 0.85 * tau4 - 0.275 * (tau4 * tau4 / t4);
        float angle4 = angleAtEnd3 + vortexSpin * 1.1 * integral4;
        float reverseFunnelR = (radiusFunnel * sheathRipple) * (1.0 - p4) + discRadius * p4;
        float reverseFunnelY = (fBottom + fHeight * u) * (1.0 - p4) + (fBottom + 0.022 * discRadius * discRadius + 3.0 * (u - 0.5)) * p4;
        float revDiscX = cos(angle4) * reverseFunnelR;
        float revDiscY = reverseFunnelY;
        float revDiscZ = sin(angle4) * reverseFunnelR;
        float returnProg = 0.35 * p4 + 0.65 * pow(p4, 2.2);
        float rx = (1.0 - returnProg) * revDiscX + returnProg * home.x;
        float ry = (1.0 - returnProg) * revDiscY + returnProg * home.y;
        float rz = (1.0 - returnProg) * revDiscZ + returnProg * home.z;
        return vec3(rx, ry, rz);
    }
}

// Style 2: Aero-Elastic Foliage Sway & Dispersal Streamlines — Starts with in-place cantilever
// foliage sway & leaf flutter (Phase 1: 0-2.5s), augments into 3-tier wind dispersal with turbulent canopy streamers (Phase 2 & 3: 2.5-9.8s),
// and lands gently via parachute settling (Phase 4: 9.8-12.0s). Mirrors evaluateBreezeParticle in physics-math.js.
vec3 evalBreezeGPU(float i, vec3 home, float cd, float elapsed, float gx, float intensity, float swirl) {
    float t1 = 2.5;
    float t2 = 4.5;
    float t3 = 2.8;
    float t4 = 2.2;

    float turbAmp = 0.85 + 0.45 * intensity + 0.35 * swirl;
    float billowFreq = 0.22 + 0.04 * sin(intensity * 2.5);
    float windTilt = 0.08 * sin(intensity * 4.0);

    float p1h = mod(i * 37.119, 100.0) / 100.0;
    float p2h = mod(i * 61.19, 100.0) / 100.0;
    float p3h = mod(i * 83.11, 100.0) / 100.0;
    float p4h = mod(i * 53.17, 100.0) / 100.0;

    float te = elapsed * cd;

    // Phase 1: In-place aero-elastic sway & strictly upward leaf flutter (Py >= hy always)
    float rampIn = min(1.0, elapsed / 0.6);
    rampIn = rampIn * rampIn * (3.0 - 2.0 * rampIn);

    float cantilever = pow(max(0.0, (home.y + 12.0) / 24.0), 1.3);
    float swayWave = 2.2 * sin(2.8 * te - 0.12 * home.x + p1h * 1.5) + 0.8 * sin(5.5 * te + p2h * 3.14159265);
    float sway = cantilever * swayWave * gx * intensity * rampIn;
    float flutterUp = abs(sin(8.5 * te + p4h * 6.28318)) * 0.45 * cantilever * intensity * rampIn;
    float depthWaft = sin(1.8 * te + p1h * 6.28318) * 1.5 * cantilever * intensity * rampIn;

    vec3 P = vec3(home.x + sway, home.y + flutterUp, home.z + depthWaft);

    // Phase 2 & 3: Wind surge dispersal with peeling arrival wave
    if (elapsed > t1) {
        float tauDisperse = elapsed - t1;
        float sweepCoord = (gx > 0.0) ? (home.x + 45.0) : (45.0 - home.x);
        float peelDelay = sweepCoord * 0.008 + p2h * 0.35 + p3h * 0.15;
        float ltSurge = max(0.0, tauDisperse - peelDelay);
        float pSurge = min(1.0, ltSurge / 1.2);
        pSurge = pSurge * pSurge * (3.0 - 2.0 * pSurge);

        float surgeActiveDur = t2 + t3;
        float uFlight = min(1.0, ltSurge / surgeActiveDur);
        float sDist = (uFlight * (2.0 - uFlight));
        float flightTimeEnv = sin(min(3.14159265, uFlight * 3.14159265));

        if (pSurge > 0.0) {
            float strata = p1h;
            float rockFreq = 3.2 + p3h * 1.8;
            float rockAngle = rockFreq * te + p2h * 6.28318;

            vec3 drift = vec3(0.0);
            if (strata < 0.45) {
                // Highly Turbulent Canopy Streamers (Anti-Blob, Elongated Vortex Ribbons)
                float speedVar = 0.70 + 0.60 * p3h + 0.30 * sin(0.15 * home.x + p1h * 6.28318);
                float maxDist = (30.0 + 10.0 * p2h) * intensity * speedVar;
                drift.x = gx * (maxDist * sDist);

                float waveY1 = (4.0 + 4.5 * p2h) * sin(billowFreq * (home.x + gx * drift.x * 0.35) - 2.8 * te + p1h * 6.28318);
                float waveY2 = (1.5 + 1.2 * p4h) * sin(0.35 * home.x - 4.2 * te + p3h * 6.28318);
                float baseLift = (6.0 + 8.0 * p3h) * flightTimeEnv;
                drift.y = max(0.0, baseLift + (waveY1 + waveY2) * flightTimeEnv * turbAmp);

                float waveZ1 = (4.0 + 4.5 * p4h) * cos(billowFreq * (home.x + gx * drift.x * 0.3) - 2.4 * te + p2h * 6.28318);
                float waveZ2 = 1.6 * sin(6.5 * te + p1h * 6.28318);
                drift.z = (waveZ1 + waveZ2) * flightTimeEnv * turbAmp;
            } else if (strata < 0.82) {
                // Mid-Air Tumbling Leaves: 3D pendulum rocking and strictly upward buoyant lift
                float speedVar = 0.80 + 0.40 * p4h;
                float maxDist = (22.0 + 7.0 * p3h) * intensity * speedVar;
                float rockX = sin(rockAngle) * (2.0 + 1.0 * p1h) * (1.0 - uFlight * 0.6);
                drift.x = gx * (maxDist * sDist + rockX);

                float rockY = abs(cos(rockAngle)) * (4.5 + 3.0 * p4h) * flightTimeEnv;
                float flutterLift = abs(sin(3.0 * te + p2h * 6.28318)) * 1.5 * flightTimeEnv * turbAmp;
                drift.y = rockY + flutterLift;

                drift.z = sin(rockAngle * 0.75 + p1h * 6.28318) * (3.5 + 2.0 * p2h) * flightTimeEnv * turbAmp;
            } else {
                // Ground Skitterers: Gliding & skipping above starting height
                float maxDist = (18.0 + 5.0 * p2h) * intensity;
                drift.x = gx * (maxDist * sDist);
                drift.y = abs(sin(rockAngle * 1.5)) * (1.8 + 1.0 * p3h) * (1.0 - uFlight * 0.6);
                drift.z = sin(rockAngle * 0.5) * (2.0 + 0.8 * p4h) * (1.0 - uFlight * 0.6);
            }

            P += drift * pSurge;
        }
    }

    // Strict non-descending invariant: particles NEVER drop below their starting height
    P.y = max(home.y, P.y);

    // Phase 4: Precision Harmonic Parachute Landing (9.8 -> 12.0s)
    if (elapsed >= (t1 + t2 + t3)) {
        float tau4 = elapsed - (t1 + t2 + t3);
        float st = p2h * 0.20;
        float q = clamp((tau4 - st) / (t4 - st), 0.0, 1.0);
        float e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        P = mix(P, home, e4);
    }

    P.y = max(home.y, P.y);
    return P;
}

vec3 evalKineticGPU(vec3 home, float cd, float elapsed) {
    float totalDur = 7.5;
    float p = min(1.0, max(0.0, elapsed / totalDur));
    float xPeel = -48.0 + 96.0 * p;
    float dPeel = (home.x + 0.25 * home.y) - xPeel;
    float tubeWidth = 9.2;
    float env = exp(-(dPeel * dPeel) / (2.0 * tubeWidth * tubeWidth));

    float timeEnv = sin(3.14159265 * p);
    float waveEnv = env * (0.35 + 0.65 * timeEnv);

    float theta = (3.14159265 * dPeel) / (2.0 * tubeWidth);
    float cosT = cos(theta);
    float sinT = sin(theta);
    float waveHeight = 16.0;
    float e2y = exp(clamp(2.0 * (home.y / 8.0), -10.0, 10.0));
    float tanhVal = (e2y - 1.0) / (e2y + 1.0);
    float lipBlend = 0.5 + 0.5 * tanhVal;
    float baseWaveZ = waveHeight * (cosT - 0.30 * 2.0 * sinT * cosT);
    float curlZ = 5.0 * lipBlend * max(0.0, cosT);
    float curlY = -3.5 * lipBlend * max(0.0, sinT);

    float deltaZ = waveEnv * (baseWaveZ + curlZ);
    float deltaY = waveEnv * ((waveHeight * 0.14) * sinT + curlY);
    float deltaX = -waveEnv * (waveHeight * 0.06) * sinT;

    return vec3(home.x + deltaX, home.y + deltaY, home.z + deltaZ);
}

vec3 evalExplosionGPU(vec3 home, vec3 rDir, float rSpeed, float maxDist, float expDur, float driftDur, float contrDur, float elapsed) {
    float tDrift = driftDur > 0.0 ? driftDur : 3.0;
    float peakProg = (1.0 - 0.06081006) * 0.82 + 0.18;
    float vLatest = (2.8 * 0.06081006 * 0.82 + 0.18) / max(0.1, expDur);
    float driftPeakProg = peakProg + vLatest * tDrift * 0.78;
    float dist = 0.0;
    if (elapsed < expDur) {
        float u = elapsed / expDur;
        dist = ((1.0 - exp(-2.8 * u)) * 0.82 + 0.18 * u) * maxDist;
    } else if (elapsed < expDur + tDrift) {
        float dtDrift = elapsed - expDur;
        float driftRatio = dtDrift / max(0.01, tDrift);
        float prog = peakProg + vLatest * dtDrift * (1.0 - 0.22 * driftRatio);
        dist = prog * maxDist;
    } else {
        float v = min(1.0, max(0.0, (elapsed - (expDur + tDrift)) / max(0.1, contrDur)));
        float returnProg = max(0.0, 1.0 - pow(v, 2.4));
        dist = driftPeakProg * returnProg * maxDist;
    }
    return home + rDir * (dist * rSpeed);
}

// Style 4: Magnetic Tokamak Fusion Reactor & Solar Plasma Donut — Magnetic pinch ignition,
// 3-strand helical plasma current confinement (q=4.2 pitch), pulsating coronal solar flares,
// 360° turntable precession, and cold fusion re-crystallization. Mirrors evaluateTorusParticle in physics-math.js.
vec3 evalTorusGPU(float i, vec3 home, float cd, float elapsed) {
    float t1 = 2.8;
    float t2 = 7.7;
    float t3 = 3.0;
    float t4 = 2.5;

    float p1h = mod(i * 37.119, 100.0) / 100.0;
    float p2h = mod(i * 61.19, 100.0) / 100.0;
    float p3h = mod(i * 83.11, 100.0) / 100.0;
    float p4h = mod(i * 53.17, 100.0) / 100.0;

    float te = elapsed * cd;

    float scale = uKnotScale > 0.0 ? uKnotScale : 14.5;
    float R0 = scale;
    float r0 = scale * 0.35;

    float strandId = mod(i, 3.0);
    float strandPhase = strandId * 2.094395;

    float theta0 = p1h * 6.283185;
    float phi0 = p2h * 6.283185 + strandPhase;

    float omegaToroidal = 0.75 * cd;
    float omegaPoloidal = 3.20 * cd;

    float theta = theta0 + omegaToroidal * te;
    float phi = phi0 + omegaPoloidal * te;

    float flareEnv = sin(clamp((elapsed - t1) / t2, 0.0, 1.0) * 3.14159265);
    float flarePulse = pow(abs(sin(3.5 * te + p3h * 6.28318)), 3.0);
    float flareRadius = (3.5 + 4.5 * p4h) * flarePulse * flareEnv;
    float flareZ = (2.2 * cos(2.8 * te + p1h * 6.28318)) * flareEnv;

    float currentR = R0 + (r0 * (0.85 + 0.30 * sqrt(p3h)) + flareRadius) * cos(phi);
    float localX = currentR * cos(theta);
    float localY = currentR * sin(theta);
    float localZ = (r0 * (0.85 + 0.30 * sqrt(p3h)) + flareRadius) * sin(phi) + flareZ;

    float tiltX = 0.28 * sin(0.45 * te);
    float tiltZ = 0.22 * cos(0.35 * te);
    float cTx = cos(tiltX);
    float sTx = sin(tiltX);
    float cTz = cos(tiltZ);
    float sTz = sin(tiltZ);

    vec3 kp = vec3(
        localX * cTz - localY * sTz,
        (localX * sTz + localY * cTz) * cTx - localZ * sTx,
        (localX * sTz + localY * cTz) * sTx + localZ * cTx
    );

    vec3 p;
    if (elapsed < t1) {
        float p1 = elapsed / t1;
        float e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);

        float pinchEnv = sin(clamp(p1 * 2.5, 0.0, 1.0) * 3.14159265);
        float pinchScale = 1.0 - 0.22 * pinchEnv;

        vec3 hPinch = home * pinchScale;

        float swirlAngle = 1.5 * cd * sin(3.14159265 * e1);
        float cS = cos(swirlAngle), sS = sin(swirlAngle);
        vec3 sPos = vec3(hPinch.x * cS - hPinch.z * sS, hPinch.y, hPinch.x * sS + hPinch.z * cS);

        p = mix(sPos, kp, e1);
    } else if (elapsed < t1 + t2) {
        p = kp;
    } else if (elapsed < t1 + t2 + t3) {
        float p3 = (elapsed - (t1 + t2)) / t3;
        float e3 = p3 * p3 * (3.0 - 2.0 * p3);
        p = vec3(kp.x * (1.0 - 0.35 * e3), kp.y * (1.0 - 0.35 * e3), kp.z * (1.0 - 0.70 * e3));
    } else {
        float tau4 = elapsed - (t1 + t2 + t3);
        float st = p2h * 0.25;
        float q = clamp((tau4 - st) / (t4 - st), 0.0, 1.0);
        float e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        vec3 quenchPos = vec3(kp.x * 0.65, kp.y * 0.65, kp.z * 0.30);
        p = mix(quenchPos, home, e4);
    }

    float yawU = clamp((elapsed - t1) / (t2 + t3), 0.0, 1.0);
    float yawS = yawU * yawU * yawU * (yawU * (yawU * 6.0 - 15.0) + 10.0);
    float yawA = 6.28318530718 * yawS;
    float cyw = cos(yawA);
    float syw = sin(yawA);
    p = vec3(cyw * p.x + syw * p.z, p.y, -syw * p.x + cyw * p.z);
    return p;
}

// Style 5: 3D Diffused Volumetric Murmuration Blobs — 2-pod independent flight,
// mid-flight merge into 1 giant super-blob, and subsequent re-separation. Mirrors evaluateMurmurationParticle in physics-math.js.
vec3 evalMurmurationGPU(float i, vec3 home, float cd, float elapsed,
        float swX, float swY, float swZ,
        float fX, float fY, float fZ,
        float phX, float phY, float phZ, float launchDir,
        float turnT, float turnDir, float splitT, float splitAng,
        float d1T, float d2T, float d3T, float dodgeRad, float dodgeStr,
        float boilAmp, float boilFreq, float churnMult, float flutterMult,
        float jinkAmp, float jinkFreq, float jinkPh, float breathAmp,
        float scoutAmp, float mergeTime, float podAngle) {
    float t1 = 2.0;
    float t2 = 7.0;
    float t3 = 3.0;
    float t4 = 2.0;

    float p1h = mod(i * 37.119, 100.0) / 100.0;
    float p2h = mod(i * 61.19, 100.0) / 100.0;
    float p3h = mod(i * 83.11, 100.0) / 100.0;
    float p4h = mod(i * 53.17, 100.0) / 100.0;

    float sweepCoord = (launchDir > 0.0) ? (home.x + 45.0) : (45.0 - home.x);
    float delay = sweepCoord * 0.010 + p2h * 0.35;
    float lt = elapsed - delay;
    if (lt <= 0.0) return home;

    float lb = min(1.0, lt / 1.0);
    lb = lb * lb * (3.0 - 2.0 * lb);
    float hop = sin(min(1.0, lt / 1.0) * 3.14159265) * 1.8;

    float te = elapsed * cd;

    // Swarm Base Path Center C(t)
    vec3 C = vec3(
        swX * sin(fX * te + phX),
        swY * sin(fY * te + phY) + 2.5 * cos(0.35 * te),
        swZ * cos(fZ * te + phZ)
    );

    // Analytic Velocity / Tangent Vector along Path
    vec3 V = vec3(
        swX * fX * cos(fX * te + phX),
        swY * fY * cos(fY * te + phY) - 0.88 * sin(0.35 * te),
        -swZ * fZ * sin(fZ * te + phZ)
    );
    float speed = max(0.001, length(V));
    vec3 t_dir = V / speed;

    // Smooth Orthogonal Normal & Binormal
    float roll = (0.50 * te + phX * 0.5) * turnDir;
    float pitch = 0.30 * te + phY * 0.5;
    vec3 n_raw = vec3(cos(roll) * (1.0 - t_dir.y * t_dir.y * 0.5), sin(pitch) * 0.7, -sin(roll));
    vec3 un_norm = normalize(n_raw);
    vec3 binorm = cross(t_dir, un_norm);

    // 2 Distinct Murmuration Pods
    float podSide = (floor(mod(i, 2.0)) == 0.0) ? 1.0 : -1.0;

    // Smooth Mid-Flight Merge & Re-separation Bell Curve
    float mergeCenter = (mergeTime > 0.0) ? mergeTime : 6.8;
    float uM = (elapsed - mergeCenter) / 1.6;
    float mergeEnvelope = exp(-uM * uM);

    // Flocking pod separation: contracts smoothly to 0 during merge, expands during independent flight
    float independentSep = (7.5 + 3.0 * breathAmp) * (1.0 - mergeEnvelope);
    float flankAngle = 0.85 * te * turnDir + podAngle;

    vec3 podOffset = (un_norm * cos(flankAngle) + binorm * sin(flankAngle)) * (podSide * independentSep);

    // Dynamic 3D Stretching & Concentration
    float speedFactor = min(1.0, speed / 14.0);
    float stretchLongitudinal = (0.9 + 2.0 * speedFactor * breathAmp) * (1.0 - 0.30 * mergeEnvelope);
    float blobRadiusScale = (1.0 + 0.50 * mergeEnvelope);
    float stretchLateral = blobRadiusScale / sqrt(max(0.4, stretchLongitudinal));

    // True 3D Solid Volumetric Dispersion
    float baseRadius = pow(max(0.0001, p1h), 0.3333333) * (4.8 + 2.4 * p4h) * stretchLateral;
    float theta0 = p2h * 6.283185;
    float cosPhi0 = (p3h - 0.5) * 2.0;
    float sinPhi0 = sqrt(max(0.0, 1.0 - cosPhi0 * cosPhi0));

    // Fluid-like 3D Convolution: Bounded phase integration
    float swirlAngle = (2.2 + 1.2 * p1h) * turnDir * te + p2h * 6.28318 + 0.12 * home.x;
    float thetaConvolute = theta0 + swirlAngle;

    float morphX = 1.0 + 0.25 * sin(1.8 * te + p3h * 3.14159);
    float morphY = 1.0 + 0.25 * cos(2.2 * te + p1h * 3.14159);

    float localTan = (baseRadius * sinPhi0 * cos(thetaConvolute)) * stretchLongitudinal;
    float localNorm = (baseRadius * sinPhi0 * sin(thetaConvolute) * morphX);
    float localBinorm = (baseRadius * cosPhi0 * morphY);

    // Shearing & Internal Eddy Waves
    float shearWave = sin(0.18 * (home.x + C.x) - 2.2 * te + podSide * 1.5) * (1.6 * jinkAmp);
    vec3 churn = vec3(
        sin(2.4 * te + p1h * 6.28318 + home.x * 0.08) * (1.2 * jinkAmp),
        cos(2.8 * te + p2h * 6.28318 + home.y * 0.08) * (0.9 * jinkAmp),
        sin(2.1 * te + p3h * 6.28318 + home.z * 0.08) * (1.2 * jinkAmp)
    );

    vec3 P = C + podOffset + t_dir * localTan + un_norm * localNorm + binorm * (localBinorm + shearWave) + churn + vec3(0.0, hop, 0.0);

    // Precision Landing Blend (Phase 4: 12.0 -> 14.0s)
    if (elapsed >= (t1 + t2 + t3)) {
        float tau4 = elapsed - (t1 + t2 + t3);
        float st = p2h * 0.35;
        float q = clamp((tau4 - st) / (t4 - st), 0.0, 1.0);
        float e4 = q * q * q * (q * (q * 6.0 - 15.0) + 10.0);
        P = mix(P, home, e4);
    }

    if (lb < 1.0) P = mix(home, P, lb);
    return P;
}

void main() {
    vec3 livePos = position;
    if (uGpuPhysics > 0.5) {
        livePos = homePosition;
        if (uExplosionActive > 0.01 && uExplosionElapsed >= 0.0) {
            if (uMotionStyle == 1) {
                livePos = evalTornadoGPU(aIndex, homePosition, funnelT, aSeed, aCustomDir, uExplosionElapsed, uSpinSpeed, uFunnelBottom, uFunnelHeight, uFunnelCrownRadius, uFunnelWaistRadius, uFunnelTailRadius, uFunnelWaistT, uFunnelCrownExp);
            } else if (uMotionStyle == 2) {
                livePos = evalBreezeGPU(aIndex, homePosition, aCustomDir, uExplosionElapsed, uBreezeBlowDir, uBreezeIntensity, uBreezeSwirl);
            } else if (uMotionStyle == 3) {
                livePos = evalKineticGPU(homePosition, aCustomDir, uExplosionElapsed);
            } else if (uMotionStyle == 4) {
                livePos = evalTorusGPU(aIndex, homePosition, aCustomDir, uExplosionElapsed);
            } else if (uMotionStyle == 5) {
                livePos = evalMurmurationGPU(aIndex, homePosition, aCustomDir, uExplosionElapsed,
                    uMSweepX, uMSweepY, uMSweepZ, uMFreqX, uMFreqY, uMFreqZ,
                    uMPhX, uMPhY, uMPhZ, uMLaunchDir,
                    uMTurnT, uMTurnDir, uMSplitT, uMSplitAng,
                    uMDodge1T, uMDodge2T, uMDodge3T, uMDodgeRad, uMDodgeStr,
                    uMBoilAmp, uMBoilFreq, uMChurnMult, uMFlutterMult,
                    uMJinkAmp, uMJinkFreq, uMJinkPh, uMBreathAmp, uMScoutAmp,
                    uMMergeTime, uMPodAngle);
            } else {
                livePos = evalExplosionGPU(homePosition, aRandomDir, aRandomSpeed, uMaxDist, uExpDuration, uDriftDuration, uContractionDuration, uExplosionElapsed);
            }
        }
    }

    // Smooth spatial gradient across the sculpture blended with mouse hover glow.
    // Charge feedback lives in the DOM cursor ring (#cursor-ring), not here.
    float spatialGrad = clamp((homePosition.y + 12.0) / 24.0 + 0.15 * sin(0.12 * homePosition.x), 0.0, 1.0);
    float heatRadius = uMouseInfluence;
    float mouseHeat = clamp(1.0 - distance(uMouse, livePos) / heatRadius, 0.0, 1.0);
    // Passing ripple wavefront flash: light follows each expanding ring.
    // Mirrors the JS kernel's rippleProfile(amp) exactly — speed 9+2.5*amp,
    // decay 2.2-0.3*amp, width 2.0+0.75*amp — bigger splashes spread faster,
    // reach farther, and stay bright en route.
    float waveGlow = 0.0;
    for (int r = 0; r < 8; r++) {
        vec4 rp = uRipples[r];
        if (rp.w > 0.0) {
            float dist = distance(livePos.xy, rp.xy);
            float ringR = rp.z * (9.0 + 2.5 * rp.w);
            float s = 1.0 - abs(dist - ringR) / (2.0 + 0.75 * rp.w);
            if (s > 0.0) {
                waveGlow += sin(3.14159265 * s) * exp(-(2.2 - 0.3 * rp.w) * rp.z) * rp.w * 0.35;
            }
        }
    }
    waveGlow = clamp(waveGlow, 0.0, 1.0);
    // Tap indicator ping: a small, quick sonar ring marking each of the first
    // two taps of the explode gesture. Subtle by design — light only, no push.
    if (uTapRing.w > 0.0) {
        float tapDist = distance(livePos.xy, uTapRing.xy);
        float tapR = uTapRing.z * 10.0 * (1.0 + 0.35 * (uTapRing.w - 1.0));
        float tapFade = max(0.0, 1.0 - uTapRing.z * 2.0);
        float ts = 1.0 - abs(tapDist - tapR) / 1.2;
        if (ts > 0.0) {
            waveGlow += sin(3.14159265 * ts) * tapFade * tapFade * 0.25;
        }
    }
    float hoverMix = mix(spatialGrad, 1.0, mouseHeat * 0.9);
    float tMix = clamp(max(hoverMix, waveGlow), 0.0, 1.0);
    vec3 themeColor = (tMix < 0.5)
        ? mix(uColorCold, uColorWarm, tMix * 2.0)
        : mix(uColorWarm, uColorHot, (tMix - 0.5) * 2.0);

    // Emoji mode keeps the sampled glyph color (eyes, tears, mouth, hearts stay
    // readable); text mode keeps the theme heatmap exactly as before.
    vec3 baseColor = mix(themeColor, sourceColor.rgb, uEmojiMode);

    // Movement heatmap: cooler near the particle's OWN initial position, hotter
    // the further it has been displaced.
    float movement = length(livePos - homePosition);
    float heat = smoothstep(0.05, uHeatDistance, movement);
    vec3 movementColor = (heat < 0.5)
        ? mix(uHeatCold, uHeatWarm, heat * 2.0)
        : mix(uHeatWarm, uHeatHot, (heat - 0.5) * 2.0);

    // Blend the particle's intrinsic themeColor with the kinetic heat and motion
    // so the themed colors remain vivid and animate across the entire trajectory
    vec3 themedMotionColor = mix(themeColor, movementColor, 0.45 * heat);
    vec3 motionColor = mix(themedMotionColor, sourceColor.rgb, uEmojiMode * uEmojiMotionMix);
    vColor = mix(baseColor, motionColor, uExplosionActive);

    // Audio-reactive brightness: mid/high energy brighten the particles, the envelope
    // gives a broad pulse while the blast is sounding.
    float audioBright = 1.0 + 0.35 * uAudioMid + 0.25 * uAudioHigh;
    vColor *= audioBright * (0.85 + 0.30 * uAudioEnvelope);

    // Depth cue: nearer particles (positive z depth) read slightly larger and
    // brighter, so the face-on sculpture still reads volumetric under the
    // orthographic projection.
    float depthCue = 1.0 + uDepthCue * homePosition.z;
    vColor *= depthCue;

    vCoverage = sourceColor.a;
    vSourceUV = aSourceUV;

    // Safe fade for the funnel tail.
    float funnelFade = clamp(
        (funnelT - uTornadoFadeStart) / max(uTornadoFadeEnd - uTornadoFadeStart, 1e-4),
        0.0, 1.0);
    vTornadoFade = mix(1.0, 0.14 + 0.86 * funnelFade, uTornadoActive);

    vec4 mvPosition = modelViewMatrix * vec4(livePos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation - corrected for device pixel ratio.
    float effectiveSampleSize = mix(sampleSize, 1.0, uEmojiMode);
    // Style 4 (torus knot): enlarge points so overlapping splats saturate the
    // strand interior — kills the twin-stripe limb artifact of additive blending.
    float stylePointSize = (uMotionStyle == 4) ? 1.3 : 1.0;
    gl_PointSize = uPointSize * uPixelRatio * uPointScale * depthCue * effectiveSampleSize * stylePointSize;
    gl_PointSize *= (1.0 + 0.5 * heat * uExplosionActive + 0.2 * uAudioHigh);
    gl_PointSize *= mix(1.0, 0.76 + 0.24 * funnelFade, uTornadoActive);
}
`,ra=`
uniform float uEmojiMode;
uniform float uUseSourceTexture;
uniform sampler2D uSourceTexture;
varying vec3 vColor;
varying float vCoverage;
varying float vTornadoFade;
varying vec2 vSourceUV;

void main() {
    // Soft circular falloff with a solid bright core for lively, luminous dots
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float softEdge = 1.0 - smoothstep(0.3, 1.0, r);

    // Approach C: sample the source canvas texture at this particle's UV coordinate.
    // Enhanced vibrancy & brightness boost so emojis and images feel luminous and alive.
    if (uUseSourceTexture > 0.5) {
        vec4 texel = texture2D(uSourceTexture, vSourceUV);
        vec3 vibrantColor = min(vec3(1.0), texel.rgb * 1.20);
        vec3 blendedColor = mix(vibrantColor, vColor, uEmojiMode * (1.0 - uUseSourceTexture + 0.001));
        float texAlpha = texel.a * softEdge * vTornadoFade;
        gl_FragColor = vec4(blendedColor, texAlpha);
        return;
    }

    float alpha = 0.9 * softEdge;
    // Emoji particles fade with their source coverage, keeping anti-aliased glyph
    // edges soft; text particles stay fully opaque as before.
    alpha *= mix(1.0, vCoverage, uEmojiMode);
    alpha *= vTornadoFade;
    gl_FragColor = vec4(vColor, alpha);
}
`,t={currentText:"Bring your message!",lastText:"Bring your message!",currentTheme:"ember",currentFont:"Outfit",messageMode:"text",activeImage:null,imageName:"",activePreset:null,lastRandomPreset:null,activeEmoji:null,lastEmoji:null,lastImage:null,lastImageName:"",audioEnabled:!0,gpuPhysics:!(typeof window<"u"&&(new URLSearchParams(window.location.search).get("noworker")==="1"||new URLSearchParams(window.location.search).get("gpu")==="0")),expansionDuration:m.presets.DEFAULT.expansionDuration,driftDuration:m.presets.DEFAULT.driftDuration||3,contractionDuration:m.presets.DEFAULT.contractionDuration,explosionMaxDistMultiplier:m.presets.DEFAULT.explosionMaxDistMultiplier,motionStyle:m.presets.DEFAULT.motionStyle,activeExpansionDuration:null,activeContractionDuration:null,activeMaxDist:null,actualTravelRadius:0,travelApplied:!1,embersSpawned:!1,dodgeEmbersFired:!1,afterglowStartTime:null,soundPitch:m.presets.DEFAULT.soundPitch,soundDuration:m.presets.DEFAULT.soundDuration,soundType:m.presets.DEFAULT.soundType,trailStrength:m.presets.DEFAULT.trailStrength,pattern:{spokes:m.presets.DEFAULT.spokes,spokeJitter:m.presets.DEFAULT.spokeJitter,spinSpeed:m.presets.DEFAULT.spinSpeed,funnelHeight:m.presets.DEFAULT.funnelHeight,funnelBottom:m.presets.DEFAULT.funnelBottom,funnelCrownRadius:m.presets.DEFAULT.funnelCrownRadius,funnelWaistRadius:m.presets.DEFAULT.funnelWaistRadius,funnelTailRadius:m.presets.DEFAULT.funnelTailRadius,funnelWaistT:m.presets.DEFAULT.funnelWaistT,funnelCrownT:m.presets.DEFAULT.funnelCrownT,funnelFadeStart:m.presets.DEFAULT.funnelFadeStart,funnelFadeEnd:m.presets.DEFAULT.funnelFadeEnd,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"},heatCold:[.1,.4,1],heatWarm:[1,1,.1],heatHot:[1,.1,.1],get totalExplosionDuration(){const e=s&&s.activeStyle>=0?s.activeStyle:this.motionStyle;if(e===1){const l=this.expansionDuration||3.5,n=this.pattern&&this.pattern.vortexDuration?this.pattern.vortexDuration:4.5,d=this.pattern&&this.pattern.equilibriumDuration?this.pattern.equilibriumDuration:3.5,p=this.contractionDuration||3.5;return l+n+d+p}if(e===2)return 12;if(e===3)return 7.5;if(e===4)return 16;if(e===5)return 14;const a=this.activeExpansionDuration||this.expansionDuration,o=this.activeContractionDuration||this.contractionDuration;return a+(e===0||e===-1?3:0)+o}},r={scene:null,camera:null,renderer:null,particles:null,clock:new Bn,trailPoints:null,trailData:null,trailLive:null,trailPosAttr:null,trailLiveAttr:null,emberPoints:null,emberData:null,emberVel:null,emberLife:null,emberPosAttr:null,emberLifeAttr:null,targetZ:m.initialZ,autoFit:!0,prevTime:0,prevDt:0,prevKFrame:0,prevDampFrame:0},s={posHome:null,posLive:null,explosionOrigin:null,springDisp:null,springVel:null,randomDir:null,randomSpeed:null,funnelT:null,funnelRadialX:null,funnelRadialZ:null,activeStyle:-1,slots:[],sendQueue:[],seq:0,sourceGeneration:0,motionToken:0,explosionStartTime:-1,positionsDirty:!1,randomized:null};function sa(){return typeof window<"u"&&new URLSearchParams(window.location.search).get("noworker")==="1"?15e3:de||t.gpuPhysics?3e4:15e3}const h={keys:{ArrowUp:!1,ArrowDown:!1,ArrowLeft:!1,ArrowRight:!1,"+":!1,"-":!1,"=":!1," ":!1},mouseWorld:new ve,mouseLocal:new ve,invMatrix:new Zn,mouseWorldPos:new ve(-1e3,-1e3,0),lastClickTime:0,lastPinchDist:null,lastMidpoint:new Wn,lastGestureEndTime:0,inputDebounceTimer:null,toastTimer:null,flashTimer:null,drawerCloseTimer:null,wordmarkTimer:null,menuRestoreDesktop:!1,menuRestoreMobile:!1,isDragging:!1,prevMouseX:0,prevMouseY:0,pendingPointer:null,charge:{active:!1,pointerId:-1,x0:0,y0:0,t0:0,value:0,release:null},tapRing:{pending:null,x:0,y:0,age:0,count:0,active:!1}},le={el:null,elInner:null,stageEl:null,x:0,y:0,visible:!1,scale:1};function Qt(e){le.el&&(le.x=e.clientX,le.y=e.clientY,le.el.style.transform=`translate3d(${le.x}px, ${le.y}px, 0)`)}const he=ea(),fe={idx:0,lastEmitMs:0,prevCX:0,prevCY:0,hasPrevClient:!1,speedU:0},Qe={x:0,y:0,z:0},Se=new ve;function zt(e,a,o){ta(he,fe.idx,e,a,o),fe.idx=(fe.idx+1)%mt}function la(){he.fill(0)}const R={uMouse:{value:new ve(-1e3,-1e3,0)},uMouseInfluence:{value:m.mouseInfluence},uPointSize:{value:m.pointSize},uPixelRatio:{value:1},uPointScale:{value:m.pointSizeAttenuationScale/m.initialZ},uDepthCue:{value:.28},uColorHot:{value:new ve(1,0,0)},uColorWarm:{value:new ve(1,1,0)},uColorCold:{value:new ve(1,1,1)},uExplosionActive:{value:0},uTornadoActive:{value:0},uTornadoFadeStart:{value:.03},uTornadoFadeEnd:{value:.3},uHeatDistance:{value:m.heatDistance},uHeatCold:{value:new ve(.1,.4,1)},uHeatWarm:{value:new ve(1,1,.1)},uHeatHot:{value:new ve(1,.1,.1)},uAudioMid:{value:0},uAudioHigh:{value:0},uAudioEnvelope:{value:0},uPointSizeTrail:{value:.4},uTrailStrength:{value:.25},uEmojiMode:{value:0},uEmojiMotionMix:{value:m.emojiMotionMix},uUseSourceTexture:{value:0},uSourceTexture:{value:null},uGpuPhysics:{value:1},uMotionStyle:{value:0},uExplosionElapsed:{value:-1},uExpDuration:{value:2},uDriftDuration:{value:3},uContractionDuration:{value:2},uMaxDist:{value:35},uSpinSpeed:{value:5.2},uFunnelBottom:{value:-22},uFunnelHeight:{value:46},uFunnelCrownRadius:{value:22},uFunnelWaistRadius:{value:3.5},uFunnelTailRadius:{value:.8},uFunnelWaistT:{value:.42},uFunnelCrownExp:{value:1.4},uBreezeBlowDir:{value:1},uBreezeIntensity:{value:1},uBreezeSwirl:{value:0},uMSweepX:{value:24},uMSweepY:{value:4},uMSweepZ:{value:12},uMFreqX:{value:3.456},uMFreqY:{value:5.341},uMFreqZ:{value:2.827},uMPhX:{value:.4},uMPhY:{value:0},uMPhZ:{value:1.2},uMLaunchDir:{value:1},uMTurnT:{value:99},uMTurnDir:{value:1},uMSplitT:{value:99},uMSplitAng:{value:0},uMDodge1T:{value:3.9},uMDodge2T:{value:7.1},uMDodge3T:{value:99},uMDodgeRad:{value:8},uMDodgeStr:{value:1},uMBoilAmp:{value:0},uMBoilFreq:{value:14},uMChurnMult:{value:1},uMFlutterMult:{value:1},uMJinkAmp:{value:0},uMJinkFreq:{value:5.5},uMJinkPh:{value:0},uMBreathAmp:{value:1},uMScoutAmp:{value:0},uMMergeTime:{value:6.8},uMPodAngle:{value:0},uKnotScale:{value:11},uRipples:{value:Array.from({length:mt},()=>new Jt(0,0,0,0))},uTapRing:{value:new Jt(0,0,0,0)}};let et=0,tt=0,Vt=null,Pt=0,Et=0;function Ee(e,a="info"){const o=document.getElementById("toast");o&&(o.textContent=e,o.classList.remove("info","success","error"),o.classList.add(a==="success"||a==="error"?a:"info"),o.classList.add("show"),clearTimeout(h.toastTimer),h.toastTimer=setTimeout(()=>{o.classList.remove("show")},3e3))}function Je(e){const a=document.getElementById("sr-announce");a&&(a.textContent=e)}function ca(){const e=document.getElementById("flash");e&&(e.classList.remove("active"),e.offsetWidth,e.classList.add("active"),clearTimeout(h.flashTimer),h.flashTimer=setTimeout(()=>e.classList.remove("active"),120))}let xe=null,We=null,be=null,Fe=null;function ua(){xe&&We||(xe||(xe=new(window.AudioContext||window.webkitAudioContext)),We=xe.createGain(),We.gain.value=1,be=xe.createAnalyser(),be.fftSize=256,be.smoothingTimeConstant=.6,We.connect(be),be.connect(xe.destination),Fe=new Uint8Array(be.frequencyBinCount))}function Rt(e,a,o,i){let l=0,n=0;const d=Math.max(0,Math.floor(a*i)),p=Math.min(i,Math.floor(o*i));for(let x=d;x<p;x++)l+=e[x]/255,n++;return n?l/n:0}function pa(){if(!be||!xe||!Fe)return;if(xe.state!=="running"){R.uAudioEnvelope.value=0;return}if(s.explosionStartTime<0&&R.uAudioEnvelope.value<.005&&R.uAudioMid.value<.005&&R.uAudioHigh.value<.005){R.uAudioMid.value=0,R.uAudioHigh.value=0,R.uAudioEnvelope.value=0;return}be.getByteFrequencyData(Fe);const e=Fe.length,a=Rt(Fe,.02,.25,e),o=Rt(Fe,.25,.55,e),i=Rt(Fe,.55,.92,e);R.uAudioMid.value+=(o-R.uAudioMid.value)*.5,R.uAudioHigh.value+=(i-R.uAudioHigh.value)*.5;const l=Math.min(1,a*1.3+o*.5+i*.6);R.uAudioEnvelope.value+=(l-R.uAudioEnvelope.value)*.6}function ma(e){try{if(ua(),!xe)return;const a=xe.currentTime,o=Math.max(.3,e*.55),i=xe.createOscillator();i.type="sine",i.frequency.setValueAtTime(85,a),i.frequency.exponentialRampToValueAtTime(32,a+o);const l=xe.createGain();l.gain.setValueAtTime(1e-4,a),l.gain.exponentialRampToValueAtTime(.24,a+Math.min(.25,o*.3)),l.gain.exponentialRampToValueAtTime(1e-4,a+o),i.connect(l),l.connect(We),i.start(a),i.stop(a+o+.05),setTimeout(()=>{try{i.disconnect(),l.disconnect()}catch{}},(o+.1)*1e3)}catch(a){console.warn("Rumble synthesis error:",a)}}async function vn(e){if(!e)return;const a=`bold ${m.fontSize}px "${e}"`;try{await document.fonts.load(a)}catch(o){console.warn(`Font load note for "${e}":`,o)}}let nt=null,en=null;function da(e){nt||(nt=document.createElement("canvas"),en=nt.getContext("2d",{willReadFrequently:!0}));const a=nt,o=en;a.width=m.canvasWidth,a.height=m.canvasHeight,o.fillStyle="black",o.fillRect(0,0,m.canvasWidth,m.canvasHeight),o.fillStyle="white",o.font=`bold ${m.fontSize}px "${t.currentFont}", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,m.canvasWidth/2,m.canvasHeight/2);const i=o.getImageData(0,0,m.canvasWidth,m.canvasHeight).data,l=m.canvasWidth,n=m.canvasHeight,d=m.pixelStep,p=m.pixelThreshold;let x=0,X=1/0,M=-1/0,g=1/0,c=-1/0;for(let q=0;q<n;q+=d)for(let z=0;z<l;z+=d)i[(q*l+z)*4]>p&&(x++,z<X&&(X=z),z>M&&(M=z),q<g&&(g=q),q>c&&(c=q));if(x===0)return null;const A=m.targetWorldWidth/Math.max(M-X,1),S=(X+M)/2,b=(g+c)/2,F=new Float32Array(x*3);let D=0;for(let q=0;q<n;q+=d)for(let z=0;z<l;z+=d)i[(q*l+z)*4]>p&&(F[D++]=(z-S)*A,F[D++]=(b-q)*A,F[D++]=0);return F}let at=null,tn=null;function fa(e){if(!e)return null;const a=e.naturalWidth||e.width,o=e.naturalHeight||e.height;if(!a||!o)return null;at||(at=document.createElement("canvas"),tn=at.getContext("2d",{willReadFrequently:!0}));const i=m.imageRasterSize,l=at,n=tn;l.width=i,l.height=i,n.clearRect(0,0,i,i),n.imageSmoothingEnabled=!0;const d=Math.round(i*.04),p=Math.min((i-d*2)/a,(i-d*2)/o),x=Math.max(1,Math.round(a*p)),X=Math.max(1,Math.round(o*p)),M=Math.round((i-x)/2),g=Math.round((i-X)/2);n.drawImage(e,M,g,x,X);const c=n.getImageData(0,0,i,i).data,A=m.imagePixelStep,S=m.imageAlphaThreshold,b=[],F=[],D=[],q=[],z=[];let P=1/0,B=-1/0,E=1/0,Y=-1/0;const W=(u,U)=>u<0||U<0||u>=i||U>=i?0:c[(U*i+u)*4+3];for(let u=0;u<i;u+=A)for(let U=0;U<i;U+=A){const O=(u*i+U)*4,K=c[O+3];if(K<=S)continue;b.push(U,u),F.push(c[O],c[O+1],c[O+2]),D.push(K),q.push(1);const ee=W(U-A,u)<=S||W(U+A,u)<=S||W(U,u-A)<=S||W(U,u+A)<=S;z.push(ee),U<P&&(P=U),U>B&&(B=U),u<E&&(E=u),u>Y&&(Y=u)}if(b.length===0)return null;const C=Math.max(B-P,1),V=Math.max(Y-E,1),L=m.targetWorldWidth/Math.max(C,V),y=(P+B)/2,w=(E+Y)/2,I=m.imageDepthRange*.5,f=b.length/2,k=[],Z=[],G=[],v=[],T=[];for(let u=0;u<f;u+=8){const U=b[u*2],O=b[u*2+1];k.push((U-y)*L,(w-O)*L,-I),Z.push(U/i,1-O/i),G.push(F[u*3],F[u*3+1],F[u*3+2]),v.push(D[u]),T.push(q[u])}for(let u=0;u<f;u++){if(!z[u])continue;const U=b[u*2],O=b[u*2+1],K=F[u*3],ee=F[u*3+1],Q=F[u*3+2],ae=D[u],N=q[u],$=U/i,oe=1-O/i,re=(U-y)*L,ce=(w-O)*L;k.push(re,ce,-I*.33),Z.push($,oe),G.push(K,ee,Q),v.push(ae),T.push(N),k.push(re,ce,I*.33),Z.push($,oe),G.push(K,ee,Q),v.push(ae),T.push(N)}for(let u=0;u<f;u++){const U=b[u*2],O=b[u*2+1];k.push((U-y)*L,(w-O)*L,I),Z.push(U/i,1-O/i),G.push(F[u*3],F[u*3+1],F[u*3+2]),v.push(D[u]),T.push(q[u])}const H=new Float32Array(k),te=new Float32Array(Z),ne=new Uint8Array(G),J=new Uint8Array(v),_=new Uint8Array(T);return{flat:H,uvs:te,colors:ne,covers:J,sizes:_,featureCount:f,frontCount:f,bounds:{w:C,h:V},sourceCanvas:l}}let ot=null,nn=null;function ha(e){ot||(ot=document.createElement("canvas"),nn=ot.getContext("2d",{willReadFrequently:!0}));const a=ot,o=nn,i=m.emojiRasterSize;a.width=i,a.height=i,o.clearRect(0,0,i,i),o.fillStyle="white",o.font=`${m.emojiFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,i/2,i/2+i*.02);const l=o.getImageData(0,0,i,i).data,n=m.emojiPixelStep,d=m.pixelThreshold,p=[],x=[],X=[],M=[];let g=1/0,c=-1/0,A=1/0,S=-1/0;const b=(f,k)=>f<0||k<0||f>=i||k>=i?0:l[(k*i+f)*4+3];for(let f=0;f<i;f+=n)for(let k=0;k<i;k+=n){const Z=(f*i+k)*4,G=l[Z+3];if(G<=d)continue;p.push(k,f),x.push(l[Z],l[Z+1],l[Z+2]),X.push(G);const v=b(k-n,f)<=d||b(k+n,f)<=d||b(k,f-n)<=d||b(k,f+n)<=d;M.push(v),k<g&&(g=k),k>c&&(c=k),f<A&&(A=f),f>S&&(S=f)}if(p.length===0)return null;const F=m.targetWorldWidth/Math.max(c-g,1),D=(g+c)/2,q=(A+S)/2,P=m.emojiDepthRange*.5,B=p.length/2,E=[],Y=[],W=[],C=[],V=[];for(let f=0;f<B;f+=4){const k=p[f*2],Z=p[f*2+1];E.push((k-D)*F,(q-Z)*F,-P),Y.push(k/i,1-Z/i),W.push(x[f*3],x[f*3+1],x[f*3+2]),C.push(X[f]),V.push(1)}for(let f=0;f<B;f++){if(!M[f])continue;const k=p[f*2],Z=p[f*2+1],G=x[f*3],v=x[f*3+1],T=x[f*3+2],H=X[f],te=k/i,ne=1-Z/i,J=(k-D)*F,_=(q-Z)*F;E.push(J,_,-P*.33),Y.push(te,ne),W.push(G,v,T),C.push(H),V.push(1),E.push(J,_,P*.33),Y.push(te,ne),W.push(G,v,T),C.push(H),V.push(1)}for(let f=0;f<B;f++){const k=p[f*2],Z=p[f*2+1];E.push((k-D)*F,(q-Z)*F,P),Y.push(k/i,1-Z/i),W.push(x[f*3],x[f*3+1],x[f*3+2]),C.push(X[f]),V.push(1)}const L=new Float32Array(E),y=new Float32Array(Y),w=new Uint8Array(W),j=new Uint8Array(C),I=new Uint8Array(V);return{flat:L,uvs:y,colors:w,covers:j,sizes:I,featureCount:B,frontCount:B,bounds:{w:c-g,h:S-A},sourceCanvas:a}}let Ft=0;async function Te(e,a=!1){Ft++;const o=Ft;await vn(t.currentFont);const i=`bold ${m.fontSize}px "${t.currentFont}"`;if(!document.fonts.check(i))try{await document.fonts.load(i)}catch(u){console.warn(`Failed to pre-load custom font "${t.currentFont}":`,u)}if(o!==Ft)return;s.sourceGeneration++,s.motionToken++,s.randomized=null;const l=!!r.particles;let n=null;if(l){const u=r.particles.geometry.attributes.position;n=u?u.array:null}const d=t.messageMode==="emoji"&&t.activeEmoji&&m.emojiOptions.includes(t.activeEmoji),p=t.messageMode==="image"&&!!t.activeImage,x=d?ha(e):null,X=p?fa(t.activeImage):null,M=x||X,g=!!M,c=M?M.flat:p?null:da(e);if(!c){Ee(p?"The image has no visible pixels!":"Text must contain at least one visible character!","error");return}const{jitterXY:A,jitterZ:S,explosionSpeedMin:b,explosionSpeedRange:F}=m,D=g?m.emojiDensityOverride:m.density;let q=c.length/3,z=1;const P=sa(),B=Math.floor(P/D);let E=c,Y=null,W=null,C=null,V=null;if(g){if(Y=M.colors,W=M.covers,C=M.sizes,V=M.uvs||null,q>P){const u=[],U=M.frontCount||q;if(U<=P){for(let oe=0;oe<U;oe++)u.push(oe);const N=P-U,$=q-U;if(N>0&&$>0){const oe=Math.max(1,Math.ceil($/N));for(let re=U;re<q&&u.length<P;re+=oe)u.push(re)}}else{const N=Math.ceil(U/P);for(let $=0;$<U&&u.length<P;$+=N)u.push($)}const O=new Float32Array(u.length*3),K=new Uint8Array(u.length*3),ee=new Uint8Array(u.length),Q=new Uint8Array(u.length),ae=V?new Float32Array(u.length*2):null;for(let N=0;N<u.length;N++){const $=u[N];O[N*3]=E[$*3],O[N*3+1]=E[$*3+1],O[N*3+2]=E[$*3+2],K[N*3]=Y[$*3],K[N*3+1]=Y[$*3+1],K[N*3+2]=Y[$*3+2],ee[N]=W[$],Q[N]=C[$],ae&&V&&(ae[N*2]=V[$*2],ae[N*2+1]=V[$*2+1])}E=O,Y=K,W=ee,C=Q,V=ae,q=u.length}}else q*D>P&&(z=Math.max(1,Math.ceil(q/B)));const y=Math.ceil(q/z)*D;s.posHome=new Float32Array(y*3),s.posLive=new Float32Array(y*3),s.explosionOrigin=new Float32Array(y*3),s.springDisp=new Float32Array(y*3),s.springVel=new Float32Array(y*3),s.randomDir=new Float32Array(y*3),s.randomSpeed=new Float32Array(y),s.funnelT=new Float32Array(y),s.funnelRadialX=new Float32Array(y),s.funnelRadialZ=new Float32Array(y);const w=Math.PI*(3-Math.sqrt(5));for(let u=0;u<y;u++){const U=(u*.6180339887498949+.5)%1,O=.75+.3*((u*.7548776662466927+.17)%1),K=u*w%(Math.PI*2);s.funnelT[u]=Math.pow(U,.85),s.funnelRadialX[u]=Math.cos(K)*O,s.funnelRadialZ[u]=Math.sin(K)*O}const j=new Uint8Array(y*4),I=new Uint8Array(y),f=new Float32Array(y*2),k=d?{xy:m.emojiJitterXY,z:m.emojiJitterZ}:{xy:m.imageJitterXY,z:m.imageJitterZ},Z=g?k.xy:A,G=g?k.z:S;let v=0;for(let u=0;u<q;u+=z,v++){const U=E[u*3],O=E[u*3+1],K=E[u*3+2];for(let ee=0;ee<D;ee++){const Q=v*D+ee,ae=Q*3,N=ae+1,$=ae+2,oe=U+(Math.random()-.5)*Z,re=O+(Math.random()-.5)*Z,ce=K+(Math.random()-.5)*G;s.posHome[ae]=oe,s.posHome[N]=re,s.posHome[$]=ce;const ie=a?(Math.random()-.5)*45:0,se=a?(Math.random()-.5)*45:0,pe=a?(Math.random()-.5)*35:0;s.posLive[ae]=oe+ie,s.posLive[N]=re+se,s.posLive[$]=ce+pe,s.springDisp[ae]=ie,s.springDisp[N]=se,s.springDisp[$]=pe;const ue=Math.random()*Math.PI*2,ye=Math.acos(Math.random()*2-1);s.randomDir[ae]=Math.sin(ye)*Math.cos(ue),s.randomDir[N]=Math.sin(ye)*Math.sin(ue),s.randomDir[$]=Math.cos(ye),s.randomSpeed[Q]=b+Math.random()*F,Y?(j[Q*4]=Y[u*3],j[Q*4+1]=Y[u*3+1],j[Q*4+2]=Y[u*3+2],j[Q*4+3]=W[u],I[Q]=C[u],V&&(f[Q*2]=V[u*2],f[Q*2+1]=V[u*2+1])):(j[Q*4]=255,j[Q*4+1]=255,j[Q*4+2]=255,j[Q*4+3]=255,I[Q]=1,f[Q*2]=0,f[Q*2+1]=0)}}Xt=Fa(),r.autoFit&&_e(),l&&!a&&n&&n.length===s.posLive.length&&(s.posLive.set(n),s.springDisp.fill(0),s.springVel.fill(0)),s.explosionOrigin.set(s.posLive),s.slots=[],s.sendQueue=[];for(let u=0;u<2;u++){const U={posLive:new Float32Array(y*3),springDisp:new Float32Array(y*3),springVel:new Float32Array(y*3),inFlight:!1,needsReset:!1};U.posLive.set(s.posLive),U.springDisp.set(s.springDisp),U.springVel.set(s.springVel),s.slots.push(U)}const T=!r.particles,H=T?new Ct:r.particles.geometry,te=new me(s.posLive,3);te.setUsage(je),H.setAttribute("position",te),H.setAttribute("homePosition",new me(s.posHome,3)),H.setAttribute("sourceColor",new me(j,4,!0)),H.setAttribute("sampleSize",new me(I,1)),H.setAttribute("funnelT",new me(s.funnelT,1)),H.setAttribute("aSourceUV",new me(f,2)),Bt();const ne=new Float32Array(y),J=new Float32Array(y*3),_=new Float32Array(y);for(let u=0;u<y;u++)ne[u]=u,J[u*3]=s.funnelRadialX[u],J[u*3+1]=0,J[u*3+2]=s.funnelRadialZ[u],_[u]=u%2===0?1:-1;if(H.setAttribute("aRandomDir",new me(new Float32Array(s.randomDir),3)),H.setAttribute("aRandomSpeed",new me(new Float32Array(s.randomSpeed),1)),H.setAttribute("aIndex",new me(ne,1)),H.setAttribute("aSeed",new me(J,3)),H.setAttribute("aCustomDir",new me(_,1)),T){const u=new kt({uniforms:R,vertexShader:ia,fragmentShader:ra,blending:ct,depthWrite:!1,transparent:!0});r.particles=new Lt(H,u),r.scene.add(r.particles)}if(R.uEmojiMode.value=g?1:0,R.uPointSize.value=d?m.emojiPointSize:p?m.imagePointSize:m.pointSize,R.uDepthCue.value=d?m.emojiDepthCue:p?m.imageDepthCue:.28,r.particles.material.blending=g?Yn:ct,r.particles.material.needsUpdate=!0,R.uSourceTexture.value&&(R.uSourceTexture.value.dispose(),R.uSourceTexture.value=null),g&&M&&M.sourceCanvas){const u=new jn(M.sourceCanvas);u.minFilter=Kt,u.magFilter=Kt,u.needsUpdate=!0,R.uSourceTexture.value=u,R.uUseSourceTexture.value=1}else R.uUseSourceTexture.value=0;r.particles.rotation.set(0,0,0),de&&de.postMessage({type:"init",data:{posHome:s.posHome.slice(),explosionOrigin:s.explosionOrigin.slice(),randomDir:s.randomDir.slice(),randomSpeed:s.randomSpeed.slice(),funnelT:s.funnelT.slice(),funnelRadialX:s.funnelRadialX.slice(),funnelRadialZ:s.funnelRadialZ.slice()}}),ga()}function ga(){const e=s.posLive.length;r.trailData=new Float32Array(e),r.trailLive=new Float32Array(e),r.trailData.set(s.posLive),r.trailLive.set(s.posLive);const a=new me(r.trailData,3);a.setUsage(je);const o=new me(r.trailLive,3);o.setUsage(je),r.trailPoints&&(r.scene.remove(r.trailPoints),r.trailPoints.geometry.dispose(),r.trailPoints.material.dispose());const i=new Ct;i.setAttribute("position",a),i.setAttribute("livePosition",o),i.setAttribute("homePosition",new me(s.posHome,3)),i.setAttribute("funnelT",new me(s.funnelT,1)),r.trailPoints=new Lt(i,new kt({uniforms:R,vertexShader:Hn,fragmentShader:Gn,blending:ct,depthWrite:!1,transparent:!0})),r.trailPoints.frustumCulled=!1,r.scene.add(r.trailPoints),r.trailPosAttr=a,r.trailLiveAttr=o;const l=300;r.emberData=new Float32Array(l*3),r.emberVel=new Float32Array(l*3),r.emberLife=new Float32Array(l),r.emberCount=l;const n=new me(r.emberData,3);n.setUsage(je);const d=new me(r.emberLife,1);d.setUsage(je),r.emberPoints&&(r.scene.remove(r.emberPoints),r.emberPoints.geometry.dispose(),r.emberPoints.material.dispose());const p=new Ct;p.setAttribute("position",n),p.setAttribute("aLife",d),r.emberPoints=new Lt(p,new kt({uniforms:{},vertexShader:On,fragmentShader:_n,blending:ct,depthWrite:!1,transparent:!0})),r.emberPoints.renderOrder=2,r.scene.add(r.emberPoints),r.emberPosAttr=n,r.emberLifeAttr=d}function va(){if(!r.particles||!r.trailData)return;if(De&&r.trailPoints){r.trailPoints.visible=!1;return}if(t.gpuPhysics&&s.explosionStartTime>=0){r.trailPoints&&(r.trailPoints.visible=!1);return}if(r.trailPoints&&(r.trailPoints.visible=!0),s.positionsDirty||s.explosionStartTime>=0||h.isDragging||h.mouseLocal&&h.mouseLocal.x>-500||qt(he))r.trailSettleFrames=0;else{if(r.trailSettleFrames>=20)return;r.trailSettleFrames=(r.trailSettleFrames||0)+1}s.positionsDirty=!1;const a=r.particles.geometry.attributes.position.array,o=r.trailData,i=r.trailLive,l=.22;for(let n=0;n<a.length;n++)o[n]+=(a[n]-o[n])*l,i[n]=a[n];r.trailPosAttr.needsUpdate=!0,r.trailLiveAttr.needsUpdate=!0}function xa(){if(!r.emberData||!r.particles||De)return;const e=t.activePreset&&m.presets[t.activePreset]||null,a=e&&e.emberBudget||90,o=Math.min(r.emberCount,a),i=r.particles.geometry.attributes.position.array,l=s.explosionOrigin||s.posHome,n=i.length,d=[];for(let p=0;p<n/3;p++){const x=p*3,X=i[x]-l[x],M=i[x+1]-l[x+1],g=i[x+2]-l[x+2];X*X+M*M+g*g>1&&d.push(p)}if(d.length!==0)for(let p=0;p<o;p++){const x=p*3,M=d[Math.random()*d.length|0]*3;r.emberData[x]=i[M],r.emberData[x+1]=i[M+1],r.emberData[x+2]=i[M+2];const g=i[M]-l[M],c=i[M+1]-l[M+1],A=i[M+2]-l[M+2],S=Math.sqrt(g*g+c*c+A*A)||1,b=3+Math.random()*14;r.emberVel[x]=g/S*b+(Math.random()-.5)*4,r.emberVel[x+1]=c/S*b+(Math.random()-.5)*4,r.emberVel[x+2]=A/S*b*.5+(Math.random()-.5)*2,r.emberLife[p]=.35+Math.random()*.45}}function ya(e,a){const o=e||{},i=o.mSweepX!=null?o.mSweepX:24,l=o.mSweepY!=null?o.mSweepY:4,n=o.mSweepZ!=null?o.mSweepZ:12,d=o.mFreqX!=null?o.mFreqX:3.456,p=o.mFreqY!=null?o.mFreqY:5.341,x=o.mFreqZ!=null?o.mFreqZ:2.827,X=o.mPhX!=null?o.mPhX:.4,M=o.mPhY!=null?o.mPhY:0,g=o.mPhZ!=null?o.mPhZ:1.2,c=Math.min(8.9,a*.92+1.1),A=Math.max(0,(c-2)/7);return{x:i*Math.sin(A*d+X)+5*Math.sin(1.7*a+1),y:l*Math.sin(A*p+M)+3*Math.sin(A*Math.PI)+2*Math.sin(1.3*a),z:n*Math.sin(A*x+g)+4*Math.sin(1.6*a+2)}}function Ta(e){if(!r.emberData||!r.emberPoints||De)return;const a=t.activePreset&&m.presets[t.activePreset]||null,o=a&&a.emberBudget||60,i=Math.min(r.emberCount,o),l=ya(t.pattern,e);for(let n=0;n<i;n++){const d=n*3;r.emberData[d]=l.x+(Math.random()-.5)*1.6,r.emberData[d+1]=l.y+(Math.random()-.5)*1.6,r.emberData[d+2]=l.z+(Math.random()-.5)*1.6;let p=Math.random()*2-1,x=Math.random()*2-1,X=Math.random()*2-1;const M=Math.sqrt(p*p+x*x+X*X)||1,g=5+Math.random()*8;r.emberVel[d]=p/M*g,r.emberVel[d+1]=x/M*g+3,r.emberVel[d+2]=X/M*g,r.emberLife[n]=.35+Math.random()*.45}r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0}function Ma(e){if(!r.emberData)return;if(De&&r.emberPoints){r.emberPoints.visible=!1;return}r.emberPoints&&(r.emberPoints.visible=!0);const a=r.emberCount,o=Math.pow(.02,e);let i=0;for(let l=0;l<a;l++){if(r.emberLife[l]<=0)continue;i++;const n=l*3;r.emberData[n]+=r.emberVel[n]*e,r.emberData[n+1]+=r.emberVel[n+1]*e,r.emberData[n+2]+=r.emberVel[n+2]*e,r.emberVel[n+1]-=8*e,r.emberVel[n]*=o,r.emberVel[n+1]*=o,r.emberVel[n+2]*=o,r.emberLife[l]-=e,r.emberLife[l]<=0&&(r.emberLife[l]=0)}i>0&&(r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0)}const Ze=new ve;function Yt(e,a){const o=r.renderer.domElement.getBoundingClientRect(),i=(e-o.left)/o.width*2-1,l=-((a-o.top)/o.height)*2+1;r.camera.isOrthographicCamera&&(Ze.set(i,l,0).unproject(r.camera),h.mouseWorld.copy(Ze),h.mouseWorld.z=0)}function an(e,a,o){const i=r.renderer.domElement.getBoundingClientRect(),l=(e-i.left)/i.width*2-1,n=-((a-i.top)/i.height)*2+1;r.camera.isOrthographicCamera&&(Ze.set(l,n,0).unproject(r.camera),o.set(Ze.x,Ze.y,0).applyMatrix4(h.invMatrix))}function Bt(){if(!s.randomDir||!s.randomSpeed)return;const e=s.randomSpeed.length,{explosionSpeedMin:a,explosionSpeedRange:o}=m,i=t.pattern,l=s.posHome,n=typeof t.motionStyle=="number"&&t.motionStyle>=0?t.motionStyle:Math.floor(Math.random()*4);if(n===1){const W=Math.random()<.5?1:-1,C=(3.8+Math.random()*2.8)*W,V=38+Math.random()*16,L=18+Math.random()*12,y=2.4+Math.random()*2.8,w=.8+Math.random()*1.6,j=.32+Math.random()*.16,I=1.15+Math.random()*.65;t.pattern={...t.pattern,spinSpeed:C,funnelHeight:V,funnelCrownRadius:L,funnelWaistRadius:y,funnelTailRadius:w,funnelWaistT:j,funnelCrownExp:I}}et++;const d=[1.35,1.85,.9,2.2],x=d[et%d.length]*(.92+Math.random()*.16),M=(et%2===1?!0:Math.random()<.5)?1:-1;let g=M,c=(Math.random()-.5)*.08,A=(Math.random()-.5)*.05;const S=Math.sqrt(g*g+c*c+A*A)||1;g/=S,c/=S,A/=S;const b=[0,.85,1.45,.35,0,1.2],F=b[et%b.length],D=F===0?0:F*(.85+Math.random()*.3),q=.85+.5*x+.4*D+(Math.random()-.5)*.25,z=.18+Math.random()*.1,P=(Math.random()-.5)*.2;ge={blowDir:M,intensity:x,swirl:D,turbAmp:q,billowFreq:z,windTilt:P,windAngleY:(Math.random()-.5)*.22,windAngleZ:(Math.random()-.5)*.12,strengthMult:x,easePower:1.45+Math.random()*.4,seedXi:Math.random()*100,peakX:(Math.random()-.5)*22,peakY:3.5+Math.random()*5,peakAmp:(16+Math.random()*7)*x,peakWidthX:.065+Math.random()*.025,peakWidthY:.11+Math.random()*.035,creaseY:-(3.5+Math.random()*4),creaseAmp:6.5+Math.random()*3,creaseFreq:.11+Math.random()*.04,billowAmp1:7.5+Math.random()*3,billowAmp2:3+Math.random()*2,depthAmp:13+Math.random()*4.5,shearMult:.22+Math.random()*.18},s.breeze=ge;const B=Math.max(2,i.spokes||12),E=i.spokeJitter!=null?i.spokeJitter:.03,Y=Math.PI*(3-Math.sqrt(5));for(let W=0;W<e;W++){const C=W*3,V=C+1,L=C+2;let y,w,j;if(n===1){const f=l[C],k=l[L],Z=f*f+k*k;let G,v;if(Z>1e-6){const H=1/Math.sqrt(Z);G=-k*H,v=f*H}else{const H=Math.random()*Math.PI*2;G=Math.cos(H),v=Math.sin(H)}const T=Math.random()<.5?1:-1;y=G*T+(Math.random()-.5)*.15,w=.72+(Math.random()-.5)*.12,j=v*T+(Math.random()-.5)*.15}else if(n===2){g=M,c=(Math.random()-.5)*.04,A=(Math.random()-.5)*.04;const f=Math.hypot(g,c,A)||1;g/=f,c/=f,A/=f,y=g*.92+(Math.random()*2-1)*.08,w=(Math.random()*2-1)*.12,j=(Math.random()*2-1)*.12}else if(n===3){const f=W%B,k=f*Y,Z=Math.acos(Math.max(-1,Math.min(1,1-2*(f+.5)/B))),G=Math.sin(Z)*Math.cos(k),v=Math.sin(Z)*Math.sin(k),T=Math.cos(Z);y=G+(Math.random()-.5)*2*E,w=v+(Math.random()-.5)*2*E,j=T+(Math.random()-.5)*2*E}else{const f=Math.random()*Math.PI*2,k=Math.acos(Math.random()*2-1);y=Math.sin(k)*Math.cos(f),w=Math.sin(k)*Math.sin(f),j=Math.cos(k)}const I=Math.sqrt(y*y+w*w+j*j)||1;if(y/=I,w/=I,j/=I,n===2)s.randomSpeed[W]=(a+Math.random()*o)*(1.4+Math.random()*.9);else if(n===3)s.randomSpeed[W]=(a+Math.random()*o)*(1.5+Math.random()*.7);else{const f=.75+Math.random()*.55;s.randomSpeed[W]=(a+Math.random()*o)*f}s.randomDir[C]=y,s.randomDir[V]=w,s.randomDir[L]=j}if(s.randomized={dirs:s.randomDir.slice(0,oa*3),style:n},s.activeStyle=n,r.particles&&r.particles.geometry){const W=r.particles.geometry.attributes.aRandomDir;W&&W.array&&W.array.length===s.randomDir.length&&(W.copyArray(s.randomDir),W.needsUpdate=!0);const C=r.particles.geometry.attributes.aRandomSpeed;C&&C.array&&C.array.length===s.randomSpeed.length&&(C.copyArray(s.randomSpeed),C.needsUpdate=!0)}}function wa(){if(!r.particles||!s.explosionOrigin)return;const e=r.particles.geometry.attributes.position.array;if(e.length===s.explosionOrigin.length){s.explosionOrigin.set(e),s.posLive.set(e),s.springDisp.fill(0),s.springVel.fill(0),s.motionToken++;for(const a of s.slots)a.inFlight?a.needsReset=!0:((!a.posLive||!a.posLive.buffer||a.posLive.buffer.byteLength===0)&&(a.posLive=new Float32Array(e.length),a.springDisp=new Float32Array(e.length),a.springVel=new Float32Array(e.length)),a.posLive.set(e),a.springDisp.fill(0),a.springVel.fill(0),a.needsReset=!1)}}function xn(e){document.querySelectorAll(".preset-chip").forEach(o=>{o.disabled=e,o.classList.toggle("disabled",e),e?o.setAttribute("aria-disabled","true"):o.removeAttribute("aria-disabled")})}function Ge(e=!1){if(s.explosionStartTime>=0)return;if(s.explosionStartTime=-1,wa(),t.actualTravelRadius=0,t.travelApplied=!1,t.embersSpawned=!1,t.dodgeEmbersFired=!1,t.afterglowStartTime=null,rt=0,t.motionStyle===5){tt++;const l=[{sweepX:28,sweepY:6.5,sweepZ:15,freqX:.52,freqY:.95,freqZ:.48,breathAmp:1.2,jinkAmp:1.1,launchDir:1,turnDir:1,mergeTime:6.8},{sweepX:32,sweepY:4.8,sweepZ:11,freqX:.42,freqY:.82,freqZ:.38,breathAmp:1,jinkAmp:1.3,launchDir:-1,turnDir:-1,mergeTime:6.4},{sweepX:22,sweepY:7.5,sweepZ:20,freqX:.58,freqY:1.05,freqZ:.52,breathAmp:1.35,jinkAmp:1.3,launchDir:1,turnDir:-1,mergeTime:7},{sweepX:26,sweepY:6.8,sweepZ:14,freqX:.48,freqY:.9,freqZ:.44,breathAmp:1.15,jinkAmp:1.2,launchDir:-1,turnDir:1,mergeTime:6.6},{sweepX:23,sweepY:8.5,sweepZ:13,freqX:.4,freqY:.75,freqZ:.4,breathAmp:1.3,jinkAmp:1.1,launchDir:1,turnDir:1,mergeTime:7.2}],n=l[tt%l.length],d=()=>(Math.random()-.5)*.2;t.pattern={...t.pattern,mSweepX:n.sweepX*(1+d()),mSweepY:n.sweepY*(1+d()),mSweepZ:n.sweepZ*(1+d()),mFreqX:n.freqX*(1+d()),mFreqY:n.freqY*(1+d()),mFreqZ:n.freqZ*(1+d()),mPhX:Math.random()*6.283,mPhY:Math.random()*6.283,mPhZ:Math.random()*6.283,mLaunchDir:tt%2===1?n.launchDir:-n.launchDir,mTurnDir:Math.random()<.5?n.turnDir:-n.turnDir,mBreathAmp:n.breathAmp*(1+d()),mJinkAmp:n.jinkAmp*(1+d()),mMergeTime:n.mergeTime+(Math.random()-.5)*1,mPodAngle:Math.random()*6.283,mBoilAmp:.3+Math.random()*.2,mModeIndex:tt%l.length}}t.activeMaxDist=t.explosionMaxDistMultiplier*(.8+Math.random()*.4),t.activeExpansionDuration=t.expansionDuration*(.85+Math.random()*.3),t.activeContractionDuration=t.contractionDuration||4;const a=t.activeContractionDuration;t.gpuPhysics?Bt():de?de.postMessage({type:"randomize",data:{explosionSpeedMin:m.explosionSpeedMin,explosionSpeedRange:m.explosionSpeedRange,motionStyle:t.motionStyle,pattern:t.pattern,breeze:ge,explosionOrigin:s.explosionOrigin.slice(),motionToken:s.motionToken,sourceGeneration:s.sourceGeneration}}):Bt(),s.explosionStartTime=r.clock.getElapsedTime(),xn(!0),Ua();const o=t.activePreset||t.lastRandomPreset,i=o&&m.presets[o]?m.presets[o]:null;ht(i&&i.description?i.description:ft(t.messageMode)),(t.motionStyle===0||t.motionStyle===-1)&&ca(),t.audioEnabled&&Kn(t,a),Je(`Explosion triggered for "${t.currentText}"`)}function Oe(e,a,o,i=!0){const l=new URL(window.location);l.searchParams.set("t",e),l.searchParams.set("theme",a),l.searchParams.set("font",o),i?window.history.pushState({},"",l):window.history.replaceState({},"",l)}function jt(e){t.activeExpansionDuration=null,t.activeContractionDuration=null,t.expansionDuration=e.expansionDuration,t.driftDuration=e.driftDuration!==void 0?e.driftDuration:0,t.contractionDuration=e.contractionDuration,t.explosionMaxDistMultiplier=e.explosionMaxDistMultiplier,t.motionStyle=e.motionStyle!=null?e.motionStyle:-1,s.activeStyle=t.motionStyle,t.soundPitch=e.soundPitch,t.soundDuration=e.soundDuration,t.soundType=e.soundType,t.trailStrength=e.trailStrength!=null?e.trailStrength:.25,t.pattern={spokes:e.spokes!=null?e.spokes:12,spokeJitter:e.spokeJitter!=null?e.spokeJitter:.03,spinSpeed:e.spinSpeed!=null?e.spinSpeed:0,funnelHeight:e.funnelHeight!=null?e.funnelHeight:0,funnelBottom:e.funnelBottom!=null?e.funnelBottom:0,funnelCrownRadius:e.funnelCrownRadius!=null?e.funnelCrownRadius:0,funnelWaistRadius:e.funnelWaistRadius!=null?e.funnelWaistRadius:0,funnelTailRadius:e.funnelTailRadius!=null?e.funnelTailRadius:0,funnelWaistT:e.funnelWaistT!=null?e.funnelWaistT:0,funnelCrownT:e.funnelCrownT!=null?e.funnelCrownT:0,funnelFadeStart:e.funnelFadeStart!=null?e.funnelFadeStart:0,funnelFadeEnd:e.funnelFadeEnd!=null?e.funnelFadeEnd:0,vortexDuration:e.vortexDuration!=null?e.vortexDuration:4.5,equilibriumDuration:e.equilibriumDuration!=null?e.equilibriumDuration:3.5,swayAmp:e.swayAmp!=null?e.swayAmp:0,swayFreq:e.swayFreq!=null?e.swayFreq:0,gustAmp:e.gustAmp!=null?e.gustAmp:0,gustFreq:e.gustFreq!=null?e.gustFreq:0,windDrift:e.windDrift!=null?e.windDrift:0,turbulence:e.turbulence!=null?e.turbulence:0};const a=m.themes[t.currentTheme]||m.themes.ember;t.heatCold=a.cold,t.heatWarm=a.warm,t.heatHot=a.hot,R.uHeatCold.value.set(...t.heatCold),R.uHeatWarm.value.set(...t.heatWarm),R.uHeatHot.value.set(...t.heatHot),R.uTornadoFadeStart.value=t.pattern.funnelFadeStart,R.uTornadoFadeEnd.value=t.pattern.funnelFadeEnd,R.uTrailStrength.value=t.trailStrength}function ze(){jt(m.presets.DEFAULT)}function yn(){if(s.explosionStartTime>=0||t.activePreset)return;const e=Object.keys(m.presets).filter(o=>o!=="DEFAULT"),a=e[Math.floor(Math.random()*e.length)];jt(m.presets[a]),t.lastRandomPreset=a}function st(e,a=!0){const o=m.themes[e]||m.themes.ember;t.currentTheme=e,R.uColorHot.value.set(...o.hot),R.uColorWarm.value.set(...o.warm),R.uColorCold.value.set(...o.cold),R.uHeatHot.value.set(...o.hot),R.uHeatWarm.value.set(...o.warm),R.uHeatCold.value.set(...o.cold),document.querySelectorAll(".theme-swatch").forEach(i=>{const l=i.getAttribute("data-theme")===e;i.classList.toggle("active",l),i.setAttribute("aria-pressed",l?"true":"false")}),Oe(t.currentText,t.currentTheme,t.currentFont,a),Je(`Theme changed to ${e}`)}async function Tn(e,a=!0,o=!1){t.currentFont=e,document.querySelectorAll("#font-select, #drawer-font-select").forEach(i=>{i.value=e}),t.messageMode!=="text"&&(t.messageMode="text",Ce("text")),t.activeEmoji&&(t.activeEmoji=null,Me(null)),await vn(e),await Te(t.currentText,o),Oe(t.currentText,t.currentTheme,t.currentFont,a),Je(`Font changed to ${e}`)}async function Mn(e,a=!0){const o=e.trim(),i=o.length>0?o:"Bring your message!";t.currentText=i,t.messageMode==="text"&&(t.lastText=i),await Te(i,!1),Oe(t.currentText,t.currentTheme,t.currentFont,a),Je(`Text updated to "${t.currentText}"`)}function Wt(e){const a=document.querySelectorAll(".char-counter");if(!a.length)return;const o=[...e].length;a.forEach(i=>{i.textContent=`${o}/25`,i.classList.remove("warning","danger"),o>=25?i.classList.add("danger"):o>=20&&i.classList.add("warning")})}async function It(e,a=!1){jt(m.presets[e]||m.presets.DEFAULT),a&&await Te(t.currentText,!0)}const Aa="#drawer, #menu-toggle-btn, #drawer-backdrop, #dock, #topbar, #input-bar, #hint, #toast",dt=e=>!!e.target.closest(Aa);function Da(e){if(dt(e))return;if(e.pointerType==="mouse"&&(h.isDragging=!0,h.prevMouseX=e.clientX,h.prevMouseY=e.clientY),e.pointerType==="touch"&&!e.isPrimary){h.charge.active=!1,h.charge.release=null;return}s.explosionStartTime<0&&(h.charge.active=!0,h.charge.pointerId=e.pointerId,h.charge.x0=e.clientX,h.charge.y0=e.clientY,h.charge.t0=performance.now(),h.charge.value=0,h.charge.release=null);const a=performance.now();h.clickCount=a-h.lastClickTime<m.tapWindowMs?h.clickCount+1:1,h.lastClickTime=a,h.clickCount<m.tapCount&&s.explosionStartTime<0&&(h.tapRing.pending={clientX:e.clientX,clientY:e.clientY,count:h.clickCount}),h.clickCount>=m.tapCount&&(yn(),Ge(),h.clickCount=0)}function Sa(e){if(!dt(e)){if(e.touches.length===1)Yt(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const a=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY;h.lastPinchDist=Math.sqrt(a*a+o*o),h.lastMidpoint.set((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2)}}}function ba(e){if(!dt(e)){if(e.preventDefault(),e.touches.length===1)Yt(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const a=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY,i=Math.sqrt(a*a+o*o);h.lastPinchDist&&(r.targetZ-=(i-h.lastPinchDist)*.15,r.autoFit=!1),h.lastPinchDist=i;const l=(e.touches[0].clientX+e.touches[1].clientX)/2,n=(e.touches[0].clientY+e.touches[1].clientY)/2;r.particles&&(r.particles.rotation.y+=(l-h.lastMidpoint.x)*.005,r.particles.rotation.x+=(n-h.lastMidpoint.y)*.005),h.lastMidpoint.set(l,n)}}}function on(e){if(e.pointerType==="mouse"&&(h.isDragging=!1),h.charge.active&&e.pointerId===h.charge.pointerId){if(h.charge.active=!1,e.type==="pointercancel")return;const a=performance.now()-h.charge.t0,o=Math.min(1,Math.max(0,(a-m.rippleTapGraceMs)/m.rippleChargeMs));h.charge.release={clientX:h.charge.x0,clientY:h.charge.y0,charge:o}}}function Pa(){h.lastPinchDist=null,h.lastGestureEndTime=performance.now()}function _e(){const e=document.getElementById("stage"),a=Math.max(e.clientWidth,1),o=Math.max(e.clientHeight,1);r.camera.aspect=a/o;const i=r.camera.position.z*Math.tan(m.cameraAngleDeg*Math.PI/360),l=i*r.camera.aspect;r.camera.left=-l,r.camera.right=l,r.camera.top=i,r.camera.bottom=-i,r.camera.updateProjectionMatrix(),r.renderer.setSize(a,o,!1);const n=Math.min(window.devicePixelRatio,m.maxPixelRatio);r.renderer.setPixelRatio(n),R.uPixelRatio.value=n,r.autoFit&&(r.targetZ=Ca(a,o))}function Ea(){const e=document.getElementById("topbar");return e?e.getBoundingClientRect().height:0}function Ra(){const e=document.getElementById("dock");if(e){if(e.classList.contains("collapsed")){const i=e.firstElementChild;return(i?i.getBoundingClientRect().height:0)+24}const o=e.getBoundingClientRect();if(o.height>0)return o.height}const a=document.getElementById("input-bar");if(a){const o=a.getBoundingClientRect();if(o.height>0)return o.height}return 0}function Fa(){const e=s.posHome;if(!e||e.length===0)return{w:80,h:80};let a=1/0,o=-1/0,i=1/0,l=-1/0;for(let p=0;p<e.length;p+=3){const x=e[p],X=e[p+1];x<a&&(a=x),x>o&&(o=x),X<i&&(i=X),X>l&&(l=X)}const n=o-a,d=l-i;return!isFinite(n)||!isFinite(d)||n<1e-6||d<1e-6?{w:80,h:80}:{w:n,h:d}}function Ca(e,a){const o=Math.tan(m.cameraAngleDeg*Math.PI/360),i=Xt,l=m.fitMargin,n=Math.max(e-2*l,1),d=Math.max(a-(Ea()+l)-(Ra()+l),1),p=i.w*a/(2*o*n),x=i.h*a/(2*o*d);return Math.min(m.zoomMax,Math.max(p,x,m.zoomMin))}const ka="Type a message — your words become thousands of glowing particles.",La="Pick an emoji — it bursts into thousands of glowing, colorful particles.",qa="Upload an image — its pixels become thousands of glowing particles.";function ft(e){return e==="emoji"?La:e==="image"?qa:ka}function ht(e){const a=document.getElementById("context-line");a&&(a.textContent=e);const o=document.getElementById("mobile-context-line");o&&(o.textContent=e)}function lt(e){t.activePreset=e,document.querySelectorAll(".preset-chip").forEach(i=>{i.getAttribute("data-text")===e?i.classList.add("active"):i.classList.remove("active")});const o=m.presets[e];ht(o&&o.description?o.description:ft(t.messageMode))}function Pe(){t.activePreset=null,document.querySelectorAll(".preset-chip").forEach(a=>{a.classList.remove("active")}),ht(ft(t.messageMode))}function Me(e){document.querySelectorAll(".emoji-chip").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-emoji")===e)})}function Ce(e){const a=e==="emoji"||e==="image"?e:"text";t.messageMode=a,document.querySelectorAll(".message-option").forEach(i=>{const l=i.getAttribute("data-message-mode")===a;i.classList.toggle("active",l),i.setAttribute("aria-selected",l?"true":"false")}),document.querySelectorAll(".text-message-mode").forEach(i=>{i.hidden=a!=="text"}),document.querySelectorAll(".emoji-message-mode").forEach(i=>{i.hidden=a!=="emoji"}),document.querySelectorAll(".image-message-mode").forEach(i=>{i.hidden=a!=="image"});const o=document.getElementById("input-bar");o&&(o.style.display=a==="text"?"":"none")}function rn(){r.particles&&(r.scene.remove(r.particles),r.particles=null),r.trailPoints&&(r.trailPoints.visible=!1),r.emberPoints&&(r.emberPoints.visible=!1),s.posHome=new Float32Array(0),s.posLive=new Float32Array(0),s.explosionOrigin=new Float32Array(0),s.springDisp=new Float32Array(0),s.springVel=new Float32Array(0),s.randomDir=new Float32Array(0),s.randomSpeed=new Float32Array(0),s.funnelT=new Float32Array(0),s.funnelRadialX=new Float32Array(0),s.funnelRadialZ=new Float32Array(0),s.slots=[],s.sendQueue=[],s.sourceGeneration++,s.motionToken++,Xt={w:80,h:80}}async function za(e){if(Ce(e),Pe(),ze(),t.messageMode==="emoji"){t.activeImage=null;const a=t.lastEmoji&&m.emojiOptions.includes(t.lastEmoji)?t.lastEmoji:null;a?(t.activeEmoji=a,Me(a),ut(a),await Te(a,!1),Oe(a,t.currentTheme,t.currentFont,!0)):(t.activeEmoji=null,Me(null),rn())}else if(t.messageMode==="image"){t.activeEmoji=null,Me(null);const a=document.querySelectorAll(".image-name");t.lastImage?(t.activeImage=t.lastImage,a.forEach(o=>{o.textContent=t.lastImageName}),await Te(t.currentText,!1)):(t.activeImage=null,a.forEach(o=>{o.textContent="No file chosen"}),rn())}else{t.activeEmoji=null,t.activeImage=null,Me(null);const a=t.lastText&&t.lastText.trim()||"Bring your message!";t.currentText=a,ut(a),await Te(a,!1),Oe(t.currentText,t.currentTheme,t.currentFont,!0)}}function Va(e){if(!e)return;if(!e.type.startsWith("image/")){Ee("Please choose an image file!","error");return}const a=URL.createObjectURL(e),o=new Image;o.onload=async()=>{URL.revokeObjectURL(a),Ce("image"),t.activeImage=o,t.lastImage=o,t.lastImageName=e.name,t.imageName=e.name,t.activeEmoji=null,Me(null),Pe(),ze(),document.querySelectorAll(".image-name").forEach(i=>{i.textContent=e.name}),await Te(t.currentText,!1),Je(`Image uploaded: ${e.name}`)},o.onerror=()=>{URL.revokeObjectURL(a),Ee("Could not read that image!","error")},o.src=a}const Ba=1e3;function sn(){clearTimeout(h.drawerCloseTimer),h.drawerCloseTimer=setTimeout(Ve,Ba)}function wn(){clearTimeout(h.drawerCloseTimer)}function An(){const e=document.getElementById("drawer"),a=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");wn(),e&&e.classList.add("open"),a&&a.classList.add("active"),o&&o.setAttribute("aria-expanded","true")}function Ve(){const e=document.getElementById("drawer"),a=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");wn(),e&&e.classList.remove("open"),a&&a.classList.remove("active"),o&&o.setAttribute("aria-expanded","false")}function Ia(){const e=document.getElementById("drawer");e&&e.classList.contains("open")?Ve():An()}function Dn(){const e=document.getElementById("dock");if(!e||e.classList.contains("collapsed"))return!1;e.classList.add("collapsed");const a=document.getElementById("dock-toggle-btn");return a&&(a.setAttribute("aria-expanded","false"),a.title="Expand controls"),!0}function Sn(){const e=document.getElementById("dock");if(!e)return;e.classList.remove("collapsed");const a=document.getElementById("dock-toggle-btn");a&&(a.setAttribute("aria-expanded","true"),a.title="Collapse controls")}function Zt(){r.autoFit&&(_e(),setTimeout(()=>{r.autoFit&&_e()},460))}function Ua(){const e=document.getElementById("dock");h.menuRestoreDesktop=!!(e&&!e.classList.contains("collapsed")),Dn();const a=document.getElementById("drawer");h.menuRestoreMobile=!!(a&&a.classList.contains("open")),Ve(),Zt()}function Xa(){h.menuRestoreMobile&&(h.menuRestoreMobile=!1,An()),h.menuRestoreDesktop&&(h.menuRestoreDesktop=!1,Sn()),Zt()}function ut(e){document.querySelectorAll("#text-input, #mobile-text-input").forEach(a=>{a.value=e}),Wt(e)}function ln(e){Ce("text"),Pe(),t.activeEmoji=null,t.activeImage=null,Me(null),ze(),Wt(e),clearTimeout(h.inputDebounceTimer),h.inputDebounceTimer=setTimeout(async()=>{await Mn(e)},m.inputDebounceMs)}function Ya(){r.renderer.render(r.scene,r.camera),r.renderer.domElement.toBlob(e=>{if(!e)return;const a=URL.createObjectURL(e),o=document.createElement("a"),i=(t.messageMode==="image"&&t.imageName?t.imageName:t.currentText).replace(/[^a-z0-9]/gi,"_").toLowerCase();o.download=`artz-sculpture-${i||"kinetic"}.png`,o.href=a,o.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)},"image/png")}async function ja(){try{const e=new URLSearchParams;t.activeEmoji?e.set("t",t.activeEmoji):t.messageMode==="text"&&t.currentText&&e.set("t",t.currentText),t.currentTheme&&t.currentTheme!=="ember"&&e.set("theme",t.currentTheme),t.currentFont&&t.currentFont!=="Outfit"&&e.set("font",t.currentFont),t.activePreset&&e.set("preset",t.activePreset);const a=e.toString(),o=`${window.location.origin}${window.location.pathname}${a?"?"+a:""}`;if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(o);else{const i=document.createElement("input");i.value=o,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i)}Ee("Link copied to clipboard!","success")}catch{Ee("Could not copy link","error")}}function Wa(){t.audioEnabled=!t.audioEnabled,document.querySelectorAll(".audio-btn").forEach(e=>{e.setAttribute("aria-pressed",t.audioEnabled.toString()),e.title=t.audioEnabled?"Toggle Sound (Mute/Unmute)":"Sound: MUTED (Click to unmute)"}),document.querySelectorAll(".audio-icon").forEach(e=>{e.textContent=(t.audioEnabled,"??")}),Ee(t.audioEnabled?"?? Sound effects enabled":"?? Sound effects muted")}function pt(){const e=document.getElementById("hint");e&&e.classList.add("dismissed");try{localStorage.setItem("artz-hint-seen","1")}catch{}}function Za(){const e=document.getElementById("text-input"),a=document.getElementById("mobile-text-input"),o=document.getElementById("menu-toggle-btn"),i=document.getElementById("menu-close-btn"),l=document.getElementById("drawer-backdrop"),n=document.getElementById("drawer"),d=document.getElementById("dock-toggle-btn"),p=document.getElementById("hint-dismiss"),x=document.getElementById("wordmark");if(x){const c=[{cls:"is-rippling",ms:1400},{cls:"is-playing",ms:1800},{cls:"is-dropping",ms:1600},{cls:"is-imploding",ms:1700}],A=700,S=()=>c.map(z=>z.cls),b=z=>{x.setAttribute("aria-label",z?"KINETICS — click to play title animation":"KINETICS — click to stop the title animation"),x.title=z?"Click to play":"Click to stop"};let F=!1,D=0;const q=()=>{const z=c[D];D=(D+1)%c.length,x.classList.remove(...S()),x.offsetWidth,x.classList.add(z.cls),h.wordmarkTimer=setTimeout(q,z.ms+A)};x.addEventListener("click",()=>{De||(F=!F,clearTimeout(h.wordmarkTimer),F?(D=0,b(!1),q()):(b(!0),x.classList.remove(...S())))})}o&&o.addEventListener("click",()=>{Ia()}),i&&i.addEventListener("click",()=>{Ve()}),l&&l.addEventListener("click",()=>{Ve()}),n&&(n.addEventListener("click",c=>{c.target.closest(".message-option")||c.target.closest("select")||sn()}),n.querySelectorAll("select").forEach(c=>{c.addEventListener("change",sn)})),d&&d.addEventListener("click",()=>{const c=document.getElementById("dock");c&&(c.classList.contains("collapsed")?Sn():Dn(),Zt())}),p&&p.addEventListener("click",pt);try{localStorage.getItem("artz-hint-seen")==="1"&&pt()}catch{}Vt=document.getElementById("status-fps");const X=document.getElementById("status-gpu");X&&(X.textContent=t.gpuPhysics?"GPU":de?"WORKER":"CPU"),ht(ft(t.messageMode)),e&&(e.value=t.currentText,Wt(t.currentText),e.addEventListener("input",()=>{a&&a.value!==e.value&&(a.value=e.value),ln(e.value)})),a&&(a.value=t.currentText,a.addEventListener("input",()=>{e&&e.value!==a.value&&(e.value=a.value),ln(a.value)})),document.querySelectorAll(".message-option").forEach(c=>{c.addEventListener("click",()=>{za(c.getAttribute("data-message-mode"))})}),document.querySelectorAll(".image-input").forEach(c=>{c.addEventListener("change",()=>{Va(c.files&&c.files[0]),c.value=""})}),document.querySelectorAll(".theme-swatch").forEach(c=>{c.addEventListener("click",()=>{Pe(),ze(),st(c.getAttribute("data-theme"))})}),document.querySelectorAll("#font-select, #drawer-font-select").forEach(c=>{c.value=t.currentFont,c.addEventListener("change",async()=>{Pe(),ze(),await Tn(c.value)})}),document.querySelectorAll(".capture-btn").forEach(c=>{c.addEventListener("click",Ya)}),document.querySelectorAll(".share-btn").forEach(c=>{c.addEventListener("click",ja)}),document.querySelectorAll(".audio-btn").forEach(c=>{c.addEventListener("click",Wa)}),document.querySelectorAll(".preset-chip").forEach(c=>{c.addEventListener("click",async()=>{if(s.explosionStartTime>=0)return;const A=c.getAttribute("data-text");await It(A),lt(A),Ge()})}),document.querySelectorAll(".emoji-chip").forEach(c=>{c.addEventListener("click",async()=>{const A=c.getAttribute("data-emoji");A&&(Ce("emoji"),Pe(),ze(),t.activeEmoji=A,t.lastEmoji=A,Me(A),ut(A),await Mn(A))})})}function cn(){if(de){try{de.terminate()}catch{}de=null;for(const e of s.slots)e.inFlight=!1;s.sendQueue.length=0}}const He=[1,1.25,1.5,2];let Ha={level:He.length-1,slowStreak:0,fastStreak:0};function un(e){const a=Math.min(window.devicePixelRatio,He[e]);r.renderer.setPixelRatio(a),R.uPixelRatio.value=a}function Ga(e){const a=Ha;if(e>28)a.slowStreak++,a.fastStreak=0,a.slowStreak>=30&&(a.slowStreak=0,a.level>0&&(a.level--,un(a.level)));else if(e<16){a.fastStreak++,a.slowStreak=0;const o=He.length-1;a.fastStreak>=120&&a.level<o&&Math.min(window.devicePixelRatio,He[a.level+1])>Math.min(window.devicePixelRatio,He[a.level])&&(a.fastStreak=0,a.level++,un(a.level))}else a.slowStreak=0,a.fastStreak=0}function bn(){const e=performance.now();requestAnimationFrame(bn),Pt++,performance.now()-Et>=500&&(Vt&&(Vt.textContent=`${Math.round(Pt*1e3/(performance.now()-Et))} FPS`),Pt=0,Et=performance.now());const a=r.clock.getElapsedTime(),o=Math.min(a-r.prevTime,.05);r.prevTime=a,pa();const{keys:i,invMatrix:l,lastGestureEndTime:n}=h,{particles:d,camera:p}=r;if(d){i.ArrowUp&&(d.rotation.x-=m.rotationStep,h.lastGestureEndTime=performance.now()),i.ArrowDown&&(d.rotation.x+=m.rotationStep,h.lastGestureEndTime=performance.now()),i.ArrowLeft&&(d.rotation.y-=m.rotationStep,h.lastGestureEndTime=performance.now()),i.ArrowRight&&(d.rotation.y+=m.rotationStep,h.lastGestureEndTime=performance.now());const v=i.ArrowUp||i.ArrowDown||i.ArrowLeft||i.ArrowRight,T=performance.now()-n<m.autoReturnGracePeriodMs;if(!v&&!h.lastPinchDist&&!T&&!h.isDragging){const H=m.rotationAutoReturnLerp;d.rotation.x=$e.lerp(d.rotation.x,0,H),d.rotation.y=$e.lerp(d.rotation.y,0,H)}}(i["+"]||i["="])&&(r.targetZ-=m.zoomSpeed,r.autoFit=!1),i["-"]&&(r.targetZ+=m.zoomSpeed,r.autoFit=!1),r.targetZ=$e.clamp(r.targetZ,m.zoomMin,m.zoomMax),p.position.z=$e.lerp(p.position.z,r.targetZ,m.zoomLerp),Math.abs(p.position.z-r.targetZ)<.005&&(p.position.z=r.targetZ);const x=p.position.z*Math.tan(m.cameraAngleDeg*Math.PI/360),X=x*p.aspect;if(p.left=-X,p.right=X,p.top=x,p.bottom=-x,p.updateProjectionMatrix(),R.uPointScale.value=m.pointSizeAttenuationScale/p.position.z,!d){r.renderer.render(r.scene,p);return}if(h.pendingPointer){const v=h.pendingPointer;if(h.charge.active&&v.pointerId===h.charge.pointerId&&Math.hypot(v.clientX-h.charge.x0,v.clientY-h.charge.y0)>m.chargeCancelPx&&(h.charge.active=!1),fe.hasPrevClient){const T=r.renderer.domElement.getBoundingClientRect(),H=(p.right-p.left)/Math.max(T.width,1);fe.speedU=Math.hypot(v.clientX-fe.prevCX,v.clientY-fe.prevCY)*H/Math.max(o,1e-4)}if(fe.prevCX=v.clientX,fe.prevCY=v.clientY,fe.hasPrevClient=!0,Yt(v.clientX,v.clientY),h.isDragging&&v.pointerType==="mouse"){const T=v.clientX-h.prevMouseX,H=v.clientY-h.prevMouseY;r.particles&&(r.particles.rotation.y+=T*.005,r.particles.rotation.x+=H*.005),h.prevMouseX=v.clientX,h.prevMouseY=v.clientY,h.lastGestureEndTime=performance.now()}h.pendingPointer=null}l.copy(d.matrixWorld).invert(),h.mouseLocal.copy(h.mouseWorld).applyMatrix4(l);const M=s.explosionStartTime>=0;if(M?R.uMouse.value.set(-1e3,-1e3,0):R.uMouse.value.copy(h.mouseLocal),M)qt(he)&&la(),h.charge.active=!1,h.charge.value=0,h.charge.release=null,h.tapRing.active=!1,h.tapRing.pending=null;else{if(h.charge.release){const H=h.charge.release;if(h.charge.release=null,an(H.clientX,H.clientY,Se),Se.x>-500){const te=m.rippleTapAmp+(m.rippleChargeAmp-m.rippleTapAmp)*H.charge;zt(Se.x,Se.y,te*(De?.5:1))}}const v=h.mouseLocal.x,T=h.mouseLocal.y;if(v>-500&&!h.isDragging&&fe.speedU>m.rippleMoveSpeed&&performance.now()-fe.lastEmitMs>m.rippleEmitIntervalMs){const H=Math.min(m.rippleMoveAmpMax,Math.max(m.rippleMoveAmpMin,fe.speedU/m.rippleMoveAmpDiv));zt(v,T,H*(De?.5:1)),fe.lastEmitMs=performance.now()}if(fe.speedU=0,h.charge.active){const H=performance.now()-h.charge.t0;h.charge.value=Math.min(1,Math.max(0,(H-m.rippleTapGraceMs)/m.rippleChargeMs))}else h.charge.value!==0&&(h.charge.value=0)}const g=h.charge.active;if(le.visible=g,le.el&&(le.el.classList.toggle("is-visible",g),le.stageEl&&le.stageEl.classList.toggle("is-charging",g)),le.elInner){const v=1+h.charge.value*m.cursorChargeScale;Math.abs(v-le.scale)>.001&&(le.scale=v,le.elInner.style.transform=`scale(${v})`)}na(he,o);const c=R.uRipples.value;for(let v=0;v<mt;v++){const T=v*4;c[v].set(he[T],he[T+1],he[T+2],he[T+3])}const A=h.tapRing;if(!M)if(A.pending){const v=A.pending;A.pending=null,an(v.clientX,v.clientY,Se),Se.x>-500&&(A.x=Se.x,A.y=Se.y,A.age=0,A.count=v.count,A.active=!0)}else A.active&&(A.age+=o,A.age>.55&&(A.active=!1));R.uTapRing.value.set(A.x,A.y,A.age,A.active?A.count:0);const S=d.geometry.attributes.position,b=S.array,F=S.count,{posHome:D,explosionOrigin:q,springDisp:z,springVel:P,randomDir:B,randomSpeed:E,funnelT:Y,funnelRadialX:W,funnelRadialZ:C}=s,V=qt(he);let L,y;Math.abs(o-r.prevDt)<1e-4?(L=r.prevKFrame,y=r.prevDampFrame):(L=m.springK*(o*60),y=Math.pow(m.springDamping,o*60),r.prevDt=o,r.prevKFrame=L,r.prevDampFrame=y);let w=-1,j=0;const I=s.activeStyle>=0?s.activeStyle:t.motionStyle,f=t.activeExpansionDuration||t.expansionDuration,k=t.activeContractionDuration||t.contractionDuration,Z=t.activeMaxDist||t.explosionMaxDistMultiplier;if(s.explosionStartTime>=0)if(w=a-s.explosionStartTime,w>t.totalExplosionDuration)s.explosionStartTime=-1,s.motionToken++,z.fill(0),P.fill(0),t.afterglowStartTime=a,w=-1,b&&D&&(b.set(D),S.needsUpdate=!0),r.trailPoints&&!De&&(r.trailPoints.visible=!0),Pe(),xn(!1),Xa();else{(I===0||I===-1)&&w>=f+3&&!t.travelApplied&&(t.activeContractionDuration=t.contractionDuration||2,t.travelApplied=!0,t.audioEnabled&&ma(t.activeContractionDuration)),w>=f&&!t.embersSpawned&&(t.embersSpawned=!0,I!==5&&xa());const v=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9;I===5&&!t.dodgeEmbersFired&&w>=v&&(t.dodgeEmbersFired=!0,Ta(w));const T=t.activeContractionDuration||t.contractionDuration;w<f?j=w/f:j=1-(w-f)/T}let G;if(s.explosionStartTime>=0?G=1:t.afterglowStartTime!=null?(G=Math.max(0,1-(a-t.afterglowStartTime)/m.afterglowDuration),G<=0&&(t.afterglowStartTime=null)):G=0,R.uExplosionActive.value=G,R.uTornadoActive.value=s.explosionStartTime>=0&&s.activeStyle===1?1:0,r.particles&&(r.particles.frustumCulled=j===0),r.particles&&!h.isDragging&&s.explosionStartTime>=0&&I===3&&w>=0&&w<=7.5){const v=w/7.5,T=Math.pow(Math.sin(Math.PI*v),1.2),H=.26*T,te=-.36*T;r.particles.rotation.x=H,r.particles.rotation.y=te,r.trailPoints&&(r.trailPoints.rotation.x=H,r.trailPoints.rotation.y=te)}if(t.gpuPhysics&&M){r.trailPoints&&(r.trailPoints.visible=!1),R.uGpuPhysics.value=1,R.uMotionStyle.value=I>=0?I:0,R.uExplosionElapsed.value=s.explosionStartTime>=0?w:-1,R.uExpDuration.value=f,R.uDriftDuration.value=I===0||I===-1?3:0,R.uContractionDuration.value=k,R.uMaxDist.value=Z,R.uSpinSpeed.value=t.pattern&&t.pattern.spinSpeed||5.2,R.uFunnelBottom.value=t.pattern&&t.pattern.funnelBottom||-22,R.uFunnelHeight.value=t.pattern&&t.pattern.funnelHeight||46,R.uFunnelCrownRadius.value=t.pattern&&t.pattern.funnelCrownRadius||22,R.uFunnelWaistRadius.value=t.pattern&&t.pattern.funnelWaistRadius||3.5,R.uFunnelTailRadius.value=t.pattern&&t.pattern.funnelTailRadius||.8,R.uFunnelWaistT.value=t.pattern&&t.pattern.funnelWaistT||.42,R.uFunnelCrownExp.value=t.pattern&&t.pattern.funnelCrownExp||1.4,R.uBreezeBlowDir.value=ge&&ge.blowDir||1,R.uBreezeIntensity.value=ge&&ge.intensity||1,R.uBreezeSwirl.value=ge&&ge.swirl!=null?ge.swirl:0,R.uMSweepX.value=t.pattern&&t.pattern.mSweepX!=null?t.pattern.mSweepX:24,R.uMSweepY.value=t.pattern&&t.pattern.mSweepY!=null?t.pattern.mSweepY:4,R.uMSweepZ.value=t.pattern&&t.pattern.mSweepZ!=null?t.pattern.mSweepZ:12,R.uMFreqX.value=t.pattern&&t.pattern.mFreqX!=null?t.pattern.mFreqX:3.456,R.uMFreqY.value=t.pattern&&t.pattern.mFreqY!=null?t.pattern.mFreqY:5.341,R.uMFreqZ.value=t.pattern&&t.pattern.mFreqZ!=null?t.pattern.mFreqZ:2.827,R.uMPhX.value=t.pattern&&t.pattern.mPhX!=null?t.pattern.mPhX:.4,R.uMPhY.value=t.pattern&&t.pattern.mPhY!=null?t.pattern.mPhY:0,R.uMPhZ.value=t.pattern&&t.pattern.mPhZ!=null?t.pattern.mPhZ:1.2,R.uMLaunchDir.value=t.pattern&&t.pattern.mLaunchDir!=null?t.pattern.mLaunchDir:1,R.uMTurnT.value=t.pattern&&t.pattern.mTurnT!=null?t.pattern.mTurnT:99,R.uMTurnDir.value=t.pattern&&t.pattern.mTurnDir!=null?t.pattern.mTurnDir:1,R.uMSplitT.value=t.pattern&&t.pattern.mSplitT!=null?t.pattern.mSplitT:99,R.uMSplitAng.value=t.pattern&&t.pattern.mSplitAng!=null?t.pattern.mSplitAng:0,R.uMDodge1T.value=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9,R.uMDodge2T.value=t.pattern&&t.pattern.mDodge2T!=null?t.pattern.mDodge2T:7.1,R.uMDodge3T.value=t.pattern&&t.pattern.mDodge3T!=null?t.pattern.mDodge3T:99,R.uMDodgeRad.value=t.pattern&&t.pattern.mDodgeRad!=null?t.pattern.mDodgeRad:8,R.uMDodgeStr.value=t.pattern&&t.pattern.mDodgeStr!=null?t.pattern.mDodgeStr:1,R.uMBoilAmp.value=t.pattern&&t.pattern.mBoilAmp!=null?t.pattern.mBoilAmp:0,R.uMBoilFreq.value=t.pattern&&t.pattern.mBoilFreq!=null?t.pattern.mBoilFreq:14,R.uMChurnMult.value=t.pattern&&t.pattern.mChurnMult!=null?t.pattern.mChurnMult:1,R.uMFlutterMult.value=t.pattern&&t.pattern.mFlutterMult!=null?t.pattern.mFlutterMult:1,R.uMJinkAmp.value=t.pattern&&t.pattern.mJinkAmp!=null?t.pattern.mJinkAmp:0,R.uMJinkFreq.value=t.pattern&&t.pattern.mJinkFreq!=null?t.pattern.mJinkFreq:5.5,R.uMJinkPh.value=t.pattern&&t.pattern.mJinkPh!=null?t.pattern.mJinkPh:0,R.uMBreathAmp.value=t.pattern&&t.pattern.mBreathAmp!=null?t.pattern.mBreathAmp:1,R.uMScoutAmp.value=t.pattern&&t.pattern.mScoutAmp!=null?t.pattern.mScoutAmp:0,R.uMMergeTime.value=t.pattern&&t.pattern.mMergeTime!=null?t.pattern.mMergeTime:6.8,R.uMPodAngle.value=t.pattern&&t.pattern.mPodAngle!=null?t.pattern.mPodAngle:0;{const v=r.camera,T=v.top-v.bottom,H=v.right-v.left,te=Math.max(1,Math.min(H,T))*.205;R.uKnotScale.value=te,t.pattern.knotScale=te}}else if(R.uGpuPhysics.value=0,de){let v=null;for(const T of s.slots)if(!T.inFlight){v=T;break}v&&(v.needsReset&&(v.posLive.set(s.explosionOrigin),v.springDisp.fill(0),v.springVel.fill(0),v.needsReset=!1),v.inFlight=!0,v.seq=s.seq++,s.sendQueue.push(v),de.postMessage({type:"update",data:{posLive:v.posLive,springDisp:v.springDisp,springVel:v.springVel,count:F,dt:o,elapsed:w,ripples:he,kFrame:L,dampFrame:y,expansionDuration:f,driftDuration:I===0||I===3||I===-1?3:0,contractionDuration:k,explosionMaxDistMultiplier:Z,breeze:ge,sourceGeneration:s.sourceGeneration,motionToken:s.motionToken},seq:v.seq},[v.posLive.buffer,v.springDisp.buffer,v.springVel.buffer]))}else{const v=t.pattern,T={x:0,y:0,z:0},H=I===1&&v.funnelHeight&&Y&&W&&C,te=q||D,ne=I===0||I===3||I===-1?3:0;for(let J=0;J<F;J++){const _=J*3,u=_+1,U=_+2;let O,K,ee;if(w>=0)if(I===1&&H)pn(J,D[_],D[u],D[U],Y[J],W[J],C[J],(E?E[J]:1)*.35+.85,w,v,T),O=T.x,K=T.y,ee=T.z;else if(I===2)mn(J,D[_],D[u],D[U],(E?E[J]:1)*.35+.85,w,ge,T),O=T.x,K=T.y,ee=T.z;else if(I===3)fn(J,D[_],D[u],D[U],(E?E[J]:1)*.35+.85,w,v,T),O=T.x,K=T.y,ee=T.z;else if(I===4)hn(J,D[_],D[u],D[U],(E?E[J]:1)*.35+.85,w,v,T),O=T.x,K=T.y,ee=T.z;else if(I===5)gn(J,D[_],D[u],D[U],(E?E[J]:1)*.35+.85,w,v,T),O=T.x,K=T.y,ee=T.z;else{const ce=E[J]*Z;dn(te[_],te[u],te[U],B[_],B[u],B[U],ce,f,ne,k,w,T),O=T.x,K=T.y,ee=T.z}else O=D[_],K=D[u],ee=D[U];const Q=b[_],ae=b[u],N=b[U];let $=0,oe=0,re=0;if(V&&(aa(Q,ae,N,he,Qe),$=Qe.x,oe=Qe.y,re=Qe.z),P[_]=(P[_]+($-z[_])*L)*y,P[u]=(P[u]+(oe-z[u])*L)*y,P[U]=(P[U]+(re-z[U])*L)*y,z[_]+=P[_],z[u]+=P[u],z[U]+=P[U],b[_]=O+z[_],b[u]=K+z[u],b[U]=ee+z[U],w>=0){const ce=b[_]-te[_],ie=b[u]-te[u],se=b[U]-te[U],pe=ce*ce+ie*ie+se*se;pe>rt&&(rt=pe)}}t.actualTravelRadius=Math.sqrt(rt),S.needsUpdate=!0,s.positionsDirty=!0}va(),Ma(o),r.renderer.render(r.scene,p),Ga(performance.now()-e)}async function Oa(){r.scene=new In,r.camera=new Un(-1,1,1,-1,-600,600),r.camera.position.z=r.targetZ,r.renderer=new Xn({antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1}),r.renderer.setClearColor(m.clearColor,1);const e=r.renderer.domElement;if(e.setAttribute("role","img"),e.setAttribute("aria-label","Kinetic particle sculpture — interactive particle animation"),e.addEventListener("webglcontextlost",g=>{g.preventDefault(),Ee("WebGL context lost — attempting restoration...")},!1),e.addEventListener("webglcontextrestored",async()=>{Ee("WebGL context restored"),await Te(t.currentText,!1)},!1),document.getElementById("stage").appendChild(e),_e(),!(new URLSearchParams(window.location.search).get("noworker")==="1"))try{de=new Worker(new URL("/ParticlesSimulations/assets/physics.worker-DhytWG_q.js",import.meta.url),{type:"module"}),de.onmessage=function(g){const{type:c,seq:A,posLive:S,springDisp:b,springVel:F,travelRadius:D,sourceGeneration:q,motionToken:z}=g.data;if(c==="randomized"){if(g.data.sourceGeneration!==s.sourceGeneration||g.data.motionToken!==s.motionToken)return;s.randomized={dirs:g.data.dirs,style:g.data.style},s.activeStyle=g.data.style;return}if(c==="update"){let P=-1;for(let Y=0;Y<s.sendQueue.length;Y++)if(s.sendQueue[Y].seq===A){P=Y;break}if(P===-1)return;const B=s.sendQueue.splice(P,1)[0];if(B.inFlight=!1,B.posLive=S,B.springDisp=b,B.springVel=F,q!==s.sourceGeneration||z!==s.motionToken)return;typeof D=="number"&&D>0&&(t.actualTravelRadius=D);const E=r.particles&&r.particles.geometry.attributes.position;E&&E.array.length===S.length&&(E.array.set(S),E.needsUpdate=!0,s.positionsDirty=!0)}},de.onerror=()=>{console.error("Physics worker error — switching to CPU fallback."),cn()},de.onmessageerror=()=>{console.error("Physics worker message error — switching to CPU fallback."),cn()}}catch(g){console.error("Failed to initialize physics Web Worker:",g)}await document.fonts.ready.catch(()=>{});const o=window.location.search||(window.location.hash.includes("?")?window.location.hash.substring(window.location.hash.indexOf("?")):""),i=new URLSearchParams(o),l=i.get("text")||i.get("t")||i.get("emoji")||"Bring your message!",n=i.get("theme")||"ember",d=i.get("font")||"Outfit",p=i.get("preset");i.get("gpu")==="0"&&(t.gpuPhysics=!1),t.currentText=l,t.currentTheme=n,t.currentFont=d,m.emojiOptions.includes(l)?(t.activeEmoji=l,t.lastEmoji=l,t.messageMode="emoji",t.lastText="Bring your message!"):(t.messageMode="text",t.lastText=l);const X=l.toUpperCase(),M=p?p.toUpperCase():m.presets[X]&&X!=="DEFAULT"?X:null;M&&m.presets[M]?(st(n,!1),await Te(t.currentText,!1),await It(M,!1),lt(M)):m.presets[X]&&X!=="DEFAULT"?(await It(X,!1),lt(X)):(st(n,!1),await Te(t.currentText,!1)),Za(),Ce(t.messageMode),le.el=document.getElementById("cursor-ring"),le.elInner=le.el?le.el.firstElementChild:null,le.stageEl=document.getElementById("stage"),window.addEventListener("pointermove",g=>{h.pendingPointer={clientX:g.clientX,clientY:g.clientY,pointerType:g.pointerType,pointerId:g.pointerId},Qt(g)}),window.addEventListener("pointerdown",Da),window.addEventListener("pointerdown",Qt),window.addEventListener("pointerdown",g=>{dt(g)||pt()}),window.addEventListener("keydown",g=>{(g.key===" "||g.key.startsWith("Arrow")||g.key==="+"||g.key==="-"||g.key==="=")&&pt()}),window.addEventListener("pointerup",on),window.addEventListener("pointercancel",on),window.addEventListener("pointerleave",()=>{h.mouseWorld.set(-1e3,-1e3,0),R.uMouse.value.set(-1e3,-1e3,0),h.isDragging=!1,h.charge.active=!1,h.charge.release=null}),window.addEventListener("touchstart",Sa,{passive:!1}),window.addEventListener("touchmove",ba,{passive:!1}),window.addEventListener("touchend",Pa),window.addEventListener("resize",_e),window.addEventListener("keydown",g=>{if(g.key==="Escape"){const c=document.getElementById("drawer");if(c&&c.classList.contains("open")){Ve();return}}h.keys[g.key]=!0,(g.code==="Space"||g.key.startsWith("Arrow"))&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="SELECT"&&(g.preventDefault(),g.code==="Space"&&s.explosionStartTime<0&&(yn(),Ge()))}),window.addEventListener("keyup",g=>h.keys[g.key]=!1),window.addEventListener("popstate",async()=>{const g=new URLSearchParams(window.location.search),c=g.get("t")||"Bring your message!",A=g.get("theme")||"ember",S=g.get("font")||"Outfit";t.currentText=c,t.currentTheme=A,t.currentFont=S;const b=m.emojiOptions.includes(c);t.activeEmoji=b?c:null,b?t.lastEmoji=c:t.lastText=c,Ce(b?"emoji":"text"),ut(c),st(A,!1),b?(Me(c),await Te(c,!1)):await Tn(S,!1);const F=c.toUpperCase();m.presets[F]&&F!=="DEFAULT"?lt(F):Pe(),Me(t.activeEmoji)}),bn(),window.__artzReady=!0}window.__artzDebug={_render:()=>r,triggerExplosion:Ge,get particleCount(){return s.posLive?s.posLive.length/3:0},get usingWorker(){return!!de},get usingGpu(){return t.gpuPhysics},get geometryCount(){return r.renderer?r.renderer.info.memory.geometries:-1},get textureCount(){return r.renderer?r.renderer.info.memory.textures:-1},get renderCalls(){return r.renderer?r.renderer.info.render.calls:-1},snapshot(e=96){var n;const a=s.posHome,o=s.explosionOrigin,i=Math.min(e*3,a?a.length:0);let l=(n=r.particles)==null?void 0:n.geometry.attributes.position.array;if(t.gpuPhysics&&s.explosionStartTime>=0&&a){const d=r.clock.getElapsedTime()-s.explosionStartTime,p=s.activeStyle>=0?s.activeStyle:t.motionStyle,x=t.activeExpansionDuration||t.expansionDuration,X=t.activeContractionDuration||t.contractionDuration,M=t.activeMaxDist||t.explosionMaxDistMultiplier,g=p===0||p===3||p===-1?3:0,c={x:0,y:0,z:0},A=new Float32Array(i);for(let S=0;S<i/3;S++){const b=S*3,F=b+1,D=b+2;if(p===1)pn(S,a[b],a[F],a[D],s.funnelT?s.funnelT[S]:0,s.funnelRadialX?s.funnelRadialX[S]:0,s.funnelRadialZ?s.funnelRadialZ[S]:0,(s.randomSpeed?s.randomSpeed[S]:1)*.35+.85,d,t.pattern,c);else if(p===2)mn(S,a[b],a[F],a[D],(s.randomSpeed?s.randomSpeed[S]:1)*.35+.85,d,ge,c);else if(p===3)fn(S,a[b],a[F],a[D],(s.randomSpeed?s.randomSpeed[S]:1)*.35+.85,d,t.pattern,c);else if(p===4)hn(S,a[b],a[F],a[D],(s.randomSpeed?s.randomSpeed[S]:1)*.35+.85,d,t.pattern,c);else if(p===5)gn(S,a[b],a[F],a[D],(s.randomSpeed?s.randomSpeed[S]:1)*.35+.85,d,t.pattern,c);else{const q=(s.randomSpeed?s.randomSpeed[S]:1)*M,z=o||a;dn(z[b],z[F],z[D],s.randomDir?s.randomDir[b]:0,s.randomDir?s.randomDir[F]:0,s.randomDir?s.randomDir[D]:0,q,x,g,X,d,c)}A[b]=c.x,A[F]=c.y,A[D]=c.z}l=A}return{position:l?Array.from(l.slice(0,i)):[],home:a?Array.from(a.slice(0,i)):[],explosionOrigin:o?Array.from(o.slice(0,i)):[],funnelT:s.funnelT?Array.from(s.funnelT.slice(0,e)):[],activeStyle:s.activeStyle,funnelProfile:{height:t.pattern.funnelHeight||0,bottom:t.pattern.funnelBottom||0,tailRadius:it(.05,t.pattern),waistRadius:it(.5,t.pattern),crownRadius:it(.95,t.pattern),fadeStart:t.pattern.funnelFadeStart||0,fadeEnd:t.pattern.funnelFadeEnd||0},rotation:r.particles?[r.particles.rotation.x,r.particles.rotation.y,r.particles.rotation.z]:[0,0,0],sourceGeneration:s.sourceGeneration,motionToken:s.motionToken,explosionActive:s.explosionStartTime>=0,elapsed:s.explosionStartTime>=0?r.clock.getElapsedTime()-s.explosionStartTime:-1,expDuration:t.activeExpansionDuration||t.expansionDuration,conDuration:t.activeContractionDuration||t.contractionDuration,randomized:s.randomized?{style:s.randomized.style,dirs:Array.from(s.randomized.dirs)}:{style:-1,dirs:[]}}},triggerExplosion:Ge,get rippleCount(){let e=0;for(let a=3;a<he.length;a+=4)he[a]>0&&e++;return e},get ripples(){return Array.from(he)},get charge(){return{active:h.charge.active,value:h.charge.value}},get cursor(){return{visible:le.visible,scale:le.scale}},get tapRing(){return{active:h.tapRing.active,count:h.tapRing.count}},emitTestRipple(e,a,o){zt(e,a,o)},rippleProfile(e){return Ut(e)}};Oa();
