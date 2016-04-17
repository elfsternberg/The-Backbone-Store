.PHONY: setup store serve

NOTANGLE=		notangle
NOWEAVE=		noweave
ECHO=			echo

LIBS:= htdocs/lib/underscore.js htdocs/lib/jquery.js htdocs/lib/backbone.js

all: htdocs/index.html htdocs/store.js htdocs/data/items.json
	@if [ ! -e "./htdocs/lib" ]; then \
		echo "Please do 'make setup' before continuing"; \
		exit 1; \
	fi

serve: all
	./bin/autoreload

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

docs:
	mkdir -p docs

htdocs/index.html: src/backbonestore.nw
	$(NOTANGLE) -c -Rindex.html src/backbonestore.nw > htdocs/index.html

htdocs/store.js: src/backbonestore.nw
	$(NOTANGLE) -c -Rstore.js src/backbonestore.nw > htdocs/store.js

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
	- rm -f htdocs/*.js htdocs/*.html docs/*.tex docs/*.dvi docs/*.aux docs/*.toc docs/*.log docs/*.out

distclean: clean
	- rm -fr ./htdocs/lib		

realclean: distclean
	- rm -fr docs


