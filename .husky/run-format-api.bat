@echo off
cd /d %~dp0..
apps\api
bun prettier --write src/**/*.ts src/**/*.tsx
