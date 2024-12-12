import { createTheme } from "@aws-amplify/ui-react";

export const theme = createTheme({
  name: 'my-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#F5F5F5',
          20: '#E0E0E0',
          40: '#BDBDBD',
          60: '#9E9E9E',
          80: '#757575',
          100: '#616161',
        }
      }
    },
    fonts: {
      default: {
        static: {
          fontSize: '16px'
        }
      }
    }
  }
}); 