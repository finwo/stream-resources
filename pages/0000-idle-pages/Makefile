SHELL=/bin/bash

SRC:=
SRC+=$(wildcard src/page/*.html)

OUT:=$(SRC:src/page/%=dist/page/%)

P=\#

default: dist

dist: $(SRC) $(wildcard src/partial/*.html)
	for infile in $(SRC); do \
		mkdir -p $$(dirname dist/$${infile$P"src/"}) ; \
		util/template.sh --partials src $$infile > dist/$${infile$P"src/"} ; \
	done
	rm -rf dist/assets
	cp -r assets dist/assets
