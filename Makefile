.SUFFIXES: .nw .js .pdf .html .tex 

NOTANGLE=		notangle
NOWEAVE=		noweave
ECHO=			/bin/echo

all: index.html store.js 

.nw.html:
	$(NOWEAVE) -filter l2h -delay -x -index -autodefs c -html $*.nw > $*.html

.nw.tex:
	$(NOWEAVE) -x -delay $*.nw > $*.tex 			#$

.tex.pdf:
	xelatex $*.tex; \
	while grep -s 'Rerun to get cross-references right' $*.log; \
        do \
		xelatex *$.tex; \
	done

.nw.js:
	@ $(ECHO) $(NOTANGLE) -c -R$@ $<
	@ - $(NOTANGLE) -c -R$@ $< > $*.nw-js-tmp
	@ if [ -s "$*.nw-js-tmp" ]; then \
		mv $*.nw-js-tmp $@; \
	else \
		echo "$@ not found in $<"; \
	rm $*.nw-js-tmp; \
	fi	

store.js: backbonestore.nw
	@ $(ECHO) $(NOTANGLE) -c -R$@ $<
	@ - $(NOTANGLE) -c -R$@ $< > $*.nw-html-tmp
	@ if [ -s "$*.nw-html-tmp" ]; then \
		mv $*.nw-html-tmp $@; \
	else \
		echo "$@ not found in $<"; \
	rm $*.nw-tmp; \
	fi	

index.html: backbonestore.nw
	@ $(ECHO) $(NOTANGLE) -c -R$@ $<
	@ - $(NOTANGLE) -c -R$@ $< > $*.nw-html-tmp
	@ if [ -s "$*.nw-html-tmp" ]; then \
		mv $*.nw-html-tmp $@; \
	else \
		echo "$@ not found in $<"; \
	rm $*.nw-tmp; \
	fi	


clean:
	- rm -f *.tex *.dvi *.aux *.toc *.log *.out *.html *.js

realclean: clean
	- rm -f *.pdf

