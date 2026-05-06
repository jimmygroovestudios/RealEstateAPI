@echo off
cd /d %~dp0..
apps\api
bun eslint --fix %*
