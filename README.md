# vidwaan-site

Personal site for Vidwaan Singhania. Plain HTML and CSS, no build step, no dependencies.

## Files

```
index.html        home
experience.html   the ten projects
about.html        background
404.html
assets/style.css  all styling, palette at the top in :root
assets/fonts/     Tiempos Headline (licensed, subset) + Questrial (OFL)
assets/img/og.jpg social share card, 1200x630
```

## Editing

Content is in the HTML. To change a colour, edit the custom properties at the top of `assets/style.css`.

Palette, from the Wealthsimple brand book:

| Token | Hex |
|---|---|
| `--chalk` | `#F5F3EF` |
| `--chalk-deep` | `#EDEAE4` |
| `--jet` | `#000000` |
| `--graphite` | `#564C47` |
| `--storm` | `#5F5974` |
| `--rule` | `#DED9D1` |

Headings are Tiempos Headline, body is Questrial.

## Preview locally

```
python -m http.server 8731
```

Then open http://127.0.0.1:8731. Opening the files directly with `file://` will not load the fonts.

## Deploy

Pushed to `main`, served by GitHub Pages from the repository root.

## Fonts

Tiempos Headline is a licensed font. The files here are subset to the characters this site uses. Questrial is under the SIL Open Font License and self-hosted, so the site makes no third-party requests.
