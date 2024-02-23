SHELL=/bin/bash

SRC:=
SRC+=$(wildcard src/page/*.html)

OUT:=$(SRC:src/page/%=dist/page/%)

WAIT=$(shell command -v inotifywait fswatch | head -1)
ifeq ($(shell basename ${WAIT}), "inotifywait")
WAIT+="--recursive"
WAIT+="--event"
WAIT+="modify"
else
WAIT+="--one-event"
WAIT+="--recursive"
WAIT+="--event"
WAIT+="Created"
WAIT+="--event"
WAIT+="Updated"
WAIT+="--event"
WAIT+="Removed"
WAIT+="--event"
WAIT+="Renamed"
WAIT+="--event"
WAIT+="MovedFrom"
WAIT+="--event"
WAIT+="MovedTo"
endif


P=\#

default: dist

dist: $(SRC) $(wildcard src/partial/*.html)
	for infile in $(SRC); do \
		mkdir -p $$(dirname dist/$${infile$P"src/"}) ; \
		util/template.sh --partials src $$infile > dist/$${infile$P"src/"} ; \
	done
	rm -rf dist/assets
	cp -r assets dist/assets

.PHONY: watch
watch:
	while true; do \
		${WAIT} src ; \
		make dist ; \
	done
