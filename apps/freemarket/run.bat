@ECHO OFF

for %%X in (java.exe) do (set IS_JAVA_IN_PATH=%%~$PATH:X)

IF defined IS_JAVA_IN_PATH (
	java -cp WebView.jar;conf;site;libs\*;resources webview.Main
) ELSE (
	ECHO Java 1.8 required. Please go to http://java.com/en/ to download a copy of Java.
	PAUSE
)
