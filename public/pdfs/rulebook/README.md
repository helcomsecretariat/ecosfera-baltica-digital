Let's keep traffic low. Use following script to optimize PDF size.

Install `ghostscript` first – https://formulae.brew.sh/formula/ghostscript.

```bash
for f in *.pdf; do
    output="optimized_$f"
    gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
       -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
       -sOutputFile="$output" "$f"
done
```
