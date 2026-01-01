@echo off
cd gui
if not exist node_modules (
    echo Installing dependencies... This may take a few minutes.
    npm install
)
echo Starting CEO Personal OS GUI...
npm start