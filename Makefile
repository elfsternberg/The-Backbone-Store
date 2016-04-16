.PHONY: setup store serve

NOTANGLE=		notangle
NOWEAVE=		noweave
ECHO=			echo
STYLUS=			./node_modules/stylus/bin/stylus
HAML=			haml
COFFEE=         ./node_modules/coffee-script/bin/coffee

LIBS:= htdocs/lib/underscore.js htdocs/lib/jquery.js htdocs/lib/backbone.js

all: htdocs/index.html htdocs/store.js htdocs/jsonstore.css htdocs/data/items.json
	@if [ ! -e "./htdocs/lib" ]; then \
		echo "Please do 'make setup' before continuing"; \
		exit 1; \
	fi

serve: all
	$(COFFEE) ./bin/autoreload

store: all

htdocs/lib:
	mkdir -p htdocs/lib

htdocs/lib/underscore.js: htdocs/lib
	cp bower_components/underscore/underscore.js htdocs/lib

htdocs/lib/jquery.js: htdocs/lib
	cp bower_components/jquery/dist/jquery.js htdocs/lib

htdocs/lib/backbone.js:
	cp bower_components/backbone/backbone.js htdocs/lib

install:
	npm install
	./node_modules/bower/bin/bower install jquery underscore backbone

setup: install $(LIBS)

work:
	mkdir -p work

docs:
	mkdir -p docs

work/index.haml: work src/backbonestore.nw
	$(NOTANGLE) -c -Rindex.haml src/backbonestore.nw > work/index.haml

htdocs/index.html: htdocs work/index.haml
	$(HAML) --unix-newlines --no-escape-attrs --double-quote-attribute work/index.haml > htdocs/index.html

htdocs/jsonstore.css: htdocs work/jsonstore.styl
	$(STYLUS) -o htdocs work/jsonstore.styl

work/jsonstore.styl: work src/backbonestore.nw
	$(NOTANGLE) -c -Rjsonstore.styl src/backbonestore.nw > work/jsonstore.styl

htdocs/store.js: htdocs work/store.coffee
	$(COFFEE) -o htdocs --compile work/store.coffee

work/store.coffee: work src/backbonestore.nw
	$(NOTANGLE) -c -Rstore.coffee src/backbonestore.nw > work/store.coffee

docs/backbonestore.tex: docs src/backbonestore.nw
	${NOWEAVE} -x -delay src/backbonestore.nw > docs/backbonestore.tex	

docs/backbonestore.pdf: docs/backbonestore.tex
	xelatex docs/backbonestore.tex; \
	while grep -s 'Rerun to get cross-references right' ./backbonestore.log; \
        do \
		xelatex docs/backbonestore.tex; \
	done
	mv backbonestore.pdf docs
	rm -f ./backbonestore.log ./backbonestore.aux ./backbonestore.out

pdf: docs/backbonestore.pdf

docs/backbonestore.html: docs src/backbonestore.nw
	$(NOWEAVE) -filter l2h -delay -x -autodefs c -html src/backbonestore.nw > docs/backbonestore.html

html: docs/backbonestore.html

clean:
	- rm -f htdocs/*.* docs/*.tex docs/*.dvi docs/*.aux docs/*.toc docs/*.log docs/*.out
	- rm -fr ./work

distclean: clean
	- rm -fr ./htdocs/lib		

realclean: distclean
	- rm -fr docs


