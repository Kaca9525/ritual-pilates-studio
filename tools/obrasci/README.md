# Obrasci (reklamacija, odustanak)

`public/docs/*.docx` i `*.pdf` se prave iz JSON opisa:

```bash
python3 tools/obrasci/mkform.py tools/obrasci/odustanak.json public/docs/obrazac-odustanka.docx   # treba python-docx
python3 tools/obrasci/mkform.py tools/obrasci/reklamacija.json public/docs/obrazac-reklamacije.docx
cd public/docs && soffice --headless --convert-to pdf *.docx
```
