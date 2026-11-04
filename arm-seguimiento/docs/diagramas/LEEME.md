# Fuentes de los diagramas

Los diagramas del documento `Diagramas_de_Secuencia_y_Casos_de_Uso.docx` se dibujan a partir de estos archivos de texto,
de modo que se pueden revisar y regenerar cuando cambie el sistema.

- `d01.mmd` a `d11.mmd`: diagramas de secuencia de los flujos F-01 a F-11 (Mermaid, notación UML).
- `estado.mmd`: estados de una recomendación.
- `er.mmd`: modelo de datos.
- `arq.mmd`: arquitectura.
- `uc.py`: casos de uso generales. Genera un SVG con Python (sin dependencias).
- `mermaid.config.json`: estilo en blanco y negro de los diagramas.

Para generar una imagen:

```bash
npx @mermaid-js/mermaid-cli -i d05.mmd -o d05.png -c mermaid.config.json -s 3 -b white
python3 uc.py && rsvg-convert -w 3000 uc.svg -o uc.png
```
