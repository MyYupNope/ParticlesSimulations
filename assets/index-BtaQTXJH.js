import{C as Kn,S as Qn,O as $n,W as Jn,V as Ae,B as Jt,a as ge,D as wt,b as en,A as Xt,P as tn,N as eo,c as to,L as xn,d as no,M as oo,e as Ft}from"./three-DqLVpfpE.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))i(l);new MutationObserver(l=>{for(const t of l)if(t.type==="childList")for(const f of t.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&i(f)}).observe(document,{childList:!0,subtree:!0});function o(l){const t={};return l.integrity&&(t.integrity=l.integrity),l.referrerPolicy&&(t.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?t.credentials="include":l.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(l){if(l.ep)return;l.ep=!0;const t=o(l);fetch(l.href,t)}})();const ao=`
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
`,io=`
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
`,so=`
attribute float aLife;
varying float vLife;

void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.5 + 3.0 * aLife);
}
`,ro=`
varying float vLife;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float a = (1.0 - r) * vLife;
    vec3 c = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.95, 0.7), vLife);
    gl_FragColor = vec4(c, a);
}
`;let st=null,_t=null;function lo(){return!st&&(window.AudioContext||window.webkitAudioContext)&&(st=new(window.AudioContext||window.webkitAudioContext)),st&&st.state==="suspended"&&st.resume(),st}function ke(e){if(_t)return _t;const n=e.sampleRate*2,o=e.createBuffer(1,n,e.sampleRate),i=o.getChannelData(0);for(let l=0;l<n;l++)i[l]=Math.random()*2-1;return _t=o,o}function co(e,n){const o=lo();if(!o)return;const i=typeof e=="object"&&e!==null?e:{soundDuration:e||n},l=i.motionStyle!=null?i.motionStyle:typeof state<"u"&&state&&state.motionStyle!=null?state.motionStyle:0,t=o.currentTime,f=o.createGain();f.gain.setValueAtTime(1e-4,t),f.gain.linearRampToValueAtTime(.4,t+.02),f.connect(o.destination);const d=i.soundDuration||n||1.5,b=i.soundPitch||140,H=i.soundType||"sine";if(l===1){const y=o.createBufferSource();y.buffer=ke(o),y.loop=!0;const w=o.createBiquadFilter();w.type="bandpass",w.frequency.setValueAtTime(60,t),w.frequency.linearRampToValueAtTime(180,t+3.5),w.frequency.exponentialRampToValueAtTime(580,t+6),w.frequency.linearRampToValueAtTime(320,t+8),w.frequency.linearRampToValueAtTime(220,t+11.5),w.frequency.exponentialRampToValueAtTime(45,t+15),w.Q.value=2.8;const M=o.createGain();M.gain.setValueAtTime(1e-4,t),M.gain.exponentialRampToValueAtTime(.18,t+3),M.gain.linearRampToValueAtTime(.38,t+6),M.gain.linearRampToValueAtTime(.24,t+11.5),M.gain.exponentialRampToValueAtTime(1e-4,t+15),y.connect(w),w.connect(M),M.connect(f),y.start(t),y.stop(t+15+.1),setTimeout(()=>{try{y.disconnect(),w.disconnect(),M.disconnect(),f.disconnect()}catch{}},(15+.2)*1e3);return}if(l===2){const y=o.createBufferSource();y.buffer=ke(o),y.loop=!0;const w=o.createBiquadFilter();w.type="bandpass",w.frequency.setValueAtTime(90,t),w.frequency.linearRampToValueAtTime(130,t+1),w.frequency.linearRampToValueAtTime(75,t+3),w.frequency.exponentialRampToValueAtTime(620,t+6.6),w.frequency.exponentialRampToValueAtTime(100,t+10.2),w.frequency.exponentialRampToValueAtTime(50,t+11.8),w.Q.value=1.2;const M=o.createGain();M.gain.setValueAtTime(1e-4,t),M.gain.exponentialRampToValueAtTime(.14,t+1),M.gain.exponentialRampToValueAtTime(.01,t+3),M.gain.linearRampToValueAtTime(.32,t+6.6),M.gain.linearRampToValueAtTime(.05,t+10.2),M.gain.exponentialRampToValueAtTime(1e-4,t+11.8),y.connect(w),w.connect(M),M.connect(f),y.start(t),y.stop(t+11.8+.1),setTimeout(()=>{try{y.disconnect(),w.disconnect(),M.disconnect(),f.disconnect()}catch{}},(11.8+.2)*1e3);return}if(l===3){const y=typeof o.createStereoPanner=="function"?o.createStereoPanner():null;y&&(y.pan.setValueAtTime(-.75,t),y.pan.linearRampToValueAtTime(.75,t+7.5),y.connect(f));const w=y||f,M=o.createOscillator();M.type="sine",M.frequency.setValueAtTime(32,t),M.frequency.linearRampToValueAtTime(48,t+2.5),M.frequency.linearRampToValueAtTime(58,t+4.2),M.frequency.linearRampToValueAtTime(36,t+5.8),M.frequency.exponentialRampToValueAtTime(20,t+7.5);const z=o.createGain();z.gain.setValueAtTime(1e-4,t),z.gain.exponentialRampToValueAtTime(.24,t+2),z.gain.linearRampToValueAtTime(.48,t+4.2),z.gain.linearRampToValueAtTime(.18,t+5.8),z.gain.exponentialRampToValueAtTime(1e-4,t+7.5),M.connect(z),z.connect(w),M.start(t),M.stop(t+7.5+.1);const Z=o.createBufferSource();Z.buffer=ke(o),Z.loop=!0;const k=o.createBiquadFilter();k.type="lowpass",k.frequency.setValueAtTime(140,t),k.frequency.exponentialRampToValueAtTime(420,t+2.2),k.frequency.exponentialRampToValueAtTime(1250,t+4.2),k.frequency.linearRampToValueAtTime(550,t+5.6),k.frequency.exponentialRampToValueAtTime(75,t+7.5),k.Q.value=1.1;const D=o.createGain();D.gain.setValueAtTime(1e-4,t),D.gain.exponentialRampToValueAtTime(.18,t+1.8),D.gain.linearRampToValueAtTime(.52,t+4.2),D.gain.linearRampToValueAtTime(.22,t+5.6),D.gain.exponentialRampToValueAtTime(1e-4,t+7.5),Z.connect(k),k.connect(D),D.connect(w),Z.start(t),Z.stop(t+7.5+.1);const R=o.createBufferSource();R.buffer=ke(o),R.loop=!0;const g=o.createBiquadFilter();g.type="bandpass",g.frequency.setValueAtTime(1400,t),g.frequency.exponentialRampToValueAtTime(2400,t+3.8),g.frequency.exponentialRampToValueAtTime(3200,t+4.6),g.frequency.linearRampToValueAtTime(1800,t+6),g.frequency.exponentialRampToValueAtTime(600,t+7.5),g.Q.value=1.4;const x=o.createGain();x.gain.setValueAtTime(1e-4,t),x.gain.exponentialRampToValueAtTime(.04,t+2.5),x.gain.linearRampToValueAtTime(.38,t+4.4),x.gain.linearRampToValueAtTime(.26,t+5.4),x.gain.exponentialRampToValueAtTime(1e-4,t+7.5),R.connect(g),g.connect(x),x.connect(w),R.start(t),R.stop(t+7.5+.1);const P=o.createBufferSource();P.buffer=ke(o),P.loop=!0;const E=o.createBiquadFilter();E.type="bandpass",E.frequency.setValueAtTime(700,t+4.5),E.frequency.exponentialRampToValueAtTime(280,t+6.2),E.frequency.exponentialRampToValueAtTime(90,t+7.5),E.Q.value=1.8;const v=o.createGain();v.gain.setValueAtTime(1e-4,t),v.gain.setValueAtTime(1e-4,t+4.5),v.gain.linearRampToValueAtTime(.18,t+5.5),v.gain.exponentialRampToValueAtTime(1e-4,t+7.5),P.connect(E),E.connect(v),v.connect(w),P.start(t+4.5),P.stop(t+7.5+.1),setTimeout(()=>{try{M.disconnect(),z.disconnect(),Z.disconnect(),k.disconnect(),D.disconnect(),R.disconnect(),g.disconnect(),x.disconnect(),P.disconnect(),E.disconnect(),v.disconnect(),y&&y.disconnect(),f.disconnect()}catch{}},(7.5+.2)*1e3);return}if(l===4){const y=o.createOscillator();y.type="sine",y.frequency.setValueAtTime(28,t),y.frequency.linearRampToValueAtTime(52,t+3),y.frequency.setValueAtTime(52,t+11.5),y.frequency.exponentialRampToValueAtTime(24,t+16);const w=o.createGain();w.gain.setValueAtTime(1e-4,t),w.gain.exponentialRampToValueAtTime(.3,t+2.6),w.gain.linearRampToValueAtTime(.22,t+11.5),w.gain.exponentialRampToValueAtTime(1e-4,t+16),y.connect(w),w.connect(f),y.start(t),y.stop(t+16+.1);const M=o.createBufferSource();M.buffer=ke(o),M.loop=!0;const z=o.createBiquadFilter();z.type="bandpass",z.frequency.setValueAtTime(70,t),z.frequency.exponentialRampToValueAtTime(760,t+3),z.frequency.exponentialRampToValueAtTime(120,t+3.8),z.Q.value=1.8;const Z=o.createGain();Z.gain.setValueAtTime(1e-4,t),Z.gain.exponentialRampToValueAtTime(.26,t+2.9),Z.gain.exponentialRampToValueAtTime(1e-4,t+4),M.connect(z),z.connect(Z),Z.connect(f),M.start(t),M.stop(t+4.1);const k=t+3,D=o.createOscillator();D.type="sine",D.frequency.setValueAtTime(95,k),D.frequency.exponentialRampToValueAtTime(36,k+.45);const R=o.createGain();R.gain.setValueAtTime(1e-4,k),R.gain.exponentialRampToValueAtTime(.28,k+.03),R.gain.exponentialRampToValueAtTime(1e-4,k+.55),D.connect(R),R.connect(f),D.start(k),D.stop(k+.6);const g=o.createBufferSource();g.buffer=ke(o),g.loop=!0;const x=o.createBiquadFilter();x.type="bandpass",x.frequency.setValueAtTime(430,t+3),x.frequency.linearRampToValueAtTime(560,t+11.5),x.Q.value=2.2;const P=o.createGain();P.gain.setValueAtTime(1e-4,t+3),P.gain.linearRampToValueAtTime(.15,t+4.2),P.gain.linearRampToValueAtTime(.12,t+10.5),P.gain.exponentialRampToValueAtTime(1e-4,t+16);const E=o.createOscillator();E.type="sine",E.frequency.value=.9;const v=o.createGain();v.gain.setValueAtTime(.055,t+3),v.gain.linearRampToValueAtTime(0,t+11.5),E.connect(v),v.connect(P.gain),g.connect(x),x.connect(P),P.connect(f),g.start(t+3),g.stop(t+16+.1),E.start(t+3),E.stop(t+16+.1);const F=o.createOscillator();F.type="triangle",F.frequency.setValueAtTime(1350,t+11.5),F.frequency.exponentialRampToValueAtTime(310,t+16);const G=o.createGain();G.gain.setValueAtTime(1e-4,t+11.5),G.gain.exponentialRampToValueAtTime(.07,t+11.9),G.gain.exponentialRampToValueAtTime(1e-4,t+16),F.connect(G),G.connect(f),F.start(t+11.5),F.stop(t+16+.1),setTimeout(()=>{try{y.disconnect(),w.disconnect(),M.disconnect(),z.disconnect(),Z.disconnect(),D.disconnect(),R.disconnect(),g.disconnect(),x.disconnect(),P.disconnect(),E.disconnect(),v.disconnect(),F.disconnect(),G.disconnect(),f.disconnect()}catch{}},(16+.2)*1e3);return}if(l===5){const y=o.createBufferSource();y.buffer=ke(o),y.loop=!0;const w=o.createBiquadFilter();w.type="lowpass",w.frequency.setValueAtTime(220,t),w.frequency.linearRampToValueAtTime(920,t+3.2),w.frequency.linearRampToValueAtTime(680,t+9),w.frequency.linearRampToValueAtTime(180,t+12),w.frequency.exponentialRampToValueAtTime(90,t+14);const M=o.createGain();M.gain.setValueAtTime(1e-4,t),M.gain.exponentialRampToValueAtTime(.2,t+3),M.gain.linearRampToValueAtTime(.16,t+9),M.gain.exponentialRampToValueAtTime(1e-4,t+14),y.connect(w),w.connect(M),M.connect(f),y.start(t),y.stop(t+14+.1);const z=o.createBufferSource();z.buffer=ke(o),z.loop=!0;const Z=o.createBiquadFilter();Z.type="bandpass",Z.frequency.value=760,Z.Q.value=1.1;const k=o.createGain();k.gain.setValueAtTime(1e-4,t),k.gain.linearRampToValueAtTime(.1,t+3),k.gain.linearRampToValueAtTime(.08,t+9),k.gain.linearRampToValueAtTime(1e-4,t+12.5);const D=o.createOscillator();D.type="sine",D.frequency.setValueAtTime(8,t),D.frequency.linearRampToValueAtTime(12.5,t+9),D.frequency.linearRampToValueAtTime(7,t+14);const R=o.createGain();R.gain.setValueAtTime(0,t),R.gain.linearRampToValueAtTime(.085,t+3),R.gain.linearRampToValueAtTime(.06,t+9),R.gain.linearRampToValueAtTime(0,t+12.5),D.connect(R),R.connect(k.gain),z.connect(Z),Z.connect(k),k.connect(f),z.start(t),z.stop(t+14+.1),D.start(t),D.stop(t+14+.1);for(let g=0;g<3;g++){const x=t+.25+g*.24,P=o.createOscillator();P.type="sine",P.frequency.setValueAtTime(2350+g*190,x),P.frequency.exponentialRampToValueAtTime(1750+g*140,x+.09);const E=o.createGain();E.gain.setValueAtTime(1e-4,x),E.gain.exponentialRampToValueAtTime(.09,x+.02),E.gain.exponentialRampToValueAtTime(1e-4,x+.11),P.connect(E),E.connect(f),P.start(x),P.stop(x+.12)}setTimeout(()=>{try{y.disconnect(),w.disconnect(),M.disconnect(),z.disconnect(),Z.disconnect(),k.disconnect(),D.disconnect(),R.disconnect(),f.disconnect()}catch{}},(14+.2)*1e3);return}const S=Math.max(1.8,d),h=o.createBufferSource();h.buffer=ke(o);const c=o.createBiquadFilter();c.type="bandpass",c.frequency.setValueAtTime(1200,t),c.frequency.exponentialRampToValueAtTime(180,t+.25),c.Q.value=1.2;const V=o.createGain();V.gain.setValueAtTime(.75,t),V.gain.exponentialRampToValueAtTime(.001,t+.35),h.connect(c),c.connect(V),V.connect(f),h.start(t),h.stop(t+.4);const m=o.createBufferSource();m.buffer=ke(o),m.loop=!0;const A=o.createBiquadFilter();A.type="lowpass",A.frequency.setValueAtTime(450,t),A.frequency.exponentialRampToValueAtTime(65,t+S);const T=o.createGain();T.gain.setValueAtTime(.65,t),T.gain.exponentialRampToValueAtTime(1e-4,t+S),m.connect(A),A.connect(T),T.connect(f),m.start(t),m.stop(t+S+.05);const q=o.createOscillator();q.type=H||"sine",q.frequency.setValueAtTime(Math.max(b,120),t),q.frequency.exponentialRampToValueAtTime(26,t+Math.min(1.2,S));const L=o.createGain();L.gain.setValueAtTime(.7,t),L.gain.exponentialRampToValueAtTime(.001,t+S),q.connect(L),L.connect(f),q.start(t),q.stop(t+S+.05),setTimeout(()=>{try{h.disconnect(),c.disconnect(),V.disconnect(),m.disconnect(),A.disconnect(),T.disconnect(),q.disconnect(),L.disconnect(),f.disconnect()}catch{}},(S+.1)*1e3)}function Vt(e,n){n.funnelBottom,n.funnelHeight;const o=n.funnelWaistT!=null?n.funnelWaistT:n.funnelWaistU||.42,i=n.funnelTailRadius!=null?n.funnelTailRadius:.8,l=n.funnelWaistRadius!=null?n.funnelWaistRadius:3.5,t=n.funnelCrownRadius!=null?n.funnelCrownRadius:22,f=n.funnelCrownExp||1.4;if(e<=o){const d=e/Math.max(.01,o);return i+(l-i)*(d*d)}else{const d=(e-o)/Math.max(.01,1-o);return l+(t-l)*Math.pow(d,f)}}const yn=.06081006264583979;function zn(e,n,o,i,l,t,f,d,b,H,S){const h=Vt(l,H),c=Math.atan2(f,t),V=Math.sqrt(n*n+i*i),m=3.5,A=H.vortexDuration||4.5,T=H.equilibriumDuration||3.5,q=3.5,L=14+.55*V,C=H.funnelBottom||-22,y=H.funnelHeight||46,w=.12*Math.sin(3*c-4.2*b+2.5*l),M=.08*Math.cos(5*c+6*b-3.8*l),z=.06*Math.sin(b*7.5+e*.03),Z=1+w+M+z,k=(4+15/(V+4.5))*d,D=((H.spinSpeed||5.2)*2.8+4.5*(1-l))*d;if(b<m){const R=b/m,g=R*R*R*(R*(R*6-15)+10),x=(1-g)*V+g*L,P=c+k*(.6*b+.2*(b*b/m)),E=Math.cos(P)*x,v=(1-g)*o+g*(C+.022*x*x+3*(l-.5)),F=Math.sin(P)*x;return S?(S.x=E,S.y=v,S.z=F,S):{x:E,y:v,z:F}}else if(b<m+A){const R=b-m,g=R/A,x=g*g*(3-2*g),P=c+k*(.8*m),E=R+.6*A/Math.PI*(1-Math.cos(Math.PI*R/A)),v=P+D*1.25*E,F=(1-x)*L+x*(h*Z),G=2.8*Math.sin(1.8*b+2.2*l)*l*x,j=2.4*Math.cos(1.5*b+1.8*l)*l*x,B=G+Math.cos(v)*F,X=(1-x)*(C+.022*L*L)+x*(C+y*l)+5.5*Math.sin(g*Math.PI)*l,Y=j+Math.sin(v)*F;return S?(S.x=B,S.y=X,S.z=Y,S):{x:B,y:X,z:Y}}else if(b<m+A+T){const R=b-(m+A),g=R/T,x=1+.75*Math.sin(Math.PI*g)+.35*g,P=c+k*(.8*m),E=A+1.2*A/Math.PI,v=P+D*1.25*E,F=R-.2/2.4*(Math.cos(2.4*R)-1),G=v+D*1.1*F,j=h*Z*x,B=2.8*Math.sin(1.8*(m+A)+2.2*l)*l*(1-.4*g),X=2.4*Math.cos(1.5*(m+A)+1.8*l)*l*(1-.4*g),Y=B+Math.cos(G)*j,J=C+y*l+(1-g)*2*l,se=X+Math.sin(G)*j;return S?(S.x=Y,S.y=J,S.z=se,S):{x:Y,y:J,z:se}}else{const R=b-(m+A+T),g=Math.min(1,R/q),x=c+k*(.8*m),P=A+1.2*A/Math.PI,E=x+D*1.25*P,v=T-.2/2.4*(Math.cos(2.4*T)-1),F=E+D*1.1*v,G=.85*R-.275*(R*R/q),j=F+D*1.1*G,B=h*Z*(1-g)+L*g,X=(C+y*l)*(1-g)+(C+.022*L*L+3*(l-.5))*g,Y=Math.cos(j)*B,J=X,se=Math.sin(j)*B,O=.35*g+.65*Math.pow(g,2.2),K=(1-O)*Y+O*n,u=(1-O)*J+O*o,U=(1-O)*se+O*i;return S?(S.x=K,S.y=u,S.z=U,S):{x:K,y:u,z:U}}}function wn(e,n,o,i,l,t,f,d,b,H,S,h,c,V,m,A,T){const q=i*f+25,L=A*53.17%100/100*.3,C=Math.min(.75,Math.max(0,q*.015+L)),y=Math.max(0,e-C),w=Math.min(1,y/(m-C+1e-4));if(y<=0)return T?(T.x=i,T.y=l,T.z=t,T):{x:i,y:l,z:t};const z=A%3*2.094395,D=.15*(i*f)-2.8*n+z,R=(1.8+3.8*h)*Math.min(1,y/.8)*d,g=R*Math.sin(D),x=R*Math.cos(D),P=f*(R*.55*Math.sin(D*.5)),E=3.6+A*41.73%100/100*2,v=A*67.89%100/100*6.28318,F=E*n+v,G=f*(Math.sin(F)*(.8+1.1*S))*d,j=Math.abs(Math.cos(F))*(.95+1.45*h)*d,B=Math.sin(F*.75+v)*(1.3+1.8*S)*d,X=Math.sin(9.5*n+A*.35)*.4*d*Math.min(1,y),Y=A*29.17%10>5?1:-1,J=.12*(i*f)-3.8*n*Y+A*31.41%100/100*6.28318,se=Math.sin(Math.PI*w),O=(3.2+6*h)*(b||0)*d*se,K=O*Math.sin(J),u=O*Math.cos(J),U=f*(O*.35*Math.cos(J*2));if(o>.82){const $=(3.2+6*S)*d*(y*.85+.08*y*y),te=(.35*Math.abs(Math.sin(F))+.1*Math.sin(n*10+A))*Math.min(1,y),ee=(.75*Math.sin(F*.6)+X+u*.25)*Math.min(1,y),ie=i+f*$+G*.4+U*.25,Q=Math.max(l,l+te),N=t+ee;return T?(T.x=ie,T.y=Q,T.z=N,T):{x:ie,y:Q,z:N}}else{const _=c*.5,$=Math.min(1,Math.max(0,(w-_)/(1-_+1e-4))),te=$*$*(3-2*$),ee=A*83.11%100/100*2.4-1.2,ie=Math.max(2.4,4.2+8.5*S+3.8*h+ee),Q=(y*ie+.45*y*y*(.4+.6*h))*d,N=A*93.41%100/100*2.8,ae=(3+7.5*h+N)*d,re=Math.max(0,ae+g+j+X),ne=i+f*Q+P+G+te*U,fe=Math.max(l,l+te*(re+K)),pe=t+te*(x+B+X+u);return T?(T.x=ne,T.y=fe,T.z=pe,T):{x:ne,y:fe,z:pe}}}function kn(e,n,o,i,l,t,f,d){const b=f||{},H=b.blowDir!=null?b.blowDir:1,S=b.intensity!=null?b.intensity:1,h=b.swirl!=null?b.swirl:0,c=1,V=2,m=3.6,A=3.6,T=1.6,q=e*37.119%100/100,L=q<.22,C=e*19.417%100-50,y=e*29.831%100-50,w=L?C*.05:0,M=L?y*.04:0,z=-11,Z=n+w,k=z+o*.03,D=i+M,R=.55+e*43.71%100/100*.9,g=.4+e*81.33%100/100*1.1,x=Math.pow(e*61.19%100/100,1.4)*.6;if(t<c){const P=t/c,E=P*P,v=Math.max(0,(P-.7)/.3),F=v*(2-v),G=(L?1.6:.5)*Math.sin(Math.PI*v)*(1-v),j=n+w*F,B=(1-E)*o+E*k+G,X=i+M*F;return d?(d.x=j,d.y=B,d.z=X,d):{x:j,y:B,z:X}}else{if(t<c+V)return d?(d.x=Z,d.y=k,d.z=D,d):{x:Z,y:k,z:D};if(t<c+V+m){const P=t-(c+V);return wn(P,t,q,Z,k,D,H,S,h,l,R,g,x,y,m,e,d)}else if(t<c+V+m+A){const P=(t-(c+V+m))/A,E=P*P*(3-2*P),v=m*(1-E);return wn(v,t,q,Z,k,D,H,S,h,l,R,g,x,y,m,e,d)}else{const P=Math.min(1,(t-(c+V+m+A))/T),E=P*P*(3-2*P),v=(1-E)*Z+E*n,F=(1-E)*k+E*o,G=(1-E)*D+E*i;return d?(d.x=v,d.y=F,d.z=G,d):{x:v,y:F,z:G}}}}function qn(e,n,o,i,l,t,f,d,b,H,S,h){const c=b!=null&&b>0?b:3,V=(1-yn)*.82+.18,m=(2.8*yn*.82+.18)/Math.max(.1,d),A=V+m*c*.78;let T;if(S<d){const y=S/d;T=((1-Math.exp(-2.8*y))*.82+.18*y)*f}else if(S<d+c){const y=S-d,w=y/Math.max(.01,c);T=(V+m*y*(1-.22*w))*f}else{const y=Math.min(1,Math.max(0,(S-(d+c))/Math.max(.1,H))),w=Math.max(0,1-Math.pow(y,2.4));T=A*w*f}const q=e+i*T,L=n+l*T,C=o+t*T;return h?(h.x=q,h.y=L,h.z=C,h):{x:q,y:L,z:C}}function Vn(e,n,o,i,l,t,f,d){const H=Math.min(1,Math.max(0,t/7.5)),S=-48+96*H,h=n+.25*o-S,c=9.2,V=Math.exp(-(h*h)/(2*c*c)),m=Math.sin(Math.PI*H),A=V*(.35+.65*m),T=Math.PI*h/(2*c),q=Math.cos(T),L=Math.sin(T),C=16,y=.5+.5*Math.tanh(o/8),w=C*(q-.3*Math.sin(2*T)),M=5*y*Math.max(0,q),z=-3.5*y*Math.max(0,L),Z=A*(w+M),k=A*(C*.14*L+z),D=-A*(C*.06)*L,R=n+D,g=o+k,x=i+Z;return d?(d.x=R,d.y=g,d.z=x,d):{x:R,y:g,z:x}}function In(e,n,o,i,l,t,f,d){const S=e*37.119%100/100,h=e*61.19%100/100,c=e*29.17%100/100,V=e*53.17%100/100,m=e*91.73%100/100,A=1.05+.04*Math.sin(.35*t),T=.07+.02*Math.cos(.3*t),q=Math.cos(A),L=Math.sin(A),C=Math.cos(T),y=Math.sin(T);let w=C,M=y,z=0,Z=-y*L,k=C*L,D=q;const R=Math.sqrt(Z*Z+k*k+D*D)||1;Z/=R,k/=R,D/=R;const g=M*D-z*k,x=z*Z-w*D,P=w*k-M*Z,E=f&&f.knotScale>0?f.knotScale:11,v=E*.62,F=E*.34,G=E*.15*(1+.03*Math.sin(1.2*t)),j=S*6.28318+.14*t*l,B=Math.sin(3*j),X=Math.cos(3*j),Y=v+F*X,J=Math.cos(2*j),se=Math.sin(2*j),O=Y*J,K=Y*se,u=F*B,U=-3*F*B*J-2*Y*se,_=-3*F*B*se+2*Y*J,$=3*F*X,te=O*w+K*Z+u*g,ee=O*M+K*k+u*x,ie=O*z+K*D+u*P,Q=U*w+_*Z+$*g,N=U*M+_*k+$*x,ae=U*z+_*D+$*P,re=Math.sqrt(Q*Q+N*N+ae*ae)||1,ne=Q/re,fe=N/re,pe=ae/re,we=m*6.28318+.18*t*l,ce=G*Math.sqrt(V),le=g*ne+x*fe+P*pe;let me=g-le*ne,ue=x-le*fe,Te=P-le*pe;const Ie=Math.sqrt(me*me+ue*ue+Te*Te)||1;me/=Ie,ue/=Ie,Te/=Ie;const it=fe*Te-pe*ue,Ne=pe*me-ne*Te,Pt=ne*ue-fe*me,He=Math.cos(we),Ke=Math.sin(we),Se=te+ce*(He*me+Ke*it),be=ee+ce*(He*ue+Ke*Ne),Pe=ie+ce*(He*Te+Ke*Pt);let Ee,Be,Re;if(t<3){let he=(t-h*.35)/2.65;he=Math.max(0,Math.min(1,he));const Ce=he*he*he*(he*(he*6-15)+10),Qe=.9*l*Math.sin(Math.PI*Ce),ye=Math.cos(Qe),We=Math.sin(Qe),Fe=g*n+x*o+P*i,$e=x*i-P*o,Je=P*n-g*o,et=g*o-x*n,Ze=n*ye+$e*We+g*Fe*(1-ye),Ge=o*ye+Je*We+x*Fe*(1-ye),je=i*ye+et*We+P*Fe*(1-ye);Ee=Ze+(Se-Ze)*Ce,Be=Ge+(be-Ge)*Ce,Re=je+(Pe-je)*Ce}else if(t<11.5)Ee=Se,Be=be,Re=Pe;else{let he=(t-11.5-c*.25)/4.25;he=Math.max(0,Math.min(1,he));const Ce=he*he*he*(he*(he*6-15)+10),Qe=.9*l*Math.sin(Math.PI*Ce),ye=Math.cos(Qe),We=Math.sin(Qe),Fe=g*Se+x*be+P*Pe,$e=x*Pe-P*be,Je=P*Se-g*Pe,et=g*be-x*Se,Ze=Se*ye+$e*We+g*Fe*(1-ye),Ge=be*ye+Je*We+x*Fe*(1-ye),je=Pe*ye+et*We+P*Fe*(1-ye);Ee=Ze+(n-Ze)*Ce,Be=Ge+(o-Ge)*Ce,Re=je+(i-je)*Ce}const Ue=Math.max(0,Math.min(1,(t-3)/(11.5-3))),Et=6.283185307179586*(Ue*Ue*Ue*(Ue*(Ue*6-15)+10)),Rt=Math.cos(Et),dt=Math.sin(Et),Ct=Rt*Ee+dt*Re,Xe=-dt*Ee+Rt*Re;return Ee=Ct,Re=Xe,d?(d.x=Ee,d.y=Be,d.z=Re,d):{x:Ee,y:Be,z:Re}}const Tn=11+3.4*Math.sin(.85*9+.7)+1.7*Math.sin(1.65*9);function Bn(e,n,o,i,l,t,f,d){const m=f||{},A=m.mSweepX!=null?m.mSweepX:24,T=m.mSweepY!=null?m.mSweepY:4,q=m.mSweepZ!=null?m.mSweepZ:12,L=m.mFreqX!=null?m.mFreqX:3.456,C=m.mFreqY!=null?m.mFreqY:5.341,y=m.mFreqZ!=null?m.mFreqZ:2.827,w=m.mPhX!=null?m.mPhX:.4,M=m.mPhY!=null?m.mPhY:0,z=m.mPhZ!=null?m.mPhZ:1.2,Z=m.mLaunchDir!=null?m.mLaunchDir:1,k=A*Math.sin(L+w),D=T*Math.sin(C+M),R=q*Math.sin(y+z),g=k*.25,x=D*.25+1.5,P=R*.25,E=A*L/7,v=T*C/7,F=q*y/7,G=E*Math.cos(L+w),j=v*Math.cos(C+M)-1.346,B=F*Math.cos(y+z),X=Math.sqrt(G*G+j*j+B*B)||1,Y=G/X,J=j/X,se=B/X,O=.6*Math.min(1,X/10),K=e*37.119%100/100,u=e*61.19%100/100,U=e*83.11%100/100,_=e*53.17%100/100,$=K*6.28318,te=u*6.28318,ee=U*6.28318,ie=(Z>0?n+50:50-n)*.017+u*.55,Q=t-ie;if(Q<=0)return d?(d.x=n,d.y=o,d.z=i,d):{x:n,y:o,z:i};let N=Math.min(1,Q/.9);const ae=N*N*(3-2*N),re=Math.sin(N*Math.PI)*2.2,ne=t*l;let fe,pe,we,ce,le,me,ue,Te,Ie;if(t<9){const de=Math.max(0,(t-2)/7);fe=A*Math.sin(de*L+w),pe=T*Math.sin(de*C+M)+3*Math.sin(de*Math.PI),we=q*Math.sin(de*y+z),ce=1,le=11+3.4*Math.sin(.85*t+.7)+1.7*Math.sin(1.65*t);const oe=E*Math.cos(de*L+w),ve=v*Math.cos(de*C+M)+1.346*Math.cos(de*Math.PI),Le=F*Math.cos(de*y+z),ze=Math.sqrt(oe*oe+ve*ve+Le*Le)||1;me=oe/ze,ue=ve/ze,Te=Le/ze,Ie=.6*Math.min(1,ze/10)}else if(t<12){const de=(t-9)/3,oe=de*de*(3-2*de);fe=k*(1-.75*oe),pe=D*(1-.75*oe)+1.5*oe,we=R*(1-.75*oe),ce=1-.7*oe,le=Tn*(1-.55*oe),me=Y,ue=J,Te=se,Ie=O*(1-.75*oe)}else{const de=t-12;ce=.3*(1-Math.min(1,de/2));let oe=de/1.5;oe=Math.min(1,oe),oe=oe*oe*(3-2*oe);const ve=1.6*Math.sin(ne*1.05+$),Le=1+Math.sin(ne*.83+te),ze=1.2*Math.cos(ne*.95+ee);fe=g+(ve-g)*oe,pe=x+(Le-x)*oe,we=P+(ze-P)*oe,le=Tn*.45,me=Y,ue=J,Te=se,Ie=O*.25*(1-Math.min(1,de/2))}const it=$,Ne=2*u-1,Pt=Math.sqrt(Math.max(0,1-Ne*Ne)),He=Math.sqrt(U),Ke=1+.3*Math.sin(2.2*it+1.8*Ne+.45*ne)+.16*Math.cos(3.3*it-2.4*Ne+.62*ne);let Se=He*Pt*Math.cos(it)*le*Ke,be=He*Ne*.72*le*Ke,Pe=He*Pt*Math.sin(it)*le*Ke;const Ee=e*71.53%100/100,Be=Math.floor(Ee*6),Re=le/11,Ue=(4.5+3*K)*Re,mn=Ue*Math.sin(.71*Be+.5*ne+Ee*6.28),Et=Ue*.7*Math.sin(1.13*Be+.38*ne+u*6.28),Rt=Ue*.8*Math.cos(.87*Be+.45*ne+U*6.28),dt=Se,Ct=be,Xe=Se*me+be*ue+Pe*Te,he=Se-me*Xe,Ce=be-ue*Xe,Qe=Pe-Te*Xe,ye=Math.max(0,-Xe),We=Math.max(0,He-.9)/.1,Fe=(ye*1.7+We*2.6)*Ie*(.55+.45*_)*Re,$e=1+Ie;Se=he*.8+me*(Xe*$e-Fe),be=Ce*.8+ue*(Xe*$e-Fe),Pe=Qe*.8+Te*(Xe*$e-Fe);let Je=5.6*Math.sin(.4*Ct+1.25*ne+$),et=4.4*Math.sin(.48*dt-1.05*ne+te),Ze=4.8*Math.cos(.36*dt+.3*Ct+.9*ne+ee);const Ge=8.5+4*_,je=Math.sin(Ge*ne+$);Je+=.5*je,et+=1.3*je,Ze+=.4*Math.sin(Ge*.87*ne+te),Je*=ce,et*=ce,Ze*=ce;let mt=fe+mn+Se+Je,ft=pe+Et+be+et,pt=we+Rt+Pe+Ze;if(t>2.6&&t<8.6){let de=Math.max(0,Math.min(1,(t-2.8)/.4));de*=1-Math.max(0,Math.min(1,(t-5)/.4));let oe=Math.max(0,Math.min(1,(t-6)/.4));oe*=1-Math.max(0,Math.min(1,(t-8.2)/.4));const ve=Math.max(de,oe);if(ve>.001){const Le=Math.min(8.9,t*.92+1.1),ze=Math.max(0,(Le-2)/7),_n=A*Math.sin(ze*L+w)+5*Math.sin(1.7*t+1),Nn=T*Math.sin(ze*C+M)+3*Math.sin(ze*Math.PI)+2*Math.sin(1.3*t),fn=q*Math.sin(ze*y+z)+4*Math.sin(1.6*t+2),jt=mt-_n,Yt=ft-Nn,pn=Math.sqrt(jt*jt+Yt*Yt+(pt-fn)*(pt-fn)),Ot=8;if(pn<Ot){const hn=pn/Ot;let tt=hn/.5;tt=Math.min(1,tt),tt=tt*tt*(3-2*tt);let nt=(hn-.6)/.4;nt=Math.max(0,Math.min(1,nt)),nt=nt*nt*(3-2*nt);let xt=ue,yt=-me;const gn=Math.sqrt(xt*xt+yt*yt+.0025);xt/=gn,yt/=gn;const vn=(jt*xt+Yt*yt)/Ot*(tt*(1-nt))*7*ve*(.75+.5*_);mt+=xt*vn,ft+=yt*vn}}}let ht=mt,gt=ft+re,vt=pt;if(t>=12){const de=t-12,oe=u*.5;let ve=(de-oe)/(2-oe);ve=Math.max(0,Math.min(1,ve));const Le=ve*ve*ve*(ve*(ve*6-15)+10);ht=mt+(n-mt)*Le,gt=ft+re+(o-ft-re)*Le,vt=pt+(i-pt)*Le}return ae<1&&(ht=n+(ht-n)*ae,gt=o+(gt-o)*ae,vt=i+(vt-i)*ae),d?(d.x=ht,d.y=gt,d.z=vt,d):{x:ht,y:gt,z:vt}}const Mn=75,p={initialZ:35,cameraAngleDeg:Mn,zoomMin:10,zoomMax:200,fitMargin:56,zoomSpeed:.8,zoomLerp:.08,rotationStep:.03,rotationAutoReturnLerp:.02,autoReturnGracePeriodMs:300,canvasWidth:800,canvasHeight:150,fontSize:44,pixelStep:2,pixelThreshold:120,targetWorldWidth:80,emojiOptions:["😀","😂","😍","🥰","😎","🤔","😭","😡","😱","🥳","👍","👎","👏","🙏","👌","💪","❤️","🔥","✨","🎉"],emojiRasterSize:320,emojiPixelStep:2,emojiFontSize:280,emojiDensityOverride:1,emojiJitterXY:.03,emojiJitterZ:.5,emojiDepthCue:.06,emojiPointSize:1.6,emojiMotionMix:.35,emojiDepthRange:6,imageRasterSize:320,imagePixelStep:2,imageAlphaThreshold:16,imageJitterXY:.03,imageJitterZ:.5,imageDepthCue:.06,imagePointSize:1.2,imageDepthRange:5,density:8,jitterXY:.08,jitterZ:2.5,explosionSpeedMin:.4,explosionSpeedRange:.8,heatDistance:2/3*35*Math.tan(Mn*Math.PI/360),afterglowDuration:.2,mouseInfluence:6,repulsionStrength:12,springK:.12,springDamping:.82,tapCount:5,tapWindowMs:800,inputDebounceMs:150,pointSize:.5,pointSizeAttenuationScale:120,clearColor:131589,maxPixelRatio:2,themes:{ember:{hot:[1,.95,.75],warm:[1,.45,.05],cold:[.92,.18,.05]},arctic:{hot:[.92,.98,1],warm:[.18,.75,1],cold:[.05,.35,.88]},toxic:{hot:[.92,1,.4],warm:[.35,.95,.15],cold:[.06,.58,.22]},neon:{hot:[1,.92,.98],warm:[1,.08,.55],cold:[.35,.05,.88]},sakura:{hot:[1,.95,.96],warm:[1,.45,.65],cold:[.85,.18,.42]}},presets:{KINETIC:{description:"A 3D surf wave rolls through your message — luminous crest, deep blue troughs.",expansionDuration:3.75,contractionDuration:3.75,explosionMaxDistMultiplier:22,motionStyle:3,trailStrength:.7,emberBudget:0,soundPitch:45,soundDuration:7.5,soundType:"sine"},TORNADO:{description:"A four-phase vortex funnel — particles accrete, spiral upward, then dissolve.",expansionDuration:3.5,vortexDuration:4.5,equilibriumDuration:3.5,contractionDuration:3.5,explosionMaxDistMultiplier:26,motionStyle:1,spinSpeed:4.8,funnelHeight:46,funnelBottom:-22,funnelCrownRadius:22,funnelWaistRadius:4.5,funnelTailRadius:1.8,funnelWaistT:.38,funnelCrownT:.82,funnelFadeStart:.03,funnelFadeEnd:.3,trailStrength:.75,emberBudget:90,soundPitch:75,soundDuration:15,soundType:"sawtooth"},BREEZE:{description:"A wind field bends, rolls and disperses your message like leaves in a gust.",expansionDuration:1,contractionDuration:1.6,explosionMaxDistMultiplier:28,motionStyle:2,trailStrength:.6,emberBudget:0,soundPitch:95,soundDuration:11.8,soundType:"sine"},EXPLODE:{description:"A volumetric blast — particles burst outward, hang in the air, then rush home.",expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:36,motionStyle:0,trailStrength:.3,emberBudget:140,soundPitch:110,soundDuration:6.2,soundType:"sine"},TORUS:{description:"Gravity forges your message into a flowing torus knot of light around a black hole, then lets it rain back home.",expansionDuration:8,contractionDuration:4,explosionMaxDistMultiplier:30,motionStyle:4,trailStrength:.8,emberBudget:50,soundPitch:40,soundDuration:16,soundType:"sine"},MURMURATION:{description:"Your message takes flight — a living starling flock sweeps the sky, dodges, and returns.",expansionDuration:2,contractionDuration:2,explosionMaxDistMultiplier:30,motionStyle:5,trailStrength:.35,emberBudget:0,soundPitch:70,soundDuration:14,soundType:"sine"},DEFAULT:{expansionDuration:1.2,driftDuration:3,contractionDuration:2,explosionMaxDistMultiplier:15,motionStyle:-1,spokes:12,spokeJitter:.03,spinSpeed:0,funnelHeight:0,funnelBottom:0,funnelCrownRadius:0,funnelWaistRadius:0,funnelTailRadius:0,funnelWaistT:0,funnelCrownT:0,funnelFadeStart:0,funnelFadeEnd:0,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"}}};let ut=window.matchMedia("(prefers-reduced-motion: reduce)").matches;window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ut=e.matches});let xe=null;const uo=384;let It=0,Me=null,rn={w:80,h:80};const mo=`
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

// Style 5: starling flock — randomized flight plan, sub-swarms, streaming,
// predator dodges. Mirrors evaluateMurmurationParticle in physics-math.js.
vec3 evalMurmurationGPU(float i, vec3 home, float cd, float elapsed,
        float swX, float swY, float swZ,
        float fX, float fY, float fZ,
        float phX, float phY, float phZ, float launchDir) {
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
    float rFlightEnd = (11.0 + 3.4 * sin(0.85 * 9.0 + 0.7) + 1.7 * sin(1.65 * 9.0));

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
        churn = 1.0;
        // Breathing flock volume: two superposed pulses swell and contract the
        // whole cloud organically through the flight window.
        blobR = 11.0 + 3.4 * sin(0.85 * elapsed + 0.7) + 1.7 * sin(1.65 * elapsed);
        vec3 dv = vec3(
            kvx * cos(u * fX + phX),
            kvy * cos(u * fY + phY) + 1.346 * cos(u * 3.14159265),
            kvz * cos(u * fZ + phZ));
        vDir = normalize(dv + vec3(1e-6));
        strA = 0.60 * min(1.0, length(dv) / 10.0);
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

    // Churn field keyed on slot position + wingbeat flutter
    vec3 F = vec3(
        5.6 * sin(0.40 * slot.y + 1.25 * te + ph1),
        4.4 * sin(0.48 * slot.x - 1.05 * te + ph2),
        4.8 * cos(0.36 * slot.x + 0.30 * slot.y + 0.90 * te + ph3));
    float wf = 8.5 + 4.0 * p4h;
    float fl = sin(wf * te + ph1);
    F += vec3(0.5 * fl, 1.3 * fl, 0.4 * sin(wf * 0.87 * te + ph2));
    F *= churn;

    vec3 P = C + swarmO + streamed + F;

    // Predator dodges: two sweeping exclusion cavities shape-shift the flock
    if (elapsed > 2.6 && elapsed < 8.6) {
        float wA = clamp((elapsed - 2.8) / 0.4, 0.0, 1.0);
        wA *= 1.0 - clamp((elapsed - 5.0) / 0.4, 0.0, 1.0);
        float wB = clamp((elapsed - 6.0) / 0.4, 0.0, 1.0);
        wB *= 1.0 - clamp((elapsed - 8.2) / 0.4, 0.0, 1.0);
        float wEnv = max(wA, wB);
        if (wEnv > 0.001) {
            // The predator rides the flock's own flight path with a lateral weave
            float qt = min(8.9, elapsed * 0.92 + 1.1);
            float qU = max(0.0, (qt - 2.0) / 7.0);
            vec3 Q = vec3(
                swX * sin(qU * fX + phX) + 5.0 * sin(1.7 * elapsed + 1.0),
                swY * sin(qU * fY + phY) + 3.0 * sin(qU * 3.14159265) + 2.0 * sin(1.3 * elapsed),
                swZ * sin(qU * fZ + phZ) + 4.0 * sin(1.6 * elapsed + 2.0));
            // Part the flock around the predator: slide particles sideways
            // relative to the flow direction instead of pushing them radially.
            // A radial push compresses displaced particles into a visible rim
            // ring; tangential parting preserves radial density and reads as
            // the flock cleaving around a falcon. Magnitude fades to zero at
            // the cavity rim and on the parting mid-plane, so nothing snaps.
            vec3 dvv = P - Q;
            float d = length(dvv);
            float rad = 8.0;
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
                float part = (sideDist / rad) * (rise * (1.0 - fall)) * 7.0 * wEnv * (0.75 + 0.5 * p4h);
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
                    uMPhX, uMPhY, uMPhZ, uMLaunchDir);
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
`,fo=`
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
`,a={currentText:"Bring your message!",lastText:"Bring your message!",currentTheme:"ember",currentFont:"Outfit",messageMode:"text",activeImage:null,imageName:"",activePreset:null,lastRandomPreset:null,activeEmoji:null,lastEmoji:null,lastImage:null,lastImageName:"",audioEnabled:!0,gpuPhysics:!(typeof window<"u"&&(new URLSearchParams(window.location.search).get("noworker")==="1"||new URLSearchParams(window.location.search).get("gpu")==="0")),expansionDuration:p.presets.DEFAULT.expansionDuration,driftDuration:p.presets.DEFAULT.driftDuration||3,contractionDuration:p.presets.DEFAULT.contractionDuration,explosionMaxDistMultiplier:p.presets.DEFAULT.explosionMaxDistMultiplier,motionStyle:p.presets.DEFAULT.motionStyle,activeExpansionDuration:null,activeContractionDuration:null,activeMaxDist:null,actualTravelRadius:0,travelApplied:!1,embersSpawned:!1,afterglowStartTime:null,soundPitch:p.presets.DEFAULT.soundPitch,soundDuration:p.presets.DEFAULT.soundDuration,soundType:p.presets.DEFAULT.soundType,trailStrength:p.presets.DEFAULT.trailStrength,pattern:{spokes:p.presets.DEFAULT.spokes,spokeJitter:p.presets.DEFAULT.spokeJitter,spinSpeed:p.presets.DEFAULT.spinSpeed,funnelHeight:p.presets.DEFAULT.funnelHeight,funnelBottom:p.presets.DEFAULT.funnelBottom,funnelCrownRadius:p.presets.DEFAULT.funnelCrownRadius,funnelWaistRadius:p.presets.DEFAULT.funnelWaistRadius,funnelTailRadius:p.presets.DEFAULT.funnelTailRadius,funnelWaistT:p.presets.DEFAULT.funnelWaistT,funnelCrownT:p.presets.DEFAULT.funnelCrownT,funnelFadeStart:p.presets.DEFAULT.funnelFadeStart,funnelFadeEnd:p.presets.DEFAULT.funnelFadeEnd,trailStrength:.25,soundPitch:140,soundDuration:1.5,soundType:"sine"},heatCold:[.1,.4,1],heatWarm:[1,1,.1],heatHot:[1,.1,.1],get totalExplosionDuration(){const e=r&&r.activeStyle>=0?r.activeStyle:this.motionStyle;if(e===1){const l=this.expansionDuration||3.5,t=this.pattern&&this.pattern.vortexDuration?this.pattern.vortexDuration:4.5,f=this.pattern&&this.pattern.equilibriumDuration?this.pattern.equilibriumDuration:3.5,d=this.contractionDuration||3.5;return l+t+f+d}if(e===2)return 11.8;if(e===3)return 7.5;if(e===4)return 16;if(e===5)return 14;const n=this.activeExpansionDuration||this.expansionDuration,o=this.activeContractionDuration||this.contractionDuration;return n+(e===0||e===-1?3:0)+o}},s={scene:null,camera:null,renderer:null,particles:null,clock:new Kn,trailPoints:null,trailData:null,trailLive:null,trailPosAttr:null,trailLiveAttr:null,emberPoints:null,emberData:null,emberVel:null,emberLife:null,emberPosAttr:null,emberLifeAttr:null,targetZ:p.initialZ,autoFit:!0,prevTime:0,prevDt:0,prevKFrame:0,prevDampFrame:0},r={posHome:null,posLive:null,explosionOrigin:null,springDisp:null,springVel:null,randomDir:null,randomSpeed:null,funnelT:null,funnelRadialX:null,funnelRadialZ:null,activeStyle:-1,slots:[],sendQueue:[],seq:0,sourceGeneration:0,motionToken:0,explosionStartTime:-1,positionsDirty:!1,randomized:null};function po(){return typeof window<"u"&&new URLSearchParams(window.location.search).get("noworker")==="1"?15e3:xe||a.gpuPhysics?3e4:15e3}const W={keys:{ArrowUp:!1,ArrowDown:!1,ArrowLeft:!1,ArrowRight:!1,"+":!1,"-":!1,"=":!1," ":!1},mouseWorld:new Ae,mouseLocal:new Ae,invMatrix:new oo,mouseWorldPos:new Ae(-1e3,-1e3,0),lastClickTime:0,lastPinchDist:null,lastMidpoint:new no,lastGestureEndTime:0,inputDebounceTimer:null,toastTimer:null,flashTimer:null,drawerCloseTimer:null,wordmarkTimer:null,menuRestoreDesktop:!1,menuRestoreMobile:!1,isDragging:!1,prevMouseX:0,prevMouseY:0,pendingPointer:null},I={uMouse:{value:new Ae(-1e3,-1e3,0)},uMouseInfluence:{value:p.mouseInfluence},uPointSize:{value:p.pointSize},uPixelRatio:{value:1},uPointScale:{value:p.pointSizeAttenuationScale/p.initialZ},uDepthCue:{value:.28},uColorHot:{value:new Ae(1,0,0)},uColorWarm:{value:new Ae(1,1,0)},uColorCold:{value:new Ae(1,1,1)},uExplosionActive:{value:0},uTornadoActive:{value:0},uTornadoFadeStart:{value:.03},uTornadoFadeEnd:{value:.3},uHeatDistance:{value:p.heatDistance},uHeatCold:{value:new Ae(.1,.4,1)},uHeatWarm:{value:new Ae(1,1,.1)},uHeatHot:{value:new Ae(1,.1,.1)},uAudioMid:{value:0},uAudioHigh:{value:0},uAudioEnvelope:{value:0},uPointSizeTrail:{value:.4},uTrailStrength:{value:.25},uEmojiMode:{value:0},uEmojiMotionMix:{value:p.emojiMotionMix},uUseSourceTexture:{value:0},uSourceTexture:{value:null},uGpuPhysics:{value:1},uMotionStyle:{value:0},uExplosionElapsed:{value:-1},uExpDuration:{value:2},uDriftDuration:{value:3},uContractionDuration:{value:2},uMaxDist:{value:35},uSpinSpeed:{value:5.2},uFunnelBottom:{value:-22},uFunnelHeight:{value:46},uFunnelCrownRadius:{value:22},uFunnelWaistRadius:{value:3.5},uFunnelTailRadius:{value:.8},uFunnelWaistT:{value:.42},uFunnelCrownExp:{value:1.4},uBreezeBlowDir:{value:1},uBreezeIntensity:{value:1},uBreezeSwirl:{value:0},uMSweepX:{value:24},uMSweepY:{value:4},uMSweepZ:{value:12},uMFreqX:{value:3.456},uMFreqY:{value:5.341},uMFreqZ:{value:2.827},uMPhX:{value:.4},uMPhY:{value:0},uMPhZ:{value:1.2},uMLaunchDir:{value:1},uKnotScale:{value:11},uMouseWorld:{value:new Ae(-1e3,-1e3,0)},uMousePushDistance:{value:p.repulsionStrength},uMouseActive:{value:0}};let Lt=0,nn=null,Nt=0,Kt=0;function _e(e,n="info"){const o=document.getElementById("toast");o&&(o.textContent=e,o.classList.remove("info","success","error"),o.classList.add(n==="success"||n==="error"?n:"info"),o.classList.add("show"),clearTimeout(W.toastTimer),W.toastTimer=setTimeout(()=>{o.classList.remove("show")},3e3))}function Dt(e){const n=document.getElementById("sr-announce");n&&(n.textContent=e)}function ho(){const e=document.getElementById("flash");e&&(e.classList.remove("active"),e.offsetWidth,e.classList.add("active"),clearTimeout(W.flashTimer),W.flashTimer=setTimeout(()=>e.classList.remove("active"),120))}let De=null,Tt=null,Ye=null,ot=null;function go(){De&&Tt||(De||(De=new(window.AudioContext||window.webkitAudioContext)),Tt=De.createGain(),Tt.gain.value=1,Ye=De.createAnalyser(),Ye.fftSize=256,Ye.smoothingTimeConstant=.6,Tt.connect(Ye),Ye.connect(De.destination),ot=new Uint8Array(Ye.frequencyBinCount))}function Qt(e,n,o,i){let l=0,t=0;const f=Math.max(0,Math.floor(n*i)),d=Math.min(i,Math.floor(o*i));for(let b=f;b<d;b++)l+=e[b]/255,t++;return t?l/t:0}function vo(){if(!Ye||!De||!ot)return;if(De.state!=="running"){I.uAudioEnvelope.value=0;return}if(r.explosionStartTime<0&&I.uAudioEnvelope.value<.005&&I.uAudioMid.value<.005&&I.uAudioHigh.value<.005){I.uAudioMid.value=0,I.uAudioHigh.value=0,I.uAudioEnvelope.value=0;return}Ye.getByteFrequencyData(ot);const e=ot.length,n=Qt(ot,.02,.25,e),o=Qt(ot,.25,.55,e),i=Qt(ot,.55,.92,e);I.uAudioMid.value+=(o-I.uAudioMid.value)*.5,I.uAudioHigh.value+=(i-I.uAudioHigh.value)*.5;const l=Math.min(1,n*1.3+o*.5+i*.6);I.uAudioEnvelope.value+=(l-I.uAudioEnvelope.value)*.6}function xo(e){try{if(go(),!De)return;const n=De.currentTime,o=Math.max(.3,e*.55),i=De.createOscillator();i.type="sine",i.frequency.setValueAtTime(85,n),i.frequency.exponentialRampToValueAtTime(32,n+o);const l=De.createGain();l.gain.setValueAtTime(1e-4,n),l.gain.exponentialRampToValueAtTime(.16,n+Math.min(.25,o*.3)),l.gain.exponentialRampToValueAtTime(1e-4,n+o),i.connect(l),l.connect(Tt),i.start(n),i.stop(n+o+.05),setTimeout(()=>{try{i.disconnect(),l.disconnect()}catch{}},(o+.1)*1e3)}catch(n){console.warn("Rumble synthesis error:",n)}}async function Un(e){if(!e)return;const n=`bold ${p.fontSize}px "${e}"`;try{await document.fonts.load(n)}catch(o){console.warn(`Font load note for "${e}":`,o)}}let zt=null,Sn=null;function yo(e){zt||(zt=document.createElement("canvas"),Sn=zt.getContext("2d",{willReadFrequently:!0}));const n=zt,o=Sn;n.width=p.canvasWidth,n.height=p.canvasHeight,o.fillStyle="black",o.fillRect(0,0,p.canvasWidth,p.canvasHeight),o.fillStyle="white",o.font=`bold ${p.fontSize}px "${a.currentFont}", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,p.canvasWidth/2,p.canvasHeight/2);const i=o.getImageData(0,0,p.canvasWidth,p.canvasHeight).data,l=p.canvasWidth,t=p.canvasHeight,f=p.pixelStep,d=p.pixelThreshold;let b=0,H=1/0,S=-1/0,h=1/0,c=-1/0;for(let L=0;L<t;L+=f)for(let C=0;C<l;C+=f)i[(L*l+C)*4]>d&&(b++,C<H&&(H=C),C>S&&(S=C),L<h&&(h=L),L>c&&(c=L));if(b===0)return null;const V=p.targetWorldWidth/Math.max(S-H,1),m=(H+S)/2,A=(h+c)/2,T=new Float32Array(b*3);let q=0;for(let L=0;L<t;L+=f)for(let C=0;C<l;C+=f)i[(L*l+C)*4]>d&&(T[q++]=(C-m)*V,T[q++]=(A-L)*V,T[q++]=0);return T}let kt=null,bn=null;function wo(e){if(!e)return null;const n=e.naturalWidth||e.width,o=e.naturalHeight||e.height;if(!n||!o)return null;kt||(kt=document.createElement("canvas"),bn=kt.getContext("2d",{willReadFrequently:!0}));const i=p.imageRasterSize,l=kt,t=bn;l.width=i,l.height=i,t.clearRect(0,0,i,i),t.imageSmoothingEnabled=!0;const f=Math.round(i*.04),d=Math.min((i-f*2)/n,(i-f*2)/o),b=Math.max(1,Math.round(n*d)),H=Math.max(1,Math.round(o*d)),S=Math.round((i-b)/2),h=Math.round((i-H)/2);t.drawImage(e,S,h,b,H);const c=t.getImageData(0,0,i,i).data,V=p.imagePixelStep,m=p.imageAlphaThreshold,A=[],T=[],q=[],L=[],C=[];let y=1/0,w=-1/0,M=1/0,z=-1/0;const Z=(u,U)=>u<0||U<0||u>=i||U>=i?0:c[(U*i+u)*4+3];for(let u=0;u<i;u+=V)for(let U=0;U<i;U+=V){const _=(u*i+U)*4,$=c[_+3];if($<=m)continue;A.push(U,u),T.push(c[_],c[_+1],c[_+2]),q.push($),L.push(1);const te=Z(U-V,u)<=m||Z(U+V,u)<=m||Z(U,u-V)<=m||Z(U,u+V)<=m;C.push(te),U<y&&(y=U),U>w&&(w=U),u<M&&(M=u),u>z&&(z=u)}if(A.length===0)return null;const k=Math.max(w-y,1),D=Math.max(z-M,1),R=p.targetWorldWidth/Math.max(k,D),g=(y+w)/2,x=(M+z)/2,E=p.imageDepthRange*.5,v=A.length/2,F=[],G=[],j=[],B=[],X=[];for(let u=0;u<v;u+=8){const U=A[u*2],_=A[u*2+1];F.push((U-g)*R,(x-_)*R,-E),G.push(U/i,1-_/i),j.push(T[u*3],T[u*3+1],T[u*3+2]),B.push(q[u]),X.push(L[u])}for(let u=0;u<v;u++){if(!C[u])continue;const U=A[u*2],_=A[u*2+1],$=T[u*3],te=T[u*3+1],ee=T[u*3+2],ie=q[u],Q=L[u],N=U/i,ae=1-_/i,re=(U-g)*R,ne=(x-_)*R;F.push(re,ne,-E*.33),G.push(N,ae),j.push($,te,ee),B.push(ie),X.push(Q),F.push(re,ne,E*.33),G.push(N,ae),j.push($,te,ee),B.push(ie),X.push(Q)}for(let u=0;u<v;u++){const U=A[u*2],_=A[u*2+1];F.push((U-g)*R,(x-_)*R,E),G.push(U/i,1-_/i),j.push(T[u*3],T[u*3+1],T[u*3+2]),B.push(q[u]),X.push(L[u])}const Y=new Float32Array(F),J=new Float32Array(G),se=new Uint8Array(j),O=new Uint8Array(B),K=new Uint8Array(X);return{flat:Y,uvs:J,colors:se,covers:O,sizes:K,featureCount:v,frontCount:v,bounds:{w:k,h:D},sourceCanvas:l}}let qt=null,An=null;function To(e){qt||(qt=document.createElement("canvas"),An=qt.getContext("2d",{willReadFrequently:!0}));const n=qt,o=An,i=p.emojiRasterSize;n.width=i,n.height=i,o.clearRect(0,0,i,i),o.fillStyle="white",o.font=`${p.emojiFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(e,i/2,i/2+i*.02);const l=o.getImageData(0,0,i,i).data,t=p.emojiPixelStep,f=p.pixelThreshold,d=[],b=[],H=[],S=[];let h=1/0,c=-1/0,V=1/0,m=-1/0;const A=(v,F)=>v<0||F<0||v>=i||F>=i?0:l[(F*i+v)*4+3];for(let v=0;v<i;v+=t)for(let F=0;F<i;F+=t){const G=(v*i+F)*4,j=l[G+3];if(j<=f)continue;d.push(F,v),b.push(l[G],l[G+1],l[G+2]),H.push(j);const B=A(F-t,v)<=f||A(F+t,v)<=f||A(F,v-t)<=f||A(F,v+t)<=f;S.push(B),F<h&&(h=F),F>c&&(c=F),v<V&&(V=v),v>m&&(m=v)}if(d.length===0)return null;const T=p.targetWorldWidth/Math.max(c-h,1),q=(h+c)/2,L=(V+m)/2,y=p.emojiDepthRange*.5,w=d.length/2,M=[],z=[],Z=[],k=[],D=[];for(let v=0;v<w;v+=4){const F=d[v*2],G=d[v*2+1];M.push((F-q)*T,(L-G)*T,-y),z.push(F/i,1-G/i),Z.push(b[v*3],b[v*3+1],b[v*3+2]),k.push(H[v]),D.push(1)}for(let v=0;v<w;v++){if(!S[v])continue;const F=d[v*2],G=d[v*2+1],j=b[v*3],B=b[v*3+1],X=b[v*3+2],Y=H[v],J=F/i,se=1-G/i,O=(F-q)*T,K=(L-G)*T;M.push(O,K,-y*.33),z.push(J,se),Z.push(j,B,X),k.push(Y),D.push(1),M.push(O,K,y*.33),z.push(J,se),Z.push(j,B,X),k.push(Y),D.push(1)}for(let v=0;v<w;v++){const F=d[v*2],G=d[v*2+1];M.push((F-q)*T,(L-G)*T,y),z.push(F/i,1-G/i),Z.push(b[v*3],b[v*3+1],b[v*3+2]),k.push(H[v]),D.push(1)}const R=new Float32Array(M),g=new Float32Array(z),x=new Uint8Array(Z),P=new Uint8Array(k),E=new Uint8Array(D);return{flat:R,uvs:g,colors:x,covers:P,sizes:E,featureCount:w,frontCount:w,bounds:{w:c-h,h:m-V},sourceCanvas:n}}let $t=0;async function qe(e,n=!1){$t++;const o=$t;await Un(a.currentFont);const i=`bold ${p.fontSize}px "${a.currentFont}"`;if(!document.fonts.check(i))try{await document.fonts.load(i)}catch(u){console.warn(`Failed to pre-load custom font "${a.currentFont}":`,u)}if(o!==$t)return;r.sourceGeneration++,r.motionToken++,r.randomized=null;const l=!!s.particles;let t=null;if(l){const u=s.particles.geometry.attributes.position;t=u?u.array:null}const f=a.messageMode==="emoji"&&a.activeEmoji&&p.emojiOptions.includes(a.activeEmoji),d=a.messageMode==="image"&&!!a.activeImage,b=f?To(e):null,H=d?wo(a.activeImage):null,S=b||H,h=!!S,c=S?S.flat:d?null:yo(e);if(!c){_e(d?"The image has no visible pixels!":"Text must contain at least one visible character!","error");return}const{jitterXY:V,jitterZ:m,explosionSpeedMin:A,explosionSpeedRange:T}=p,q=h?p.emojiDensityOverride:p.density;let L=c.length/3,C=1;const y=po(),w=Math.floor(y/q);let M=c,z=null,Z=null,k=null,D=null;if(h){if(z=S.colors,Z=S.covers,k=S.sizes,D=S.uvs||null,L>y){const u=[],U=S.frontCount||L;if(U<=y){for(let ae=0;ae<U;ae++)u.push(ae);const Q=y-U,N=L-U;if(Q>0&&N>0){const ae=Math.max(1,Math.ceil(N/Q));for(let re=U;re<L&&u.length<y;re+=ae)u.push(re)}}else{const Q=Math.ceil(U/y);for(let N=0;N<U&&u.length<y;N+=Q)u.push(N)}const _=new Float32Array(u.length*3),$=new Uint8Array(u.length*3),te=new Uint8Array(u.length),ee=new Uint8Array(u.length),ie=D?new Float32Array(u.length*2):null;for(let Q=0;Q<u.length;Q++){const N=u[Q];_[Q*3]=M[N*3],_[Q*3+1]=M[N*3+1],_[Q*3+2]=M[N*3+2],$[Q*3]=z[N*3],$[Q*3+1]=z[N*3+1],$[Q*3+2]=z[N*3+2],te[Q]=Z[N],ee[Q]=k[N],ie&&D&&(ie[Q*2]=D[N*2],ie[Q*2+1]=D[N*2+1])}M=_,z=$,Z=te,k=ee,D=ie,L=u.length}}else L*q>y&&(C=Math.max(1,Math.ceil(L/w)));const g=Math.ceil(L/C)*q;r.posHome=new Float32Array(g*3),r.posLive=new Float32Array(g*3),r.explosionOrigin=new Float32Array(g*3),r.springDisp=new Float32Array(g*3),r.springVel=new Float32Array(g*3),r.randomDir=new Float32Array(g*3),r.randomSpeed=new Float32Array(g),r.funnelT=new Float32Array(g),r.funnelRadialX=new Float32Array(g),r.funnelRadialZ=new Float32Array(g);const x=Math.PI*(3-Math.sqrt(5));for(let u=0;u<g;u++){const U=(u*.6180339887498949+.5)%1,_=.75+.3*((u*.7548776662466927+.17)%1),$=u*x%(Math.PI*2);r.funnelT[u]=Math.pow(U,.85),r.funnelRadialX[u]=Math.cos($)*_,r.funnelRadialZ[u]=Math.sin($)*_}const P=new Uint8Array(g*4),E=new Uint8Array(g),v=new Float32Array(g*2),F=f?{xy:p.emojiJitterXY,z:p.emojiJitterZ}:{xy:p.imageJitterXY,z:p.imageJitterZ},G=h?F.xy:V,j=h?F.z:m;let B=0;for(let u=0;u<L;u+=C,B++){const U=M[u*3],_=M[u*3+1],$=M[u*3+2];for(let te=0;te<q;te++){const ee=B*q+te,ie=ee*3,Q=ie+1,N=ie+2,ae=U+(Math.random()-.5)*G,re=_+(Math.random()-.5)*G,ne=$+(Math.random()-.5)*j;r.posHome[ie]=ae,r.posHome[Q]=re,r.posHome[N]=ne;const fe=n?(Math.random()-.5)*45:0,pe=n?(Math.random()-.5)*45:0,we=n?(Math.random()-.5)*35:0;r.posLive[ie]=ae+fe,r.posLive[Q]=re+pe,r.posLive[N]=ne+we,r.springDisp[ie]=fe,r.springDisp[Q]=pe,r.springDisp[N]=we;const ce=Math.random()*Math.PI*2,le=Math.acos(Math.random()*2-1);r.randomDir[ie]=Math.sin(le)*Math.cos(ce),r.randomDir[Q]=Math.sin(le)*Math.sin(ce),r.randomDir[N]=Math.cos(le),r.randomSpeed[ee]=A+Math.random()*T,z?(P[ee*4]=z[u*3],P[ee*4+1]=z[u*3+1],P[ee*4+2]=z[u*3+2],P[ee*4+3]=Z[u],E[ee]=k[u],D&&(v[ee*2]=D[u*2],v[ee*2+1]=D[u*2+1])):(P[ee*4]=255,P[ee*4+1]=255,P[ee*4+2]=255,P[ee*4+3]=255,E[ee]=1,v[ee*2]=0,v[ee*2+1]=0)}}rn=ko(),s.autoFit&&At(),l&&!n&&t&&t.length===r.posLive.length&&(r.posLive.set(t),r.springDisp.fill(0),r.springVel.fill(0)),r.explosionOrigin.set(r.posLive),r.slots=[],r.sendQueue=[];for(let u=0;u<2;u++){const U={posLive:new Float32Array(g*3),springDisp:new Float32Array(g*3),springVel:new Float32Array(g*3),inFlight:!1,needsReset:!1};U.posLive.set(r.posLive),U.springDisp.set(r.springDisp),U.springVel.set(r.springVel),r.slots.push(U)}const X=!s.particles,Y=X?new Jt:s.particles.geometry,J=new ge(r.posLive,3);J.setUsage(wt),Y.setAttribute("position",J),Y.setAttribute("homePosition",new ge(r.posHome,3)),Y.setAttribute("sourceColor",new ge(P,4,!0)),Y.setAttribute("sampleSize",new ge(E,1)),Y.setAttribute("funnelT",new ge(r.funnelT,1)),Y.setAttribute("aSourceUV",new ge(v,2)),on();const se=new Float32Array(g),O=new Float32Array(g*3),K=new Float32Array(g);for(let u=0;u<g;u++)se[u]=u,O[u*3]=r.funnelRadialX[u],O[u*3+1]=0,O[u*3+2]=r.funnelRadialZ[u],K[u]=u%2===0?1:-1;if(Y.setAttribute("aRandomDir",new ge(new Float32Array(r.randomDir),3)),Y.setAttribute("aRandomSpeed",new ge(new Float32Array(r.randomSpeed),1)),Y.setAttribute("aIndex",new ge(se,1)),Y.setAttribute("aSeed",new ge(O,3)),Y.setAttribute("aCustomDir",new ge(K,1)),X){const u=new en({uniforms:I,vertexShader:mo,fragmentShader:fo,blending:Xt,depthWrite:!1,transparent:!0});s.particles=new tn(Y,u),s.scene.add(s.particles)}if(I.uEmojiMode.value=h?1:0,I.uPointSize.value=f?p.emojiPointSize:d?p.imagePointSize:p.pointSize,I.uDepthCue.value=f?p.emojiDepthCue:d?p.imageDepthCue:.28,s.particles.material.blending=h?eo:Xt,s.particles.material.needsUpdate=!0,I.uSourceTexture.value&&(I.uSourceTexture.value.dispose(),I.uSourceTexture.value=null),h&&S&&S.sourceCanvas){const u=new to(S.sourceCanvas);u.minFilter=xn,u.magFilter=xn,u.needsUpdate=!0,I.uSourceTexture.value=u,I.uUseSourceTexture.value=1}else I.uUseSourceTexture.value=0;s.particles.rotation.set(0,0,0),xe&&xe.postMessage({type:"init",data:{posHome:r.posHome.slice(),explosionOrigin:r.explosionOrigin.slice(),randomDir:r.randomDir.slice(),randomSpeed:r.randomSpeed.slice(),funnelT:r.funnelT.slice(),funnelRadialX:r.funnelRadialX.slice(),funnelRadialZ:r.funnelRadialZ.slice()}}),Mo()}function Mo(){const e=r.posLive.length;s.trailData=new Float32Array(e),s.trailLive=new Float32Array(e),s.trailData.set(r.posLive),s.trailLive.set(r.posLive);const n=new ge(s.trailData,3);n.setUsage(wt);const o=new ge(s.trailLive,3);o.setUsage(wt),s.trailPoints&&(s.scene.remove(s.trailPoints),s.trailPoints.geometry.dispose(),s.trailPoints.material.dispose());const i=new Jt;i.setAttribute("position",n),i.setAttribute("livePosition",o),i.setAttribute("homePosition",new ge(r.posHome,3)),i.setAttribute("funnelT",new ge(r.funnelT,1)),s.trailPoints=new tn(i,new en({uniforms:I,vertexShader:ao,fragmentShader:io,blending:Xt,depthWrite:!1,transparent:!0})),s.trailPoints.frustumCulled=!1,s.scene.add(s.trailPoints),s.trailPosAttr=n,s.trailLiveAttr=o;const l=300;s.emberData=new Float32Array(l*3),s.emberVel=new Float32Array(l*3),s.emberLife=new Float32Array(l),s.emberCount=l;const t=new ge(s.emberData,3);t.setUsage(wt);const f=new ge(s.emberLife,1);f.setUsage(wt),s.emberPoints&&(s.scene.remove(s.emberPoints),s.emberPoints.geometry.dispose(),s.emberPoints.material.dispose());const d=new Jt;d.setAttribute("position",t),d.setAttribute("aLife",f),s.emberPoints=new tn(d,new en({uniforms:{},vertexShader:so,fragmentShader:ro,blending:Xt,depthWrite:!1,transparent:!0})),s.emberPoints.renderOrder=2,s.scene.add(s.emberPoints),s.emberPosAttr=t,s.emberLifeAttr=f}function So(){if(!s.particles||!s.trailData)return;if(ut&&s.trailPoints){s.trailPoints.visible=!1;return}if(a.gpuPhysics&&r.explosionStartTime>=0){s.trailPoints&&(s.trailPoints.visible=!1);return}if(s.trailPoints&&(s.trailPoints.visible=!0),r.positionsDirty||r.explosionStartTime>=0||W.isDragging||W.mouseLocal&&W.mouseLocal.x>-500)s.trailSettleFrames=0;else{if(s.trailSettleFrames>=20)return;s.trailSettleFrames=(s.trailSettleFrames||0)+1}r.positionsDirty=!1;const n=s.particles.geometry.attributes.position.array,o=s.trailData,i=s.trailLive,l=.22;for(let t=0;t<n.length;t++)o[t]+=(n[t]-o[t])*l,i[t]=n[t];s.trailPosAttr.needsUpdate=!0,s.trailLiveAttr.needsUpdate=!0}function bo(){if(!s.emberData||!s.particles||ut)return;const e=a.activePreset&&p.presets[a.activePreset]||null,n=e&&e.emberBudget||90,o=Math.min(s.emberCount,n),i=s.particles.geometry.attributes.position.array,l=r.explosionOrigin||r.posHome,t=i.length,f=[];for(let d=0;d<t/3;d++){const b=d*3,H=i[b]-l[b],S=i[b+1]-l[b+1],h=i[b+2]-l[b+2];H*H+S*S+h*h>1&&f.push(d)}if(f.length!==0)for(let d=0;d<o;d++){const b=d*3,S=f[Math.random()*f.length|0]*3;s.emberData[b]=i[S],s.emberData[b+1]=i[S+1],s.emberData[b+2]=i[S+2];const h=i[S]-l[S],c=i[S+1]-l[S+1],V=i[S+2]-l[S+2],m=Math.sqrt(h*h+c*c+V*V)||1,A=3+Math.random()*14;s.emberVel[b]=h/m*A+(Math.random()-.5)*4,s.emberVel[b+1]=c/m*A+(Math.random()-.5)*4,s.emberVel[b+2]=V/m*A*.5+(Math.random()-.5)*2,s.emberLife[d]=.35+Math.random()*.45}}function Ao(e){if(!s.emberData)return;if(ut&&s.emberPoints){s.emberPoints.visible=!1;return}s.emberPoints&&(s.emberPoints.visible=!0);const n=s.emberCount,o=Math.pow(.02,e);let i=0;for(let l=0;l<n;l++){if(s.emberLife[l]<=0)continue;i++;const t=l*3;s.emberData[t]+=s.emberVel[t]*e,s.emberData[t+1]+=s.emberVel[t+1]*e,s.emberData[t+2]+=s.emberVel[t+2]*e,s.emberVel[t+1]-=8*e,s.emberVel[t]*=o,s.emberVel[t+1]*=o,s.emberVel[t+2]*=o,s.emberLife[l]-=e,s.emberLife[l]<=0&&(s.emberLife[l]=0)}i>0&&(s.emberPosAttr.needsUpdate=!0,s.emberLifeAttr.needsUpdate=!0)}const Dn=new Ae;function ln(e,n){const o=s.renderer.domElement.getBoundingClientRect(),i=(e-o.left)/o.width*2-1,l=-((n-o.top)/o.height)*2+1;s.camera.isOrthographicCamera&&(Dn.set(i,l,0).unproject(s.camera),W.mouseWorld.copy(Dn),W.mouseWorld.z=0)}function on(){if(!r.randomDir||!r.randomSpeed)return;const e=r.randomSpeed.length,{explosionSpeedMin:n,explosionSpeedRange:o}=p,i=a.pattern,l=r.posHome,t=typeof a.motionStyle=="number"&&a.motionStyle>=0?a.motionStyle:Math.floor(Math.random()*4);if(t===1){const w=Math.random()<.5?1:-1,M=(3.8+Math.random()*2.8)*w,z=38+Math.random()*16,Z=18+Math.random()*12,k=2.4+Math.random()*2.8,D=.8+Math.random()*1.6,R=.32+Math.random()*.16,g=1.15+Math.random()*.65;a.pattern={...a.pattern,spinSpeed:M,funnelHeight:z,funnelCrownRadius:Z,funnelWaistRadius:k,funnelTailRadius:D,funnelWaistT:R,funnelCrownExp:g}}Lt++;const f=[1.35,1.85,.9,2.2],b=f[Lt%f.length]*(.92+Math.random()*.16),S=(Lt%2===1?!0:Math.random()<.5)?1:-1;let h=S,c=(Math.random()-.5)*.08,V=(Math.random()-.5)*.05;const m=Math.sqrt(h*h+c*c+V*V)||1;h/=m,c/=m,V/=m;const A=[0,.85,1.45,.35,0,1.2],T=A[Lt%A.length],q=T===0?0:T*(.85+Math.random()*.3);Me={blowDir:S,intensity:b,swirl:q,windAngleY:(Math.random()-.5)*.22,windAngleZ:(Math.random()-.5)*.12,strengthMult:b,easePower:1.45+Math.random()*.4,seedXi:Math.random()*100,peakX:(Math.random()-.5)*22,peakY:3.5+Math.random()*5,peakAmp:(16+Math.random()*7)*b,peakWidthX:.065+Math.random()*.025,peakWidthY:.11+Math.random()*.035,creaseY:-(3.5+Math.random()*4),creaseAmp:6.5+Math.random()*3,creaseFreq:.11+Math.random()*.04,billowAmp1:7.5+Math.random()*3,billowAmp2:3+Math.random()*2,depthAmp:13+Math.random()*4.5,turbAmp:3+Math.random()*1.8,shearMult:.22+Math.random()*.18},r.breeze=Me;const L=Math.max(2,i.spokes||12),C=i.spokeJitter!=null?i.spokeJitter:.03,y=Math.PI*(3-Math.sqrt(5));for(let w=0;w<e;w++){const M=w*3,z=M+1,Z=M+2;let k,D,R;if(t===1){const x=l[M],P=l[Z],E=x*x+P*P;let v,F;if(E>1e-6){const j=1/Math.sqrt(E);v=-P*j,F=x*j}else{const j=Math.random()*Math.PI*2;v=Math.cos(j),F=Math.sin(j)}const G=Math.random()<.5?1:-1;k=v*G+(Math.random()-.5)*.15,D=.72+(Math.random()-.5)*.12,R=F*G+(Math.random()-.5)*.15}else if(t===2){h=S,c=(Math.random()-.5)*.04,V=(Math.random()-.5)*.04;const x=Math.hypot(h,c,V)||1;h/=x,c/=x,V/=x,k=h*.92+(Math.random()*2-1)*.08,D=(Math.random()*2-1)*.12,R=(Math.random()*2-1)*.12}else if(t===3){const x=w%L,P=x*y,E=Math.acos(Math.max(-1,Math.min(1,1-2*(x+.5)/L))),v=Math.sin(E)*Math.cos(P),F=Math.sin(E)*Math.sin(P),G=Math.cos(E);k=v+(Math.random()-.5)*2*C,D=F+(Math.random()-.5)*2*C,R=G+(Math.random()-.5)*2*C}else{const x=Math.random()*Math.PI*2,P=Math.acos(Math.random()*2-1);k=Math.sin(P)*Math.cos(x),D=Math.sin(P)*Math.sin(x),R=Math.cos(P)}const g=Math.sqrt(k*k+D*D+R*R)||1;if(k/=g,D/=g,R/=g,t===2)r.randomSpeed[w]=(n+Math.random()*o)*(1.4+Math.random()*.9);else if(t===3)r.randomSpeed[w]=(n+Math.random()*o)*(1.5+Math.random()*.7);else{const x=.75+Math.random()*.55;r.randomSpeed[w]=(n+Math.random()*o)*x}r.randomDir[M]=k,r.randomDir[z]=D,r.randomDir[Z]=R}if(r.randomized={dirs:r.randomDir.slice(0,uo*3),style:t},r.activeStyle=t,s.particles&&s.particles.geometry){const w=s.particles.geometry.attributes.aRandomDir;w&&w.array&&w.array.length===r.randomDir.length&&(w.copyArray(r.randomDir),w.needsUpdate=!0);const M=s.particles.geometry.attributes.aRandomSpeed;M&&M.array&&M.array.length===r.randomSpeed.length&&(M.copyArray(r.randomSpeed),M.needsUpdate=!0)}}function Do(){if(!s.particles||!r.explosionOrigin)return;const e=s.particles.geometry.attributes.position.array;if(e.length===r.explosionOrigin.length){r.explosionOrigin.set(e),r.posLive.set(e),r.springDisp.fill(0),r.springVel.fill(0),r.motionToken++;for(const n of r.slots)n.inFlight?n.needsReset=!0:((!n.posLive||!n.posLive.buffer||n.posLive.buffer.byteLength===0)&&(n.posLive=new Float32Array(e.length),n.springDisp=new Float32Array(e.length),n.springVel=new Float32Array(e.length)),n.posLive.set(e),n.springDisp.fill(0),n.springVel.fill(0),n.needsReset=!1)}}function Xn(e){document.querySelectorAll(".preset-chip").forEach(o=>{o.disabled=e,o.classList.toggle("disabled",e),e?o.setAttribute("aria-disabled","true"):o.removeAttribute("aria-disabled")})}function lt(e=!1){if(r.explosionStartTime>=0)return;r.explosionStartTime=-1,Do(),a.actualTravelRadius=0,a.travelApplied=!1,a.embersSpawned=!1,a.afterglowStartTime=null,It=0,a.motionStyle===5&&(a.pattern={...a.pattern,mSweepX:16+Math.random()*14,mSweepY:3.5+Math.random()*4,mSweepZ:8+Math.random()*8,mFreqX:2.8+Math.random()*1.2,mFreqY:4.6+Math.random()*1.4,mFreqZ:2.2+Math.random()*1.2,mPhX:Math.random()*6.283,mPhY:Math.random()*6.283,mPhZ:Math.random()*6.283,mLaunchDir:Math.random()<.5?1:-1}),a.activeMaxDist=a.explosionMaxDistMultiplier*(.8+Math.random()*.4),a.activeExpansionDuration=a.expansionDuration*(.85+Math.random()*.3),a.activeContractionDuration=a.contractionDuration||4;const n=a.activeContractionDuration;a.gpuPhysics?on():xe?xe.postMessage({type:"randomize",data:{explosionSpeedMin:p.explosionSpeedMin,explosionSpeedRange:p.explosionSpeedRange,motionStyle:a.motionStyle,pattern:a.pattern,breeze:Me,explosionOrigin:r.explosionOrigin.slice(),motionToken:r.motionToken,sourceGeneration:r.sourceGeneration}}):on(),r.explosionStartTime=s.clock.getElapsedTime(),Xn(!0),Ho();const o=a.activePreset||a.lastRandomPreset,i=o&&p.presets[o]?p.presets[o]:null;Gt(i&&i.description?i.description:Ht(a.messageMode)),(a.motionStyle===0||a.motionStyle===-1)&&ho(),a.audioEnabled&&co(a,n),Dt(`Explosion triggered for "${a.currentText}"`)}function St(e,n,o,i=!0){const l=new URL(window.location);l.searchParams.set("t",e),l.searchParams.set("theme",n),l.searchParams.set("font",o),i?window.history.pushState({},"",l):window.history.replaceState({},"",l)}function cn(e){a.activeExpansionDuration=null,a.activeContractionDuration=null,a.expansionDuration=e.expansionDuration,a.driftDuration=e.driftDuration!==void 0?e.driftDuration:0,a.contractionDuration=e.contractionDuration,a.explosionMaxDistMultiplier=e.explosionMaxDistMultiplier,a.motionStyle=e.motionStyle!=null?e.motionStyle:-1,r.activeStyle=a.motionStyle,a.soundPitch=e.soundPitch,a.soundDuration=e.soundDuration,a.soundType=e.soundType,a.trailStrength=e.trailStrength!=null?e.trailStrength:.25,a.pattern={spokes:e.spokes!=null?e.spokes:12,spokeJitter:e.spokeJitter!=null?e.spokeJitter:.03,spinSpeed:e.spinSpeed!=null?e.spinSpeed:0,funnelHeight:e.funnelHeight!=null?e.funnelHeight:0,funnelBottom:e.funnelBottom!=null?e.funnelBottom:0,funnelCrownRadius:e.funnelCrownRadius!=null?e.funnelCrownRadius:0,funnelWaistRadius:e.funnelWaistRadius!=null?e.funnelWaistRadius:0,funnelTailRadius:e.funnelTailRadius!=null?e.funnelTailRadius:0,funnelWaistT:e.funnelWaistT!=null?e.funnelWaistT:0,funnelCrownT:e.funnelCrownT!=null?e.funnelCrownT:0,funnelFadeStart:e.funnelFadeStart!=null?e.funnelFadeStart:0,funnelFadeEnd:e.funnelFadeEnd!=null?e.funnelFadeEnd:0,vortexDuration:e.vortexDuration!=null?e.vortexDuration:4.5,equilibriumDuration:e.equilibriumDuration!=null?e.equilibriumDuration:3.5,swayAmp:e.swayAmp!=null?e.swayAmp:0,swayFreq:e.swayFreq!=null?e.swayFreq:0,gustAmp:e.gustAmp!=null?e.gustAmp:0,gustFreq:e.gustFreq!=null?e.gustFreq:0,windDrift:e.windDrift!=null?e.windDrift:0,turbulence:e.turbulence!=null?e.turbulence:0};const n=p.themes[a.currentTheme]||p.themes.ember;a.heatCold=n.cold,a.heatWarm=n.warm,a.heatHot=n.hot,I.uHeatCold.value.set(...a.heatCold),I.uHeatWarm.value.set(...a.heatWarm),I.uHeatHot.value.set(...a.heatHot),I.uTornadoFadeStart.value=a.pattern.funnelFadeStart,I.uTornadoFadeEnd.value=a.pattern.funnelFadeEnd,I.uTrailStrength.value=a.trailStrength}function rt(){cn(p.presets.DEFAULT)}function an(){if(r.explosionStartTime>=0||a.activePreset)return;const e=Object.keys(p.presets).filter(o=>o!=="DEFAULT"),n=e[Math.floor(Math.random()*e.length)];cn(p.presets[n]),a.lastRandomPreset=n}function Bt(e,n=!0){const o=p.themes[e]||p.themes.ember;a.currentTheme=e,I.uColorHot.value.set(...o.hot),I.uColorWarm.value.set(...o.warm),I.uColorCold.value.set(...o.cold),I.uHeatHot.value.set(...o.hot),I.uHeatWarm.value.set(...o.warm),I.uHeatCold.value.set(...o.cold),document.querySelectorAll(".theme-swatch").forEach(i=>{const l=i.getAttribute("data-theme")===e;i.classList.toggle("active",l),i.setAttribute("aria-pressed",l?"true":"false")}),St(a.currentText,a.currentTheme,a.currentFont,n),Dt(`Theme changed to ${e}`)}async function Wn(e,n=!0,o=!1){a.currentFont=e,document.querySelectorAll("#font-select, #drawer-font-select").forEach(i=>{i.value=e}),a.messageMode!=="text"&&(a.messageMode="text",at("text")),a.activeEmoji&&(a.activeEmoji=null,Ve(null)),await Un(e),await qe(a.currentText,o),St(a.currentText,a.currentTheme,a.currentFont,n),Dt(`Font changed to ${e}`)}async function Zn(e,n=!0){const o=e.trim(),i=o.length>0?o:"Bring your message!";a.currentText=i,a.messageMode==="text"&&(a.lastText=i),await qe(i,!1),St(a.currentText,a.currentTheme,a.currentFont,n),Dt(`Text updated to "${a.currentText}"`)}function un(e){const n=document.querySelectorAll(".char-counter");if(!n.length)return;const o=[...e].length;n.forEach(i=>{i.textContent=`${o}/25`,i.classList.remove("warning","danger"),o>=25?i.classList.add("danger"):o>=20&&i.classList.add("warning")})}async function sn(e,n=!1){cn(p.presets[e]||p.presets.DEFAULT),n&&await qe(a.currentText,!0)}const Po="#drawer, #menu-toggle-btn, #drawer-backdrop, #dock, #topbar, #input-bar, #hint, #toast",bt=e=>!!e.target.closest(Po);function Eo(e){if(bt(e)||(e.pointerType==="mouse"&&(W.isDragging=!0,W.prevMouseX=e.clientX,W.prevMouseY=e.clientY),e.pointerType==="touch"&&!e.isPrimary))return;const n=performance.now();W.clickCount=n-W.lastClickTime<p.tapWindowMs?W.clickCount+1:1,W.lastClickTime=n,W.clickCount>=p.tapCount&&(an(),lt(),W.clickCount=0)}function Ro(e){if(!bt(e)){if(e.touches.length===1)ln(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const n=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY;W.lastPinchDist=Math.sqrt(n*n+o*o),W.lastMidpoint.set((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2)}}}function Co(e){if(!bt(e)){if(e.preventDefault(),e.touches.length===1)ln(e.touches[0].clientX,e.touches[0].clientY);else if(e.touches.length===2){const n=e.touches[0].clientX-e.touches[1].clientX,o=e.touches[0].clientY-e.touches[1].clientY,i=Math.sqrt(n*n+o*o);W.lastPinchDist&&(s.targetZ-=(i-W.lastPinchDist)*.15,s.autoFit=!1),W.lastPinchDist=i;const l=(e.touches[0].clientX+e.touches[1].clientX)/2,t=(e.touches[0].clientY+e.touches[1].clientY)/2;s.particles&&(s.particles.rotation.y+=(l-W.lastMidpoint.x)*.005,s.particles.rotation.x+=(t-W.lastMidpoint.y)*.005),W.lastMidpoint.set(l,t)}}}function Pn(e){e.pointerType==="mouse"&&(W.isDragging=!1)}function Fo(){W.lastPinchDist=null,W.lastGestureEndTime=performance.now()}function At(){const e=document.getElementById("stage"),n=Math.max(e.clientWidth,1),o=Math.max(e.clientHeight,1);s.camera.aspect=n/o;const i=s.camera.position.z*Math.tan(p.cameraAngleDeg*Math.PI/360),l=i*s.camera.aspect;s.camera.left=-l,s.camera.right=l,s.camera.top=i,s.camera.bottom=-i,s.camera.updateProjectionMatrix(),s.renderer.setSize(n,o,!1);const t=Math.min(window.devicePixelRatio,p.maxPixelRatio);s.renderer.setPixelRatio(t),I.uPixelRatio.value=t,s.autoFit&&(s.targetZ=qo(n,o))}function Lo(){const e=document.getElementById("topbar");return e?e.getBoundingClientRect().height:0}function zo(){const e=document.getElementById("dock");if(e){if(e.classList.contains("collapsed")){const i=e.firstElementChild;return(i?i.getBoundingClientRect().height:0)+24}const o=e.getBoundingClientRect();if(o.height>0)return o.height}const n=document.getElementById("input-bar");if(n){const o=n.getBoundingClientRect();if(o.height>0)return o.height}return 0}function ko(){const e=r.posHome;if(!e||e.length===0)return{w:80,h:80};let n=1/0,o=-1/0,i=1/0,l=-1/0;for(let d=0;d<e.length;d+=3){const b=e[d],H=e[d+1];b<n&&(n=b),b>o&&(o=b),H<i&&(i=H),H>l&&(l=H)}const t=o-n,f=l-i;return!isFinite(t)||!isFinite(f)||t<1e-6||f<1e-6?{w:80,h:80}:{w:t,h:f}}function qo(e,n){const o=Math.tan(p.cameraAngleDeg*Math.PI/360),i=rn,l=p.fitMargin,t=Math.max(e-2*l,1),f=Math.max(n-(Lo()+l)-(zo()+l),1),d=i.w*n/(2*o*t),b=i.h*n/(2*o*f);return Math.min(p.zoomMax,Math.max(d,b,p.zoomMin))}const Vo="Type a message — your words become thousands of glowing particles.",Io="Pick an emoji — it bursts into thousands of glowing, colorful particles.",Bo="Upload an image — its pixels become thousands of glowing particles.";function Ht(e){return e==="emoji"?Io:e==="image"?Bo:Vo}function Gt(e){const n=document.getElementById("context-line");n&&(n.textContent=e);const o=document.getElementById("mobile-context-line");o&&(o.textContent=e)}function Ut(e){a.activePreset=e,document.querySelectorAll(".preset-chip").forEach(i=>{i.getAttribute("data-text")===e?i.classList.add("active"):i.classList.remove("active")});const o=p.presets[e];Gt(o&&o.description?o.description:Ht(a.messageMode))}function Oe(){a.activePreset=null,document.querySelectorAll(".preset-chip").forEach(n=>{n.classList.remove("active")}),Gt(Ht(a.messageMode))}function Ve(e){document.querySelectorAll(".emoji-chip").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-emoji")===e)})}function at(e){const n=e==="emoji"||e==="image"?e:"text";a.messageMode=n,document.querySelectorAll(".message-option").forEach(i=>{const l=i.getAttribute("data-message-mode")===n;i.classList.toggle("active",l),i.setAttribute("aria-selected",l?"true":"false")}),document.querySelectorAll(".text-message-mode").forEach(i=>{i.hidden=n!=="text"}),document.querySelectorAll(".emoji-message-mode").forEach(i=>{i.hidden=n!=="emoji"}),document.querySelectorAll(".image-message-mode").forEach(i=>{i.hidden=n!=="image"});const o=document.getElementById("input-bar");o&&(o.style.display=n==="text"?"":"none")}function En(){s.particles&&(s.scene.remove(s.particles),s.particles=null),s.trailPoints&&(s.trailPoints.visible=!1),s.emberPoints&&(s.emberPoints.visible=!1),r.posHome=new Float32Array(0),r.posLive=new Float32Array(0),r.explosionOrigin=new Float32Array(0),r.springDisp=new Float32Array(0),r.springVel=new Float32Array(0),r.randomDir=new Float32Array(0),r.randomSpeed=new Float32Array(0),r.funnelT=new Float32Array(0),r.funnelRadialX=new Float32Array(0),r.funnelRadialZ=new Float32Array(0),r.slots=[],r.sendQueue=[],r.sourceGeneration++,r.motionToken++,rn={w:80,h:80}}async function Uo(e){if(at(e),Oe(),rt(),a.messageMode==="emoji"){a.activeImage=null;const n=a.lastEmoji&&p.emojiOptions.includes(a.lastEmoji)?a.lastEmoji:null;n?(a.activeEmoji=n,Ve(n),Wt(n),await qe(n,!1),St(n,a.currentTheme,a.currentFont,!0)):(a.activeEmoji=null,Ve(null),En())}else if(a.messageMode==="image"){a.activeEmoji=null,Ve(null);const n=document.querySelectorAll(".image-name");a.lastImage?(a.activeImage=a.lastImage,n.forEach(o=>{o.textContent=a.lastImageName}),await qe(a.currentText,!1)):(a.activeImage=null,n.forEach(o=>{o.textContent="No file chosen"}),En())}else{a.activeEmoji=null,a.activeImage=null,Ve(null);const n=a.lastText&&a.lastText.trim()||"Bring your message!";a.currentText=n,Wt(n),await qe(n,!1),St(a.currentText,a.currentTheme,a.currentFont,!0)}}function Xo(e){if(!e)return;if(!e.type.startsWith("image/")){_e("Please choose an image file!","error");return}const n=URL.createObjectURL(e),o=new Image;o.onload=async()=>{URL.revokeObjectURL(n),at("image"),a.activeImage=o,a.lastImage=o,a.lastImageName=e.name,a.imageName=e.name,a.activeEmoji=null,Ve(null),Oe(),rt(),document.querySelectorAll(".image-name").forEach(i=>{i.textContent=e.name}),await qe(a.currentText,!1),Dt(`Image uploaded: ${e.name}`)},o.onerror=()=>{URL.revokeObjectURL(n),_e("Could not read that image!","error")},o.src=n}const Wo=1e3;function Rn(){clearTimeout(W.drawerCloseTimer),W.drawerCloseTimer=setTimeout(ct,Wo)}function Hn(){clearTimeout(W.drawerCloseTimer)}function Gn(){const e=document.getElementById("drawer"),n=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");Hn(),e&&e.classList.add("open"),n&&n.classList.add("active"),o&&o.setAttribute("aria-expanded","true")}function ct(){const e=document.getElementById("drawer"),n=document.getElementById("drawer-backdrop"),o=document.getElementById("menu-toggle-btn");Hn(),e&&e.classList.remove("open"),n&&n.classList.remove("active"),o&&o.setAttribute("aria-expanded","false")}function Zo(){const e=document.getElementById("drawer");e&&e.classList.contains("open")?ct():Gn()}function jn(){const e=document.getElementById("dock");if(!e||e.classList.contains("collapsed"))return!1;e.classList.add("collapsed");const n=document.getElementById("dock-toggle-btn");return n&&(n.setAttribute("aria-expanded","false"),n.title="Expand controls"),!0}function Yn(){const e=document.getElementById("dock");if(!e)return;e.classList.remove("collapsed");const n=document.getElementById("dock-toggle-btn");n&&(n.setAttribute("aria-expanded","true"),n.title="Collapse controls")}function dn(){s.autoFit&&(At(),setTimeout(()=>{s.autoFit&&At()},460))}function Ho(){const e=document.getElementById("dock");W.menuRestoreDesktop=!!(e&&!e.classList.contains("collapsed")),jn();const n=document.getElementById("drawer");W.menuRestoreMobile=!!(n&&n.classList.contains("open")),ct(),dn()}function Go(){W.menuRestoreMobile&&(W.menuRestoreMobile=!1,Gn()),W.menuRestoreDesktop&&(W.menuRestoreDesktop=!1,Yn()),dn()}function Wt(e){document.querySelectorAll("#text-input, #mobile-text-input").forEach(n=>{n.value=e}),un(e)}function Cn(e){at("text"),Oe(),a.activeEmoji=null,a.activeImage=null,Ve(null),rt(),un(e),clearTimeout(W.inputDebounceTimer),W.inputDebounceTimer=setTimeout(async()=>{await Zn(e)},p.inputDebounceMs)}function jo(){s.renderer.render(s.scene,s.camera),s.renderer.domElement.toBlob(e=>{if(!e)return;const n=URL.createObjectURL(e),o=document.createElement("a"),i=(a.messageMode==="image"&&a.imageName?a.imageName:a.currentText).replace(/[^a-z0-9]/gi,"_").toLowerCase();o.download=`artz-sculpture-${i||"kinetic"}.png`,o.href=n,o.click(),setTimeout(()=>URL.revokeObjectURL(n),1e3)},"image/png")}async function Yo(){try{const e=new URLSearchParams;a.activeEmoji?e.set("t",a.activeEmoji):a.messageMode==="text"&&a.currentText&&e.set("t",a.currentText),a.currentTheme&&a.currentTheme!=="ember"&&e.set("theme",a.currentTheme),a.currentFont&&a.currentFont!=="Outfit"&&e.set("font",a.currentFont),a.activePreset&&e.set("preset",a.activePreset);const n=e.toString(),o=`${window.location.origin}${window.location.pathname}${n?"?"+n:""}`;if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(o);else{const i=document.createElement("input");i.value=o,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i)}_e("Link copied to clipboard!","success")}catch{_e("Could not copy link","error")}}function Oo(){a.audioEnabled=!a.audioEnabled,document.querySelectorAll(".audio-btn").forEach(e=>{e.setAttribute("aria-pressed",a.audioEnabled.toString()),e.title=a.audioEnabled?"Toggle Sound (Mute/Unmute)":"Sound: MUTED (Click to unmute)"}),document.querySelectorAll(".audio-icon").forEach(e=>{e.textContent=(a.audioEnabled,"??")}),_e(a.audioEnabled?"?? Sound effects enabled":"?? Sound effects muted")}function Zt(){const e=document.getElementById("hint");e&&e.classList.add("dismissed");try{localStorage.setItem("artz-hint-seen","1")}catch{}}function _o(){const e=document.getElementById("text-input"),n=document.getElementById("mobile-text-input"),o=document.getElementById("menu-toggle-btn"),i=document.getElementById("menu-close-btn"),l=document.getElementById("drawer-backdrop"),t=document.getElementById("drawer"),f=document.getElementById("dock-toggle-btn"),d=document.getElementById("hint-dismiss"),b=document.getElementById("wordmark");if(b){const c=[{cls:"is-rippling",ms:1400},{cls:"is-playing",ms:1800},{cls:"is-dropping",ms:1600},{cls:"is-imploding",ms:1700}],V=700,m=()=>c.map(C=>C.cls),A=C=>{b.setAttribute("aria-label",C?"KINETICS — click to play title animation":"KINETICS — click to stop the title animation"),b.title=C?"Click to play":"Click to stop"};let T=!1,q=0;const L=()=>{const C=c[q];q=(q+1)%c.length,b.classList.remove(...m()),b.offsetWidth,b.classList.add(C.cls),W.wordmarkTimer=setTimeout(L,C.ms+V)};b.addEventListener("click",()=>{ut||(T=!T,clearTimeout(W.wordmarkTimer),T?(q=0,A(!1),L()):(A(!0),b.classList.remove(...m())))})}o&&o.addEventListener("click",()=>{Zo()}),i&&i.addEventListener("click",()=>{ct()}),l&&l.addEventListener("click",()=>{ct()}),t&&(t.addEventListener("click",c=>{c.target.closest(".message-option")||c.target.closest("select")||Rn()}),t.querySelectorAll("select").forEach(c=>{c.addEventListener("change",Rn)})),f&&f.addEventListener("click",()=>{const c=document.getElementById("dock");c&&(c.classList.contains("collapsed")?Yn():jn(),dn())}),d&&d.addEventListener("click",Zt);try{localStorage.getItem("artz-hint-seen")==="1"&&Zt()}catch{}nn=document.getElementById("status-fps");const H=document.getElementById("status-gpu");H&&(H.textContent=a.gpuPhysics?"GPU":xe?"WORKER":"CPU"),Gt(Ht(a.messageMode)),e&&(e.value=a.currentText,un(a.currentText),e.addEventListener("input",()=>{n&&n.value!==e.value&&(n.value=e.value),Cn(e.value)})),n&&(n.value=a.currentText,n.addEventListener("input",()=>{e&&e.value!==n.value&&(e.value=n.value),Cn(n.value)})),document.querySelectorAll(".message-option").forEach(c=>{c.addEventListener("click",()=>{Uo(c.getAttribute("data-message-mode"))})}),document.querySelectorAll(".image-input").forEach(c=>{c.addEventListener("change",()=>{Xo(c.files&&c.files[0]),c.value=""})}),document.querySelectorAll(".theme-swatch").forEach(c=>{c.addEventListener("click",()=>{Oe(),rt(),Bt(c.getAttribute("data-theme"))})}),document.querySelectorAll("#font-select, #drawer-font-select").forEach(c=>{c.value=a.currentFont,c.addEventListener("change",async()=>{Oe(),rt(),await Wn(c.value)})}),document.querySelectorAll(".capture-btn").forEach(c=>{c.addEventListener("click",jo)}),document.querySelectorAll(".share-btn").forEach(c=>{c.addEventListener("click",Yo)}),document.querySelectorAll(".audio-btn").forEach(c=>{c.addEventListener("click",Oo)}),document.querySelectorAll(".preset-chip").forEach(c=>{c.addEventListener("click",async()=>{if(r.explosionStartTime>=0)return;const V=c.getAttribute("data-text");await sn(V),Ut(V),lt()})}),document.querySelectorAll(".emoji-chip").forEach(c=>{c.addEventListener("click",async()=>{const V=c.getAttribute("data-emoji");V&&(at("emoji"),Oe(),rt(),a.activeEmoji=V,a.lastEmoji=V,Ve(V),Wt(V),await Zn(V))})})}function Fn(){if(xe){try{xe.terminate()}catch{}xe=null;for(const e of r.slots)e.inFlight=!1;r.sendQueue.length=0}}const Mt=[1,1.25,1.5,2];let No={level:Mt.length-1,slowStreak:0,fastStreak:0};function Ln(e){const n=Math.min(window.devicePixelRatio,Mt[e]);s.renderer.setPixelRatio(n),I.uPixelRatio.value=n}function Ko(e){const n=No;if(e>28)n.slowStreak++,n.fastStreak=0,n.slowStreak>=30&&(n.slowStreak=0,n.level>0&&(n.level--,Ln(n.level)));else if(e<16){n.fastStreak++,n.slowStreak=0;const o=Mt.length-1;n.fastStreak>=120&&n.level<o&&Math.min(window.devicePixelRatio,Mt[n.level+1])>Math.min(window.devicePixelRatio,Mt[n.level])&&(n.fastStreak=0,n.level++,Ln(n.level))}else n.slowStreak=0,n.fastStreak=0}function On(){const e=performance.now();requestAnimationFrame(On),Nt++,performance.now()-Kt>=500&&(nn&&(nn.textContent=`${Math.round(Nt*1e3/(performance.now()-Kt))} FPS`),Nt=0,Kt=performance.now());const n=s.clock.getElapsedTime(),o=Math.min(n-s.prevTime,.05);s.prevTime=n,vo();const{keys:i,invMatrix:l,lastGestureEndTime:t}=W,{particles:f,camera:d}=s;if(f){i.ArrowUp&&(f.rotation.x-=p.rotationStep,W.lastGestureEndTime=performance.now()),i.ArrowDown&&(f.rotation.x+=p.rotationStep,W.lastGestureEndTime=performance.now()),i.ArrowLeft&&(f.rotation.y-=p.rotationStep,W.lastGestureEndTime=performance.now()),i.ArrowRight&&(f.rotation.y+=p.rotationStep,W.lastGestureEndTime=performance.now());const B=i.ArrowUp||i.ArrowDown||i.ArrowLeft||i.ArrowRight,X=performance.now()-t<p.autoReturnGracePeriodMs;if(!B&&!W.lastPinchDist&&!X&&!W.isDragging){const Y=p.rotationAutoReturnLerp;f.rotation.x=Ft.lerp(f.rotation.x,0,Y),f.rotation.y=Ft.lerp(f.rotation.y,0,Y)}}(i["+"]||i["="])&&(s.targetZ-=p.zoomSpeed,s.autoFit=!1),i["-"]&&(s.targetZ+=p.zoomSpeed,s.autoFit=!1),s.targetZ=Ft.clamp(s.targetZ,p.zoomMin,p.zoomMax),d.position.z=Ft.lerp(d.position.z,s.targetZ,p.zoomLerp),Math.abs(d.position.z-s.targetZ)<.005&&(d.position.z=s.targetZ);const b=d.position.z*Math.tan(p.cameraAngleDeg*Math.PI/360),H=b*d.aspect;if(d.left=-H,d.right=H,d.top=b,d.bottom=-b,d.updateProjectionMatrix(),I.uPointScale.value=p.pointSizeAttenuationScale/d.position.z,!f){s.renderer.render(s.scene,d);return}if(W.pendingPointer){const B=W.pendingPointer;if(ln(B.clientX,B.clientY),W.isDragging&&B.pointerType==="mouse"){const X=B.clientX-W.prevMouseX,Y=B.clientY-W.prevMouseY;s.particles&&(s.particles.rotation.y+=X*.005,s.particles.rotation.x+=Y*.005),W.prevMouseX=B.clientX,W.prevMouseY=B.clientY,W.lastGestureEndTime=performance.now()}W.pendingPointer=null}l.copy(f.matrixWorld).invert(),W.mouseLocal.copy(W.mouseWorld).applyMatrix4(l);const S=r.explosionStartTime>=0;S?I.uMouse.value.set(-1e3,-1e3,0):I.uMouse.value.copy(W.mouseLocal);const h=f.geometry.attributes.position,c=h.array,V=h.count,{posHome:m,explosionOrigin:A,springDisp:T,springVel:q,randomDir:L,randomSpeed:C,funnelT:y,funnelRadialX:w,funnelRadialZ:M}=r,z=p.mouseInfluence,Z=z*z,k=p.repulsionStrength,D=W.mouseLocal;let R,g;Math.abs(o-s.prevDt)<1e-4?(R=s.prevKFrame,g=s.prevDampFrame):(R=p.springK*(o*60),g=Math.pow(p.springDamping,o*60),s.prevDt=o,s.prevKFrame=R,s.prevDampFrame=g);let x=-1,P=0;const E=r.activeStyle>=0?r.activeStyle:a.motionStyle,v=a.activeExpansionDuration||a.expansionDuration,F=a.activeContractionDuration||a.contractionDuration,G=a.activeMaxDist||a.explosionMaxDistMultiplier;if(r.explosionStartTime>=0)if(x=n-r.explosionStartTime,x>a.totalExplosionDuration)r.explosionStartTime=-1,r.motionToken++,T.fill(0),q.fill(0),a.afterglowStartTime=n,x=-1,c&&m&&(c.set(m),h.needsUpdate=!0),s.trailPoints&&!ut&&(s.trailPoints.visible=!0),Oe(),Xn(!1),Go();else{(E===0||E===-1)&&x>=v+3&&!a.travelApplied&&(a.activeContractionDuration=a.contractionDuration||2,a.travelApplied=!0,a.audioEnabled&&xo(a.activeContractionDuration)),x>=v&&!a.embersSpawned&&(a.embersSpawned=!0,bo());const B=a.activeContractionDuration||a.contractionDuration;x<v?P=x/v:P=1-(x-v)/B}let j;if(r.explosionStartTime>=0?j=1:a.afterglowStartTime!=null?(j=Math.max(0,1-(n-a.afterglowStartTime)/p.afterglowDuration),j<=0&&(a.afterglowStartTime=null)):j=0,I.uExplosionActive.value=j,I.uTornadoActive.value=r.explosionStartTime>=0&&r.activeStyle===1?1:0,s.particles&&(s.particles.frustumCulled=P===0),s.particles&&!W.isDragging&&r.explosionStartTime>=0&&E===3&&x>=0&&x<=7.5){const B=x/7.5,X=Math.pow(Math.sin(Math.PI*B),1.2),Y=.26*X,J=-.36*X;s.particles.rotation.x=Y,s.particles.rotation.y=J,s.trailPoints&&(s.trailPoints.rotation.x=Y,s.trailPoints.rotation.y=J)}if(a.gpuPhysics&&S){s.trailPoints&&(s.trailPoints.visible=!1),I.uGpuPhysics.value=1,I.uMotionStyle.value=E>=0?E:0,I.uExplosionElapsed.value=r.explosionStartTime>=0?x:-1,I.uExpDuration.value=v,I.uDriftDuration.value=E===0||E===-1?3:0,I.uContractionDuration.value=F,I.uMaxDist.value=G,I.uSpinSpeed.value=a.pattern&&a.pattern.spinSpeed||5.2,I.uFunnelBottom.value=a.pattern&&a.pattern.funnelBottom||-22,I.uFunnelHeight.value=a.pattern&&a.pattern.funnelHeight||46,I.uFunnelCrownRadius.value=a.pattern&&a.pattern.funnelCrownRadius||22,I.uFunnelWaistRadius.value=a.pattern&&a.pattern.funnelWaistRadius||3.5,I.uFunnelTailRadius.value=a.pattern&&a.pattern.funnelTailRadius||.8,I.uFunnelWaistT.value=a.pattern&&a.pattern.funnelWaistT||.42,I.uFunnelCrownExp.value=a.pattern&&a.pattern.funnelCrownExp||1.4,I.uBreezeBlowDir.value=Me&&Me.blowDir||1,I.uBreezeIntensity.value=Me&&Me.intensity||1,I.uBreezeSwirl.value=Me&&Me.swirl!=null?Me.swirl:0,I.uMSweepX.value=a.pattern&&a.pattern.mSweepX!=null?a.pattern.mSweepX:24,I.uMSweepY.value=a.pattern&&a.pattern.mSweepY!=null?a.pattern.mSweepY:4,I.uMSweepZ.value=a.pattern&&a.pattern.mSweepZ!=null?a.pattern.mSweepZ:12,I.uMFreqX.value=a.pattern&&a.pattern.mFreqX!=null?a.pattern.mFreqX:3.456,I.uMFreqY.value=a.pattern&&a.pattern.mFreqY!=null?a.pattern.mFreqY:5.341,I.uMFreqZ.value=a.pattern&&a.pattern.mFreqZ!=null?a.pattern.mFreqZ:2.827,I.uMPhX.value=a.pattern&&a.pattern.mPhX!=null?a.pattern.mPhX:.4,I.uMPhY.value=a.pattern&&a.pattern.mPhY!=null?a.pattern.mPhY:0,I.uMPhZ.value=a.pattern&&a.pattern.mPhZ!=null?a.pattern.mPhZ:1.2,I.uMLaunchDir.value=a.pattern&&a.pattern.mLaunchDir!=null?a.pattern.mLaunchDir:1;{const B=s.camera,X=B.top-B.bottom,Y=B.right-B.left,J=Math.max(1,Math.min(Y,X))*.205;I.uKnotScale.value=J,a.pattern.knotScale=J}I.uMouseWorld.value.set(-1e3,-1e3,0),I.uMousePushDistance.value=0,I.uMouseInfluence.value=0,I.uMouseActive.value=0}else if(I.uGpuPhysics.value=0,xe){let B=null;for(const X of r.slots)if(!X.inFlight){B=X;break}B&&(B.needsReset&&(B.posLive.set(r.explosionOrigin),B.springDisp.fill(0),B.springVel.fill(0),B.needsReset=!1),B.inFlight=!0,B.seq=r.seq++,r.sendQueue.push(B),xe.postMessage({type:"update",data:{posLive:B.posLive,springDisp:B.springDisp,springVel:B.springVel,count:V,dt:o,elapsed:x,mouseLocal:S?{x:99999,y:99999,z:99999}:{x:D.x,y:D.y,z:D.z},kFrame:R,dampFrame:g,expansionDuration:v,driftDuration:E===0||E===3||E===-1?3:0,contractionDuration:F,explosionMaxDistMultiplier:G,mouseInfluence:S?0:z,repulsionStr:S?0:k,breeze:Me,sourceGeneration:r.sourceGeneration,motionToken:r.motionToken},seq:B.seq},[B.posLive.buffer,B.springDisp.buffer,B.springVel.buffer]))}else{const B=a.pattern,X={x:0,y:0,z:0},Y=E===1&&B.funnelHeight&&y&&w&&M,J=A||m,se=E===0||E===3||E===-1?3:0;for(let O=0;O<V;O++){const K=O*3,u=K+1,U=K+2;let _,$,te;if(x>=0)if(E===1&&Y)zn(O,m[K],m[u],m[U],y[O],w[O],M[O],(C?C[O]:1)*.35+.85,x,B,X),_=X.x,$=X.y,te=X.z;else if(E===2)kn(O,m[K],m[u],m[U],(C?C[O]:1)*.35+.85,x,Me,X),_=X.x,$=X.y,te=X.z;else if(E===3)Vn(O,m[K],m[u],m[U],(C?C[O]:1)*.35+.85,x,B,X),_=X.x,$=X.y,te=X.z;else if(E===4)In(O,m[K],m[u],m[U],(C?C[O]:1)*.35+.85,x,B,X),_=X.x,$=X.y,te=X.z;else if(E===5)Bn(O,m[K],m[u],m[U],(C?C[O]:1)*.35+.85,x,B,X),_=X.x,$=X.y,te=X.z;else{const ce=C[O]*G;qn(J[K],J[u],J[U],L[K],L[u],L[U],ce,v,se,F,x,X),_=X.x,$=X.y,te=X.z}else _=m[K],$=m[u],te=m[U];const ee=c[K],ie=c[u],Q=c[U],N=ee-D.x,ae=ie-D.y,re=Q-D.z,ne=N*N+ae*ae+re*re;let fe=0,pe=0,we=0;if(!S&&ne<Z&&ne>1e-5){const ce=Math.sqrt(ne),le=1/ce,me=(z-ce)/z,ue=k*me;fe=N*le*ue,pe=ae*le*ue,we=re*le*ue}if(q[K]=(q[K]+(fe-T[K])*R)*g,q[u]=(q[u]+(pe-T[u])*R)*g,q[U]=(q[U]+(we-T[U])*R)*g,T[K]+=q[K],T[u]+=q[u],T[U]+=q[U],c[K]=_+T[K],c[u]=$+T[u],c[U]=te+T[U],x>=0){const ce=c[K]-J[K],le=c[u]-J[u],me=c[U]-J[U],ue=ce*ce+le*le+me*me;ue>It&&(It=ue)}}a.actualTravelRadius=Math.sqrt(It),h.needsUpdate=!0,r.positionsDirty=!0}So(),Ao(o),s.renderer.render(s.scene,d),Ko(performance.now()-e)}async function Qo(){s.scene=new Qn,s.camera=new $n(-1,1,1,-1,-600,600),s.camera.position.z=s.targetZ,s.renderer=new Jn({antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1}),s.renderer.setClearColor(p.clearColor,1);const e=s.renderer.domElement;if(e.setAttribute("role","img"),e.setAttribute("aria-label","Kinetic particle sculpture — interactive particle animation"),e.addEventListener("webglcontextlost",h=>{h.preventDefault(),_e("WebGL context lost — attempting restoration...")},!1),e.addEventListener("webglcontextrestored",async()=>{_e("WebGL context restored"),await qe(a.currentText,!1)},!1),document.getElementById("stage").appendChild(e),At(),!(new URLSearchParams(window.location.search).get("noworker")==="1"))try{xe=new Worker(new URL("/ParticlesSimulations/assets/physics.worker-DaC7BqsE.js",import.meta.url),{type:"module"}),xe.onmessage=function(h){const{type:c,seq:V,posLive:m,springDisp:A,springVel:T,travelRadius:q,sourceGeneration:L,motionToken:C}=h.data;if(c==="randomized"){if(h.data.sourceGeneration!==r.sourceGeneration||h.data.motionToken!==r.motionToken)return;r.randomized={dirs:h.data.dirs,style:h.data.style},r.activeStyle=h.data.style;return}if(c==="update"){let y=-1;for(let z=0;z<r.sendQueue.length;z++)if(r.sendQueue[z].seq===V){y=z;break}if(y===-1)return;const w=r.sendQueue.splice(y,1)[0];if(w.inFlight=!1,w.posLive=m,w.springDisp=A,w.springVel=T,L!==r.sourceGeneration||C!==r.motionToken)return;typeof q=="number"&&q>0&&(a.actualTravelRadius=q);const M=s.particles&&s.particles.geometry.attributes.position;M&&M.array.length===m.length&&(M.array.set(m),M.needsUpdate=!0,r.positionsDirty=!0)}},xe.onerror=()=>{console.error("Physics worker error — switching to CPU fallback."),Fn()},xe.onmessageerror=()=>{console.error("Physics worker message error — switching to CPU fallback."),Fn()}}catch(h){console.error("Failed to initialize physics Web Worker:",h)}await document.fonts.ready.catch(()=>{});const o=window.location.search||(window.location.hash.includes("?")?window.location.hash.substring(window.location.hash.indexOf("?")):""),i=new URLSearchParams(o),l=i.get("text")||i.get("t")||i.get("emoji")||"Bring your message!",t=i.get("theme")||"ember",f=i.get("font")||"Outfit",d=i.get("preset");i.get("gpu")==="0"&&(a.gpuPhysics=!1),a.currentText=l,a.currentTheme=t,a.currentFont=f,p.emojiOptions.includes(l)?(a.activeEmoji=l,a.lastEmoji=l,a.messageMode="emoji",a.lastText="Bring your message!"):(a.messageMode="text",a.lastText=l);const H=l.toUpperCase(),S=d?d.toUpperCase():p.presets[H]&&H!=="DEFAULT"?H:null;S&&p.presets[S]?(Bt(t,!1),await qe(a.currentText,!1),await sn(S,!1),Ut(S)):p.presets[H]&&H!=="DEFAULT"?(await sn(H,!1),Ut(H)):(Bt(t,!1),await qe(a.currentText,!1)),_o(),at(a.messageMode),window.addEventListener("pointermove",h=>{W.pendingPointer={clientX:h.clientX,clientY:h.clientY,pointerType:h.pointerType}}),window.addEventListener("pointerdown",Eo),window.addEventListener("pointerdown",h=>{bt(h)||Zt()}),window.addEventListener("keydown",h=>{(h.key===" "||h.key.startsWith("Arrow")||h.key==="+"||h.key==="-"||h.key==="=")&&Zt()}),window.addEventListener("pointerup",Pn),window.addEventListener("pointercancel",Pn),window.addEventListener("pointerleave",()=>{W.mouseWorld.set(-1e3,-1e3,0),I.uMouse.value.set(-1e3,-1e3,0),W.isDragging=!1}),window.addEventListener("dblclick",h=>{bt(h)||r.explosionStartTime>=0||(an(),lt())}),window.addEventListener("touchstart",Ro,{passive:!1}),window.addEventListener("touchmove",Co,{passive:!1}),window.addEventListener("touchend",Fo),window.addEventListener("resize",At),window.addEventListener("keydown",h=>{if(h.key==="Escape"){const c=document.getElementById("drawer");if(c&&c.classList.contains("open")){ct();return}}W.keys[h.key]=!0,(h.code==="Space"||h.key.startsWith("Arrow"))&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="SELECT"&&(h.preventDefault(),h.code==="Space"&&r.explosionStartTime<0&&(an(),lt()))}),window.addEventListener("keyup",h=>W.keys[h.key]=!1),window.addEventListener("popstate",async()=>{const h=new URLSearchParams(window.location.search),c=h.get("t")||"Bring your message!",V=h.get("theme")||"ember",m=h.get("font")||"Outfit";a.currentText=c,a.currentTheme=V,a.currentFont=m;const A=p.emojiOptions.includes(c);a.activeEmoji=A?c:null,A?a.lastEmoji=c:a.lastText=c,at(A?"emoji":"text"),Wt(c),Bt(V,!1),A?(Ve(c),await qe(c,!1)):await Wn(m,!1);const T=c.toUpperCase();p.presets[T]&&T!=="DEFAULT"?Ut(T):Oe(),Ve(a.activeEmoji)}),On()}window.__artzDebug={_render:()=>s,triggerExplosion:lt,get particleCount(){return r.posLive?r.posLive.length/3:0},get usingWorker(){return!!xe},get usingGpu(){return a.gpuPhysics},get geometryCount(){return s.renderer?s.renderer.info.memory.geometries:-1},get textureCount(){return s.renderer?s.renderer.info.memory.textures:-1},get renderCalls(){return s.renderer?s.renderer.info.render.calls:-1},snapshot(e=96){var t;const n=r.posHome,o=r.explosionOrigin,i=Math.min(e*3,n?n.length:0);let l=(t=s.particles)==null?void 0:t.geometry.attributes.position.array;if(a.gpuPhysics&&r.explosionStartTime>=0&&n){const f=s.clock.getElapsedTime()-r.explosionStartTime,d=r.activeStyle>=0?r.activeStyle:a.motionStyle,b=a.activeExpansionDuration||a.expansionDuration,H=a.activeContractionDuration||a.contractionDuration,S=a.activeMaxDist||a.explosionMaxDistMultiplier,h=d===0||d===3||d===-1?3:0,c={x:0,y:0,z:0},V=new Float32Array(i);for(let m=0;m<i/3;m++){const A=m*3,T=A+1,q=A+2;if(d===1)zn(m,n[A],n[T],n[q],r.funnelT?r.funnelT[m]:0,r.funnelRadialX?r.funnelRadialX[m]:0,r.funnelRadialZ?r.funnelRadialZ[m]:0,(r.randomSpeed?r.randomSpeed[m]:1)*.35+.85,f,a.pattern,c);else if(d===2)kn(m,n[A],n[T],n[q],(r.randomSpeed?r.randomSpeed[m]:1)*.35+.85,f,Me,c);else if(d===3)Vn(m,n[A],n[T],n[q],(r.randomSpeed?r.randomSpeed[m]:1)*.35+.85,f,a.pattern,c);else if(d===4)In(m,n[A],n[T],n[q],(r.randomSpeed?r.randomSpeed[m]:1)*.35+.85,f,a.pattern,c);else if(d===5)Bn(m,n[A],n[T],n[q],(r.randomSpeed?r.randomSpeed[m]:1)*.35+.85,f,a.pattern,c);else{const L=(r.randomSpeed?r.randomSpeed[m]:1)*S,C=o||n;qn(C[A],C[T],C[q],r.randomDir?r.randomDir[A]:0,r.randomDir?r.randomDir[T]:0,r.randomDir?r.randomDir[q]:0,L,b,h,H,f,c)}V[A]=c.x,V[T]=c.y,V[q]=c.z}l=V}return{position:l?Array.from(l.slice(0,i)):[],home:n?Array.from(n.slice(0,i)):[],explosionOrigin:o?Array.from(o.slice(0,i)):[],funnelT:r.funnelT?Array.from(r.funnelT.slice(0,e)):[],activeStyle:r.activeStyle,funnelProfile:{height:a.pattern.funnelHeight||0,bottom:a.pattern.funnelBottom||0,tailRadius:Vt(.05,a.pattern),waistRadius:Vt(.5,a.pattern),crownRadius:Vt(.95,a.pattern),fadeStart:a.pattern.funnelFadeStart||0,fadeEnd:a.pattern.funnelFadeEnd||0},rotation:s.particles?[s.particles.rotation.x,s.particles.rotation.y,s.particles.rotation.z]:[0,0,0],sourceGeneration:r.sourceGeneration,motionToken:r.motionToken,explosionActive:r.explosionStartTime>=0,elapsed:r.explosionStartTime>=0?s.clock.getElapsedTime()-r.explosionStartTime:-1,expDuration:a.activeExpansionDuration||a.expansionDuration,conDuration:a.activeContractionDuration||a.contractionDuration,randomized:r.randomized?{style:r.randomized.style,dirs:Array.from(r.randomized.dirs)}:{style:-1,dirs:[]}}},triggerExplosion:lt};Qo();
