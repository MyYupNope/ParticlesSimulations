import{V as Nn,C as Ia,S as Va,O as Ua,W as Xa,a as Re,B as Dn,b as ve,D as Ft,c as Pn,A as an,P as Rn,N as Za,d as Ya,L as Kn,e as ja,M as Ot,f as Wa}from"./three-DsYxzsj3.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const n of l)if(n.type==="childList")for(const p of n.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&i(p)}).observe(document,{childList:!0,subtree:!0});function o(l){const n={};return l.integrity&&(n.integrity=l.integrity),l.referrerPolicy&&(n.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?n.credentials="include":l.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(l){if(l.ep)return;l.ep=!0;const n=o(l);fetch(l.href,n)}})();const Ga=`
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
`,Ha=`
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
`,Oa=`
attribute float aLife;
varying float vLife;

void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + 3.0 * aLife);
}
`,_a=`
varying float vLife;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float a = (1.0 - r) * vLife;
    vec3 c = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.95, 0.7), vLife);
    gl_FragColor = vec4(c, a);
}
`;let Mt=null,Tn=null;function Na(){return!Mt&&(window.AudioContext||window.webkitAudioContext)&&(Mt=new(window.AudioContext||window.webkitAudioContext)),Mt&&Mt.state==="suspended"&&Mt.resume(),Mt}function Le(e){if(Tn)return Tn;const a=e.sampleRate*2,o=e.createBuffer(1,a,e.sampleRate),i=o.getChannelData(0);for(let l=0;l<a;l++)i[l]=Math.random()*2-1;return Tn=o,o}function Ka(e,a){const o=Na();if(!o)return;const i=typeof e=="object"&&e!==null?e:{soundDuration:e||a},l=i.motionStyle!=null?i.motionStyle:typeof state<"u"&&state&&state.motionStyle!=null?state.motionStyle:0,n=o.currentTime,p=o.createGain();p.gain.setValueAtTime(1e-4,n),p.gain.linearRampToValueAtTime(.4,n+.02),p.connect(o.destination);const c=i.soundDuration||a||1.5,M=i.soundPitch||140,Z=i.soundType||"sine";if(l===1){const v=o.createBufferSource();v.buffer=Le(o),v.loop=!0;const A=o.createBiquadFilter();A.type="bandpass",A.frequency.setValueAtTime(60,n),A.frequency.linearRampToValueAtTime(180,n+3.5),A.frequency.exponentialRampToValueAtTime(580,n+6),A.frequency.linearRampToValueAtTime(320,n+8),A.frequency.linearRampToValueAtTime(220,n+11.5),A.frequency.exponentialRampToValueAtTime(45,n+15),A.Q.value=2.8;const x=o.createGain();x.gain.setValueAtTime(1e-4,n),x.gain.exponentialRampToValueAtTime(.18,n+3),x.gain.linearRampToValueAtTime(.38,n+6),x.gain.linearRampToValueAtTime(.24,n+11.5),x.gain.exponentialRampToValueAtTime(1e-4,n+15),v.connect(A),A.connect(x),x.connect(p),v.start(n),v.stop(n+15+.1),setTimeout(()=>{try{v.disconnect(),A.disconnect(),x.disconnect(),p.disconnect()}catch{}},(15+.2)*1e3);return}if(l===2){const v=o.createBufferSource();v.buffer=Le(o),v.loop=!0;const A=o.createBiquadFilter();A.type="bandpass",A.frequency.setValueAtTime(90,n),A.frequency.linearRampToValueAtTime(130,n+1),A.frequency.linearRampToValueAtTime(75,n+3),A.frequency.exponentialRampToValueAtTime(620,n+6.6),A.frequency.exponentialRampToValueAtTime(100,n+10.2),A.frequency.exponentialRampToValueAtTime(50,n+11.8),A.Q.value=1.2;const x=o.createGain();x.gain.setValueAtTime(1e-4,n),x.gain.exponentialRampToValueAtTime(.14,n+1),x.gain.exponentialRampToValueAtTime(.01,n+3),x.gain.linearRampToValueAtTime(.32,n+6.6),x.gain.linearRampToValueAtTime(.05,n+10.2),x.gain.exponentialRampToValueAtTime(1e-4,n+11.8),v.connect(A),A.connect(x),x.connect(p),v.start(n),v.stop(n+11.8+.1),setTimeout(()=>{try{v.disconnect(),A.disconnect(),x.disconnect(),p.disconnect()}catch{}},(11.8+.2)*1e3);return}if(l===3){const v=typeof o.createStereoPanner=="function"?o.createStereoPanner():null;v&&(v.pan.setValueAtTime(-.75,n),v.pan.linearRampToValueAtTime(.75,n+7.5),v.connect(p));const A=v||p,x=o.createOscillator();x.type="sine",x.frequency.setValueAtTime(32,n),x.frequency.linearRampToValueAtTime(48,n+2.5),x.frequency.linearRampToValueAtTime(58,n+4.2),x.frequency.linearRampToValueAtTime(36,n+5.8),x.frequency.exponentialRampToValueAtTime(20,n+7.5);const X=o.createGain();X.gain.setValueAtTime(1e-4,n),X.gain.exponentialRampToValueAtTime(.24,n+2),X.gain.linearRampToValueAtTime(.48,n+4.2),X.gain.linearRampToValueAtTime(.18,n+5.8),X.gain.exponentialRampToValueAtTime(1e-4,n+7.5),x.connect(X),X.connect(A),x.start(n),x.stop(n+7.5+.1);const j=o.createBufferSource();j.buffer=Le(o),j.loop=!0;const V=o.createBiquadFilter();V.type="lowpass",V.frequency.setValueAtTime(140,n),V.frequency.exponentialRampToValueAtTime(420,n+2.2),V.frequency.exponentialRampToValueAtTime(1250,n+4.2),V.frequency.linearRampToValueAtTime(550,n+5.6),V.frequency.exponentialRampToValueAtTime(75,n+7.5),V.Q.value=1.1;const L=o.createGain();L.gain.setValueAtTime(1e-4,n),L.gain.exponentialRampToValueAtTime(.18,n+1.8),L.gain.linearRampToValueAtTime(.52,n+4.2),L.gain.linearRampToValueAtTime(.22,n+5.6),L.gain.exponentialRampToValueAtTime(1e-4,n+7.5),j.connect(V),V.connect(L),L.connect(A),j.start(n),j.stop(n+7.5+.1);const z=o.createBufferSource();z.buffer=Le(o),z.loop=!0;const y=o.createBiquadFilter();y.type="bandpass",y.frequency.setValueAtTime(1400,n),y.frequency.exponentialRampToValueAtTime(2400,n+3.8),y.frequency.exponentialRampToValueAtTime(3200,n+4.6),y.frequency.linearRampToValueAtTime(1800,n+6),y.frequency.exponentialRampToValueAtTime(600,n+7.5),y.Q.value=1.4;const w=o.createGain();w.gain.setValueAtTime(1e-4,n),w.gain.exponentialRampToValueAtTime(.04,n+2.5),w.gain.linearRampToValueAtTime(.38,n+4.4),w.gain.linearRampToValueAtTime(.26,n+5.4),w.gain.exponentialRampToValueAtTime(1e-4,n+7.5),z.connect(y),y.connect(w),w.connect(A),z.start(n),z.stop(n+7.5+.1);const C=o.createBufferSource();C.buffer=Le(o),C.loop=!0;const k=o.createBiquadFilter();k.type="bandpass",k.frequency.setValueAtTime(700,n+4.5),k.frequency.exponentialRampToValueAtTime(280,n+6.2),k.frequency.exponentialRampToValueAtTime(90,n+7.5),k.Q.value=1.8;const b=o.createGain();b.gain.setValueAtTime(1e-4,n),b.gain.setValueAtTime(1e-4,n+4.5),b.gain.linearRampToValueAtTime(.18,n+5.5),b.gain.exponentialRampToValueAtTime(1e-4,n+7.5),C.connect(k),k.connect(b),b.connect(A),C.start(n+4.5),C.stop(n+7.5+.1),setTimeout(()=>{try{x.disconnect(),X.disconnect(),j.disconnect(),V.disconnect(),L.disconnect(),z.disconnect(),y.disconnect(),w.disconnect(),C.disconnect(),k.disconnect(),b.disconnect(),v&&v.disconnect(),p.disconnect()}catch{}},(7.5+.2)*1e3);return}if(l===4){const v=o.createOscillator();v.type="sine",v.frequency.setValueAtTime(28,n),v.frequency.linearRampToValueAtTime(52,n+3),v.frequency.setValueAtTime(52,n+11.5),v.frequency.exponentialRampToValueAtTime(24,n+16);const A=o.createGain();A.gain.setValueAtTime(1e-4,n),A.gain.exponentialRampToValueAtTime(.3,n+2.6),A.gain.linearRampToValueAtTime(.22,n+11.5),A.gain.exponentialRampToValueAtTime(1e-4,n+16),v.connect(A),A.connect(p),v.start(n),v.stop(n+16+.1);const x=o.createBufferSource();x.buffer=Le(o),x.loop=!0;const X=o.createBiquadFilter();X.type="bandpass",X.frequency.setValueAtTime(70,n),X.frequency.exponentialRampToValueAtTime(760,n+3),X.frequency.exponentialRampToValueAtTime(120,n+3.8),X.Q.value=1.8;const j=o.createGain();j.gain.setValueAtTime(1e-4,n),j.gain.exponentialRampToValueAtTime(.26,n+2.9),j.gain.exponentialRampToValueAtTime(1e-4,n+4),x.connect(X),X.connect(j),j.connect(p),x.start(n),x.stop(n+4.1);const V=n+3,L=o.createOscillator();L.type="sine",L.frequency.setValueAtTime(95,V),L.frequency.exponentialRampToValueAtTime(36,V+.45);const z=o.createGain();z.gain.setValueAtTime(1e-4,V),z.gain.exponentialRampToValueAtTime(.28,V+.03),z.gain.exponentialRampToValueAtTime(1e-4,V+.55),L.connect(z),z.connect(p),L.start(V),L.stop(V+.6);const y=o.createBufferSource();y.buffer=Le(o),y.loop=!0;const w=o.createBiquadFilter();w.type="bandpass",w.frequency.setValueAtTime(430,n+3),w.frequency.linearRampToValueAtTime(560,n+11.5),w.Q.value=2.2;const C=o.createGain();C.gain.setValueAtTime(1e-4,n+3),C.gain.linearRampToValueAtTime(.15,n+4.2),C.gain.linearRampToValueAtTime(.12,n+10.5),C.gain.exponentialRampToValueAtTime(1e-4,n+16);const k=o.createOscillator();k.type="sine",k.frequency.value=.9;const b=o.createGain();b.gain.setValueAtTime(.055,n+3),b.gain.linearRampToValueAtTime(0,n+11.5),k.connect(b),b.connect(C.gain),y.connect(w),w.connect(C),C.connect(p),y.start(n+3),y.stop(n+16+.1),k.start(n+3),k.stop(n+16+.1);const I=o.createOscillator();I.type="triangle",I.frequency.setValueAtTime(1350,n+11.5),I.frequency.exponentialRampToValueAtTime(310,n+16);const W=o.createGain();W.gain.setValueAtTime(1e-4,n+11.5),W.gain.exponentialRampToValueAtTime(.07,n+11.9),W.gain.exponentialRampToValueAtTime(1e-4,n+16),I.connect(W),W.connect(p),I.start(n+11.5),I.stop(n+16+.1),setTimeout(()=>{try{v.disconnect(),A.disconnect(),x.disconnect(),X.disconnect(),j.disconnect(),L.disconnect(),z.disconnect(),y.disconnect(),w.disconnect(),C.disconnect(),k.disconnect(),b.disconnect(),I.disconnect(),W.disconnect(),p.disconnect()}catch{}},(16+.2)*1e3);return}if(l===5){const v=o.createBufferSource();v.buffer=Le(o),v.loop=!0;const A=o.createBiquadFilter();A.type="lowpass",A.frequency.setValueAtTime(220,n),A.frequency.linearRampToValueAtTime(920,n+3.2),A.frequency.linearRampToValueAtTime(680,n+9),A.frequency.linearRampToValueAtTime(180,n+12),A.frequency.exponentialRampToValueAtTime(90,n+14);const x=o.createGain();x.gain.setValueAtTime(1e-4,n),x.gain.exponentialRampToValueAtTime(.2,n+3),x.gain.linearRampToValueAtTime(.16,n+9),x.gain.exponentialRampToValueAtTime(1e-4,n+14),v.connect(A),A.connect(x),x.connect(p),v.start(n),v.stop(n+14+.1);const X=o.createBufferSource();X.buffer=Le(o),X.loop=!0;const j=o.createBiquadFilter();j.type="bandpass",j.frequency.value=760,j.Q.value=1.1;const V=o.createGain();V.gain.setValueAtTime(1e-4,n),V.gain.linearRampToValueAtTime(.1,n+3),V.gain.linearRampToValueAtTime(.08,n+9),V.gain.linearRampToValueAtTime(1e-4,n+12.5);const L=o.createOscillator();L.type="sine",L.frequency.setValueAtTime(8,n),L.frequency.linearRampToValueAtTime(12.5,n+9),L.frequency.linearRampToValueAtTime(7,n+14);const z=o.createGain();z.gain.setValueAtTime(0,n),z.gain.linearRampToValueAtTime(.085,n+3),z.gain.linearRampToValueAtTime(.06,n+9),z.gain.linearRampToValueAtTime(0,n+12.5),L.connect(z),z.connect(V.gain),X.connect(j),j.connect(V),V.connect(p),X.start(n),X.stop(n+14+.1),L.start(n),L.stop(n+14+.1);for(let y=0;y<3;y++){const w=n+.25+y*.24,C=o.createOscillator();C.type="sine",C.frequency.setValueAtTime(2350+y*190,w),C.frequency.exponentialRampToValueAtTime(1750+y*140,w+.09);const k=o.createGain();k.gain.setValueAtTime(1e-4,w),k.gain.exponentialRampToValueAtTime(.09,w+.02),k.gain.exponentialRampToValueAtTime(1e-4,w+.11),C.connect(k),k.connect(p),C.start(w),C.stop(w+.12)}setTimeout(()=>{try{v.disconnect(),A.disconnect(),x.disconnect(),X.disconnect(),j.disconnect(),V.disconnect(),L.disconnect(),z.disconnect(),p.disconnect()}catch{}},(14+.2)*1e3);return}const T=Math.max(1.8,c),h=o.createBufferSource();h.buffer=Le(o);const d=o.createBiquadFilter();d.type="bandpass",d.frequency.setValueAtTime(1200,n),d.frequency.exponentialRampToValueAtTime(180,n+.25),d.Q.value=1.2;const D=o.createGain();D.gain.setValueAtTime(.75,n),D.gain.exponentialRampToValueAtTime(.001,n+.35),h.connect(d),d.connect(D),D.connect(p),h.start(n),h.stop(n+.4);const u=o.createBufferSource();u.buffer=Le(o),u.loop=!0;const S=o.createBiquadFilter();S.type="lowpass",S.frequency.setValueAtTime(450,n),S.frequency.exponentialRampToValueAtTime(65,n+T);const P=o.createGain();P.gain.setValueAtTime(.65,n),P.gain.exponentialRampToValueAtTime(1e-4,n+T),u.connect(S),S.connect(P),P.connect(p),u.start(n),u.stop(n+T+.05);const F=o.createOscillator();F.type=Z||"sine",F.frequency.setValueAtTime(Math.max(M,120),n),F.frequency.exponentialRampToValueAtTime(26,n+Math.min(1.2,T));const B=o.createGain();B.gain.setValueAtTime(.7,n),B.gain.exponentialRampToValueAtTime(.001,n+T),F.connect(B),B.connect(p),F.start(n),F.stop(n+T+.05),setTimeout(()=>{try{h.disconnect(),d.disconnect(),D.disconnect(),u.disconnect(),S.disconnect(),P.disconnect(),F.disconnect(),B.disconnect(),p.disconnect()}catch{}},(T+.1)*1e3)}function Qt(e,a){a.funnelBottom,a.funnelHeight;const o=a.funnelWaistT!=null?a.funnelWaistT:a.funnelWaistU||.42,i=a.funnelTailRadius!=null?a.funnelTailRadius:.8,l=a.funnelWaistRadius!=null?a.funnelWaistRadius:3.5,n=a.funnelCrownRadius!=null?a.funnelCrownRadius:22,p=a.funnelCrownExp||1.4;if(e<=o){const c=e/Math.max(.01,o);return i+(l-i)*(c*c)}else{const c=(e-o)/Math.max(.01,1-o);return l+(n-l)*Math.pow(c,p)}}const Jn=.06081006264583979;function da(e,a,o,i,l,n,p,c,M,Z,T){const h=Qt(l,Z),d=Math.atan2(p,n),D=Math.sqrt(a*a+i*i),u=3.5,S=Z.vortexDuration||4.5,P=Z.equilibriumDuration||3.5,F=3.5,B=14+.55*D,q=Z.funnelBottom||-22,v=Z.funnelHeight||46,A=.12*Math.sin(3*d-4.2*M+2.5*l),x=.08*Math.cos(5*d+6*M-3.8*l),X=.06*Math.sin(M*7.5+e*.03),j=1+A+x+X,V=(4+15/(D+4.5))*c,L=((Z.spinSpeed||5.2)*2.8+4.5*(1-l))*c;if(M<u){const z=M/u,y=z*z*z*(z*(z*6-15)+10),w=(1-y)*D+y*B,C=d+V*(.6*M+.2*(M*M/u)),k=Math.cos(C)*w,b=(1-y)*o+y*(q+.022*w*w+3*(l-.5)),I=Math.sin(C)*w;return T?(T.x=k,T.y=b,T.z=I,T):{x:k,y:b,z:I}}else if(M<u+S){const z=M-u,y=z/S,w=y*y*(3-2*y),C=d+V*(.8*u),k=z+.6*S/Math.PI*(1-Math.cos(Math.PI*z/S)),b=C+L*1.25*k,I=(1-w)*B+w*(h*j),W=2.8*Math.sin(1.8*M+2.2*l)*l*w,H=2.4*Math.cos(1.5*M+1.8*l)*l*w,R=W+Math.cos(b)*I,U=(1-w)*(q+.022*B*B)+w*(q+v*l)+5.5*Math.sin(y*Math.PI)*l,G=H+Math.sin(b)*I;return T?(T.x=R,T.y=U,T.z=G,T):{x:R,y:U,z:G}}else if(M<u+S+P){const z=M-(u+S),y=z/P,w=1+.75*Math.sin(Math.PI*y)+.35*y,C=d+V*(.8*u),k=S+1.2*S/Math.PI,b=C+L*1.25*k,I=z-.2/2.4*(Math.cos(2.4*z)-1),W=b+L*1.1*I,H=h*j*w,R=2.8*Math.sin(1.8*(u+S)+2.2*l)*l*(1-.4*y),U=2.4*Math.cos(1.5*(u+S)+1.8*l)*l*(1-.4*y),G=R+Math.cos(W)*H,Q=q+v*l+(1-y)*2*l,se=U+Math.sin(W)*H;return T?(T.x=G,T.y=Q,T.z=se,T):{x:G,y:Q,z:se}}else{const z=M-(u+S+P),y=Math.min(1,z/F),w=d+V*(.8*u),C=S+1.2*S/Math.PI,k=w+L*1.25*C,b=P-.2/2.4*(Math.cos(2.4*P)-1),I=k+L*1.1*b,W=.85*z-.275*(z*z/F),H=I+L*1.1*W,R=h*j*(1-y)+B*y,U=(q+v*l)*(1-y)+(q+.022*B*B+3*(l-.5))*y,G=Math.cos(H)*R,Q=U,se=Math.sin(H)*R,O=.35*y+.65*Math.pow(y,2.2),K=(1-O)*G+O*a,m=(1-O)*Q+O*o,Y=(1-O)*se+O*i;return T?(T.x=K,T.y=m,T.z=Y,T):{x:K,y:m,z:Y}}}function $n(e,a,o,i,l,n,p,c,M,Z,T,h,d,D,u,S,P){const F=i*p+25,B=S*53.17%100/100*.3,q=Math.min(.75,Math.max(0,F*.015+B)),v=Math.max(0,e-q),A=Math.min(1,v/(u-q+1e-4));if(v<=0)return P?(P.x=i,P.y=l,P.z=n,P):{x:i,y:l,z:n};const X=S%3*2.094395,L=.15*(i*p)-2.8*a+X,z=(1.8+3.8*h)*Math.min(1,v/.8)*c,y=z*Math.sin(L),w=z*Math.cos(L),C=p*(z*.55*Math.sin(L*.5)),k=3.6+S*41.73%100/100*2,b=S*67.89%100/100*6.28318,I=k*a+b,W=p*(Math.sin(I)*(.8+1.1*T))*c,H=Math.abs(Math.cos(I))*(.95+1.45*h)*c,R=Math.sin(I*.75+b)*(1.3+1.8*T)*c,U=Math.sin(9.5*a+S*.35)*.4*c*Math.min(1,v),G=S*29.17%10>5?1:-1,Q=.12*(i*p)-3.8*a*G+S*31.41%100/100*6.28318,se=Math.sin(Math.PI*A),O=(3.2+6*h)*(M||0)*c*se,K=O*Math.sin(Q),m=O*Math.cos(Q),Y=p*(O*.35*Math.cos(Q*2));if(o>.82){const ee=(3.2+6*T)*c*(v*.85+.08*v*v),ae=(.35*Math.abs(Math.sin(I))+.1*Math.sin(a*10+S))*Math.min(1,v),ne=(.75*Math.sin(I*.6)+U+m*.25)*Math.min(1,v),oe=i+p*ee+W*.4+Y*.25,J=Math.max(l,l+ae),$=n+ne;return P?(P.x=oe,P.y=J,P.z=$,P):{x:oe,y:J,z:$}}else{const N=d*.5,ee=Math.min(1,Math.max(0,(A-N)/(1-N+1e-4))),ae=ee*ee*(3-2*ee),ne=S*83.11%100/100*2.4-1.2,oe=Math.max(2.4,4.2+8.5*T+3.8*h+ne),J=(v*oe+.45*v*v*(.4+.6*h))*c,$=S*93.41%100/100*2.8,le=(3+7.5*h+$)*c,ce=Math.max(0,le+y+H+U),ue=i+p*J+C+W+ae*Y,ge=Math.max(l,l+ae*(ce+K)),he=n+ae*(w+R+U+m);return P?(P.x=ue,P.y=ge,P.z=he,P):{x:ue,y:ge,z:he}}}function ma(e,a,o,i,l,n,p,c){const M=p||{},Z=M.blowDir!=null?M.blowDir:1,T=M.intensity!=null?M.intensity:1,h=M.swirl!=null?M.swirl:0,d=1,D=2,u=3.6,S=3.6,P=1.6,F=e*37.119%100/100,B=F<.22,q=e*19.417%100-50,v=e*29.831%100-50,A=B?q*.05:0,x=B?v*.04:0,X=-11,j=a+A,V=X+o*.03,L=i+x,z=.55+e*43.71%100/100*.9,y=.4+e*81.33%100/100*1.1,w=Math.pow(e*61.19%100/100,1.4)*.6;if(n<d){const C=n/d,k=C*C,b=Math.max(0,(C-.7)/.3),I=b*(2-b),W=(B?1.6:.5)*Math.sin(Math.PI*b)*(1-b),H=a+A*I,R=(1-k)*o+k*V+W,U=i+x*I;return c?(c.x=H,c.y=R,c.z=U,c):{x:H,y:R,z:U}}else{if(n<d+D)return c?(c.x=j,c.y=V,c.z=L,c):{x:j,y:V,z:L};if(n<d+D+u){const C=n-(d+D);return $n(C,n,F,j,V,L,Z,T,h,l,z,y,w,v,u,e,c)}else if(n<d+D+u+S){const C=(n-(d+D+u))/S,k=C*C*(3-2*C),b=u*(1-k);return $n(b,n,F,j,V,L,Z,T,h,l,z,y,w,v,u,e,c)}else{const C=Math.min(1,(n-(d+D+u+S))/P),k=C*C*(3-2*C),b=(1-k)*j+k*a,I=(1-k)*V+k*o,W=(1-k)*L+k*i;return c?(c.x=b,c.y=I,c.z=W,c):{x:b,y:I,z:W}}}}function pa(e,a,o,i,l,n,p,c,M,Z,T,h){const d=M!=null&&M>0?M:3,D=(1-Jn)*.82+.18,u=(2.8*Jn*.82+.18)/Math.max(.1,c),S=D+u*d*.78;let P;if(T<c){const v=T/c;P=((1-Math.exp(-2.8*v))*.82+.18*v)*p}else if(T<c+d){const v=T-c,A=v/Math.max(.01,d);P=(D+u*v*(1-.22*A))*p}else{const v=Math.min(1,Math.max(0,(T-(c+d))/Math.max(.1,Z))),A=Math.max(0,1-Math.pow(v,2.4));P=S*A*p}const F=e+i*P,B=a+l*P,q=o+n*P;return h?(h.x=F,h.y=B,h.z=q,h):{x:F,y:B,z:q}}function fa(e,a,o,i,l,n,p,c){const Z=Math.min(1,Math.max(0,n/7.5)),T=-48+96*Z,h=a+.25*o-T,d=9.2,D=Math.exp(-(h*h)/(2*d*d)),u=Math.sin(Math.PI*Z),S=D*(.35+.65*u),P=Math.PI*h/(2*d),F=Math.cos(P),B=Math.sin(P),q=16,v=.5+.5*Math.tanh(o/8),A=q*(F-.3*Math.sin(2*P)),x=5*v*Math.max(0,F),X=-3.5*v*Math.max(0,B),j=S*(A+x),V=S*(q*.14*B+X),L=-S*(q*.06)*B,z=a+L,y=o+V,w=i+j;return c?(c.x=z,c.y=y,c.z=w,c):{x:z,y,z:w}}function ha(e,a,o,i,l,n,p,c){const T=e*37.119%100/100,h=e*61.19%100/100,d=e*29.17%100/100,D=e*53.17%100/100,u=e*91.73%100/100,S=1.05+.04*Math.sin(.35*n),P=.07+.02*Math.cos(.3*n),F=Math.cos(S),B=Math.sin(S),q=Math.cos(P),v=Math.sin(P);let A=q,x=v,X=0,j=-v*B,V=q*B,L=F;const z=Math.sqrt(j*j+V*V+L*L)||1;j/=z,V/=z,L/=z;const y=x*L-X*V,w=X*j-A*L,C=A*V-x*j,k=p&&p.knotScale>0?p.knotScale:11,b=k*.62,I=k*.34,W=k*.15*(1+.03*Math.sin(1.2*n)),H=T*6.28318+.14*n*l,R=Math.sin(3*H),U=Math.cos(3*H),G=b+I*U,Q=Math.cos(2*H),se=Math.sin(2*H),O=G*Q,K=G*se,m=I*R,Y=-3*I*R*Q-2*G*se,N=-3*I*R*se+2*G*Q,ee=3*I*U,ae=O*A+K*j+m*y,ne=O*x+K*V+m*w,oe=O*X+K*L+m*C,J=Y*A+N*j+ee*y,$=Y*x+N*V+ee*w,le=Y*X+N*L+ee*C,ce=Math.sqrt(J*J+$*$+le*le)||1,ue=J/ce,ge=$/ce,he=le/ce,Fe=u*6.28318+.18*n*l,Ze=W*Math.sqrt(D),qe=y*ue+w*ge+C*he;let Ye=y-qe*ue,Be=w-qe*ge,Pe=C-qe*he;const Oe=Math.sqrt(Ye*Ye+Be*Be+Pe*Pe)||1;Ye/=Oe,Be/=Oe,Pe/=Oe;const Tt=ge*Pe-he*Be,Vt=he*Ye-ue*Pe,nt=ue*Be-ge*Ye,je=Math.cos(Fe),at=Math.sin(Fe),_e=ae+Ze*(je*Ye+at*Tt),We=ne+Ze*(je*Be+at*Vt),Ce=oe+Ze*(je*Pe+at*nt);let Ae,Ge,ie;if(n<3){let me=(n-h*.35)/2.65;me=Math.max(0,Math.min(1,me));const Te=me*me*me*(me*(me*6-15)+10),Se=.9*l*Math.sin(Math.PI*Te),pe=Math.cos(Se),Me=Math.sin(Se),xe=y*a+w*o+C*i,Ie=w*i-C*o,Ve=C*a-y*o,Ne=y*o-w*a,ke=a*pe+Ie*Me+y*xe*(1-pe),Ke=o*pe+Ve*Me+w*xe*(1-pe),Ue=i*pe+Ne*Me+C*xe*(1-pe);Ae=ke+(_e-ke)*Te,Ge=Ke+(We-Ke)*Te,ie=Ue+(Ce-Ue)*Te}else if(n<11.5)Ae=_e,Ge=We,ie=Ce;else{let me=(n-11.5-d*.25)/4.25;me=Math.max(0,Math.min(1,me));const Te=me*me*me*(me*(me*6-15)+10),Se=.9*l*Math.sin(Math.PI*Te),pe=Math.cos(Se),Me=Math.sin(Se),xe=y*_e+w*We+C*Ce,Ie=w*Ce-C*We,Ve=C*_e-y*Ce,Ne=y*We-w*_e,ke=_e*pe+Ie*Me+y*xe*(1-pe),Ke=We*pe+Ve*Me+w*xe*(1-pe),Ue=Ce*pe+Ne*Me+C*xe*(1-pe);Ae=ke+(a-ke)*Te,Ge=Ke+(o-Ke)*Te,ie=Ue+(i-Ue)*Te}const ot=Math.max(0,Math.min(1,(n-3)/(11.5-3))),gt=6.283185307179586*(ot*ot*ot*(ot*(ot*6-15)+10)),Ut=Math.cos(gt),Xt=Math.sin(gt),Zt=Ut*Ae+Xt*ie,it=-Xt*Ae+Ut*ie;return Ae=Zt,ie=it,c?(c.x=Ae,c.y=Ge,c.z=ie,c):{x:Ae,y:Ge,z:ie}}function ga(e,a,o,i,l,n,p,c){const u=p||{},S=u.mSweepX!=null?u.mSweepX:24,P=u.mSweepY!=null?u.mSweepY:4,F=u.mSweepZ!=null?u.mSweepZ:12,B=u.mFreqX!=null?u.mFreqX:3.456,q=u.mFreqY!=null?u.mFreqY:5.341,v=u.mFreqZ!=null?u.mFreqZ:2.827,A=u.mPhX!=null?u.mPhX:.4,x=u.mPhY!=null?u.mPhY:0,X=u.mPhZ!=null?u.mPhZ:1.2,j=u.mLaunchDir!=null?u.mLaunchDir:1,V=u.mTurnT!=null?u.mTurnT:99,L=u.mTurnDir!=null?u.mTurnDir:1,z=u.mSplitT!=null?u.mSplitT:99,y=u.mSplitAng!=null?u.mSplitAng:0,w=u.mDodge1T!=null?u.mDodge1T:3.9,C=u.mDodge2T!=null?u.mDodge2T:7.1,k=u.mDodge3T!=null?u.mDodge3T:99,b=u.mDodgeRad!=null?u.mDodgeRad:8,I=u.mDodgeStr!=null?u.mDodgeStr:1,W=u.mBoilAmp!=null?u.mBoilAmp:0,H=u.mBoilFreq!=null?u.mBoilFreq:14,R=u.mChurnMult!=null?u.mChurnMult:1,U=u.mFlutterMult!=null?u.mFlutterMult:1,G=u.mJinkAmp!=null?u.mJinkAmp:0,Q=u.mJinkFreq!=null?u.mJinkFreq:5.5,se=u.mJinkPh!=null?u.mJinkPh:0,O=u.mBreathAmp!=null?u.mBreathAmp:1,K=u.mScoutAmp!=null?u.mScoutAmp:0,m=11+O*(3.4*Math.sin(.85*9+.7)+1.7*Math.sin(1.65*9)),Y=S*Math.sin(B+A),N=P*Math.sin(q+x),ee=F*Math.sin(v+X),ae=Y*.25,ne=N*.25+1.5,oe=ee*.25,J=S*B/7,$=P*q/7,le=F*v/7,ce=J*Math.cos(B+A),ue=$*Math.cos(q+x)-1.346,ge=le*Math.cos(v+X),he=Math.sqrt(ce*ce+ue*ue+ge*ge)||1,Fe=ce/he,Ze=ue/he,qe=ge/he,Ye=.6*Math.min(1,he/10),Be=e*37.119%100/100,Pe=e*61.19%100/100,Oe=e*83.11%100/100,Tt=e*53.17%100/100,Vt=e*97.31%100/100,nt=Be*6.28318,je=Pe*6.28318,at=Oe*6.28318,_e=(j>0?a+50:50-a)*.017+Pe*.55,We=n-_e;if(We<=0)return c?(c.x=a,c.y=o,c.z=i,c):{x:a,y:o,z:i};let Ce=Math.min(1,We/.9);const Ae=Ce*Ce*(3-2*Ce),Ge=Math.sin(Ce*Math.PI)*2.2,ie=n*l,ot=Math.max(0,Math.min(1,(n-(V-.45))/.45)),Xn=Math.max(0,Math.min(1,(n-V)/.45)),gt=ot*(1-Xn),Ut=Math.max(0,Math.min(1,(n-(z-1))/.4)),Xt=Math.max(0,Math.min(1,(n-(z+.6))/.4)),Zt=Ut*(1-Xt);let it,me,Te,Se,pe,Me,xe,Ie,Ve;if(n<9){const te=Math.max(0,(n-2)/7);it=S*Math.sin(te*B+A),me=P*Math.sin(te*q+x)+3*Math.sin(te*Math.PI),Te=F*Math.sin(te*v+X);const _=G*Math.sin(Math.PI*te);it+=_*Math.sin(te*Q+se),me+=_*.6*Math.sin(te*Q*.83+se+1.7),Te+=_*Math.cos(te*Q*.91+se+3.1),Se=1,pe=11+O*(3.4*Math.sin(.85*n+.7)+1.7*Math.sin(1.65*n));const re=J*Math.cos(te*B+A),fe=$*Math.cos(te*q+x)+1.346*Math.cos(te*Math.PI),dt=le*Math.cos(te*v+X),vt=Math.sqrt(re*re+fe*fe+dt*dt)||1;Me=re/vt,xe=fe/vt,Ie=dt/vt,Ve=.6*Math.min(1,vt/10),Ve*=1+.55*gt}else if(n<12){const te=(n-9)/3,_=te*te*(3-2*te);it=Y*(1-.75*_),me=N*(1-.75*_)+1.5*_,Te=ee*(1-.75*_),Se=1-.7*_,pe=m*(1-.55*_),Me=Fe,xe=Ze,Ie=qe,Ve=Ye*(1-.75*_)}else{const te=n-12;Se=.3*(1-Math.min(1,te/2));let _=te/1.5;_=Math.min(1,_),_=_*_*(3-2*_);const re=1.6*Math.sin(ie*1.05+nt),fe=1+Math.sin(ie*.83+je),dt=1.2*Math.cos(ie*.95+at);it=ae+(re-ae)*_,me=ne+(fe-ne)*_,Te=oe+(dt-oe)*_,pe=m*.45,Me=Fe,xe=Ze,Ie=qe,Ve=Ye*.25*(1-Math.min(1,te/2))}const Ne=nt,ke=2*Pe-1,Ke=Math.sqrt(Math.max(0,1-ke*ke)),Ue=Math.sqrt(Oe),dn=1+.3*Math.sin(2.2*Ne+1.8*ke+.45*ie)+.16*Math.cos(3.3*Ne-2.4*ke+.62*ie);let wt=Ue*Ke*Math.cos(Ne)*pe*dn,bt=Ue*ke*.72*pe*dn,St=Ue*Ke*Math.sin(Ne)*pe*dn;const Zn=e*71.53%100/100,Yt=Math.floor(Zn*6),mn=pe/11,pn=(4.5+3*Be)*mn,Pa=pn*Math.sin(.71*Yt+.5*ie+Zn*6.28),Ra=pn*.7*Math.sin(1.13*Yt+.38*ie+Pe*6.28),Ea=pn*.8*Math.cos(.87*Yt+.45*ie+Oe*6.28),rt=wt,st=bt,fn=St,lt=wt*Me+bt*xe+St*Ie,Fa=wt-Me*lt,Ca=bt-xe*lt,ka=St-Ie*lt,La=Math.max(0,-lt),za=Math.max(0,Ue-.9)/.1,hn=(La*1.7+za*2.6)*Ve*(.55+.45*Tt)*mn,gn=1+Ve;wt=Fa*.8+Me*(lt*gn-hn),bt=Ca*.8+xe*(lt*gn-hn),St=ka*.8+Ie*(lt*gn-hn);let jt=R*5.6*Math.sin(.4*st+1.25*ie+nt),Wt=R*4.4*Math.sin(.48*rt-1.05*ie+je),Gt=R*4.8*Math.cos(.36*rt+.3*st+.9*ie+at);const Yn=8.5+4*Tt,jn=Math.sin(Yn*ie+nt);jt+=U*.5*jn,Wt+=U*1.3*jn,Gt+=U*.4*Math.sin(Yn*.87*ie+je),jt+=W*Math.sin(H*ie+1.9*st+je),Wt+=W*.8*Math.sin(H*.87*ie-1.6*rt+at),Gt+=W*Math.cos(H*.71*ie+1.3*(rt+st)+nt),jt*=Se,Wt*=Se,Gt*=Se;let Je=it+Pa+wt+jt,ct=me+Ra+bt+Wt,ut=Te+Ea+St+Gt;if(gt>0){const te=xe,_=-Me,re=Math.sqrt(te*te+_*_+.0025),fe=L*8*gt;Je+=te/re*fe,ct+=_/re*fe}if(Zt>0){const _=(Yt<3?1:-1)*7.5*Zt*mn;Je+=Math.cos(y)*_,ut+=Math.sin(y)*_}if(Vt>.93&&Se>.01&&K>0){const te=(1.55+1.3*Be)*Math.PI;let _=Math.sin(ie*te+Vt*40+je);if(_>0){_*=_,_*=_,_*=_;const re=Math.sqrt(rt*rt+st*st+fn*fn)||1,fe=K*(4+2.5*Oe)*_*Se;Je+=rt/re*fe,ct+=st/re*fe,ut+=fn/re*fe}}if(n>2&&n<9){let te=Math.max(0,Math.min(1,(n-(w-1.1))/.4));te*=1-Math.max(0,Math.min(1,(n-(w+1.1))/.4));let _=Math.max(0,Math.min(1,(n-(C-1.1))/.4));_*=1-Math.max(0,Math.min(1,(n-(C+1.1))/.4));let re=Math.max(0,Math.min(1,(n-(k-1.1))/.4));re*=1-Math.max(0,Math.min(1,(n-(k+1.1))/.4));const fe=Math.max(te,Math.max(_,re)),dt=re>=te&&re>=_?2:_>=te?1:0;if(fe>.001){const vt=Math.min(8.9,n*.92+1.1),Ht=Math.max(0,(vt-2)/7),vn=dt*2.094,qa=S*Math.sin(Ht*B+A)+5*Math.sin(1.7*n+1+vn),Ba=P*Math.sin(Ht*q+x)+3*Math.sin(Ht*Math.PI)+2*Math.sin(1.3*n+vn),Wn=F*Math.sin(Ht*v+X)+4*Math.sin(1.6*n+2+vn),Mn=Je-qa,xn=ct-Ba,Gn=Math.sqrt(Mn*Mn+xn*xn+(ut-Wn)*(ut-Wn)),yn=b;if(Gn<yn){const Hn=Gn/yn;let mt=Hn/.5;mt=Math.min(1,mt),mt=mt*mt*(3-2*mt);let pt=(Hn-.6)/.4;pt=Math.max(0,Math.min(1,pt)),pt=pt*pt*(3-2*pt);let Rt=xe,Et=-Me;const On=Math.sqrt(Rt*Rt+Et*Et+.0025);Rt/=On,Et/=On;const _n=(Mn*Rt+xn*Et)/yn*(mt*(1-pt))*7*I*fe*(.75+.5*Tt);Je+=Rt*_n,ct+=Et*_n}}}let At=Je,Dt=ct+Ge,Pt=ut;if(n>=12){const te=n-12,_=Pe*.5;let re=(te-_)/(2-_);re=Math.max(0,Math.min(1,re));const fe=re*re*re*(re*(re*6-15)+10);At=Je+(a-Je)*fe,Dt=ct+Ge+(o-ct-Ge)*fe,Pt=ut+(i-ut)*fe}return Ae<1&&(At=a+(At-a)*Ae,Dt=o+(Dt-o)*Ae,Pt=i+(Pt-i)*Ae),c?(c.x=At,c.y=Dt,c.z=Pt,c):{x:At,y:Dt,z:Pt}}const sn=8,Ja=40,$a=2.2,Qa=.9;function zn(e){const a=9+2.5*e,o=Math.min(Ja,12+7*e);return{speed:a,maxRadius:o,lifetime:o/a,decay:2.2-.3*e,width:2+.75*e}}function eo(){return new Float32Array(sn*4)}function to(e,a,o,i,l){const n=a*4;e[n]=o,e[n+1]=i,e[n+2]=0,e[n+3]=l}function no(e,a){for(let o=0;o<e.length;o+=4){if(e[o+3]<=0)continue;e[o+2]+=a;const i=zn(e[o+3]),l=e[o+2]*i.speed;(e[o+2]>i.lifetime||l>i.maxRadius)&&(e[o+3]=0)}}function En(e){for(let a=3;a<e.length;a+=4)if(e[a]>0)return!0;return!1}function ao(e,a,o,i,l){let n=0,p=0,c=0;for(let M=0;M<i.length;M+=4){const Z=i[M+3];if(Z<=0)continue;const T=i[M+2],h=zn(Z),d=e-i[M],D=a-i[M+1],u=Math.sqrt(d*d+D*D);if(u<1e-4)continue;const S=T*h.speed,P=1-Math.abs(u-S)/h.width;if(P<=0)continue;const F=Math.sin(Math.PI*P)*Math.exp(-h.decay*T)*Z,B=F*$a/u;n+=d*B,p+=D*B,c+=F*Qa}return l.x=n,l.y=p,l.z=c,l}const Qn=75,f={initialZ:35,cameraAngleDeg:Qn,zoomMin:10,zoomMax:200,fitMargin:56,zoomSpeed:.8,zoomLerp:.08,rotationStep:.03,rotationAutoReturnLerp:.02,autoReturnGracePeriodMs:300,canvasWidth:800,canvasHeight:150,fontSize:44,pixelStep:2,pixelThreshold:120,targetWorldWidth:80,emojiOptions:["😀","😂","😍","🥰","😎","🤔","😭","😡","😱","🥳","👍","👎","👏","🙏","👌","💪","❤️","🔥","✨","🎉"],emojiRasterSize:320,emojiPixelStep:2,emojiFontSize:280,emojiDensityOverride:1,emojiJitterXY:.03,emojiJitterZ:.5,emojiDepthCue:.06,emojiPointSize:1.6,emojiMotionMix:.35,emojiDepthRange:6,imageRasterSize:320,imagePixelStep:2,imageAlphaThreshold:16,imageJitterXY:.03,imageJitterZ:.5,imageDepthCue:.06,imagePointSize:1.2,imageDepthRange:5,density:8,jitterXY:.08,jitterZ:2.5,explosionSpeedMin:.4,explosionSpeedRange:.8,heatDistance:2/3*35*Math.tan(Qn*Math.PI/360),afterglowDuration:.2,mouseInfluence:6,rippleMoveSpeed:60,rippleEmitIntervalMs:90,rippleMoveAmpMin:.35,rippleMoveAmpMax:1.6,rippleMoveAmpDiv:300,rippleTapGraceMs:150,rippleChargeMs:1e3,rippleTapAmp:.8,rippleChargeAmp:4,chargeCancelPx:8,cursorChargeScale:3.4,springK:.12,springDamping:.82,tapCount:3,tapWindowMs:800,inputDebounceMs:150,pointSize:.5,pointSizeAttenuationScale:120,clearColor:131589,maxPixelRatio:2,themes:{ember:{hot:[1,.95,.75],warm:[1,.45,.05],cold:[.92,.18,.05]},arctic:{hot:[.92,.98,1],warm:[.18,.75,1],cold:[.05,.35,.88]},toxic:{hot:[.92,1,.4],warm:[.35,.95,.15],cold:[.06,.58,.22]},neon:{hot:[1,.92,.98],warm:[1,.08,.55],cold:[.35,.05,.88]},sakura:{hot:[1,.95,.96],warm:[1,.45,.65],cold:[.85,.18,.42]}},presets:{KINETIC:{description:"A 3D surf wave rolls through your message — luminous crest, deep blue troughs.",expansionDuration:3.75,contractionDuration:3.75,explosionMaxDistMultiplier:22,motionStyle:3,trailStrength:.7,emberBudget:0,soundPitch:45,soundDuration:7.5,soundType:"sine"},TORNADO:{description:"A four-phase vortex funnel — particles accrete, spiral upward, then dissolve.",expansionDuration:3.5,vortexDuration:4.5,equilibriumDuration:3.5,contractionDuration:3.5,explosionMaxDistMultiplier:26,motionStyle:1,spinSpeed:4.8,funnelHeight:46,funnelBottom:-22,funnelCrownRadius:22,funnelWaistRadius:4.5,funnelTailRadius:1.8,funnelWaistT:.38,funnelCrownT:.82,funnelFadeStart:.03,funnelFadeEnd:.3,trailStrength:.75,emberBudget:90,soundPitch:75,soundDuration:15,soundType:"sawtooth"},BREEZE:{description:"A wind field bends, rolls and disperses your message like leaves in a gust.",expansionDuration:1,contractionDuration:1.6,explosionMaxDistMultiplier:28,motionStyle:2,trailStrength:.6,emberBudget:0,soundPitch:95,soundDuration:11.8,soundType:"sine"},EXPLODE:{description:"A volumetric blast — particles burst outward, hang in the air, then rush home.",expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:36,motionStyle:0,trailStrength:.3,emberBudget:140,soundPitch:110,soundDuration:6.2,soundType:"sine"},TORUS:{description:"Gravity forges your message into a flowing torus knot of light around a black hole, then lets it rain back home.",expansionDuration:8,contractionDuration:4,explosionMaxDistMultiplier:30,motionStyle:4,trailStrength:.8,emberBudget:50,soundPitch:40,soundDuration:16,soundType:"sine"},MURMURATION:{description:"Your message takes flight — whip turns, split-and-merge waves, falcon strikes and startle sparks, then it settles home.",expansionDuration:2,contractionDuration:2,explosionMaxDistMultiplier:30,motionStyle:5,trailStrength:.7,emberBudget:60,soundPitch:70,soundDuration:14,soundType:"sine"},DEFAULT:{expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:15,motionStyle:-1,spokes:12,spokeJitter:.03,spinSpeed:0,funnelHeight:0,funnelBottom:0,funnelCrownRadius:0,funnelWaistRadius:0,funnelTailRadius:0,funnelWaistT:0,funnelCrownT:0,funnelFadeStart:0,funnelFadeEnd:0,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"}}};let He=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{He=e.matches});let ye=null;const oo=384;let en=0,De=null,qn={w:80,h:80};const io=`
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
`,ro=`
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
`,t={currentText:"Bring your message!",lastText:"Bring your message!",currentTheme:"ember",currentFont:"Outfit",messageMode:"text",activeImage:null,imageName:"",activePreset:null,lastRandomPreset:null,activeEmoji:null,lastEmoji:null,lastImage:null,lastImageName:"",audioEnabled:!0,gpuPhysics:!(typeof window<"u"&&(new URLSearchParams(window.location.search).get("noworker")==="1"||new URLSearchParams(window.location.search).get("gpu")==="0")),expansionDuration:f.presets.DEFAULT.expansionDuration,driftDuration:f.presets.DEFAULT.driftDuration||3,contractionDuration:f.presets.DEFAULT.contractionDuration,explosionMaxDistMultiplier:f.presets.DEFAULT.explosionMaxDistMultiplier,motionStyle:f.presets.DEFAULT.motionStyle,activeExpansionDuration:null,activeContractionDuration:null,activeMaxDist:null,actualTravelRadius:0,travelApplied:!1,embersSpawned:!1,dodgeEmbersFired:!1,afterglowStartTime:null,soundPitch:f.presets.DEFAULT.soundPitch,soundDuration:f.presets.DEFAULT.soundDuration,soundType:f.presets.DEFAULT.soundType,trailStrength:f.presets.DEFAULT.trailStrength,pattern:{spokes:f.presets.DEFAULT.spokes,spokeJitter:f.presets.DEFAULT.spokeJitter,spinSpeed:f.presets.DEFAULT.spinSpeed,funnelHeight:f.presets.DEFAULT.funnelHeight,funnelBottom:f.presets.DEFAULT.funnelBottom,funnelCrownRadius:f.presets.DEFAULT.funnelCrownRadius,funnelWaistRadius:f.presets.DEFAULT.funnelWaistRadius,funnelTailRadius:f.presets.DEFAULT.funnelTailRadius,funnelWaistT:f.presets.DEFAULT.funnelWaistT,funnelCrownT:f.presets.DEFAULT.funnelCrownT,funnelFadeStart:f.presets.DEFAULT.funnelFadeStart,funnelFadeEnd:f.presets.DEFAULT.funnelFadeEnd,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"},heatCold:[.1,.4,1],heatWarm:[1,1,.1],heatHot:[1,.1,.1],get totalExplosionDuration(){const e=s&&s.activeStyle>=0?s.activeStyle:this.motionStyle;if(e===1){const l=this.expansionDuration||3.5,n=this.pattern&&this.pattern.vortexDuration?this.pattern.vortexDuration:4.5,p=this.pattern&&this.pattern.equilibriumDuration?this.pattern.equilibriumDuration:3.5,c=this.contractionDuration||3.5;return l+n+p+c}if(e===2)return 11.8;if(e===3)return 7.5;if(e===4)return 16;if(e===5)return 14;const a=this.activeExpansionDuration||this.expansionDuration,o=this.activeContractionDuration||this.contractionDuration;return a+(e===0||e===-1?3:0)+o}},r={scene:null,camera:null,renderer:null,particles:null,clock:new Ia,trailPoints:null,trailData:null,trailLive:null,trailPosAttr:null,trailLiveAttr:null,emberPoints:null,emberData:null,emberVel:null,emberLife:null,emberPosAttr:null,emberLifeAttr:null,targetZ:f.initialZ,autoFit:!0,prevTime:0,prevDt:0,prevKFrame:0,prevDampFrame:0},s={posHome:null,posLive:null,explosionOrigin:null,springDisp:null,springVel:null,randomDir:null,randomSpeed:null,funnelT:null,funnelRadialX:null,funnelRadialZ:null,activeStyle:-1,slots:[],sendQueue:[],seq:0,sourceGeneration:0,motionToken:0,explosionStartTime:-1,positionsDirty:!1,randomized:null};function so(){return typeof window<"u"&&new URLSearchParams(window.location.search).get("noworker")==="1"?15e3:ye||t.gpuPhysics?3e4:15e3}const g={keys:{ArrowUp:!1,ArrowDown:!1,ArrowLeft:!1,ArrowRight:!1,"+":!1,"-":!1,"=":!1," ":!1},mouseWorld:new Re,mouseLocal:new Re,invMatrix:new Wa,mouseWorldPos:new Re(-1e3,-1e3,0),lastClickTime:0,lastPinchDist:null,lastMidpoint:new ja,lastGestureEndTime:0,inputDebounceTimer:null,toastTimer:null,flashTimer:null,drawerCloseTimer:null,wordmarkTimer:null,menuRestoreDesktop:!1,menuRestoreMobile:!1,isDragging:!1,prevMouseX:0,prevMouseY:0,pendingPointer:null,charge:{active:!1,pointerId:-1,x0:0,y0:0,t0:0,value:0,release:null},tapRing:{pending:null,x:0,y:0,age:0,count:0,active:!1}},de={el:null,elInner:null,stageEl:null,x:0,y:0,visible:!1,scale:1};function ea(e){de.el&&(de.x=e.clientX,de.y=e.clientY,de.el.style.transform=`translate3d(${de.x}px, ${de.y}px, 0)`)}const be=eo(),we={idx:0,lastEmitMs:0,prevCX:0,prevCY:0,hasPrevClient:!1,speedU:0},_t={x:0,y:0,z:0},$e=new Re;function Fn(e,a,o){to(be,we.idx,e,a,o),we.idx=(we.idx+1)%sn}function lo(){be.fill(0)}const E={uMouse:{value:new Re(-1e3,-1e3,0)},uMouseInfluence:{value:f.mouseInfluence},uPointSize:{value:f.pointSize},uPixelRatio:{value:1},uPointScale:{value:f.pointSizeAttenuationScale/f.initialZ},uDepthCue:{value:.28},uColorHot:{value:new Re(1,0,0)},uColorWarm:{value:new Re(1,1,0)},uColorCold:{value:new Re(1,1,1)},uExplosionActive:{value:0},uTornadoActive:{value:0},uTornadoFadeStart:{value:.03},uTornadoFadeEnd:{value:.3},uHeatDistance:{value:f.heatDistance},uHeatCold:{value:new Re(.1,.4,1)},uHeatWarm:{value:new Re(1,1,.1)},uHeatHot:{value:new Re(1,.1,.1)},uAudioMid:{value:0},uAudioHigh:{value:0},uAudioEnvelope:{value:0},uPointSizeTrail:{value:.4},uTrailStrength:{value:.25},uEmojiMode:{value:0},uEmojiMotionMix:{value:f.emojiMotionMix},uUseSourceTexture:{value:0},uSourceTexture:{value:null},uGpuPhysics:{value:1},uMotionStyle:{value:0},uExplosionElapsed:{value:-1},uExpDuration:{value:2},uDriftDuration:{value:3},uContractionDuration:{value:2},uMaxDist:{value:35},uSpinSpeed:{value:5.2},uFunnelBottom:{value:-22},uFunnelHeight:{value:46},uFunnelCrownRadius:{value:22},uFunnelWaistRadius:{value:3.5},uFunnelTailRadius:{value:.8},uFunnelWaistT:{value:.42},uFunnelCrownExp:{value:1.4},uBreezeBlowDir:{value:1},uBreezeIntensity:{value:1},uBreezeSwirl:{value:0},uMSweepX:{value:24},uMSweepY:{value:4},uMSweepZ:{value:12},uMFreqX:{value:3.456},uMFreqY:{value:5.341},uMFreqZ:{value:2.827},uMPhX:{value:.4},uMPhY:{value:0},uMPhZ:{value:1.2},uMLaunchDir:{value:1},uMTurnT:{value:99},uMTurnDir:{value:1},uMSplitT:{value:99},uMSplitAng:{value:0},uMDodge1T:{value:3.9},uMDodge2T:{value:7.1},uMDodge3T:{value:99},uMDodgeRad:{value:8},uMDodgeStr:{value:1},uMBoilAmp:{value:0},uMBoilFreq:{value:14},uMChurnMult:{value:1},uMFlutterMult:{value:1},uMJinkAmp:{value:0},uMJinkFreq:{value:5.5},uMJinkPh:{value:0},uMBreathAmp:{value:1},uMScoutAmp:{value:0},uKnotScale:{value:11},uRipples:{value:Array.from({length:sn},()=>new Nn(0,0,0,0))},uTapRing:{value:new Nn(0,0,0,0)}};let Nt=0,Cn=null,wn=0,bn=0;function tt(e,a="info"){const o=document.getElementById("toast");o&&(o.textContent=e,o.classList.remove("info","success","error"),o.classList.add(a==="success"||a==="error"?a:"info"),o.classList.add("show"),clearTimeout(g.toastTimer),g.toastTimer=setTimeout(()=>{o.classList.remove("show")},3e3))}function It(e){const a=document.getElementById("sr-announce");a&&(a.textContent=e)}function co(){const e=document.getElementById("flash");e&&(e.classList.remove("active"),e.offsetWidth,e.classList.add("active"),clearTimeout(g.flashTimer),g.flashTimer=setTimeout(()=>e.classList.remove("active"),120))}let Ee=null,Ct=null,Qe=null,ft=null;function uo(){Ee&&Ct||(Ee||(Ee=new(window.AudioContext||window.webkitAudioContext)),Ct=Ee.createGain(),Ct.gain.value=1,Qe=Ee.createAnalyser(),Qe.fftSize=256,Qe.smoothingTimeConstant=.6,Ct.connect(Qe),Qe.connect(Ee.destination),ft=new Uint8Array(Qe.frequencyBinCount))}function Sn(e,a,o,i){let l=0,n=0;const p=Math.max(0,Math.floor(a*i)),c=Math.min(i,Math.floor(o*i));for(let M=p;M<c;M++)l+=e[M]/255,n++;return n?l/n:0}function mo(){if(!Qe||!Ee||!ft)return;if(Ee.state!=="running"){E.uAudioEnvelope.value=0;return}if(s.explosionStartTime<0&&E.uAudioEnvelope.value<.005&&E.uAudioMid.value<.005&&E.uAudioHigh.value<.005){E.uAudioMid.value=0,E.uAudioHigh.value=0,E.uAudioEnvelope.value=0;return}Qe.getByteFrequencyData(ft);const e=ft.length,a=Sn(ft,.02,.25,e),o=Sn(ft,.25,.55,e),i=Sn(ft,.55,.92,e);E.uAudioMid.value+=(o-E.uAudioMid.value)*.5,E.uAudioHigh.value+=(i-E.uAudioHigh.value)*.5;const l=Math.min(1,a*1.3+o*.5+i*.6);E.uAudioEnvelope.value+=(l-E.uAudioEnvelope.value)*.6}function po(e){try{if(uo(),!Ee)return;const a=Ee.currentTime,o=Math.max(.3,e*.55),i=Ee.createOscillator();i.type="sine",i.frequency.setValueAtTime(85,a),i.frequency.exponentialRampToValueAtTime(32,a+o);const l=Ee.createGain();l.gain.setValueAtTime(1e-4,a),l.gain.exponentialRampToValueAtTime(.16,a+Math.min(.25,o*.3)),l.gain.exponentialRampToValueAtTime(1e-4,a+o),i.connect(l),l.connect(Ct),i.start(a),i.stop(a+o+.05),setTimeout(()=>{try{i.disconnect(),l.disconnect()}catch{}},(o+.1)*1e3)}catch(a){console.warn("Rumble synthesis error:",a)}}async function va(e){if(!e)return;const a=`bold ${f.fontSize}px "${e}"`;try{await document.fonts.load(a)}catch(o){console.warn(`Font load note for "${e}":`,o)}}let Kt=null,ta=null;function fo(e){Kt||(Kt=document.createElement("canvas"),ta=Kt.getContext("2d",{willReadFrequently:!0}));const a=Kt,o=ta;a.width=f.canvasWidth,a.height=f.canvasHeight,o.fillStyle="black",o.fillRect(0,0,f.canvasWidth,f.canvasHeight),o.fillStyle="white",o.font=`bold ${f.fontSize}px "${t.currentFont}", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,f.canvasWidth/2,f.canvasHeight/2);const i=o.getImageData(0,0,f.canvasWidth,f.canvasHeight).data,l=f.canvasWidth,n=f.canvasHeight,p=f.pixelStep,c=f.pixelThreshold;let M=0,Z=1/0,T=-1/0,h=1/0,d=-1/0;for(let B=0;B<n;B+=p)for(let q=0;q<l;q+=p)i[(B*l+q)*4]>c&&(M++,q<Z&&(Z=q),q>T&&(T=q),B<h&&(h=B),B>d&&(d=B));if(M===0)return null;const D=f.targetWorldWidth/Math.max(T-Z,1),u=(Z+T)/2,S=(h+d)/2,P=new Float32Array(M*3);let F=0;for(let B=0;B<n;B+=p)for(let q=0;q<l;q+=p)i[(B*l+q)*4]>c&&(P[F++]=(q-u)*D,P[F++]=(S-B)*D,P[F++]=0);return P}let Jt=null,na=null;function ho(e){if(!e)return null;const a=e.naturalWidth||e.width,o=e.naturalHeight||e.height;if(!a||!o)return null;Jt||(Jt=document.createElement("canvas"),na=Jt.getContext("2d",{willReadFrequently:!0}));const i=f.imageRasterSize,l=Jt,n=na;l.width=i,l.height=i,n.clearRect(0,0,i,i),n.imageSmoothingEnabled=!0;const p=Math.round(i*.04),c=Math.min((i-p*2)/a,(i-p*2)/o),M=Math.max(1,Math.round(a*c)),Z=Math.max(1,Math.round(o*c)),T=Math.round((i-M)/2),h=Math.round((i-Z)/2);n.drawImage(e,T,h,M,Z);const d=n.getImageData(0,0,i,i).data,D=f.imagePixelStep,u=f.imageAlphaThreshold,S=[],P=[],F=[],B=[],q=[];let v=1/0,A=-1/0,x=1/0,X=-1/0;const j=(m,Y)=>m<0||Y<0||m>=i||Y>=i?0:d[(Y*i+m)*4+3];for(let m=0;m<i;m+=D)for(let Y=0;Y<i;Y+=D){const N=(m*i+Y)*4,ee=d[N+3];if(ee<=u)continue;S.push(Y,m),P.push(d[N],d[N+1],d[N+2]),F.push(ee),B.push(1);const ae=j(Y-D,m)<=u||j(Y+D,m)<=u||j(Y,m-D)<=u||j(Y,m+D)<=u;q.push(ae),Y<v&&(v=Y),Y>A&&(A=Y),m<x&&(x=m),m>X&&(X=m)}if(S.length===0)return null;const V=Math.max(A-v,1),L=Math.max(X-x,1),z=f.targetWorldWidth/Math.max(V,L),y=(v+A)/2,w=(x+X)/2,k=f.imageDepthRange*.5,b=S.length/2,I=[],W=[],H=[],R=[],U=[];for(let m=0;m<b;m+=8){const Y=S[m*2],N=S[m*2+1];I.push((Y-y)*z,(w-N)*z,-k),W.push(Y/i,1-N/i),H.push(P[m*3],P[m*3+1],P[m*3+2]),R.push(F[m]),U.push(B[m])}for(let m=0;m<b;m++){if(!q[m])continue;const Y=S[m*2],N=S[m*2+1],ee=P[m*3],ae=P[m*3+1],ne=P[m*3+2],oe=F[m],J=B[m],$=Y/i,le=1-N/i,ce=(Y-y)*z,ue=(w-N)*z;I.push(ce,ue,-k*.33),W.push($,le),H.push(ee,ae,ne),R.push(oe),U.push(J),I.push(ce,ue,k*.33),W.push($,le),H.push(ee,ae,ne),R.push(oe),U.push(J)}for(let m=0;m<b;m++){const Y=S[m*2],N=S[m*2+1];I.push((Y-y)*z,(w-N)*z,k),W.push(Y/i,1-N/i),H.push(P[m*3],P[m*3+1],P[m*3+2]),R.push(F[m]),U.push(B[m])}const G=new Float32Array(I),Q=new Float32Array(W),se=new Uint8Array(H),O=new Uint8Array(R),K=new Uint8Array(U);return{flat:G,uvs:Q,colors:se,covers:O,sizes:K,featureCount:b,frontCount:b,bounds:{w:V,h:L},sourceCanvas:l}}let $t=null,aa=null;function go(e){$t||($t=document.createElement("canvas"),aa=$t.getContext("2d",{willReadFrequently:!0}));const a=$t,o=aa,i=f.emojiRasterSize;a.width=i,a.height=i,o.clearRect(0,0,i,i),o.fillStyle="white",o.font=`${f.emojiFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,i/2,i/2+i*.02);const l=o.getImageData(0,0,i,i).data,n=f.emojiPixelStep,p=f.pixelThreshold,c=[],M=[],Z=[],T=[];let h=1/0,d=-1/0,D=1/0,u=-1/0;const S=(b,I)=>b<0||I<0||b>=i||I>=i?0:l[(I*i+b)*4+3];for(let b=0;b<i;b+=n)for(let I=0;I<i;I+=n){const W=(b*i+I)*4,H=l[W+3];if(H<=p)continue;c.push(I,b),M.push(l[W],l[W+1],l[W+2]),Z.push(H);const R=S(I-n,b)<=p||S(I+n,b)<=p||S(I,b-n)<=p||S(I,b+n)<=p;T.push(R),I<h&&(h=I),I>d&&(d=I),b<D&&(D=b),b>u&&(u=b)}if(c.length===0)return null;const P=f.targetWorldWidth/Math.max(d-h,1),F=(h+d)/2,B=(D+u)/2,v=f.emojiDepthRange*.5,A=c.length/2,x=[],X=[],j=[],V=[],L=[];for(let b=0;b<A;b+=4){const I=c[b*2],W=c[b*2+1];x.push((I-F)*P,(B-W)*P,-v),X.push(I/i,1-W/i),j.push(M[b*3],M[b*3+1],M[b*3+2]),V.push(Z[b]),L.push(1)}for(let b=0;b<A;b++){if(!T[b])continue;const I=c[b*2],W=c[b*2+1],H=M[b*3],R=M[b*3+1],U=M[b*3+2],G=Z[b],Q=I/i,se=1-W/i,O=(I-F)*P,K=(B-W)*P;x.push(O,K,-v*.33),X.push(Q,se),j.push(H,R,U),V.push(G),L.push(1),x.push(O,K,v*.33),X.push(Q,se),j.push(H,R,U),V.push(G),L.push(1)}for(let b=0;b<A;b++){const I=c[b*2],W=c[b*2+1];x.push((I-F)*P,(B-W)*P,v),X.push(I/i,1-W/i),j.push(M[b*3],M[b*3+1],M[b*3+2]),V.push(Z[b]),L.push(1)}const z=new Float32Array(x),y=new Float32Array(X),w=new Uint8Array(j),C=new Uint8Array(V),k=new Uint8Array(L);return{flat:z,uvs:y,colors:w,covers:C,sizes:k,featureCount:A,frontCount:A,bounds:{w:d-h,h:u-D},sourceCanvas:a}}let An=0;async function ze(e,a=!1){An++;const o=An;await va(t.currentFont);const i=`bold ${f.fontSize}px "${t.currentFont}"`;if(!document.fonts.check(i))try{await document.fonts.load(i)}catch(m){console.warn(`Failed to pre-load custom font "${t.currentFont}":`,m)}if(o!==An)return;s.sourceGeneration++,s.motionToken++,s.randomized=null;const l=!!r.particles;let n=null;if(l){const m=r.particles.geometry.attributes.position;n=m?m.array:null}const p=t.messageMode==="emoji"&&t.activeEmoji&&f.emojiOptions.includes(t.activeEmoji),c=t.messageMode==="image"&&!!t.activeImage,M=p?go(e):null,Z=c?ho(t.activeImage):null,T=M||Z,h=!!T,d=T?T.flat:c?null:fo(e);if(!d){tt(c?"The image has no visible pixels!":"Text must contain at least one visible character!","error");return}const{jitterXY:D,jitterZ:u,explosionSpeedMin:S,explosionSpeedRange:P}=f,F=h?f.emojiDensityOverride:f.density;let B=d.length/3,q=1;const v=so(),A=Math.floor(v/F);let x=d,X=null,j=null,V=null,L=null;if(h){if(X=T.colors,j=T.covers,V=T.sizes,L=T.uvs||null,B>v){const m=[],Y=T.frontCount||B;if(Y<=v){for(let le=0;le<Y;le++)m.push(le);const J=v-Y,$=B-Y;if(J>0&&$>0){const le=Math.max(1,Math.ceil($/J));for(let ce=Y;ce<B&&m.length<v;ce+=le)m.push(ce)}}else{const J=Math.ceil(Y/v);for(let $=0;$<Y&&m.length<v;$+=J)m.push($)}const N=new Float32Array(m.length*3),ee=new Uint8Array(m.length*3),ae=new Uint8Array(m.length),ne=new Uint8Array(m.length),oe=L?new Float32Array(m.length*2):null;for(let J=0;J<m.length;J++){const $=m[J];N[J*3]=x[$*3],N[J*3+1]=x[$*3+1],N[J*3+2]=x[$*3+2],ee[J*3]=X[$*3],ee[J*3+1]=X[$*3+1],ee[J*3+2]=X[$*3+2],ae[J]=j[$],ne[J]=V[$],oe&&L&&(oe[J*2]=L[$*2],oe[J*2+1]=L[$*2+1])}x=N,X=ee,j=ae,V=ne,L=oe,B=m.length}}else B*F>v&&(q=Math.max(1,Math.ceil(B/A)));const y=Math.ceil(B/q)*F;s.posHome=new Float32Array(y*3),s.posLive=new Float32Array(y*3),s.explosionOrigin=new Float32Array(y*3),s.springDisp=new Float32Array(y*3),s.springVel=new Float32Array(y*3),s.randomDir=new Float32Array(y*3),s.randomSpeed=new Float32Array(y),s.funnelT=new Float32Array(y),s.funnelRadialX=new Float32Array(y),s.funnelRadialZ=new Float32Array(y);const w=Math.PI*(3-Math.sqrt(5));for(let m=0;m<y;m++){const Y=(m*.6180339887498949+.5)%1,N=.75+.3*((m*.7548776662466927+.17)%1),ee=m*w%(Math.PI*2);s.funnelT[m]=Math.pow(Y,.85),s.funnelRadialX[m]=Math.cos(ee)*N,s.funnelRadialZ[m]=Math.sin(ee)*N}const C=new Uint8Array(y*4),k=new Uint8Array(y),b=new Float32Array(y*2),I=p?{xy:f.emojiJitterXY,z:f.emojiJitterZ}:{xy:f.imageJitterXY,z:f.imageJitterZ},W=h?I.xy:D,H=h?I.z:u;let R=0;for(let m=0;m<B;m+=q,R++){const Y=x[m*3],N=x[m*3+1],ee=x[m*3+2];for(let ae=0;ae<F;ae++){const ne=R*F+ae,oe=ne*3,J=oe+1,$=oe+2,le=Y+(Math.random()-.5)*W,ce=N+(Math.random()-.5)*W,ue=ee+(Math.random()-.5)*H;s.posHome[oe]=le,s.posHome[J]=ce,s.posHome[$]=ue;const ge=a?(Math.random()-.5)*45:0,he=a?(Math.random()-.5)*45:0,Fe=a?(Math.random()-.5)*35:0;s.posLive[oe]=le+ge,s.posLive[J]=ce+he,s.posLive[$]=ue+Fe,s.springDisp[oe]=ge,s.springDisp[J]=he,s.springDisp[$]=Fe;const Ze=Math.random()*Math.PI*2,qe=Math.acos(Math.random()*2-1);s.randomDir[oe]=Math.sin(qe)*Math.cos(Ze),s.randomDir[J]=Math.sin(qe)*Math.sin(Ze),s.randomDir[$]=Math.cos(qe),s.randomSpeed[ne]=S+Math.random()*P,X?(C[ne*4]=X[m*3],C[ne*4+1]=X[m*3+1],C[ne*4+2]=X[m*3+2],C[ne*4+3]=j[m],k[ne]=V[m],L&&(b[ne*2]=L[m*2],b[ne*2+1]=L[m*2+1])):(C[ne*4]=255,C[ne*4+1]=255,C[ne*4+2]=255,C[ne*4+3]=255,k[ne]=1,b[ne*2]=0,b[ne*2+1]=0)}}qn=Co(),r.autoFit&&Bt(),l&&!a&&n&&n.length===s.posLive.length&&(s.posLive.set(n),s.springDisp.fill(0),s.springVel.fill(0)),s.explosionOrigin.set(s.posLive),s.slots=[],s.sendQueue=[];for(let m=0;m<2;m++){const Y={posLive:new Float32Array(y*3),springDisp:new Float32Array(y*3),springVel:new Float32Array(y*3),inFlight:!1,needsReset:!1};Y.posLive.set(s.posLive),Y.springDisp.set(s.springDisp),Y.springVel.set(s.springVel),s.slots.push(Y)}const U=!r.particles,G=U?new Dn:r.particles.geometry,Q=new ve(s.posLive,3);Q.setUsage(Ft),G.setAttribute("position",Q),G.setAttribute("homePosition",new ve(s.posHome,3)),G.setAttribute("sourceColor",new ve(C,4,!0)),G.setAttribute("sampleSize",new ve(k,1)),G.setAttribute("funnelT",new ve(s.funnelT,1)),G.setAttribute("aSourceUV",new ve(b,2)),kn();const se=new Float32Array(y),O=new Float32Array(y*3),K=new Float32Array(y);for(let m=0;m<y;m++)se[m]=m,O[m*3]=s.funnelRadialX[m],O[m*3+1]=0,O[m*3+2]=s.funnelRadialZ[m],K[m]=m%2===0?1:-1;if(G.setAttribute("aRandomDir",new ve(new Float32Array(s.randomDir),3)),G.setAttribute("aRandomSpeed",new ve(new Float32Array(s.randomSpeed),1)),G.setAttribute("aIndex",new ve(se,1)),G.setAttribute("aSeed",new ve(O,3)),G.setAttribute("aCustomDir",new ve(K,1)),U){const m=new Pn({uniforms:E,vertexShader:io,fragmentShader:ro,blending:an,depthWrite:!1,transparent:!0});r.particles=new Rn(G,m),r.scene.add(r.particles)}if(E.uEmojiMode.value=h?1:0,E.uPointSize.value=p?f.emojiPointSize:c?f.imagePointSize:f.pointSize,E.uDepthCue.value=p?f.emojiDepthCue:c?f.imageDepthCue:.28,r.particles.material.blending=h?Za:an,r.particles.material.needsUpdate=!0,E.uSourceTexture.value&&(E.uSourceTexture.value.dispose(),E.uSourceTexture.value=null),h&&T&&T.sourceCanvas){const m=new Ya(T.sourceCanvas);m.minFilter=Kn,m.magFilter=Kn,m.needsUpdate=!0,E.uSourceTexture.value=m,E.uUseSourceTexture.value=1}else E.uUseSourceTexture.value=0;r.particles.rotation.set(0,0,0),ye&&ye.postMessage({type:"init",data:{posHome:s.posHome.slice(),explosionOrigin:s.explosionOrigin.slice(),randomDir:s.randomDir.slice(),randomSpeed:s.randomSpeed.slice(),funnelT:s.funnelT.slice(),funnelRadialX:s.funnelRadialX.slice(),funnelRadialZ:s.funnelRadialZ.slice()}}),vo()}function vo(){const e=s.posLive.length;r.trailData=new Float32Array(e),r.trailLive=new Float32Array(e),r.trailData.set(s.posLive),r.trailLive.set(s.posLive);const a=new ve(r.trailData,3);a.setUsage(Ft);const o=new ve(r.trailLive,3);o.setUsage(Ft),r.trailPoints&&(r.scene.remove(r.trailPoints),r.trailPoints.geometry.dispose(),r.trailPoints.material.dispose());const i=new Dn;i.setAttribute("position",a),i.setAttribute("livePosition",o),i.setAttribute("homePosition",new ve(s.posHome,3)),i.setAttribute("funnelT",new ve(s.funnelT,1)),r.trailPoints=new Rn(i,new Pn({uniforms:E,vertexShader:Ga,fragmentShader:Ha,blending:an,depthWrite:!1,transparent:!0})),r.trailPoints.frustumCulled=!1,r.scene.add(r.trailPoints),r.trailPosAttr=a,r.trailLiveAttr=o;const l=300;r.emberData=new Float32Array(l*3),r.emberVel=new Float32Array(l*3),r.emberLife=new Float32Array(l),r.emberCount=l;const n=new ve(r.emberData,3);n.setUsage(Ft);const p=new ve(r.emberLife,1);p.setUsage(Ft),r.emberPoints&&(r.scene.remove(r.emberPoints),r.emberPoints.geometry.dispose(),r.emberPoints.material.dispose());const c=new Dn;c.setAttribute("position",n),c.setAttribute("aLife",p),r.emberPoints=new Rn(c,new Pn({uniforms:{},vertexShader:Oa,fragmentShader:_a,blending:an,depthWrite:!1,transparent:!0})),r.emberPoints.renderOrder=2,r.scene.add(r.emberPoints),r.emberPosAttr=n,r.emberLifeAttr=p}function Mo(){if(!r.particles||!r.trailData)return;if(He&&r.trailPoints){r.trailPoints.visible=!1;return}if(t.gpuPhysics&&s.explosionStartTime>=0){r.trailPoints&&(r.trailPoints.visible=!1);return}if(r.trailPoints&&(r.trailPoints.visible=!0),s.positionsDirty||s.explosionStartTime>=0||g.isDragging||g.mouseLocal&&g.mouseLocal.x>-500||En(be))r.trailSettleFrames=0;else{if(r.trailSettleFrames>=20)return;r.trailSettleFrames=(r.trailSettleFrames||0)+1}s.positionsDirty=!1;const a=r.particles.geometry.attributes.position.array,o=r.trailData,i=r.trailLive,l=.22;for(let n=0;n<a.length;n++)o[n]+=(a[n]-o[n])*l,i[n]=a[n];r.trailPosAttr.needsUpdate=!0,r.trailLiveAttr.needsUpdate=!0}function xo(){if(!r.emberData||!r.particles||He)return;const e=t.activePreset&&f.presets[t.activePreset]||null,a=e&&e.emberBudget||90,o=Math.min(r.emberCount,a),i=r.particles.geometry.attributes.position.array,l=s.explosionOrigin||s.posHome,n=i.length,p=[];for(let c=0;c<n/3;c++){const M=c*3,Z=i[M]-l[M],T=i[M+1]-l[M+1],h=i[M+2]-l[M+2];Z*Z+T*T+h*h>1&&p.push(c)}if(p.length!==0)for(let c=0;c<o;c++){const M=c*3,T=p[Math.random()*p.length|0]*3;r.emberData[M]=i[T],r.emberData[M+1]=i[T+1],r.emberData[M+2]=i[T+2];const h=i[T]-l[T],d=i[T+1]-l[T+1],D=i[T+2]-l[T+2],u=Math.sqrt(h*h+d*d+D*D)||1,S=3+Math.random()*14;r.emberVel[M]=h/u*S+(Math.random()-.5)*4,r.emberVel[M+1]=d/u*S+(Math.random()-.5)*4,r.emberVel[M+2]=D/u*S*.5+(Math.random()-.5)*2,r.emberLife[c]=.35+Math.random()*.45}}function yo(e,a){const o=e||{},i=o.mSweepX!=null?o.mSweepX:24,l=o.mSweepY!=null?o.mSweepY:4,n=o.mSweepZ!=null?o.mSweepZ:12,p=o.mFreqX!=null?o.mFreqX:3.456,c=o.mFreqY!=null?o.mFreqY:5.341,M=o.mFreqZ!=null?o.mFreqZ:2.827,Z=o.mPhX!=null?o.mPhX:.4,T=o.mPhY!=null?o.mPhY:0,h=o.mPhZ!=null?o.mPhZ:1.2,d=Math.min(8.9,a*.92+1.1),D=Math.max(0,(d-2)/7);return{x:i*Math.sin(D*p+Z)+5*Math.sin(1.7*a+1),y:l*Math.sin(D*c+T)+3*Math.sin(D*Math.PI)+2*Math.sin(1.3*a),z:n*Math.sin(D*M+h)+4*Math.sin(1.6*a+2)}}function To(e){if(!r.emberData||!r.emberPoints||He)return;const a=t.activePreset&&f.presets[t.activePreset]||null,o=a&&a.emberBudget||60,i=Math.min(r.emberCount,o),l=yo(t.pattern,e);for(let n=0;n<i;n++){const p=n*3;r.emberData[p]=l.x+(Math.random()-.5)*1.6,r.emberData[p+1]=l.y+(Math.random()-.5)*1.6,r.emberData[p+2]=l.z+(Math.random()-.5)*1.6;let c=Math.random()*2-1,M=Math.random()*2-1,Z=Math.random()*2-1;const T=Math.sqrt(c*c+M*M+Z*Z)||1,h=5+Math.random()*8;r.emberVel[p]=c/T*h,r.emberVel[p+1]=M/T*h+3,r.emberVel[p+2]=Z/T*h,r.emberLife[n]=.35+Math.random()*.45}r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0}function wo(e){if(!r.emberData)return;if(He&&r.emberPoints){r.emberPoints.visible=!1;return}r.emberPoints&&(r.emberPoints.visible=!0);const a=r.emberCount,o=Math.pow(.02,e);let i=0;for(let l=0;l<a;l++){if(r.emberLife[l]<=0)continue;i++;const n=l*3;r.emberData[n]+=r.emberVel[n]*e,r.emberData[n+1]+=r.emberVel[n+1]*e,r.emberData[n+2]+=r.emberVel[n+2]*e,r.emberVel[n+1]-=8*e,r.emberVel[n]*=o,r.emberVel[n+1]*=o,r.emberVel[n+2]*=o,r.emberLife[l]-=e,r.emberLife[l]<=0&&(r.emberLife[l]=0)}i>0&&(r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0)}const kt=new Re;function Bn(e,a){const o=r.renderer.domElement.getBoundingClientRect(),i=(e-o.left)/o.width*2-1,l=-((a-o.top)/o.height)*2+1;r.camera.isOrthographicCamera&&(kt.set(i,l,0).unproject(r.camera),g.mouseWorld.copy(kt),g.mouseWorld.z=0)}function oa(e,a,o){const i=r.renderer.domElement.getBoundingClientRect(),l=(e-i.left)/i.width*2-1,n=-((a-i.top)/i.height)*2+1;r.camera.isOrthographicCamera&&(kt.set(l,n,0).unproject(r.camera),o.set(kt.x,kt.y,0).applyMatrix4(g.invMatrix))}function kn(){if(!s.randomDir||!s.randomSpeed)return;const e=s.randomSpeed.length,{explosionSpeedMin:a,explosionSpeedRange:o}=f,i=t.pattern,l=s.posHome,n=typeof t.motionStyle=="number"&&t.motionStyle>=0?t.motionStyle:Math.floor(Math.random()*4);if(n===1){const A=Math.random()<.5?1:-1,x=(3.8+Math.random()*2.8)*A,X=38+Math.random()*16,j=18+Math.random()*12,V=2.4+Math.random()*2.8,L=.8+Math.random()*1.6,z=.32+Math.random()*.16,y=1.15+Math.random()*.65;t.pattern={...t.pattern,spinSpeed:x,funnelHeight:X,funnelCrownRadius:j,funnelWaistRadius:V,funnelTailRadius:L,funnelWaistT:z,funnelCrownExp:y}}Nt++;const p=[1.35,1.85,.9,2.2],M=p[Nt%p.length]*(.92+Math.random()*.16),T=(Nt%2===1?!0:Math.random()<.5)?1:-1;let h=T,d=(Math.random()-.5)*.08,D=(Math.random()-.5)*.05;const u=Math.sqrt(h*h+d*d+D*D)||1;h/=u,d/=u,D/=u;const S=[0,.85,1.45,.35,0,1.2],P=S[Nt%S.length],F=P===0?0:P*(.85+Math.random()*.3);De={blowDir:T,intensity:M,swirl:F,windAngleY:(Math.random()-.5)*.22,windAngleZ:(Math.random()-.5)*.12,strengthMult:M,easePower:1.45+Math.random()*.4,seedXi:Math.random()*100,peakX:(Math.random()-.5)*22,peakY:3.5+Math.random()*5,peakAmp:(16+Math.random()*7)*M,peakWidthX:.065+Math.random()*.025,peakWidthY:.11+Math.random()*.035,creaseY:-(3.5+Math.random()*4),creaseAmp:6.5+Math.random()*3,creaseFreq:.11+Math.random()*.04,billowAmp1:7.5+Math.random()*3,billowAmp2:3+Math.random()*2,depthAmp:13+Math.random()*4.5,turbAmp:3+Math.random()*1.8,shearMult:.22+Math.random()*.18},s.breeze=De;const B=Math.max(2,i.spokes||12),q=i.spokeJitter!=null?i.spokeJitter:.03,v=Math.PI*(3-Math.sqrt(5));for(let A=0;A<e;A++){const x=A*3,X=x+1,j=x+2;let V,L,z;if(n===1){const w=l[x],C=l[j],k=w*w+C*C;let b,I;if(k>1e-6){const H=1/Math.sqrt(k);b=-C*H,I=w*H}else{const H=Math.random()*Math.PI*2;b=Math.cos(H),I=Math.sin(H)}const W=Math.random()<.5?1:-1;V=b*W+(Math.random()-.5)*.15,L=.72+(Math.random()-.5)*.12,z=I*W+(Math.random()-.5)*.15}else if(n===2){h=T,d=(Math.random()-.5)*.04,D=(Math.random()-.5)*.04;const w=Math.hypot(h,d,D)||1;h/=w,d/=w,D/=w,V=h*.92+(Math.random()*2-1)*.08,L=(Math.random()*2-1)*.12,z=(Math.random()*2-1)*.12}else if(n===3){const w=A%B,C=w*v,k=Math.acos(Math.max(-1,Math.min(1,1-2*(w+.5)/B))),b=Math.sin(k)*Math.cos(C),I=Math.sin(k)*Math.sin(C),W=Math.cos(k);V=b+(Math.random()-.5)*2*q,L=I+(Math.random()-.5)*2*q,z=W+(Math.random()-.5)*2*q}else{const w=Math.random()*Math.PI*2,C=Math.acos(Math.random()*2-1);V=Math.sin(C)*Math.cos(w),L=Math.sin(C)*Math.sin(w),z=Math.cos(C)}const y=Math.sqrt(V*V+L*L+z*z)||1;if(V/=y,L/=y,z/=y,n===2)s.randomSpeed[A]=(a+Math.random()*o)*(1.4+Math.random()*.9);else if(n===3)s.randomSpeed[A]=(a+Math.random()*o)*(1.5+Math.random()*.7);else{const w=.75+Math.random()*.55;s.randomSpeed[A]=(a+Math.random()*o)*w}s.randomDir[x]=V,s.randomDir[X]=L,s.randomDir[j]=z}if(s.randomized={dirs:s.randomDir.slice(0,oo*3),style:n},s.activeStyle=n,r.particles&&r.particles.geometry){const A=r.particles.geometry.attributes.aRandomDir;A&&A.array&&A.array.length===s.randomDir.length&&(A.copyArray(s.randomDir),A.needsUpdate=!0);const x=r.particles.geometry.attributes.aRandomSpeed;x&&x.array&&x.array.length===s.randomSpeed.length&&(x.copyArray(s.randomSpeed),x.needsUpdate=!0)}}function bo(){if(!r.particles||!s.explosionOrigin)return;const e=r.particles.geometry.attributes.position.array;if(e.length===s.explosionOrigin.length){s.explosionOrigin.set(e),s.posLive.set(e),s.springDisp.fill(0),s.springVel.fill(0),s.motionToken++;for(const a of s.slots)a.inFlight?a.needsReset=!0:((!a.posLive||!a.posLive.buffer||a.posLive.buffer.byteLength===0)&&(a.posLive=new Float32Array(e.length),a.springDisp=new Float32Array(e.length),a.springVel=new Float32Array(e.length)),a.posLive.set(e),a.springDisp.fill(0),a.springVel.fill(0),a.needsReset=!1)}}function Ma(e){document.querySelectorAll(".preset-chip").forEach(o=>{o.disabled=e,o.classList.toggle("disabled",e),e?o.setAttribute("aria-disabled","true"):o.removeAttribute("aria-disabled")})}function zt(e=!1){if(s.explosionStartTime>=0)return;if(s.explosionStartTime=-1,bo(),t.actualTravelRadius=0,t.travelApplied=!1,t.embersSpawned=!1,t.dodgeEmbersFired=!1,t.afterglowStartTime=null,en=0,t.motionStyle===5){const l=Math.random()<.55?4.3+Math.random()*2:99;let n=l<90?99:3.3+Math.random()*2.6;if(l<90){const Z=l-1.4,T=l+1.4;let h=3.3+Math.random()*2.6;h>Z&&h<T&&(h=h<l?Math.max(3.3,Z-.8*Math.random()):Math.min(5.9,T+.8*Math.random()),h>Z&&h<T&&(h=99)),n=h}const p=3.25+Math.random()*.55,c=p+1.35+Math.random()*.7;let M=99;if(Math.random()<.45){const Z=c+1.35+Math.random()*.5;M=Z<=6.95?Z:99}t.pattern={...t.pattern,mSweepX:16+Math.random()*14,mSweepY:3.5+Math.random()*4,mSweepZ:8+Math.random()*8,mFreqX:2.8+Math.random()*1.2,mFreqY:4.6+Math.random()*1.4,mFreqZ:2.2+Math.random()*1.2,mPhX:Math.random()*6.283,mPhY:Math.random()*6.283,mPhZ:Math.random()*6.283,mLaunchDir:Math.random()<.5?1:-1,mTurnT:n,mTurnDir:Math.random()<.5?1:-1,mSplitT:l,mSplitAng:Math.random()*6.283,mDodge1T:p,mDodge2T:c,mDodge3T:M,mDodgeRad:6.5+Math.random()*3,mDodgeStr:.85+Math.random()*.6,mBoilAmp:1.4+Math.random()*.8,mBoilFreq:11+Math.random()*3,mChurnMult:1.2+Math.random()*.6,mFlutterMult:1.25+Math.random()*.6,mJinkAmp:2.5+Math.random()*1.7,mJinkFreq:4.5+Math.random()*2.5,mJinkPh:Math.random()*6.283,mBreathAmp:1.25+Math.random()*.65,mScoutAmp:.85+Math.random()*.45}}t.activeMaxDist=t.explosionMaxDistMultiplier*(.8+Math.random()*.4),t.activeExpansionDuration=t.expansionDuration*(.85+Math.random()*.3),t.activeContractionDuration=t.contractionDuration||4;const a=t.activeContractionDuration;t.gpuPhysics?kn():ye?ye.postMessage({type:"randomize",data:{explosionSpeedMin:f.explosionSpeedMin,explosionSpeedRange:f.explosionSpeedRange,motionStyle:t.motionStyle,pattern:t.pattern,breeze:De,explosionOrigin:s.explosionOrigin.slice(),motionToken:s.motionToken,sourceGeneration:s.sourceGeneration}}):kn(),s.explosionStartTime=r.clock.getElapsedTime(),Ma(!0),Xo();const o=t.activePreset||t.lastRandomPreset,i=o&&f.presets[o]?f.presets[o]:null;un(i&&i.description?i.description:cn(t.messageMode)),(t.motionStyle===0||t.motionStyle===-1)&&co(),t.audioEnabled&&Ka(t,a),It(`Explosion triggered for "${t.currentText}"`)}function qt(e,a,o,i=!0){const l=new URL(window.location);l.searchParams.set("t",e),l.searchParams.set("theme",a),l.searchParams.set("font",o),i?window.history.pushState({},"",l):window.history.replaceState({},"",l)}function In(e){t.activeExpansionDuration=null,t.activeContractionDuration=null,t.expansionDuration=e.expansionDuration,t.driftDuration=e.driftDuration!==void 0?e.driftDuration:0,t.contractionDuration=e.contractionDuration,t.explosionMaxDistMultiplier=e.explosionMaxDistMultiplier,t.motionStyle=e.motionStyle!=null?e.motionStyle:-1,s.activeStyle=t.motionStyle,t.soundPitch=e.soundPitch,t.soundDuration=e.soundDuration,t.soundType=e.soundType,t.trailStrength=e.trailStrength!=null?e.trailStrength:.25,t.pattern={spokes:e.spokes!=null?e.spokes:12,spokeJitter:e.spokeJitter!=null?e.spokeJitter:.03,spinSpeed:e.spinSpeed!=null?e.spinSpeed:0,funnelHeight:e.funnelHeight!=null?e.funnelHeight:0,funnelBottom:e.funnelBottom!=null?e.funnelBottom:0,funnelCrownRadius:e.funnelCrownRadius!=null?e.funnelCrownRadius:0,funnelWaistRadius:e.funnelWaistRadius!=null?e.funnelWaistRadius:0,funnelTailRadius:e.funnelTailRadius!=null?e.funnelTailRadius:0,funnelWaistT:e.funnelWaistT!=null?e.funnelWaistT:0,funnelCrownT:e.funnelCrownT!=null?e.funnelCrownT:0,funnelFadeStart:e.funnelFadeStart!=null?e.funnelFadeStart:0,funnelFadeEnd:e.funnelFadeEnd!=null?e.funnelFadeEnd:0,vortexDuration:e.vortexDuration!=null?e.vortexDuration:4.5,equilibriumDuration:e.equilibriumDuration!=null?e.equilibriumDuration:3.5,swayAmp:e.swayAmp!=null?e.swayAmp:0,swayFreq:e.swayFreq!=null?e.swayFreq:0,gustAmp:e.gustAmp!=null?e.gustAmp:0,gustFreq:e.gustFreq!=null?e.gustFreq:0,windDrift:e.windDrift!=null?e.windDrift:0,turbulence:e.turbulence!=null?e.turbulence:0};const a=f.themes[t.currentTheme]||f.themes.ember;t.heatCold=a.cold,t.heatWarm=a.warm,t.heatHot=a.hot,E.uHeatCold.value.set(...t.heatCold),E.uHeatWarm.value.set(...t.heatWarm),E.uHeatHot.value.set(...t.heatHot),E.uTornadoFadeStart.value=t.pattern.funnelFadeStart,E.uTornadoFadeEnd.value=t.pattern.funnelFadeEnd,E.uTrailStrength.value=t.trailStrength}function xt(){In(f.presets.DEFAULT)}function xa(){if(s.explosionStartTime>=0||t.activePreset)return;const e=Object.keys(f.presets).filter(o=>o!=="DEFAULT"),a=e[Math.floor(Math.random()*e.length)];In(f.presets[a]),t.lastRandomPreset=a}function tn(e,a=!0){const o=f.themes[e]||f.themes.ember;t.currentTheme=e,E.uColorHot.value.set(...o.hot),E.uColorWarm.value.set(...o.warm),E.uColorCold.value.set(...o.cold),E.uHeatHot.value.set(...o.hot),E.uHeatWarm.value.set(...o.warm),E.uHeatCold.value.set(...o.cold),document.querySelectorAll(".theme-swatch").forEach(i=>{const l=i.getAttribute("data-theme")===e;i.classList.toggle("active",l),i.setAttribute("aria-pressed",l?"true":"false")}),qt(t.currentText,t.currentTheme,t.currentFont,a),It(`Theme changed to ${e}`)}async function ya(e,a=!0,o=!1){t.currentFont=e,document.querySelectorAll("#font-select, #drawer-font-select").forEach(i=>{i.value=e}),t.messageMode!=="text"&&(t.messageMode="text",ht("text")),t.activeEmoji&&(t.activeEmoji=null,Xe(null)),await va(e),await ze(t.currentText,o),qt(t.currentText,t.currentTheme,t.currentFont,a),It(`Font changed to ${e}`)}async function Ta(e,a=!0){const o=e.trim(),i=o.length>0?o:"Bring your message!";t.currentText=i,t.messageMode==="text"&&(t.lastText=i),await ze(i,!1),qt(t.currentText,t.currentTheme,t.currentFont,a),It(`Text updated to "${t.currentText}"`)}function Vn(e){const a=document.querySelectorAll(".char-counter");if(!a.length)return;const o=[...e].length;a.forEach(i=>{i.textContent=`${o}/25`,i.classList.remove("warning","danger"),o>=25?i.classList.add("danger"):o>=20&&i.classList.add("warning")})}async function Ln(e,a=!1){In(f.presets[e]||f.presets.DEFAULT),a&&await ze(t.currentText,!0)}const So="#drawer, #menu-toggle-btn, #drawer-backdrop, #dock, #topbar, #input-bar, #hint, #toast",ln=e=>!!e.target.closest(So);function Ao(e){if(ln(e))return;if(e.pointerType==="mouse"&&(g.isDragging=!0,g.prevMouseX=e.clientX,g.prevMouseY=e.clientY),e.pointerType==="touch"&&!e.isPrimary){g.charge.active=!1,g.charge.release=null;return}s.explosionStartTime<0&&(g.charge.active=!0,g.charge.pointerId=e.pointerId,g.charge.x0=e.clientX,g.charge.y0=e.clientY,g.charge.t0=performance.now(),g.charge.value=0,g.charge.release=null);const a=performance.now();g.clickCount=a-g.lastClickTime<f.tapWindowMs?g.clickCount+1:1,g.lastClickTime=a,g.clickCount<f.tapCount&&s.explosionStartTime<0&&(g.tapRing.pending={clientX:e.clientX,clientY:e.clientY,count:g.clickCount}),g.clickCount>=f.tapCount&&(xa(),zt(),g.clickCount=0)}function Do(e){if(!ln(e)){if(e.touches.length===1)Bn(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const a=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY;g.lastPinchDist=Math.sqrt(a*a+o*o),g.lastMidpoint.set((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2)}}}function Po(e){if(!ln(e)){if(e.preventDefault(),e.touches.length===1)Bn(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const a=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY,i=Math.sqrt(a*a+o*o);g.lastPinchDist&&(r.targetZ-=(i-g.lastPinchDist)*.15,r.autoFit=!1),g.lastPinchDist=i;const l=(e.touches[0].clientX+e.touches[1].clientX)/2,n=(e.touches[0].clientY+e.touches[1].clientY)/2;r.particles&&(r.particles.rotation.y+=(l-g.lastMidpoint.x)*.005,r.particles.rotation.x+=(n-g.lastMidpoint.y)*.005),g.lastMidpoint.set(l,n)}}}function ia(e){if(e.pointerType==="mouse"&&(g.isDragging=!1),g.charge.active&&e.pointerId===g.charge.pointerId){if(g.charge.active=!1,e.type==="pointercancel")return;const a=performance.now()-g.charge.t0,o=Math.min(1,Math.max(0,(a-f.rippleTapGraceMs)/f.rippleChargeMs));g.charge.release={clientX:g.charge.x0,clientY:g.charge.y0,charge:o}}}function Ro(){g.lastPinchDist=null,g.lastGestureEndTime=performance.now()}function Bt(){const e=document.getElementById("stage"),a=Math.max(e.clientWidth,1),o=Math.max(e.clientHeight,1);r.camera.aspect=a/o;const i=r.camera.position.z*Math.tan(f.cameraAngleDeg*Math.PI/360),l=i*r.camera.aspect;r.camera.left=-l,r.camera.right=l,r.camera.top=i,r.camera.bottom=-i,r.camera.updateProjectionMatrix(),r.renderer.setSize(a,o,!1);const n=Math.min(window.devicePixelRatio,f.maxPixelRatio);r.renderer.setPixelRatio(n),E.uPixelRatio.value=n,r.autoFit&&(r.targetZ=ko(a,o))}function Eo(){const e=document.getElementById("topbar");return e?e.getBoundingClientRect().height:0}function Fo(){const e=document.getElementById("dock");if(e){if(e.classList.contains("collapsed")){const i=e.firstElementChild;return(i?i.getBoundingClientRect().height:0)+24}const o=e.getBoundingClientRect();if(o.height>0)return o.height}const a=document.getElementById("input-bar");if(a){const o=a.getBoundingClientRect();if(o.height>0)return o.height}return 0}function Co(){const e=s.posHome;if(!e||e.length===0)return{w:80,h:80};let a=1/0,o=-1/0,i=1/0,l=-1/0;for(let c=0;c<e.length;c+=3){const M=e[c],Z=e[c+1];M<a&&(a=M),M>o&&(o=M),Z<i&&(i=Z),Z>l&&(l=Z)}const n=o-a,p=l-i;return!isFinite(n)||!isFinite(p)||n<1e-6||p<1e-6?{w:80,h:80}:{w:n,h:p}}function ko(e,a){const o=Math.tan(f.cameraAngleDeg*Math.PI/360),i=qn,l=f.fitMargin,n=Math.max(e-2*l,1),p=Math.max(a-(Eo()+l)-(Fo()+l),1),c=i.w*a/(2*o*n),M=i.h*a/(2*o*p);return Math.min(f.zoomMax,Math.max(c,M,f.zoomMin))}const Lo="Type a message — your words become thousands of glowing particles.",zo="Pick an emoji — it bursts into thousands of glowing, colorful particles.",qo="Upload an image — its pixels become thousands of glowing particles.";function cn(e){return e==="emoji"?zo:e==="image"?qo:Lo}function un(e){const a=document.getElementById("context-line");a&&(a.textContent=e);const o=document.getElementById("mobile-context-line");o&&(o.textContent=e)}function nn(e){t.activePreset=e,document.querySelectorAll(".preset-chip").forEach(i=>{i.getAttribute("data-text")===e?i.classList.add("active"):i.classList.remove("active")});const o=f.presets[e];un(o&&o.description?o.description:cn(t.messageMode))}function et(){t.activePreset=null,document.querySelectorAll(".preset-chip").forEach(a=>{a.classList.remove("active")}),un(cn(t.messageMode))}function Xe(e){document.querySelectorAll(".emoji-chip").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-emoji")===e)})}function ht(e){const a=e==="emoji"||e==="image"?e:"text";t.messageMode=a,document.querySelectorAll(".message-option").forEach(i=>{const l=i.getAttribute("data-message-mode")===a;i.classList.toggle("active",l),i.setAttribute("aria-selected",l?"true":"false")}),document.querySelectorAll(".text-message-mode").forEach(i=>{i.hidden=a!=="text"}),document.querySelectorAll(".emoji-message-mode").forEach(i=>{i.hidden=a!=="emoji"}),document.querySelectorAll(".image-message-mode").forEach(i=>{i.hidden=a!=="image"});const o=document.getElementById("input-bar");o&&(o.style.display=a==="text"?"":"none")}function ra(){r.particles&&(r.scene.remove(r.particles),r.particles=null),r.trailPoints&&(r.trailPoints.visible=!1),r.emberPoints&&(r.emberPoints.visible=!1),s.posHome=new Float32Array(0),s.posLive=new Float32Array(0),s.explosionOrigin=new Float32Array(0),s.springDisp=new Float32Array(0),s.springVel=new Float32Array(0),s.randomDir=new Float32Array(0),s.randomSpeed=new Float32Array(0),s.funnelT=new Float32Array(0),s.funnelRadialX=new Float32Array(0),s.funnelRadialZ=new Float32Array(0),s.slots=[],s.sendQueue=[],s.sourceGeneration++,s.motionToken++,qn={w:80,h:80}}async function Bo(e){if(ht(e),et(),xt(),t.messageMode==="emoji"){t.activeImage=null;const a=t.lastEmoji&&f.emojiOptions.includes(t.lastEmoji)?t.lastEmoji:null;a?(t.activeEmoji=a,Xe(a),on(a),await ze(a,!1),qt(a,t.currentTheme,t.currentFont,!0)):(t.activeEmoji=null,Xe(null),ra())}else if(t.messageMode==="image"){t.activeEmoji=null,Xe(null);const a=document.querySelectorAll(".image-name");t.lastImage?(t.activeImage=t.lastImage,a.forEach(o=>{o.textContent=t.lastImageName}),await ze(t.currentText,!1)):(t.activeImage=null,a.forEach(o=>{o.textContent="No file chosen"}),ra())}else{t.activeEmoji=null,t.activeImage=null,Xe(null);const a=t.lastText&&t.lastText.trim()||"Bring your message!";t.currentText=a,on(a),await ze(a,!1),qt(t.currentText,t.currentTheme,t.currentFont,!0)}}function Io(e){if(!e)return;if(!e.type.startsWith("image/")){tt("Please choose an image file!","error");return}const a=URL.createObjectURL(e),o=new Image;o.onload=async()=>{URL.revokeObjectURL(a),ht("image"),t.activeImage=o,t.lastImage=o,t.lastImageName=e.name,t.imageName=e.name,t.activeEmoji=null,Xe(null),et(),xt(),document.querySelectorAll(".image-name").forEach(i=>{i.textContent=e.name}),await ze(t.currentText,!1),It(`Image uploaded: ${e.name}`)},o.onerror=()=>{URL.revokeObjectURL(a),tt("Could not read that image!","error")},o.src=a}const Vo=1e3;function sa(){clearTimeout(g.drawerCloseTimer),g.drawerCloseTimer=setTimeout(yt,Vo)}function wa(){clearTimeout(g.drawerCloseTimer)}function ba(){const e=document.getElementById("drawer"),a=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");wa(),e&&e.classList.add("open"),a&&a.classList.add("active"),o&&o.setAttribute("aria-expanded","true")}function yt(){const e=document.getElementById("drawer"),a=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");wa(),e&&e.classList.remove("open"),a&&a.classList.remove("active"),o&&o.setAttribute("aria-expanded","false")}function Uo(){const e=document.getElementById("drawer");e&&e.classList.contains("open")?yt():ba()}function Sa(){const e=document.getElementById("dock");if(!e||e.classList.contains("collapsed"))return!1;e.classList.add("collapsed");const a=document.getElementById("dock-toggle-btn");return a&&(a.setAttribute("aria-expanded","false"),a.title="Expand controls"),!0}function Aa(){const e=document.getElementById("dock");if(!e)return;e.classList.remove("collapsed");const a=document.getElementById("dock-toggle-btn");a&&(a.setAttribute("aria-expanded","true"),a.title="Collapse controls")}function Un(){r.autoFit&&(Bt(),setTimeout(()=>{r.autoFit&&Bt()},460))}function Xo(){const e=document.getElementById("dock");g.menuRestoreDesktop=!!(e&&!e.classList.contains("collapsed")),Sa();const a=document.getElementById("drawer");g.menuRestoreMobile=!!(a&&a.classList.contains("open")),yt(),Un()}function Zo(){g.menuRestoreMobile&&(g.menuRestoreMobile=!1,ba()),g.menuRestoreDesktop&&(g.menuRestoreDesktop=!1,Aa()),Un()}function on(e){document.querySelectorAll("#text-input, #mobile-text-input").forEach(a=>{a.value=e}),Vn(e)}function la(e){ht("text"),et(),t.activeEmoji=null,t.activeImage=null,Xe(null),xt(),Vn(e),clearTimeout(g.inputDebounceTimer),g.inputDebounceTimer=setTimeout(async()=>{await Ta(e)},f.inputDebounceMs)}function Yo(){r.renderer.render(r.scene,r.camera),r.renderer.domElement.toBlob(e=>{if(!e)return;const a=URL.createObjectURL(e),o=document.createElement("a"),i=(t.messageMode==="image"&&t.imageName?t.imageName:t.currentText).replace(/[^a-z0-9]/gi,"_").toLowerCase();o.download=`artz-sculpture-${i||"kinetic"}.png`,o.href=a,o.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)},"image/png")}async function jo(){try{const e=new URLSearchParams;t.activeEmoji?e.set("t",t.activeEmoji):t.messageMode==="text"&&t.currentText&&e.set("t",t.currentText),t.currentTheme&&t.currentTheme!=="ember"&&e.set("theme",t.currentTheme),t.currentFont&&t.currentFont!=="Outfit"&&e.set("font",t.currentFont),t.activePreset&&e.set("preset",t.activePreset);const a=e.toString(),o=`${window.location.origin}${window.location.pathname}${a?"?"+a:""}`;if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(o);else{const i=document.createElement("input");i.value=o,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i)}tt("Link copied to clipboard!","success")}catch{tt("Could not copy link","error")}}function Wo(){t.audioEnabled=!t.audioEnabled,document.querySelectorAll(".audio-btn").forEach(e=>{e.setAttribute("aria-pressed",t.audioEnabled.toString()),e.title=t.audioEnabled?"Toggle Sound (Mute/Unmute)":"Sound: MUTED (Click to unmute)"}),document.querySelectorAll(".audio-icon").forEach(e=>{e.textContent=(t.audioEnabled,"??")}),tt(t.audioEnabled?"?? Sound effects enabled":"?? Sound effects muted")}function rn(){const e=document.getElementById("hint");e&&e.classList.add("dismissed");try{localStorage.setItem("artz-hint-seen","1")}catch{}}function Go(){const e=document.getElementById("text-input"),a=document.getElementById("mobile-text-input"),o=document.getElementById("menu-toggle-btn"),i=document.getElementById("menu-close-btn"),l=document.getElementById("drawer-backdrop"),n=document.getElementById("drawer"),p=document.getElementById("dock-toggle-btn"),c=document.getElementById("hint-dismiss"),M=document.getElementById("wordmark");if(M){const d=[{cls:"is-rippling",ms:1400},{cls:"is-playing",ms:1800},{cls:"is-dropping",ms:1600},{cls:"is-imploding",ms:1700}],D=700,u=()=>d.map(q=>q.cls),S=q=>{M.setAttribute("aria-label",q?"KINETICS — click to play title animation":"KINETICS — click to stop the title animation"),M.title=q?"Click to play":"Click to stop"};let P=!1,F=0;const B=()=>{const q=d[F];F=(F+1)%d.length,M.classList.remove(...u()),M.offsetWidth,M.classList.add(q.cls),g.wordmarkTimer=setTimeout(B,q.ms+D)};M.addEventListener("click",()=>{He||(P=!P,clearTimeout(g.wordmarkTimer),P?(F=0,S(!1),B()):(S(!0),M.classList.remove(...u())))})}o&&o.addEventListener("click",()=>{Uo()}),i&&i.addEventListener("click",()=>{yt()}),l&&l.addEventListener("click",()=>{yt()}),n&&(n.addEventListener("click",d=>{d.target.closest(".message-option")||d.target.closest("select")||sa()}),n.querySelectorAll("select").forEach(d=>{d.addEventListener("change",sa)})),p&&p.addEventListener("click",()=>{const d=document.getElementById("dock");d&&(d.classList.contains("collapsed")?Aa():Sa(),Un())}),c&&c.addEventListener("click",rn);try{localStorage.getItem("artz-hint-seen")==="1"&&rn()}catch{}Cn=document.getElementById("status-fps");const Z=document.getElementById("status-gpu");Z&&(Z.textContent=t.gpuPhysics?"GPU":ye?"WORKER":"CPU"),un(cn(t.messageMode)),e&&(e.value=t.currentText,Vn(t.currentText),e.addEventListener("input",()=>{a&&a.value!==e.value&&(a.value=e.value),la(e.value)})),a&&(a.value=t.currentText,a.addEventListener("input",()=>{e&&e.value!==a.value&&(e.value=a.value),la(a.value)})),document.querySelectorAll(".message-option").forEach(d=>{d.addEventListener("click",()=>{Bo(d.getAttribute("data-message-mode"))})}),document.querySelectorAll(".image-input").forEach(d=>{d.addEventListener("change",()=>{Io(d.files&&d.files[0]),d.value=""})}),document.querySelectorAll(".theme-swatch").forEach(d=>{d.addEventListener("click",()=>{et(),xt(),tn(d.getAttribute("data-theme"))})}),document.querySelectorAll("#font-select, #drawer-font-select").forEach(d=>{d.value=t.currentFont,d.addEventListener("change",async()=>{et(),xt(),await ya(d.value)})}),document.querySelectorAll(".capture-btn").forEach(d=>{d.addEventListener("click",Yo)}),document.querySelectorAll(".share-btn").forEach(d=>{d.addEventListener("click",jo)}),document.querySelectorAll(".audio-btn").forEach(d=>{d.addEventListener("click",Wo)}),document.querySelectorAll(".preset-chip").forEach(d=>{d.addEventListener("click",async()=>{if(s.explosionStartTime>=0)return;const D=d.getAttribute("data-text");await Ln(D),nn(D),zt()})}),document.querySelectorAll(".emoji-chip").forEach(d=>{d.addEventListener("click",async()=>{const D=d.getAttribute("data-emoji");D&&(ht("emoji"),et(),xt(),t.activeEmoji=D,t.lastEmoji=D,Xe(D),on(D),await Ta(D))})})}function ca(){if(ye){try{ye.terminate()}catch{}ye=null;for(const e of s.slots)e.inFlight=!1;s.sendQueue.length=0}}const Lt=[1,1.25,1.5,2];let Ho={level:Lt.length-1,slowStreak:0,fastStreak:0};function ua(e){const a=Math.min(window.devicePixelRatio,Lt[e]);r.renderer.setPixelRatio(a),E.uPixelRatio.value=a}function Oo(e){const a=Ho;if(e>28)a.slowStreak++,a.fastStreak=0,a.slowStreak>=30&&(a.slowStreak=0,a.level>0&&(a.level--,ua(a.level)));else if(e<16){a.fastStreak++,a.slowStreak=0;const o=Lt.length-1;a.fastStreak>=120&&a.level<o&&Math.min(window.devicePixelRatio,Lt[a.level+1])>Math.min(window.devicePixelRatio,Lt[a.level])&&(a.fastStreak=0,a.level++,ua(a.level))}else a.slowStreak=0,a.fastStreak=0}function Da(){const e=performance.now();requestAnimationFrame(Da),wn++,performance.now()-bn>=500&&(Cn&&(Cn.textContent=`${Math.round(wn*1e3/(performance.now()-bn))} FPS`),wn=0,bn=performance.now());const a=r.clock.getElapsedTime(),o=Math.min(a-r.prevTime,.05);r.prevTime=a,mo();const{keys:i,invMatrix:l,lastGestureEndTime:n}=g,{particles:p,camera:c}=r;if(p){i.ArrowUp&&(p.rotation.x-=f.rotationStep,g.lastGestureEndTime=performance.now()),i.ArrowDown&&(p.rotation.x+=f.rotationStep,g.lastGestureEndTime=performance.now()),i.ArrowLeft&&(p.rotation.y-=f.rotationStep,g.lastGestureEndTime=performance.now()),i.ArrowRight&&(p.rotation.y+=f.rotationStep,g.lastGestureEndTime=performance.now());const R=i.ArrowUp||i.ArrowDown||i.ArrowLeft||i.ArrowRight,U=performance.now()-n<f.autoReturnGracePeriodMs;if(!R&&!g.lastPinchDist&&!U&&!g.isDragging){const G=f.rotationAutoReturnLerp;p.rotation.x=Ot.lerp(p.rotation.x,0,G),p.rotation.y=Ot.lerp(p.rotation.y,0,G)}}(i["+"]||i["="])&&(r.targetZ-=f.zoomSpeed,r.autoFit=!1),i["-"]&&(r.targetZ+=f.zoomSpeed,r.autoFit=!1),r.targetZ=Ot.clamp(r.targetZ,f.zoomMin,f.zoomMax),c.position.z=Ot.lerp(c.position.z,r.targetZ,f.zoomLerp),Math.abs(c.position.z-r.targetZ)<.005&&(c.position.z=r.targetZ);const M=c.position.z*Math.tan(f.cameraAngleDeg*Math.PI/360),Z=M*c.aspect;if(c.left=-Z,c.right=Z,c.top=M,c.bottom=-M,c.updateProjectionMatrix(),E.uPointScale.value=f.pointSizeAttenuationScale/c.position.z,!p){r.renderer.render(r.scene,c);return}if(g.pendingPointer){const R=g.pendingPointer;if(g.charge.active&&R.pointerId===g.charge.pointerId&&Math.hypot(R.clientX-g.charge.x0,R.clientY-g.charge.y0)>f.chargeCancelPx&&(g.charge.active=!1),we.hasPrevClient){const U=r.renderer.domElement.getBoundingClientRect(),G=(c.right-c.left)/Math.max(U.width,1);we.speedU=Math.hypot(R.clientX-we.prevCX,R.clientY-we.prevCY)*G/Math.max(o,1e-4)}if(we.prevCX=R.clientX,we.prevCY=R.clientY,we.hasPrevClient=!0,Bn(R.clientX,R.clientY),g.isDragging&&R.pointerType==="mouse"){const U=R.clientX-g.prevMouseX,G=R.clientY-g.prevMouseY;r.particles&&(r.particles.rotation.y+=U*.005,r.particles.rotation.x+=G*.005),g.prevMouseX=R.clientX,g.prevMouseY=R.clientY,g.lastGestureEndTime=performance.now()}g.pendingPointer=null}l.copy(p.matrixWorld).invert(),g.mouseLocal.copy(g.mouseWorld).applyMatrix4(l);const T=s.explosionStartTime>=0;if(T?E.uMouse.value.set(-1e3,-1e3,0):E.uMouse.value.copy(g.mouseLocal),T)En(be)&&lo(),g.charge.active=!1,g.charge.value=0,g.charge.release=null,g.tapRing.active=!1,g.tapRing.pending=null;else{if(g.charge.release){const G=g.charge.release;if(g.charge.release=null,oa(G.clientX,G.clientY,$e),$e.x>-500){const Q=f.rippleTapAmp+(f.rippleChargeAmp-f.rippleTapAmp)*G.charge;Fn($e.x,$e.y,Q*(He?.5:1))}}const R=g.mouseLocal.x,U=g.mouseLocal.y;if(R>-500&&!g.isDragging&&we.speedU>f.rippleMoveSpeed&&performance.now()-we.lastEmitMs>f.rippleEmitIntervalMs){const G=Math.min(f.rippleMoveAmpMax,Math.max(f.rippleMoveAmpMin,we.speedU/f.rippleMoveAmpDiv));Fn(R,U,G*(He?.5:1)),we.lastEmitMs=performance.now()}if(we.speedU=0,g.charge.active){const G=performance.now()-g.charge.t0;g.charge.value=Math.min(1,Math.max(0,(G-f.rippleTapGraceMs)/f.rippleChargeMs))}else g.charge.value!==0&&(g.charge.value=0)}const h=g.charge.active;if(de.visible=h,de.el&&(de.el.classList.toggle("is-visible",h),de.stageEl&&de.stageEl.classList.toggle("is-charging",h)),de.elInner){const R=1+g.charge.value*f.cursorChargeScale;Math.abs(R-de.scale)>.001&&(de.scale=R,de.elInner.style.transform=`scale(${R})`)}no(be,o);const d=E.uRipples.value;for(let R=0;R<sn;R++){const U=R*4;d[R].set(be[U],be[U+1],be[U+2],be[U+3])}const D=g.tapRing;if(!T)if(D.pending){const R=D.pending;D.pending=null,oa(R.clientX,R.clientY,$e),$e.x>-500&&(D.x=$e.x,D.y=$e.y,D.age=0,D.count=R.count,D.active=!0)}else D.active&&(D.age+=o,D.age>.55&&(D.active=!1));E.uTapRing.value.set(D.x,D.y,D.age,D.active?D.count:0);const u=p.geometry.attributes.position,S=u.array,P=u.count,{posHome:F,explosionOrigin:B,springDisp:q,springVel:v,randomDir:A,randomSpeed:x,funnelT:X,funnelRadialX:j,funnelRadialZ:V}=s,L=En(be);let z,y;Math.abs(o-r.prevDt)<1e-4?(z=r.prevKFrame,y=r.prevDampFrame):(z=f.springK*(o*60),y=Math.pow(f.springDamping,o*60),r.prevDt=o,r.prevKFrame=z,r.prevDampFrame=y);let w=-1,C=0;const k=s.activeStyle>=0?s.activeStyle:t.motionStyle,b=t.activeExpansionDuration||t.expansionDuration,I=t.activeContractionDuration||t.contractionDuration,W=t.activeMaxDist||t.explosionMaxDistMultiplier;if(s.explosionStartTime>=0)if(w=a-s.explosionStartTime,w>t.totalExplosionDuration)s.explosionStartTime=-1,s.motionToken++,q.fill(0),v.fill(0),t.afterglowStartTime=a,w=-1,S&&F&&(S.set(F),u.needsUpdate=!0),r.trailPoints&&!He&&(r.trailPoints.visible=!0),et(),Ma(!1),Zo();else{(k===0||k===-1)&&w>=b+3&&!t.travelApplied&&(t.activeContractionDuration=t.contractionDuration||2,t.travelApplied=!0,t.audioEnabled&&po(t.activeContractionDuration)),w>=b&&!t.embersSpawned&&(t.embersSpawned=!0,k!==5&&xo());const R=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9;k===5&&!t.dodgeEmbersFired&&w>=R&&(t.dodgeEmbersFired=!0,To(w));const U=t.activeContractionDuration||t.contractionDuration;w<b?C=w/b:C=1-(w-b)/U}let H;if(s.explosionStartTime>=0?H=1:t.afterglowStartTime!=null?(H=Math.max(0,1-(a-t.afterglowStartTime)/f.afterglowDuration),H<=0&&(t.afterglowStartTime=null)):H=0,E.uExplosionActive.value=H,E.uTornadoActive.value=s.explosionStartTime>=0&&s.activeStyle===1?1:0,r.particles&&(r.particles.frustumCulled=C===0),r.particles&&!g.isDragging&&s.explosionStartTime>=0&&k===3&&w>=0&&w<=7.5){const R=w/7.5,U=Math.pow(Math.sin(Math.PI*R),1.2),G=.26*U,Q=-.36*U;r.particles.rotation.x=G,r.particles.rotation.y=Q,r.trailPoints&&(r.trailPoints.rotation.x=G,r.trailPoints.rotation.y=Q)}if(t.gpuPhysics&&T){r.trailPoints&&(r.trailPoints.visible=!1),E.uGpuPhysics.value=1,E.uMotionStyle.value=k>=0?k:0,E.uExplosionElapsed.value=s.explosionStartTime>=0?w:-1,E.uExpDuration.value=b,E.uDriftDuration.value=k===0||k===-1?3:0,E.uContractionDuration.value=I,E.uMaxDist.value=W,E.uSpinSpeed.value=t.pattern&&t.pattern.spinSpeed||5.2,E.uFunnelBottom.value=t.pattern&&t.pattern.funnelBottom||-22,E.uFunnelHeight.value=t.pattern&&t.pattern.funnelHeight||46,E.uFunnelCrownRadius.value=t.pattern&&t.pattern.funnelCrownRadius||22,E.uFunnelWaistRadius.value=t.pattern&&t.pattern.funnelWaistRadius||3.5,E.uFunnelTailRadius.value=t.pattern&&t.pattern.funnelTailRadius||.8,E.uFunnelWaistT.value=t.pattern&&t.pattern.funnelWaistT||.42,E.uFunnelCrownExp.value=t.pattern&&t.pattern.funnelCrownExp||1.4,E.uBreezeBlowDir.value=De&&De.blowDir||1,E.uBreezeIntensity.value=De&&De.intensity||1,E.uBreezeSwirl.value=De&&De.swirl!=null?De.swirl:0,E.uMSweepX.value=t.pattern&&t.pattern.mSweepX!=null?t.pattern.mSweepX:24,E.uMSweepY.value=t.pattern&&t.pattern.mSweepY!=null?t.pattern.mSweepY:4,E.uMSweepZ.value=t.pattern&&t.pattern.mSweepZ!=null?t.pattern.mSweepZ:12,E.uMFreqX.value=t.pattern&&t.pattern.mFreqX!=null?t.pattern.mFreqX:3.456,E.uMFreqY.value=t.pattern&&t.pattern.mFreqY!=null?t.pattern.mFreqY:5.341,E.uMFreqZ.value=t.pattern&&t.pattern.mFreqZ!=null?t.pattern.mFreqZ:2.827,E.uMPhX.value=t.pattern&&t.pattern.mPhX!=null?t.pattern.mPhX:.4,E.uMPhY.value=t.pattern&&t.pattern.mPhY!=null?t.pattern.mPhY:0,E.uMPhZ.value=t.pattern&&t.pattern.mPhZ!=null?t.pattern.mPhZ:1.2,E.uMLaunchDir.value=t.pattern&&t.pattern.mLaunchDir!=null?t.pattern.mLaunchDir:1,E.uMTurnT.value=t.pattern&&t.pattern.mTurnT!=null?t.pattern.mTurnT:99,E.uMTurnDir.value=t.pattern&&t.pattern.mTurnDir!=null?t.pattern.mTurnDir:1,E.uMSplitT.value=t.pattern&&t.pattern.mSplitT!=null?t.pattern.mSplitT:99,E.uMSplitAng.value=t.pattern&&t.pattern.mSplitAng!=null?t.pattern.mSplitAng:0,E.uMDodge1T.value=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9,E.uMDodge2T.value=t.pattern&&t.pattern.mDodge2T!=null?t.pattern.mDodge2T:7.1,E.uMDodge3T.value=t.pattern&&t.pattern.mDodge3T!=null?t.pattern.mDodge3T:99,E.uMDodgeRad.value=t.pattern&&t.pattern.mDodgeRad!=null?t.pattern.mDodgeRad:8,E.uMDodgeStr.value=t.pattern&&t.pattern.mDodgeStr!=null?t.pattern.mDodgeStr:1,E.uMBoilAmp.value=t.pattern&&t.pattern.mBoilAmp!=null?t.pattern.mBoilAmp:0,E.uMBoilFreq.value=t.pattern&&t.pattern.mBoilFreq!=null?t.pattern.mBoilFreq:14,E.uMChurnMult.value=t.pattern&&t.pattern.mChurnMult!=null?t.pattern.mChurnMult:1,E.uMFlutterMult.value=t.pattern&&t.pattern.mFlutterMult!=null?t.pattern.mFlutterMult:1,E.uMJinkAmp.value=t.pattern&&t.pattern.mJinkAmp!=null?t.pattern.mJinkAmp:0,E.uMJinkFreq.value=t.pattern&&t.pattern.mJinkFreq!=null?t.pattern.mJinkFreq:5.5,E.uMJinkPh.value=t.pattern&&t.pattern.mJinkPh!=null?t.pattern.mJinkPh:0,E.uMBreathAmp.value=t.pattern&&t.pattern.mBreathAmp!=null?t.pattern.mBreathAmp:1,E.uMScoutAmp.value=t.pattern&&t.pattern.mScoutAmp!=null?t.pattern.mScoutAmp:0;{const R=r.camera,U=R.top-R.bottom,G=R.right-R.left,Q=Math.max(1,Math.min(G,U))*.205;E.uKnotScale.value=Q,t.pattern.knotScale=Q}}else if(E.uGpuPhysics.value=0,ye){let R=null;for(const U of s.slots)if(!U.inFlight){R=U;break}R&&(R.needsReset&&(R.posLive.set(s.explosionOrigin),R.springDisp.fill(0),R.springVel.fill(0),R.needsReset=!1),R.inFlight=!0,R.seq=s.seq++,s.sendQueue.push(R),ye.postMessage({type:"update",data:{posLive:R.posLive,springDisp:R.springDisp,springVel:R.springVel,count:P,dt:o,elapsed:w,ripples:be,kFrame:z,dampFrame:y,expansionDuration:b,driftDuration:k===0||k===3||k===-1?3:0,contractionDuration:I,explosionMaxDistMultiplier:W,breeze:De,sourceGeneration:s.sourceGeneration,motionToken:s.motionToken},seq:R.seq},[R.posLive.buffer,R.springDisp.buffer,R.springVel.buffer]))}else{const R=t.pattern,U={x:0,y:0,z:0},G=k===1&&R.funnelHeight&&X&&j&&V,Q=B||F,se=k===0||k===3||k===-1?3:0;for(let O=0;O<P;O++){const K=O*3,m=K+1,Y=K+2;let N,ee,ae;if(w>=0)if(k===1&&G)da(O,F[K],F[m],F[Y],X[O],j[O],V[O],(x?x[O]:1)*.35+.85,w,R,U),N=U.x,ee=U.y,ae=U.z;else if(k===2)ma(O,F[K],F[m],F[Y],(x?x[O]:1)*.35+.85,w,De,U),N=U.x,ee=U.y,ae=U.z;else if(k===3)fa(O,F[K],F[m],F[Y],(x?x[O]:1)*.35+.85,w,R,U),N=U.x,ee=U.y,ae=U.z;else if(k===4)ha(O,F[K],F[m],F[Y],(x?x[O]:1)*.35+.85,w,R,U),N=U.x,ee=U.y,ae=U.z;else if(k===5)ga(O,F[K],F[m],F[Y],(x?x[O]:1)*.35+.85,w,R,U),N=U.x,ee=U.y,ae=U.z;else{const ue=x[O]*W;pa(Q[K],Q[m],Q[Y],A[K],A[m],A[Y],ue,b,se,I,w,U),N=U.x,ee=U.y,ae=U.z}else N=F[K],ee=F[m],ae=F[Y];const ne=S[K],oe=S[m],J=S[Y];let $=0,le=0,ce=0;if(L&&(ao(ne,oe,J,be,_t),$=_t.x,le=_t.y,ce=_t.z),v[K]=(v[K]+($-q[K])*z)*y,v[m]=(v[m]+(le-q[m])*z)*y,v[Y]=(v[Y]+(ce-q[Y])*z)*y,q[K]+=v[K],q[m]+=v[m],q[Y]+=v[Y],S[K]=N+q[K],S[m]=ee+q[m],S[Y]=ae+q[Y],w>=0){const ue=S[K]-Q[K],ge=S[m]-Q[m],he=S[Y]-Q[Y],Fe=ue*ue+ge*ge+he*he;Fe>en&&(en=Fe)}}t.actualTravelRadius=Math.sqrt(en),u.needsUpdate=!0,s.positionsDirty=!0}Mo(),wo(o),r.renderer.render(r.scene,c),Oo(performance.now()-e)}async function _o(){r.scene=new Va,r.camera=new Ua(-1,1,1,-1,-600,600),r.camera.position.z=r.targetZ,r.renderer=new Xa({antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1}),r.renderer.setClearColor(f.clearColor,1);const e=r.renderer.domElement;if(e.setAttribute("role","img"),e.setAttribute("aria-label","Kinetic particle sculpture — interactive particle animation"),e.addEventListener("webglcontextlost",h=>{h.preventDefault(),tt("WebGL context lost — attempting restoration...")},!1),e.addEventListener("webglcontextrestored",async()=>{tt("WebGL context restored"),await ze(t.currentText,!1)},!1),document.getElementById("stage").appendChild(e),Bt(),!(new URLSearchParams(window.location.search).get("noworker")==="1"))try{ye=new Worker(new URL("/ParticlesSimulations/assets/physics.worker-BB3i8Vwg.js",import.meta.url),{type:"module"}),ye.onmessage=function(h){const{type:d,seq:D,posLive:u,springDisp:S,springVel:P,travelRadius:F,sourceGeneration:B,motionToken:q}=h.data;if(d==="randomized"){if(h.data.sourceGeneration!==s.sourceGeneration||h.data.motionToken!==s.motionToken)return;s.randomized={dirs:h.data.dirs,style:h.data.style},s.activeStyle=h.data.style;return}if(d==="update"){let v=-1;for(let X=0;X<s.sendQueue.length;X++)if(s.sendQueue[X].seq===D){v=X;break}if(v===-1)return;const A=s.sendQueue.splice(v,1)[0];if(A.inFlight=!1,A.posLive=u,A.springDisp=S,A.springVel=P,B!==s.sourceGeneration||q!==s.motionToken)return;typeof F=="number"&&F>0&&(t.actualTravelRadius=F);const x=r.particles&&r.particles.geometry.attributes.position;x&&x.array.length===u.length&&(x.array.set(u),x.needsUpdate=!0,s.positionsDirty=!0)}},ye.onerror=()=>{console.error("Physics worker error — switching to CPU fallback."),ca()},ye.onmessageerror=()=>{console.error("Physics worker message error — switching to CPU fallback."),ca()}}catch(h){console.error("Failed to initialize physics Web Worker:",h)}await document.fonts.ready.catch(()=>{});const o=window.location.search||(window.location.hash.includes("?")?window.location.hash.substring(window.location.hash.indexOf("?")):""),i=new URLSearchParams(o),l=i.get("text")||i.get("t")||i.get("emoji")||"Bring your message!",n=i.get("theme")||"ember",p=i.get("font")||"Outfit",c=i.get("preset");i.get("gpu")==="0"&&(t.gpuPhysics=!1),t.currentText=l,t.currentTheme=n,t.currentFont=p,f.emojiOptions.includes(l)?(t.activeEmoji=l,t.lastEmoji=l,t.messageMode="emoji",t.lastText="Bring your message!"):(t.messageMode="text",t.lastText=l);const Z=l.toUpperCase(),T=c?c.toUpperCase():f.presets[Z]&&Z!=="DEFAULT"?Z:null;T&&f.presets[T]?(tn(n,!1),await ze(t.currentText,!1),await Ln(T,!1),nn(T)):f.presets[Z]&&Z!=="DEFAULT"?(await Ln(Z,!1),nn(Z)):(tn(n,!1),await ze(t.currentText,!1)),Go(),ht(t.messageMode),de.el=document.getElementById("cursor-ring"),de.elInner=de.el?de.el.firstElementChild:null,de.stageEl=document.getElementById("stage"),window.addEventListener("pointermove",h=>{g.pendingPointer={clientX:h.clientX,clientY:h.clientY,pointerType:h.pointerType,pointerId:h.pointerId},ea(h)}),window.addEventListener("pointerdown",Ao),window.addEventListener("pointerdown",ea),window.addEventListener("pointerdown",h=>{ln(h)||rn()}),window.addEventListener("keydown",h=>{(h.key===" "||h.key.startsWith("Arrow")||h.key==="+"||h.key==="-"||h.key==="=")&&rn()}),window.addEventListener("pointerup",ia),window.addEventListener("pointercancel",ia),window.addEventListener("pointerleave",()=>{g.mouseWorld.set(-1e3,-1e3,0),E.uMouse.value.set(-1e3,-1e3,0),g.isDragging=!1,g.charge.active=!1,g.charge.release=null}),window.addEventListener("touchstart",Do,{passive:!1}),window.addEventListener("touchmove",Po,{passive:!1}),window.addEventListener("touchend",Ro),window.addEventListener("resize",Bt),window.addEventListener("keydown",h=>{if(h.key==="Escape"){const d=document.getElementById("drawer");if(d&&d.classList.contains("open")){yt();return}}g.keys[h.key]=!0,(h.code==="Space"||h.key.startsWith("Arrow"))&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="SELECT"&&(h.preventDefault(),h.code==="Space"&&s.explosionStartTime<0&&(xa(),zt()))}),window.addEventListener("keyup",h=>g.keys[h.key]=!1),window.addEventListener("popstate",async()=>{const h=new URLSearchParams(window.location.search),d=h.get("t")||"Bring your message!",D=h.get("theme")||"ember",u=h.get("font")||"Outfit";t.currentText=d,t.currentTheme=D,t.currentFont=u;const S=f.emojiOptions.includes(d);t.activeEmoji=S?d:null,S?t.lastEmoji=d:t.lastText=d,ht(S?"emoji":"text"),on(d),tn(D,!1),S?(Xe(d),await ze(d,!1)):await ya(u,!1);const P=d.toUpperCase();f.presets[P]&&P!=="DEFAULT"?nn(P):et(),Xe(t.activeEmoji)}),Da(),window.__artzReady=!0}window.__artzDebug={_render:()=>r,triggerExplosion:zt,get particleCount(){return s.posLive?s.posLive.length/3:0},get usingWorker(){return!!ye},get usingGpu(){return t.gpuPhysics},get geometryCount(){return r.renderer?r.renderer.info.memory.geometries:-1},get textureCount(){return r.renderer?r.renderer.info.memory.textures:-1},get renderCalls(){return r.renderer?r.renderer.info.render.calls:-1},snapshot(e=96){var n;const a=s.posHome,o=s.explosionOrigin,i=Math.min(e*3,a?a.length:0);let l=(n=r.particles)==null?void 0:n.geometry.attributes.position.array;if(t.gpuPhysics&&s.explosionStartTime>=0&&a){const p=r.clock.getElapsedTime()-s.explosionStartTime,c=s.activeStyle>=0?s.activeStyle:t.motionStyle,M=t.activeExpansionDuration||t.expansionDuration,Z=t.activeContractionDuration||t.contractionDuration,T=t.activeMaxDist||t.explosionMaxDistMultiplier,h=c===0||c===3||c===-1?3:0,d={x:0,y:0,z:0},D=new Float32Array(i);for(let u=0;u<i/3;u++){const S=u*3,P=S+1,F=S+2;if(c===1)da(u,a[S],a[P],a[F],s.funnelT?s.funnelT[u]:0,s.funnelRadialX?s.funnelRadialX[u]:0,s.funnelRadialZ?s.funnelRadialZ[u]:0,(s.randomSpeed?s.randomSpeed[u]:1)*.35+.85,p,t.pattern,d);else if(c===2)ma(u,a[S],a[P],a[F],(s.randomSpeed?s.randomSpeed[u]:1)*.35+.85,p,De,d);else if(c===3)fa(u,a[S],a[P],a[F],(s.randomSpeed?s.randomSpeed[u]:1)*.35+.85,p,t.pattern,d);else if(c===4)ha(u,a[S],a[P],a[F],(s.randomSpeed?s.randomSpeed[u]:1)*.35+.85,p,t.pattern,d);else if(c===5)ga(u,a[S],a[P],a[F],(s.randomSpeed?s.randomSpeed[u]:1)*.35+.85,p,t.pattern,d);else{const B=(s.randomSpeed?s.randomSpeed[u]:1)*T,q=o||a;pa(q[S],q[P],q[F],s.randomDir?s.randomDir[S]:0,s.randomDir?s.randomDir[P]:0,s.randomDir?s.randomDir[F]:0,B,M,h,Z,p,d)}D[S]=d.x,D[P]=d.y,D[F]=d.z}l=D}return{position:l?Array.from(l.slice(0,i)):[],home:a?Array.from(a.slice(0,i)):[],explosionOrigin:o?Array.from(o.slice(0,i)):[],funnelT:s.funnelT?Array.from(s.funnelT.slice(0,e)):[],activeStyle:s.activeStyle,funnelProfile:{height:t.pattern.funnelHeight||0,bottom:t.pattern.funnelBottom||0,tailRadius:Qt(.05,t.pattern),waistRadius:Qt(.5,t.pattern),crownRadius:Qt(.95,t.pattern),fadeStart:t.pattern.funnelFadeStart||0,fadeEnd:t.pattern.funnelFadeEnd||0},rotation:r.particles?[r.particles.rotation.x,r.particles.rotation.y,r.particles.rotation.z]:[0,0,0],sourceGeneration:s.sourceGeneration,motionToken:s.motionToken,explosionActive:s.explosionStartTime>=0,elapsed:s.explosionStartTime>=0?r.clock.getElapsedTime()-s.explosionStartTime:-1,expDuration:t.activeExpansionDuration||t.expansionDuration,conDuration:t.activeContractionDuration||t.contractionDuration,randomized:s.randomized?{style:s.randomized.style,dirs:Array.from(s.randomized.dirs)}:{style:-1,dirs:[]}}},triggerExplosion:zt,get rippleCount(){let e=0;for(let a=3;a<be.length;a+=4)be[a]>0&&e++;return e},get ripples(){return Array.from(be)},get charge(){return{active:g.charge.active,value:g.charge.value}},get cursor(){return{visible:de.visible,scale:de.scale}},get tapRing(){return{active:g.tapRing.active,count:g.tapRing.count}},emitTestRipple(e,a,o){Fn(e,a,o)},rippleProfile(e){return zn(e)}};_o();
