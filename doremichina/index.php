
<?php
/*
if ($_GET['code']!='19771027') {

echo '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body>测试期间，请用邀请码访问</body></html>';
return;
}
*/

?>

<!DOCTYPE html>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<TITLE>Teach99,家教私教，一图打尽</TITLE>
<META NAME="DESCRIPTION" CONTENT="在地图上直接寻找身边的家教和私人培训">
<META NAME="KEYWORDS" CONTENT="家教,私教,私人培训,音乐教育,音乐老师,美术老师,中学家教,高考家教,出国考试,考研,私人教练,英语,健身">
<script type="text/javascript" src="./js/jquery-1.6.4.min.js"></script>
<script type="text/javascript" src="http://maps.google.cn/maps/api/js?sensor=true&&language=zh-CN"></script>
<script type="text/javascript" src="./js/map.js"></script>
<script type="text/javascript" src="./js/yahoo-min.js"></script>
<script type="text/javascript" src="./js/json-min.js"></script>
<script type="text/javascript" src="./js/global.js"></script>
<script type="text/javascript" src="./js/logoanimation.js"></script>
<script type="text/javascript" src="./js/data.js"></script>
<script type="text/javascript" src="./js/page.js"></script>
<script type="text/javascript" src="./js/registration.js"></script>
<script type="text/javascript" src="./js/review.js"></script>
<script type="text/javascript" src="./js/reviewcomment.js"></script>
<script type="text/javascript" src="./js/search.js"></script>
<script type="text/javascript" src="./js/discussion.js"></script>
<script type="text/javascript" src="./js/message.js"></script>
<script type="text/javascript" src="./js/helper.js"></script>

<link rel="stylesheet" href="/css/jquery-ui-1.8.16.custom.css" type="text/css" />
<link rel="stylesheet" href="/imageuploader/css/uploaderPreviewer.css" type="text/css" />
<link rel="stylesheet" href="/css/global.css" type="text/css" />

<script type="text/javascript" src="/imageuploader/js/jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="/imageuploader/js/globalFunctions.js"></script>
<script type="text/javascript" src="/imageuploader/js/uploaderPreviewer.js"></script>
<script type="text/javascript" src="/imageuploader/js/itemForm.js"></script>

<script>

<?php
$userid = 0;
if (isset($_COOKIE['userId'])) {
   $userid = $_COOKIE['userId'];
   echo 'GLOBAL.set("userId", ' . $userid . ');';
} else {
   echo 'GLOBAL.set("userId", 0);';
}
?>

</script>

</head>

<body onload="initPage();">
<div style='margin:0 auto;position:relative; top:-8px;width:1200px;height:2px;background-color:#0080FF;'>
<div style="height:10px"></div>
<div id="HEADER" style='margin:0 auto;width:1200px;height:60px;'>
    <div style="border-radius:9px; width:100%;height:60px;font-size:20px;font-weight:bold;background:#FFFFFF url('/images/logo_bg.jpg') repeat-x;">
        <table><tr>
            <td width="160px">
            <div id="HEADER_LOGO_TITLE" style="width:160px;padding-top:5px">
            &nbsp;<img src='./images/logo.png'　width="80%" height="80%"/>
            <div>
            </td>
            <td width="540px">
            <div id="HEADER_LOGO_INFO" style="width:500px">
            </div>
            </td>
            <td style="vertical-align:bottom;">
                <div id="DIV_USER_MENU" style="width:500px; font-size:12px;text-align:right;border-bottom:2px solid #0080FF;vertical-align:bottom;">
                <span id="login_error" style='color:red;'></span>
                用户名<input id='login_username' type='text'> 
                密码<input id='login_password' type='password'> 
                <input onclick='REGISTRATION.login();' type='button' value='登录'>   | 
                <span onclick="PAGE.showRegistration();" style="cursor:pointer;">快速加入</span><br/>
                </div>
            
            </td>
        </tr></table>
    </div>

    <div id='DIV_USER_INFO_UPDATE' style='width:100%;visibility:hidden;display:none;'>
    </div>
</div>

<div style="height:20px;">
</div>
<div id='DIV_SEARCH' style='border-radius:9px;border:2px solid rgb(83,169,255);'>
    <div id='DIV_SEARCH_TITLE' style="background-color:rgb(83,169,255);width:100%;font-weight:bold;">
    快速查找
    </div>
    <div style="width:100%;font-size:13px;">
    <table><tr>
    <td><table><tr><td>地区</td><td><div id='DIV_ZONE_LIST'></div></td></tr></table></td>
    <td><div id='DIV_AREA_LIST'></div></td>
    <td><table><tr><td>专长</td><td><div id='DIV_SPEC_LIST'></div></td></tr></table></td>
    <td><div id='DIV_ONCALL_LIST'></div></td>
    <td><div id='DIV_PRICE_RANGE'></div></td>
    <td><div id='DIV_SEARCH_EDUCATION'></div></td>
    <td><div id='DIV_SEARCH_GENDER'>
    性别
    <INPUT TYPE=RADIO NAME="SEARCH_GENDER" VALUE="1" onclick="PAGE.doSearch();">男 
    <INPUT TYPE=RADIO NAME="SEARCH_GENDER" VALUE="2" onclick="PAGE.doSearch();">女
    <INPUT TYPE=RADIO NAME="SEARCH_GENDER" VALUE="-1"  onclick="PAGE.doSearch();" checked>不限
    </div></td>
    <td><input id="BUTTON_SEARCH" type=button onclick="SEARCH.doSearch();" value="搜索"></td>
    </tr></table>
    </div>
</div>
<br>
<div id="DIV_DISPLAY_CANVAS" style='border-radius:9px;border:2px solid #CCCCCC;'>
<table><tr>
<td style="vertical-align:text-top;">
<div id="DIV_DISPLAY_LEFT_MENU" style="width:120px;height:600px;background-color:white;border-radius:9px;height:605px;">
<span class='menu_title'>热门城市</span>
<hr>
    <div id="DIV_POPULAR_CITY_LIST">
    </div>
</div>
</td>
<td>

    <div id="map" style="width:680px;border-radius:9px;height:605px;">
    </div>
    
<td>
<div id="DIV_SEARCH_RESULT_LAYER" 
     style='border-radius:9px;height:600px;'>
     <ul>
        <li><a href="#DIV_SEARCH_RESULT_LAYER-1"><span class="menu_title">搜索结果</span></a></li>
        <li><a href="#DIV_SEARCH_RESULT_LAYER-2"><span class="menu_title">看看该地区在讨论什么</span></a></li>
    </ul>
    <div id="DIV_SEARCH_RESULT_LAYER-1">
        <div id="DIV_SEARCH_RESULT" style="width:335px;">
                            请在地图上点击你的当前位置，开始搜寻周边你所需要的私人教师。
        </div>
        <div id="DIV_SEARCH_RESULT_TEACHER_LIST_PAGING">
        </div>
    </div>
    <div id="DIV_SEARCH_RESULT_LAYER-2">
        <div id="DIV_SEARCH_RESULT_DISCUSSION" style="width:335px;height:540px;overflow:scroll;">
        <table width="100%">
        <tr><td colspan='2'><span id='DIV_SEARCH_RESULT_DISCUSSION_CURRENT_LOCATION'></span><input id='DISCUSSION_ZONE' type='hidden'><input id='DISCUSSION_AREA' type='hidden'></td></tr>
            <tr>
                <td colspan='2'>
<hr/>
<div id="DIV_SEARCH_RESULT_DISCUSSION_LIST">
请首先通过地图或者列表选择相关省市或者区域
</div>
<div id="DIV_SEARCH_RESULT_DISCUSSION_LIST_PAGING">
</div>
                </td>
            </tr>
        </table>
        </div>
    </div>
    
</div>
</td>
</tr>
</table>
</div>
<div id='DIV_TEACHER_DETAILS_VIEW'></div>

<div style='margin:0 auto;border-radius:9px;border:2px solid #CCCCCC;font-size:12px;'>
    <table width="100%"><tr>
        <td>网站论坛</td>
        <td>网站博客</td>
        <td>关于本站</td>
    </tr></table>
</div>

<div id='GOOGLE_ADS' style='margin:0 auto;border-radius:9px;border:2px solid #CCCCCC;font-size:12px;'>
<center>
<script type="text/javascript"><!--
google_ad_client = "ca-pub-6475016834677098";
/* main ad */
google_ad_slot = "6875737800";
google_ad_width = 728;
google_ad_height = 90;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
</center>
</div>

</body>
</html>