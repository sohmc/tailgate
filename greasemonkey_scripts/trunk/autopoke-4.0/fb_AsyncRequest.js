function AsyncRequest(uri)  {
     var dispatchResponse = bind(this, function(asyncResponse)  {
          try {
               this.clearStatusIndicator();
               this._measureSaved&&this._measureSaved();
               if(this._isPrefetch) {
                    this._isPrefetch=false;
                    return;
               } 
               
               if(!this.isRelevant()) {
                    invokeErrorHandler(1010);
                    return;
               } 
               
               if(this.initialHandler(asyncResponse)!==false) {
                    clearTimeout(this.timer);
                    asyncResponse.jscc&&invoke_callbacks([asyncResponse.jscc]);
                    if(this.handler) 
                         try {
                              var suppress_onload=this.handler(asyncResponse);
                         } catch(exception) {
                              asyncResponse.is_last&&this.finallyHandler(asyncResponse);
                              throw exception;
                         }
                    
                    asyncResponse.is_last&&this.finallyHandler(asyncResponse);

                    if (suppress_onload!==AsyncRequest.suppressOnloadToken) {
                         var onload=asyncResponse.onload;
                         if(onload)
                              for(var ii=0; ii<onload.length; ii++) 
                                   try {
                                        (new Function(onload[ii])).apply(this);
                                   } catch(exception) {
                                   }
                         
                         if (this.lid&&!asyncResponse.isReplay())
                              Arbiter.inform('tti_ajax', {
                                   s:this.lid,d:[this._sendTimeStamp||0,(this._sendTimeStamp&&this._responseTime)?(this._responseTime-this._sendTimeStamp):0]},Arbiter.BEHAVIOR_EVENT);
                                   var onafterload=asyncResponse.onafterload;
                                   
                                   if(onafterload)
                                        for(var ii=0; ii<onafterload.length; ii++)
                                             try {
                                                  (new Function(onafterload[ii])).apply(this);
                                             } catch(exception) {
                                             }
                    }
                    
                    var invalidate_cache=asyncResponse.invalidate_cache;
                    if(!this.getOption('suppressCacheInvalidation') && invalidate_cache && invalidate_cache.length)
                         Arbiter.inform(Arbiter.PAGECACHE_INVALIDATE,invalidate_cache);

               } 
               
               if (asyncResponse.cacheObservation && typeof(TabConsoleCacheobserver) != 'undefined' && TabConsoleCacheobserver.instance)
                    TabConsoleCacheobserver.getInstance().addAsyncObservation(asyncResponse.cacheObservation);
          } catch(exception) {
          }
     }); // End Function

var replayResponses=bind(this,function() {
if(is_empty(this._asyncResponses))return;
this.setNewSerial();
for(var ii=0;
ii<this._asyncResponses.length;
++ii) {
var r=this._asyncResponses[ii];
invokeResponseHandler(r,true);
}});
var dispatchErrorResponse=bind(this,function(asyncResponse,isTransport) {
try {
this.clearStatusIndicator();
var async_error=asyncResponse.getError();
if(this._sendTimeStamp) {
var _duration=(+new Date())-this._sendTimeStamp;
var xfb_ip=this._xFbServer||'-';
asyncResponse.logError('async_error',_duration+':'+xfb_ip);
}else asyncResponse.logError('async_error');
if((!this.isRelevant())||async_error===1010)return;
if(async_error==1357008||async_error==1357007||async_error==1442002||async_error==1357001) {
var is_confirmation=false;
if(async_error==1357008||async_error==1357007)is_confirmation=true;
var payload=asyncResponse.getPayload();
this._displayServerDialog(payload.__dialog,is_confirmation);
}else if(this.initialHandler(asyncResponse)!==false) {
clearTimeout(this.timer);
try {
if(isTransport) {
this.transportErrorHandler(asyncResponse);
}else this.errorHandler(asyncResponse);
}catch(exception) {
this.finallyHandler(asyncResponse);
throw exception;
}this.finallyHandler(asyncResponse);
}}catch(exception) {
}});
var _interpretTransportResponse=bind(this,function() {
if(this.getOption('suppressEvaluation')) {
var r=new AsyncResponse(this,this.transport);
return  {
asyncResponse:r};
}var _sendError=function(p,error_code,str) {
if(!window.send_error_signal)return;
if(this._xFbServer) {
error_code='1008_'+error_code;
}else error_code='1012_'+error_code;
send_error_signal('async_xport_resp',error_code+':'+(this._xFbServer||'-')+':'+p.getURI()+':'+str.length+':'+str.substr(0,1600));
};
var shield="for (;
;
);
";
var shieldlen=shield.length;
var text=this.transport.responseText;
if(text.length<=shieldlen) {
_sendError(this,'empty',text);
return  {
transportError:'Response too short on async to '+this.getURI()};
}var offset=0;
while(text.charAt(offset)==" "||text.charAt(offset)=="\n")offset++;
offset&&text.substring(offset,offset+shieldlen)==shield;
var safeResponse=text.substring(offset+shieldlen);
try {
var response=eval('('+safeResponse+')');
}catch(exception) {
_sendError(this,'excep',text);
return  {
transportError:'eval() failed on async to '+this.getURI()};
}return interpretResponse(response);
});
var interpretResponse=bind(this,function(response) {
if(response.redirect)return  {
redirect:response.redirect};
var r=new AsyncResponse(this);
if(response.__ar!=1) {
r.payload=response;
}else {
copy_properties(r,response);
if(response.tplts)if(window.DynaTemplate)DynaTemplate.registerTemplates(response.tplts);
}return  {
asyncResponse:r};
});
var invokeResponseHandler=bind(this,function(interp,is_replay) {
if(typeof(interp.redirect)!='undefined') {
(function() {
this.setURI(interp.redirect).send();
}).bind(this).defer();
return;
}if(this.handler||this.errorHandler||this.transportErrorHandler)if(typeof(interp.asyncResponse)!='undefined') {
var r=interp.asyncResponse;
r.setReplay(!!is_replay);
if(!this.isRelevant()) {
invokeErrorHandler(1010);
return;
}if(r.inlinejs)eval_global(r.inlinejs);
if(r.lid) {
this._responseTime=(+new Date());
if(window.CavalryLogger)this.cavalry=CavalryLogger.getInstance(r.lid);
this.lid=r.lid;
}if(r.getError()&&!r.getErrorIsWarning()) {
var fn=dispatchErrorResponse;
}else {
var fn=dispatchResponse;
if(this._replayable&&!is_replay&&!r.dontReplay) {
this._asyncResponses=this._asyncResponses||[];
this._asyncResponses.push(interp);
}}Bootloader.setResourceMap(r.resource_map);
if(r.bootloadable)Bootloader.enableBootload(r.bootloadable);
fn=fn.shield(null,r);
fn=fn.defer.bind(fn);
var is_transitional=false;
if(this.preBootloadHandler)is_transitional=this.preBootloadHandler(r);
r.css=r.css||[];
r.js=r.js||[];
Bootloader.loadResources(r.css.concat(r.js),fn,is_transitional,this.getURI());
}else if(typeof(interp.transportError)!='undefined') {
if(this._xFbServer) {
invokeErrorHandler(1008);
}else invokeErrorHandler(1012);
}else invokeErrorHandler(1007);
});
var invokeErrorHandler=bind(this,function(explicitError) {
try {
if(!window.loaded)return;
}catch(ex) {
return;
}var r=new AsyncResponse(this);
var err;
try {
err=explicitError||this.transport.status||1004;
}catch(ex) {
err=1005;
}if(this._requestAborted)err=1011;
try {
if(this.responseText=='')err=1002;
}catch(ignore) {
}if(this.transportErrorHandler) {
var desc,summary;
var silent=true;
if(false===navigator.onLine) {
summary=_tx("No Network Connection");
desc=_tx("Your browser appears to be offline. Please check your internet connection and try again.");
err=1006;
silent=false;
}else if(err>=300&&err<=399) {
summary=_tx("Redirection");
desc=_tx("Your access to Facebook was redirected or blocked by a third party at this time, please contact your ISP or reload. ");
redir_url=this.transport.getResponseHeader("Location");
if(redir_url)goURI(redir_url,true);
silent=true;
}else {
summary=_tx("Oops!");
desc=_tx("Something went wrong. We're working on getting this fixed as soon as we can. You may be able to try again.");
}!this.getOption('suppressErrorAlerts');
copy_properties(r, {
error:err,errorSummary:summary,errorDescription:desc,silentError:silent});
dispatchErrorResponse(r,true);
}});
var handleResponse=function(response) {
var asyncResponse=this.interpretResponse(response);
this.invokeResponseHandler(asyncResponse);
};
var onStateChange=function() {
try {
if(this.transport.readyState==4) {
AsyncRequest._inflightPurge();
try {
if(typeof(this.transport.getResponseHeader)!='undefined'&&this.transport.getResponseHeader('X-FB-Server'))this._xFbServer=this.transport.getResponseHeader('X-FB-Server');
}catch(ex) {
}if(this.transport.status>=200&&this.transport.status<300) {
invokeResponseHandler(_interpretTransportResponse());
}else if(ua.safari()&&(typeof(this.transport.status)=='undefined')) {
invokeErrorHandler(1002);
}else if(window.send_error_signal&&window.Env&&window.Env.retry_ajax_on_network_error&&this.transport.status in  {
0:1,12029:1,12030:1,12031:1,12152:1}&&this.remainingRetries>0) {
--this.remainingRetries;
delete this.transport;
this.send(true);
return;
}else invokeErrorHandler();
if(this.getOption('asynchronous')!==false)delete this.transport;
}}catch(exception) {
try {
if(!window.loaded)return;
}catch(ex) {
return;
}delete this.transport;
if(this.remainingRetries>0) {
--this.remainingRetries;
this.send(true);
}else {
!this.getOption('suppressErrorAlerts');
if(window.send_error_signal)send_error_signal('async_xport_resp','1007:'+(this._xFbServer||'-')+':'+this.getURI()+':'+exception.message);
invokeErrorHandler(1007);
}}};
var onJSONPResponse=function(data,more_chunked_response) {
var is_first=(this.is_first===undefined);
this.is_first=is_first;
if(this.transportIframe&&!more_chunked_response)(function(x) {
document.body.removeChild(x);
}).bind(null,this.transportIframe).defer();
if(ua.ie()>=9&&window.JSON)data=window.JSON.parse(window.JSON.stringify(data));
var r=this.interpretResponse(data);
r.asyncResponse.is_first=is_first;
r.asyncResponse.is_last=!more_chunked_response;
this.invokeResponseHandler(r);
return more_chunked_response;
};
copy_properties(this, {
onstatechange:onStateChange,onjsonpresponse:onJSONPResponse,replayResponses:replayResponses,invokeResponseHandler:invokeResponseHandler,interpretResponse:interpretResponse,handleResponse:handleResponse,transport:null,method:'POST',uri:'',timeout:null,timer:null,initialHandler:bagofholding,handler:null,errorHandler:null,transportErrorHandler:null,timeoutHandler:null,finallyHandler:bagofholding,serverDialogCancelHandler:bagofholding,relativeTo:null,statusElement:null,statusClass:'',data: {
},context: {
},readOnly:false,writeRequiredParams:['post_form_id'],remainingRetries:0,option: {
asynchronous:true,suppressCacheInvalidation:false,suppressErrorHandlerWarning:false,suppressEvaluation:false,suppressErrorAlerts:false,retries:0,jsonp:false,bundle:false,useIframeTransport:false,tfbEndpoint:true},_replayable:undefined,_replayKey:'',_isPrefetch:false});
this.errorHandler=AsyncResponse.defaultErrorHandler;
this.transportErrorHandler=bind(this,'errorHandler');
if(uri!=undefined)this.setURI(uri);
return this;
}Arbiter.subscribe("page_transition",function(b,a) {
AsyncRequest._id_threshold=a.id;
});
copy_properties(AsyncRequest, {
pingURI:function(c,a,b) {
a=a|| {
};
return new AsyncRequest().setURI(c).setData(a).setOption('asynchronous',!b).setOption('suppressErrorHandlerWarning',true).setErrorHandler(bagofholding).setTransportErrorHandler(bagofholding).send();
},receiveJSONPResponse:function(b,a,c) {
if(this._JSONPReceivers[b])if(!this._JSONPReceivers[b](a,c))delete this._JSONPReceivers[b];
},_hasBundledRequest:function() {
return AsyncRequest._allBundledRequests.length>0;
},stashBundledRequest:function() {
var a=AsyncRequest._allBundledRequests;
AsyncRequest._allBundledRequests=[];
return a;
},setBundledRequestProperties:function(b) {
var c=null;
if(b.stashedRequests)AsyncRequest._allBundledRequests=AsyncRequest._allBundledRequests.concat(b.stashedRequests);
if(!AsyncRequest._hasBundledRequest()) {
var a=b.callback;
a&&a();
}else {
copy_properties(AsyncRequest._bundledRequestProperties,b);
if(b.start_immediately)c=AsyncRequest._sendBundledRequests();
}return c;
},_bundleRequest:function(b) {
if(b.getOption('jsonp')||b.getOption('useIframeTransport')) {
b.setOption('bundle',false);
return false;
}else if(!b.uri.isFacebookURI()) {
b.setOption('bundle',false);
return false;
}else if(!b.getOption('asynchronous')) {
b.setOption('bundle',false);
return false;
}var a=b.uri.getPath();
if(!AsyncRequest._bundleTimer)AsyncRequest._bundleTimer=setTimeout(function() {
AsyncRequest._sendBundledRequests();
},0);
AsyncRequest._allBundledRequests.push([a,b]);
return true;
},_sendBundledRequests:function() {
clearTimeout(AsyncRequest._bundleTimer);
AsyncRequest._bundleTimer=null;
var a=AsyncRequest._allBundledRequests;
AsyncRequest._allBundledRequests=[];
var e= {
};
copy_properties(e,AsyncRequest._bundledRequestProperties);
AsyncRequest._bundledRequestProperties= {
};
if(is_empty(e)&&a.length==1) {
var g=a[0][1];
g.setOption('bundle',false).send();
return g;
}var d=function() {
e.callback&&e.callback();
};
if(a.length===0) {
d();
return null;
}var b=[];
for(var c=0;
c<a.length;
c++)b.push([a[c][0],URI.implodeQuery(a[c][1].data)]);
var f= {
data:b};
if(e.extra_data)copy_properties(f,e.extra_data);
var g=new AsyncRequest();
g.setURI('/ajax/proxy.php').setData(f).setMethod('POST').setInitialHandler(e.onInitialResponse||bagof(true)).setAllowCrossPageTransition(true).setHandler(function(l) {
var k=l.getPayload();
var n=k.responses;
if(n.length!=a.length) {
return;
}else for(var i=0;
i<a.length;
i++) {
var j=a[i][0];
var m=a[i][1];
m.id=this.id;
if(n[i][0]!=j) {
m.invokeResponseHandler( {
transportError:'Wrong response order in bundled request to '+j});
continue;
}var h=m.interpretResponse(n[i][1]);
m.invokeResponseHandler(h);
}}).setTransportErrorHandler(function(m) {
var k=[];
var i= {
transportError:m.errorDescription};
for(var h=0;
h<a.length;
h++) {
var j=a[h][0];
var l=a[h][1];
k.push(j);
l.id=this.id;
l.invokeResponseHandler(i);
}}).setFinallyHandler(function(h) {
d();
}).send();
return g;
},bootstrap:function(c,b,d) {
var e='GET';
var f=true;
var a= {
};
if(d||(b&&b.rel=='async-post')) {
e='POST';
f=false;
if(c) {
c=URI(c);
a=c.getQueryData();
c.setQueryData( {
});
}}var g=Parent.byClass(b,'stat_elem')||b;
if(g&&CSS.hasClass(g,'async_saving'))return false;
new AsyncRequest(c).setReadOnly(f).setMethod(e).setData(a).setNectarModuleDataSafe(b).setStatusElement(g).setRelativeTo(b).send();
return false;
},post:function(b,a) {
new AsyncRequest(b).setReadOnly(false).setMethod('POST').setData(a).send();
return false;
},clearCache:function() {
AsyncRequest._reqsCache= {
};
},getLastId:function() {
return AsyncRequest._last_id;
},_JSONPReceivers: {
},_allBundledRequests:[],_bundledRequestProperties: {
},_bundleTimer:null,suppressOnloadToken: {
},REPLAYABLE_AJAX:'ajax/replayable',_last_id:2,_id_threshold:2,_reqsCache: {
},_inflight:[],_inflightAdd:bagofholding,_inflightPurge:bagofholding,_inflightEnable:function() {
if(ua.ie()) {
copy_properties(AsyncRequest, {
_inflightAdd:function(a) {
this._inflight.push(a);
},_inflightPurge:function() {
AsyncRequest._inflight=AsyncRequest._inflight.filter(function(a) {
return a.transport&&a.transport.readyState<4;
});
}});
onunloadRegister(function() {
AsyncRequest._inflight.each(function(a) {
if(a.transport&&a.transport.readyState<4) {
a.transport.abort();
delete a.transport;
}});
});
}}});
copy_properties(AsyncRequest.prototype, {
setMethod:function(a) {
this.method=a.toString().toUpperCase();
return this;
},getMethod:function() {
return this.method;
},setData:function(a) {
this.data=a;
return this;
},getData:function() {
return this.data;
},setContextData:function(b,c,a) {
a=a===undefined?true:a;
if(a)this.context['_log_'+b]=c;
return this;
},setURI:function(a) {
var b=URI(a);
if(this.getOption('useIframeTransport')&&!b.isFacebookURI())return this;
if(!this.getOption('jsonp')&&!this.getOption('useIframeTransport')&&!b.isSameOrigin())return this;
if(!a||b.toString()==='') {
if(window.send_error_signal&&window.get_error_stack) {
send_error_signal('async_error','1013:-:0:-:'+window.location.href);
send_error_signal('async_xport_stack','1013:'+window.location.href+'::'+get_error_stack());
}return this;
}this.uri=b;
return this;
},getURI:function() {
return this.uri.toString();
},setInitialHandler:function(a) {
this.initialHandler=a;
return this;
},setHandler:function(a) {
if(!(typeof(a)!='function'))this.handler=a;
return this;
},getHandler:function() {
return this.handler;
},setErrorHandler:function(a) {
if(!(typeof(a)!='function'))this.errorHandler=a;
return this;
},setTransportErrorHandler:function(a) {
this.transportErrorHandler=a;
return this;
},getErrorHandler:function() {
return this.errorHandler;
},getTransportErrorHandler:function() {
return this.transportErrorHandler;
},setTimeoutHandler:function(b,a) {
if(!(typeof(a)!='function')) {
this.timeout=b;
this.timeoutHandler=a;
}return this;
},resetTimeout:function(a) {
if(!(this.timeoutHandler===null))if(a===null) {
this.timeout=null;
clearTimeout(this.timer);
this.timer=null;
}else {
this.timeout=a;
clearTimeout(this.timer);
this.timer=this._handleTimeout.bind(this).defer(this.timeout);
}return this;
},_handleTimeout:function() {
this.abandon();
this.timeoutHandler(this);
},setNewSerial:function() {
this.id=++AsyncRequest._last_id;
return this;
},setFinallyHandler:function(a) {
this.finallyHandler=a;
return this;
},setServerDialogCancelHandler:function(a) {
this.serverDialogCancelHandler=a;
return this;
},setPreBootloadHandler:function(a) {
this.preBootloadHandler=a;
return this;
},setReadOnly:function(a) {
if(!(typeof(a)!='boolean'))this.readOnly=a;
return this;
},setFBMLForm:function() {
this.writeRequiredParams=["fb_sig"];
return this;
},getReadOnly:function() {
return this.readOnly;
},setRelativeTo:function(a) {
this.relativeTo=a;
return this;
},getRelativeTo:function() {
return this.relativeTo;
},setStatusClass:function(a) {
this.statusClass=a;
return this;
},setStatusElement:function(a) {
this.statusElement=a;
return this;
},getStatusElement:function() {
return ge(this.statusElement);
},isRelevant:function() {
if(this._allowCrossPageTransition)return true;
if(!this.id)return true;
return this.id>AsyncRequest._id_threshold;
},clearStatusIndicator:function() {
var a=this.getStatusElement();
if(a) {
CSS.removeClass(a,'async_saving');
CSS.removeClass(a,this.statusClass);
}},addStatusIndicator:function() {
var a=this.getStatusElement();
if(a) {
CSS.addClass(a,'async_saving');
CSS.addClass(a,this.statusClass);
}},specifiesWriteRequiredParams:function() {
return this.writeRequiredParams.every(function(a) {
this.data[a]=this.data[a]||Env[a]||(ge(a)|| {
}).value;
if(this.data[a]!==undefined)return true;
return false;
},this);
},setReplayable:function(b,a) {
this._replayable=b;
this._replayKey=a||'';
return this;
},setOption:function(a,b) {
if(typeof(this.option[a])!='undefined')this.option[a]=b;
return this;
},getOption:function(a) {
typeof(this.option[a])=='undefined';
return this.option[a];
},abort:function() {
if(this.transport) {
var a=this.getTransportErrorHandler();
this.setOption('suppressErrorAlerts',true);
this.setTransportErrorHandler(bagofholding);
this._requestAborted=1;
this.transport.abort();
this.setTransportErrorHandler(a);
}},abandon:function() {
clearTimeout(this.timer);
this.setOption('suppressErrorAlerts',true).setHandler(bagofholding).setErrorHandler(bagofholding).setTransportErrorHandler(bagofholding);
if(this.transport) {
this._requestAborted=1;
this.transport.abort();
}},setNectarActionData:function(a) {
if(this.data.nctr===undefined)this.data.nctr= {
};
this.data.nctr._ia=1;
if(a) {
if(this.data.nctr._as===undefined)this.data.nctr._as= {
};
copy_properties(this.data.nctr._as,a);
}return this;
},setNectarData:function(a) {
if(a) {
if(this.data.nctr===undefined)this.data.nctr= {
};
copy_properties(this.data.nctr,a);
}return this;
},setNectarModuleDataSafe:function(a) {
if(this.setNectarModuleData)this.setNectarModuleData(a);
return this;
},setNectarImpressionIdSafe:function() {
if(this.setNectarImpressionId)this.setNectarImpressionId();
return this;
},setPrefetch:function(a) {
this._isPrefetch=a;
this.setAllowCrossPageTransition(true);
return this;
},setAllowCrossPageTransition:function(a) {
this._allowCrossPageTransition=!!a;
return this;
},send:function(c) {
if(this._checkCache&&this._checkCache())return true;
c=c||false;
if(!this.uri)return false;
!this.errorHandler&&!this.getOption('suppressErrorHandlerWarning');
if(this.getOption('jsonp')&&this.method!='GET')this.setMethod('GET');
if(this.getOption('useIframeTransport')&&this.method!='GET')this.setMethod('GET');
this.timeoutHandler!==null&&(this.getOption('jsonp')||this.getOption('useIframeTransport'));
if(!this.getReadOnly()) {
if(!this.specifiesWriteRequiredParams())return false;
if(this.method!='POST')return false;
}if(this.method=='POST'&&this.getOption('tfbEndpoint')) {
this.data.fb_dtsg=Env.fb_dtsg;
this.data.lsd=getCookie('lsd');
}this._replayable=(!this.getReadOnly()&&this._replayable!==false)||this._replayable;
if(this._replayable)Arbiter.inform(AsyncRequest.REPLAYABLE_AJAX,this);
if(!is_empty(this.context)&&this.getOption('tfbEndpoint')) {
copy_properties(this.data,this.context);
this.data.ajax_log=1;
}if(!this.getReadOnly()&&this.getOption('tfbEndpoint')&&this.method=='POST'&&this.data.post_form_id_source===undefined)this.data.post_form_id_source='AsyncRequest';
if(this.getOption('bundle')&&AsyncRequest._bundleRequest(this))return true;
this.setNewSerial();
if(this.getOption('tfbEndpoint'))this.uri.addQueryData( {
__a:1});
this.finallyHandler=async_callback(this.finallyHandler,'final');
var h,d;
if(this.method=='GET') {
h=this.uri.addQueryData(this.data).toString();
d='';
}else {
h=this.uri.toString();
d=URI.implodeQuery(this.data);
}if(this.getOption('jsonp')||this.getOption('useIframeTransport')) {
h=this.uri.addQueryData( {
__a:this.id}).toString();
AsyncRequest._JSONPReceivers[this.id]=async_callback(bind(this,'onjsonpresponse'),'json');
if(this.getOption('jsonp')) {
(function() {
document.body.appendChild($N('script', {
src:h,type:"text/javascript"}));
}).bind(this).defer();
}else {
var e= {
position:'absolute',top:'-1000px',left:'-1000px',width:'80px',height:'80px'};
this.transportIframe=$N('iframe', {
src:h,style:e});
document.body.appendChild(this.transportIframe);
}return true;
}if(this.transport)return false;
var g=null;
try {
g=new XMLHttpRequest();
}catch(b) {
}if(!g)try {
g=new ActiveXObject("Msxml2.XMLHTTP");
}catch(b) {
}if(!g)try {
g=new ActiveXObject("Microsoft.XMLHTTP");
}catch(b) {
}if(!g)return false;
g.onreadystatechange=async_callback(bind(this,'onstatechange'),'xhr');
if(!c)this.remainingRetries=this.getOption('retries');
if(window.send_error_signal||window.ArbiterMonitor)this._sendTimeStamp=this._sendTimeStamp||(+new Date());
this.transport=g;
try {
this.transport.open(this.method,h,this.getOption('asynchronous'));
}catch(a) {
return false;
}var f=env_get('svn_rev');
if(f)this.transport.setRequestHeader('X-SVN-Rev',String(f));
if(this.method=='POST')this.transport.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
this.addStatusIndicator();
this.transport.send(d);
if(this.timeout!==null)this.resetTimeout(this.timeout);
AsyncRequest._inflightAdd(this);
return true;
},_displayServerDialog:function(c,b) {
var a=new Dialog(c);
if(b)a.setHandler(this._displayConfirmationHandler.bind(this,a));
a.setCancelHandler(function() {
this.serverDialogCancelHandler.apply(this,arguments);
this.finallyHandler.apply(this,arguments);
}.bind(this)).setCloseHandler(this.finallyHandler.bind(this)).show();
},_displayConfirmationHandler:function(a) {
this.data.confirmed=1;
copy_properties(this.data,a.getFormData());
this.send();
}});
function AsyncResponse(b,a) {
copy_properties(this, {
error:0,errorSummary:null,errorDescription:null,onload:null,replay:false,payload:a||null,request:b||null,silentError:false,is_last:true});
return this;
}copy_properties(AsyncResponse, {
defaultErrorHandler:function(b) {
try {
if(!b.silentError) {
AsyncResponse.verboseErrorHandler(b);
}else b.logErrorByGroup('silent',10);
}catch(a) {
alert(b);
}},verboseErrorHandler:function(b) {
try {
var summary=b.getErrorSummary();
var desc=b.getErrorDescription();
b.logErrorByGroup('popup',10);
if(b.silentError&&desc=='')desc=_tx("Something went wrong. We're working on getting this fixed as soon as we can. You may be able to try again.");
ErrorDialog.show(summary,desc);
}catch(a) {
alert(b);
}}});
copy_properties(AsyncResponse.prototype, {
getRequest:function() {
return this.request;
},getPayload:function() {
return this.payload;
},getError:function() {
return this.error;
},getErrorSummary:function() {
return this.errorSummary;
},setErrorSummary:function(a) {
a=(a===undefined?null:a);
this.errorSummary=a;
return this;
},getErrorDescription:function() {
return this.errorDescription;
},getErrorIsWarning:function() {
return this.errorIsWarning;
},setReplay:function(a) {
a=(a===undefined?true:a);
this.replay=!!a;
return this;
},isReplay:function() {
return this.replay;
},logError:function(a,c) {
if(window.send_error_signal) {
c=(c===undefined?'':(':'+c));
var d=this.request.getURI();
var b=this.error+':'+(env_get('vip')||'-')+c+':'+d;
if(!d||d.indexOf('scribe_endpoint.php')!=-1)a='async_error_double';
send_error_signal(a,b);
}},logErrorByGroup:function(b,a) {
if(Math.floor(Math.random()*a)==0)if(this.error==1357010||this.error<15000) {
this.logError('async_error_oops_'+b);
}else this.logError('async_error_logic_'+b);
}});

var DOMScroll= {
getScrollState:function() {
var d=Vector2.getViewportDimensions();
var a=Vector2.getDocumentDimensions();
var b=(a.x>d.x);
var c=(a.y>d.y);
b+=0;
c+=0;
return new Vector2(b,c);
},_scrollbarSize:null,_initScrollbarSize:function() {
var a=$N('p');
a.style.width='100%';
a.style.height='200px';
var b=$N('div');
b.style.position='absolute';
b.style.top='0px';
b.style.left='0px';
b.style.visibility='hidden';
b.style.width='200px';
b.style.height='150px';
b.style.overflow='hidden';
b.appendChild(a);
document.body.appendChild(b);
var c=a.offsetWidth;
b.style.overflow='scroll';
var d=a.offsetWidth;
if(c==d)d=b.clientWidth;
document.body.removeChild(b);
DOMScroll._scrollbarSize=c-d;
if(DOMScroll._scrollbarSize<5)DOMScroll._scrollbarSize=15;
},getScrollbarSize:function() {
if(DOMScroll._scrollbarSize===null)DOMScroll._initScrollbarSize();
return DOMScroll._scrollbarSize;
},scrollTo:function(d,a,c,b) {
if(typeof a=='undefined'||a===true)a=750;
if(!(d instanceof Vector2)) {
var e=Vector2.getScrollPosition().x;
var f=Vector2.getElementPosition($(d)).y;
f=f-Math.min(0,Math.max(Vector2.getViewportDimensions().y/3,100));
d=new Vector2(e,f,'document');
}if(c) {
d.y-=Vector2.getViewportDimensions().y/2;
}else if(b) {
d.y-=Vector2.getViewportDimensions().y;
d.y+=b;
}d=d.convertTo('document');
if(a) {
Bootloader.loadComponents('animation',function() {
var g=document.body;
animation(g).to('scrollTop',d.y).to('scrollLeft',d.x).ease(animation.ease.end).duration(a).go();
});
}else if(window.scrollTo)window.scrollTo(d.x,d.y);
}};

