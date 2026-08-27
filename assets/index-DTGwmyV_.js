import{V as _n,C as qa,S as Ba,O as Va,W as Ia,a as Pe,B as An,b as ge,D as Et,c as Dn,A as nn,P as Pn,N as Ua,d as Xa,L as Nn,e as Za,M as Ht,f as Ya}from"./three-DsYxzsj3.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const n of l)if(n.type==="childList")for(const p of n.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&i(p)}).observe(document,{childList:!0,subtree:!0});function o(l){const n={};return l.integrity&&(n.integrity=l.integrity),l.referrerPolicy&&(n.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?n.credentials="include":l.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(l){if(l.ep)return;l.ep=!0;const n=o(l);fetch(l.href,n)}})();const ja=`
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
`,Wa=`
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
`,Ga=`
attribute float aLife;
varying float vLife;

void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + 3.0 * aLife);
}
`,Ha=`
varying float vLife;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float a = (1.0 - r) * vLife;
    vec3 c = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.95, 0.7), vLife);
    gl_FragColor = vec4(c, a);
}
`;let vt=null,yn=null;function Oa(){return!vt&&(window.AudioContext||window.webkitAudioContext)&&(vt=new(window.AudioContext||window.webkitAudioContext)),vt&&vt.state==="suspended"&&vt.resume(),vt}function Ce(e){if(yn)return yn;const a=e.sampleRate*2,o=e.createBuffer(1,a,e.sampleRate),i=o.getChannelData(0);for(let l=0;l<a;l++)i[l]=Math.random()*2-1;return yn=o,o}function _a(e,a){const o=Oa();if(!o)return;const i=typeof e=="object"&&e!==null?e:{soundDuration:e||a},l=i.motionStyle!=null?i.motionStyle:typeof state<"u"&&state&&state.motionStyle!=null?state.motionStyle:0,n=o.currentTime,p=o.createGain();p.gain.setValueAtTime(1e-4,n),p.gain.linearRampToValueAtTime(.4,n+.02),p.connect(o.destination);const u=i.soundDuration||a||1.5,x=i.soundPitch||140,X=i.soundType||"sine";if(l===1){const w=o.createBufferSource();w.buffer=Ce(o),w.loop=!0;const M=o.createBiquadFilter();M.type="bandpass",M.frequency.setValueAtTime(60,n),M.frequency.linearRampToValueAtTime(180,n+3.5),M.frequency.exponentialRampToValueAtTime(580,n+6),M.frequency.linearRampToValueAtTime(320,n+8),M.frequency.linearRampToValueAtTime(220,n+11.5),M.frequency.exponentialRampToValueAtTime(45,n+15),M.Q.value=2.8;const A=o.createGain();A.gain.setValueAtTime(1e-4,n),A.gain.exponentialRampToValueAtTime(.18,n+3),A.gain.linearRampToValueAtTime(.38,n+6),A.gain.linearRampToValueAtTime(.24,n+11.5),A.gain.exponentialRampToValueAtTime(1e-4,n+15),w.connect(M),M.connect(A),A.connect(p),w.start(n),w.stop(n+15+.1),setTimeout(()=>{try{w.disconnect(),M.disconnect(),A.disconnect(),p.disconnect()}catch{}},(15+.2)*1e3);return}if(l===2){const w=o.createBufferSource();w.buffer=Ce(o),w.loop=!0;const M=o.createBiquadFilter();M.type="bandpass",M.frequency.setValueAtTime(90,n),M.frequency.linearRampToValueAtTime(130,n+1),M.frequency.linearRampToValueAtTime(75,n+3),M.frequency.exponentialRampToValueAtTime(620,n+6.6),M.frequency.exponentialRampToValueAtTime(100,n+10.2),M.frequency.exponentialRampToValueAtTime(50,n+11.8),M.Q.value=1.2;const A=o.createGain();A.gain.setValueAtTime(1e-4,n),A.gain.exponentialRampToValueAtTime(.14,n+1),A.gain.exponentialRampToValueAtTime(.01,n+3),A.gain.linearRampToValueAtTime(.32,n+6.6),A.gain.linearRampToValueAtTime(.05,n+10.2),A.gain.exponentialRampToValueAtTime(1e-4,n+11.8),w.connect(M),M.connect(A),A.connect(p),w.start(n),w.stop(n+11.8+.1),setTimeout(()=>{try{w.disconnect(),M.disconnect(),A.disconnect(),p.disconnect()}catch{}},(11.8+.2)*1e3);return}if(l===3){const w=typeof o.createStereoPanner=="function"?o.createStereoPanner():null;w&&(w.pan.setValueAtTime(-.75,n),w.pan.linearRampToValueAtTime(.75,n+7.5),w.connect(p));const M=w||p,A=o.createOscillator();A.type="sine",A.frequency.setValueAtTime(32,n),A.frequency.linearRampToValueAtTime(48,n+2.5),A.frequency.linearRampToValueAtTime(58,n+4.2),A.frequency.linearRampToValueAtTime(36,n+5.8),A.frequency.exponentialRampToValueAtTime(20,n+7.5);const I=o.createGain();I.gain.setValueAtTime(1e-4,n),I.gain.exponentialRampToValueAtTime(.24,n+2),I.gain.linearRampToValueAtTime(.48,n+4.2),I.gain.linearRampToValueAtTime(.18,n+5.8),I.gain.exponentialRampToValueAtTime(1e-4,n+7.5),A.connect(I),I.connect(M),A.start(n),A.stop(n+7.5+.1);const Y=o.createBufferSource();Y.buffer=Ce(o),Y.loop=!0;const V=o.createBiquadFilter();V.type="lowpass",V.frequency.setValueAtTime(140,n),V.frequency.exponentialRampToValueAtTime(420,n+2.2),V.frequency.exponentialRampToValueAtTime(1250,n+4.2),V.frequency.linearRampToValueAtTime(550,n+5.6),V.frequency.exponentialRampToValueAtTime(75,n+7.5),V.Q.value=1.1;const F=o.createGain();F.gain.setValueAtTime(1e-4,n),F.gain.exponentialRampToValueAtTime(.18,n+1.8),F.gain.linearRampToValueAtTime(.52,n+4.2),F.gain.linearRampToValueAtTime(.22,n+5.6),F.gain.exponentialRampToValueAtTime(1e-4,n+7.5),Y.connect(V),V.connect(F),F.connect(M),Y.start(n),Y.stop(n+7.5+.1);const L=o.createBufferSource();L.buffer=Ce(o),L.loop=!0;const h=o.createBiquadFilter();h.type="bandpass",h.frequency.setValueAtTime(1400,n),h.frequency.exponentialRampToValueAtTime(2400,n+3.8),h.frequency.exponentialRampToValueAtTime(3200,n+4.6),h.frequency.linearRampToValueAtTime(1800,n+6),h.frequency.exponentialRampToValueAtTime(600,n+7.5),h.Q.value=1.4;const C=o.createGain();C.gain.setValueAtTime(1e-4,n),C.gain.exponentialRampToValueAtTime(.04,n+2.5),C.gain.linearRampToValueAtTime(.38,n+4.4),C.gain.linearRampToValueAtTime(.26,n+5.4),C.gain.exponentialRampToValueAtTime(1e-4,n+7.5),L.connect(h),h.connect(C),C.connect(M),L.start(n),L.stop(n+7.5+.1);const S=o.createBufferSource();S.buffer=Ce(o),S.loop=!0;const U=o.createBiquadFilter();U.type="bandpass",U.frequency.setValueAtTime(700,n+4.5),U.frequency.exponentialRampToValueAtTime(280,n+6.2),U.frequency.exponentialRampToValueAtTime(90,n+7.5),U.Q.value=1.8;const b=o.createGain();b.gain.setValueAtTime(1e-4,n),b.gain.setValueAtTime(1e-4,n+4.5),b.gain.linearRampToValueAtTime(.18,n+5.5),b.gain.exponentialRampToValueAtTime(1e-4,n+7.5),S.connect(U),U.connect(b),b.connect(M),S.start(n+4.5),S.stop(n+7.5+.1),setTimeout(()=>{try{A.disconnect(),I.disconnect(),Y.disconnect(),V.disconnect(),F.disconnect(),L.disconnect(),h.disconnect(),C.disconnect(),S.disconnect(),U.disconnect(),b.disconnect(),w&&w.disconnect(),p.disconnect()}catch{}},(7.5+.2)*1e3);return}if(l===4){const w=o.createOscillator();w.type="sine",w.frequency.setValueAtTime(28,n),w.frequency.linearRampToValueAtTime(52,n+3),w.frequency.setValueAtTime(52,n+11.5),w.frequency.exponentialRampToValueAtTime(24,n+16);const M=o.createGain();M.gain.setValueAtTime(1e-4,n),M.gain.exponentialRampToValueAtTime(.3,n+2.6),M.gain.linearRampToValueAtTime(.22,n+11.5),M.gain.exponentialRampToValueAtTime(1e-4,n+16),w.connect(M),M.connect(p),w.start(n),w.stop(n+16+.1);const A=o.createBufferSource();A.buffer=Ce(o),A.loop=!0;const I=o.createBiquadFilter();I.type="bandpass",I.frequency.setValueAtTime(70,n),I.frequency.exponentialRampToValueAtTime(760,n+3),I.frequency.exponentialRampToValueAtTime(120,n+3.8),I.Q.value=1.8;const Y=o.createGain();Y.gain.setValueAtTime(1e-4,n),Y.gain.exponentialRampToValueAtTime(.26,n+2.9),Y.gain.exponentialRampToValueAtTime(1e-4,n+4),A.connect(I),I.connect(Y),Y.connect(p),A.start(n),A.stop(n+4.1);const V=n+3,F=o.createOscillator();F.type="sine",F.frequency.setValueAtTime(95,V),F.frequency.exponentialRampToValueAtTime(36,V+.45);const L=o.createGain();L.gain.setValueAtTime(1e-4,V),L.gain.exponentialRampToValueAtTime(.28,V+.03),L.gain.exponentialRampToValueAtTime(1e-4,V+.55),F.connect(L),L.connect(p),F.start(V),F.stop(V+.6);const h=o.createBufferSource();h.buffer=Ce(o),h.loop=!0;const C=o.createBiquadFilter();C.type="bandpass",C.frequency.setValueAtTime(430,n+3),C.frequency.linearRampToValueAtTime(560,n+11.5),C.Q.value=2.2;const S=o.createGain();S.gain.setValueAtTime(1e-4,n+3),S.gain.linearRampToValueAtTime(.15,n+4.2),S.gain.linearRampToValueAtTime(.12,n+10.5),S.gain.exponentialRampToValueAtTime(1e-4,n+16);const U=o.createOscillator();U.type="sine",U.frequency.value=.9;const b=o.createGain();b.gain.setValueAtTime(.055,n+3),b.gain.linearRampToValueAtTime(0,n+11.5),U.connect(b),b.connect(S.gain),h.connect(C),C.connect(S),S.connect(p),h.start(n+3),h.stop(n+16+.1),U.start(n+3),U.stop(n+16+.1);const q=o.createOscillator();q.type="triangle",q.frequency.setValueAtTime(1350,n+11.5),q.frequency.exponentialRampToValueAtTime(310,n+16);const W=o.createGain();W.gain.setValueAtTime(1e-4,n+11.5),W.gain.exponentialRampToValueAtTime(.07,n+11.9),W.gain.exponentialRampToValueAtTime(1e-4,n+16),q.connect(W),W.connect(p),q.start(n+11.5),q.stop(n+16+.1),setTimeout(()=>{try{w.disconnect(),M.disconnect(),A.disconnect(),I.disconnect(),Y.disconnect(),F.disconnect(),L.disconnect(),h.disconnect(),C.disconnect(),S.disconnect(),U.disconnect(),b.disconnect(),q.disconnect(),W.disconnect(),p.disconnect()}catch{}},(16+.2)*1e3);return}if(l===5){const w=o.createBufferSource();w.buffer=Ce(o),w.loop=!0;const M=o.createBiquadFilter();M.type="lowpass",M.frequency.setValueAtTime(220,n),M.frequency.linearRampToValueAtTime(920,n+3.2),M.frequency.linearRampToValueAtTime(680,n+9),M.frequency.linearRampToValueAtTime(180,n+12),M.frequency.exponentialRampToValueAtTime(90,n+14);const A=o.createGain();A.gain.setValueAtTime(1e-4,n),A.gain.exponentialRampToValueAtTime(.2,n+3),A.gain.linearRampToValueAtTime(.16,n+9),A.gain.exponentialRampToValueAtTime(1e-4,n+14),w.connect(M),M.connect(A),A.connect(p),w.start(n),w.stop(n+14+.1);const I=o.createBufferSource();I.buffer=Ce(o),I.loop=!0;const Y=o.createBiquadFilter();Y.type="bandpass",Y.frequency.value=760,Y.Q.value=1.1;const V=o.createGain();V.gain.setValueAtTime(1e-4,n),V.gain.linearRampToValueAtTime(.1,n+3),V.gain.linearRampToValueAtTime(.08,n+9),V.gain.linearRampToValueAtTime(1e-4,n+12.5);const F=o.createOscillator();F.type="sine",F.frequency.setValueAtTime(8,n),F.frequency.linearRampToValueAtTime(12.5,n+9),F.frequency.linearRampToValueAtTime(7,n+14);const L=o.createGain();L.gain.setValueAtTime(0,n),L.gain.linearRampToValueAtTime(.085,n+3),L.gain.linearRampToValueAtTime(.06,n+9),L.gain.linearRampToValueAtTime(0,n+12.5),F.connect(L),L.connect(V.gain),I.connect(Y),Y.connect(V),V.connect(p),I.start(n),I.stop(n+14+.1),F.start(n),F.stop(n+14+.1);for(let h=0;h<3;h++){const C=n+.25+h*.24,S=o.createOscillator();S.type="sine",S.frequency.setValueAtTime(2350+h*190,C),S.frequency.exponentialRampToValueAtTime(1750+h*140,C+.09);const U=o.createGain();U.gain.setValueAtTime(1e-4,C),U.gain.exponentialRampToValueAtTime(.09,C+.02),U.gain.exponentialRampToValueAtTime(1e-4,C+.11),S.connect(U),U.connect(p),S.start(C),S.stop(C+.12)}setTimeout(()=>{try{w.disconnect(),M.disconnect(),A.disconnect(),I.disconnect(),Y.disconnect(),V.disconnect(),F.disconnect(),L.disconnect(),p.disconnect()}catch{}},(14+.2)*1e3);return}const y=Math.max(1.8,u),g=o.createBufferSource();g.buffer=Ce(o);const d=o.createBiquadFilter();d.type="bandpass",d.frequency.setValueAtTime(1200,n),d.frequency.exponentialRampToValueAtTime(180,n+.25),d.Q.value=1.2;const k=o.createGain();k.gain.setValueAtTime(.75,n),k.gain.exponentialRampToValueAtTime(.001,n+.35),g.connect(d),d.connect(k),k.connect(p),g.start(n),g.stop(n+.4);const c=o.createBufferSource();c.buffer=Ce(o),c.loop=!0;const P=o.createBiquadFilter();P.type="lowpass",P.frequency.setValueAtTime(450,n),P.frequency.exponentialRampToValueAtTime(65,n+y);const v=o.createGain();v.gain.setValueAtTime(.65,n),v.gain.exponentialRampToValueAtTime(1e-4,n+y),c.connect(P),P.connect(v),v.connect(p),c.start(n),c.stop(n+y+.05);const Z=o.createOscillator();Z.type=X||"sine",Z.frequency.setValueAtTime(Math.max(x,120),n),Z.frequency.exponentialRampToValueAtTime(26,n+Math.min(1.2,y));const E=o.createGain();E.gain.setValueAtTime(.7,n),E.gain.exponentialRampToValueAtTime(.001,n+y),Z.connect(E),E.connect(p),Z.start(n),Z.stop(n+y+.05),setTimeout(()=>{try{g.disconnect(),d.disconnect(),k.disconnect(),c.disconnect(),P.disconnect(),v.disconnect(),Z.disconnect(),E.disconnect(),p.disconnect()}catch{}},(y+.1)*1e3)}function Qt(e,a){a.funnelBottom,a.funnelHeight;const o=a.funnelWaistT!=null?a.funnelWaistT:a.funnelWaistU||.42,i=a.funnelTailRadius!=null?a.funnelTailRadius:.8,l=a.funnelWaistRadius!=null?a.funnelWaistRadius:3.5,n=a.funnelCrownRadius!=null?a.funnelCrownRadius:22,p=a.funnelCrownExp||1.4;if(e<=o){const u=e/Math.max(.01,o);return i+(l-i)*(u*u)}else{const u=(e-o)/Math.max(.01,1-o);return l+(n-l)*Math.pow(u,p)}}const Kn=.06081006264583979;function ca(e,a,o,i,l,n,p,u,x,X,y){const g=Qt(l,X),d=Math.atan2(p,n),k=Math.sqrt(a*a+i*i),c=3.5,P=X.vortexDuration||4.5,v=X.equilibriumDuration||3.5,Z=3.5,E=14+.55*k,z=X.funnelBottom||-22,w=X.funnelHeight||46,M=.12*Math.sin(3*d-4.2*x+2.5*l),A=.08*Math.cos(5*d+6*x-3.8*l),I=.06*Math.sin(x*7.5+e*.03),Y=1+M+A+I,V=(4+15/(k+4.5))*u,F=((X.spinSpeed||5.2)*2.8+4.5*(1-l))*u;if(x<c){const L=x/c,h=L*L*L*(L*(L*6-15)+10),C=(1-h)*k+h*E,S=d+V*(.6*x+.2*(x*x/c)),U=Math.cos(S)*C,b=(1-h)*o+h*(z+.022*C*C+3*(l-.5)),q=Math.sin(S)*C;return y?(y.x=U,y.y=b,y.z=q,y):{x:U,y:b,z:q}}else if(x<c+P){const L=x-c,h=L/P,C=h*h*(3-2*h),S=d+V*(.8*c),U=L+.6*P/Math.PI*(1-Math.cos(Math.PI*L/P)),b=S+F*1.25*U,q=(1-C)*E+C*(g*Y),W=2.8*Math.sin(1.8*x+2.2*l)*l*C,D=2.4*Math.cos(1.5*x+1.8*l)*l*C,B=W+Math.cos(b)*q,G=(1-C)*(z+.022*E*E)+C*(z+w*l)+5.5*Math.sin(h*Math.PI)*l,H=D+Math.sin(b)*q;return y?(y.x=B,y.y=G,y.z=H,y):{x:B,y:G,z:H}}else if(x<c+P+v){const L=x-(c+P),h=L/v,C=1+.75*Math.sin(Math.PI*h)+.35*h,S=d+V*(.8*c),U=P+1.2*P/Math.PI,b=S+F*1.25*U,q=L-.2/2.4*(Math.cos(2.4*L)-1),W=b+F*1.1*q,D=g*Y*C,B=2.8*Math.sin(1.8*(c+P)+2.2*l)*l*(1-.4*h),G=2.4*Math.cos(1.5*(c+P)+1.8*l)*l*(1-.4*h),H=B+Math.cos(W)*D,ae=z+w*l+(1-h)*2*l,J=G+Math.sin(W)*D;return y?(y.x=H,y.y=ae,y.z=J,y):{x:H,y:ae,z:J}}else{const L=x-(c+P+v),h=Math.min(1,L/Z),C=d+V*(.8*c),S=P+1.2*P/Math.PI,U=C+F*1.25*S,b=v-.2/2.4*(Math.cos(2.4*v)-1),q=U+F*1.1*b,W=.85*L-.275*(L*L/Z),D=q+F*1.1*W,B=g*Y*(1-h)+E*h,G=(z+w*l)*(1-h)+(z+.022*E*E+3*(l-.5))*h,H=Math.cos(D)*B,ae=G,J=Math.sin(D)*B,O=.35*h+.65*Math.pow(h,2.2),$=(1-O)*H+O*a,m=(1-O)*ae+O*o,j=(1-O)*J+O*i;return y?(y.x=$,y.y=m,y.z=j,y):{x:$,y:m,z:j}}}function Jn(e,a,o,i,l,n,p,u,x,X,y,g,d,k,c,P,v){const Z=i*p+25,E=P*53.17%100/100*.3,z=Math.min(.75,Math.max(0,Z*.015+E)),w=Math.max(0,e-z),M=Math.min(1,w/(c-z+1e-4));if(w<=0)return v?(v.x=i,v.y=l,v.z=n,v):{x:i,y:l,z:n};const I=P%3*2.094395,F=.15*(i*p)-2.8*a+I,L=(1.8+3.8*g)*Math.min(1,w/.8)*u,h=L*Math.sin(F),C=L*Math.cos(F),S=p*(L*.55*Math.sin(F*.5)),U=3.6+P*41.73%100/100*2,b=P*67.89%100/100*6.28318,q=U*a+b,W=p*(Math.sin(q)*(.8+1.1*y))*u,D=Math.abs(Math.cos(q))*(.95+1.45*g)*u,B=Math.sin(q*.75+b)*(1.3+1.8*y)*u,G=Math.sin(9.5*a+P*.35)*.4*u*Math.min(1,w),H=P*29.17%10>5?1:-1,ae=.12*(i*p)-3.8*a*H+P*31.41%100/100*6.28318,J=Math.sin(Math.PI*M),O=(3.2+6*g)*(x||0)*u*J,$=O*Math.sin(ae),m=O*Math.cos(ae),j=p*(O*.35*Math.cos(ae*2));if(o>.82){const ee=(3.2+6*y)*u*(w*.85+.08*w*w),se=(.35*Math.abs(Math.sin(q))+.1*Math.sin(a*10+P))*Math.min(1,w),ne=(.75*Math.sin(q*.6)+G+m*.25)*Math.min(1,w),oe=i+p*ee+W*.4+j*.25,K=Math.max(l,l+se),Q=n+ne;return v?(v.x=oe,v.y=K,v.z=Q,v):{x:oe,y:K,z:Q}}else{const N=d*.5,ee=Math.min(1,Math.max(0,(M-N)/(1-N+1e-4))),se=ee*ee*(3-2*ee),ne=P*83.11%100/100*2.4-1.2,oe=Math.max(2.4,4.2+8.5*y+3.8*g+ne),K=(w*oe+.45*w*w*(.4+.6*g))*u,Q=P*93.41%100/100*2.8,ce=(3+7.5*g+Q)*u,le=Math.max(0,ce+h+D+G),me=i+p*K+S+W+se*j,he=Math.max(l,l+se*(le+$)),fe=n+se*(C+B+G+m);return v?(v.x=me,v.y=he,v.z=fe,v):{x:me,y:he,z:fe}}}function ua(e,a,o,i,l,n,p,u){const x=p||{},X=x.blowDir!=null?x.blowDir:1,y=x.intensity!=null?x.intensity:1,g=x.swirl!=null?x.swirl:0,d=1,k=2,c=3.6,P=3.6,v=1.6,Z=e*37.119%100/100,E=Z<.22,z=e*19.417%100-50,w=e*29.831%100-50,M=E?z*.05:0,A=E?w*.04:0,I=-11,Y=a+M,V=I+o*.03,F=i+A,L=.55+e*43.71%100/100*.9,h=.4+e*81.33%100/100*1.1,C=Math.pow(e*61.19%100/100,1.4)*.6;if(n<d){const S=n/d,U=S*S,b=Math.max(0,(S-.7)/.3),q=b*(2-b),W=(E?1.6:.5)*Math.sin(Math.PI*b)*(1-b),D=a+M*q,B=(1-U)*o+U*V+W,G=i+A*q;return u?(u.x=D,u.y=B,u.z=G,u):{x:D,y:B,z:G}}else{if(n<d+k)return u?(u.x=Y,u.y=V,u.z=F,u):{x:Y,y:V,z:F};if(n<d+k+c){const S=n-(d+k);return Jn(S,n,Z,Y,V,F,X,y,g,l,L,h,C,w,c,e,u)}else if(n<d+k+c+P){const S=(n-(d+k+c))/P,U=S*S*(3-2*S),b=c*(1-U);return Jn(b,n,Z,Y,V,F,X,y,g,l,L,h,C,w,c,e,u)}else{const S=Math.min(1,(n-(d+k+c+P))/v),U=S*S*(3-2*S),b=(1-U)*Y+U*a,q=(1-U)*V+U*o,W=(1-U)*F+U*i;return u?(u.x=b,u.y=q,u.z=W,u):{x:b,y:q,z:W}}}}function da(e,a,o,i,l,n,p,u,x,X,y,g){const d=x!=null&&x>0?x:3,k=(1-Kn)*.82+.18,c=(2.8*Kn*.82+.18)/Math.max(.1,u),P=k+c*d*.78;let v;if(y<u){const w=y/u;v=((1-Math.exp(-2.8*w))*.82+.18*w)*p}else if(y<u+d){const w=y-u,M=w/Math.max(.01,d);v=(k+c*w*(1-.22*M))*p}else{const w=Math.min(1,Math.max(0,(y-(u+d))/Math.max(.1,X))),M=Math.max(0,1-Math.pow(w,2.4));v=P*M*p}const Z=e+i*v,E=a+l*v,z=o+n*v;return g?(g.x=Z,g.y=E,g.z=z,g):{x:Z,y:E,z}}function ma(e,a,o,i,l,n,p,u){const X=Math.min(1,Math.max(0,n/7.5)),y=-48+96*X,g=a+.25*o-y,d=9.2,k=Math.exp(-(g*g)/(2*d*d)),c=Math.sin(Math.PI*X),P=k*(.35+.65*c),v=Math.PI*g/(2*d),Z=Math.cos(v),E=Math.sin(v),z=16,w=.5+.5*Math.tanh(o/8),M=z*(Z-.3*Math.sin(2*v)),A=5*w*Math.max(0,Z),I=-3.5*w*Math.max(0,E),Y=P*(M+A),V=P*(z*.14*E+I),F=-P*(z*.06)*E,L=a+F,h=o+V,C=i+Y;return u?(u.x=L,u.y=h,u.z=C,u):{x:L,y:h,z:C}}function pa(e,a,o,i,l,n,p,u){const y=e*37.119%100/100,g=e*61.19%100/100,d=e*29.17%100/100,k=e*53.17%100/100,c=e*91.73%100/100,P=1.05+.04*Math.sin(.35*n),v=.07+.02*Math.cos(.3*n),Z=Math.cos(P),E=Math.sin(P),z=Math.cos(v),w=Math.sin(v);let M=z,A=w,I=0,Y=-w*E,V=z*E,F=Z;const L=Math.sqrt(Y*Y+V*V+F*F)||1;Y/=L,V/=L,F/=L;const h=A*F-I*V,C=I*Y-M*F,S=M*V-A*Y,U=p&&p.knotScale>0?p.knotScale:11,b=U*.62,q=U*.34,W=U*.15*(1+.03*Math.sin(1.2*n)),D=y*6.28318+.14*n*l,B=Math.sin(3*D),G=Math.cos(3*D),H=b+q*G,ae=Math.cos(2*D),J=Math.sin(2*D),O=H*ae,$=H*J,m=q*B,j=-3*q*B*ae-2*H*J,N=-3*q*B*J+2*H*ae,ee=3*q*G,se=O*M+$*Y+m*h,ne=O*A+$*V+m*C,oe=O*I+$*F+m*S,K=j*M+N*Y+ee*h,Q=j*A+N*V+ee*C,ce=j*I+N*F+ee*S,le=Math.sqrt(K*K+Q*Q+ce*ce)||1,me=K/le,he=Q/le,fe=ce/le,Ge=c*6.28318+.18*n*l,Ue=W*Math.sqrt(k),Le=h*me+C*he+S*fe;let Xe=h-Le*me,ze=C-Le*he,De=S-Le*fe;const He=Math.sqrt(Xe*Xe+ze*ze+De*De)||1;Xe/=He,ze/=He,De/=He;const yt=he*De-fe*ze,Vt=fe*Xe-me*De,tt=me*ze-he*Xe,Ze=Math.cos(Ge),nt=Math.sin(Ge),Oe=se+Ue*(Ze*Xe+nt*yt),Ye=ne+Ue*(Ze*ze+nt*Vt),Ee=oe+Ue*(Ze*De+nt*tt);let be,je,ie;if(n<3){let ue=(n-g*.35)/2.65;ue=Math.max(0,Math.min(1,ue));const ye=ue*ue*ue*(ue*(ue*6-15)+10),Se=.9*l*Math.sin(Math.PI*ye),de=Math.cos(Se),ve=Math.sin(Se),Me=h*a+C*o+S*i,qe=C*i-S*o,Be=S*a-h*o,_e=h*o-C*a,Fe=a*de+qe*ve+h*Me*(1-de),Ne=o*de+Be*ve+C*Me*(1-de),Ve=i*de+_e*ve+S*Me*(1-de);be=Fe+(Oe-Fe)*ye,je=Ne+(Ye-Ne)*ye,ie=Ve+(Ee-Ve)*ye}else if(n<11.5)be=Oe,je=Ye,ie=Ee;else{let ue=(n-11.5-d*.25)/4.25;ue=Math.max(0,Math.min(1,ue));const ye=ue*ue*ue*(ue*(ue*6-15)+10),Se=.9*l*Math.sin(Math.PI*ye),de=Math.cos(Se),ve=Math.sin(Se),Me=h*Oe+C*Ye+S*Ee,qe=C*Ee-S*Ye,Be=S*Oe-h*Ee,_e=h*Ye-C*Oe,Fe=Oe*de+qe*ve+h*Me*(1-de),Ne=Ye*de+Be*ve+C*Me*(1-de),Ve=Ee*de+_e*ve+S*Me*(1-de);be=Fe+(a-Fe)*ye,je=Ne+(o-Ne)*ye,ie=Ve+(i-Ve)*ye}const at=Math.max(0,Math.min(1,(n-3)/(11.5-3))),ht=6.283185307179586*(at*at*at*(at*(at*6-15)+10)),It=Math.cos(ht),Ut=Math.sin(ht),Xt=It*be+Ut*ie,ot=-Ut*be+It*ie;return be=Xt,ie=ot,u?(u.x=be,u.y=je,u.z=ie,u):{x:be,y:je,z:ie}}function fa(e,a,o,i,l,n,p,u){const c=p||{},P=c.mSweepX!=null?c.mSweepX:24,v=c.mSweepY!=null?c.mSweepY:4,Z=c.mSweepZ!=null?c.mSweepZ:12,E=c.mFreqX!=null?c.mFreqX:3.456,z=c.mFreqY!=null?c.mFreqY:5.341,w=c.mFreqZ!=null?c.mFreqZ:2.827,M=c.mPhX!=null?c.mPhX:.4,A=c.mPhY!=null?c.mPhY:0,I=c.mPhZ!=null?c.mPhZ:1.2,Y=c.mLaunchDir!=null?c.mLaunchDir:1,V=c.mTurnT!=null?c.mTurnT:99,F=c.mTurnDir!=null?c.mTurnDir:1,L=c.mSplitT!=null?c.mSplitT:99,h=c.mSplitAng!=null?c.mSplitAng:0,C=c.mDodge1T!=null?c.mDodge1T:3.9,S=c.mDodge2T!=null?c.mDodge2T:7.1,U=c.mDodge3T!=null?c.mDodge3T:99,b=c.mDodgeRad!=null?c.mDodgeRad:8,q=c.mDodgeStr!=null?c.mDodgeStr:1,W=c.mBoilAmp!=null?c.mBoilAmp:0,D=c.mBoilFreq!=null?c.mBoilFreq:14,B=c.mChurnMult!=null?c.mChurnMult:1,G=c.mFlutterMult!=null?c.mFlutterMult:1,H=c.mJinkAmp!=null?c.mJinkAmp:0,ae=c.mJinkFreq!=null?c.mJinkFreq:5.5,J=c.mJinkPh!=null?c.mJinkPh:0,O=c.mBreathAmp!=null?c.mBreathAmp:1,$=c.mScoutAmp!=null?c.mScoutAmp:0,m=11+O*(3.4*Math.sin(.85*9+.7)+1.7*Math.sin(1.65*9)),j=P*Math.sin(E+M),N=v*Math.sin(z+A),ee=Z*Math.sin(w+I),se=j*.25,ne=N*.25+1.5,oe=ee*.25,K=P*E/7,Q=v*z/7,ce=Z*w/7,le=K*Math.cos(E+M),me=Q*Math.cos(z+A)-1.346,he=ce*Math.cos(w+I),fe=Math.sqrt(le*le+me*me+he*he)||1,Ge=le/fe,Ue=me/fe,Le=he/fe,Xe=.6*Math.min(1,fe/10),ze=e*37.119%100/100,De=e*61.19%100/100,He=e*83.11%100/100,yt=e*53.17%100/100,Vt=e*97.31%100/100,tt=ze*6.28318,Ze=De*6.28318,nt=He*6.28318,Oe=(Y>0?a+50:50-a)*.017+De*.55,Ye=n-Oe;if(Ye<=0)return u?(u.x=a,u.y=o,u.z=i,u):{x:a,y:o,z:i};let Ee=Math.min(1,Ye/.9);const be=Ee*Ee*(3-2*Ee),je=Math.sin(Ee*Math.PI)*2.2,ie=n*l,at=Math.max(0,Math.min(1,(n-(V-.45))/.45)),Un=Math.max(0,Math.min(1,(n-V)/.45)),ht=at*(1-Un),It=Math.max(0,Math.min(1,(n-(L-1))/.4)),Ut=Math.max(0,Math.min(1,(n-(L+.6))/.4)),Xt=It*(1-Ut);let ot,ue,ye,Se,de,ve,Me,qe,Be;if(n<9){const te=Math.max(0,(n-2)/7);ot=P*Math.sin(te*E+M),ue=v*Math.sin(te*z+A)+3*Math.sin(te*Math.PI),ye=Z*Math.sin(te*w+I);const _=H*Math.sin(Math.PI*te);ot+=_*Math.sin(te*ae+J),ue+=_*.6*Math.sin(te*ae*.83+J+1.7),ye+=_*Math.cos(te*ae*.91+J+3.1),Se=1,de=11+O*(3.4*Math.sin(.85*n+.7)+1.7*Math.sin(1.65*n));const re=K*Math.cos(te*E+M),pe=Q*Math.cos(te*z+A)+1.346*Math.cos(te*Math.PI),ut=ce*Math.cos(te*w+I),gt=Math.sqrt(re*re+pe*pe+ut*ut)||1;ve=re/gt,Me=pe/gt,qe=ut/gt,Be=.6*Math.min(1,gt/10),Be*=1+.55*ht}else if(n<12){const te=(n-9)/3,_=te*te*(3-2*te);ot=j*(1-.75*_),ue=N*(1-.75*_)+1.5*_,ye=ee*(1-.75*_),Se=1-.7*_,de=m*(1-.55*_),ve=Ge,Me=Ue,qe=Le,Be=Xe*(1-.75*_)}else{const te=n-12;Se=.3*(1-Math.min(1,te/2));let _=te/1.5;_=Math.min(1,_),_=_*_*(3-2*_);const re=1.6*Math.sin(ie*1.05+tt),pe=1+Math.sin(ie*.83+Ze),ut=1.2*Math.cos(ie*.95+nt);ot=se+(re-se)*_,ue=ne+(pe-ne)*_,ye=oe+(ut-oe)*_,de=m*.45,ve=Ge,Me=Ue,qe=Le,Be=Xe*.25*(1-Math.min(1,te/2))}const _e=tt,Fe=2*De-1,Ne=Math.sqrt(Math.max(0,1-Fe*Fe)),Ve=Math.sqrt(He),un=1+.3*Math.sin(2.2*_e+1.8*Fe+.45*ie)+.16*Math.cos(3.3*_e-2.4*Fe+.62*ie);let Tt=Ve*Ne*Math.cos(_e)*de*un,wt=Ve*Fe*.72*de*un,St=Ve*Ne*Math.sin(_e)*de*un;const Xn=e*71.53%100/100,Zt=Math.floor(Xn*6),dn=de/11,mn=(4.5+3*ze)*dn,Aa=mn*Math.sin(.71*Zt+.5*ie+Xn*6.28),Da=mn*.7*Math.sin(1.13*Zt+.38*ie+De*6.28),Pa=mn*.8*Math.cos(.87*Zt+.45*ie+He*6.28),it=Tt,rt=wt,pn=St,st=Tt*ve+wt*Me+St*qe,Ra=Tt-ve*st,Ea=wt-Me*st,Fa=St-qe*st,Ca=Math.max(0,-st),ka=Math.max(0,Ve-.9)/.1,fn=(Ca*1.7+ka*2.6)*Be*(.55+.45*yt)*dn,hn=1+Be;Tt=Ra*.8+ve*(st*hn-fn),wt=Ea*.8+Me*(st*hn-fn),St=Fa*.8+qe*(st*hn-fn);let Yt=B*5.6*Math.sin(.4*rt+1.25*ie+tt),jt=B*4.4*Math.sin(.48*it-1.05*ie+Ze),Wt=B*4.8*Math.cos(.36*it+.3*rt+.9*ie+nt);const Zn=8.5+4*yt,Yn=Math.sin(Zn*ie+tt);Yt+=G*.5*Yn,jt+=G*1.3*Yn,Wt+=G*.4*Math.sin(Zn*.87*ie+Ze),Yt+=W*Math.sin(D*ie+1.9*rt+Ze),jt+=W*.8*Math.sin(D*.87*ie-1.6*it+nt),Wt+=W*Math.cos(D*.71*ie+1.3*(it+rt)+tt),Yt*=Se,jt*=Se,Wt*=Se;let Ke=ot+Aa+Tt+Yt,lt=ue+Da+wt+jt,ct=ye+Pa+St+Wt;if(ht>0){const te=Me,_=-ve,re=Math.sqrt(te*te+_*_+.0025),pe=F*8*ht;Ke+=te/re*pe,lt+=_/re*pe}if(Xt>0){const _=(Zt<3?1:-1)*7.5*Xt*dn;Ke+=Math.cos(h)*_,ct+=Math.sin(h)*_}if(Vt>.93&&Se>.01&&$>0){const te=(1.55+1.3*ze)*Math.PI;let _=Math.sin(ie*te+Vt*40+Ze);if(_>0){_*=_,_*=_,_*=_;const re=Math.sqrt(it*it+rt*rt+pn*pn)||1,pe=$*(4+2.5*He)*_*Se;Ke+=it/re*pe,lt+=rt/re*pe,ct+=pn/re*pe}}if(n>2&&n<9){let te=Math.max(0,Math.min(1,(n-(C-1.1))/.4));te*=1-Math.max(0,Math.min(1,(n-(C+1.1))/.4));let _=Math.max(0,Math.min(1,(n-(S-1.1))/.4));_*=1-Math.max(0,Math.min(1,(n-(S+1.1))/.4));let re=Math.max(0,Math.min(1,(n-(U-1.1))/.4));re*=1-Math.max(0,Math.min(1,(n-(U+1.1))/.4));const pe=Math.max(te,Math.max(_,re)),ut=re>=te&&re>=_?2:_>=te?1:0;if(pe>.001){const gt=Math.min(8.9,n*.92+1.1),Gt=Math.max(0,(gt-2)/7),gn=ut*2.094,La=P*Math.sin(Gt*E+M)+5*Math.sin(1.7*n+1+gn),za=v*Math.sin(Gt*z+A)+3*Math.sin(Gt*Math.PI)+2*Math.sin(1.3*n+gn),jn=Z*Math.sin(Gt*w+I)+4*Math.sin(1.6*n+2+gn),vn=Ke-La,Mn=lt-za,Wn=Math.sqrt(vn*vn+Mn*Mn+(ct-jn)*(ct-jn)),xn=b;if(Wn<xn){const Gn=Wn/xn;let dt=Gn/.5;dt=Math.min(1,dt),dt=dt*dt*(3-2*dt);let mt=(Gn-.6)/.4;mt=Math.max(0,Math.min(1,mt)),mt=mt*mt*(3-2*mt);let Pt=Me,Rt=-ve;const Hn=Math.sqrt(Pt*Pt+Rt*Rt+.0025);Pt/=Hn,Rt/=Hn;const On=(vn*Pt+Mn*Rt)/xn*(dt*(1-mt))*7*q*pe*(.75+.5*yt);Ke+=Pt*On,lt+=Rt*On}}}let bt=Ke,At=lt+je,Dt=ct;if(n>=12){const te=n-12,_=De*.5;let re=(te-_)/(2-_);re=Math.max(0,Math.min(1,re));const pe=re*re*re*(re*(re*6-15)+10);bt=Ke+(a-Ke)*pe,At=lt+je+(o-lt-je)*pe,Dt=ct+(i-ct)*pe}return be<1&&(bt=a+(bt-a)*be,At=o+(At-o)*be,Dt=i+(Dt-i)*be),u?(u.x=bt,u.y=At,u.z=Dt,u):{x:bt,y:At,z:Dt}}const rn=8,Na=40,Ka=2.2,Ja=.9;function Ln(e){const a=9+2.5*e,o=Math.min(Na,12+7*e);return{speed:a,maxRadius:o,lifetime:o/a,decay:2.2-.3*e,width:2+.75*e}}function Qa(){return new Float32Array(rn*4)}function $a(e,a,o,i,l){const n=a*4;e[n]=o,e[n+1]=i,e[n+2]=0,e[n+3]=l}function eo(e,a){for(let o=0;o<e.length;o+=4){if(e[o+3]<=0)continue;e[o+2]+=a;const i=Ln(e[o+3]),l=e[o+2]*i.speed;(e[o+2]>i.lifetime||l>i.maxRadius)&&(e[o+3]=0)}}function Rn(e){for(let a=3;a<e.length;a+=4)if(e[a]>0)return!0;return!1}function to(e,a,o,i,l){let n=0,p=0,u=0;for(let x=0;x<i.length;x+=4){const X=i[x+3];if(X<=0)continue;const y=i[x+2],g=Ln(X),d=e-i[x],k=a-i[x+1],c=Math.sqrt(d*d+k*k);if(c<1e-4)continue;const P=y*g.speed,v=1-Math.abs(c-P)/g.width;if(v<=0)continue;const Z=Math.sin(Math.PI*v)*Math.exp(-g.decay*y)*X,E=Z*Ka/c;n+=d*E,p+=k*E,u+=Z*Ja}return l.x=n,l.y=p,l.z=u,l}const Qn=75,f={initialZ:35,cameraAngleDeg:Qn,zoomMin:10,zoomMax:200,fitMargin:56,zoomSpeed:.8,zoomLerp:.08,rotationStep:.03,rotationAutoReturnLerp:.02,autoReturnGracePeriodMs:300,canvasWidth:800,canvasHeight:150,fontSize:44,pixelStep:2,pixelThreshold:120,targetWorldWidth:80,emojiOptions:["😀","😂","😍","🥰","😎","🤔","😭","😡","😱","🥳","👍","👎","👏","🙏","👌","💪","❤️","🔥","✨","🎉"],emojiRasterSize:320,emojiPixelStep:2,emojiFontSize:280,emojiDensityOverride:1,emojiJitterXY:.03,emojiJitterZ:.5,emojiDepthCue:.06,emojiPointSize:1.6,emojiMotionMix:.35,emojiDepthRange:6,imageRasterSize:320,imagePixelStep:2,imageAlphaThreshold:16,imageJitterXY:.03,imageJitterZ:.5,imageDepthCue:.06,imagePointSize:1.2,imageDepthRange:5,density:8,jitterXY:.08,jitterZ:2.5,explosionSpeedMin:.4,explosionSpeedRange:.8,heatDistance:2/3*35*Math.tan(Qn*Math.PI/360),afterglowDuration:.2,mouseInfluence:6,rippleMoveSpeed:60,rippleEmitIntervalMs:90,rippleMoveAmpMin:.35,rippleMoveAmpMax:1.6,rippleMoveAmpDiv:300,rippleTapGraceMs:150,rippleChargeMs:1e3,rippleTapAmp:.8,rippleChargeAmp:4,chargeCancelPx:8,springK:.12,springDamping:.82,tapCount:3,tapWindowMs:800,inputDebounceMs:150,pointSize:.5,pointSizeAttenuationScale:120,clearColor:131589,maxPixelRatio:2,themes:{ember:{hot:[1,.95,.75],warm:[1,.45,.05],cold:[.92,.18,.05]},arctic:{hot:[.92,.98,1],warm:[.18,.75,1],cold:[.05,.35,.88]},toxic:{hot:[.92,1,.4],warm:[.35,.95,.15],cold:[.06,.58,.22]},neon:{hot:[1,.92,.98],warm:[1,.08,.55],cold:[.35,.05,.88]},sakura:{hot:[1,.95,.96],warm:[1,.45,.65],cold:[.85,.18,.42]}},presets:{KINETIC:{description:"A 3D surf wave rolls through your message — luminous crest, deep blue troughs.",expansionDuration:3.75,contractionDuration:3.75,explosionMaxDistMultiplier:22,motionStyle:3,trailStrength:.7,emberBudget:0,soundPitch:45,soundDuration:7.5,soundType:"sine"},TORNADO:{description:"A four-phase vortex funnel — particles accrete, spiral upward, then dissolve.",expansionDuration:3.5,vortexDuration:4.5,equilibriumDuration:3.5,contractionDuration:3.5,explosionMaxDistMultiplier:26,motionStyle:1,spinSpeed:4.8,funnelHeight:46,funnelBottom:-22,funnelCrownRadius:22,funnelWaistRadius:4.5,funnelTailRadius:1.8,funnelWaistT:.38,funnelCrownT:.82,funnelFadeStart:.03,funnelFadeEnd:.3,trailStrength:.75,emberBudget:90,soundPitch:75,soundDuration:15,soundType:"sawtooth"},BREEZE:{description:"A wind field bends, rolls and disperses your message like leaves in a gust.",expansionDuration:1,contractionDuration:1.6,explosionMaxDistMultiplier:28,motionStyle:2,trailStrength:.6,emberBudget:0,soundPitch:95,soundDuration:11.8,soundType:"sine"},EXPLODE:{description:"A volumetric blast — particles burst outward, hang in the air, then rush home.",expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:36,motionStyle:0,trailStrength:.3,emberBudget:140,soundPitch:110,soundDuration:6.2,soundType:"sine"},TORUS:{description:"Gravity forges your message into a flowing torus knot of light around a black hole, then lets it rain back home.",expansionDuration:8,contractionDuration:4,explosionMaxDistMultiplier:30,motionStyle:4,trailStrength:.8,emberBudget:50,soundPitch:40,soundDuration:16,soundType:"sine"},MURMURATION:{description:"Your message takes flight — whip turns, split-and-merge waves, falcon strikes and startle sparks, then it settles home.",expansionDuration:2,contractionDuration:2,explosionMaxDistMultiplier:30,motionStyle:5,trailStrength:.7,emberBudget:60,soundPitch:70,soundDuration:14,soundType:"sine"},DEFAULT:{expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:15,motionStyle:-1,spokes:12,spokeJitter:.03,spinSpeed:0,funnelHeight:0,funnelBottom:0,funnelCrownRadius:0,funnelWaistRadius:0,funnelTailRadius:0,funnelWaistT:0,funnelCrownT:0,funnelFadeStart:0,funnelFadeEnd:0,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"}}};let We=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{We=e.matches});let xe=null;const no=384;let $t=0,Ae=null,zn={w:80,h:80};const ao=`
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
// Torus knot auto-calibration (world units, from the camera frustum)
uniform float uKnotScale;
// Hover ripples: vec4 slots (x, y, age, amp) in local space, amp <= 0 = inactive.
// Ages advance on the CPU each frame; the shader only flashes light on wavefronts
// (displacement runs through the spring integrator on the CPU/worker side).
uniform vec4 uRipples[8];
uniform float uCharge;
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

vec3 computeBreezePlumeGPU(float tWind, float curElapsed, float lambda, vec3 gPos, float gx, float intensity, float swirl, float cd, float windSpeedMult, float buoyancy, float liftStart, float seedZ, float t2, float i) {
    float upwindPos = (gPos.x * gx) + 25.0;
    float randOffset = (mod(i * 53.17, 100.0) / 100.0) * 0.30;
    float gustDelay = min(0.75, max(0.0, upwindPos * 0.015 + randOffset));
    float localT = max(0.0, tWind - gustDelay);
    float pLocal = min(1.0, localT / (t2 - gustDelay + 1e-4));

    if (localT <= 0.0) {
        return gPos;
    }

    // -- Option 1: 3D Spiral Ribbons & Braided Filaments --
    float ribbonId = mod(i, 3.0);
    float ribbonPhase = ribbonId * 2.094395; // 2*PI/3
    float braidWavelength = 0.15;
    float braidSpeed = 2.8;
    float braidAngle = braidWavelength * (gPos.x * gx) - braidSpeed * curElapsed + ribbonPhase;
    float braidRadius = (1.8 + 3.8 * buoyancy) * min(1.0, localT / 0.8) * intensity;
    float braidY = braidRadius * sin(braidAngle);
    float braidZ = braidRadius * cos(braidAngle);
    float braidX = gx * (braidRadius * 0.55 * sin(braidAngle * 0.5));

    // -- Option 6: Floating Leaf Flutter & Pendulum Gliding --
    float leafRockFreq = 3.6 + (mod(i * 41.73, 100.0) / 100.0) * 2.0;
    float leafPhase = (mod(i * 67.89, 100.0) / 100.0) * 6.28318;
    float pendulumAngle = leafRockFreq * curElapsed + leafPhase;

    float leafGlideX = gx * (sin(pendulumAngle) * (0.80 + 1.10 * windSpeedMult)) * intensity;
    float leafGlideY = abs(cos(pendulumAngle)) * (0.95 + 1.45 * buoyancy) * intensity;
    float leafGlideZ = sin(pendulumAngle * 0.75 + leafPhase) * (1.30 + 1.80 * windSpeedMult) * intensity;

    float leafWobble = sin(9.5 * curElapsed + i * 0.35) * 0.40 * intensity * min(1.0, localT);

    // -- Swirl / Whirlwind Vortex Dynamics (Randomized from 0.0 to 1.4+) --
    float swirlSign = (mod(i * 29.17, 10.0) > 5.0) ? 1.0 : -1.0;
    float swirlAngle = 0.12 * (gPos.x * gx) - 3.8 * curElapsed * swirlSign + (mod(i * 31.41, 100.0) / 100.0) * 6.28318;
    float swirlEnvelope = sin(3.14159265 * pLocal);
    float swirlRadius = (3.2 + 6.0 * buoyancy) * swirl * intensity * swirlEnvelope;
    float swirlY = swirlRadius * sin(swirlAngle);
    float swirlZ = swirlRadius * cos(swirlAngle);
    float swirlX = gx * (swirlRadius * 0.35 * cos(swirlAngle * 2.0));

    if (lambda > 0.82) {
        // -- Strata C: Ground Skittering Leaves (Tumbling along floor) --
        float groundSpeed = (3.2 + 6.0 * windSpeedMult) * intensity;
        float groundDist = groundSpeed * (localT * 0.85 + 0.08 * localT * localT);
        float groundSkip = (0.35 * abs(sin(pendulumAngle)) + 0.10 * sin(curElapsed * 10.0 + i)) * min(1.0, localT);
        float groundZDrift = (0.75 * sin(pendulumAngle * 0.6) + leafWobble + swirlZ * 0.25) * min(1.0, localT);
        return vec3(gPos.x + gx * groundDist + leafGlideX * 0.4 + swirlX * 0.25, max(gPos.y, gPos.y + groundSkip), gPos.z + groundZDrift);
    } else {
        // -- Strata A & B: Airborne Braided Ribbon Streams + Floating Leaf Gliding + Swirl Vortex --
        float indLiftStart = liftStart * 0.50;
        float liftProg = min(1.0, max(0.0, (pLocal - indLiftStart) / (1.0 - indLiftStart + 1e-4)));
        float eLift = liftProg * liftProg * (3.0 - 2.0 * liftProg);

        float randSpeedVariation = (mod(i * 83.11, 100.0) / 100.0) * 2.4 - 1.2;
        float baseSpeed = max(2.4, 4.2 + 8.5 * windSpeedMult + 3.8 * buoyancy + randSpeedVariation);
        float xDispersal = (localT * baseSpeed + 0.45 * localT * localT * (0.4 + 0.6 * buoyancy)) * intensity;

        float randHeight = (mod(i * 93.41, 100.0) / 100.0) * 2.8;
        float baseLiftHeight = (3.0 + 7.5 * buoyancy + randHeight) * intensity;
        float totalLift = max(0.0, baseLiftHeight + braidY + leafGlideY + leafWobble);

        float rx = gPos.x + gx * xDispersal + braidX + leafGlideX + eLift * swirlX;
        float ry = max(gPos.y, gPos.y + eLift * (totalLift + swirlY));
        float rz = gPos.z + eLift * (braidZ + leafGlideZ + leafWobble + swirlZ);

        return vec3(rx, ry, rz);
    }
}

vec3 evalBreezeGPU(float i, vec3 home, float cd, float elapsed, float gx, float intensity, float swirl) {
    float t1 = 1.0;
    float tPause = 2.0;
    float t2 = 3.6;
    float t3 = 3.6;
    float t4 = 1.6;

    float lambda = mod(i * 37.119, 100.0) / 100.0;
    bool isClash = lambda < 0.22;
    float seedX = mod(i * 19.417, 100.0) - 50.0;
    float seedZ = mod(i * 29.831, 100.0) - 50.0;
    float scatX = isClash ? seedX * 0.05 : 0.0;
    float scatZ = isClash ? seedZ * 0.04 : 0.0;
    float yGround = -11.0;

    vec3 gPos = vec3(home.x + scatX, yGround + (home.y * 0.03), home.z + scatZ);
    float windSpeedMult = 0.55 + (mod(i * 43.71, 100.0) / 100.0) * 0.90;
    float buoyancy = 0.40 + (mod(i * 81.33, 100.0) / 100.0) * 1.10;
    float liftStart = pow(mod(i * 61.19, 100.0) / 100.0, 1.4) * 0.60;

    if (elapsed < t1) {
        float p1 = elapsed / t1;
        float eDrop = p1 * p1;
        float pImpact = max(0.0, (p1 - 0.70) / 0.30);
        float eImpact = pImpact * (2.0 - pImpact);
        float recoil = (isClash ? 1.6 : 0.5) * sin(3.14159265 * pImpact) * (1.0 - pImpact);
        return vec3(home.x + scatX * eImpact, (1.0 - eDrop) * home.y + eDrop * gPos.y + recoil, home.z + scatZ * eImpact);
    } else if (elapsed < t1 + tPause) {
        return gPos;
    } else if (elapsed < t1 + tPause + t2) {
        float tWind = elapsed - (t1 + tPause);
        return computeBreezePlumeGPU(tWind, elapsed, lambda, gPos, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i);
    } else if (elapsed < t1 + tPause + t2 + t3) {
        float p3 = (elapsed - (t1 + tPause + t2)) / t3;
        float smoothP3 = p3 * p3 * (3.0 - 2.0 * p3);
        float tWindRev = t2 * (1.0 - smoothP3);
        return computeBreezePlumeGPU(tWindRev, elapsed, lambda, gPos, gx, intensity, swirl, cd, windSpeedMult, buoyancy, liftStart, seedZ, t2, i);
    } else {
        float p4 = min(1.0, (elapsed - (t1 + tPause + t2 + t3)) / t4);
        float eRise = p4 * p4 * (3.0 - 2.0 * p4);
        return mix(gPos, home, eRise);
    }
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

// Style 4: black hole trefoil — vortex suck-in, flowing (2,3) torus knot,
// spiral rain home. Mirrors evaluateTorusParticle in physics-math.js.
vec3 evalTorusGPU(float i, vec3 home, float cd, float elapsed) {
    float t1 = 3.0;
    float T123 = 11.5;
    float t4 = 4.5;

    float hA = mod(i * 37.119, 100.0) / 100.0;
    float hB = mod(i * 61.19, 100.0) / 100.0;
    float hD = mod(i * 29.17, 100.0) / 100.0;
    float hE = mod(i * 53.17, 100.0) / 100.0;
    float hF = mod(i * 91.73, 100.0) / 100.0;

    // Precessing frame: tiltX≈60° puts the knot plane nearly face-on to the
    // camera (nn_z=sin(tiltX)) — projects as the woven 3-lobe clover
    float tiltX = 1.05 + 0.04 * sin(0.35 * elapsed);
    float tiltZ = 0.07 + 0.02 * cos(0.30 * elapsed);
    float cTx = cos(tiltX);
    float sTx = sin(tiltX);
    float cTz = cos(tiltZ);
    float sTz = sin(tiltZ);
    vec3 ex = vec3(cTz, sTz, 0.0);
    vec3 ez = normalize(vec3(-sTz * sTx, cTz * sTx, cTx));
    vec3 nn = cross(ex, ez);

    // Trefoil as (2,3) torus knot — face-on woven clover like the reference.
    float S = uKnotScale > 0.0 ? uKnotScale : 11.0;
    float RK = S * 0.62;
    float rK = S * 0.34;
    float rt = S * 0.15 * (1.0 + 0.03 * sin(1.2 * elapsed));

    // Slow flow along the knot for readability
    float u = hA * 6.28318 + 0.14 * elapsed * cd;

    // Path point and analytic tangent (local frame; z along nn)
    float ringM = RK + rK * cos(3.0 * u);
    vec3 cPath = vec3(ringM * cos(2.0 * u), ringM * sin(2.0 * u), rK * sin(3.0 * u));
    vec3 tanL = vec3(
        -3.0 * rK * sin(3.0 * u) * cos(2.0 * u) - 2.0 * ringM * sin(2.0 * u),
        -3.0 * rK * sin(3.0 * u) * sin(2.0 * u) + 2.0 * ringM * cos(2.0 * u),
        3.0 * rK * cos(3.0 * u));

    mat3 basis = mat3(ex, ez, nn);
    vec3 core = cPath * basis;
    vec3 T = normalize(tanL * basis);

    float phi = hF * 6.28318 + 0.18 * elapsed * cd;
    // Solid rope cross-section — one wall per strand, reads as a single tube
    float rtI = rt * sqrt(hE);
    vec3 tN = normalize(nn - dot(nn, T) * T);
    vec3 tB = cross(T, tN);
    vec3 kp = core + rtI * (cos(phi) * tN + sin(phi) * tB);

    vec3 p;
    if (elapsed < t1) {
        // Phase 1: vortex collapse — home swings around the axis onto the knot
        float p1 = clamp((elapsed - hB * 0.35) / 2.65, 0.0, 1.0);
        float e1 = p1 * p1 * p1 * (p1 * (p1 * 6.0 - 15.0) + 10.0);
        // The home endpoint swirls gently around the knot axis mid-flight —
        // small angle so the eye sees ONE tube forming, never orbit rings.
        float aR = 0.9 * cd * sin(3.14159265 * e1);
        float cR = cos(aR), sR = sin(aR);
        float dN = dot(nn, home);
        vec3 cr = cross(nn, home);
        vec3 h2 = home * cR + cr * sR + nn * dN * (1.0 - cR);
        p = mix(h2, kp, e1);
    } else if (elapsed < T123) {
        // Phase 2: knot flow — streaming along the living knot
        p = kp;
    } else {
        // Phase 3: reformation — release swirl, spiral rain back home
        float p4 = clamp((elapsed - T123 - hD * 0.25) / 4.25, 0.0, 1.0);
        float e4 = p4 * p4 * p4 * (p4 * (p4 * 6.0 - 15.0) + 10.0);
        float aR = 0.9 * cd * sin(3.14159265 * e4);
        float cR = cos(aR), sR = sin(aR);
        float dN = dot(nn, kp);
        vec3 cr = cross(nn, kp);
        vec3 k2 = kp * cR + cr * sR + nn * dN * (1.0 - cR);
        p = mix(k2, home, e4);
    }
    // Turntable yaw about the world vertical (Y) axis: exactly ONE full
    // revolution during Knot Flow, holding aligned before and after so the
    // message always lands upright. Shows the knot's full 3D structure.
    float yawU = clamp((elapsed - t1) / (T123 - t1), 0.0, 1.0);
    float yawS = yawU * yawU * yawU * (yawU * (yawU * 6.0 - 15.0) + 10.0);
    float yawA = 6.28318530718 * yawS;
    float cyw = cos(yawA);
    float syw = sin(yawA);
    p = vec3(cyw * p.x + syw * p.z, p.y, -syw * p.x + cyw * p.z);
    return p;
}

// Style 5: starling flock — randomized flight plan + event schedule (snap turns,
// split/merge, randomized predator dodges), sub-swarms, streaming, boil turbulence,
// darting scouts. Mirrors evaluateMurmurationParticle in physics-math.js.
vec3 evalMurmurationGPU(float i, vec3 home, float cd, float elapsed,
        float swX, float swY, float swZ,
        float fX, float fY, float fZ,
        float phX, float phY, float phZ, float launchDir,
        float turnT, float turnDir, float splitT, float splitAng,
        float d1T, float d2T, float d3T, float dodgeRad, float dodgeStr,
        float boilAmp, float boilFreq, float churnMult, float flutterMult,
        float jinkAmp, float jinkFreq, float jinkPh, float breathAmp,
        float scoutAmp) {
    float t1 = 2.0;
    float t2 = 7.0;
    float t3 = 3.0;
    float t4 = 2.0;
    float T12 = 9.0;
    float T123 = 12.0;

    float p1h = mod(i * 37.119, 100.0) / 100.0;
    float p2h = mod(i * 61.19, 100.0) / 100.0;
    float p3h = mod(i * 83.11, 100.0) / 100.0;
    float p4h = mod(i * 53.17, 100.0) / 100.0;
    float p5h = mod(i * 71.53, 100.0) / 100.0;
    float p6h = mod(i * 97.31, 100.0) / 100.0;
    float ph1 = p1h * 6.28318;
    float ph2 = p2h * 6.28318;
    float ph3 = p3h * 6.28318;

    // Launch ripple sweeping across the message
    float delay = (launchDir > 0.0 ? home.x + 50.0 : 50.0 - home.x) * 0.017 + p2h * 0.55;
    float lt = elapsed - delay;
    if (lt <= 0.0) return home;
    float lbRaw = min(1.0, lt / 0.9);
    float lb = lbRaw * lbRaw * (3.0 - 2.0 * lbRaw);
    float hop = sin(lbRaw * 3.14159265) * 2.2;

    float te = elapsed * cd;

    // Flight-end constants keep settle/landing seamless for any plan
    float endCx = swX * sin(fX + phX);
    float endCy = swY * sin(fY + phY);
    float endCz = swZ * sin(fZ + phZ);
    float setCx = endCx * 0.25;
    float setCy = endCy * 0.25 + 1.5;
    float setCz = endCz * 0.25;
    float kvx = swX * fX / 7.0;
    float kvy = swY * fY / 7.0;
    float kvz = swZ * fZ / 7.0;
    float evx = kvx * cos(fX + phX);
    float evy = kvy * cos(fY + phY) - 1.346;
    float evz = kvz * cos(fZ + phZ);
    float evlen = max(length(vec3(evx, evy, evz)), 1e-4);
    vec3 evN = vec3(evx, evy, evz) / evlen;
    float ea = 0.60 * min(1.0, evlen / 10.0);
    float rFlightEnd = (11.0 + breathAmp * (3.4 * sin(0.85 * 9.0 + 0.7) + 1.7 * sin(1.65 * 9.0)));

    // Snap-turn pulse: sharp linear rise/fall window centered on turnT
    float tRise = clamp((elapsed - (turnT - 0.45)) / 0.45, 0.0, 1.0);
    float tFall = clamp((elapsed - turnT) / 0.45, 0.0, 1.0);
    float turnPulse = tRise * (1.0 - tFall);

    // Split-and-merge envelope: 1.2s full-separation plateau around splitT
    float sRise = clamp((elapsed - (splitT - 1.0)) / 0.4, 0.0, 1.0);
    float sFall = clamp((elapsed - (splitT + 0.6)) / 0.4, 0.0, 1.0);
    float splitEnv = sRise * (1.0 - sFall);

    // Shared flock center path + analytic streaming direction
    vec3 C;
    vec3 vDir;
    float churn;
    float blobR;
    float strA;
    if (elapsed < T12) {
        float u = max(0.0, (elapsed - t1) / t2);
        C = vec3(
            swX * sin(u * fX + phX),
            swY * sin(u * fY + phY) + 3.0 * sin(u * 3.14159265),
            swZ * sin(u * fZ + phZ));
        // Whip jinks: higher-frequency lobes on the flight path. The sin(pi*u)
        // envelope zeroes them exactly at take-off and flight-end so the
        // settle/landing end-constants stay valid.
        float jk = jinkAmp * sin(u * 3.14159265);
        C += vec3(
            jk * sin(u * jinkFreq + jinkPh),
            jk * 0.6 * sin(u * jinkFreq * 0.83 + jinkPh + 1.7),
            jk * cos(u * jinkFreq * 0.91 + jinkPh + 3.1));
        churn = 1.0;
        // Breathing flock volume: two superposed pulses swell and contract the
        // whole cloud organically through the flight window.
        blobR = 11.0 + breathAmp * (3.4 * sin(0.85 * elapsed + 0.7) + 1.7 * sin(1.65 * elapsed));
        vec3 dv = vec3(
            kvx * cos(u * fX + phX),
            kvy * cos(u * fY + phY) + 1.346 * cos(u * 3.14159265),
            kvz * cos(u * fZ + phZ));
        vDir = normalize(dv + vec3(1e-6));
        strA = 0.60 * min(1.0, length(dv) / 10.0);
        strA *= 1.0 + 0.55 * turnPulse;   // shear harder through snap turns
    } else if (elapsed < T123) {
        float s0 = (elapsed - T12) / t3;
        float s = s0 * s0 * (3.0 - 2.0 * s0);
        C = vec3(endCx, endCy, endCz) * (1.0 - 0.75 * s) + vec3(0.0, 1.5 * s, 0.0);
        churn = 1.0 - 0.7 * s;
        blobR = rFlightEnd * (1.0 - 0.55 * s);
        vDir = evN;
        strA = ea * (1.0 - 0.75 * s);
    } else {
        float tau4 = elapsed - T123;
        churn = 0.3 * (1.0 - min(1.0, tau4 / t4));
        float sq = min(1.0, tau4 / 1.5); sq = sq * sq * (3.0 - 2.0 * sq);
        vec3 hover = vec3(
            1.6 * sin(te * 1.05 + ph1),
            1.0 + sin(te * 0.83 + ph2),
            1.2 * cos(te * 0.95 + ph3));
        C = vec3(setCx, setCy, setCz) + (hover - vec3(setCx, setCy, setCz)) * sq;
        blobR = rFlightEnd * 0.45;
        vDir = evN;
        strA = ea * 0.25 * (1.0 - min(1.0, tau4 / t4));
    }

    // Flock slot: center-weighted point inside the blob volume
    float slotTh = ph1;
    float cosPhi = 2.0 * p2h - 1.0;
    float sinPhi = sqrt(max(0.0, 1.0 - cosPhi * cosPhi));
    float slotMag = sqrt(p3h);

    // Directional lobes: asymmetric bulges/folds defeat any sphere silhouette
    float lobe = 1.0
        + 0.30 * sin(2.2 * slotTh + 1.8 * cosPhi + 0.45 * te)
        + 0.16 * cos(3.3 * slotTh - 2.4 * cosPhi + 0.62 * te);

    vec3 slot = vec3(
        slotMag * sinPhi * cos(slotTh),
        slotMag * cosPhi * 0.72,
        slotMag * sinPhi * sin(slotTh)) * (blobR * lobe);

    // Sub-swarms: six overlapping clumps wandering semi-independently
    float swId = floor(p5h * 6.0);
    float swScale = blobR / 11.0;
    float swAmp = (4.5 + 3.0 * p1h) * swScale;
    vec3 swarmO = vec3(
        sin(0.71 * swId + 0.50 * te + p5h * 6.28),
        0.7 * sin(1.13 * swId + 0.38 * te + p2h * 6.28),
        0.8 * cos(0.87 * swId + 0.45 * te + p3h * 6.28)) * swAmp;

    // Velocity-aligned streaming: stretch along travel, trail behind
    float along = dot(slot, vDir);
    vec3 perp = slot - vDir * along;
    float back = max(0.0, -along);
    float shell = max(0.0, slotMag - 0.9) / 0.1;
    float trail = (back * 1.7 + shell * 2.6) * strA * (0.55 + 0.45 * p4h) * swScale;
    vec3 streamed = perp * 0.80 + vDir * (along * (1.0 + strA) - trail);

    // Churn field keyed on slot position + wingbeat flutter + boil turbulence
    vec3 F = churnMult * vec3(
        5.6 * sin(0.40 * slot.y + 1.25 * te + ph1),
        4.4 * sin(0.48 * slot.x - 1.05 * te + ph2),
        4.8 * cos(0.36 * slot.x + 0.30 * slot.y + 0.90 * te + ph3));
    float wf = 8.5 + 4.0 * p4h;
    float fl = sin(wf * te + ph1);
    F += flutterMult * vec3(0.5 * fl, 1.3 * fl, 0.4 * sin(wf * 0.87 * te + ph2));
    // Boil turbulence: incommensurate high-frequency layer keyed on the slot,
    // giving individual birds chaotic interior jitter (the "living" look).
    F += boilAmp * vec3(
        sin(boilFreq * te + 1.9 * slot.y + ph2),
        0.8 * sin(boilFreq * 0.87 * te - 1.6 * slot.x + ph3),
        cos(boilFreq * 0.71 * te + 1.3 * (slot.x + slot.y) + ph1));
    F *= churn;

    vec3 P = C + swarmO + streamed + F;

    // Snap-turn bank impulse: whip the whole flock sideways mid-flight
    if (turnPulse > 0.0) {
        vec2 bk = vec2(vDir.y, -vDir.x);
        float bkN = sqrt(dot(bk, bk) + 2.5e-3);
        float bankMag = turnDir * 8.0 * turnPulse;
        P.xy += (bk / bkN) * bankMag;
    }

    // Split & merge: tear the six sub-swarms into two lobes along a random
    // horizontal axis, fly them apart, then pour them back together
    if (splitEnv > 0.0) {
        float sideSign = (swId < 3.0) ? 1.0 : -1.0;
        float sepMag = sideSign * 7.5 * splitEnv * swScale;
        P.x += cos(splitAng) * sepMag;
        P.z += sin(splitAng) * sepMag;
    }

    // Darting scouts: rare individuals streak out of the blob and snap back
    if (p6h > 0.93 && churn > 0.01 && scoutAmp > 0.0) {
        float dartRate = (1.55 + 1.3 * p1h) * 3.14159265;
        float dw = sin(te * dartRate + p6h * 40.0 + ph2);
        if (dw > 0.0) {
            dw *= dw; dw *= dw; dw *= dw;
            float slotLen = max(length(slot), 1e-4);
            float dartMag = scoutAmp * (4.0 + 2.5 * p3h) * dw * churn;
            P += (slot / slotLen) * dartMag;
        }
    }

    // Predator dodges: up to three sweeping exclusion cavities shape-shift
    // the flock at per-blast randomized times with a random strike radius
    // and parting force
    if (elapsed > 2.0 && elapsed < 9.0) {
        float wA = clamp((elapsed - (d1T - 1.1)) / 0.4, 0.0, 1.0);
        wA *= 1.0 - clamp((elapsed - (d1T + 1.1)) / 0.4, 0.0, 1.0);
        float wB = clamp((elapsed - (d2T - 1.1)) / 0.4, 0.0, 1.0);
        wB *= 1.0 - clamp((elapsed - (d2T + 1.1)) / 0.4, 0.0, 1.0);
        float wC = clamp((elapsed - (d3T - 1.1)) / 0.4, 0.0, 1.0);
        wC *= 1.0 - clamp((elapsed - (d3T + 1.1)) / 0.4, 0.0, 1.0);
        float wEnv = max(wA, max(wB, wC));
        float dodgeIdx = (wC >= wA && wC >= wB) ? 2.0 : ((wB >= wA) ? 1.0 : 0.0);
        if (wEnv > 0.001) {
            // The predator rides the flock's own flight path with a lateral
            // weave (phase-offset per attack), so the dodge is guaranteed to
            // cut through the blob.
            float qt = min(8.9, elapsed * 0.92 + 1.1);
            float qU = max(0.0, (qt - 2.0) / 7.0);
            float wo = dodgeIdx * 2.094;
            vec3 Q = vec3(
                swX * sin(qU * fX + phX) + 5.0 * sin(1.7 * elapsed + 1.0 + wo),
                swY * sin(qU * fY + phY) + 3.0 * sin(qU * 3.14159265) + 2.0 * sin(1.3 * elapsed + wo),
                swZ * sin(qU * fZ + phZ) + 4.0 * sin(1.6 * elapsed + 2.0 + wo));
            // Part the flock around the predator: slide particles sideways
            // relative to the flow direction instead of pushing them radially.
            // A radial push compresses displaced particles into a visible rim
            // ring; tangential parting preserves radial density and reads as
            // the flock cleaving around a falcon. Magnitude fades to zero at
            // the cavity rim and on the parting mid-plane, so nothing snaps.
            vec3 dvv = P - Q;
            float d = length(dvv);
            float rad = dodgeRad;
            if (d < rad) {
                float x = d / rad;
                float rise = min(1.0, x / 0.5); rise = rise * rise * (3.0 - 2.0 * rise);
                float fall = clamp((x - 0.6) / 0.4, 0.0, 1.0); fall = fall * fall * (3.0 - 2.0 * fall);
                // In-plane perpendicular to the flock's travel direction,
                // smoothly attenuated so near-vertical turnarounds fade the
                // parting out instead of switching it off abruptly.
                vec2 pv = vec2(vDir.y, -vDir.x);
                pv /= sqrt(dot(pv, pv) + 2.5e-3);
                float sideDist = dot(dvv.xy, pv);
                float part = (sideDist / rad) * (rise * (1.0 - fall)) * 7.0 * dodgeStr * wEnv * (0.75 + 0.5 * p4h);
                P += vec3(pv * part, 0.0);
            }
        }
    }

    // Landing blend to home, then take-off blend from home
    P.y += hop;
    if (elapsed >= T123) {
        float tau4 = elapsed - T123;
        float stg = p2h * 0.5;
        float q = clamp((tau4 - stg) / (t4 - stg), 0.0, 1.0);
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
                    uMJinkAmp, uMJinkFreq, uMJinkPh, uMBreathAmp, uMScoutAmp);
            } else {
                livePos = evalExplosionGPU(homePosition, aRandomDir, aRandomSpeed, uMaxDist, uExpDuration, uDriftDuration, uContractionDuration, uExplosionElapsed);
            }
        }
    }

    // Smooth spatial gradient across the sculpture blended with mouse hover glow.
    // uCharge widens and brightens the cursor glow while a splash is charging.
    float spatialGrad = clamp((homePosition.y + 12.0) / 24.0 + 0.15 * sin(0.12 * homePosition.x), 0.0, 1.0);
    float heatRadius = uMouseInfluence + uCharge * 4.0;
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
    float hoverMix = mix(spatialGrad, 1.0, mouseHeat * (0.9 + 0.5 * uCharge));
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
`,oo=`
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
`,t={currentText:"Bring your message!",lastText:"Bring your message!",currentTheme:"ember",currentFont:"Outfit",messageMode:"text",activeImage:null,imageName:"",activePreset:null,lastRandomPreset:null,activeEmoji:null,lastEmoji:null,lastImage:null,lastImageName:"",audioEnabled:!0,gpuPhysics:!(typeof window<"u"&&(new URLSearchParams(window.location.search).get("noworker")==="1"||new URLSearchParams(window.location.search).get("gpu")==="0")),expansionDuration:f.presets.DEFAULT.expansionDuration,driftDuration:f.presets.DEFAULT.driftDuration||3,contractionDuration:f.presets.DEFAULT.contractionDuration,explosionMaxDistMultiplier:f.presets.DEFAULT.explosionMaxDistMultiplier,motionStyle:f.presets.DEFAULT.motionStyle,activeExpansionDuration:null,activeContractionDuration:null,activeMaxDist:null,actualTravelRadius:0,travelApplied:!1,embersSpawned:!1,dodgeEmbersFired:!1,afterglowStartTime:null,soundPitch:f.presets.DEFAULT.soundPitch,soundDuration:f.presets.DEFAULT.soundDuration,soundType:f.presets.DEFAULT.soundType,trailStrength:f.presets.DEFAULT.trailStrength,pattern:{spokes:f.presets.DEFAULT.spokes,spokeJitter:f.presets.DEFAULT.spokeJitter,spinSpeed:f.presets.DEFAULT.spinSpeed,funnelHeight:f.presets.DEFAULT.funnelHeight,funnelBottom:f.presets.DEFAULT.funnelBottom,funnelCrownRadius:f.presets.DEFAULT.funnelCrownRadius,funnelWaistRadius:f.presets.DEFAULT.funnelWaistRadius,funnelTailRadius:f.presets.DEFAULT.funnelTailRadius,funnelWaistT:f.presets.DEFAULT.funnelWaistT,funnelCrownT:f.presets.DEFAULT.funnelCrownT,funnelFadeStart:f.presets.DEFAULT.funnelFadeStart,funnelFadeEnd:f.presets.DEFAULT.funnelFadeEnd,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"},heatCold:[.1,.4,1],heatWarm:[1,1,.1],heatHot:[1,.1,.1],get totalExplosionDuration(){const e=s&&s.activeStyle>=0?s.activeStyle:this.motionStyle;if(e===1){const l=this.expansionDuration||3.5,n=this.pattern&&this.pattern.vortexDuration?this.pattern.vortexDuration:4.5,p=this.pattern&&this.pattern.equilibriumDuration?this.pattern.equilibriumDuration:3.5,u=this.contractionDuration||3.5;return l+n+p+u}if(e===2)return 11.8;if(e===3)return 7.5;if(e===4)return 16;if(e===5)return 14;const a=this.activeExpansionDuration||this.expansionDuration,o=this.activeContractionDuration||this.contractionDuration;return a+(e===0||e===-1?3:0)+o}},r={scene:null,camera:null,renderer:null,particles:null,clock:new qa,trailPoints:null,trailData:null,trailLive:null,trailPosAttr:null,trailLiveAttr:null,emberPoints:null,emberData:null,emberVel:null,emberLife:null,emberPosAttr:null,emberLifeAttr:null,targetZ:f.initialZ,autoFit:!0,prevTime:0,prevDt:0,prevKFrame:0,prevDampFrame:0},s={posHome:null,posLive:null,explosionOrigin:null,springDisp:null,springVel:null,randomDir:null,randomSpeed:null,funnelT:null,funnelRadialX:null,funnelRadialZ:null,activeStyle:-1,slots:[],sendQueue:[],seq:0,sourceGeneration:0,motionToken:0,explosionStartTime:-1,positionsDirty:!1,randomized:null};function io(){return typeof window<"u"&&new URLSearchParams(window.location.search).get("noworker")==="1"?15e3:xe||t.gpuPhysics?3e4:15e3}const T={keys:{ArrowUp:!1,ArrowDown:!1,ArrowLeft:!1,ArrowRight:!1,"+":!1,"-":!1,"=":!1," ":!1},mouseWorld:new Pe,mouseLocal:new Pe,invMatrix:new Ya,mouseWorldPos:new Pe(-1e3,-1e3,0),lastClickTime:0,lastPinchDist:null,lastMidpoint:new Za,lastGestureEndTime:0,inputDebounceTimer:null,toastTimer:null,flashTimer:null,drawerCloseTimer:null,wordmarkTimer:null,menuRestoreDesktop:!1,menuRestoreMobile:!1,isDragging:!1,prevMouseX:0,prevMouseY:0,pendingPointer:null,charge:{active:!1,pointerId:-1,x0:0,y0:0,t0:0,value:0,release:null},tapRing:{pending:null,x:0,y:0,age:0,count:0,active:!1}},we=Qa(),Te={idx:0,lastEmitMs:0,prevCX:0,prevCY:0,hasPrevClient:!1,speedU:0},Ot={x:0,y:0,z:0},Je=new Pe;function En(e,a,o){$a(we,Te.idx,e,a,o),Te.idx=(Te.idx+1)%rn}function ro(){we.fill(0)}const R={uMouse:{value:new Pe(-1e3,-1e3,0)},uMouseInfluence:{value:f.mouseInfluence},uPointSize:{value:f.pointSize},uPixelRatio:{value:1},uPointScale:{value:f.pointSizeAttenuationScale/f.initialZ},uDepthCue:{value:.28},uColorHot:{value:new Pe(1,0,0)},uColorWarm:{value:new Pe(1,1,0)},uColorCold:{value:new Pe(1,1,1)},uExplosionActive:{value:0},uTornadoActive:{value:0},uTornadoFadeStart:{value:.03},uTornadoFadeEnd:{value:.3},uHeatDistance:{value:f.heatDistance},uHeatCold:{value:new Pe(.1,.4,1)},uHeatWarm:{value:new Pe(1,1,.1)},uHeatHot:{value:new Pe(1,.1,.1)},uAudioMid:{value:0},uAudioHigh:{value:0},uAudioEnvelope:{value:0},uPointSizeTrail:{value:.4},uTrailStrength:{value:.25},uEmojiMode:{value:0},uEmojiMotionMix:{value:f.emojiMotionMix},uUseSourceTexture:{value:0},uSourceTexture:{value:null},uGpuPhysics:{value:1},uMotionStyle:{value:0},uExplosionElapsed:{value:-1},uExpDuration:{value:2},uDriftDuration:{value:3},uContractionDuration:{value:2},uMaxDist:{value:35},uSpinSpeed:{value:5.2},uFunnelBottom:{value:-22},uFunnelHeight:{value:46},uFunnelCrownRadius:{value:22},uFunnelWaistRadius:{value:3.5},uFunnelTailRadius:{value:.8},uFunnelWaistT:{value:.42},uFunnelCrownExp:{value:1.4},uBreezeBlowDir:{value:1},uBreezeIntensity:{value:1},uBreezeSwirl:{value:0},uMSweepX:{value:24},uMSweepY:{value:4},uMSweepZ:{value:12},uMFreqX:{value:3.456},uMFreqY:{value:5.341},uMFreqZ:{value:2.827},uMPhX:{value:.4},uMPhY:{value:0},uMPhZ:{value:1.2},uMLaunchDir:{value:1},uMTurnT:{value:99},uMTurnDir:{value:1},uMSplitT:{value:99},uMSplitAng:{value:0},uMDodge1T:{value:3.9},uMDodge2T:{value:7.1},uMDodge3T:{value:99},uMDodgeRad:{value:8},uMDodgeStr:{value:1},uMBoilAmp:{value:0},uMBoilFreq:{value:14},uMChurnMult:{value:1},uMFlutterMult:{value:1},uMJinkAmp:{value:0},uMJinkFreq:{value:5.5},uMJinkPh:{value:0},uMBreathAmp:{value:1},uMScoutAmp:{value:0},uKnotScale:{value:11},uRipples:{value:Array.from({length:rn},()=>new _n(0,0,0,0))},uCharge:{value:0},uTapRing:{value:new _n(0,0,0,0)}};let _t=0,Fn=null,Tn=0,wn=0;function et(e,a="info"){const o=document.getElementById("toast");o&&(o.textContent=e,o.classList.remove("info","success","error"),o.classList.add(a==="success"||a==="error"?a:"info"),o.classList.add("show"),clearTimeout(T.toastTimer),T.toastTimer=setTimeout(()=>{o.classList.remove("show")},3e3))}function Bt(e){const a=document.getElementById("sr-announce");a&&(a.textContent=e)}function so(){const e=document.getElementById("flash");e&&(e.classList.remove("active"),e.offsetWidth,e.classList.add("active"),clearTimeout(T.flashTimer),T.flashTimer=setTimeout(()=>e.classList.remove("active"),120))}let Re=null,Ft=null,Qe=null,pt=null;function lo(){Re&&Ft||(Re||(Re=new(window.AudioContext||window.webkitAudioContext)),Ft=Re.createGain(),Ft.gain.value=1,Qe=Re.createAnalyser(),Qe.fftSize=256,Qe.smoothingTimeConstant=.6,Ft.connect(Qe),Qe.connect(Re.destination),pt=new Uint8Array(Qe.frequencyBinCount))}function Sn(e,a,o,i){let l=0,n=0;const p=Math.max(0,Math.floor(a*i)),u=Math.min(i,Math.floor(o*i));for(let x=p;x<u;x++)l+=e[x]/255,n++;return n?l/n:0}function co(){if(!Qe||!Re||!pt)return;if(Re.state!=="running"){R.uAudioEnvelope.value=0;return}if(s.explosionStartTime<0&&R.uAudioEnvelope.value<.005&&R.uAudioMid.value<.005&&R.uAudioHigh.value<.005){R.uAudioMid.value=0,R.uAudioHigh.value=0,R.uAudioEnvelope.value=0;return}Qe.getByteFrequencyData(pt);const e=pt.length,a=Sn(pt,.02,.25,e),o=Sn(pt,.25,.55,e),i=Sn(pt,.55,.92,e);R.uAudioMid.value+=(o-R.uAudioMid.value)*.5,R.uAudioHigh.value+=(i-R.uAudioHigh.value)*.5;const l=Math.min(1,a*1.3+o*.5+i*.6);R.uAudioEnvelope.value+=(l-R.uAudioEnvelope.value)*.6}function uo(e){try{if(lo(),!Re)return;const a=Re.currentTime,o=Math.max(.3,e*.55),i=Re.createOscillator();i.type="sine",i.frequency.setValueAtTime(85,a),i.frequency.exponentialRampToValueAtTime(32,a+o);const l=Re.createGain();l.gain.setValueAtTime(1e-4,a),l.gain.exponentialRampToValueAtTime(.16,a+Math.min(.25,o*.3)),l.gain.exponentialRampToValueAtTime(1e-4,a+o),i.connect(l),l.connect(Ft),i.start(a),i.stop(a+o+.05),setTimeout(()=>{try{i.disconnect(),l.disconnect()}catch{}},(o+.1)*1e3)}catch(a){console.warn("Rumble synthesis error:",a)}}async function ha(e){if(!e)return;const a=`bold ${f.fontSize}px "${e}"`;try{await document.fonts.load(a)}catch(o){console.warn(`Font load note for "${e}":`,o)}}let Nt=null,$n=null;function mo(e){Nt||(Nt=document.createElement("canvas"),$n=Nt.getContext("2d",{willReadFrequently:!0}));const a=Nt,o=$n;a.width=f.canvasWidth,a.height=f.canvasHeight,o.fillStyle="black",o.fillRect(0,0,f.canvasWidth,f.canvasHeight),o.fillStyle="white",o.font=`bold ${f.fontSize}px "${t.currentFont}", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,f.canvasWidth/2,f.canvasHeight/2);const i=o.getImageData(0,0,f.canvasWidth,f.canvasHeight).data,l=f.canvasWidth,n=f.canvasHeight,p=f.pixelStep,u=f.pixelThreshold;let x=0,X=1/0,y=-1/0,g=1/0,d=-1/0;for(let E=0;E<n;E+=p)for(let z=0;z<l;z+=p)i[(E*l+z)*4]>u&&(x++,z<X&&(X=z),z>y&&(y=z),E<g&&(g=E),E>d&&(d=E));if(x===0)return null;const k=f.targetWorldWidth/Math.max(y-X,1),c=(X+y)/2,P=(g+d)/2,v=new Float32Array(x*3);let Z=0;for(let E=0;E<n;E+=p)for(let z=0;z<l;z+=p)i[(E*l+z)*4]>u&&(v[Z++]=(z-c)*k,v[Z++]=(P-E)*k,v[Z++]=0);return v}let Kt=null,ea=null;function po(e){if(!e)return null;const a=e.naturalWidth||e.width,o=e.naturalHeight||e.height;if(!a||!o)return null;Kt||(Kt=document.createElement("canvas"),ea=Kt.getContext("2d",{willReadFrequently:!0}));const i=f.imageRasterSize,l=Kt,n=ea;l.width=i,l.height=i,n.clearRect(0,0,i,i),n.imageSmoothingEnabled=!0;const p=Math.round(i*.04),u=Math.min((i-p*2)/a,(i-p*2)/o),x=Math.max(1,Math.round(a*u)),X=Math.max(1,Math.round(o*u)),y=Math.round((i-x)/2),g=Math.round((i-X)/2);n.drawImage(e,y,g,x,X);const d=n.getImageData(0,0,i,i).data,k=f.imagePixelStep,c=f.imageAlphaThreshold,P=[],v=[],Z=[],E=[],z=[];let w=1/0,M=-1/0,A=1/0,I=-1/0;const Y=(m,j)=>m<0||j<0||m>=i||j>=i?0:d[(j*i+m)*4+3];for(let m=0;m<i;m+=k)for(let j=0;j<i;j+=k){const N=(m*i+j)*4,ee=d[N+3];if(ee<=c)continue;P.push(j,m),v.push(d[N],d[N+1],d[N+2]),Z.push(ee),E.push(1);const se=Y(j-k,m)<=c||Y(j+k,m)<=c||Y(j,m-k)<=c||Y(j,m+k)<=c;z.push(se),j<w&&(w=j),j>M&&(M=j),m<A&&(A=m),m>I&&(I=m)}if(P.length===0)return null;const V=Math.max(M-w,1),F=Math.max(I-A,1),L=f.targetWorldWidth/Math.max(V,F),h=(w+M)/2,C=(A+I)/2,U=f.imageDepthRange*.5,b=P.length/2,q=[],W=[],D=[],B=[],G=[];for(let m=0;m<b;m+=8){const j=P[m*2],N=P[m*2+1];q.push((j-h)*L,(C-N)*L,-U),W.push(j/i,1-N/i),D.push(v[m*3],v[m*3+1],v[m*3+2]),B.push(Z[m]),G.push(E[m])}for(let m=0;m<b;m++){if(!z[m])continue;const j=P[m*2],N=P[m*2+1],ee=v[m*3],se=v[m*3+1],ne=v[m*3+2],oe=Z[m],K=E[m],Q=j/i,ce=1-N/i,le=(j-h)*L,me=(C-N)*L;q.push(le,me,-U*.33),W.push(Q,ce),D.push(ee,se,ne),B.push(oe),G.push(K),q.push(le,me,U*.33),W.push(Q,ce),D.push(ee,se,ne),B.push(oe),G.push(K)}for(let m=0;m<b;m++){const j=P[m*2],N=P[m*2+1];q.push((j-h)*L,(C-N)*L,U),W.push(j/i,1-N/i),D.push(v[m*3],v[m*3+1],v[m*3+2]),B.push(Z[m]),G.push(E[m])}const H=new Float32Array(q),ae=new Float32Array(W),J=new Uint8Array(D),O=new Uint8Array(B),$=new Uint8Array(G);return{flat:H,uvs:ae,colors:J,covers:O,sizes:$,featureCount:b,frontCount:b,bounds:{w:V,h:F},sourceCanvas:l}}let Jt=null,ta=null;function fo(e){Jt||(Jt=document.createElement("canvas"),ta=Jt.getContext("2d",{willReadFrequently:!0}));const a=Jt,o=ta,i=f.emojiRasterSize;a.width=i,a.height=i,o.clearRect(0,0,i,i),o.fillStyle="white",o.font=`${f.emojiFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,i/2,i/2+i*.02);const l=o.getImageData(0,0,i,i).data,n=f.emojiPixelStep,p=f.pixelThreshold,u=[],x=[],X=[],y=[];let g=1/0,d=-1/0,k=1/0,c=-1/0;const P=(b,q)=>b<0||q<0||b>=i||q>=i?0:l[(q*i+b)*4+3];for(let b=0;b<i;b+=n)for(let q=0;q<i;q+=n){const W=(b*i+q)*4,D=l[W+3];if(D<=p)continue;u.push(q,b),x.push(l[W],l[W+1],l[W+2]),X.push(D);const B=P(q-n,b)<=p||P(q+n,b)<=p||P(q,b-n)<=p||P(q,b+n)<=p;y.push(B),q<g&&(g=q),q>d&&(d=q),b<k&&(k=b),b>c&&(c=b)}if(u.length===0)return null;const v=f.targetWorldWidth/Math.max(d-g,1),Z=(g+d)/2,E=(k+c)/2,w=f.emojiDepthRange*.5,M=u.length/2,A=[],I=[],Y=[],V=[],F=[];for(let b=0;b<M;b+=4){const q=u[b*2],W=u[b*2+1];A.push((q-Z)*v,(E-W)*v,-w),I.push(q/i,1-W/i),Y.push(x[b*3],x[b*3+1],x[b*3+2]),V.push(X[b]),F.push(1)}for(let b=0;b<M;b++){if(!y[b])continue;const q=u[b*2],W=u[b*2+1],D=x[b*3],B=x[b*3+1],G=x[b*3+2],H=X[b],ae=q/i,J=1-W/i,O=(q-Z)*v,$=(E-W)*v;A.push(O,$,-w*.33),I.push(ae,J),Y.push(D,B,G),V.push(H),F.push(1),A.push(O,$,w*.33),I.push(ae,J),Y.push(D,B,G),V.push(H),F.push(1)}for(let b=0;b<M;b++){const q=u[b*2],W=u[b*2+1];A.push((q-Z)*v,(E-W)*v,w),I.push(q/i,1-W/i),Y.push(x[b*3],x[b*3+1],x[b*3+2]),V.push(X[b]),F.push(1)}const L=new Float32Array(A),h=new Float32Array(I),C=new Uint8Array(Y),S=new Uint8Array(V),U=new Uint8Array(F);return{flat:L,uvs:h,colors:C,covers:S,sizes:U,featureCount:M,frontCount:M,bounds:{w:d-g,h:c-k},sourceCanvas:a}}let bn=0;async function ke(e,a=!1){bn++;const o=bn;await ha(t.currentFont);const i=`bold ${f.fontSize}px "${t.currentFont}"`;if(!document.fonts.check(i))try{await document.fonts.load(i)}catch(m){console.warn(`Failed to pre-load custom font "${t.currentFont}":`,m)}if(o!==bn)return;s.sourceGeneration++,s.motionToken++,s.randomized=null;const l=!!r.particles;let n=null;if(l){const m=r.particles.geometry.attributes.position;n=m?m.array:null}const p=t.messageMode==="emoji"&&t.activeEmoji&&f.emojiOptions.includes(t.activeEmoji),u=t.messageMode==="image"&&!!t.activeImage,x=p?fo(e):null,X=u?po(t.activeImage):null,y=x||X,g=!!y,d=y?y.flat:u?null:mo(e);if(!d){et(u?"The image has no visible pixels!":"Text must contain at least one visible character!","error");return}const{jitterXY:k,jitterZ:c,explosionSpeedMin:P,explosionSpeedRange:v}=f,Z=g?f.emojiDensityOverride:f.density;let E=d.length/3,z=1;const w=io(),M=Math.floor(w/Z);let A=d,I=null,Y=null,V=null,F=null;if(g){if(I=y.colors,Y=y.covers,V=y.sizes,F=y.uvs||null,E>w){const m=[],j=y.frontCount||E;if(j<=w){for(let ce=0;ce<j;ce++)m.push(ce);const K=w-j,Q=E-j;if(K>0&&Q>0){const ce=Math.max(1,Math.ceil(Q/K));for(let le=j;le<E&&m.length<w;le+=ce)m.push(le)}}else{const K=Math.ceil(j/w);for(let Q=0;Q<j&&m.length<w;Q+=K)m.push(Q)}const N=new Float32Array(m.length*3),ee=new Uint8Array(m.length*3),se=new Uint8Array(m.length),ne=new Uint8Array(m.length),oe=F?new Float32Array(m.length*2):null;for(let K=0;K<m.length;K++){const Q=m[K];N[K*3]=A[Q*3],N[K*3+1]=A[Q*3+1],N[K*3+2]=A[Q*3+2],ee[K*3]=I[Q*3],ee[K*3+1]=I[Q*3+1],ee[K*3+2]=I[Q*3+2],se[K]=Y[Q],ne[K]=V[Q],oe&&F&&(oe[K*2]=F[Q*2],oe[K*2+1]=F[Q*2+1])}A=N,I=ee,Y=se,V=ne,F=oe,E=m.length}}else E*Z>w&&(z=Math.max(1,Math.ceil(E/M)));const h=Math.ceil(E/z)*Z;s.posHome=new Float32Array(h*3),s.posLive=new Float32Array(h*3),s.explosionOrigin=new Float32Array(h*3),s.springDisp=new Float32Array(h*3),s.springVel=new Float32Array(h*3),s.randomDir=new Float32Array(h*3),s.randomSpeed=new Float32Array(h),s.funnelT=new Float32Array(h),s.funnelRadialX=new Float32Array(h),s.funnelRadialZ=new Float32Array(h);const C=Math.PI*(3-Math.sqrt(5));for(let m=0;m<h;m++){const j=(m*.6180339887498949+.5)%1,N=.75+.3*((m*.7548776662466927+.17)%1),ee=m*C%(Math.PI*2);s.funnelT[m]=Math.pow(j,.85),s.funnelRadialX[m]=Math.cos(ee)*N,s.funnelRadialZ[m]=Math.sin(ee)*N}const S=new Uint8Array(h*4),U=new Uint8Array(h),b=new Float32Array(h*2),q=p?{xy:f.emojiJitterXY,z:f.emojiJitterZ}:{xy:f.imageJitterXY,z:f.imageJitterZ},W=g?q.xy:k,D=g?q.z:c;let B=0;for(let m=0;m<E;m+=z,B++){const j=A[m*3],N=A[m*3+1],ee=A[m*3+2];for(let se=0;se<Z;se++){const ne=B*Z+se,oe=ne*3,K=oe+1,Q=oe+2,ce=j+(Math.random()-.5)*W,le=N+(Math.random()-.5)*W,me=ee+(Math.random()-.5)*D;s.posHome[oe]=ce,s.posHome[K]=le,s.posHome[Q]=me;const he=a?(Math.random()-.5)*45:0,fe=a?(Math.random()-.5)*45:0,Ge=a?(Math.random()-.5)*35:0;s.posLive[oe]=ce+he,s.posLive[K]=le+fe,s.posLive[Q]=me+Ge,s.springDisp[oe]=he,s.springDisp[K]=fe,s.springDisp[Q]=Ge;const Ue=Math.random()*Math.PI*2,Le=Math.acos(Math.random()*2-1);s.randomDir[oe]=Math.sin(Le)*Math.cos(Ue),s.randomDir[K]=Math.sin(Le)*Math.sin(Ue),s.randomDir[Q]=Math.cos(Le),s.randomSpeed[ne]=P+Math.random()*v,I?(S[ne*4]=I[m*3],S[ne*4+1]=I[m*3+1],S[ne*4+2]=I[m*3+2],S[ne*4+3]=Y[m],U[ne]=V[m],F&&(b[ne*2]=F[m*2],b[ne*2+1]=F[m*2+1])):(S[ne*4]=255,S[ne*4+1]=255,S[ne*4+2]=255,S[ne*4+3]=255,U[ne]=1,b[ne*2]=0,b[ne*2+1]=0)}}zn=Eo(),r.autoFit&&qt(),l&&!a&&n&&n.length===s.posLive.length&&(s.posLive.set(n),s.springDisp.fill(0),s.springVel.fill(0)),s.explosionOrigin.set(s.posLive),s.slots=[],s.sendQueue=[];for(let m=0;m<2;m++){const j={posLive:new Float32Array(h*3),springDisp:new Float32Array(h*3),springVel:new Float32Array(h*3),inFlight:!1,needsReset:!1};j.posLive.set(s.posLive),j.springDisp.set(s.springDisp),j.springVel.set(s.springVel),s.slots.push(j)}const G=!r.particles,H=G?new An:r.particles.geometry,ae=new ge(s.posLive,3);ae.setUsage(Et),H.setAttribute("position",ae),H.setAttribute("homePosition",new ge(s.posHome,3)),H.setAttribute("sourceColor",new ge(S,4,!0)),H.setAttribute("sampleSize",new ge(U,1)),H.setAttribute("funnelT",new ge(s.funnelT,1)),H.setAttribute("aSourceUV",new ge(b,2)),Cn();const J=new Float32Array(h),O=new Float32Array(h*3),$=new Float32Array(h);for(let m=0;m<h;m++)J[m]=m,O[m*3]=s.funnelRadialX[m],O[m*3+1]=0,O[m*3+2]=s.funnelRadialZ[m],$[m]=m%2===0?1:-1;if(H.setAttribute("aRandomDir",new ge(new Float32Array(s.randomDir),3)),H.setAttribute("aRandomSpeed",new ge(new Float32Array(s.randomSpeed),1)),H.setAttribute("aIndex",new ge(J,1)),H.setAttribute("aSeed",new ge(O,3)),H.setAttribute("aCustomDir",new ge($,1)),G){const m=new Dn({uniforms:R,vertexShader:ao,fragmentShader:oo,blending:nn,depthWrite:!1,transparent:!0});r.particles=new Pn(H,m),r.scene.add(r.particles)}if(R.uEmojiMode.value=g?1:0,R.uPointSize.value=p?f.emojiPointSize:u?f.imagePointSize:f.pointSize,R.uDepthCue.value=p?f.emojiDepthCue:u?f.imageDepthCue:.28,r.particles.material.blending=g?Ua:nn,r.particles.material.needsUpdate=!0,R.uSourceTexture.value&&(R.uSourceTexture.value.dispose(),R.uSourceTexture.value=null),g&&y&&y.sourceCanvas){const m=new Xa(y.sourceCanvas);m.minFilter=Nn,m.magFilter=Nn,m.needsUpdate=!0,R.uSourceTexture.value=m,R.uUseSourceTexture.value=1}else R.uUseSourceTexture.value=0;r.particles.rotation.set(0,0,0),xe&&xe.postMessage({type:"init",data:{posHome:s.posHome.slice(),explosionOrigin:s.explosionOrigin.slice(),randomDir:s.randomDir.slice(),randomSpeed:s.randomSpeed.slice(),funnelT:s.funnelT.slice(),funnelRadialX:s.funnelRadialX.slice(),funnelRadialZ:s.funnelRadialZ.slice()}}),ho()}function ho(){const e=s.posLive.length;r.trailData=new Float32Array(e),r.trailLive=new Float32Array(e),r.trailData.set(s.posLive),r.trailLive.set(s.posLive);const a=new ge(r.trailData,3);a.setUsage(Et);const o=new ge(r.trailLive,3);o.setUsage(Et),r.trailPoints&&(r.scene.remove(r.trailPoints),r.trailPoints.geometry.dispose(),r.trailPoints.material.dispose());const i=new An;i.setAttribute("position",a),i.setAttribute("livePosition",o),i.setAttribute("homePosition",new ge(s.posHome,3)),i.setAttribute("funnelT",new ge(s.funnelT,1)),r.trailPoints=new Pn(i,new Dn({uniforms:R,vertexShader:ja,fragmentShader:Wa,blending:nn,depthWrite:!1,transparent:!0})),r.trailPoints.frustumCulled=!1,r.scene.add(r.trailPoints),r.trailPosAttr=a,r.trailLiveAttr=o;const l=300;r.emberData=new Float32Array(l*3),r.emberVel=new Float32Array(l*3),r.emberLife=new Float32Array(l),r.emberCount=l;const n=new ge(r.emberData,3);n.setUsage(Et);const p=new ge(r.emberLife,1);p.setUsage(Et),r.emberPoints&&(r.scene.remove(r.emberPoints),r.emberPoints.geometry.dispose(),r.emberPoints.material.dispose());const u=new An;u.setAttribute("position",n),u.setAttribute("aLife",p),r.emberPoints=new Pn(u,new Dn({uniforms:{},vertexShader:Ga,fragmentShader:Ha,blending:nn,depthWrite:!1,transparent:!0})),r.emberPoints.renderOrder=2,r.scene.add(r.emberPoints),r.emberPosAttr=n,r.emberLifeAttr=p}function go(){if(!r.particles||!r.trailData)return;if(We&&r.trailPoints){r.trailPoints.visible=!1;return}if(t.gpuPhysics&&s.explosionStartTime>=0){r.trailPoints&&(r.trailPoints.visible=!1);return}if(r.trailPoints&&(r.trailPoints.visible=!0),s.positionsDirty||s.explosionStartTime>=0||T.isDragging||T.mouseLocal&&T.mouseLocal.x>-500||Rn(we))r.trailSettleFrames=0;else{if(r.trailSettleFrames>=20)return;r.trailSettleFrames=(r.trailSettleFrames||0)+1}s.positionsDirty=!1;const a=r.particles.geometry.attributes.position.array,o=r.trailData,i=r.trailLive,l=.22;for(let n=0;n<a.length;n++)o[n]+=(a[n]-o[n])*l,i[n]=a[n];r.trailPosAttr.needsUpdate=!0,r.trailLiveAttr.needsUpdate=!0}function vo(){if(!r.emberData||!r.particles||We)return;const e=t.activePreset&&f.presets[t.activePreset]||null,a=e&&e.emberBudget||90,o=Math.min(r.emberCount,a),i=r.particles.geometry.attributes.position.array,l=s.explosionOrigin||s.posHome,n=i.length,p=[];for(let u=0;u<n/3;u++){const x=u*3,X=i[x]-l[x],y=i[x+1]-l[x+1],g=i[x+2]-l[x+2];X*X+y*y+g*g>1&&p.push(u)}if(p.length!==0)for(let u=0;u<o;u++){const x=u*3,y=p[Math.random()*p.length|0]*3;r.emberData[x]=i[y],r.emberData[x+1]=i[y+1],r.emberData[x+2]=i[y+2];const g=i[y]-l[y],d=i[y+1]-l[y+1],k=i[y+2]-l[y+2],c=Math.sqrt(g*g+d*d+k*k)||1,P=3+Math.random()*14;r.emberVel[x]=g/c*P+(Math.random()-.5)*4,r.emberVel[x+1]=d/c*P+(Math.random()-.5)*4,r.emberVel[x+2]=k/c*P*.5+(Math.random()-.5)*2,r.emberLife[u]=.35+Math.random()*.45}}function Mo(e,a){const o=e||{},i=o.mSweepX!=null?o.mSweepX:24,l=o.mSweepY!=null?o.mSweepY:4,n=o.mSweepZ!=null?o.mSweepZ:12,p=o.mFreqX!=null?o.mFreqX:3.456,u=o.mFreqY!=null?o.mFreqY:5.341,x=o.mFreqZ!=null?o.mFreqZ:2.827,X=o.mPhX!=null?o.mPhX:.4,y=o.mPhY!=null?o.mPhY:0,g=o.mPhZ!=null?o.mPhZ:1.2,d=Math.min(8.9,a*.92+1.1),k=Math.max(0,(d-2)/7);return{x:i*Math.sin(k*p+X)+5*Math.sin(1.7*a+1),y:l*Math.sin(k*u+y)+3*Math.sin(k*Math.PI)+2*Math.sin(1.3*a),z:n*Math.sin(k*x+g)+4*Math.sin(1.6*a+2)}}function xo(e){if(!r.emberData||!r.emberPoints||We)return;const a=t.activePreset&&f.presets[t.activePreset]||null,o=a&&a.emberBudget||60,i=Math.min(r.emberCount,o),l=Mo(t.pattern,e);for(let n=0;n<i;n++){const p=n*3;r.emberData[p]=l.x+(Math.random()-.5)*1.6,r.emberData[p+1]=l.y+(Math.random()-.5)*1.6,r.emberData[p+2]=l.z+(Math.random()-.5)*1.6;let u=Math.random()*2-1,x=Math.random()*2-1,X=Math.random()*2-1;const y=Math.sqrt(u*u+x*x+X*X)||1,g=5+Math.random()*8;r.emberVel[p]=u/y*g,r.emberVel[p+1]=x/y*g+3,r.emberVel[p+2]=X/y*g,r.emberLife[n]=.35+Math.random()*.45}r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0}function yo(e){if(!r.emberData)return;if(We&&r.emberPoints){r.emberPoints.visible=!1;return}r.emberPoints&&(r.emberPoints.visible=!0);const a=r.emberCount,o=Math.pow(.02,e);let i=0;for(let l=0;l<a;l++){if(r.emberLife[l]<=0)continue;i++;const n=l*3;r.emberData[n]+=r.emberVel[n]*e,r.emberData[n+1]+=r.emberVel[n+1]*e,r.emberData[n+2]+=r.emberVel[n+2]*e,r.emberVel[n+1]-=8*e,r.emberVel[n]*=o,r.emberVel[n+1]*=o,r.emberVel[n+2]*=o,r.emberLife[l]-=e,r.emberLife[l]<=0&&(r.emberLife[l]=0)}i>0&&(r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0)}const Ct=new Pe;function qn(e,a){const o=r.renderer.domElement.getBoundingClientRect(),i=(e-o.left)/o.width*2-1,l=-((a-o.top)/o.height)*2+1;r.camera.isOrthographicCamera&&(Ct.set(i,l,0).unproject(r.camera),T.mouseWorld.copy(Ct),T.mouseWorld.z=0)}function na(e,a,o){const i=r.renderer.domElement.getBoundingClientRect(),l=(e-i.left)/i.width*2-1,n=-((a-i.top)/i.height)*2+1;r.camera.isOrthographicCamera&&(Ct.set(l,n,0).unproject(r.camera),o.set(Ct.x,Ct.y,0).applyMatrix4(T.invMatrix))}function Cn(){if(!s.randomDir||!s.randomSpeed)return;const e=s.randomSpeed.length,{explosionSpeedMin:a,explosionSpeedRange:o}=f,i=t.pattern,l=s.posHome,n=typeof t.motionStyle=="number"&&t.motionStyle>=0?t.motionStyle:Math.floor(Math.random()*4);if(n===1){const M=Math.random()<.5?1:-1,A=(3.8+Math.random()*2.8)*M,I=38+Math.random()*16,Y=18+Math.random()*12,V=2.4+Math.random()*2.8,F=.8+Math.random()*1.6,L=.32+Math.random()*.16,h=1.15+Math.random()*.65;t.pattern={...t.pattern,spinSpeed:A,funnelHeight:I,funnelCrownRadius:Y,funnelWaistRadius:V,funnelTailRadius:F,funnelWaistT:L,funnelCrownExp:h}}_t++;const p=[1.35,1.85,.9,2.2],x=p[_t%p.length]*(.92+Math.random()*.16),y=(_t%2===1?!0:Math.random()<.5)?1:-1;let g=y,d=(Math.random()-.5)*.08,k=(Math.random()-.5)*.05;const c=Math.sqrt(g*g+d*d+k*k)||1;g/=c,d/=c,k/=c;const P=[0,.85,1.45,.35,0,1.2],v=P[_t%P.length],Z=v===0?0:v*(.85+Math.random()*.3);Ae={blowDir:y,intensity:x,swirl:Z,windAngleY:(Math.random()-.5)*.22,windAngleZ:(Math.random()-.5)*.12,strengthMult:x,easePower:1.45+Math.random()*.4,seedXi:Math.random()*100,peakX:(Math.random()-.5)*22,peakY:3.5+Math.random()*5,peakAmp:(16+Math.random()*7)*x,peakWidthX:.065+Math.random()*.025,peakWidthY:.11+Math.random()*.035,creaseY:-(3.5+Math.random()*4),creaseAmp:6.5+Math.random()*3,creaseFreq:.11+Math.random()*.04,billowAmp1:7.5+Math.random()*3,billowAmp2:3+Math.random()*2,depthAmp:13+Math.random()*4.5,turbAmp:3+Math.random()*1.8,shearMult:.22+Math.random()*.18},s.breeze=Ae;const E=Math.max(2,i.spokes||12),z=i.spokeJitter!=null?i.spokeJitter:.03,w=Math.PI*(3-Math.sqrt(5));for(let M=0;M<e;M++){const A=M*3,I=A+1,Y=A+2;let V,F,L;if(n===1){const C=l[A],S=l[Y],U=C*C+S*S;let b,q;if(U>1e-6){const D=1/Math.sqrt(U);b=-S*D,q=C*D}else{const D=Math.random()*Math.PI*2;b=Math.cos(D),q=Math.sin(D)}const W=Math.random()<.5?1:-1;V=b*W+(Math.random()-.5)*.15,F=.72+(Math.random()-.5)*.12,L=q*W+(Math.random()-.5)*.15}else if(n===2){g=y,d=(Math.random()-.5)*.04,k=(Math.random()-.5)*.04;const C=Math.hypot(g,d,k)||1;g/=C,d/=C,k/=C,V=g*.92+(Math.random()*2-1)*.08,F=(Math.random()*2-1)*.12,L=(Math.random()*2-1)*.12}else if(n===3){const C=M%E,S=C*w,U=Math.acos(Math.max(-1,Math.min(1,1-2*(C+.5)/E))),b=Math.sin(U)*Math.cos(S),q=Math.sin(U)*Math.sin(S),W=Math.cos(U);V=b+(Math.random()-.5)*2*z,F=q+(Math.random()-.5)*2*z,L=W+(Math.random()-.5)*2*z}else{const C=Math.random()*Math.PI*2,S=Math.acos(Math.random()*2-1);V=Math.sin(S)*Math.cos(C),F=Math.sin(S)*Math.sin(C),L=Math.cos(S)}const h=Math.sqrt(V*V+F*F+L*L)||1;if(V/=h,F/=h,L/=h,n===2)s.randomSpeed[M]=(a+Math.random()*o)*(1.4+Math.random()*.9);else if(n===3)s.randomSpeed[M]=(a+Math.random()*o)*(1.5+Math.random()*.7);else{const C=.75+Math.random()*.55;s.randomSpeed[M]=(a+Math.random()*o)*C}s.randomDir[A]=V,s.randomDir[I]=F,s.randomDir[Y]=L}if(s.randomized={dirs:s.randomDir.slice(0,no*3),style:n},s.activeStyle=n,r.particles&&r.particles.geometry){const M=r.particles.geometry.attributes.aRandomDir;M&&M.array&&M.array.length===s.randomDir.length&&(M.copyArray(s.randomDir),M.needsUpdate=!0);const A=r.particles.geometry.attributes.aRandomSpeed;A&&A.array&&A.array.length===s.randomSpeed.length&&(A.copyArray(s.randomSpeed),A.needsUpdate=!0)}}function To(){if(!r.particles||!s.explosionOrigin)return;const e=r.particles.geometry.attributes.position.array;if(e.length===s.explosionOrigin.length){s.explosionOrigin.set(e),s.posLive.set(e),s.springDisp.fill(0),s.springVel.fill(0),s.motionToken++;for(const a of s.slots)a.inFlight?a.needsReset=!0:((!a.posLive||!a.posLive.buffer||a.posLive.buffer.byteLength===0)&&(a.posLive=new Float32Array(e.length),a.springDisp=new Float32Array(e.length),a.springVel=new Float32Array(e.length)),a.posLive.set(e),a.springDisp.fill(0),a.springVel.fill(0),a.needsReset=!1)}}function ga(e){document.querySelectorAll(".preset-chip").forEach(o=>{o.disabled=e,o.classList.toggle("disabled",e),e?o.setAttribute("aria-disabled","true"):o.removeAttribute("aria-disabled")})}function Lt(e=!1){if(s.explosionStartTime>=0)return;if(s.explosionStartTime=-1,To(),t.actualTravelRadius=0,t.travelApplied=!1,t.embersSpawned=!1,t.dodgeEmbersFired=!1,t.afterglowStartTime=null,$t=0,t.motionStyle===5){const l=Math.random()<.55?4.3+Math.random()*2:99;let n=l<90?99:3.3+Math.random()*2.6;if(l<90){const X=l-1.4,y=l+1.4;let g=3.3+Math.random()*2.6;g>X&&g<y&&(g=g<l?Math.max(3.3,X-.8*Math.random()):Math.min(5.9,y+.8*Math.random()),g>X&&g<y&&(g=99)),n=g}const p=3.25+Math.random()*.55,u=p+1.35+Math.random()*.7;let x=99;if(Math.random()<.45){const X=u+1.35+Math.random()*.5;x=X<=6.95?X:99}t.pattern={...t.pattern,mSweepX:16+Math.random()*14,mSweepY:3.5+Math.random()*4,mSweepZ:8+Math.random()*8,mFreqX:2.8+Math.random()*1.2,mFreqY:4.6+Math.random()*1.4,mFreqZ:2.2+Math.random()*1.2,mPhX:Math.random()*6.283,mPhY:Math.random()*6.283,mPhZ:Math.random()*6.283,mLaunchDir:Math.random()<.5?1:-1,mTurnT:n,mTurnDir:Math.random()<.5?1:-1,mSplitT:l,mSplitAng:Math.random()*6.283,mDodge1T:p,mDodge2T:u,mDodge3T:x,mDodgeRad:6.5+Math.random()*3,mDodgeStr:.85+Math.random()*.6,mBoilAmp:1.4+Math.random()*.8,mBoilFreq:11+Math.random()*3,mChurnMult:1.2+Math.random()*.6,mFlutterMult:1.25+Math.random()*.6,mJinkAmp:2.5+Math.random()*1.7,mJinkFreq:4.5+Math.random()*2.5,mJinkPh:Math.random()*6.283,mBreathAmp:1.25+Math.random()*.65,mScoutAmp:.85+Math.random()*.45}}t.activeMaxDist=t.explosionMaxDistMultiplier*(.8+Math.random()*.4),t.activeExpansionDuration=t.expansionDuration*(.85+Math.random()*.3),t.activeContractionDuration=t.contractionDuration||4;const a=t.activeContractionDuration;t.gpuPhysics?Cn():xe?xe.postMessage({type:"randomize",data:{explosionSpeedMin:f.explosionSpeedMin,explosionSpeedRange:f.explosionSpeedRange,motionStyle:t.motionStyle,pattern:t.pattern,breeze:Ae,explosionOrigin:s.explosionOrigin.slice(),motionToken:s.motionToken,sourceGeneration:s.sourceGeneration}}):Cn(),s.explosionStartTime=r.clock.getElapsedTime(),ga(!0),Io();const o=t.activePreset||t.lastRandomPreset,i=o&&f.presets[o]?f.presets[o]:null;cn(i&&i.description?i.description:ln(t.messageMode)),(t.motionStyle===0||t.motionStyle===-1)&&so(),t.audioEnabled&&_a(t,a),Bt(`Explosion triggered for "${t.currentText}"`)}function zt(e,a,o,i=!0){const l=new URL(window.location);l.searchParams.set("t",e),l.searchParams.set("theme",a),l.searchParams.set("font",o),i?window.history.pushState({},"",l):window.history.replaceState({},"",l)}function Bn(e){t.activeExpansionDuration=null,t.activeContractionDuration=null,t.expansionDuration=e.expansionDuration,t.driftDuration=e.driftDuration!==void 0?e.driftDuration:0,t.contractionDuration=e.contractionDuration,t.explosionMaxDistMultiplier=e.explosionMaxDistMultiplier,t.motionStyle=e.motionStyle!=null?e.motionStyle:-1,s.activeStyle=t.motionStyle,t.soundPitch=e.soundPitch,t.soundDuration=e.soundDuration,t.soundType=e.soundType,t.trailStrength=e.trailStrength!=null?e.trailStrength:.25,t.pattern={spokes:e.spokes!=null?e.spokes:12,spokeJitter:e.spokeJitter!=null?e.spokeJitter:.03,spinSpeed:e.spinSpeed!=null?e.spinSpeed:0,funnelHeight:e.funnelHeight!=null?e.funnelHeight:0,funnelBottom:e.funnelBottom!=null?e.funnelBottom:0,funnelCrownRadius:e.funnelCrownRadius!=null?e.funnelCrownRadius:0,funnelWaistRadius:e.funnelWaistRadius!=null?e.funnelWaistRadius:0,funnelTailRadius:e.funnelTailRadius!=null?e.funnelTailRadius:0,funnelWaistT:e.funnelWaistT!=null?e.funnelWaistT:0,funnelCrownT:e.funnelCrownT!=null?e.funnelCrownT:0,funnelFadeStart:e.funnelFadeStart!=null?e.funnelFadeStart:0,funnelFadeEnd:e.funnelFadeEnd!=null?e.funnelFadeEnd:0,vortexDuration:e.vortexDuration!=null?e.vortexDuration:4.5,equilibriumDuration:e.equilibriumDuration!=null?e.equilibriumDuration:3.5,swayAmp:e.swayAmp!=null?e.swayAmp:0,swayFreq:e.swayFreq!=null?e.swayFreq:0,gustAmp:e.gustAmp!=null?e.gustAmp:0,gustFreq:e.gustFreq!=null?e.gustFreq:0,windDrift:e.windDrift!=null?e.windDrift:0,turbulence:e.turbulence!=null?e.turbulence:0};const a=f.themes[t.currentTheme]||f.themes.ember;t.heatCold=a.cold,t.heatWarm=a.warm,t.heatHot=a.hot,R.uHeatCold.value.set(...t.heatCold),R.uHeatWarm.value.set(...t.heatWarm),R.uHeatHot.value.set(...t.heatHot),R.uTornadoFadeStart.value=t.pattern.funnelFadeStart,R.uTornadoFadeEnd.value=t.pattern.funnelFadeEnd,R.uTrailStrength.value=t.trailStrength}function Mt(){Bn(f.presets.DEFAULT)}function va(){if(s.explosionStartTime>=0||t.activePreset)return;const e=Object.keys(f.presets).filter(o=>o!=="DEFAULT"),a=e[Math.floor(Math.random()*e.length)];Bn(f.presets[a]),t.lastRandomPreset=a}function en(e,a=!0){const o=f.themes[e]||f.themes.ember;t.currentTheme=e,R.uColorHot.value.set(...o.hot),R.uColorWarm.value.set(...o.warm),R.uColorCold.value.set(...o.cold),R.uHeatHot.value.set(...o.hot),R.uHeatWarm.value.set(...o.warm),R.uHeatCold.value.set(...o.cold),document.querySelectorAll(".theme-swatch").forEach(i=>{const l=i.getAttribute("data-theme")===e;i.classList.toggle("active",l),i.setAttribute("aria-pressed",l?"true":"false")}),zt(t.currentText,t.currentTheme,t.currentFont,a),Bt(`Theme changed to ${e}`)}async function Ma(e,a=!0,o=!1){t.currentFont=e,document.querySelectorAll("#font-select, #drawer-font-select").forEach(i=>{i.value=e}),t.messageMode!=="text"&&(t.messageMode="text",ft("text")),t.activeEmoji&&(t.activeEmoji=null,Ie(null)),await ha(e),await ke(t.currentText,o),zt(t.currentText,t.currentTheme,t.currentFont,a),Bt(`Font changed to ${e}`)}async function xa(e,a=!0){const o=e.trim(),i=o.length>0?o:"Bring your message!";t.currentText=i,t.messageMode==="text"&&(t.lastText=i),await ke(i,!1),zt(t.currentText,t.currentTheme,t.currentFont,a),Bt(`Text updated to "${t.currentText}"`)}function Vn(e){const a=document.querySelectorAll(".char-counter");if(!a.length)return;const o=[...e].length;a.forEach(i=>{i.textContent=`${o}/25`,i.classList.remove("warning","danger"),o>=25?i.classList.add("danger"):o>=20&&i.classList.add("warning")})}async function kn(e,a=!1){Bn(f.presets[e]||f.presets.DEFAULT),a&&await ke(t.currentText,!0)}const wo="#drawer, #menu-toggle-btn, #drawer-backdrop, #dock, #topbar, #input-bar, #hint, #toast",sn=e=>!!e.target.closest(wo);function So(e){if(sn(e))return;if(e.pointerType==="mouse"&&(T.isDragging=!0,T.prevMouseX=e.clientX,T.prevMouseY=e.clientY),e.pointerType==="touch"&&!e.isPrimary){T.charge.active=!1,T.charge.release=null;return}s.explosionStartTime<0&&(T.charge.active=!0,T.charge.pointerId=e.pointerId,T.charge.x0=e.clientX,T.charge.y0=e.clientY,T.charge.t0=performance.now(),T.charge.value=0,T.charge.release=null);const a=performance.now();T.clickCount=a-T.lastClickTime<f.tapWindowMs?T.clickCount+1:1,T.lastClickTime=a,T.clickCount<f.tapCount&&s.explosionStartTime<0&&(T.tapRing.pending={clientX:e.clientX,clientY:e.clientY,count:T.clickCount}),T.clickCount>=f.tapCount&&(va(),Lt(),T.clickCount=0)}function bo(e){if(!sn(e)){if(e.touches.length===1)qn(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const a=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY;T.lastPinchDist=Math.sqrt(a*a+o*o),T.lastMidpoint.set((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2)}}}function Ao(e){if(!sn(e)){if(e.preventDefault(),e.touches.length===1)qn(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const a=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY,i=Math.sqrt(a*a+o*o);T.lastPinchDist&&(r.targetZ-=(i-T.lastPinchDist)*.15,r.autoFit=!1),T.lastPinchDist=i;const l=(e.touches[0].clientX+e.touches[1].clientX)/2,n=(e.touches[0].clientY+e.touches[1].clientY)/2;r.particles&&(r.particles.rotation.y+=(l-T.lastMidpoint.x)*.005,r.particles.rotation.x+=(n-T.lastMidpoint.y)*.005),T.lastMidpoint.set(l,n)}}}function aa(e){if(e.pointerType==="mouse"&&(T.isDragging=!1),T.charge.active&&e.pointerId===T.charge.pointerId){if(T.charge.active=!1,e.type==="pointercancel")return;const a=performance.now()-T.charge.t0,o=Math.min(1,Math.max(0,(a-f.rippleTapGraceMs)/f.rippleChargeMs));T.charge.release={clientX:T.charge.x0,clientY:T.charge.y0,charge:o}}}function Do(){T.lastPinchDist=null,T.lastGestureEndTime=performance.now()}function qt(){const e=document.getElementById("stage"),a=Math.max(e.clientWidth,1),o=Math.max(e.clientHeight,1);r.camera.aspect=a/o;const i=r.camera.position.z*Math.tan(f.cameraAngleDeg*Math.PI/360),l=i*r.camera.aspect;r.camera.left=-l,r.camera.right=l,r.camera.top=i,r.camera.bottom=-i,r.camera.updateProjectionMatrix(),r.renderer.setSize(a,o,!1);const n=Math.min(window.devicePixelRatio,f.maxPixelRatio);r.renderer.setPixelRatio(n),R.uPixelRatio.value=n,r.autoFit&&(r.targetZ=Fo(a,o))}function Po(){const e=document.getElementById("topbar");return e?e.getBoundingClientRect().height:0}function Ro(){const e=document.getElementById("dock");if(e){if(e.classList.contains("collapsed")){const i=e.firstElementChild;return(i?i.getBoundingClientRect().height:0)+24}const o=e.getBoundingClientRect();if(o.height>0)return o.height}const a=document.getElementById("input-bar");if(a){const o=a.getBoundingClientRect();if(o.height>0)return o.height}return 0}function Eo(){const e=s.posHome;if(!e||e.length===0)return{w:80,h:80};let a=1/0,o=-1/0,i=1/0,l=-1/0;for(let u=0;u<e.length;u+=3){const x=e[u],X=e[u+1];x<a&&(a=x),x>o&&(o=x),X<i&&(i=X),X>l&&(l=X)}const n=o-a,p=l-i;return!isFinite(n)||!isFinite(p)||n<1e-6||p<1e-6?{w:80,h:80}:{w:n,h:p}}function Fo(e,a){const o=Math.tan(f.cameraAngleDeg*Math.PI/360),i=zn,l=f.fitMargin,n=Math.max(e-2*l,1),p=Math.max(a-(Po()+l)-(Ro()+l),1),u=i.w*a/(2*o*n),x=i.h*a/(2*o*p);return Math.min(f.zoomMax,Math.max(u,x,f.zoomMin))}const Co="Type a message — your words become thousands of glowing particles.",ko="Pick an emoji — it bursts into thousands of glowing, colorful particles.",Lo="Upload an image — its pixels become thousands of glowing particles.";function ln(e){return e==="emoji"?ko:e==="image"?Lo:Co}function cn(e){const a=document.getElementById("context-line");a&&(a.textContent=e);const o=document.getElementById("mobile-context-line");o&&(o.textContent=e)}function tn(e){t.activePreset=e,document.querySelectorAll(".preset-chip").forEach(i=>{i.getAttribute("data-text")===e?i.classList.add("active"):i.classList.remove("active")});const o=f.presets[e];cn(o&&o.description?o.description:ln(t.messageMode))}function $e(){t.activePreset=null,document.querySelectorAll(".preset-chip").forEach(a=>{a.classList.remove("active")}),cn(ln(t.messageMode))}function Ie(e){document.querySelectorAll(".emoji-chip").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-emoji")===e)})}function ft(e){const a=e==="emoji"||e==="image"?e:"text";t.messageMode=a,document.querySelectorAll(".message-option").forEach(i=>{const l=i.getAttribute("data-message-mode")===a;i.classList.toggle("active",l),i.setAttribute("aria-selected",l?"true":"false")}),document.querySelectorAll(".text-message-mode").forEach(i=>{i.hidden=a!=="text"}),document.querySelectorAll(".emoji-message-mode").forEach(i=>{i.hidden=a!=="emoji"}),document.querySelectorAll(".image-message-mode").forEach(i=>{i.hidden=a!=="image"});const o=document.getElementById("input-bar");o&&(o.style.display=a==="text"?"":"none")}function oa(){r.particles&&(r.scene.remove(r.particles),r.particles=null),r.trailPoints&&(r.trailPoints.visible=!1),r.emberPoints&&(r.emberPoints.visible=!1),s.posHome=new Float32Array(0),s.posLive=new Float32Array(0),s.explosionOrigin=new Float32Array(0),s.springDisp=new Float32Array(0),s.springVel=new Float32Array(0),s.randomDir=new Float32Array(0),s.randomSpeed=new Float32Array(0),s.funnelT=new Float32Array(0),s.funnelRadialX=new Float32Array(0),s.funnelRadialZ=new Float32Array(0),s.slots=[],s.sendQueue=[],s.sourceGeneration++,s.motionToken++,zn={w:80,h:80}}async function zo(e){if(ft(e),$e(),Mt(),t.messageMode==="emoji"){t.activeImage=null;const a=t.lastEmoji&&f.emojiOptions.includes(t.lastEmoji)?t.lastEmoji:null;a?(t.activeEmoji=a,Ie(a),an(a),await ke(a,!1),zt(a,t.currentTheme,t.currentFont,!0)):(t.activeEmoji=null,Ie(null),oa())}else if(t.messageMode==="image"){t.activeEmoji=null,Ie(null);const a=document.querySelectorAll(".image-name");t.lastImage?(t.activeImage=t.lastImage,a.forEach(o=>{o.textContent=t.lastImageName}),await ke(t.currentText,!1)):(t.activeImage=null,a.forEach(o=>{o.textContent="No file chosen"}),oa())}else{t.activeEmoji=null,t.activeImage=null,Ie(null);const a=t.lastText&&t.lastText.trim()||"Bring your message!";t.currentText=a,an(a),await ke(a,!1),zt(t.currentText,t.currentTheme,t.currentFont,!0)}}function qo(e){if(!e)return;if(!e.type.startsWith("image/")){et("Please choose an image file!","error");return}const a=URL.createObjectURL(e),o=new Image;o.onload=async()=>{URL.revokeObjectURL(a),ft("image"),t.activeImage=o,t.lastImage=o,t.lastImageName=e.name,t.imageName=e.name,t.activeEmoji=null,Ie(null),$e(),Mt(),document.querySelectorAll(".image-name").forEach(i=>{i.textContent=e.name}),await ke(t.currentText,!1),Bt(`Image uploaded: ${e.name}`)},o.onerror=()=>{URL.revokeObjectURL(a),et("Could not read that image!","error")},o.src=a}const Bo=1e3;function ia(){clearTimeout(T.drawerCloseTimer),T.drawerCloseTimer=setTimeout(xt,Bo)}function ya(){clearTimeout(T.drawerCloseTimer)}function Ta(){const e=document.getElementById("drawer"),a=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");ya(),e&&e.classList.add("open"),a&&a.classList.add("active"),o&&o.setAttribute("aria-expanded","true")}function xt(){const e=document.getElementById("drawer"),a=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");ya(),e&&e.classList.remove("open"),a&&a.classList.remove("active"),o&&o.setAttribute("aria-expanded","false")}function Vo(){const e=document.getElementById("drawer");e&&e.classList.contains("open")?xt():Ta()}function wa(){const e=document.getElementById("dock");if(!e||e.classList.contains("collapsed"))return!1;e.classList.add("collapsed");const a=document.getElementById("dock-toggle-btn");return a&&(a.setAttribute("aria-expanded","false"),a.title="Expand controls"),!0}function Sa(){const e=document.getElementById("dock");if(!e)return;e.classList.remove("collapsed");const a=document.getElementById("dock-toggle-btn");a&&(a.setAttribute("aria-expanded","true"),a.title="Collapse controls")}function In(){r.autoFit&&(qt(),setTimeout(()=>{r.autoFit&&qt()},460))}function Io(){const e=document.getElementById("dock");T.menuRestoreDesktop=!!(e&&!e.classList.contains("collapsed")),wa();const a=document.getElementById("drawer");T.menuRestoreMobile=!!(a&&a.classList.contains("open")),xt(),In()}function Uo(){T.menuRestoreMobile&&(T.menuRestoreMobile=!1,Ta()),T.menuRestoreDesktop&&(T.menuRestoreDesktop=!1,Sa()),In()}function an(e){document.querySelectorAll("#text-input, #mobile-text-input").forEach(a=>{a.value=e}),Vn(e)}function ra(e){ft("text"),$e(),t.activeEmoji=null,t.activeImage=null,Ie(null),Mt(),Vn(e),clearTimeout(T.inputDebounceTimer),T.inputDebounceTimer=setTimeout(async()=>{await xa(e)},f.inputDebounceMs)}function Xo(){r.renderer.render(r.scene,r.camera),r.renderer.domElement.toBlob(e=>{if(!e)return;const a=URL.createObjectURL(e),o=document.createElement("a"),i=(t.messageMode==="image"&&t.imageName?t.imageName:t.currentText).replace(/[^a-z0-9]/gi,"_").toLowerCase();o.download=`artz-sculpture-${i||"kinetic"}.png`,o.href=a,o.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)},"image/png")}async function Zo(){try{const e=new URLSearchParams;t.activeEmoji?e.set("t",t.activeEmoji):t.messageMode==="text"&&t.currentText&&e.set("t",t.currentText),t.currentTheme&&t.currentTheme!=="ember"&&e.set("theme",t.currentTheme),t.currentFont&&t.currentFont!=="Outfit"&&e.set("font",t.currentFont),t.activePreset&&e.set("preset",t.activePreset);const a=e.toString(),o=`${window.location.origin}${window.location.pathname}${a?"?"+a:""}`;if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(o);else{const i=document.createElement("input");i.value=o,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i)}et("Link copied to clipboard!","success")}catch{et("Could not copy link","error")}}function Yo(){t.audioEnabled=!t.audioEnabled,document.querySelectorAll(".audio-btn").forEach(e=>{e.setAttribute("aria-pressed",t.audioEnabled.toString()),e.title=t.audioEnabled?"Toggle Sound (Mute/Unmute)":"Sound: MUTED (Click to unmute)"}),document.querySelectorAll(".audio-icon").forEach(e=>{e.textContent=(t.audioEnabled,"??")}),et(t.audioEnabled?"?? Sound effects enabled":"?? Sound effects muted")}function on(){const e=document.getElementById("hint");e&&e.classList.add("dismissed");try{localStorage.setItem("artz-hint-seen","1")}catch{}}function jo(){const e=document.getElementById("text-input"),a=document.getElementById("mobile-text-input"),o=document.getElementById("menu-toggle-btn"),i=document.getElementById("menu-close-btn"),l=document.getElementById("drawer-backdrop"),n=document.getElementById("drawer"),p=document.getElementById("dock-toggle-btn"),u=document.getElementById("hint-dismiss"),x=document.getElementById("wordmark");if(x){const d=[{cls:"is-rippling",ms:1400},{cls:"is-playing",ms:1800},{cls:"is-dropping",ms:1600},{cls:"is-imploding",ms:1700}],k=700,c=()=>d.map(z=>z.cls),P=z=>{x.setAttribute("aria-label",z?"KINETICS — click to play title animation":"KINETICS — click to stop the title animation"),x.title=z?"Click to play":"Click to stop"};let v=!1,Z=0;const E=()=>{const z=d[Z];Z=(Z+1)%d.length,x.classList.remove(...c()),x.offsetWidth,x.classList.add(z.cls),T.wordmarkTimer=setTimeout(E,z.ms+k)};x.addEventListener("click",()=>{We||(v=!v,clearTimeout(T.wordmarkTimer),v?(Z=0,P(!1),E()):(P(!0),x.classList.remove(...c())))})}o&&o.addEventListener("click",()=>{Vo()}),i&&i.addEventListener("click",()=>{xt()}),l&&l.addEventListener("click",()=>{xt()}),n&&(n.addEventListener("click",d=>{d.target.closest(".message-option")||d.target.closest("select")||ia()}),n.querySelectorAll("select").forEach(d=>{d.addEventListener("change",ia)})),p&&p.addEventListener("click",()=>{const d=document.getElementById("dock");d&&(d.classList.contains("collapsed")?Sa():wa(),In())}),u&&u.addEventListener("click",on);try{localStorage.getItem("artz-hint-seen")==="1"&&on()}catch{}Fn=document.getElementById("status-fps");const X=document.getElementById("status-gpu");X&&(X.textContent=t.gpuPhysics?"GPU":xe?"WORKER":"CPU"),cn(ln(t.messageMode)),e&&(e.value=t.currentText,Vn(t.currentText),e.addEventListener("input",()=>{a&&a.value!==e.value&&(a.value=e.value),ra(e.value)})),a&&(a.value=t.currentText,a.addEventListener("input",()=>{e&&e.value!==a.value&&(e.value=a.value),ra(a.value)})),document.querySelectorAll(".message-option").forEach(d=>{d.addEventListener("click",()=>{zo(d.getAttribute("data-message-mode"))})}),document.querySelectorAll(".image-input").forEach(d=>{d.addEventListener("change",()=>{qo(d.files&&d.files[0]),d.value=""})}),document.querySelectorAll(".theme-swatch").forEach(d=>{d.addEventListener("click",()=>{$e(),Mt(),en(d.getAttribute("data-theme"))})}),document.querySelectorAll("#font-select, #drawer-font-select").forEach(d=>{d.value=t.currentFont,d.addEventListener("change",async()=>{$e(),Mt(),await Ma(d.value)})}),document.querySelectorAll(".capture-btn").forEach(d=>{d.addEventListener("click",Xo)}),document.querySelectorAll(".share-btn").forEach(d=>{d.addEventListener("click",Zo)}),document.querySelectorAll(".audio-btn").forEach(d=>{d.addEventListener("click",Yo)}),document.querySelectorAll(".preset-chip").forEach(d=>{d.addEventListener("click",async()=>{if(s.explosionStartTime>=0)return;const k=d.getAttribute("data-text");await kn(k),tn(k),Lt()})}),document.querySelectorAll(".emoji-chip").forEach(d=>{d.addEventListener("click",async()=>{const k=d.getAttribute("data-emoji");k&&(ft("emoji"),$e(),Mt(),t.activeEmoji=k,t.lastEmoji=k,Ie(k),an(k),await xa(k))})})}function sa(){if(xe){try{xe.terminate()}catch{}xe=null;for(const e of s.slots)e.inFlight=!1;s.sendQueue.length=0}}const kt=[1,1.25,1.5,2];let Wo={level:kt.length-1,slowStreak:0,fastStreak:0};function la(e){const a=Math.min(window.devicePixelRatio,kt[e]);r.renderer.setPixelRatio(a),R.uPixelRatio.value=a}function Go(e){const a=Wo;if(e>28)a.slowStreak++,a.fastStreak=0,a.slowStreak>=30&&(a.slowStreak=0,a.level>0&&(a.level--,la(a.level)));else if(e<16){a.fastStreak++,a.slowStreak=0;const o=kt.length-1;a.fastStreak>=120&&a.level<o&&Math.min(window.devicePixelRatio,kt[a.level+1])>Math.min(window.devicePixelRatio,kt[a.level])&&(a.fastStreak=0,a.level++,la(a.level))}else a.slowStreak=0,a.fastStreak=0}function ba(){const e=performance.now();requestAnimationFrame(ba),Tn++,performance.now()-wn>=500&&(Fn&&(Fn.textContent=`${Math.round(Tn*1e3/(performance.now()-wn))} FPS`),Tn=0,wn=performance.now());const a=r.clock.getElapsedTime(),o=Math.min(a-r.prevTime,.05);r.prevTime=a,co();const{keys:i,invMatrix:l,lastGestureEndTime:n}=T,{particles:p,camera:u}=r;if(p){i.ArrowUp&&(p.rotation.x-=f.rotationStep,T.lastGestureEndTime=performance.now()),i.ArrowDown&&(p.rotation.x+=f.rotationStep,T.lastGestureEndTime=performance.now()),i.ArrowLeft&&(p.rotation.y-=f.rotationStep,T.lastGestureEndTime=performance.now()),i.ArrowRight&&(p.rotation.y+=f.rotationStep,T.lastGestureEndTime=performance.now());const D=i.ArrowUp||i.ArrowDown||i.ArrowLeft||i.ArrowRight,B=performance.now()-n<f.autoReturnGracePeriodMs;if(!D&&!T.lastPinchDist&&!B&&!T.isDragging){const G=f.rotationAutoReturnLerp;p.rotation.x=Ht.lerp(p.rotation.x,0,G),p.rotation.y=Ht.lerp(p.rotation.y,0,G)}}(i["+"]||i["="])&&(r.targetZ-=f.zoomSpeed,r.autoFit=!1),i["-"]&&(r.targetZ+=f.zoomSpeed,r.autoFit=!1),r.targetZ=Ht.clamp(r.targetZ,f.zoomMin,f.zoomMax),u.position.z=Ht.lerp(u.position.z,r.targetZ,f.zoomLerp),Math.abs(u.position.z-r.targetZ)<.005&&(u.position.z=r.targetZ);const x=u.position.z*Math.tan(f.cameraAngleDeg*Math.PI/360),X=x*u.aspect;if(u.left=-X,u.right=X,u.top=x,u.bottom=-x,u.updateProjectionMatrix(),R.uPointScale.value=f.pointSizeAttenuationScale/u.position.z,!p){r.renderer.render(r.scene,u);return}if(T.pendingPointer){const D=T.pendingPointer;if(T.charge.active&&D.pointerId===T.charge.pointerId&&Math.hypot(D.clientX-T.charge.x0,D.clientY-T.charge.y0)>f.chargeCancelPx&&(T.charge.active=!1),Te.hasPrevClient){const B=r.renderer.domElement.getBoundingClientRect(),G=(u.right-u.left)/Math.max(B.width,1);Te.speedU=Math.hypot(D.clientX-Te.prevCX,D.clientY-Te.prevCY)*G/Math.max(o,1e-4)}if(Te.prevCX=D.clientX,Te.prevCY=D.clientY,Te.hasPrevClient=!0,qn(D.clientX,D.clientY),T.isDragging&&D.pointerType==="mouse"){const B=D.clientX-T.prevMouseX,G=D.clientY-T.prevMouseY;r.particles&&(r.particles.rotation.y+=B*.005,r.particles.rotation.x+=G*.005),T.prevMouseX=D.clientX,T.prevMouseY=D.clientY,T.lastGestureEndTime=performance.now()}T.pendingPointer=null}l.copy(p.matrixWorld).invert(),T.mouseLocal.copy(T.mouseWorld).applyMatrix4(l);const y=s.explosionStartTime>=0;if(y?R.uMouse.value.set(-1e3,-1e3,0):R.uMouse.value.copy(T.mouseLocal),y)Rn(we)&&ro(),T.charge.active=!1,T.charge.release=null,T.tapRing.active=!1,T.tapRing.pending=null;else{if(T.charge.release){const G=T.charge.release;if(T.charge.release=null,na(G.clientX,G.clientY,Je),Je.x>-500){const H=f.rippleTapAmp+(f.rippleChargeAmp-f.rippleTapAmp)*G.charge;En(Je.x,Je.y,H*(We?.5:1))}}const D=T.mouseLocal.x,B=T.mouseLocal.y;if(D>-500&&!T.isDragging&&Te.speedU>f.rippleMoveSpeed&&performance.now()-Te.lastEmitMs>f.rippleEmitIntervalMs){const G=Math.min(f.rippleMoveAmpMax,Math.max(f.rippleMoveAmpMin,Te.speedU/f.rippleMoveAmpDiv));En(D,B,G*(We?.5:1)),Te.lastEmitMs=performance.now()}if(Te.speedU=0,T.charge.active){const G=performance.now()-T.charge.t0;R.uCharge.value=Math.min(1,Math.max(0,(G-f.rippleTapGraceMs)/f.rippleChargeMs))}else R.uCharge.value!==0&&(R.uCharge.value=0)}eo(we,o);const g=R.uRipples.value;for(let D=0;D<rn;D++){const B=D*4;g[D].set(we[B],we[B+1],we[B+2],we[B+3])}const d=T.tapRing;if(!y)if(d.pending){const D=d.pending;d.pending=null,na(D.clientX,D.clientY,Je),Je.x>-500&&(d.x=Je.x,d.y=Je.y,d.age=0,d.count=D.count,d.active=!0)}else d.active&&(d.age+=o,d.age>.55&&(d.active=!1));R.uTapRing.value.set(d.x,d.y,d.age,d.active?d.count:0);const k=p.geometry.attributes.position,c=k.array,P=k.count,{posHome:v,explosionOrigin:Z,springDisp:E,springVel:z,randomDir:w,randomSpeed:M,funnelT:A,funnelRadialX:I,funnelRadialZ:Y}=s,V=Rn(we);let F,L;Math.abs(o-r.prevDt)<1e-4?(F=r.prevKFrame,L=r.prevDampFrame):(F=f.springK*(o*60),L=Math.pow(f.springDamping,o*60),r.prevDt=o,r.prevKFrame=F,r.prevDampFrame=L);let h=-1,C=0;const S=s.activeStyle>=0?s.activeStyle:t.motionStyle,U=t.activeExpansionDuration||t.expansionDuration,b=t.activeContractionDuration||t.contractionDuration,q=t.activeMaxDist||t.explosionMaxDistMultiplier;if(s.explosionStartTime>=0)if(h=a-s.explosionStartTime,h>t.totalExplosionDuration)s.explosionStartTime=-1,s.motionToken++,E.fill(0),z.fill(0),t.afterglowStartTime=a,h=-1,c&&v&&(c.set(v),k.needsUpdate=!0),r.trailPoints&&!We&&(r.trailPoints.visible=!0),$e(),ga(!1),Uo();else{(S===0||S===-1)&&h>=U+3&&!t.travelApplied&&(t.activeContractionDuration=t.contractionDuration||2,t.travelApplied=!0,t.audioEnabled&&uo(t.activeContractionDuration)),h>=U&&!t.embersSpawned&&(t.embersSpawned=!0,S!==5&&vo());const D=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9;S===5&&!t.dodgeEmbersFired&&h>=D&&(t.dodgeEmbersFired=!0,xo(h));const B=t.activeContractionDuration||t.contractionDuration;h<U?C=h/U:C=1-(h-U)/B}let W;if(s.explosionStartTime>=0?W=1:t.afterglowStartTime!=null?(W=Math.max(0,1-(a-t.afterglowStartTime)/f.afterglowDuration),W<=0&&(t.afterglowStartTime=null)):W=0,R.uExplosionActive.value=W,R.uTornadoActive.value=s.explosionStartTime>=0&&s.activeStyle===1?1:0,r.particles&&(r.particles.frustumCulled=C===0),r.particles&&!T.isDragging&&s.explosionStartTime>=0&&S===3&&h>=0&&h<=7.5){const D=h/7.5,B=Math.pow(Math.sin(Math.PI*D),1.2),G=.26*B,H=-.36*B;r.particles.rotation.x=G,r.particles.rotation.y=H,r.trailPoints&&(r.trailPoints.rotation.x=G,r.trailPoints.rotation.y=H)}if(t.gpuPhysics&&y){r.trailPoints&&(r.trailPoints.visible=!1),R.uGpuPhysics.value=1,R.uMotionStyle.value=S>=0?S:0,R.uExplosionElapsed.value=s.explosionStartTime>=0?h:-1,R.uExpDuration.value=U,R.uDriftDuration.value=S===0||S===-1?3:0,R.uContractionDuration.value=b,R.uMaxDist.value=q,R.uSpinSpeed.value=t.pattern&&t.pattern.spinSpeed||5.2,R.uFunnelBottom.value=t.pattern&&t.pattern.funnelBottom||-22,R.uFunnelHeight.value=t.pattern&&t.pattern.funnelHeight||46,R.uFunnelCrownRadius.value=t.pattern&&t.pattern.funnelCrownRadius||22,R.uFunnelWaistRadius.value=t.pattern&&t.pattern.funnelWaistRadius||3.5,R.uFunnelTailRadius.value=t.pattern&&t.pattern.funnelTailRadius||.8,R.uFunnelWaistT.value=t.pattern&&t.pattern.funnelWaistT||.42,R.uFunnelCrownExp.value=t.pattern&&t.pattern.funnelCrownExp||1.4,R.uBreezeBlowDir.value=Ae&&Ae.blowDir||1,R.uBreezeIntensity.value=Ae&&Ae.intensity||1,R.uBreezeSwirl.value=Ae&&Ae.swirl!=null?Ae.swirl:0,R.uMSweepX.value=t.pattern&&t.pattern.mSweepX!=null?t.pattern.mSweepX:24,R.uMSweepY.value=t.pattern&&t.pattern.mSweepY!=null?t.pattern.mSweepY:4,R.uMSweepZ.value=t.pattern&&t.pattern.mSweepZ!=null?t.pattern.mSweepZ:12,R.uMFreqX.value=t.pattern&&t.pattern.mFreqX!=null?t.pattern.mFreqX:3.456,R.uMFreqY.value=t.pattern&&t.pattern.mFreqY!=null?t.pattern.mFreqY:5.341,R.uMFreqZ.value=t.pattern&&t.pattern.mFreqZ!=null?t.pattern.mFreqZ:2.827,R.uMPhX.value=t.pattern&&t.pattern.mPhX!=null?t.pattern.mPhX:.4,R.uMPhY.value=t.pattern&&t.pattern.mPhY!=null?t.pattern.mPhY:0,R.uMPhZ.value=t.pattern&&t.pattern.mPhZ!=null?t.pattern.mPhZ:1.2,R.uMLaunchDir.value=t.pattern&&t.pattern.mLaunchDir!=null?t.pattern.mLaunchDir:1,R.uMTurnT.value=t.pattern&&t.pattern.mTurnT!=null?t.pattern.mTurnT:99,R.uMTurnDir.value=t.pattern&&t.pattern.mTurnDir!=null?t.pattern.mTurnDir:1,R.uMSplitT.value=t.pattern&&t.pattern.mSplitT!=null?t.pattern.mSplitT:99,R.uMSplitAng.value=t.pattern&&t.pattern.mSplitAng!=null?t.pattern.mSplitAng:0,R.uMDodge1T.value=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9,R.uMDodge2T.value=t.pattern&&t.pattern.mDodge2T!=null?t.pattern.mDodge2T:7.1,R.uMDodge3T.value=t.pattern&&t.pattern.mDodge3T!=null?t.pattern.mDodge3T:99,R.uMDodgeRad.value=t.pattern&&t.pattern.mDodgeRad!=null?t.pattern.mDodgeRad:8,R.uMDodgeStr.value=t.pattern&&t.pattern.mDodgeStr!=null?t.pattern.mDodgeStr:1,R.uMBoilAmp.value=t.pattern&&t.pattern.mBoilAmp!=null?t.pattern.mBoilAmp:0,R.uMBoilFreq.value=t.pattern&&t.pattern.mBoilFreq!=null?t.pattern.mBoilFreq:14,R.uMChurnMult.value=t.pattern&&t.pattern.mChurnMult!=null?t.pattern.mChurnMult:1,R.uMFlutterMult.value=t.pattern&&t.pattern.mFlutterMult!=null?t.pattern.mFlutterMult:1,R.uMJinkAmp.value=t.pattern&&t.pattern.mJinkAmp!=null?t.pattern.mJinkAmp:0,R.uMJinkFreq.value=t.pattern&&t.pattern.mJinkFreq!=null?t.pattern.mJinkFreq:5.5,R.uMJinkPh.value=t.pattern&&t.pattern.mJinkPh!=null?t.pattern.mJinkPh:0,R.uMBreathAmp.value=t.pattern&&t.pattern.mBreathAmp!=null?t.pattern.mBreathAmp:1,R.uMScoutAmp.value=t.pattern&&t.pattern.mScoutAmp!=null?t.pattern.mScoutAmp:0;{const D=r.camera,B=D.top-D.bottom,G=D.right-D.left,H=Math.max(1,Math.min(G,B))*.205;R.uKnotScale.value=H,t.pattern.knotScale=H}}else if(R.uGpuPhysics.value=0,xe){let D=null;for(const B of s.slots)if(!B.inFlight){D=B;break}D&&(D.needsReset&&(D.posLive.set(s.explosionOrigin),D.springDisp.fill(0),D.springVel.fill(0),D.needsReset=!1),D.inFlight=!0,D.seq=s.seq++,s.sendQueue.push(D),xe.postMessage({type:"update",data:{posLive:D.posLive,springDisp:D.springDisp,springVel:D.springVel,count:P,dt:o,elapsed:h,ripples:we,kFrame:F,dampFrame:L,expansionDuration:U,driftDuration:S===0||S===3||S===-1?3:0,contractionDuration:b,explosionMaxDistMultiplier:q,breeze:Ae,sourceGeneration:s.sourceGeneration,motionToken:s.motionToken},seq:D.seq},[D.posLive.buffer,D.springDisp.buffer,D.springVel.buffer]))}else{const D=t.pattern,B={x:0,y:0,z:0},G=S===1&&D.funnelHeight&&A&&I&&Y,H=Z||v,ae=S===0||S===3||S===-1?3:0;for(let J=0;J<P;J++){const O=J*3,$=O+1,m=O+2;let j,N,ee;if(h>=0)if(S===1&&G)ca(J,v[O],v[$],v[m],A[J],I[J],Y[J],(M?M[J]:1)*.35+.85,h,D,B),j=B.x,N=B.y,ee=B.z;else if(S===2)ua(J,v[O],v[$],v[m],(M?M[J]:1)*.35+.85,h,Ae,B),j=B.x,N=B.y,ee=B.z;else if(S===3)ma(J,v[O],v[$],v[m],(M?M[J]:1)*.35+.85,h,D,B),j=B.x,N=B.y,ee=B.z;else if(S===4)pa(J,v[O],v[$],v[m],(M?M[J]:1)*.35+.85,h,D,B),j=B.x,N=B.y,ee=B.z;else if(S===5)fa(J,v[O],v[$],v[m],(M?M[J]:1)*.35+.85,h,D,B),j=B.x,N=B.y,ee=B.z;else{const le=M[J]*q;da(H[O],H[$],H[m],w[O],w[$],w[m],le,U,ae,b,h,B),j=B.x,N=B.y,ee=B.z}else j=v[O],N=v[$],ee=v[m];const se=c[O],ne=c[$],oe=c[m];let K=0,Q=0,ce=0;if(V&&(to(se,ne,oe,we,Ot),K=Ot.x,Q=Ot.y,ce=Ot.z),z[O]=(z[O]+(K-E[O])*F)*L,z[$]=(z[$]+(Q-E[$])*F)*L,z[m]=(z[m]+(ce-E[m])*F)*L,E[O]+=z[O],E[$]+=z[$],E[m]+=z[m],c[O]=j+E[O],c[$]=N+E[$],c[m]=ee+E[m],h>=0){const le=c[O]-H[O],me=c[$]-H[$],he=c[m]-H[m],fe=le*le+me*me+he*he;fe>$t&&($t=fe)}}t.actualTravelRadius=Math.sqrt($t),k.needsUpdate=!0,s.positionsDirty=!0}go(),yo(o),r.renderer.render(r.scene,u),Go(performance.now()-e)}async function Ho(){r.scene=new Ba,r.camera=new Va(-1,1,1,-1,-600,600),r.camera.position.z=r.targetZ,r.renderer=new Ia({antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1}),r.renderer.setClearColor(f.clearColor,1);const e=r.renderer.domElement;if(e.setAttribute("role","img"),e.setAttribute("aria-label","Kinetic particle sculpture — interactive particle animation"),e.addEventListener("webglcontextlost",g=>{g.preventDefault(),et("WebGL context lost — attempting restoration...")},!1),e.addEventListener("webglcontextrestored",async()=>{et("WebGL context restored"),await ke(t.currentText,!1)},!1),document.getElementById("stage").appendChild(e),qt(),!(new URLSearchParams(window.location.search).get("noworker")==="1"))try{xe=new Worker(new URL("/ParticlesSimulations/assets/physics.worker-BB3i8Vwg.js",import.meta.url),{type:"module"}),xe.onmessage=function(g){const{type:d,seq:k,posLive:c,springDisp:P,springVel:v,travelRadius:Z,sourceGeneration:E,motionToken:z}=g.data;if(d==="randomized"){if(g.data.sourceGeneration!==s.sourceGeneration||g.data.motionToken!==s.motionToken)return;s.randomized={dirs:g.data.dirs,style:g.data.style},s.activeStyle=g.data.style;return}if(d==="update"){let w=-1;for(let I=0;I<s.sendQueue.length;I++)if(s.sendQueue[I].seq===k){w=I;break}if(w===-1)return;const M=s.sendQueue.splice(w,1)[0];if(M.inFlight=!1,M.posLive=c,M.springDisp=P,M.springVel=v,E!==s.sourceGeneration||z!==s.motionToken)return;typeof Z=="number"&&Z>0&&(t.actualTravelRadius=Z);const A=r.particles&&r.particles.geometry.attributes.position;A&&A.array.length===c.length&&(A.array.set(c),A.needsUpdate=!0,s.positionsDirty=!0)}},xe.onerror=()=>{console.error("Physics worker error — switching to CPU fallback."),sa()},xe.onmessageerror=()=>{console.error("Physics worker message error — switching to CPU fallback."),sa()}}catch(g){console.error("Failed to initialize physics Web Worker:",g)}await document.fonts.ready.catch(()=>{});const o=window.location.search||(window.location.hash.includes("?")?window.location.hash.substring(window.location.hash.indexOf("?")):""),i=new URLSearchParams(o),l=i.get("text")||i.get("t")||i.get("emoji")||"Bring your message!",n=i.get("theme")||"ember",p=i.get("font")||"Outfit",u=i.get("preset");i.get("gpu")==="0"&&(t.gpuPhysics=!1),t.currentText=l,t.currentTheme=n,t.currentFont=p,f.emojiOptions.includes(l)?(t.activeEmoji=l,t.lastEmoji=l,t.messageMode="emoji",t.lastText="Bring your message!"):(t.messageMode="text",t.lastText=l);const X=l.toUpperCase(),y=u?u.toUpperCase():f.presets[X]&&X!=="DEFAULT"?X:null;y&&f.presets[y]?(en(n,!1),await ke(t.currentText,!1),await kn(y,!1),tn(y)):f.presets[X]&&X!=="DEFAULT"?(await kn(X,!1),tn(X)):(en(n,!1),await ke(t.currentText,!1)),jo(),ft(t.messageMode),window.addEventListener("pointermove",g=>{T.pendingPointer={clientX:g.clientX,clientY:g.clientY,pointerType:g.pointerType,pointerId:g.pointerId}}),window.addEventListener("pointerdown",So),window.addEventListener("pointerdown",g=>{sn(g)||on()}),window.addEventListener("keydown",g=>{(g.key===" "||g.key.startsWith("Arrow")||g.key==="+"||g.key==="-"||g.key==="=")&&on()}),window.addEventListener("pointerup",aa),window.addEventListener("pointercancel",aa),window.addEventListener("pointerleave",()=>{T.mouseWorld.set(-1e3,-1e3,0),R.uMouse.value.set(-1e3,-1e3,0),T.isDragging=!1,T.charge.active=!1,T.charge.release=null}),window.addEventListener("touchstart",bo,{passive:!1}),window.addEventListener("touchmove",Ao,{passive:!1}),window.addEventListener("touchend",Do),window.addEventListener("resize",qt),window.addEventListener("keydown",g=>{if(g.key==="Escape"){const d=document.getElementById("drawer");if(d&&d.classList.contains("open")){xt();return}}T.keys[g.key]=!0,(g.code==="Space"||g.key.startsWith("Arrow"))&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="SELECT"&&(g.preventDefault(),g.code==="Space"&&s.explosionStartTime<0&&(va(),Lt()))}),window.addEventListener("keyup",g=>T.keys[g.key]=!1),window.addEventListener("popstate",async()=>{const g=new URLSearchParams(window.location.search),d=g.get("t")||"Bring your message!",k=g.get("theme")||"ember",c=g.get("font")||"Outfit";t.currentText=d,t.currentTheme=k,t.currentFont=c;const P=f.emojiOptions.includes(d);t.activeEmoji=P?d:null,P?t.lastEmoji=d:t.lastText=d,ft(P?"emoji":"text"),an(d),en(k,!1),P?(Ie(d),await ke(d,!1)):await Ma(c,!1);const v=d.toUpperCase();f.presets[v]&&v!=="DEFAULT"?tn(v):$e(),Ie(t.activeEmoji)}),ba(),window.__artzReady=!0}window.__artzDebug={_render:()=>r,triggerExplosion:Lt,get particleCount(){return s.posLive?s.posLive.length/3:0},get usingWorker(){return!!xe},get usingGpu(){return t.gpuPhysics},get geometryCount(){return r.renderer?r.renderer.info.memory.geometries:-1},get textureCount(){return r.renderer?r.renderer.info.memory.textures:-1},get renderCalls(){return r.renderer?r.renderer.info.render.calls:-1},snapshot(e=96){var n;const a=s.posHome,o=s.explosionOrigin,i=Math.min(e*3,a?a.length:0);let l=(n=r.particles)==null?void 0:n.geometry.attributes.position.array;if(t.gpuPhysics&&s.explosionStartTime>=0&&a){const p=r.clock.getElapsedTime()-s.explosionStartTime,u=s.activeStyle>=0?s.activeStyle:t.motionStyle,x=t.activeExpansionDuration||t.expansionDuration,X=t.activeContractionDuration||t.contractionDuration,y=t.activeMaxDist||t.explosionMaxDistMultiplier,g=u===0||u===3||u===-1?3:0,d={x:0,y:0,z:0},k=new Float32Array(i);for(let c=0;c<i/3;c++){const P=c*3,v=P+1,Z=P+2;if(u===1)ca(c,a[P],a[v],a[Z],s.funnelT?s.funnelT[c]:0,s.funnelRadialX?s.funnelRadialX[c]:0,s.funnelRadialZ?s.funnelRadialZ[c]:0,(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else if(u===2)ua(c,a[P],a[v],a[Z],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,Ae,d);else if(u===3)ma(c,a[P],a[v],a[Z],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else if(u===4)pa(c,a[P],a[v],a[Z],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else if(u===5)fa(c,a[P],a[v],a[Z],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else{const E=(s.randomSpeed?s.randomSpeed[c]:1)*y,z=o||a;da(z[P],z[v],z[Z],s.randomDir?s.randomDir[P]:0,s.randomDir?s.randomDir[v]:0,s.randomDir?s.randomDir[Z]:0,E,x,g,X,p,d)}k[P]=d.x,k[v]=d.y,k[Z]=d.z}l=k}return{position:l?Array.from(l.slice(0,i)):[],home:a?Array.from(a.slice(0,i)):[],explosionOrigin:o?Array.from(o.slice(0,i)):[],funnelT:s.funnelT?Array.from(s.funnelT.slice(0,e)):[],activeStyle:s.activeStyle,funnelProfile:{height:t.pattern.funnelHeight||0,bottom:t.pattern.funnelBottom||0,tailRadius:Qt(.05,t.pattern),waistRadius:Qt(.5,t.pattern),crownRadius:Qt(.95,t.pattern),fadeStart:t.pattern.funnelFadeStart||0,fadeEnd:t.pattern.funnelFadeEnd||0},rotation:r.particles?[r.particles.rotation.x,r.particles.rotation.y,r.particles.rotation.z]:[0,0,0],sourceGeneration:s.sourceGeneration,motionToken:s.motionToken,explosionActive:s.explosionStartTime>=0,elapsed:s.explosionStartTime>=0?r.clock.getElapsedTime()-s.explosionStartTime:-1,expDuration:t.activeExpansionDuration||t.expansionDuration,conDuration:t.activeContractionDuration||t.contractionDuration,randomized:s.randomized?{style:s.randomized.style,dirs:Array.from(s.randomized.dirs)}:{style:-1,dirs:[]}}},triggerExplosion:Lt,get rippleCount(){let e=0;for(let a=3;a<we.length;a+=4)we[a]>0&&e++;return e},get ripples(){return Array.from(we)},get charge(){return{active:T.charge.active,value:R.uCharge.value}},get tapRing(){return{active:T.tapRing.active,count:T.tapRing.count}},emitTestRipple(e,a,o){En(e,a,o)},rippleProfile(e){return Ln(e)}};Ho();
