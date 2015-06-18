@ECHO OFF

for %%X in (java.exe) do (set IS_JAVA_IN_PATH=%%~$PATH:X)

IF defined IS_JAVA_IN_PATH (
	java -cp conf;site;libs\*;resources blackyblack.Application
) ELSE (
	ECHO Java 1.8 required. Please go to http://java.com/en/ to download a copy of Java.
	PAUSE
)
