@echo off
cd /d %~dp0..
apps\web
bun eslint --fix %*
