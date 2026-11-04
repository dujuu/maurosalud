import { Component, input } from '@angular/core';

/**
 * Logo oficial de Centro Médico Vida Norte SpA (vectorial, tomado de `public/logo-vida-norte.svg`).
 * Va en línea (no como <img>) para que el texto use la tipografía Montserrat cargada por la app.
 * `marca` muestra solo el isotipo.
 *
 * Montserrat es más ancha que la fuente de respaldo con la que se dibujó el SVG: los tamaños de las dos
 * primeras líneas (63 y 78, antes 68 y 84) se ajustaron para que "Vida Norte SpA" ocupe el largo de la línea.
 */
@Component({
  selector: 'app-logo',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.viewBox]="marca() ? '14 28 301 303' : '0 0 1040 360'"
      role="img"
      [attr.aria-label]="marca() ? 'Vida Norte' : 'Centro Médico Vida Norte SpA, salud cerca de ti'"
      focusable="false"
    >
      <g transform="translate(1.65,-17.92) scale(0.35280)">
      <path fill="#0A4E99" d="M345 245 L395 225 C470 285 532 380 520 455 C508 530 440 575 408 655 C372 745 376 845 394 930 L305 932 Q275 930 275 902 L275 690 Z"/>
      <path fill="#0B8794" d="M92 435 L300 437 L300 258 Q300 222 336 222 L384 222 Q406 224 416 250 C462 310 486 372 481 442 C474 545 418 640 330 693 L92 695 Q52 695 52 658 L52 472 Q52 435 92 435 Z"/>
      <path fill="#0A4E99" d="M455 972 C422 900 412 800 448 700 C488 610 580 520 700 502 C742 497 772 499 788 500 C706 558 640 618 602 690 C586 742 594 800 562 860 C538 905 494 922 472 946 Z"/>
      <path fill="#0A95B3" d="M868 398 C874 472 866 562 832 640 C802 700 742 726 652 730 L590 728 C584 690 600 640 642 598 C702 540 762 520 802 480 C836 450 856 422 868 398 Z"/>
      <circle fill="#0A95B3" cx="536" cy="225" r="76"/>
      <circle fill="#0A6FAA" cx="672" cy="374" r="73"/>
      </g>
      @if (!marca()) {
        <g font-family="'Montserrat','Poppins','Segoe UI',Arial,sans-serif">
        <text x="372" y="150" font-size="63" font-weight="500" fill="#0B8794" letter-spacing="1">Centro Médico</text>
        <text x="372" y="228" font-size="78" font-weight="800" fill="#0A4E99" letter-spacing="0.5">Vida Norte SpA</text>
        <rect x="372" y="250" width="640" height="3" rx="1.5" fill="#0B8794"/>
        <text x="372" y="298" font-size="30" font-weight="500" fill="#5B6B7A" letter-spacing="9">SALUD CERCA DE TI</text>
        </g>
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
  `,
})
export class Logo {
  /** Si es `true`, se muestra solo el isotipo, sin el texto. */
  readonly marca = input(false);
}
