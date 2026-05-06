@echo off
cd /d %~dp0..
apps\web
bun prettier --write src/**/*.ts src/**/*.tsx
