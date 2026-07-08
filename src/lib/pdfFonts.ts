import { Font } from '@react-pdf/renderer';

/**
 * Registers custom fonts for @react-pdf/renderer.
 */
let fontsRegistered = false;

export const registerPdfFonts = (): void => {
  if (fontsRegistered) {
    return;
  }
  fontsRegistered = true;

  Font.register({
    family: 'Inter', // Aliased as Inter to maintain template compatibility
    fonts: [
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
        fontWeight: 'normal',
        fontStyle: 'normal',
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
        fontWeight: 'bold',
        fontStyle: 'normal',
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
        fontWeight: 'normal',
        fontStyle: 'italic',
      },
    ],
  });
};
