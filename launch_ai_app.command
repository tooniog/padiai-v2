#!/bin/bash
cd ~/Downloads/ai_literacy_app
python3 -m http.server 8001 >/tmp/ai_literacy_app.log 2>&1 &
sleep 2
open -a Safari http://localhost:8001
