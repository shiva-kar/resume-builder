import { Font } from '@react-pdf/renderer';

export const registerLocalFonts = (): void => {
  const registeredFonts = Font.getRegisteredFonts();
  if (registeredFonts.includes('Inter')) {
    return;
  }

  Font.register({
    family: 'Inter',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
        fontWeight: 400,
        fontStyle: 'normal',
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVufuYAZ9hjp-Ek-_EeA.woff',
        fontWeight: 500,
        fontStyle: 'normal',
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuG1fAZ9hjp-Ek-_EeA.woff',
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhiJ-Ek-_EeA.woff',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuG1fAZJhiJ-Ek-_EeA.woff',
        fontWeight: 700,
        fontStyle: 'italic',
      }
    ],
  });
};
