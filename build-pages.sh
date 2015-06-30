#!/bin/bash

mkdir temp

git checkout master
./build-ga.py
cp build/ga*.js temp
cp build/layer*.js temp
cp build/*.css temp
cp build/EPSG* temp
cp build/proj4js-com* temp
cp build/*.png temp


make -f Makefile-ga apidoc
cp -r build/hosted/master/apidoc temp

git checkout gh-pages
cp -r temp/* .
git add apidoc
rm -rf temp

git status

echo "!!! IMPORTANT !!!"
echo "You need to add and commit your files"
