.SUFFIXES: .nw .js .pdf .html .tex .haml .css .stylus
.PHONY: setup

NOTANGLE=		notangle
NOWEAVE=		noweave
ECHO=			/bin/echo
STYLUS=			stylus
HAML=			haml
COFFEE=         coffee

all: htdocs htdocs/index.html htdocs/store.js htdocs/jsonstore.css htdocs/lib/underscore.js htdocs/lib/jquery.js htdocs/lib/backbone.js htdocs/data/items.json

setup:
	npm install
	bower install jquery underscore backbone
	mkdir -p htdocs/lib

htdocs/lib/underscore.js:
	mkdir -p htdocs/lib
	cp bower_components/underscore/underscore.js htdocs/lib

htdocs/lib/jquery.js:
	mkdir -p htdocs/lib
	cp bower_components/jquery/dist/jquery.js htdocs/lib

htdocs/lib/backbone.js:
	cp bower_components/backbone/backbone.js htdocs/lib

work:
	mkdir -p work

docs:
	mkdir -p docs

htdocs: 
	mkdir -p htdocs


htdocs/index.html: htdocs work/index.haml
	$(HAML) --unix-newlines --no-escape-attrs --double-quote-attribute work/index.haml > htdocs/index.html

work/index.haml: work src/backbonestore.nw
	$(NOTANGLE) -c -Rindex.haml src/backbonestore.nw > work/index.haml

htdocs/jsonstore.css: htdocs work/jsonstore.styl
	$(STYLUS) -o htdocs work/jsonstore.styl

work/jsonstore.styl: work src/backbonestore.nw
	$(NOTANGLE) -c -Rjsonstore.styl src/backbonestore.nw > work/jsonstore.styl

htdocs/store.js: htdocs work/store.coffee
	$(COFFEE) -o htdocs --compile work/store.coffee

work/store.coffee: work src/backbonestore.nw src/items.json
	$(NOTANGLE) -c -Rstore.coffee src/backbonestore.nw > work/store.coffee

htdocs/data/items.json: src/items.json
	mkdir -p htdocs/data
	cp src/items.json htdocs/data/items.json

.nw.tex:
	$(NOWEAVE) -x -delay $*.nw > $*.tex

.tex.pdf:
	xelatex $*.tex; \
	while grep -s 'Rerun to get cross-references right' $*.log; \
        do \
		xelatex *$.tex; \
	done

clean:
	- rm -f docs/*.tex docs/*.dvi docs/*.aux docs/*.toc docs/*.log docs/*.out htdocs/*.html htdocs/*.js htdocs/*.css

realclean: clean
	- rm -f docs/*.pdf
	- rm -fr work htdocs

