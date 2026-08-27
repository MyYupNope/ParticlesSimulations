import{C as Do,S as Po,O as Ro,W as Eo,V as Ee,B as xn,a as xe,D as Pt,b as yn,A as Qt,P as Tn,N as Fo,c as Co,L as Xn,d as ko,M as Lo,e as jt}from"./three-DqLVpfpE.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const n of l)if(n.type==="childList")for(const p of n.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&i(p)}).observe(document,{childList:!0,subtree:!0});function a(l){const n={};return l.integrity&&(n.integrity=l.integrity),l.referrerPolicy&&(n.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?n.credentials="include":l.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(l){if(l.ep)return;l.ep=!0;const n=a(l);fetch(l.href,n)}})();const zo=`
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
`,qo=`
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
`,Bo=`
attribute float aLife;
varying float vLife;

void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + 3.0 * aLife);
}
`,Vo=`
varying float vLife;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float a = (1.0 - r) * vLife;
    vec3 c = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.95, 0.7), vLife);
    gl_FragColor = vec4(c, a);
}
`;let ft=null,fn=null;function Io(){return!ft&&(window.AudioContext||window.webkitAudioContext)&&(ft=new(window.AudioContext||window.webkitAudioContext)),ft&&ft.state==="suspended"&&ft.resume(),ft}function ze(e){if(fn)return fn;const o=e.sampleRate*2,a=e.createBuffer(1,o,e.sampleRate),i=a.getChannelData(0);for(let l=0;l<o;l++)i[l]=Math.random()*2-1;return fn=a,a}function Uo(e,o){const a=Io();if(!a)return;const i=typeof e=="object"&&e!==null?e:{soundDuration:e||o},l=i.motionStyle!=null?i.motionStyle:typeof state<"u"&&state&&state.motionStyle!=null?state.motionStyle:0,n=a.currentTime,p=a.createGain();p.gain.setValueAtTime(1e-4,n),p.gain.linearRampToValueAtTime(.4,n+.02),p.connect(a.destination);const u=i.soundDuration||o||1.5,y=i.soundPitch||140,X=i.soundType||"sine";if(l===1){const T=a.createBufferSource();T.buffer=ze(a),T.loop=!0;const w=a.createBiquadFilter();w.type="bandpass",w.frequency.setValueAtTime(60,n),w.frequency.linearRampToValueAtTime(180,n+3.5),w.frequency.exponentialRampToValueAtTime(580,n+6),w.frequency.linearRampToValueAtTime(320,n+8),w.frequency.linearRampToValueAtTime(220,n+11.5),w.frequency.exponentialRampToValueAtTime(45,n+15),w.Q.value=2.8;const b=a.createGain();b.gain.setValueAtTime(1e-4,n),b.gain.exponentialRampToValueAtTime(.18,n+3),b.gain.linearRampToValueAtTime(.38,n+6),b.gain.linearRampToValueAtTime(.24,n+11.5),b.gain.exponentialRampToValueAtTime(1e-4,n+15),T.connect(w),w.connect(b),b.connect(p),T.start(n),T.stop(n+15+.1),setTimeout(()=>{try{T.disconnect(),w.disconnect(),b.disconnect(),p.disconnect()}catch{}},(15+.2)*1e3);return}if(l===2){const T=a.createBufferSource();T.buffer=ze(a),T.loop=!0;const w=a.createBiquadFilter();w.type="bandpass",w.frequency.setValueAtTime(90,n),w.frequency.linearRampToValueAtTime(130,n+1),w.frequency.linearRampToValueAtTime(75,n+3),w.frequency.exponentialRampToValueAtTime(620,n+6.6),w.frequency.exponentialRampToValueAtTime(100,n+10.2),w.frequency.exponentialRampToValueAtTime(50,n+11.8),w.Q.value=1.2;const b=a.createGain();b.gain.setValueAtTime(1e-4,n),b.gain.exponentialRampToValueAtTime(.14,n+1),b.gain.exponentialRampToValueAtTime(.01,n+3),b.gain.linearRampToValueAtTime(.32,n+6.6),b.gain.linearRampToValueAtTime(.05,n+10.2),b.gain.exponentialRampToValueAtTime(1e-4,n+11.8),T.connect(w),w.connect(b),b.connect(p),T.start(n),T.stop(n+11.8+.1),setTimeout(()=>{try{T.disconnect(),w.disconnect(),b.disconnect(),p.disconnect()}catch{}},(11.8+.2)*1e3);return}if(l===3){const T=typeof a.createStereoPanner=="function"?a.createStereoPanner():null;T&&(T.pan.setValueAtTime(-.75,n),T.pan.linearRampToValueAtTime(.75,n+7.5),T.connect(p));const w=T||p,b=a.createOscillator();b.type="sine",b.frequency.setValueAtTime(32,n),b.frequency.linearRampToValueAtTime(48,n+2.5),b.frequency.linearRampToValueAtTime(58,n+4.2),b.frequency.linearRampToValueAtTime(36,n+5.8),b.frequency.exponentialRampToValueAtTime(20,n+7.5);const q=a.createGain();q.gain.setValueAtTime(1e-4,n),q.gain.exponentialRampToValueAtTime(.24,n+2),q.gain.linearRampToValueAtTime(.48,n+4.2),q.gain.linearRampToValueAtTime(.18,n+5.8),q.gain.exponentialRampToValueAtTime(1e-4,n+7.5),b.connect(q),q.connect(w),b.start(n),b.stop(n+7.5+.1);const j=a.createBufferSource();j.buffer=ze(a),j.loop=!0;const B=a.createBiquadFilter();B.type="lowpass",B.frequency.setValueAtTime(140,n),B.frequency.exponentialRampToValueAtTime(420,n+2.2),B.frequency.exponentialRampToValueAtTime(1250,n+4.2),B.frequency.linearRampToValueAtTime(550,n+5.6),B.frequency.exponentialRampToValueAtTime(75,n+7.5),B.Q.value=1.1;const P=a.createGain();P.gain.setValueAtTime(1e-4,n),P.gain.exponentialRampToValueAtTime(.18,n+1.8),P.gain.linearRampToValueAtTime(.52,n+4.2),P.gain.linearRampToValueAtTime(.22,n+5.6),P.gain.exponentialRampToValueAtTime(1e-4,n+7.5),j.connect(B),B.connect(P),P.connect(w),j.start(n),j.stop(n+7.5+.1);const F=a.createBufferSource();F.buffer=ze(a),F.loop=!0;const g=a.createBiquadFilter();g.type="bandpass",g.frequency.setValueAtTime(1400,n),g.frequency.exponentialRampToValueAtTime(2400,n+3.8),g.frequency.exponentialRampToValueAtTime(3200,n+4.6),g.frequency.linearRampToValueAtTime(1800,n+6),g.frequency.exponentialRampToValueAtTime(600,n+7.5),g.Q.value=1.4;const v=a.createGain();v.gain.setValueAtTime(1e-4,n),v.gain.exponentialRampToValueAtTime(.04,n+2.5),v.gain.linearRampToValueAtTime(.38,n+4.4),v.gain.linearRampToValueAtTime(.26,n+5.4),v.gain.exponentialRampToValueAtTime(1e-4,n+7.5),F.connect(g),g.connect(v),v.connect(w),F.start(n),F.stop(n+7.5+.1);const R=a.createBufferSource();R.buffer=ze(a),R.loop=!0;const E=a.createBiquadFilter();E.type="bandpass",E.frequency.setValueAtTime(700,n+4.5),E.frequency.exponentialRampToValueAtTime(280,n+6.2),E.frequency.exponentialRampToValueAtTime(90,n+7.5),E.Q.value=1.8;const M=a.createGain();M.gain.setValueAtTime(1e-4,n),M.gain.setValueAtTime(1e-4,n+4.5),M.gain.linearRampToValueAtTime(.18,n+5.5),M.gain.exponentialRampToValueAtTime(1e-4,n+7.5),R.connect(E),E.connect(M),M.connect(w),R.start(n+4.5),R.stop(n+7.5+.1),setTimeout(()=>{try{b.disconnect(),q.disconnect(),j.disconnect(),B.disconnect(),P.disconnect(),F.disconnect(),g.disconnect(),v.disconnect(),R.disconnect(),E.disconnect(),M.disconnect(),T&&T.disconnect(),p.disconnect()}catch{}},(7.5+.2)*1e3);return}if(l===4){const T=a.createOscillator();T.type="sine",T.frequency.setValueAtTime(28,n),T.frequency.linearRampToValueAtTime(52,n+3),T.frequency.setValueAtTime(52,n+11.5),T.frequency.exponentialRampToValueAtTime(24,n+16);const w=a.createGain();w.gain.setValueAtTime(1e-4,n),w.gain.exponentialRampToValueAtTime(.3,n+2.6),w.gain.linearRampToValueAtTime(.22,n+11.5),w.gain.exponentialRampToValueAtTime(1e-4,n+16),T.connect(w),w.connect(p),T.start(n),T.stop(n+16+.1);const b=a.createBufferSource();b.buffer=ze(a),b.loop=!0;const q=a.createBiquadFilter();q.type="bandpass",q.frequency.setValueAtTime(70,n),q.frequency.exponentialRampToValueAtTime(760,n+3),q.frequency.exponentialRampToValueAtTime(120,n+3.8),q.Q.value=1.8;const j=a.createGain();j.gain.setValueAtTime(1e-4,n),j.gain.exponentialRampToValueAtTime(.26,n+2.9),j.gain.exponentialRampToValueAtTime(1e-4,n+4),b.connect(q),q.connect(j),j.connect(p),b.start(n),b.stop(n+4.1);const B=n+3,P=a.createOscillator();P.type="sine",P.frequency.setValueAtTime(95,B),P.frequency.exponentialRampToValueAtTime(36,B+.45);const F=a.createGain();F.gain.setValueAtTime(1e-4,B),F.gain.exponentialRampToValueAtTime(.28,B+.03),F.gain.exponentialRampToValueAtTime(1e-4,B+.55),P.connect(F),F.connect(p),P.start(B),P.stop(B+.6);const g=a.createBufferSource();g.buffer=ze(a),g.loop=!0;const v=a.createBiquadFilter();v.type="bandpass",v.frequency.setValueAtTime(430,n+3),v.frequency.linearRampToValueAtTime(560,n+11.5),v.Q.value=2.2;const R=a.createGain();R.gain.setValueAtTime(1e-4,n+3),R.gain.linearRampToValueAtTime(.15,n+4.2),R.gain.linearRampToValueAtTime(.12,n+10.5),R.gain.exponentialRampToValueAtTime(1e-4,n+16);const E=a.createOscillator();E.type="sine",E.frequency.value=.9;const M=a.createGain();M.gain.setValueAtTime(.055,n+3),M.gain.linearRampToValueAtTime(0,n+11.5),E.connect(M),M.connect(R.gain),g.connect(v),v.connect(R),R.connect(p),g.start(n+3),g.stop(n+16+.1),E.start(n+3),E.stop(n+16+.1);const L=a.createOscillator();L.type="triangle",L.frequency.setValueAtTime(1350,n+11.5),L.frequency.exponentialRampToValueAtTime(310,n+16);const Y=a.createGain();Y.gain.setValueAtTime(1e-4,n+11.5),Y.gain.exponentialRampToValueAtTime(.07,n+11.9),Y.gain.exponentialRampToValueAtTime(1e-4,n+16),L.connect(Y),Y.connect(p),L.start(n+11.5),L.stop(n+16+.1),setTimeout(()=>{try{T.disconnect(),w.disconnect(),b.disconnect(),q.disconnect(),j.disconnect(),P.disconnect(),F.disconnect(),g.disconnect(),v.disconnect(),R.disconnect(),E.disconnect(),M.disconnect(),L.disconnect(),Y.disconnect(),p.disconnect()}catch{}},(16+.2)*1e3);return}if(l===5){const T=a.createBufferSource();T.buffer=ze(a),T.loop=!0;const w=a.createBiquadFilter();w.type="lowpass",w.frequency.setValueAtTime(220,n),w.frequency.linearRampToValueAtTime(920,n+3.2),w.frequency.linearRampToValueAtTime(680,n+9),w.frequency.linearRampToValueAtTime(180,n+12),w.frequency.exponentialRampToValueAtTime(90,n+14);const b=a.createGain();b.gain.setValueAtTime(1e-4,n),b.gain.exponentialRampToValueAtTime(.2,n+3),b.gain.linearRampToValueAtTime(.16,n+9),b.gain.exponentialRampToValueAtTime(1e-4,n+14),T.connect(w),w.connect(b),b.connect(p),T.start(n),T.stop(n+14+.1);const q=a.createBufferSource();q.buffer=ze(a),q.loop=!0;const j=a.createBiquadFilter();j.type="bandpass",j.frequency.value=760,j.Q.value=1.1;const B=a.createGain();B.gain.setValueAtTime(1e-4,n),B.gain.linearRampToValueAtTime(.1,n+3),B.gain.linearRampToValueAtTime(.08,n+9),B.gain.linearRampToValueAtTime(1e-4,n+12.5);const P=a.createOscillator();P.type="sine",P.frequency.setValueAtTime(8,n),P.frequency.linearRampToValueAtTime(12.5,n+9),P.frequency.linearRampToValueAtTime(7,n+14);const F=a.createGain();F.gain.setValueAtTime(0,n),F.gain.linearRampToValueAtTime(.085,n+3),F.gain.linearRampToValueAtTime(.06,n+9),F.gain.linearRampToValueAtTime(0,n+12.5),P.connect(F),F.connect(B.gain),q.connect(j),j.connect(B),B.connect(p),q.start(n),q.stop(n+14+.1),P.start(n),P.stop(n+14+.1);for(let g=0;g<3;g++){const v=n+.25+g*.24,R=a.createOscillator();R.type="sine",R.frequency.setValueAtTime(2350+g*190,v),R.frequency.exponentialRampToValueAtTime(1750+g*140,v+.09);const E=a.createGain();E.gain.setValueAtTime(1e-4,v),E.gain.exponentialRampToValueAtTime(.09,v+.02),E.gain.exponentialRampToValueAtTime(1e-4,v+.11),R.connect(E),E.connect(p),R.start(v),R.stop(v+.12)}setTimeout(()=>{try{T.disconnect(),w.disconnect(),b.disconnect(),q.disconnect(),j.disconnect(),B.disconnect(),P.disconnect(),F.disconnect(),p.disconnect()}catch{}},(14+.2)*1e3);return}const x=Math.max(1.8,u),f=a.createBufferSource();f.buffer=ze(a);const d=a.createBiquadFilter();d.type="bandpass",d.frequency.setValueAtTime(1200,n),d.frequency.exponentialRampToValueAtTime(180,n+.25),d.Q.value=1.2;const k=a.createGain();k.gain.setValueAtTime(.75,n),k.gain.exponentialRampToValueAtTime(.001,n+.35),f.connect(d),d.connect(k),k.connect(p),f.start(n),f.stop(n+.4);const c=a.createBufferSource();c.buffer=ze(a),c.loop=!0;const A=a.createBiquadFilter();A.type="lowpass",A.frequency.setValueAtTime(450,n),A.frequency.exponentialRampToValueAtTime(65,n+x);const S=a.createGain();S.gain.setValueAtTime(.65,n),S.gain.exponentialRampToValueAtTime(1e-4,n+x),c.connect(A),A.connect(S),S.connect(p),c.start(n),c.stop(n+x+.05);const V=a.createOscillator();V.type=X||"sine",V.frequency.setValueAtTime(Math.max(y,120),n),V.frequency.exponentialRampToValueAtTime(26,n+Math.min(1.2,x));const z=a.createGain();z.gain.setValueAtTime(.7,n),z.gain.exponentialRampToValueAtTime(.001,n+x),V.connect(z),z.connect(p),V.start(n),V.stop(n+x+.05),setTimeout(()=>{try{f.disconnect(),d.disconnect(),k.disconnect(),c.disconnect(),A.disconnect(),S.disconnect(),V.disconnect(),z.disconnect(),p.disconnect()}catch{}},(x+.1)*1e3)}function Nt(e,o){o.funnelBottom,o.funnelHeight;const a=o.funnelWaistT!=null?o.funnelWaistT:o.funnelWaistU||.42,i=o.funnelTailRadius!=null?o.funnelTailRadius:.8,l=o.funnelWaistRadius!=null?o.funnelWaistRadius:3.5,n=o.funnelCrownRadius!=null?o.funnelCrownRadius:22,p=o.funnelCrownExp||1.4;if(e<=a){const u=e/Math.max(.01,a);return i+(l-i)*(u*u)}else{const u=(e-a)/Math.max(.01,1-a);return l+(n-l)*Math.pow(u,p)}}const Wn=.06081006264583979;function eo(e,o,a,i,l,n,p,u,y,X,x){const f=Nt(l,X),d=Math.atan2(p,n),k=Math.sqrt(o*o+i*i),c=3.5,A=X.vortexDuration||4.5,S=X.equilibriumDuration||3.5,V=3.5,z=14+.55*k,C=X.funnelBottom||-22,T=X.funnelHeight||46,w=.12*Math.sin(3*d-4.2*y+2.5*l),b=.08*Math.cos(5*d+6*y-3.8*l),q=.06*Math.sin(y*7.5+e*.03),j=1+w+b+q,B=(4+15/(k+4.5))*u,P=((X.spinSpeed||5.2)*2.8+4.5*(1-l))*u;if(y<c){const F=y/c,g=F*F*F*(F*(F*6-15)+10),v=(1-g)*k+g*z,R=d+B*(.6*y+.2*(y*y/c)),E=Math.cos(R)*v,M=(1-g)*a+g*(C+.022*v*v+3*(l-.5)),L=Math.sin(R)*v;return x?(x.x=E,x.y=M,x.z=L,x):{x:E,y:M,z:L}}else if(y<c+A){const F=y-c,g=F/A,v=g*g*(3-2*g),R=d+B*(.8*c),E=F+.6*A/Math.PI*(1-Math.cos(Math.PI*F/A)),M=R+P*1.25*E,L=(1-v)*z+v*(f*j),Y=2.8*Math.sin(1.8*y+2.2*l)*l*v,H=2.4*Math.cos(1.5*y+1.8*l)*l*v,I=Y+Math.cos(M)*L,W=(1-v)*(C+.022*z*z)+v*(C+T*l)+5.5*Math.sin(g*Math.PI)*l,G=H+Math.sin(M)*L;return x?(x.x=I,x.y=W,x.z=G,x):{x:I,y:W,z:G}}else if(y<c+A+S){const F=y-(c+A),g=F/S,v=1+.75*Math.sin(Math.PI*g)+.35*g,R=d+B*(.8*c),E=A+1.2*A/Math.PI,M=R+P*1.25*E,L=F-.2/2.4*(Math.cos(2.4*F)-1),Y=M+P*1.1*L,H=f*j*v,I=2.8*Math.sin(1.8*(c+A)+2.2*l)*l*(1-.4*g),W=2.4*Math.cos(1.5*(c+A)+1.8*l)*l*(1-.4*g),G=I+Math.cos(Y)*H,$=C+T*l+(1-g)*2*l,se=W+Math.sin(Y)*H;return x?(x.x=G,x.y=$,x.z=se,x):{x:G,y:$,z:se}}else{const F=y-(c+A+S),g=Math.min(1,F/V),v=d+B*(.8*c),R=A+1.2*A/Math.PI,E=v+P*1.25*R,M=S-.2/2.4*(Math.cos(2.4*S)-1),L=E+P*1.1*M,Y=.85*F-.275*(F*F/V),H=L+P*1.1*Y,I=f*j*(1-g)+z*g,W=(C+T*l)*(1-g)+(C+.022*z*z+3*(l-.5))*g,G=Math.cos(H)*I,$=W,se=Math.sin(H)*I,O=.35*g+.65*Math.pow(g,2.2),J=(1-O)*G+O*o,m=(1-O)*$+O*a,U=(1-O)*se+O*i;return x?(x.x=J,x.y=m,x.z=U,x):{x:J,y:m,z:U}}}function Zn(e,o,a,i,l,n,p,u,y,X,x,f,d,k,c,A,S){const V=i*p+25,z=A*53.17%100/100*.3,C=Math.min(.75,Math.max(0,V*.015+z)),T=Math.max(0,e-C),w=Math.min(1,T/(c-C+1e-4));if(T<=0)return S?(S.x=i,S.y=l,S.z=n,S):{x:i,y:l,z:n};const q=A%3*2.094395,P=.15*(i*p)-2.8*o+q,F=(1.8+3.8*f)*Math.min(1,T/.8)*u,g=F*Math.sin(P),v=F*Math.cos(P),R=p*(F*.55*Math.sin(P*.5)),E=3.6+A*41.73%100/100*2,M=A*67.89%100/100*6.28318,L=E*o+M,Y=p*(Math.sin(L)*(.8+1.1*x))*u,H=Math.abs(Math.cos(L))*(.95+1.45*f)*u,I=Math.sin(L*.75+M)*(1.3+1.8*x)*u,W=Math.sin(9.5*o+A*.35)*.4*u*Math.min(1,T),G=A*29.17%10>5?1:-1,$=.12*(i*p)-3.8*o*G+A*31.41%100/100*6.28318,se=Math.sin(Math.PI*w),O=(3.2+6*f)*(y||0)*u*se,J=O*Math.sin($),m=O*Math.cos($),U=p*(O*.35*Math.cos($*2));if(a>.82){const ee=(3.2+6*x)*u*(T*.85+.08*T*T),oe=(.35*Math.abs(Math.sin(L))+.1*Math.sin(o*10+A))*Math.min(1,T),ne=(.75*Math.sin(L*.6)+W+m*.25)*Math.min(1,T),ae=i+p*ee+Y*.4+U*.25,Q=Math.max(l,l+oe),K=n+ne;return S?(S.x=ae,S.y=Q,S.z=K,S):{x:ae,y:Q,z:K}}else{const _=d*.5,ee=Math.min(1,Math.max(0,(w-_)/(1-_+1e-4))),oe=ee*ee*(3-2*ee),ne=A*83.11%100/100*2.4-1.2,ae=Math.max(2.4,4.2+8.5*x+3.8*f+ne),Q=(T*ae+.45*T*T*(.4+.6*f))*u,K=A*93.41%100/100*2.8,le=(3+7.5*f+K)*u,ce=Math.max(0,le+g+H+W),ue=i+p*Q+R+Y+oe*U,he=Math.max(l,l+oe*(ce+J)),fe=n+oe*(v+I+W+m);return S?(S.x=ue,S.y=he,S.z=fe,S):{x:ue,y:he,z:fe}}}function to(e,o,a,i,l,n,p,u){const y=p||{},X=y.blowDir!=null?y.blowDir:1,x=y.intensity!=null?y.intensity:1,f=y.swirl!=null?y.swirl:0,d=1,k=2,c=3.6,A=3.6,S=1.6,V=e*37.119%100/100,z=V<.22,C=e*19.417%100-50,T=e*29.831%100-50,w=z?C*.05:0,b=z?T*.04:0,q=-11,j=o+w,B=q+a*.03,P=i+b,F=.55+e*43.71%100/100*.9,g=.4+e*81.33%100/100*1.1,v=Math.pow(e*61.19%100/100,1.4)*.6;if(n<d){const R=n/d,E=R*R,M=Math.max(0,(R-.7)/.3),L=M*(2-M),Y=(z?1.6:.5)*Math.sin(Math.PI*M)*(1-M),H=o+w*L,I=(1-E)*a+E*B+Y,W=i+b*L;return u?(u.x=H,u.y=I,u.z=W,u):{x:H,y:I,z:W}}else{if(n<d+k)return u?(u.x=j,u.y=B,u.z=P,u):{x:j,y:B,z:P};if(n<d+k+c){const R=n-(d+k);return Zn(R,n,V,j,B,P,X,x,f,l,F,g,v,T,c,e,u)}else if(n<d+k+c+A){const R=(n-(d+k+c))/A,E=R*R*(3-2*R),M=c*(1-E);return Zn(M,n,V,j,B,P,X,x,f,l,F,g,v,T,c,e,u)}else{const R=Math.min(1,(n-(d+k+c+A))/S),E=R*R*(3-2*R),M=(1-E)*j+E*o,L=(1-E)*B+E*a,Y=(1-E)*P+E*i;return u?(u.x=M,u.y=L,u.z=Y,u):{x:M,y:L,z:Y}}}}function no(e,o,a,i,l,n,p,u,y,X,x,f){const d=y!=null&&y>0?y:3,k=(1-Wn)*.82+.18,c=(2.8*Wn*.82+.18)/Math.max(.1,u),A=k+c*d*.78;let S;if(x<u){const T=x/u;S=((1-Math.exp(-2.8*T))*.82+.18*T)*p}else if(x<u+d){const T=x-u,w=T/Math.max(.01,d);S=(k+c*T*(1-.22*w))*p}else{const T=Math.min(1,Math.max(0,(x-(u+d))/Math.max(.1,X))),w=Math.max(0,1-Math.pow(T,2.4));S=A*w*p}const V=e+i*S,z=o+l*S,C=a+n*S;return f?(f.x=V,f.y=z,f.z=C,f):{x:V,y:z,z:C}}function oo(e,o,a,i,l,n,p,u){const X=Math.min(1,Math.max(0,n/7.5)),x=-48+96*X,f=o+.25*a-x,d=9.2,k=Math.exp(-(f*f)/(2*d*d)),c=Math.sin(Math.PI*X),A=k*(.35+.65*c),S=Math.PI*f/(2*d),V=Math.cos(S),z=Math.sin(S),C=16,T=.5+.5*Math.tanh(a/8),w=C*(V-.3*Math.sin(2*S)),b=5*T*Math.max(0,V),q=-3.5*T*Math.max(0,z),j=A*(w+b),B=A*(C*.14*z+q),P=-A*(C*.06)*z,F=o+P,g=a+B,v=i+j;return u?(u.x=F,u.y=g,u.z=v,u):{x:F,y:g,z:v}}function ao(e,o,a,i,l,n,p,u){const x=e*37.119%100/100,f=e*61.19%100/100,d=e*29.17%100/100,k=e*53.17%100/100,c=e*91.73%100/100,A=1.05+.04*Math.sin(.35*n),S=.07+.02*Math.cos(.3*n),V=Math.cos(A),z=Math.sin(A),C=Math.cos(S),T=Math.sin(S);let w=C,b=T,q=0,j=-T*z,B=C*z,P=V;const F=Math.sqrt(j*j+B*B+P*P)||1;j/=F,B/=F,P/=F;const g=b*P-q*B,v=q*j-w*P,R=w*B-b*j,E=p&&p.knotScale>0?p.knotScale:11,M=E*.62,L=E*.34,Y=E*.15*(1+.03*Math.sin(1.2*n)),H=x*6.28318+.14*n*l,I=Math.sin(3*H),W=Math.cos(3*H),G=M+L*W,$=Math.cos(2*H),se=Math.sin(2*H),O=G*$,J=G*se,m=L*I,U=-3*L*I*$-2*G*se,_=-3*L*I*se+2*G*$,ee=3*L*W,oe=O*w+J*j+m*g,ne=O*b+J*B+m*v,ae=O*q+J*P+m*R,Q=U*w+_*j+ee*g,K=U*b+_*B+ee*v,le=U*q+_*P+ee*R,ce=Math.sqrt(Q*Q+K*K+le*le)||1,ue=Q/ce,he=K/ce,fe=le/ce,Ce=c*6.28318+.18*n*l,ge=Y*Math.sqrt(k),ve=g*ue+v*he+R*fe;let be=g-ve*ue,Me=v-ve*he,Re=R-ve*fe;const je=Math.sqrt(be*be+Me*Me+Re*Re)||1;be/=je,Me/=je,Re/=je;const Mt=he*Re-fe*Me,zt=fe*be-ue*Re,Je=ue*Me-he*be,Xe=Math.cos(Ce),Qe=Math.sin(Ce),Ye=oe+ge*(Xe*be+Qe*Mt),We=ne+ge*(Xe*Me+Qe*zt),ke=ae+ge*(Xe*Re+Qe*Je);let De,Ze,ie;if(n<3){let de=(n-f*.35)/2.65;de=Math.max(0,Math.min(1,de));const Se=de*de*de*(de*(de*6-15)+10),Ae=.9*l*Math.sin(Math.PI*Se),me=Math.cos(Ae),ye=Math.sin(Ae),Te=g*o+v*a+R*i,Be=v*i-R*a,Ve=R*o-g*a,He=g*a-v*o,Le=o*me+Be*ye+g*Te*(1-me),Ge=a*me+Ve*ye+v*Te*(1-me),Ie=i*me+He*ye+R*Te*(1-me);De=Le+(Ye-Le)*Se,Ze=Ge+(We-Ge)*Se,ie=Ie+(ke-Ie)*Se}else if(n<11.5)De=Ye,Ze=We,ie=ke;else{let de=(n-11.5-d*.25)/4.25;de=Math.max(0,Math.min(1,de));const Se=de*de*de*(de*(de*6-15)+10),Ae=.9*l*Math.sin(Math.PI*Se),me=Math.cos(Ae),ye=Math.sin(Ae),Te=g*Ye+v*We+R*ke,Be=v*ke-R*We,Ve=R*Ye-g*ke,He=g*We-v*Ye,Le=Ye*me+Be*ye+g*Te*(1-me),Ge=We*me+Ve*ye+v*Te*(1-me),Ie=ke*me+He*ye+R*Te*(1-me);De=Le+(o-Le)*Se,Ze=Ge+(a-Ge)*Se,ie=Ie+(i-Ie)*Se}const $e=Math.max(0,Math.min(1,(n-3)/(11.5-3))),mt=6.283185307179586*($e*$e*$e*($e*($e*6-15)+10)),qt=Math.cos(mt),Bt=Math.sin(mt),Vt=qt*De+Bt*ie,et=-Bt*De+qt*ie;return De=Vt,ie=et,u?(u.x=De,u.y=Ze,u.z=ie,u):{x:De,y:Ze,z:ie}}function io(e,o,a,i,l,n,p,u){const c=p||{},A=c.mSweepX!=null?c.mSweepX:24,S=c.mSweepY!=null?c.mSweepY:4,V=c.mSweepZ!=null?c.mSweepZ:12,z=c.mFreqX!=null?c.mFreqX:3.456,C=c.mFreqY!=null?c.mFreqY:5.341,T=c.mFreqZ!=null?c.mFreqZ:2.827,w=c.mPhX!=null?c.mPhX:.4,b=c.mPhY!=null?c.mPhY:0,q=c.mPhZ!=null?c.mPhZ:1.2,j=c.mLaunchDir!=null?c.mLaunchDir:1,B=c.mTurnT!=null?c.mTurnT:99,P=c.mTurnDir!=null?c.mTurnDir:1,F=c.mSplitT!=null?c.mSplitT:99,g=c.mSplitAng!=null?c.mSplitAng:0,v=c.mDodge1T!=null?c.mDodge1T:3.9,R=c.mDodge2T!=null?c.mDodge2T:7.1,E=c.mDodge3T!=null?c.mDodge3T:99,M=c.mDodgeRad!=null?c.mDodgeRad:8,L=c.mDodgeStr!=null?c.mDodgeStr:1,Y=c.mBoilAmp!=null?c.mBoilAmp:0,H=c.mBoilFreq!=null?c.mBoilFreq:14,I=c.mChurnMult!=null?c.mChurnMult:1,W=c.mFlutterMult!=null?c.mFlutterMult:1,G=c.mJinkAmp!=null?c.mJinkAmp:0,$=c.mJinkFreq!=null?c.mJinkFreq:5.5,se=c.mJinkPh!=null?c.mJinkPh:0,O=c.mBreathAmp!=null?c.mBreathAmp:1,J=c.mScoutAmp!=null?c.mScoutAmp:0,m=11+O*(3.4*Math.sin(.85*9+.7)+1.7*Math.sin(1.65*9)),U=A*Math.sin(z+w),_=S*Math.sin(C+b),ee=V*Math.sin(T+q),oe=U*.25,ne=_*.25+1.5,ae=ee*.25,Q=A*z/7,K=S*C/7,le=V*T/7,ce=Q*Math.cos(z+w),ue=K*Math.cos(C+b)-1.346,he=le*Math.cos(T+q),fe=Math.sqrt(ce*ce+ue*ue+he*he)||1,Ce=ce/fe,ge=ue/fe,ve=he/fe,be=.6*Math.min(1,fe/10),Me=e*37.119%100/100,Re=e*61.19%100/100,je=e*83.11%100/100,Mt=e*53.17%100/100,zt=e*97.31%100/100,Je=Me*6.28318,Xe=Re*6.28318,Qe=je*6.28318,Ye=(j>0?o+50:50-o)*.017+Re*.55,We=n-Ye;if(We<=0)return u?(u.x=o,u.y=a,u.z=i,u):{x:o,y:a,z:i};let ke=Math.min(1,We/.9);const De=ke*ke*(3-2*ke),Ze=Math.sin(ke*Math.PI)*2.2,ie=n*l,$e=Math.max(0,Math.min(1,(n-(B-.45))/.45)),Cn=Math.max(0,Math.min(1,(n-B)/.45)),mt=$e*(1-Cn),qt=Math.max(0,Math.min(1,(n-(F-1))/.4)),Bt=Math.max(0,Math.min(1,(n-(F+.6))/.4)),Vt=qt*(1-Bt);let et,de,Se,Ae,me,ye,Te,Be,Ve;if(n<9){const te=Math.max(0,(n-2)/7);et=A*Math.sin(te*z+w),de=S*Math.sin(te*C+b)+3*Math.sin(te*Math.PI),Se=V*Math.sin(te*T+q);const N=G*Math.sin(Math.PI*te);et+=N*Math.sin(te*$+se),de+=N*.6*Math.sin(te*$*.83+se+1.7),Se+=N*Math.cos(te*$*.91+se+3.1),Ae=1,me=11+O*(3.4*Math.sin(.85*n+.7)+1.7*Math.sin(1.65*n));const re=Q*Math.cos(te*z+w),pe=K*Math.cos(te*C+b)+1.346*Math.cos(te*Math.PI),rt=le*Math.cos(te*T+q),pt=Math.sqrt(re*re+pe*pe+rt*rt)||1;ye=re/pt,Te=pe/pt,Be=rt/pt,Ve=.6*Math.min(1,pt/10),Ve*=1+.55*mt}else if(n<12){const te=(n-9)/3,N=te*te*(3-2*te);et=U*(1-.75*N),de=_*(1-.75*N)+1.5*N,Se=ee*(1-.75*N),Ae=1-.7*N,me=m*(1-.55*N),ye=Ce,Te=ge,Be=ve,Ve=be*(1-.75*N)}else{const te=n-12;Ae=.3*(1-Math.min(1,te/2));let N=te/1.5;N=Math.min(1,N),N=N*N*(3-2*N);const re=1.6*Math.sin(ie*1.05+Je),pe=1+Math.sin(ie*.83+Xe),rt=1.2*Math.cos(ie*.95+Qe);et=oe+(re-oe)*N,de=ne+(pe-ne)*N,Se=ae+(rt-ae)*N,me=m*.45,ye=Ce,Te=ge,Be=ve,Ve=be*.25*(1-Math.min(1,te/2))}const He=Je,Le=2*Re-1,Ge=Math.sqrt(Math.max(0,1-Le*Le)),Ie=Math.sqrt(je),on=1+.3*Math.sin(2.2*He+1.8*Le+.45*ie)+.16*Math.cos(3.3*He-2.4*Le+.62*ie);let xt=Ie*Ge*Math.cos(He)*me*on,yt=Ie*Le*.72*me*on,Tt=Ie*Ge*Math.sin(He)*me*on;const kn=e*71.53%100/100,It=Math.floor(kn*6),an=me/11,rn=(4.5+3*Me)*an,go=rn*Math.sin(.71*It+.5*ie+kn*6.28),vo=rn*.7*Math.sin(1.13*It+.38*ie+Re*6.28),Mo=rn*.8*Math.cos(.87*It+.45*ie+je*6.28),tt=xt,nt=yt,sn=Tt,ot=xt*ye+yt*Te+Tt*Be,xo=xt-ye*ot,yo=yt-Te*ot,To=Tt-Be*ot,wo=Math.max(0,-ot),So=Math.max(0,Ie-.9)/.1,ln=(wo*1.7+So*2.6)*Ve*(.55+.45*Mt)*an,cn=1+Ve;xt=xo*.8+ye*(ot*cn-ln),yt=yo*.8+Te*(ot*cn-ln),Tt=To*.8+Be*(ot*cn-ln);let Ut=I*5.6*Math.sin(.4*nt+1.25*ie+Je),Xt=I*4.4*Math.sin(.48*tt-1.05*ie+Xe),Wt=I*4.8*Math.cos(.36*tt+.3*nt+.9*ie+Qe);const Ln=8.5+4*Mt,zn=Math.sin(Ln*ie+Je);Ut+=W*.5*zn,Xt+=W*1.3*zn,Wt+=W*.4*Math.sin(Ln*.87*ie+Xe),Ut+=Y*Math.sin(H*ie+1.9*nt+Xe),Xt+=Y*.8*Math.sin(H*.87*ie-1.6*tt+Qe),Wt+=Y*Math.cos(H*.71*ie+1.3*(tt+nt)+Je),Ut*=Ae,Xt*=Ae,Wt*=Ae;let Oe=et+go+xt+Ut,at=de+vo+yt+Xt,it=Se+Mo+Tt+Wt;if(mt>0){const te=Te,N=-ye,re=Math.sqrt(te*te+N*N+.0025),pe=P*8*mt;Oe+=te/re*pe,at+=N/re*pe}if(Vt>0){const N=(It<3?1:-1)*7.5*Vt*an;Oe+=Math.cos(g)*N,it+=Math.sin(g)*N}if(zt>.93&&Ae>.01&&J>0){const te=(1.55+1.3*Me)*Math.PI;let N=Math.sin(ie*te+zt*40+Xe);if(N>0){N*=N,N*=N,N*=N;const re=Math.sqrt(tt*tt+nt*nt+sn*sn)||1,pe=J*(4+2.5*je)*N*Ae;Oe+=tt/re*pe,at+=nt/re*pe,it+=sn/re*pe}}if(n>2&&n<9){let te=Math.max(0,Math.min(1,(n-(v-1.1))/.4));te*=1-Math.max(0,Math.min(1,(n-(v+1.1))/.4));let N=Math.max(0,Math.min(1,(n-(R-1.1))/.4));N*=1-Math.max(0,Math.min(1,(n-(R+1.1))/.4));let re=Math.max(0,Math.min(1,(n-(E-1.1))/.4));re*=1-Math.max(0,Math.min(1,(n-(E+1.1))/.4));const pe=Math.max(te,Math.max(N,re)),rt=re>=te&&re>=N?2:N>=te?1:0;if(pe>.001){const pt=Math.min(8.9,n*.92+1.1),Zt=Math.max(0,(pt-2)/7),un=rt*2.094,bo=A*Math.sin(Zt*z+w)+5*Math.sin(1.7*n+1+un),Ao=S*Math.sin(Zt*C+b)+3*Math.sin(Zt*Math.PI)+2*Math.sin(1.3*n+un),qn=V*Math.sin(Zt*T+q)+4*Math.sin(1.6*n+2+un),dn=Oe-bo,mn=at-Ao,Bn=Math.sqrt(dn*dn+mn*mn+(it-qn)*(it-qn)),pn=M;if(Bn<pn){const Vn=Bn/pn;let st=Vn/.5;st=Math.min(1,st),st=st*st*(3-2*st);let lt=(Vn-.6)/.4;lt=Math.max(0,Math.min(1,lt)),lt=lt*lt*(3-2*lt);let At=Te,Dt=-ye;const In=Math.sqrt(At*At+Dt*Dt+.0025);At/=In,Dt/=In;const Un=(dn*At+mn*Dt)/pn*(st*(1-lt))*7*L*pe*(.75+.5*Mt);Oe+=At*Un,at+=Dt*Un}}}let wt=Oe,St=at+Ze,bt=it;if(n>=12){const te=n-12,N=Re*.5;let re=(te-N)/(2-N);re=Math.max(0,Math.min(1,re));const pe=re*re*re*(re*(re*6-15)+10);wt=Oe+(o-Oe)*pe,St=at+Ze+(a-at-Ze)*pe,bt=it+(i-it)*pe}return De<1&&(wt=o+(wt-o)*De,St=a+(St-a)*De,bt=i+(bt-i)*De),u?(u.x=wt,u.y=St,u.z=bt,u):{x:wt,y:St,z:bt}}const jn=75,h={initialZ:35,cameraAngleDeg:jn,zoomMin:10,zoomMax:200,fitMargin:56,zoomSpeed:.8,zoomLerp:.08,rotationStep:.03,rotationAutoReturnLerp:.02,autoReturnGracePeriodMs:300,canvasWidth:800,canvasHeight:150,fontSize:44,pixelStep:2,pixelThreshold:120,targetWorldWidth:80,emojiOptions:["😀","😂","😍","🥰","😎","🤔","😭","😡","😱","🥳","👍","👎","👏","🙏","👌","💪","❤️","🔥","✨","🎉"],emojiRasterSize:320,emojiPixelStep:2,emojiFontSize:280,emojiDensityOverride:1,emojiJitterXY:.03,emojiJitterZ:.5,emojiDepthCue:.06,emojiPointSize:1.6,emojiMotionMix:.35,emojiDepthRange:6,imageRasterSize:320,imagePixelStep:2,imageAlphaThreshold:16,imageJitterXY:.03,imageJitterZ:.5,imageDepthCue:.06,imagePointSize:1.2,imageDepthRange:5,density:8,jitterXY:.08,jitterZ:2.5,explosionSpeedMin:.4,explosionSpeedRange:.8,heatDistance:2/3*35*Math.tan(jn*Math.PI/360),afterglowDuration:.2,mouseInfluence:6,repulsionStrength:12,springK:.12,springDamping:.82,tapCount:5,tapWindowMs:800,inputDebounceMs:150,pointSize:.5,pointSizeAttenuationScale:120,clearColor:131589,maxPixelRatio:2,themes:{ember:{hot:[1,.95,.75],warm:[1,.45,.05],cold:[.92,.18,.05]},arctic:{hot:[.92,.98,1],warm:[.18,.75,1],cold:[.05,.35,.88]},toxic:{hot:[.92,1,.4],warm:[.35,.95,.15],cold:[.06,.58,.22]},neon:{hot:[1,.92,.98],warm:[1,.08,.55],cold:[.35,.05,.88]},sakura:{hot:[1,.95,.96],warm:[1,.45,.65],cold:[.85,.18,.42]}},presets:{KINETIC:{description:"A 3D surf wave rolls through your message — luminous crest, deep blue troughs.",expansionDuration:3.75,contractionDuration:3.75,explosionMaxDistMultiplier:22,motionStyle:3,trailStrength:.7,emberBudget:0,soundPitch:45,soundDuration:7.5,soundType:"sine"},TORNADO:{description:"A four-phase vortex funnel — particles accrete, spiral upward, then dissolve.",expansionDuration:3.5,vortexDuration:4.5,equilibriumDuration:3.5,contractionDuration:3.5,explosionMaxDistMultiplier:26,motionStyle:1,spinSpeed:4.8,funnelHeight:46,funnelBottom:-22,funnelCrownRadius:22,funnelWaistRadius:4.5,funnelTailRadius:1.8,funnelWaistT:.38,funnelCrownT:.82,funnelFadeStart:.03,funnelFadeEnd:.3,trailStrength:.75,emberBudget:90,soundPitch:75,soundDuration:15,soundType:"sawtooth"},BREEZE:{description:"A wind field bends, rolls and disperses your message like leaves in a gust.",expansionDuration:1,contractionDuration:1.6,explosionMaxDistMultiplier:28,motionStyle:2,trailStrength:.6,emberBudget:0,soundPitch:95,soundDuration:11.8,soundType:"sine"},EXPLODE:{description:"A volumetric blast — particles burst outward, hang in the air, then rush home.",expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:36,motionStyle:0,trailStrength:.3,emberBudget:140,soundPitch:110,soundDuration:6.2,soundType:"sine"},TORUS:{description:"Gravity forges your message into a flowing torus knot of light around a black hole, then lets it rain back home.",expansionDuration:8,contractionDuration:4,explosionMaxDistMultiplier:30,motionStyle:4,trailStrength:.8,emberBudget:50,soundPitch:40,soundDuration:16,soundType:"sine"},MURMURATION:{description:"Your message takes flight — whip turns, split-and-merge waves, falcon strikes and startle sparks, then it settles home.",expansionDuration:2,contractionDuration:2,explosionMaxDistMultiplier:30,motionStyle:5,trailStrength:.7,emberBudget:60,soundPitch:70,soundDuration:14,soundType:"sine"},DEFAULT:{expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:15,motionStyle:-1,spokes:12,spokeJitter:.03,spinSpeed:0,funnelHeight:0,funnelBottom:0,funnelCrownRadius:0,funnelWaistRadius:0,funnelTailRadius:0,funnelWaistT:0,funnelCrownT:0,funnelFadeStart:0,funnelFadeEnd:0,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"}}};let dt=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{dt=e.matches});let we=null;const Xo=384;let _t=0,Pe=null,Dn={w:80,h:80};const Wo=`
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
uniform vec3 uMouseWorld;
uniform float uMousePushDistance;
uniform float uMouseActive;

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
        if (uMouseActive > 0.5) {
            vec2 diff = livePos.xy - uMouseWorld.xy;
            float d = length(diff);
            if (d < uMouseInfluence && d > 0.001) {
                float f = (1.0 - d / uMouseInfluence) * uMousePushDistance;
                livePos.xy += (diff / d) * f;
            }
        }
    }

    // Smooth spatial gradient across the sculpture blended with mouse hover glow
    float spatialGrad = clamp((homePosition.y + 12.0) / 24.0 + 0.15 * sin(0.12 * homePosition.x), 0.0, 1.0);
    float mouseHeat = clamp(1.0 - distance(uMouse, livePos) / uMouseInfluence, 0.0, 1.0);
    float tMix = clamp(mix(spatialGrad, 1.0, mouseHeat * 0.9), 0.0, 1.0);
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
`,Zo=`
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
`,t={currentText:"Bring your message!",lastText:"Bring your message!",currentTheme:"ember",currentFont:"Outfit",messageMode:"text",activeImage:null,imageName:"",activePreset:null,lastRandomPreset:null,activeEmoji:null,lastEmoji:null,lastImage:null,lastImageName:"",audioEnabled:!0,gpuPhysics:!(typeof window<"u"&&(new URLSearchParams(window.location.search).get("noworker")==="1"||new URLSearchParams(window.location.search).get("gpu")==="0")),expansionDuration:h.presets.DEFAULT.expansionDuration,driftDuration:h.presets.DEFAULT.driftDuration||3,contractionDuration:h.presets.DEFAULT.contractionDuration,explosionMaxDistMultiplier:h.presets.DEFAULT.explosionMaxDistMultiplier,motionStyle:h.presets.DEFAULT.motionStyle,activeExpansionDuration:null,activeContractionDuration:null,activeMaxDist:null,actualTravelRadius:0,travelApplied:!1,embersSpawned:!1,dodgeEmbersFired:!1,afterglowStartTime:null,soundPitch:h.presets.DEFAULT.soundPitch,soundDuration:h.presets.DEFAULT.soundDuration,soundType:h.presets.DEFAULT.soundType,trailStrength:h.presets.DEFAULT.trailStrength,pattern:{spokes:h.presets.DEFAULT.spokes,spokeJitter:h.presets.DEFAULT.spokeJitter,spinSpeed:h.presets.DEFAULT.spinSpeed,funnelHeight:h.presets.DEFAULT.funnelHeight,funnelBottom:h.presets.DEFAULT.funnelBottom,funnelCrownRadius:h.presets.DEFAULT.funnelCrownRadius,funnelWaistRadius:h.presets.DEFAULT.funnelWaistRadius,funnelTailRadius:h.presets.DEFAULT.funnelTailRadius,funnelWaistT:h.presets.DEFAULT.funnelWaistT,funnelCrownT:h.presets.DEFAULT.funnelCrownT,funnelFadeStart:h.presets.DEFAULT.funnelFadeStart,funnelFadeEnd:h.presets.DEFAULT.funnelFadeEnd,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"},heatCold:[.1,.4,1],heatWarm:[1,1,.1],heatHot:[1,.1,.1],get totalExplosionDuration(){const e=s&&s.activeStyle>=0?s.activeStyle:this.motionStyle;if(e===1){const l=this.expansionDuration||3.5,n=this.pattern&&this.pattern.vortexDuration?this.pattern.vortexDuration:4.5,p=this.pattern&&this.pattern.equilibriumDuration?this.pattern.equilibriumDuration:3.5,u=this.contractionDuration||3.5;return l+n+p+u}if(e===2)return 11.8;if(e===3)return 7.5;if(e===4)return 16;if(e===5)return 14;const o=this.activeExpansionDuration||this.expansionDuration,a=this.activeContractionDuration||this.contractionDuration;return o+(e===0||e===-1?3:0)+a}},r={scene:null,camera:null,renderer:null,particles:null,clock:new Do,trailPoints:null,trailData:null,trailLive:null,trailPosAttr:null,trailLiveAttr:null,emberPoints:null,emberData:null,emberVel:null,emberLife:null,emberPosAttr:null,emberLifeAttr:null,targetZ:h.initialZ,autoFit:!0,prevTime:0,prevDt:0,prevKFrame:0,prevDampFrame:0},s={posHome:null,posLive:null,explosionOrigin:null,springDisp:null,springVel:null,randomDir:null,randomSpeed:null,funnelT:null,funnelRadialX:null,funnelRadialZ:null,activeStyle:-1,slots:[],sendQueue:[],seq:0,sourceGeneration:0,motionToken:0,explosionStartTime:-1,positionsDirty:!1,randomized:null};function jo(){return typeof window<"u"&&new URLSearchParams(window.location.search).get("noworker")==="1"?15e3:we||t.gpuPhysics?3e4:15e3}const Z={keys:{ArrowUp:!1,ArrowDown:!1,ArrowLeft:!1,ArrowRight:!1,"+":!1,"-":!1,"=":!1," ":!1},mouseWorld:new Ee,mouseLocal:new Ee,invMatrix:new Lo,mouseWorldPos:new Ee(-1e3,-1e3,0),lastClickTime:0,lastPinchDist:null,lastMidpoint:new ko,lastGestureEndTime:0,inputDebounceTimer:null,toastTimer:null,flashTimer:null,drawerCloseTimer:null,wordmarkTimer:null,menuRestoreDesktop:!1,menuRestoreMobile:!1,isDragging:!1,prevMouseX:0,prevMouseY:0,pendingPointer:null},D={uMouse:{value:new Ee(-1e3,-1e3,0)},uMouseInfluence:{value:h.mouseInfluence},uPointSize:{value:h.pointSize},uPixelRatio:{value:1},uPointScale:{value:h.pointSizeAttenuationScale/h.initialZ},uDepthCue:{value:.28},uColorHot:{value:new Ee(1,0,0)},uColorWarm:{value:new Ee(1,1,0)},uColorCold:{value:new Ee(1,1,1)},uExplosionActive:{value:0},uTornadoActive:{value:0},uTornadoFadeStart:{value:.03},uTornadoFadeEnd:{value:.3},uHeatDistance:{value:h.heatDistance},uHeatCold:{value:new Ee(.1,.4,1)},uHeatWarm:{value:new Ee(1,1,.1)},uHeatHot:{value:new Ee(1,.1,.1)},uAudioMid:{value:0},uAudioHigh:{value:0},uAudioEnvelope:{value:0},uPointSizeTrail:{value:.4},uTrailStrength:{value:.25},uEmojiMode:{value:0},uEmojiMotionMix:{value:h.emojiMotionMix},uUseSourceTexture:{value:0},uSourceTexture:{value:null},uGpuPhysics:{value:1},uMotionStyle:{value:0},uExplosionElapsed:{value:-1},uExpDuration:{value:2},uDriftDuration:{value:3},uContractionDuration:{value:2},uMaxDist:{value:35},uSpinSpeed:{value:5.2},uFunnelBottom:{value:-22},uFunnelHeight:{value:46},uFunnelCrownRadius:{value:22},uFunnelWaistRadius:{value:3.5},uFunnelTailRadius:{value:.8},uFunnelWaistT:{value:.42},uFunnelCrownExp:{value:1.4},uBreezeBlowDir:{value:1},uBreezeIntensity:{value:1},uBreezeSwirl:{value:0},uMSweepX:{value:24},uMSweepY:{value:4},uMSweepZ:{value:12},uMFreqX:{value:3.456},uMFreqY:{value:5.341},uMFreqZ:{value:2.827},uMPhX:{value:.4},uMPhY:{value:0},uMPhZ:{value:1.2},uMLaunchDir:{value:1},uMTurnT:{value:99},uMTurnDir:{value:1},uMSplitT:{value:99},uMSplitAng:{value:0},uMDodge1T:{value:3.9},uMDodge2T:{value:7.1},uMDodge3T:{value:99},uMDodgeRad:{value:8},uMDodgeStr:{value:1},uMBoilAmp:{value:0},uMBoilFreq:{value:14},uMChurnMult:{value:1},uMFlutterMult:{value:1},uMJinkAmp:{value:0},uMJinkFreq:{value:5.5},uMJinkPh:{value:0},uMBreathAmp:{value:1},uMScoutAmp:{value:0},uKnotScale:{value:11},uMouseWorld:{value:new Ee(-1e3,-1e3,0)},uMousePushDistance:{value:h.repulsionStrength},uMouseActive:{value:0}};let Yt=0,wn=null,hn=0,gn=0;function Ke(e,o="info"){const a=document.getElementById("toast");a&&(a.textContent=e,a.classList.remove("info","success","error"),a.classList.add(o==="success"||o==="error"?o:"info"),a.classList.add("show"),clearTimeout(Z.toastTimer),Z.toastTimer=setTimeout(()=>{a.classList.remove("show")},3e3))}function Lt(e){const o=document.getElementById("sr-announce");o&&(o.textContent=e)}function Yo(){const e=document.getElementById("flash");e&&(e.classList.remove("active"),e.offsetWidth,e.classList.add("active"),clearTimeout(Z.flashTimer),Z.flashTimer=setTimeout(()=>e.classList.remove("active"),120))}let Fe=null,Rt=null,Ne=null,ct=null;function Ho(){Fe&&Rt||(Fe||(Fe=new(window.AudioContext||window.webkitAudioContext)),Rt=Fe.createGain(),Rt.gain.value=1,Ne=Fe.createAnalyser(),Ne.fftSize=256,Ne.smoothingTimeConstant=.6,Rt.connect(Ne),Ne.connect(Fe.destination),ct=new Uint8Array(Ne.frequencyBinCount))}function vn(e,o,a,i){let l=0,n=0;const p=Math.max(0,Math.floor(o*i)),u=Math.min(i,Math.floor(a*i));for(let y=p;y<u;y++)l+=e[y]/255,n++;return n?l/n:0}function Go(){if(!Ne||!Fe||!ct)return;if(Fe.state!=="running"){D.uAudioEnvelope.value=0;return}if(s.explosionStartTime<0&&D.uAudioEnvelope.value<.005&&D.uAudioMid.value<.005&&D.uAudioHigh.value<.005){D.uAudioMid.value=0,D.uAudioHigh.value=0,D.uAudioEnvelope.value=0;return}Ne.getByteFrequencyData(ct);const e=ct.length,o=vn(ct,.02,.25,e),a=vn(ct,.25,.55,e),i=vn(ct,.55,.92,e);D.uAudioMid.value+=(a-D.uAudioMid.value)*.5,D.uAudioHigh.value+=(i-D.uAudioHigh.value)*.5;const l=Math.min(1,o*1.3+a*.5+i*.6);D.uAudioEnvelope.value+=(l-D.uAudioEnvelope.value)*.6}function Oo(e){try{if(Ho(),!Fe)return;const o=Fe.currentTime,a=Math.max(.3,e*.55),i=Fe.createOscillator();i.type="sine",i.frequency.setValueAtTime(85,o),i.frequency.exponentialRampToValueAtTime(32,o+a);const l=Fe.createGain();l.gain.setValueAtTime(1e-4,o),l.gain.exponentialRampToValueAtTime(.16,o+Math.min(.25,a*.3)),l.gain.exponentialRampToValueAtTime(1e-4,o+a),i.connect(l),l.connect(Rt),i.start(o),i.stop(o+a+.05),setTimeout(()=>{try{i.disconnect(),l.disconnect()}catch{}},(a+.1)*1e3)}catch(o){console.warn("Rumble synthesis error:",o)}}async function ro(e){if(!e)return;const o=`bold ${h.fontSize}px "${e}"`;try{await document.fonts.load(o)}catch(a){console.warn(`Font load note for "${e}":`,a)}}let Ht=null,Yn=null;function No(e){Ht||(Ht=document.createElement("canvas"),Yn=Ht.getContext("2d",{willReadFrequently:!0}));const o=Ht,a=Yn;o.width=h.canvasWidth,o.height=h.canvasHeight,a.fillStyle="black",a.fillRect(0,0,h.canvasWidth,h.canvasHeight),a.fillStyle="white",a.font=`bold ${h.fontSize}px "${t.currentFont}", sans-serif`,a.textAlign="center",a.textBaseline="middle",a.fillText(e,h.canvasWidth/2,h.canvasHeight/2);const i=a.getImageData(0,0,h.canvasWidth,h.canvasHeight).data,l=h.canvasWidth,n=h.canvasHeight,p=h.pixelStep,u=h.pixelThreshold;let y=0,X=1/0,x=-1/0,f=1/0,d=-1/0;for(let z=0;z<n;z+=p)for(let C=0;C<l;C+=p)i[(z*l+C)*4]>u&&(y++,C<X&&(X=C),C>x&&(x=C),z<f&&(f=z),z>d&&(d=z));if(y===0)return null;const k=h.targetWorldWidth/Math.max(x-X,1),c=(X+x)/2,A=(f+d)/2,S=new Float32Array(y*3);let V=0;for(let z=0;z<n;z+=p)for(let C=0;C<l;C+=p)i[(z*l+C)*4]>u&&(S[V++]=(C-c)*k,S[V++]=(A-z)*k,S[V++]=0);return S}let Gt=null,Hn=null;function _o(e){if(!e)return null;const o=e.naturalWidth||e.width,a=e.naturalHeight||e.height;if(!o||!a)return null;Gt||(Gt=document.createElement("canvas"),Hn=Gt.getContext("2d",{willReadFrequently:!0}));const i=h.imageRasterSize,l=Gt,n=Hn;l.width=i,l.height=i,n.clearRect(0,0,i,i),n.imageSmoothingEnabled=!0;const p=Math.round(i*.04),u=Math.min((i-p*2)/o,(i-p*2)/a),y=Math.max(1,Math.round(o*u)),X=Math.max(1,Math.round(a*u)),x=Math.round((i-y)/2),f=Math.round((i-X)/2);n.drawImage(e,x,f,y,X);const d=n.getImageData(0,0,i,i).data,k=h.imagePixelStep,c=h.imageAlphaThreshold,A=[],S=[],V=[],z=[],C=[];let T=1/0,w=-1/0,b=1/0,q=-1/0;const j=(m,U)=>m<0||U<0||m>=i||U>=i?0:d[(U*i+m)*4+3];for(let m=0;m<i;m+=k)for(let U=0;U<i;U+=k){const _=(m*i+U)*4,ee=d[_+3];if(ee<=c)continue;A.push(U,m),S.push(d[_],d[_+1],d[_+2]),V.push(ee),z.push(1);const oe=j(U-k,m)<=c||j(U+k,m)<=c||j(U,m-k)<=c||j(U,m+k)<=c;C.push(oe),U<T&&(T=U),U>w&&(w=U),m<b&&(b=m),m>q&&(q=m)}if(A.length===0)return null;const B=Math.max(w-T,1),P=Math.max(q-b,1),F=h.targetWorldWidth/Math.max(B,P),g=(T+w)/2,v=(b+q)/2,E=h.imageDepthRange*.5,M=A.length/2,L=[],Y=[],H=[],I=[],W=[];for(let m=0;m<M;m+=8){const U=A[m*2],_=A[m*2+1];L.push((U-g)*F,(v-_)*F,-E),Y.push(U/i,1-_/i),H.push(S[m*3],S[m*3+1],S[m*3+2]),I.push(V[m]),W.push(z[m])}for(let m=0;m<M;m++){if(!C[m])continue;const U=A[m*2],_=A[m*2+1],ee=S[m*3],oe=S[m*3+1],ne=S[m*3+2],ae=V[m],Q=z[m],K=U/i,le=1-_/i,ce=(U-g)*F,ue=(v-_)*F;L.push(ce,ue,-E*.33),Y.push(K,le),H.push(ee,oe,ne),I.push(ae),W.push(Q),L.push(ce,ue,E*.33),Y.push(K,le),H.push(ee,oe,ne),I.push(ae),W.push(Q)}for(let m=0;m<M;m++){const U=A[m*2],_=A[m*2+1];L.push((U-g)*F,(v-_)*F,E),Y.push(U/i,1-_/i),H.push(S[m*3],S[m*3+1],S[m*3+2]),I.push(V[m]),W.push(z[m])}const G=new Float32Array(L),$=new Float32Array(Y),se=new Uint8Array(H),O=new Uint8Array(I),J=new Uint8Array(W);return{flat:G,uvs:$,colors:se,covers:O,sizes:J,featureCount:M,frontCount:M,bounds:{w:B,h:P},sourceCanvas:l}}let Ot=null,Gn=null;function Ko(e){Ot||(Ot=document.createElement("canvas"),Gn=Ot.getContext("2d",{willReadFrequently:!0}));const o=Ot,a=Gn,i=h.emojiRasterSize;o.width=i,o.height=i,a.clearRect(0,0,i,i),a.fillStyle="white",a.font=`${h.emojiFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,a.textAlign="center",a.textBaseline="middle",a.fillText(e,i/2,i/2+i*.02);const l=a.getImageData(0,0,i,i).data,n=h.emojiPixelStep,p=h.pixelThreshold,u=[],y=[],X=[],x=[];let f=1/0,d=-1/0,k=1/0,c=-1/0;const A=(M,L)=>M<0||L<0||M>=i||L>=i?0:l[(L*i+M)*4+3];for(let M=0;M<i;M+=n)for(let L=0;L<i;L+=n){const Y=(M*i+L)*4,H=l[Y+3];if(H<=p)continue;u.push(L,M),y.push(l[Y],l[Y+1],l[Y+2]),X.push(H);const I=A(L-n,M)<=p||A(L+n,M)<=p||A(L,M-n)<=p||A(L,M+n)<=p;x.push(I),L<f&&(f=L),L>d&&(d=L),M<k&&(k=M),M>c&&(c=M)}if(u.length===0)return null;const S=h.targetWorldWidth/Math.max(d-f,1),V=(f+d)/2,z=(k+c)/2,T=h.emojiDepthRange*.5,w=u.length/2,b=[],q=[],j=[],B=[],P=[];for(let M=0;M<w;M+=4){const L=u[M*2],Y=u[M*2+1];b.push((L-V)*S,(z-Y)*S,-T),q.push(L/i,1-Y/i),j.push(y[M*3],y[M*3+1],y[M*3+2]),B.push(X[M]),P.push(1)}for(let M=0;M<w;M++){if(!x[M])continue;const L=u[M*2],Y=u[M*2+1],H=y[M*3],I=y[M*3+1],W=y[M*3+2],G=X[M],$=L/i,se=1-Y/i,O=(L-V)*S,J=(z-Y)*S;b.push(O,J,-T*.33),q.push($,se),j.push(H,I,W),B.push(G),P.push(1),b.push(O,J,T*.33),q.push($,se),j.push(H,I,W),B.push(G),P.push(1)}for(let M=0;M<w;M++){const L=u[M*2],Y=u[M*2+1];b.push((L-V)*S,(z-Y)*S,T),q.push(L/i,1-Y/i),j.push(y[M*3],y[M*3+1],y[M*3+2]),B.push(X[M]),P.push(1)}const F=new Float32Array(b),g=new Float32Array(q),v=new Uint8Array(j),R=new Uint8Array(B),E=new Uint8Array(P);return{flat:F,uvs:g,colors:v,covers:R,sizes:E,featureCount:w,frontCount:w,bounds:{w:d-f,h:c-k},sourceCanvas:o}}let Mn=0;async function qe(e,o=!1){Mn++;const a=Mn;await ro(t.currentFont);const i=`bold ${h.fontSize}px "${t.currentFont}"`;if(!document.fonts.check(i))try{await document.fonts.load(i)}catch(m){console.warn(`Failed to pre-load custom font "${t.currentFont}":`,m)}if(a!==Mn)return;s.sourceGeneration++,s.motionToken++,s.randomized=null;const l=!!r.particles;let n=null;if(l){const m=r.particles.geometry.attributes.position;n=m?m.array:null}const p=t.messageMode==="emoji"&&t.activeEmoji&&h.emojiOptions.includes(t.activeEmoji),u=t.messageMode==="image"&&!!t.activeImage,y=p?Ko(e):null,X=u?_o(t.activeImage):null,x=y||X,f=!!x,d=x?x.flat:u?null:No(e);if(!d){Ke(u?"The image has no visible pixels!":"Text must contain at least one visible character!","error");return}const{jitterXY:k,jitterZ:c,explosionSpeedMin:A,explosionSpeedRange:S}=h,V=f?h.emojiDensityOverride:h.density;let z=d.length/3,C=1;const T=jo(),w=Math.floor(T/V);let b=d,q=null,j=null,B=null,P=null;if(f){if(q=x.colors,j=x.covers,B=x.sizes,P=x.uvs||null,z>T){const m=[],U=x.frontCount||z;if(U<=T){for(let le=0;le<U;le++)m.push(le);const Q=T-U,K=z-U;if(Q>0&&K>0){const le=Math.max(1,Math.ceil(K/Q));for(let ce=U;ce<z&&m.length<T;ce+=le)m.push(ce)}}else{const Q=Math.ceil(U/T);for(let K=0;K<U&&m.length<T;K+=Q)m.push(K)}const _=new Float32Array(m.length*3),ee=new Uint8Array(m.length*3),oe=new Uint8Array(m.length),ne=new Uint8Array(m.length),ae=P?new Float32Array(m.length*2):null;for(let Q=0;Q<m.length;Q++){const K=m[Q];_[Q*3]=b[K*3],_[Q*3+1]=b[K*3+1],_[Q*3+2]=b[K*3+2],ee[Q*3]=q[K*3],ee[Q*3+1]=q[K*3+1],ee[Q*3+2]=q[K*3+2],oe[Q]=j[K],ne[Q]=B[K],ae&&P&&(ae[Q*2]=P[K*2],ae[Q*2+1]=P[K*2+1])}b=_,q=ee,j=oe,B=ne,P=ae,z=m.length}}else z*V>T&&(C=Math.max(1,Math.ceil(z/w)));const g=Math.ceil(z/C)*V;s.posHome=new Float32Array(g*3),s.posLive=new Float32Array(g*3),s.explosionOrigin=new Float32Array(g*3),s.springDisp=new Float32Array(g*3),s.springVel=new Float32Array(g*3),s.randomDir=new Float32Array(g*3),s.randomSpeed=new Float32Array(g),s.funnelT=new Float32Array(g),s.funnelRadialX=new Float32Array(g),s.funnelRadialZ=new Float32Array(g);const v=Math.PI*(3-Math.sqrt(5));for(let m=0;m<g;m++){const U=(m*.6180339887498949+.5)%1,_=.75+.3*((m*.7548776662466927+.17)%1),ee=m*v%(Math.PI*2);s.funnelT[m]=Math.pow(U,.85),s.funnelRadialX[m]=Math.cos(ee)*_,s.funnelRadialZ[m]=Math.sin(ee)*_}const R=new Uint8Array(g*4),E=new Uint8Array(g),M=new Float32Array(g*2),L=p?{xy:h.emojiJitterXY,z:h.emojiJitterZ}:{xy:h.imageJitterXY,z:h.imageJitterZ},Y=f?L.xy:k,H=f?L.z:c;let I=0;for(let m=0;m<z;m+=C,I++){const U=b[m*3],_=b[m*3+1],ee=b[m*3+2];for(let oe=0;oe<V;oe++){const ne=I*V+oe,ae=ne*3,Q=ae+1,K=ae+2,le=U+(Math.random()-.5)*Y,ce=_+(Math.random()-.5)*Y,ue=ee+(Math.random()-.5)*H;s.posHome[ae]=le,s.posHome[Q]=ce,s.posHome[K]=ue;const he=o?(Math.random()-.5)*45:0,fe=o?(Math.random()-.5)*45:0,Ce=o?(Math.random()-.5)*35:0;s.posLive[ae]=le+he,s.posLive[Q]=ce+fe,s.posLive[K]=ue+Ce,s.springDisp[ae]=he,s.springDisp[Q]=fe,s.springDisp[K]=Ce;const ge=Math.random()*Math.PI*2,ve=Math.acos(Math.random()*2-1);s.randomDir[ae]=Math.sin(ve)*Math.cos(ge),s.randomDir[Q]=Math.sin(ve)*Math.sin(ge),s.randomDir[K]=Math.cos(ve),s.randomSpeed[ne]=A+Math.random()*S,q?(R[ne*4]=q[m*3],R[ne*4+1]=q[m*3+1],R[ne*4+2]=q[m*3+2],R[ne*4+3]=j[m],E[ne]=B[m],P&&(M[ne*2]=P[m*2],M[ne*2+1]=P[m*2+1])):(R[ne*4]=255,R[ne*4+1]=255,R[ne*4+2]=255,R[ne*4+3]=255,E[ne]=1,M[ne*2]=0,M[ne*2+1]=0)}}Dn=da(),r.autoFit&&kt(),l&&!o&&n&&n.length===s.posLive.length&&(s.posLive.set(n),s.springDisp.fill(0),s.springVel.fill(0)),s.explosionOrigin.set(s.posLive),s.slots=[],s.sendQueue=[];for(let m=0;m<2;m++){const U={posLive:new Float32Array(g*3),springDisp:new Float32Array(g*3),springVel:new Float32Array(g*3),inFlight:!1,needsReset:!1};U.posLive.set(s.posLive),U.springDisp.set(s.springDisp),U.springVel.set(s.springVel),s.slots.push(U)}const W=!r.particles,G=W?new xn:r.particles.geometry,$=new xe(s.posLive,3);$.setUsage(Pt),G.setAttribute("position",$),G.setAttribute("homePosition",new xe(s.posHome,3)),G.setAttribute("sourceColor",new xe(R,4,!0)),G.setAttribute("sampleSize",new xe(E,1)),G.setAttribute("funnelT",new xe(s.funnelT,1)),G.setAttribute("aSourceUV",new xe(M,2)),Sn();const se=new Float32Array(g),O=new Float32Array(g*3),J=new Float32Array(g);for(let m=0;m<g;m++)se[m]=m,O[m*3]=s.funnelRadialX[m],O[m*3+1]=0,O[m*3+2]=s.funnelRadialZ[m],J[m]=m%2===0?1:-1;if(G.setAttribute("aRandomDir",new xe(new Float32Array(s.randomDir),3)),G.setAttribute("aRandomSpeed",new xe(new Float32Array(s.randomSpeed),1)),G.setAttribute("aIndex",new xe(se,1)),G.setAttribute("aSeed",new xe(O,3)),G.setAttribute("aCustomDir",new xe(J,1)),W){const m=new yn({uniforms:D,vertexShader:Wo,fragmentShader:Zo,blending:Qt,depthWrite:!1,transparent:!0});r.particles=new Tn(G,m),r.scene.add(r.particles)}if(D.uEmojiMode.value=f?1:0,D.uPointSize.value=p?h.emojiPointSize:u?h.imagePointSize:h.pointSize,D.uDepthCue.value=p?h.emojiDepthCue:u?h.imageDepthCue:.28,r.particles.material.blending=f?Fo:Qt,r.particles.material.needsUpdate=!0,D.uSourceTexture.value&&(D.uSourceTexture.value.dispose(),D.uSourceTexture.value=null),f&&x&&x.sourceCanvas){const m=new Co(x.sourceCanvas);m.minFilter=Xn,m.magFilter=Xn,m.needsUpdate=!0,D.uSourceTexture.value=m,D.uUseSourceTexture.value=1}else D.uUseSourceTexture.value=0;r.particles.rotation.set(0,0,0),we&&we.postMessage({type:"init",data:{posHome:s.posHome.slice(),explosionOrigin:s.explosionOrigin.slice(),randomDir:s.randomDir.slice(),randomSpeed:s.randomSpeed.slice(),funnelT:s.funnelT.slice(),funnelRadialX:s.funnelRadialX.slice(),funnelRadialZ:s.funnelRadialZ.slice()}}),Jo()}function Jo(){const e=s.posLive.length;r.trailData=new Float32Array(e),r.trailLive=new Float32Array(e),r.trailData.set(s.posLive),r.trailLive.set(s.posLive);const o=new xe(r.trailData,3);o.setUsage(Pt);const a=new xe(r.trailLive,3);a.setUsage(Pt),r.trailPoints&&(r.scene.remove(r.trailPoints),r.trailPoints.geometry.dispose(),r.trailPoints.material.dispose());const i=new xn;i.setAttribute("position",o),i.setAttribute("livePosition",a),i.setAttribute("homePosition",new xe(s.posHome,3)),i.setAttribute("funnelT",new xe(s.funnelT,1)),r.trailPoints=new Tn(i,new yn({uniforms:D,vertexShader:zo,fragmentShader:qo,blending:Qt,depthWrite:!1,transparent:!0})),r.trailPoints.frustumCulled=!1,r.scene.add(r.trailPoints),r.trailPosAttr=o,r.trailLiveAttr=a;const l=300;r.emberData=new Float32Array(l*3),r.emberVel=new Float32Array(l*3),r.emberLife=new Float32Array(l),r.emberCount=l;const n=new xe(r.emberData,3);n.setUsage(Pt);const p=new xe(r.emberLife,1);p.setUsage(Pt),r.emberPoints&&(r.scene.remove(r.emberPoints),r.emberPoints.geometry.dispose(),r.emberPoints.material.dispose());const u=new xn;u.setAttribute("position",n),u.setAttribute("aLife",p),r.emberPoints=new Tn(u,new yn({uniforms:{},vertexShader:Bo,fragmentShader:Vo,blending:Qt,depthWrite:!1,transparent:!0})),r.emberPoints.renderOrder=2,r.scene.add(r.emberPoints),r.emberPosAttr=n,r.emberLifeAttr=p}function Qo(){if(!r.particles||!r.trailData)return;if(dt&&r.trailPoints){r.trailPoints.visible=!1;return}if(t.gpuPhysics&&s.explosionStartTime>=0){r.trailPoints&&(r.trailPoints.visible=!1);return}if(r.trailPoints&&(r.trailPoints.visible=!0),s.positionsDirty||s.explosionStartTime>=0||Z.isDragging||Z.mouseLocal&&Z.mouseLocal.x>-500)r.trailSettleFrames=0;else{if(r.trailSettleFrames>=20)return;r.trailSettleFrames=(r.trailSettleFrames||0)+1}s.positionsDirty=!1;const o=r.particles.geometry.attributes.position.array,a=r.trailData,i=r.trailLive,l=.22;for(let n=0;n<o.length;n++)a[n]+=(o[n]-a[n])*l,i[n]=o[n];r.trailPosAttr.needsUpdate=!0,r.trailLiveAttr.needsUpdate=!0}function $o(){if(!r.emberData||!r.particles||dt)return;const e=t.activePreset&&h.presets[t.activePreset]||null,o=e&&e.emberBudget||90,a=Math.min(r.emberCount,o),i=r.particles.geometry.attributes.position.array,l=s.explosionOrigin||s.posHome,n=i.length,p=[];for(let u=0;u<n/3;u++){const y=u*3,X=i[y]-l[y],x=i[y+1]-l[y+1],f=i[y+2]-l[y+2];X*X+x*x+f*f>1&&p.push(u)}if(p.length!==0)for(let u=0;u<a;u++){const y=u*3,x=p[Math.random()*p.length|0]*3;r.emberData[y]=i[x],r.emberData[y+1]=i[x+1],r.emberData[y+2]=i[x+2];const f=i[x]-l[x],d=i[x+1]-l[x+1],k=i[x+2]-l[x+2],c=Math.sqrt(f*f+d*d+k*k)||1,A=3+Math.random()*14;r.emberVel[y]=f/c*A+(Math.random()-.5)*4,r.emberVel[y+1]=d/c*A+(Math.random()-.5)*4,r.emberVel[y+2]=k/c*A*.5+(Math.random()-.5)*2,r.emberLife[u]=.35+Math.random()*.45}}function ea(e,o){const a=e||{},i=a.mSweepX!=null?a.mSweepX:24,l=a.mSweepY!=null?a.mSweepY:4,n=a.mSweepZ!=null?a.mSweepZ:12,p=a.mFreqX!=null?a.mFreqX:3.456,u=a.mFreqY!=null?a.mFreqY:5.341,y=a.mFreqZ!=null?a.mFreqZ:2.827,X=a.mPhX!=null?a.mPhX:.4,x=a.mPhY!=null?a.mPhY:0,f=a.mPhZ!=null?a.mPhZ:1.2,d=Math.min(8.9,o*.92+1.1),k=Math.max(0,(d-2)/7);return{x:i*Math.sin(k*p+X)+5*Math.sin(1.7*o+1),y:l*Math.sin(k*u+x)+3*Math.sin(k*Math.PI)+2*Math.sin(1.3*o),z:n*Math.sin(k*y+f)+4*Math.sin(1.6*o+2)}}function ta(e){if(!r.emberData||!r.emberPoints||dt)return;const o=t.activePreset&&h.presets[t.activePreset]||null,a=o&&o.emberBudget||60,i=Math.min(r.emberCount,a),l=ea(t.pattern,e);for(let n=0;n<i;n++){const p=n*3;r.emberData[p]=l.x+(Math.random()-.5)*1.6,r.emberData[p+1]=l.y+(Math.random()-.5)*1.6,r.emberData[p+2]=l.z+(Math.random()-.5)*1.6;let u=Math.random()*2-1,y=Math.random()*2-1,X=Math.random()*2-1;const x=Math.sqrt(u*u+y*y+X*X)||1,f=5+Math.random()*8;r.emberVel[p]=u/x*f,r.emberVel[p+1]=y/x*f+3,r.emberVel[p+2]=X/x*f,r.emberLife[n]=.35+Math.random()*.45}r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0}function na(e){if(!r.emberData)return;if(dt&&r.emberPoints){r.emberPoints.visible=!1;return}r.emberPoints&&(r.emberPoints.visible=!0);const o=r.emberCount,a=Math.pow(.02,e);let i=0;for(let l=0;l<o;l++){if(r.emberLife[l]<=0)continue;i++;const n=l*3;r.emberData[n]+=r.emberVel[n]*e,r.emberData[n+1]+=r.emberVel[n+1]*e,r.emberData[n+2]+=r.emberVel[n+2]*e,r.emberVel[n+1]-=8*e,r.emberVel[n]*=a,r.emberVel[n+1]*=a,r.emberVel[n+2]*=a,r.emberLife[l]-=e,r.emberLife[l]<=0&&(r.emberLife[l]=0)}i>0&&(r.emberPosAttr.needsUpdate=!0,r.emberLifeAttr.needsUpdate=!0)}const On=new Ee;function Pn(e,o){const a=r.renderer.domElement.getBoundingClientRect(),i=(e-a.left)/a.width*2-1,l=-((o-a.top)/a.height)*2+1;r.camera.isOrthographicCamera&&(On.set(i,l,0).unproject(r.camera),Z.mouseWorld.copy(On),Z.mouseWorld.z=0)}function Sn(){if(!s.randomDir||!s.randomSpeed)return;const e=s.randomSpeed.length,{explosionSpeedMin:o,explosionSpeedRange:a}=h,i=t.pattern,l=s.posHome,n=typeof t.motionStyle=="number"&&t.motionStyle>=0?t.motionStyle:Math.floor(Math.random()*4);if(n===1){const w=Math.random()<.5?1:-1,b=(3.8+Math.random()*2.8)*w,q=38+Math.random()*16,j=18+Math.random()*12,B=2.4+Math.random()*2.8,P=.8+Math.random()*1.6,F=.32+Math.random()*.16,g=1.15+Math.random()*.65;t.pattern={...t.pattern,spinSpeed:b,funnelHeight:q,funnelCrownRadius:j,funnelWaistRadius:B,funnelTailRadius:P,funnelWaistT:F,funnelCrownExp:g}}Yt++;const p=[1.35,1.85,.9,2.2],y=p[Yt%p.length]*(.92+Math.random()*.16),x=(Yt%2===1?!0:Math.random()<.5)?1:-1;let f=x,d=(Math.random()-.5)*.08,k=(Math.random()-.5)*.05;const c=Math.sqrt(f*f+d*d+k*k)||1;f/=c,d/=c,k/=c;const A=[0,.85,1.45,.35,0,1.2],S=A[Yt%A.length],V=S===0?0:S*(.85+Math.random()*.3);Pe={blowDir:x,intensity:y,swirl:V,windAngleY:(Math.random()-.5)*.22,windAngleZ:(Math.random()-.5)*.12,strengthMult:y,easePower:1.45+Math.random()*.4,seedXi:Math.random()*100,peakX:(Math.random()-.5)*22,peakY:3.5+Math.random()*5,peakAmp:(16+Math.random()*7)*y,peakWidthX:.065+Math.random()*.025,peakWidthY:.11+Math.random()*.035,creaseY:-(3.5+Math.random()*4),creaseAmp:6.5+Math.random()*3,creaseFreq:.11+Math.random()*.04,billowAmp1:7.5+Math.random()*3,billowAmp2:3+Math.random()*2,depthAmp:13+Math.random()*4.5,turbAmp:3+Math.random()*1.8,shearMult:.22+Math.random()*.18},s.breeze=Pe;const z=Math.max(2,i.spokes||12),C=i.spokeJitter!=null?i.spokeJitter:.03,T=Math.PI*(3-Math.sqrt(5));for(let w=0;w<e;w++){const b=w*3,q=b+1,j=b+2;let B,P,F;if(n===1){const v=l[b],R=l[j],E=v*v+R*R;let M,L;if(E>1e-6){const H=1/Math.sqrt(E);M=-R*H,L=v*H}else{const H=Math.random()*Math.PI*2;M=Math.cos(H),L=Math.sin(H)}const Y=Math.random()<.5?1:-1;B=M*Y+(Math.random()-.5)*.15,P=.72+(Math.random()-.5)*.12,F=L*Y+(Math.random()-.5)*.15}else if(n===2){f=x,d=(Math.random()-.5)*.04,k=(Math.random()-.5)*.04;const v=Math.hypot(f,d,k)||1;f/=v,d/=v,k/=v,B=f*.92+(Math.random()*2-1)*.08,P=(Math.random()*2-1)*.12,F=(Math.random()*2-1)*.12}else if(n===3){const v=w%z,R=v*T,E=Math.acos(Math.max(-1,Math.min(1,1-2*(v+.5)/z))),M=Math.sin(E)*Math.cos(R),L=Math.sin(E)*Math.sin(R),Y=Math.cos(E);B=M+(Math.random()-.5)*2*C,P=L+(Math.random()-.5)*2*C,F=Y+(Math.random()-.5)*2*C}else{const v=Math.random()*Math.PI*2,R=Math.acos(Math.random()*2-1);B=Math.sin(R)*Math.cos(v),P=Math.sin(R)*Math.sin(v),F=Math.cos(R)}const g=Math.sqrt(B*B+P*P+F*F)||1;if(B/=g,P/=g,F/=g,n===2)s.randomSpeed[w]=(o+Math.random()*a)*(1.4+Math.random()*.9);else if(n===3)s.randomSpeed[w]=(o+Math.random()*a)*(1.5+Math.random()*.7);else{const v=.75+Math.random()*.55;s.randomSpeed[w]=(o+Math.random()*a)*v}s.randomDir[b]=B,s.randomDir[q]=P,s.randomDir[j]=F}if(s.randomized={dirs:s.randomDir.slice(0,Xo*3),style:n},s.activeStyle=n,r.particles&&r.particles.geometry){const w=r.particles.geometry.attributes.aRandomDir;w&&w.array&&w.array.length===s.randomDir.length&&(w.copyArray(s.randomDir),w.needsUpdate=!0);const b=r.particles.geometry.attributes.aRandomSpeed;b&&b.array&&b.array.length===s.randomSpeed.length&&(b.copyArray(s.randomSpeed),b.needsUpdate=!0)}}function oa(){if(!r.particles||!s.explosionOrigin)return;const e=r.particles.geometry.attributes.position.array;if(e.length===s.explosionOrigin.length){s.explosionOrigin.set(e),s.posLive.set(e),s.springDisp.fill(0),s.springVel.fill(0),s.motionToken++;for(const o of s.slots)o.inFlight?o.needsReset=!0:((!o.posLive||!o.posLive.buffer||o.posLive.buffer.byteLength===0)&&(o.posLive=new Float32Array(e.length),o.springDisp=new Float32Array(e.length),o.springVel=new Float32Array(e.length)),o.posLive.set(e),o.springDisp.fill(0),o.springVel.fill(0),o.needsReset=!1)}}function so(e){document.querySelectorAll(".preset-chip").forEach(a=>{a.disabled=e,a.classList.toggle("disabled",e),e?a.setAttribute("aria-disabled","true"):a.removeAttribute("aria-disabled")})}function gt(e=!1){if(s.explosionStartTime>=0)return;if(s.explosionStartTime=-1,oa(),t.actualTravelRadius=0,t.travelApplied=!1,t.embersSpawned=!1,t.dodgeEmbersFired=!1,t.afterglowStartTime=null,_t=0,t.motionStyle===5){const l=Math.random()<.55?4.3+Math.random()*2:99;let n=l<90?99:3.3+Math.random()*2.6;if(l<90){const X=l-1.4,x=l+1.4;let f=3.3+Math.random()*2.6;f>X&&f<x&&(f=f<l?Math.max(3.3,X-.8*Math.random()):Math.min(5.9,x+.8*Math.random()),f>X&&f<x&&(f=99)),n=f}const p=3.25+Math.random()*.55,u=p+1.35+Math.random()*.7;let y=99;if(Math.random()<.45){const X=u+1.35+Math.random()*.5;y=X<=6.95?X:99}t.pattern={...t.pattern,mSweepX:16+Math.random()*14,mSweepY:3.5+Math.random()*4,mSweepZ:8+Math.random()*8,mFreqX:2.8+Math.random()*1.2,mFreqY:4.6+Math.random()*1.4,mFreqZ:2.2+Math.random()*1.2,mPhX:Math.random()*6.283,mPhY:Math.random()*6.283,mPhZ:Math.random()*6.283,mLaunchDir:Math.random()<.5?1:-1,mTurnT:n,mTurnDir:Math.random()<.5?1:-1,mSplitT:l,mSplitAng:Math.random()*6.283,mDodge1T:p,mDodge2T:u,mDodge3T:y,mDodgeRad:6.5+Math.random()*3,mDodgeStr:.85+Math.random()*.6,mBoilAmp:1.4+Math.random()*.8,mBoilFreq:11+Math.random()*3,mChurnMult:1.2+Math.random()*.6,mFlutterMult:1.25+Math.random()*.6,mJinkAmp:2.5+Math.random()*1.7,mJinkFreq:4.5+Math.random()*2.5,mJinkPh:Math.random()*6.283,mBreathAmp:1.25+Math.random()*.65,mScoutAmp:.85+Math.random()*.45}}t.activeMaxDist=t.explosionMaxDistMultiplier*(.8+Math.random()*.4),t.activeExpansionDuration=t.expansionDuration*(.85+Math.random()*.3),t.activeContractionDuration=t.contractionDuration||4;const o=t.activeContractionDuration;t.gpuPhysics?Sn():we?we.postMessage({type:"randomize",data:{explosionSpeedMin:h.explosionSpeedMin,explosionSpeedRange:h.explosionSpeedRange,motionStyle:t.motionStyle,pattern:t.pattern,breeze:Pe,explosionOrigin:s.explosionOrigin.slice(),motionToken:s.motionToken,sourceGeneration:s.sourceGeneration}}):Sn(),s.explosionStartTime=r.clock.getElapsedTime(),so(!0),ya();const a=t.activePreset||t.lastRandomPreset,i=a&&h.presets[a]?h.presets[a]:null;nn(i&&i.description?i.description:tn(t.messageMode)),(t.motionStyle===0||t.motionStyle===-1)&&Yo(),t.audioEnabled&&Uo(t,o),Lt(`Explosion triggered for "${t.currentText}"`)}function Ft(e,o,a,i=!0){const l=new URL(window.location);l.searchParams.set("t",e),l.searchParams.set("theme",o),l.searchParams.set("font",a),i?window.history.pushState({},"",l):window.history.replaceState({},"",l)}function Rn(e){t.activeExpansionDuration=null,t.activeContractionDuration=null,t.expansionDuration=e.expansionDuration,t.driftDuration=e.driftDuration!==void 0?e.driftDuration:0,t.contractionDuration=e.contractionDuration,t.explosionMaxDistMultiplier=e.explosionMaxDistMultiplier,t.motionStyle=e.motionStyle!=null?e.motionStyle:-1,s.activeStyle=t.motionStyle,t.soundPitch=e.soundPitch,t.soundDuration=e.soundDuration,t.soundType=e.soundType,t.trailStrength=e.trailStrength!=null?e.trailStrength:.25,t.pattern={spokes:e.spokes!=null?e.spokes:12,spokeJitter:e.spokeJitter!=null?e.spokeJitter:.03,spinSpeed:e.spinSpeed!=null?e.spinSpeed:0,funnelHeight:e.funnelHeight!=null?e.funnelHeight:0,funnelBottom:e.funnelBottom!=null?e.funnelBottom:0,funnelCrownRadius:e.funnelCrownRadius!=null?e.funnelCrownRadius:0,funnelWaistRadius:e.funnelWaistRadius!=null?e.funnelWaistRadius:0,funnelTailRadius:e.funnelTailRadius!=null?e.funnelTailRadius:0,funnelWaistT:e.funnelWaistT!=null?e.funnelWaistT:0,funnelCrownT:e.funnelCrownT!=null?e.funnelCrownT:0,funnelFadeStart:e.funnelFadeStart!=null?e.funnelFadeStart:0,funnelFadeEnd:e.funnelFadeEnd!=null?e.funnelFadeEnd:0,vortexDuration:e.vortexDuration!=null?e.vortexDuration:4.5,equilibriumDuration:e.equilibriumDuration!=null?e.equilibriumDuration:3.5,swayAmp:e.swayAmp!=null?e.swayAmp:0,swayFreq:e.swayFreq!=null?e.swayFreq:0,gustAmp:e.gustAmp!=null?e.gustAmp:0,gustFreq:e.gustFreq!=null?e.gustFreq:0,windDrift:e.windDrift!=null?e.windDrift:0,turbulence:e.turbulence!=null?e.turbulence:0};const o=h.themes[t.currentTheme]||h.themes.ember;t.heatCold=o.cold,t.heatWarm=o.warm,t.heatHot=o.hot,D.uHeatCold.value.set(...t.heatCold),D.uHeatWarm.value.set(...t.heatWarm),D.uHeatHot.value.set(...t.heatHot),D.uTornadoFadeStart.value=t.pattern.funnelFadeStart,D.uTornadoFadeEnd.value=t.pattern.funnelFadeEnd,D.uTrailStrength.value=t.trailStrength}function ht(){Rn(h.presets.DEFAULT)}function bn(){if(s.explosionStartTime>=0||t.activePreset)return;const e=Object.keys(h.presets).filter(a=>a!=="DEFAULT"),o=e[Math.floor(Math.random()*e.length)];Rn(h.presets[o]),t.lastRandomPreset=o}function Kt(e,o=!0){const a=h.themes[e]||h.themes.ember;t.currentTheme=e,D.uColorHot.value.set(...a.hot),D.uColorWarm.value.set(...a.warm),D.uColorCold.value.set(...a.cold),D.uHeatHot.value.set(...a.hot),D.uHeatWarm.value.set(...a.warm),D.uHeatCold.value.set(...a.cold),document.querySelectorAll(".theme-swatch").forEach(i=>{const l=i.getAttribute("data-theme")===e;i.classList.toggle("active",l),i.setAttribute("aria-pressed",l?"true":"false")}),Ft(t.currentText,t.currentTheme,t.currentFont,o),Lt(`Theme changed to ${e}`)}async function lo(e,o=!0,a=!1){t.currentFont=e,document.querySelectorAll("#font-select, #drawer-font-select").forEach(i=>{i.value=e}),t.messageMode!=="text"&&(t.messageMode="text",ut("text")),t.activeEmoji&&(t.activeEmoji=null,Ue(null)),await ro(e),await qe(t.currentText,a),Ft(t.currentText,t.currentTheme,t.currentFont,o),Lt(`Font changed to ${e}`)}async function co(e,o=!0){const a=e.trim(),i=a.length>0?a:"Bring your message!";t.currentText=i,t.messageMode==="text"&&(t.lastText=i),await qe(i,!1),Ft(t.currentText,t.currentTheme,t.currentFont,o),Lt(`Text updated to "${t.currentText}"`)}function En(e){const o=document.querySelectorAll(".char-counter");if(!o.length)return;const a=[...e].length;o.forEach(i=>{i.textContent=`${a}/25`,i.classList.remove("warning","danger"),a>=25?i.classList.add("danger"):a>=20&&i.classList.add("warning")})}async function An(e,o=!1){Rn(h.presets[e]||h.presets.DEFAULT),o&&await qe(t.currentText,!0)}const aa="#drawer, #menu-toggle-btn, #drawer-backdrop, #dock, #topbar, #input-bar, #hint, #toast",Ct=e=>!!e.target.closest(aa);function ia(e){if(Ct(e)||(e.pointerType==="mouse"&&(Z.isDragging=!0,Z.prevMouseX=e.clientX,Z.prevMouseY=e.clientY),e.pointerType==="touch"&&!e.isPrimary))return;const o=performance.now();Z.clickCount=o-Z.lastClickTime<h.tapWindowMs?Z.clickCount+1:1,Z.lastClickTime=o,Z.clickCount>=h.tapCount&&(bn(),gt(),Z.clickCount=0)}function ra(e){if(!Ct(e)){if(e.touches.length===1)Pn(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const o=e.touches[0].clientX-e.touches[1].clientX,a=e.touches[0].clientY-e.touches[1].clientY;Z.lastPinchDist=Math.sqrt(o*o+a*a),Z.lastMidpoint.set((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2)}}}function sa(e){if(!Ct(e)){if(e.preventDefault(),e.touches.length===1)Pn(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const o=e.touches[0].clientX-e.touches[1].clientX,a=e.touches[0].clientY-e.touches[1].clientY,i=Math.sqrt(o*o+a*a);Z.lastPinchDist&&(r.targetZ-=(i-Z.lastPinchDist)*.15,r.autoFit=!1),Z.lastPinchDist=i;const l=(e.touches[0].clientX+e.touches[1].clientX)/2,n=(e.touches[0].clientY+e.touches[1].clientY)/2;r.particles&&(r.particles.rotation.y+=(l-Z.lastMidpoint.x)*.005,r.particles.rotation.x+=(n-Z.lastMidpoint.y)*.005),Z.lastMidpoint.set(l,n)}}}function Nn(e){e.pointerType==="mouse"&&(Z.isDragging=!1)}function la(){Z.lastPinchDist=null,Z.lastGestureEndTime=performance.now()}function kt(){const e=document.getElementById("stage"),o=Math.max(e.clientWidth,1),a=Math.max(e.clientHeight,1);r.camera.aspect=o/a;const i=r.camera.position.z*Math.tan(h.cameraAngleDeg*Math.PI/360),l=i*r.camera.aspect;r.camera.left=-l,r.camera.right=l,r.camera.top=i,r.camera.bottom=-i,r.camera.updateProjectionMatrix(),r.renderer.setSize(o,a,!1);const n=Math.min(window.devicePixelRatio,h.maxPixelRatio);r.renderer.setPixelRatio(n),D.uPixelRatio.value=n,r.autoFit&&(r.targetZ=ma(o,a))}function ca(){const e=document.getElementById("topbar");return e?e.getBoundingClientRect().height:0}function ua(){const e=document.getElementById("dock");if(e){if(e.classList.contains("collapsed")){const i=e.firstElementChild;return(i?i.getBoundingClientRect().height:0)+24}const a=e.getBoundingClientRect();if(a.height>0)return a.height}const o=document.getElementById("input-bar");if(o){const a=o.getBoundingClientRect();if(a.height>0)return a.height}return 0}function da(){const e=s.posHome;if(!e||e.length===0)return{w:80,h:80};let o=1/0,a=-1/0,i=1/0,l=-1/0;for(let u=0;u<e.length;u+=3){const y=e[u],X=e[u+1];y<o&&(o=y),y>a&&(a=y),X<i&&(i=X),X>l&&(l=X)}const n=a-o,p=l-i;return!isFinite(n)||!isFinite(p)||n<1e-6||p<1e-6?{w:80,h:80}:{w:n,h:p}}function ma(e,o){const a=Math.tan(h.cameraAngleDeg*Math.PI/360),i=Dn,l=h.fitMargin,n=Math.max(e-2*l,1),p=Math.max(o-(ca()+l)-(ua()+l),1),u=i.w*o/(2*a*n),y=i.h*o/(2*a*p);return Math.min(h.zoomMax,Math.max(u,y,h.zoomMin))}const pa="Type a message — your words become thousands of glowing particles.",fa="Pick an emoji — it bursts into thousands of glowing, colorful particles.",ha="Upload an image — its pixels become thousands of glowing particles.";function tn(e){return e==="emoji"?fa:e==="image"?ha:pa}function nn(e){const o=document.getElementById("context-line");o&&(o.textContent=e);const a=document.getElementById("mobile-context-line");a&&(a.textContent=e)}function Jt(e){t.activePreset=e,document.querySelectorAll(".preset-chip").forEach(i=>{i.getAttribute("data-text")===e?i.classList.add("active"):i.classList.remove("active")});const a=h.presets[e];nn(a&&a.description?a.description:tn(t.messageMode))}function _e(){t.activePreset=null,document.querySelectorAll(".preset-chip").forEach(o=>{o.classList.remove("active")}),nn(tn(t.messageMode))}function Ue(e){document.querySelectorAll(".emoji-chip").forEach(a=>{a.classList.toggle("active",a.getAttribute("data-emoji")===e)})}function ut(e){const o=e==="emoji"||e==="image"?e:"text";t.messageMode=o,document.querySelectorAll(".message-option").forEach(i=>{const l=i.getAttribute("data-message-mode")===o;i.classList.toggle("active",l),i.setAttribute("aria-selected",l?"true":"false")}),document.querySelectorAll(".text-message-mode").forEach(i=>{i.hidden=o!=="text"}),document.querySelectorAll(".emoji-message-mode").forEach(i=>{i.hidden=o!=="emoji"}),document.querySelectorAll(".image-message-mode").forEach(i=>{i.hidden=o!=="image"});const a=document.getElementById("input-bar");a&&(a.style.display=o==="text"?"":"none")}function _n(){r.particles&&(r.scene.remove(r.particles),r.particles=null),r.trailPoints&&(r.trailPoints.visible=!1),r.emberPoints&&(r.emberPoints.visible=!1),s.posHome=new Float32Array(0),s.posLive=new Float32Array(0),s.explosionOrigin=new Float32Array(0),s.springDisp=new Float32Array(0),s.springVel=new Float32Array(0),s.randomDir=new Float32Array(0),s.randomSpeed=new Float32Array(0),s.funnelT=new Float32Array(0),s.funnelRadialX=new Float32Array(0),s.funnelRadialZ=new Float32Array(0),s.slots=[],s.sendQueue=[],s.sourceGeneration++,s.motionToken++,Dn={w:80,h:80}}async function ga(e){if(ut(e),_e(),ht(),t.messageMode==="emoji"){t.activeImage=null;const o=t.lastEmoji&&h.emojiOptions.includes(t.lastEmoji)?t.lastEmoji:null;o?(t.activeEmoji=o,Ue(o),$t(o),await qe(o,!1),Ft(o,t.currentTheme,t.currentFont,!0)):(t.activeEmoji=null,Ue(null),_n())}else if(t.messageMode==="image"){t.activeEmoji=null,Ue(null);const o=document.querySelectorAll(".image-name");t.lastImage?(t.activeImage=t.lastImage,o.forEach(a=>{a.textContent=t.lastImageName}),await qe(t.currentText,!1)):(t.activeImage=null,o.forEach(a=>{a.textContent="No file chosen"}),_n())}else{t.activeEmoji=null,t.activeImage=null,Ue(null);const o=t.lastText&&t.lastText.trim()||"Bring your message!";t.currentText=o,$t(o),await qe(o,!1),Ft(t.currentText,t.currentTheme,t.currentFont,!0)}}function va(e){if(!e)return;if(!e.type.startsWith("image/")){Ke("Please choose an image file!","error");return}const o=URL.createObjectURL(e),a=new Image;a.onload=async()=>{URL.revokeObjectURL(o),ut("image"),t.activeImage=a,t.lastImage=a,t.lastImageName=e.name,t.imageName=e.name,t.activeEmoji=null,Ue(null),_e(),ht(),document.querySelectorAll(".image-name").forEach(i=>{i.textContent=e.name}),await qe(t.currentText,!1),Lt(`Image uploaded: ${e.name}`)},a.onerror=()=>{URL.revokeObjectURL(o),Ke("Could not read that image!","error")},a.src=o}const Ma=1e3;function Kn(){clearTimeout(Z.drawerCloseTimer),Z.drawerCloseTimer=setTimeout(vt,Ma)}function uo(){clearTimeout(Z.drawerCloseTimer)}function mo(){const e=document.getElementById("drawer"),o=document.getElementById("drawer-backdrop"),a=document.getElementById("menu-toggle-btn");uo(),e&&e.classList.add("open"),o&&o.classList.add("active"),a&&a.setAttribute("aria-expanded","true")}function vt(){const e=document.getElementById("drawer"),o=document.getElementById("drawer-backdrop"),a=document.getElementById("menu-toggle-btn");uo(),e&&e.classList.remove("open"),o&&o.classList.remove("active"),a&&a.setAttribute("aria-expanded","false")}function xa(){const e=document.getElementById("drawer");e&&e.classList.contains("open")?vt():mo()}function po(){const e=document.getElementById("dock");if(!e||e.classList.contains("collapsed"))return!1;e.classList.add("collapsed");const o=document.getElementById("dock-toggle-btn");return o&&(o.setAttribute("aria-expanded","false"),o.title="Expand controls"),!0}function fo(){const e=document.getElementById("dock");if(!e)return;e.classList.remove("collapsed");const o=document.getElementById("dock-toggle-btn");o&&(o.setAttribute("aria-expanded","true"),o.title="Collapse controls")}function Fn(){r.autoFit&&(kt(),setTimeout(()=>{r.autoFit&&kt()},460))}function ya(){const e=document.getElementById("dock");Z.menuRestoreDesktop=!!(e&&!e.classList.contains("collapsed")),po();const o=document.getElementById("drawer");Z.menuRestoreMobile=!!(o&&o.classList.contains("open")),vt(),Fn()}function Ta(){Z.menuRestoreMobile&&(Z.menuRestoreMobile=!1,mo()),Z.menuRestoreDesktop&&(Z.menuRestoreDesktop=!1,fo()),Fn()}function $t(e){document.querySelectorAll("#text-input, #mobile-text-input").forEach(o=>{o.value=e}),En(e)}function Jn(e){ut("text"),_e(),t.activeEmoji=null,t.activeImage=null,Ue(null),ht(),En(e),clearTimeout(Z.inputDebounceTimer),Z.inputDebounceTimer=setTimeout(async()=>{await co(e)},h.inputDebounceMs)}function wa(){r.renderer.render(r.scene,r.camera),r.renderer.domElement.toBlob(e=>{if(!e)return;const o=URL.createObjectURL(e),a=document.createElement("a"),i=(t.messageMode==="image"&&t.imageName?t.imageName:t.currentText).replace(/[^a-z0-9]/gi,"_").toLowerCase();a.download=`artz-sculpture-${i||"kinetic"}.png`,a.href=o,a.click(),setTimeout(()=>URL.revokeObjectURL(o),1e3)},"image/png")}async function Sa(){try{const e=new URLSearchParams;t.activeEmoji?e.set("t",t.activeEmoji):t.messageMode==="text"&&t.currentText&&e.set("t",t.currentText),t.currentTheme&&t.currentTheme!=="ember"&&e.set("theme",t.currentTheme),t.currentFont&&t.currentFont!=="Outfit"&&e.set("font",t.currentFont),t.activePreset&&e.set("preset",t.activePreset);const o=e.toString(),a=`${window.location.origin}${window.location.pathname}${o?"?"+o:""}`;if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(a);else{const i=document.createElement("input");i.value=a,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i)}Ke("Link copied to clipboard!","success")}catch{Ke("Could not copy link","error")}}function ba(){t.audioEnabled=!t.audioEnabled,document.querySelectorAll(".audio-btn").forEach(e=>{e.setAttribute("aria-pressed",t.audioEnabled.toString()),e.title=t.audioEnabled?"Toggle Sound (Mute/Unmute)":"Sound: MUTED (Click to unmute)"}),document.querySelectorAll(".audio-icon").forEach(e=>{e.textContent=(t.audioEnabled,"??")}),Ke(t.audioEnabled?"?? Sound effects enabled":"?? Sound effects muted")}function en(){const e=document.getElementById("hint");e&&e.classList.add("dismissed");try{localStorage.setItem("artz-hint-seen","1")}catch{}}function Aa(){const e=document.getElementById("text-input"),o=document.getElementById("mobile-text-input"),a=document.getElementById("menu-toggle-btn"),i=document.getElementById("menu-close-btn"),l=document.getElementById("drawer-backdrop"),n=document.getElementById("drawer"),p=document.getElementById("dock-toggle-btn"),u=document.getElementById("hint-dismiss"),y=document.getElementById("wordmark");if(y){const d=[{cls:"is-rippling",ms:1400},{cls:"is-playing",ms:1800},{cls:"is-dropping",ms:1600},{cls:"is-imploding",ms:1700}],k=700,c=()=>d.map(C=>C.cls),A=C=>{y.setAttribute("aria-label",C?"KINETICS — click to play title animation":"KINETICS — click to stop the title animation"),y.title=C?"Click to play":"Click to stop"};let S=!1,V=0;const z=()=>{const C=d[V];V=(V+1)%d.length,y.classList.remove(...c()),y.offsetWidth,y.classList.add(C.cls),Z.wordmarkTimer=setTimeout(z,C.ms+k)};y.addEventListener("click",()=>{dt||(S=!S,clearTimeout(Z.wordmarkTimer),S?(V=0,A(!1),z()):(A(!0),y.classList.remove(...c())))})}a&&a.addEventListener("click",()=>{xa()}),i&&i.addEventListener("click",()=>{vt()}),l&&l.addEventListener("click",()=>{vt()}),n&&(n.addEventListener("click",d=>{d.target.closest(".message-option")||d.target.closest("select")||Kn()}),n.querySelectorAll("select").forEach(d=>{d.addEventListener("change",Kn)})),p&&p.addEventListener("click",()=>{const d=document.getElementById("dock");d&&(d.classList.contains("collapsed")?fo():po(),Fn())}),u&&u.addEventListener("click",en);try{localStorage.getItem("artz-hint-seen")==="1"&&en()}catch{}wn=document.getElementById("status-fps");const X=document.getElementById("status-gpu");X&&(X.textContent=t.gpuPhysics?"GPU":we?"WORKER":"CPU"),nn(tn(t.messageMode)),e&&(e.value=t.currentText,En(t.currentText),e.addEventListener("input",()=>{o&&o.value!==e.value&&(o.value=e.value),Jn(e.value)})),o&&(o.value=t.currentText,o.addEventListener("input",()=>{e&&e.value!==o.value&&(e.value=o.value),Jn(o.value)})),document.querySelectorAll(".message-option").forEach(d=>{d.addEventListener("click",()=>{ga(d.getAttribute("data-message-mode"))})}),document.querySelectorAll(".image-input").forEach(d=>{d.addEventListener("change",()=>{va(d.files&&d.files[0]),d.value=""})}),document.querySelectorAll(".theme-swatch").forEach(d=>{d.addEventListener("click",()=>{_e(),ht(),Kt(d.getAttribute("data-theme"))})}),document.querySelectorAll("#font-select, #drawer-font-select").forEach(d=>{d.value=t.currentFont,d.addEventListener("change",async()=>{_e(),ht(),await lo(d.value)})}),document.querySelectorAll(".capture-btn").forEach(d=>{d.addEventListener("click",wa)}),document.querySelectorAll(".share-btn").forEach(d=>{d.addEventListener("click",Sa)}),document.querySelectorAll(".audio-btn").forEach(d=>{d.addEventListener("click",ba)}),document.querySelectorAll(".preset-chip").forEach(d=>{d.addEventListener("click",async()=>{if(s.explosionStartTime>=0)return;const k=d.getAttribute("data-text");await An(k),Jt(k),gt()})}),document.querySelectorAll(".emoji-chip").forEach(d=>{d.addEventListener("click",async()=>{const k=d.getAttribute("data-emoji");k&&(ut("emoji"),_e(),ht(),t.activeEmoji=k,t.lastEmoji=k,Ue(k),$t(k),await co(k))})})}function Qn(){if(we){try{we.terminate()}catch{}we=null;for(const e of s.slots)e.inFlight=!1;s.sendQueue.length=0}}const Et=[1,1.25,1.5,2];let Da={level:Et.length-1,slowStreak:0,fastStreak:0};function $n(e){const o=Math.min(window.devicePixelRatio,Et[e]);r.renderer.setPixelRatio(o),D.uPixelRatio.value=o}function Pa(e){const o=Da;if(e>28)o.slowStreak++,o.fastStreak=0,o.slowStreak>=30&&(o.slowStreak=0,o.level>0&&(o.level--,$n(o.level)));else if(e<16){o.fastStreak++,o.slowStreak=0;const a=Et.length-1;o.fastStreak>=120&&o.level<a&&Math.min(window.devicePixelRatio,Et[o.level+1])>Math.min(window.devicePixelRatio,Et[o.level])&&(o.fastStreak=0,o.level++,$n(o.level))}else o.slowStreak=0,o.fastStreak=0}function ho(){const e=performance.now();requestAnimationFrame(ho),hn++,performance.now()-gn>=500&&(wn&&(wn.textContent=`${Math.round(hn*1e3/(performance.now()-gn))} FPS`),hn=0,gn=performance.now());const o=r.clock.getElapsedTime(),a=Math.min(o-r.prevTime,.05);r.prevTime=o,Go();const{keys:i,invMatrix:l,lastGestureEndTime:n}=Z,{particles:p,camera:u}=r;if(p){i.ArrowUp&&(p.rotation.x-=h.rotationStep,Z.lastGestureEndTime=performance.now()),i.ArrowDown&&(p.rotation.x+=h.rotationStep,Z.lastGestureEndTime=performance.now()),i.ArrowLeft&&(p.rotation.y-=h.rotationStep,Z.lastGestureEndTime=performance.now()),i.ArrowRight&&(p.rotation.y+=h.rotationStep,Z.lastGestureEndTime=performance.now());const I=i.ArrowUp||i.ArrowDown||i.ArrowLeft||i.ArrowRight,W=performance.now()-n<h.autoReturnGracePeriodMs;if(!I&&!Z.lastPinchDist&&!W&&!Z.isDragging){const G=h.rotationAutoReturnLerp;p.rotation.x=jt.lerp(p.rotation.x,0,G),p.rotation.y=jt.lerp(p.rotation.y,0,G)}}(i["+"]||i["="])&&(r.targetZ-=h.zoomSpeed,r.autoFit=!1),i["-"]&&(r.targetZ+=h.zoomSpeed,r.autoFit=!1),r.targetZ=jt.clamp(r.targetZ,h.zoomMin,h.zoomMax),u.position.z=jt.lerp(u.position.z,r.targetZ,h.zoomLerp),Math.abs(u.position.z-r.targetZ)<.005&&(u.position.z=r.targetZ);const y=u.position.z*Math.tan(h.cameraAngleDeg*Math.PI/360),X=y*u.aspect;if(u.left=-X,u.right=X,u.top=y,u.bottom=-y,u.updateProjectionMatrix(),D.uPointScale.value=h.pointSizeAttenuationScale/u.position.z,!p){r.renderer.render(r.scene,u);return}if(Z.pendingPointer){const I=Z.pendingPointer;if(Pn(I.clientX,I.clientY),Z.isDragging&&I.pointerType==="mouse"){const W=I.clientX-Z.prevMouseX,G=I.clientY-Z.prevMouseY;r.particles&&(r.particles.rotation.y+=W*.005,r.particles.rotation.x+=G*.005),Z.prevMouseX=I.clientX,Z.prevMouseY=I.clientY,Z.lastGestureEndTime=performance.now()}Z.pendingPointer=null}l.copy(p.matrixWorld).invert(),Z.mouseLocal.copy(Z.mouseWorld).applyMatrix4(l);const x=s.explosionStartTime>=0;x?D.uMouse.value.set(-1e3,-1e3,0):D.uMouse.value.copy(Z.mouseLocal);const f=p.geometry.attributes.position,d=f.array,k=f.count,{posHome:c,explosionOrigin:A,springDisp:S,springVel:V,randomDir:z,randomSpeed:C,funnelT:T,funnelRadialX:w,funnelRadialZ:b}=s,q=h.mouseInfluence,j=q*q,B=h.repulsionStrength,P=Z.mouseLocal;let F,g;Math.abs(a-r.prevDt)<1e-4?(F=r.prevKFrame,g=r.prevDampFrame):(F=h.springK*(a*60),g=Math.pow(h.springDamping,a*60),r.prevDt=a,r.prevKFrame=F,r.prevDampFrame=g);let v=-1,R=0;const E=s.activeStyle>=0?s.activeStyle:t.motionStyle,M=t.activeExpansionDuration||t.expansionDuration,L=t.activeContractionDuration||t.contractionDuration,Y=t.activeMaxDist||t.explosionMaxDistMultiplier;if(s.explosionStartTime>=0)if(v=o-s.explosionStartTime,v>t.totalExplosionDuration)s.explosionStartTime=-1,s.motionToken++,S.fill(0),V.fill(0),t.afterglowStartTime=o,v=-1,d&&c&&(d.set(c),f.needsUpdate=!0),r.trailPoints&&!dt&&(r.trailPoints.visible=!0),_e(),so(!1),Ta();else{(E===0||E===-1)&&v>=M+3&&!t.travelApplied&&(t.activeContractionDuration=t.contractionDuration||2,t.travelApplied=!0,t.audioEnabled&&Oo(t.activeContractionDuration)),v>=M&&!t.embersSpawned&&(t.embersSpawned=!0,E!==5&&$o());const I=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9;E===5&&!t.dodgeEmbersFired&&v>=I&&(t.dodgeEmbersFired=!0,ta(v));const W=t.activeContractionDuration||t.contractionDuration;v<M?R=v/M:R=1-(v-M)/W}let H;if(s.explosionStartTime>=0?H=1:t.afterglowStartTime!=null?(H=Math.max(0,1-(o-t.afterglowStartTime)/h.afterglowDuration),H<=0&&(t.afterglowStartTime=null)):H=0,D.uExplosionActive.value=H,D.uTornadoActive.value=s.explosionStartTime>=0&&s.activeStyle===1?1:0,r.particles&&(r.particles.frustumCulled=R===0),r.particles&&!Z.isDragging&&s.explosionStartTime>=0&&E===3&&v>=0&&v<=7.5){const I=v/7.5,W=Math.pow(Math.sin(Math.PI*I),1.2),G=.26*W,$=-.36*W;r.particles.rotation.x=G,r.particles.rotation.y=$,r.trailPoints&&(r.trailPoints.rotation.x=G,r.trailPoints.rotation.y=$)}if(t.gpuPhysics&&x){r.trailPoints&&(r.trailPoints.visible=!1),D.uGpuPhysics.value=1,D.uMotionStyle.value=E>=0?E:0,D.uExplosionElapsed.value=s.explosionStartTime>=0?v:-1,D.uExpDuration.value=M,D.uDriftDuration.value=E===0||E===-1?3:0,D.uContractionDuration.value=L,D.uMaxDist.value=Y,D.uSpinSpeed.value=t.pattern&&t.pattern.spinSpeed||5.2,D.uFunnelBottom.value=t.pattern&&t.pattern.funnelBottom||-22,D.uFunnelHeight.value=t.pattern&&t.pattern.funnelHeight||46,D.uFunnelCrownRadius.value=t.pattern&&t.pattern.funnelCrownRadius||22,D.uFunnelWaistRadius.value=t.pattern&&t.pattern.funnelWaistRadius||3.5,D.uFunnelTailRadius.value=t.pattern&&t.pattern.funnelTailRadius||.8,D.uFunnelWaistT.value=t.pattern&&t.pattern.funnelWaistT||.42,D.uFunnelCrownExp.value=t.pattern&&t.pattern.funnelCrownExp||1.4,D.uBreezeBlowDir.value=Pe&&Pe.blowDir||1,D.uBreezeIntensity.value=Pe&&Pe.intensity||1,D.uBreezeSwirl.value=Pe&&Pe.swirl!=null?Pe.swirl:0,D.uMSweepX.value=t.pattern&&t.pattern.mSweepX!=null?t.pattern.mSweepX:24,D.uMSweepY.value=t.pattern&&t.pattern.mSweepY!=null?t.pattern.mSweepY:4,D.uMSweepZ.value=t.pattern&&t.pattern.mSweepZ!=null?t.pattern.mSweepZ:12,D.uMFreqX.value=t.pattern&&t.pattern.mFreqX!=null?t.pattern.mFreqX:3.456,D.uMFreqY.value=t.pattern&&t.pattern.mFreqY!=null?t.pattern.mFreqY:5.341,D.uMFreqZ.value=t.pattern&&t.pattern.mFreqZ!=null?t.pattern.mFreqZ:2.827,D.uMPhX.value=t.pattern&&t.pattern.mPhX!=null?t.pattern.mPhX:.4,D.uMPhY.value=t.pattern&&t.pattern.mPhY!=null?t.pattern.mPhY:0,D.uMPhZ.value=t.pattern&&t.pattern.mPhZ!=null?t.pattern.mPhZ:1.2,D.uMLaunchDir.value=t.pattern&&t.pattern.mLaunchDir!=null?t.pattern.mLaunchDir:1,D.uMTurnT.value=t.pattern&&t.pattern.mTurnT!=null?t.pattern.mTurnT:99,D.uMTurnDir.value=t.pattern&&t.pattern.mTurnDir!=null?t.pattern.mTurnDir:1,D.uMSplitT.value=t.pattern&&t.pattern.mSplitT!=null?t.pattern.mSplitT:99,D.uMSplitAng.value=t.pattern&&t.pattern.mSplitAng!=null?t.pattern.mSplitAng:0,D.uMDodge1T.value=t.pattern&&t.pattern.mDodge1T!=null?t.pattern.mDodge1T:3.9,D.uMDodge2T.value=t.pattern&&t.pattern.mDodge2T!=null?t.pattern.mDodge2T:7.1,D.uMDodge3T.value=t.pattern&&t.pattern.mDodge3T!=null?t.pattern.mDodge3T:99,D.uMDodgeRad.value=t.pattern&&t.pattern.mDodgeRad!=null?t.pattern.mDodgeRad:8,D.uMDodgeStr.value=t.pattern&&t.pattern.mDodgeStr!=null?t.pattern.mDodgeStr:1,D.uMBoilAmp.value=t.pattern&&t.pattern.mBoilAmp!=null?t.pattern.mBoilAmp:0,D.uMBoilFreq.value=t.pattern&&t.pattern.mBoilFreq!=null?t.pattern.mBoilFreq:14,D.uMChurnMult.value=t.pattern&&t.pattern.mChurnMult!=null?t.pattern.mChurnMult:1,D.uMFlutterMult.value=t.pattern&&t.pattern.mFlutterMult!=null?t.pattern.mFlutterMult:1,D.uMJinkAmp.value=t.pattern&&t.pattern.mJinkAmp!=null?t.pattern.mJinkAmp:0,D.uMJinkFreq.value=t.pattern&&t.pattern.mJinkFreq!=null?t.pattern.mJinkFreq:5.5,D.uMJinkPh.value=t.pattern&&t.pattern.mJinkPh!=null?t.pattern.mJinkPh:0,D.uMBreathAmp.value=t.pattern&&t.pattern.mBreathAmp!=null?t.pattern.mBreathAmp:1,D.uMScoutAmp.value=t.pattern&&t.pattern.mScoutAmp!=null?t.pattern.mScoutAmp:0;{const I=r.camera,W=I.top-I.bottom,G=I.right-I.left,$=Math.max(1,Math.min(G,W))*.205;D.uKnotScale.value=$,t.pattern.knotScale=$}D.uMouseWorld.value.set(-1e3,-1e3,0),D.uMousePushDistance.value=0,D.uMouseInfluence.value=0,D.uMouseActive.value=0}else if(D.uGpuPhysics.value=0,we){let I=null;for(const W of s.slots)if(!W.inFlight){I=W;break}I&&(I.needsReset&&(I.posLive.set(s.explosionOrigin),I.springDisp.fill(0),I.springVel.fill(0),I.needsReset=!1),I.inFlight=!0,I.seq=s.seq++,s.sendQueue.push(I),we.postMessage({type:"update",data:{posLive:I.posLive,springDisp:I.springDisp,springVel:I.springVel,count:k,dt:a,elapsed:v,mouseLocal:x?{x:99999,y:99999,z:99999}:{x:P.x,y:P.y,z:P.z},kFrame:F,dampFrame:g,expansionDuration:M,driftDuration:E===0||E===3||E===-1?3:0,contractionDuration:L,explosionMaxDistMultiplier:Y,mouseInfluence:x?0:q,repulsionStr:x?0:B,breeze:Pe,sourceGeneration:s.sourceGeneration,motionToken:s.motionToken},seq:I.seq},[I.posLive.buffer,I.springDisp.buffer,I.springVel.buffer]))}else{const I=t.pattern,W={x:0,y:0,z:0},G=E===1&&I.funnelHeight&&T&&w&&b,$=A||c,se=E===0||E===3||E===-1?3:0;for(let O=0;O<k;O++){const J=O*3,m=J+1,U=J+2;let _,ee,oe;if(v>=0)if(E===1&&G)eo(O,c[J],c[m],c[U],T[O],w[O],b[O],(C?C[O]:1)*.35+.85,v,I,W),_=W.x,ee=W.y,oe=W.z;else if(E===2)to(O,c[J],c[m],c[U],(C?C[O]:1)*.35+.85,v,Pe,W),_=W.x,ee=W.y,oe=W.z;else if(E===3)oo(O,c[J],c[m],c[U],(C?C[O]:1)*.35+.85,v,I,W),_=W.x,ee=W.y,oe=W.z;else if(E===4)ao(O,c[J],c[m],c[U],(C?C[O]:1)*.35+.85,v,I,W),_=W.x,ee=W.y,oe=W.z;else if(E===5)io(O,c[J],c[m],c[U],(C?C[O]:1)*.35+.85,v,I,W),_=W.x,ee=W.y,oe=W.z;else{const ge=C[O]*Y;no($[J],$[m],$[U],z[J],z[m],z[U],ge,M,se,L,v,W),_=W.x,ee=W.y,oe=W.z}else _=c[J],ee=c[m],oe=c[U];const ne=d[J],ae=d[m],Q=d[U],K=ne-P.x,le=ae-P.y,ce=Q-P.z,ue=K*K+le*le+ce*ce;let he=0,fe=0,Ce=0;if(!x&&ue<j&&ue>1e-5){const ge=Math.sqrt(ue),ve=1/ge,be=(q-ge)/q,Me=B*be;he=K*ve*Me,fe=le*ve*Me,Ce=ce*ve*Me}if(V[J]=(V[J]+(he-S[J])*F)*g,V[m]=(V[m]+(fe-S[m])*F)*g,V[U]=(V[U]+(Ce-S[U])*F)*g,S[J]+=V[J],S[m]+=V[m],S[U]+=V[U],d[J]=_+S[J],d[m]=ee+S[m],d[U]=oe+S[U],v>=0){const ge=d[J]-$[J],ve=d[m]-$[m],be=d[U]-$[U],Me=ge*ge+ve*ve+be*be;Me>_t&&(_t=Me)}}t.actualTravelRadius=Math.sqrt(_t),f.needsUpdate=!0,s.positionsDirty=!0}Qo(),na(a),r.renderer.render(r.scene,u),Pa(performance.now()-e)}async function Ra(){r.scene=new Po,r.camera=new Ro(-1,1,1,-1,-600,600),r.camera.position.z=r.targetZ,r.renderer=new Eo({antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1}),r.renderer.setClearColor(h.clearColor,1);const e=r.renderer.domElement;if(e.setAttribute("role","img"),e.setAttribute("aria-label","Kinetic particle sculpture — interactive particle animation"),e.addEventListener("webglcontextlost",f=>{f.preventDefault(),Ke("WebGL context lost — attempting restoration...")},!1),e.addEventListener("webglcontextrestored",async()=>{Ke("WebGL context restored"),await qe(t.currentText,!1)},!1),document.getElementById("stage").appendChild(e),kt(),!(new URLSearchParams(window.location.search).get("noworker")==="1"))try{we=new Worker(new URL("/ParticlesSimulations/assets/physics.worker-D8g2mlMV.js",import.meta.url),{type:"module"}),we.onmessage=function(f){const{type:d,seq:k,posLive:c,springDisp:A,springVel:S,travelRadius:V,sourceGeneration:z,motionToken:C}=f.data;if(d==="randomized"){if(f.data.sourceGeneration!==s.sourceGeneration||f.data.motionToken!==s.motionToken)return;s.randomized={dirs:f.data.dirs,style:f.data.style},s.activeStyle=f.data.style;return}if(d==="update"){let T=-1;for(let q=0;q<s.sendQueue.length;q++)if(s.sendQueue[q].seq===k){T=q;break}if(T===-1)return;const w=s.sendQueue.splice(T,1)[0];if(w.inFlight=!1,w.posLive=c,w.springDisp=A,w.springVel=S,z!==s.sourceGeneration||C!==s.motionToken)return;typeof V=="number"&&V>0&&(t.actualTravelRadius=V);const b=r.particles&&r.particles.geometry.attributes.position;b&&b.array.length===c.length&&(b.array.set(c),b.needsUpdate=!0,s.positionsDirty=!0)}},we.onerror=()=>{console.error("Physics worker error — switching to CPU fallback."),Qn()},we.onmessageerror=()=>{console.error("Physics worker message error — switching to CPU fallback."),Qn()}}catch(f){console.error("Failed to initialize physics Web Worker:",f)}await document.fonts.ready.catch(()=>{});const a=window.location.search||(window.location.hash.includes("?")?window.location.hash.substring(window.location.hash.indexOf("?")):""),i=new URLSearchParams(a),l=i.get("text")||i.get("t")||i.get("emoji")||"Bring your message!",n=i.get("theme")||"ember",p=i.get("font")||"Outfit",u=i.get("preset");i.get("gpu")==="0"&&(t.gpuPhysics=!1),t.currentText=l,t.currentTheme=n,t.currentFont=p,h.emojiOptions.includes(l)?(t.activeEmoji=l,t.lastEmoji=l,t.messageMode="emoji",t.lastText="Bring your message!"):(t.messageMode="text",t.lastText=l);const X=l.toUpperCase(),x=u?u.toUpperCase():h.presets[X]&&X!=="DEFAULT"?X:null;x&&h.presets[x]?(Kt(n,!1),await qe(t.currentText,!1),await An(x,!1),Jt(x)):h.presets[X]&&X!=="DEFAULT"?(await An(X,!1),Jt(X)):(Kt(n,!1),await qe(t.currentText,!1)),Aa(),ut(t.messageMode),window.addEventListener("pointermove",f=>{Z.pendingPointer={clientX:f.clientX,clientY:f.clientY,pointerType:f.pointerType}}),window.addEventListener("pointerdown",ia),window.addEventListener("pointerdown",f=>{Ct(f)||en()}),window.addEventListener("keydown",f=>{(f.key===" "||f.key.startsWith("Arrow")||f.key==="+"||f.key==="-"||f.key==="=")&&en()}),window.addEventListener("pointerup",Nn),window.addEventListener("pointercancel",Nn),window.addEventListener("pointerleave",()=>{Z.mouseWorld.set(-1e3,-1e3,0),D.uMouse.value.set(-1e3,-1e3,0),Z.isDragging=!1}),window.addEventListener("dblclick",f=>{Ct(f)||s.explosionStartTime>=0||(bn(),gt())}),window.addEventListener("touchstart",ra,{passive:!1}),window.addEventListener("touchmove",sa,{passive:!1}),window.addEventListener("touchend",la),window.addEventListener("resize",kt),window.addEventListener("keydown",f=>{if(f.key==="Escape"){const d=document.getElementById("drawer");if(d&&d.classList.contains("open")){vt();return}}Z.keys[f.key]=!0,(f.code==="Space"||f.key.startsWith("Arrow"))&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="SELECT"&&(f.preventDefault(),f.code==="Space"&&s.explosionStartTime<0&&(bn(),gt()))}),window.addEventListener("keyup",f=>Z.keys[f.key]=!1),window.addEventListener("popstate",async()=>{const f=new URLSearchParams(window.location.search),d=f.get("t")||"Bring your message!",k=f.get("theme")||"ember",c=f.get("font")||"Outfit";t.currentText=d,t.currentTheme=k,t.currentFont=c;const A=h.emojiOptions.includes(d);t.activeEmoji=A?d:null,A?t.lastEmoji=d:t.lastText=d,ut(A?"emoji":"text"),$t(d),Kt(k,!1),A?(Ue(d),await qe(d,!1)):await lo(c,!1);const S=d.toUpperCase();h.presets[S]&&S!=="DEFAULT"?Jt(S):_e(),Ue(t.activeEmoji)}),ho()}window.__artzDebug={_render:()=>r,triggerExplosion:gt,get particleCount(){return s.posLive?s.posLive.length/3:0},get usingWorker(){return!!we},get usingGpu(){return t.gpuPhysics},get geometryCount(){return r.renderer?r.renderer.info.memory.geometries:-1},get textureCount(){return r.renderer?r.renderer.info.memory.textures:-1},get renderCalls(){return r.renderer?r.renderer.info.render.calls:-1},snapshot(e=96){var n;const o=s.posHome,a=s.explosionOrigin,i=Math.min(e*3,o?o.length:0);let l=(n=r.particles)==null?void 0:n.geometry.attributes.position.array;if(t.gpuPhysics&&s.explosionStartTime>=0&&o){const p=r.clock.getElapsedTime()-s.explosionStartTime,u=s.activeStyle>=0?s.activeStyle:t.motionStyle,y=t.activeExpansionDuration||t.expansionDuration,X=t.activeContractionDuration||t.contractionDuration,x=t.activeMaxDist||t.explosionMaxDistMultiplier,f=u===0||u===3||u===-1?3:0,d={x:0,y:0,z:0},k=new Float32Array(i);for(let c=0;c<i/3;c++){const A=c*3,S=A+1,V=A+2;if(u===1)eo(c,o[A],o[S],o[V],s.funnelT?s.funnelT[c]:0,s.funnelRadialX?s.funnelRadialX[c]:0,s.funnelRadialZ?s.funnelRadialZ[c]:0,(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else if(u===2)to(c,o[A],o[S],o[V],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,Pe,d);else if(u===3)oo(c,o[A],o[S],o[V],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else if(u===4)ao(c,o[A],o[S],o[V],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else if(u===5)io(c,o[A],o[S],o[V],(s.randomSpeed?s.randomSpeed[c]:1)*.35+.85,p,t.pattern,d);else{const z=(s.randomSpeed?s.randomSpeed[c]:1)*x,C=a||o;no(C[A],C[S],C[V],s.randomDir?s.randomDir[A]:0,s.randomDir?s.randomDir[S]:0,s.randomDir?s.randomDir[V]:0,z,y,f,X,p,d)}k[A]=d.x,k[S]=d.y,k[V]=d.z}l=k}return{position:l?Array.from(l.slice(0,i)):[],home:o?Array.from(o.slice(0,i)):[],explosionOrigin:a?Array.from(a.slice(0,i)):[],funnelT:s.funnelT?Array.from(s.funnelT.slice(0,e)):[],activeStyle:s.activeStyle,funnelProfile:{height:t.pattern.funnelHeight||0,bottom:t.pattern.funnelBottom||0,tailRadius:Nt(.05,t.pattern),waistRadius:Nt(.5,t.pattern),crownRadius:Nt(.95,t.pattern),fadeStart:t.pattern.funnelFadeStart||0,fadeEnd:t.pattern.funnelFadeEnd||0},rotation:r.particles?[r.particles.rotation.x,r.particles.rotation.y,r.particles.rotation.z]:[0,0,0],sourceGeneration:s.sourceGeneration,motionToken:s.motionToken,explosionActive:s.explosionStartTime>=0,elapsed:s.explosionStartTime>=0?r.clock.getElapsedTime()-s.explosionStartTime:-1,expDuration:t.activeExpansionDuration||t.expansionDuration,conDuration:t.activeContractionDuration||t.contractionDuration,randomized:s.randomized?{style:s.randomized.style,dirs:Array.from(s.randomized.dirs)}:{style:-1,dirs:[]}}},triggerExplosion:gt};Ra();
