#!/usr/bin/env python3
"""build.py — Assemble une page à partir des bandeaux.
Usage : python3 build.py pages/home.txt > home.html
Le fichier .txt liste un fragment par ligne (chemins relatifs), ex :
    bandeaux/01-hero.html
    bandeaux/04-bandeau-encart-texte-image-droite.html
Le header, le footer, le CSS et le JS sont ajoutés automatiquement.
"""
import sys, pathlib

HEAD = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Advisense</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;800;900&family=Instrument+Sans:wght@400;600;700&family=Space+Mono:wght@400;700&family=Urbanist:wght@900&family=Bodoni+Moda:wght@900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/global.css">
</head>
<body>
"""

def main():
    liste = pathlib.Path(sys.argv[1]).read_text().splitlines()
    out = [HEAD, pathlib.Path("partials/header.html").read_text()]
    for line in liste:
        line = line.strip()
        if line and not line.startswith("#"):
            out.append(pathlib.Path(line).read_text())
    out.append(pathlib.Path("partials/footer.html").read_text())
    out.append('<script src="js/main.js"></script>\n</body>\n</html>')
    print("\n".join(out))

if __name__ == "__main__":
    main()
