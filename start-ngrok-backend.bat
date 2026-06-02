@echo off
title UTEShop Backend Ngrok Tunnel
echo Starting ngrok tunnel for ExpressJS backend on port 3000...
echo.
D:\ngrok-v3-stable-windows-amd64\ngrok.exe http --domain=juliet-janitorial-indifferently.ngrok-free.dev 3000
echo.
pause