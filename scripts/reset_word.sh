#!/usr/bin/env sh
curl -X POST http://localhost:3000/api/word/reset -d '{"reset_key": ""}'
