function postcommentPublish(target,form){
     var parameters="";
     for(var i=0;i<form.elements.length;i++) {
          var element=form.elements[i];
          if(parameters!=""){
               parameters+="&";
          }
          if(element.name!='wpPreview'&&element.name!='wpDiff')
               parameters+=element.name+"="+encodeURIComponent(element.value);
     }
     var strResult;
     postcomment_target=target;
     postcomment_form=form;
     
     try{
          postcomment_request=new XMLHttpRequest();
     } catch(error) {
          try{
               postcomment_request=new ActiveXObject('Microsoft.XMLHTTP');
          } catch(error) {
               return false;
          }
     }
     var button=document.getElementById("postcommentbutton_"+target.replace(/postcomment_newmsg_/,''));
     if(button){
          button.disabled=true;
     }

     var txtbox=document.getElementById("comment_text_"+target.replace(/postcomment_newmsg_/,''));
     if(txtbox) txtbox.disabled=true;
     var p=document.getElementById("postcomment_progress_"+target.replace(/postcomment_newmsg_/,''));
     if (p) p.setAttribute('style','display: inline;');

     if(document.getElementById('wpCaptchaId')){
          parameters+="&wpCaptchaId"+document.getElementById('wpCaptchaId').value;
          parameters+="&wpCaptchaWord"+document.getElementById('wpCaptchaWord').value;
     }
     
     postcomment_request.open('POST',gPostURL+"?fromajax=true",true);
     postcomment_request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
     postcomment_request.send(parameters);
     postcomment_request.onreadystatechange=postcommentHandler;
     return false;
}

