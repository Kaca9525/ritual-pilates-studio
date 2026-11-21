# Obrasci (reklamacija, odustanak)

`public/docs/*.docx` i `*.pdf` se prave iz JSON opisa:

```bash
python3 tools/obrasci/mkform.py tools/obrasci/odustanak.json public/docs/obrazac-odustanka.docx   # treba python-docx
python3 tools/obrasci/mkform.py tools/obrasci/reklamacija.json public/docs/obrazac-reklamacije.docx
# engleske verzije (prikazuju se kad je izabran engleski jezik)
python3 tools/obrasci/mkform.py tools/obrasci/odustanak-en.json public/docs/obrazac-odustanka-en.docx
python3 tools/obrasci/mkform.py tools/obrasci/reklamacija-en.json public/docs/obrazac-reklamacije-en.docx
cd public/docs && soffice --headless --convert-to pdf *.docx
```
