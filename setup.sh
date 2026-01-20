#!/usr/bin/env bash
mkdir tmp
curl ftp://ftp.edrdg.org/pub/Nihongo//JMdict_e.gz --output tmp/JMdict_e.gz
gzip -d tmp/JMdict_e.gz && mv tmp/JMdict_e tmp/JMdict_e.xml
python script/preprocess.py
