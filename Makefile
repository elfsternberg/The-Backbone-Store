.SUFFIXES: .nw .js .pdf .html .tex .haml .css .stylus

NOTANGLE=		notangle
NOWEAVE=		noweave
ECHO=			/bin/echo
STYLUS=			stylus
HAML=			haml
COFFEE=         coffee

all: index.html store.js jsonstore.css

index.html: index.haml
	$(HAML) --unix-newlines --no-escape-attrs --double-quote-attribute $*.haml > $*.html

index.haml: backbonestore.nw
	$(NOTANGLE) -c -R$@ $< > $*.haml

jsonstore.css: jsonstore.styl
	$(STYLUS) $*.styl

jsonstore.styl: backbonestore.nw
	$(NOTANGLE) -c -R$@ $< > $@

store.js: store.coffee
	$(COFFEE) --compile $<

store.coffee: backbonestore.nw
	$(NOTANGLE) -c -R$@ $< > $@

.nw.tex:
	$(NOWEAVE) -x -delay $*.nw > $*.tex 			#$

.tex.pdf:
	xelatex $*.tex; \
	while grep -s 'Rerun to get cross-references right' $*.log; \
        do \
		xelatex *$.tex; \
	done

clean:
	- rm -f *.tex *.dvi *.aux *.toc *.log *.out *.html *.js

realclean: clean
	- rm -f *.pdf

