/*! For license information please see 6554.js.LICENSE.txt */
"use strict";(self.webpackChunkvanillajs_ethers=self.webpackChunkvanillajs_ethers||[]).push([[6554],{31:(t,e,i)=>{i.d(e,{J:()=>a});var n=i(6752);const a=t=>t??n.s6},310:(t,e,i)=>{i(9807)},2132:(t,e,i)=>{var n=i(2618),a=i(5707),o=i(6752),s=i(8504),r=i(6201);class c{constructor(t){this.G=t}disconnect(){this.G=void 0}reconnect(t){this.G=t}deref(){return this.G}}class l{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??=new Promise((t=>this.Z=t))}resume(){this.Z?.(),this.Y=this.Z=void 0}}var h=i(7804);const d=t=>!(0,s.sO)(t)&&"function"==typeof t.then,w=1073741823;class g extends r.Kq{constructor(){super(...arguments),this._$Cwt=w,this._$Cbt=[],this._$CK=new c(this),this._$CX=new l}render(...t){return t.find((t=>!d(t)))??o.c0}update(t,e){const i=this._$Cbt;let n=i.length;this._$Cbt=e;const a=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let t=0;t<e.length&&!(t>this._$Cwt);t++){const o=e[t];if(!d(o))return this._$Cwt=t,o;t<n&&o===i[t]||(this._$Cwt=w,n=0,Promise.resolve(o).then((async t=>{for(;s.get();)await s.get();const e=a.deref();if(void 0!==e){const i=e._$Cbt.indexOf(o);i>-1&&i<e._$Cwt&&(e._$Cwt=i,e.setValue(t))}})))}return o.c0}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const p=(0,h.u$)(g),f=new class{constructor(){this.cache=new Map}set(t,e){this.cache.set(t,e)}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}delete(t){this.cache.delete(t)}clear(){this.cache.clear()}};var u=i(6109),v=i(3494);const y=n.AH`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var b=function(t,e,i,n){var a,o=arguments.length,s=o<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,n);else for(var r=t.length-1;r>=0;r--)(a=t[r])&&(s=(o<3?a(s):o>3?a(e,i,s):a(e,i))||s);return o>3&&s&&Object.defineProperty(e,i,s),s};const m={add:async()=>(await i.e(1476).then(i.bind(i,1476))).addSvg,allWallets:async()=>(await i.e(3723).then(i.bind(i,3723))).allWalletsSvg,arrowBottomCircle:async()=>(await i.e(6717).then(i.bind(i,6717))).arrowBottomCircleSvg,appStore:async()=>(await i.e(9236).then(i.bind(i,9236))).appStoreSvg,apple:async()=>(await i.e(1979).then(i.bind(i,1979))).appleSvg,arrowBottom:async()=>(await i.e(5776).then(i.bind(i,5776))).arrowBottomSvg,arrowLeft:async()=>(await i.e(6426).then(i.bind(i,6426))).arrowLeftSvg,arrowRight:async()=>(await i.e(5133).then(i.bind(i,5133))).arrowRightSvg,arrowTop:async()=>(await i.e(6040).then(i.bind(i,6040))).arrowTopSvg,bank:async()=>(await i.e(261).then(i.bind(i,261))).bankSvg,browser:async()=>(await i.e(787).then(i.bind(i,787))).browserSvg,card:async()=>(await i.e(1029).then(i.bind(i,1029))).cardSvg,checkmark:async()=>(await i.e(9390).then(i.bind(i,9390))).checkmarkSvg,checkmarkBold:async()=>(await i.e(1824).then(i.bind(i,1824))).checkmarkBoldSvg,chevronBottom:async()=>(await i.e(5214).then(i.bind(i,5214))).chevronBottomSvg,chevronLeft:async()=>(await i.e(5664).then(i.bind(i,5664))).chevronLeftSvg,chevronRight:async()=>(await i.e(2387).then(i.bind(i,2387))).chevronRightSvg,chevronTop:async()=>(await i.e(9146).then(i.bind(i,9146))).chevronTopSvg,chromeStore:async()=>(await i.e(2565).then(i.bind(i,2565))).chromeStoreSvg,clock:async()=>(await i.e(1837).then(i.bind(i,1837))).clockSvg,close:async()=>(await i.e(5943).then(i.bind(i,5943))).closeSvg,compass:async()=>(await i.e(2011).then(i.bind(i,2011))).compassSvg,coinPlaceholder:async()=>(await i.e(6929).then(i.bind(i,6929))).coinPlaceholderSvg,copy:async()=>(await i.e(4554).then(i.bind(i,4554))).copySvg,cursor:async()=>(await i.e(2161).then(i.bind(i,2161))).cursorSvg,cursorTransparent:async()=>(await i.e(5518).then(i.bind(i,5518))).cursorTransparentSvg,desktop:async()=>(await i.e(6355).then(i.bind(i,6355))).desktopSvg,disconnect:async()=>(await i.e(4953).then(i.bind(i,4953))).disconnectSvg,discord:async()=>(await i.e(7243).then(i.bind(i,7243))).discordSvg,etherscan:async()=>(await i.e(70).then(i.bind(i,70))).etherscanSvg,extension:async()=>(await i.e(6618).then(i.bind(i,6618))).extensionSvg,externalLink:async()=>(await i.e(877).then(i.bind(i,877))).externalLinkSvg,facebook:async()=>(await i.e(279).then(i.bind(i,279))).facebookSvg,farcaster:async()=>(await i.e(5426).then(i.bind(i,5426))).farcasterSvg,filters:async()=>(await i.e(4052).then(i.bind(i,4052))).filtersSvg,github:async()=>(await i.e(1496).then(i.bind(i,1496))).githubSvg,google:async()=>(await i.e(9624).then(i.bind(i,9624))).googleSvg,helpCircle:async()=>(await i.e(6561).then(i.bind(i,6561))).helpCircleSvg,image:async()=>(await i.e(8842).then(i.bind(i,8842))).imageSvg,id:async()=>(await i.e(4778).then(i.bind(i,4778))).idSvg,infoCircle:async()=>(await i.e(4748).then(i.bind(i,4748))).infoCircleSvg,lightbulb:async()=>(await i.e(6828).then(i.bind(i,6828))).lightbulbSvg,mail:async()=>(await i.e(2688).then(i.bind(i,2688))).mailSvg,mobile:async()=>(await i.e(9385).then(i.bind(i,9385))).mobileSvg,more:async()=>(await i.e(4230).then(i.bind(i,4230))).moreSvg,networkPlaceholder:async()=>(await i.e(2901).then(i.bind(i,2901))).networkPlaceholderSvg,nftPlaceholder:async()=>(await i.e(5410).then(i.bind(i,5410))).nftPlaceholderSvg,off:async()=>(await i.e(2658).then(i.bind(i,2658))).offSvg,playStore:async()=>(await i.e(7469).then(i.bind(i,7469))).playStoreSvg,plus:async()=>(await i.e(1035).then(i.bind(i,1035))).plusSvg,qrCode:async()=>(await i.e(2016).then(i.bind(i,2016))).qrCodeIcon,recycleHorizontal:async()=>(await i.e(4987).then(i.bind(i,4987))).recycleHorizontalSvg,refresh:async()=>(await i.e(5452).then(i.bind(i,5452))).refreshSvg,search:async()=>(await i.e(8127).then(i.bind(i,8127))).searchSvg,send:async()=>(await i.e(4725).then(i.bind(i,4725))).sendSvg,swapHorizontal:async()=>(await i.e(6780).then(i.bind(i,6780))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await i.e(1975).then(i.bind(i,1975))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await i.e(3967).then(i.bind(i,3967))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await i.e(6188).then(i.bind(i,6188))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await i.e(1538).then(i.bind(i,1538))).swapVerticalSvg,telegram:async()=>(await i.e(2692).then(i.bind(i,2692))).telegramSvg,threeDots:async()=>(await i.e(5420).then(i.bind(i,5420))).threeDotsSvg,twitch:async()=>(await i.e(4736).then(i.bind(i,4736))).twitchSvg,twitter:async()=>(await i.e(2931).then(i.bind(i,2931))).xSvg,twitterIcon:async()=>(await i.e(4477).then(i.bind(i,4477))).twitterIconSvg,verify:async()=>(await i.e(2026).then(i.bind(i,2026))).verifySvg,verifyFilled:async()=>(await i.e(4067).then(i.bind(i,4067))).verifyFilledSvg,wallet:async()=>(await i.e(6530).then(i.bind(i,6530))).walletSvg,walletConnect:async()=>(await i.e(5806).then(i.bind(i,5806))).walletConnectSvg,walletConnectLightBrown:async()=>(await i.e(5806).then(i.bind(i,5806))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await i.e(5806).then(i.bind(i,5806))).walletConnectBrownSvg,walletPlaceholder:async()=>(await i.e(4714).then(i.bind(i,4714))).walletPlaceholderSvg,warningCircle:async()=>(await i.e(6348).then(i.bind(i,6348))).warningCircleSvg,x:async()=>(await i.e(2931).then(i.bind(i,2931))).xSvg,info:async()=>(await i.e(5823).then(i.bind(i,5823))).infoSvg,exclamationTriangle:async()=>(await i.e(5179).then(i.bind(i,5179))).exclamationTriangleSvg,reown:async()=>(await i.e(1978).then(i.bind(i,1978))).reownSvg};let S=class extends n.WF{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`\n      --local-color: var(--wui-color-${this.color});\n      --local-width: var(--wui-icon-size-${this.size});\n      --local-aspect-ratio: ${this.aspectRatio}\n    `,n.qy`${p(async function(t){if(f.has(t))return f.get(t);const e=(m[t]??m.copy)();return f.set(t,e),e}(this.name),n.qy`<div class="fallback"></div>`)}`}};S.styles=[u.W5,u.ck,y],b([(0,a.MZ)()],S.prototype,"size",void 0),b([(0,a.MZ)()],S.prototype,"name",void 0),b([(0,a.MZ)()],S.prototype,"color",void 0),b([(0,a.MZ)()],S.prototype,"aspectRatio",void 0),S=b([(0,v.E)("wui-icon")],S)},3720:(t,e,i)=>{i.d(e,{H:()=>o});var n=i(6752),a=i(7804);const o=(0,a.u$)(class extends a.WL{constructor(t){if(super(t),t.type!==a.OA.ATTRIBUTE||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter((e=>t[e])).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const n=!!e[t];n===this.st.has(t)||this.nt?.has(t)||(n?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return n.c0}})},4290:(t,e,i)=>{i.d(e,{w:()=>a});var n=i(5694);function a(t){return(0,n.M)({...t,state:!0,attribute:!1})}},5090:(t,e,i)=>{i(8409)},5694:(t,e,i)=>{i.d(e,{M:()=>s});var n=i(842);const a={attribute:!0,type:String,converter:n.W3,reflect:!1,hasChanged:n.Ec},o=(t=a,e,i)=>{const{kind:n,metadata:o}=i;let s=globalThis.litPropertyMetadata.get(o);if(void 0===s&&globalThis.litPropertyMetadata.set(o,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===n){const{name:n}=i;return{set(i){const a=e.get.call(this);e.set.call(this,i),this.requestUpdate(n,a,t)},init(e){return void 0!==e&&this.C(n,void 0,t,e),e}}}if("setter"===n){const{name:n}=i;return function(i){const a=this[n];e.call(this,i),this.requestUpdate(n,a,t)}}throw Error("Unsupported decorator location: "+n)};function s(t){return(e,i)=>"object"==typeof i?o(t,e,i):((t,e,i)=>{const n=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),n?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}},5707:(t,e,i)=>{i.d(e,{MZ:()=>n.M,wk:()=>a.w});var n=i(5694),a=i(4290)},6201:(t,e,i)=>{i.d(e,{Kq:()=>d});var n=i(8504),a=i(7804);const o=(t,e)=>{const i=t._$AN;if(void 0===i)return!1;for(const t of i)t._$AO?.(e,!1),o(t,e);return!0},s=t=>{let e,i;do{if(void 0===(e=t._$AM))break;i=e._$AN,i.delete(t),t=e}while(0===i?.size)},r=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),h(e)}};function c(t){void 0!==this._$AN?(s(this),this._$AM=t,r(this)):this._$AM=t}function l(t,e=!1,i=0){const n=this._$AH,a=this._$AN;if(void 0!==a&&0!==a.size)if(e)if(Array.isArray(n))for(let t=i;t<n.length;t++)o(n[t],!1),s(n[t]);else null!=n&&(o(n,!1),s(n));else o(this,t)}const h=t=>{t.type==a.OA.CHILD&&(t._$AP??=l,t._$AQ??=c)};class d extends a.WL{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),r(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(o(this,t),s(this))}setValue(t){if((0,n.Rt)(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}},7804:(t,e,i)=>{i.d(e,{OA:()=>n,WL:()=>o,u$:()=>a});const n={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},a=t=>(...e)=>({_$litDirective$:t,values:e});class o{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}},8409:(t,e,i)=>{var n=i(2618),a=i(5707),o=i(3720),s=i(6109),r=i(3494);const c=n.AH`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var l=function(t,e,i,n){var a,o=arguments.length,s=o<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,n);else for(var r=t.length-1;r>=0;r--)(a=t[r])&&(s=(o<3?a(s):o>3?a(e,i,s):a(e,i))||s);return o>3&&s&&Object.defineProperty(e,i,s),s};let h=class extends n.WF{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const t={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`\n      --local-align: ${this.align};\n      --local-color: var(--wui-color-${this.color});\n    `,n.qy`<slot class=${(0,o.H)(t)}></slot>`}};h.styles=[s.W5,c],l([(0,a.MZ)()],h.prototype,"variant",void 0),l([(0,a.MZ)()],h.prototype,"color",void 0),l([(0,a.MZ)()],h.prototype,"align",void 0),l([(0,a.MZ)()],h.prototype,"lineClamp",void 0),h=l([(0,r.E)("wui-text")],h)},8504:(t,e,i)=>{i.d(e,{Rt:()=>s,sO:()=>o});var n=i(6752);const{I:a}=n.ge,o=t=>null===t||"object"!=typeof t&&"function"!=typeof t,s=t=>void 0===t.strings},9807:(t,e,i)=>{var n=i(2618),a=i(5707),o=i(6109),s=i(3612),r=i(3494);const c=n.AH`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var l=function(t,e,i,n){var a,o=arguments.length,s=o<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,n);else for(var r=t.length-1;r>=0;r--)(a=t[r])&&(s=(o<3?a(s):o>3?a(e,i,s):a(e,i))||s);return o>3&&s&&Object.defineProperty(e,i,s),s};let h=class extends n.WF{render(){return this.style.cssText=`\n      flex-direction: ${this.flexDirection};\n      flex-wrap: ${this.flexWrap};\n      flex-basis: ${this.flexBasis};\n      flex-grow: ${this.flexGrow};\n      flex-shrink: ${this.flexShrink};\n      align-items: ${this.alignItems};\n      justify-content: ${this.justifyContent};\n      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};\n      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};\n      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};\n      padding-top: ${this.padding&&s.Z.getSpacingStyles(this.padding,0)};\n      padding-right: ${this.padding&&s.Z.getSpacingStyles(this.padding,1)};\n      padding-bottom: ${this.padding&&s.Z.getSpacingStyles(this.padding,2)};\n      padding-left: ${this.padding&&s.Z.getSpacingStyles(this.padding,3)};\n      margin-top: ${this.margin&&s.Z.getSpacingStyles(this.margin,0)};\n      margin-right: ${this.margin&&s.Z.getSpacingStyles(this.margin,1)};\n      margin-bottom: ${this.margin&&s.Z.getSpacingStyles(this.margin,2)};\n      margin-left: ${this.margin&&s.Z.getSpacingStyles(this.margin,3)};\n    `,n.qy`<slot></slot>`}};h.styles=[o.W5,c],l([(0,a.MZ)()],h.prototype,"flexDirection",void 0),l([(0,a.MZ)()],h.prototype,"flexWrap",void 0),l([(0,a.MZ)()],h.prototype,"flexBasis",void 0),l([(0,a.MZ)()],h.prototype,"flexGrow",void 0),l([(0,a.MZ)()],h.prototype,"flexShrink",void 0),l([(0,a.MZ)()],h.prototype,"alignItems",void 0),l([(0,a.MZ)()],h.prototype,"justifyContent",void 0),l([(0,a.MZ)()],h.prototype,"columnGap",void 0),l([(0,a.MZ)()],h.prototype,"rowGap",void 0),l([(0,a.MZ)()],h.prototype,"gap",void 0),l([(0,a.MZ)()],h.prototype,"padding",void 0),l([(0,a.MZ)()],h.prototype,"margin",void 0),h=l([(0,r.E)("wui-flex")],h)}}]);