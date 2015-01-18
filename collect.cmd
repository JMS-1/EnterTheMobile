mkdir publish
xcopy /y start.html publish
xcopy /y sync.php publish
xcopy /y user.php publish
xcopy /y homeicon.png publish
xcopy /y cache.manifest publish

mkdir publish\content
xcopy /y Content\app.css publish\content
xcopy /y Content\jquery.mobile-1.4.5.css publish\content

mkdir publish\content\images
xcopy /y Content\images\ajax-loader.gif publish\content\images

mkdir publish\scripts
xcopy /y Scripts\jquery-2.1.3.min.js publish\scripts
xcopy /y Scripts\jquery.mobile-1.4.5.min.js publish\scripts
xcopy /y Scripts\user.js publish\scripts
xcopy /y Scripts\item.js publish\scripts
xcopy /y Scripts\market.js publish\scripts
xcopy /y Scripts\app.js publish\scripts
